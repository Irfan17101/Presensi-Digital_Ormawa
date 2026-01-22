var app = new Framework7({
  root: "#app",
  theme: "md",
  // --- DAFTAR ROUTE (JALUR HALAMAN) ---
  routes: [
    { path: "/", url: "index.html" },
    
    // Auth
    { path: "/login/", url: "pages/auth/login.html" },
    { path: "/register/", url: "pages/auth/register.html" },

    // Dashboard
    { path: "/dashboard-admin/", url: "pages/dashboard/dashboard-admin.html" },
    { path: "/dashboard-anggota/", url: "pages/dashboard/dashboard-anggota.html" },

    // Fitur Notifikasi (DIPISAH)
    { path: "/notifications-admin/", url: "pages/rekap/notifications-admin.html" },
    { path: "/notifications-user/", url: "pages/rekap/notifications-user.html" },

    // Fitur Presensi & Ormawa
    // PENTING: Pastikan semua file ini baris pertamanya: <div class="page" data-name="presensi-scan">
    { path: "/presensi-hmif/", url: "pages/presensi/Presensi-HMIF.html" },
    { path: "/presensi-hmsi/", url: "pages/presensi/Presensi-HMSI.html" },
    { path: "/presensi-bem/", url: "pages/presensi/Presensi-BEM.html" },
    { path: "/presensi-bpm/", url: "pages/presensi/Presensi-BPM.html" },
    { path: "/presensi-ab/", url: "pages/presensi/Presensi-AB.html" },
    { path: "/presensi-ak/", url: "pages/presensi/Presensi-AK.html" },
    { path: "/presensi/", url: "pages/presensi/presensi.html" }, 

    // Fitur Lainnya
    { path: "/jadwal-kegiatan/", url: "pages/Jadwal-Kegiatan.html" }, 
    { path: "/rekap-izin/", url: "pages/rekap/izin.html" },
    { path: "/rekap-kehadiran/", url: "pages/rekap/rekap-kehadiran.html" },
  ],
});

var mainView = app.views.create(".view-main");

// ==========================================
// 1. LOGIKA REGISTER
// ==========================================
$$(document).on('page:init', '.page[data-name="register"]', function (e) {
  $$('#btn-do-register').on('click', function () {
    var nama = $$('#reg-nama').val();
    var nim = $$('#reg-nim').val();
    var ormawa = $$('#reg-ormawa').val();
    var email = $$('#reg-email').val();
    var password = $$('#reg-password').val();

    if (!nama || !nim || !email || !password) {
      app.dialog.alert('Mohon lengkapi data!', 'Peringatan'); return;
    }

    app.preloader.show();

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        var uid = userCredential.user.uid;
        // FIX: Pakai Realtime Database (.database), BUKAN Firestore
        return firebase.database().ref('users/' + uid).set({
          nama_lengkap: nama, nim: nim, email: email,
          ormawa: ormawa, role: "anggota", 
          created_at: firebase.database.ServerValue.TIMESTAMP
        });
      })
      .then(() => {
        app.preloader.hide();
        app.dialog.alert('Register Berhasil! Silahkan Login.', function () {
          mainView.router.back();
        });
      })
      .catch((error) => {
        app.preloader.hide(); app.dialog.alert(error.message);
      });
  });
});

// ==========================================
// 2. LOGIKA LOGIN
// ==========================================
$$(document).on('page:init', '.page[data-name="login"]', function (e) {
  $$('#btn-do-login').on('click', function () {
    var email = $$('#login-email').val();
    var password = $$('#login-password').val();

    if (!email || !password) { app.dialog.alert('Isi email & password!'); return; }

    app.preloader.show();

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        var uid = userCredential.user.uid;
        // FIX: Ambil data dari Realtime Database
        firebase.database().ref('users/' + uid).once('value')
          .then((snapshot) => {
            app.preloader.hide();
            var userData = snapshot.val();
            
            if (userData) {
              var userInfo = { uid: uid, name: userData.nama_lengkap, organization: userData.ormawa, role: userData.role };
              localStorage.setItem("currentUser", JSON.stringify(userInfo));

              if (userData.role === 'admin') {
                mainView.router.navigate('/dashboard-admin/');
              } else {
                mainView.router.navigate('/dashboard-anggota/');
              }
            } else {
              app.dialog.alert('Data user tidak ditemukan!');
            }
          });
      })
      .catch((error) => {
        app.preloader.hide(); app.dialog.alert('Login Gagal: ' + error.message);
      });
  });
});

// ==========================================
// 3. LOGIKA PRESENSI (SCAN & SINKRONISASI DATA)
// ==========================================
let html5QrcodeScanner;
let capturedSelfieBlob = null;
let scannedEventId = null;

// Event ini jalan SETIAP KALI halaman presensi dibuka
$$(document).on('page:init', '.page[data-name="presensi-scan"]', function (e) {
  
  // A. LOGIKA SINKRONISASI DATA (Agar Judul berubah sesuai klik)
  var dataTersimpan = localStorage.getItem("kegiatan_aktif");
  if (dataTersimpan) {
    var event = JSON.parse(dataTersimpan);
    
    // Cari elemen ID di HTML dan ubah isinya
    if(document.getElementById('detail-judul')) {
        $$('#detail-judul').text(event.nama);
        $$('#detail-waktu').text(event.tanggal + ' • ' + event.waktu);
        $$('#detail-lokasi').text(event.lokasi);
        
        // Set ID kegiatan agar tersimpan di database saat submit
        // Jika QR Code nanti berisi kode unik, ini akan tertimpa (tidak apa-apa)
        scannedEventId = event.nama; 
    }
  }

  // B. Listener Tombol Scan
  app.on("startScanPresensi", function () { startQRScanning(); });
  
  // C. Listener Tombol Submit
  $$("#btn-submit-presensi").on("click", function () { submitPresensi(); });
});

// Fungsi Scan QR
function startQRScanning() {
  $$("#reader").show();
  if (typeof Html5Qrcode === "undefined") { app.dialog.alert("Library QR Error!"); return; }

  html5QrcodeScanner = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  // Coba kamera belakang, fallback ke depan kalau error (Laptop friendly)
  html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess, (errorMessage) => {})
  .catch((err) => {
      console.log("Kamera belakang error, coba kamera depan.");
      html5QrcodeScanner.start({ facingMode: "user" }, config, onScanSuccess, onScanFailure);
  });
}

function onScanSuccess(decodedText, decodedResult) {
  html5QrcodeScanner.stop().then(() => {
    $$("#reader").hide();
    scannedEventId = decodedText; // Update ID dari QR Code
    app.dialog.alert(`QR Valid! Kode: ${decodedText}. Silakan Selfie.`, "Berhasil", function () {
      startSelfieCamera();
    });
  });
}
function onScanFailure(error) {}

// Fungsi Selfie
function startSelfieCamera() {
  $$("#selfie-container").show();
  const video = document.getElementById("selfie-video");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
        setTimeout(takeSelfieSnapshot, 3000); // Auto snap 3 detik
      });
  }
}

function takeSelfieSnapshot() {
  const video = document.getElementById("selfie-video");
  const canvas = document.getElementById("selfie-canvas");
  const context = canvas.getContext("2d");
  const imgResult = document.getElementById("selfie-result");

  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const stream = video.srcObject;
  const tracks = stream.getTracks(); tracks.forEach((track) => track.stop());
  $$("#selfie-video").hide();

  canvas.toBlob(function (blob) {
    capturedSelfieBlob = blob;
    imgResult.src = URL.createObjectURL(blob);
    $$("#selfie-result").show();
    $$("#btn-submit-presensi").show();
    app.toast.create({ text: "Foto tersimpan!", closeTimeout: 2000 }).open();
  }, "image/jpeg", 0.8);
}

// Fungsi Submit ke Firebase (FIXED: Realtime Database)
function submitPresensi() {
  if (!scannedEventId || !capturedSelfieBlob) { app.dialog.alert("Data belum lengkap!"); return; }

  var user = firebase.auth().currentUser;
  var currentUserData = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!user) { app.dialog.alert("Sesi habis."); return; }
  
  var userId = user.uid;
  var userName = currentUserData ? currentUserData.name : "User";
  var userOrg = currentUserData ? currentUserData.organization : "-";

  app.preloader.show();
  
  // 1. Upload Foto
  var fileName = `presensi/${userId}/${Date.now()}.jpg`;
  var storageRef = firebase.storage().ref(fileName);

  storageRef.put(capturedSelfieBlob)
    .then((snapshot) => snapshot.ref.getDownloadURL())
    .then((downloadURL) => {
      // 2. Simpan Data ke Realtime Database
      var presensiData = {
        uid: userId, nama: userName, ormawa: userOrg,
        kegiatan: scannedEventId, // Ini akan berisi nama kegiatan atau kode QR
        waktu: new Date().toLocaleString(),
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        foto_url: downloadURL, metode: "QR & Selfie", status: "Hadir"
      };
      // PENTING: Pakai .database().ref() bukan .firestore()
      return firebase.database().ref('absensi').push(presensiData);
    })
    .then(() => {
      app.preloader.hide();
      app.dialog.alert("Absen Berhasil!", "Sukses", function () {
        mainView.router.back();
      });
    })
    .catch((error) => {
      app.preloader.hide(); app.dialog.alert("Gagal: " + error.message);
    });
}