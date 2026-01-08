var app = new Framework7({
  root: "#app",
  theme: "md",
  routes: [
    {
      path: "/",
      url: "index.html",
    },
    {
      path: "/presensi/",
      url: "pages/presensi/presensi.html",
    },
    {
      path: "/presensi-hmif/",
      url: "pages/presensi/Presensi-HMIF.html",
    },
    {
      path: "/presensi-hmsi/",
      url: "pages/presensi/Presensi-HMSI.html",
    },
    {
      path: "/presensi-bem/",
      url: "pages/presensi/Presensi-BEM.html",
    },
    {
      path: "/presensi-bpm/",
      url: "pages/presensi/Presensi-BPM.html",
    },
    {
      path: "/presensi-ab/",
      url: "pages/presensi/Presensi-AB.html",
    },
    {
      path: "/presensi-ak/",
      url: "pages/presensi/Presensi-AK.html",
    },
    {
      path: "/rekap-kehadiran/",
      url: "pages/rekap/kehadiran.html",
    },
    {
      path: "/rekap-izin/",
      url: "pages/rekap/izin.html",
    },
    {
      path: "/notifications/",
      url: "pages/notifications.html",
    },
    {
      path: "/login/",
      url: "pages/auth/login.html",
    },
    {
      path: "/register/",
      url: "pages/auth/register.html",
    },
    {
      path: "/dashboard-admin/",
      url: "pages/dashboard/dashboard-admin.html",
    },
    {
      path: "/dashboard-anggota/",
      url: "pages/dashboard/dashboard-anggota.html",
    },
  ],
});

var mainView = app.views.create(".view-main");
// --- LOGIKA PRESENSI (QR + SELFIE) ---

// Variabel global untuk scanner
let html5QrcodeScanner;
let capturedSelfieBlob = null;
let scannedEventId = null;

// Event saat halaman presensi-scan dibuka
$$(document).on("page:init", '.page[data-name="presensi-scan"]', function (e) {
  const page = e.detail;

  // Listener tombol mulai
  app.on("startScanPresensi", function () {
    startQRScanning();
  });

  // Listener tombol kirim
  $$("#btn-submit-presensi").on("click", function () {
    submitPresensi();
  });
});

// 1. Fungsi Memulai QR Scanning
function startQRScanning() {
  $$("#reader").show();

  // Inisialisasi library
  html5QrcodeScanner = new Html5Qrcode("reader");

  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  // Gunakan kamera belakang (environment) untuk QR
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    onScanFailure
  );
}

// 2. Jika QR Berhasil Discan
function onScanSuccess(decodedText, decodedResult) {
  // Stop scanner QR
  html5QrcodeScanner
    .stop()
    .then((ignore) => {
      $$("#reader").hide();
      console.log(`Code matched = ${decodedText}`);

      // Simpan data dari QR (Misal QR berisi ID Kegiatan)
      scannedEventId = decodedText;

      app.dialog.alert(
        `QR Valid! Kode: ${decodedText}. Sekarang ambil selfie.`,
        "Info",
        function () {
          // Lanjut ke langkah Selfie
          startSelfieCamera();
        }
      );
    })
    .catch((err) => {
      console.error("Failed to stop qr scanner", err);
    });
}

function onScanFailure(error) {
  // Biarkan kosong agar tidak spam console, atau handle jika perlu
}

// 3. Fungsi Menyalakan Kamera Depan untuk Selfie
function startSelfieCamera() {
  $$("#selfie-container").show();
  const video = document.getElementById("selfie-video");

  // Minta akses kamera depan (user)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();

        // Otomatis ambil foto setelah 3 detik (biar user siap)
        setTimeout(takeSelfieSnapshot, 3000);
      });
  }
}

// 4. Fungsi Mengambil Gambar (Snapshot) dari Video
function takeSelfieSnapshot() {
  const video = document.getElementById("selfie-video");
  const canvas = document.getElementById("selfie-canvas");
  const context = canvas.getContext("2d");
  const imgResult = document.getElementById("selfie-result");

  // Set ukuran canvas sesuai video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Gambar video ke canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Matikan kamera
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  $$("#selfie-video").hide();

  // Konversi ke Blob untuk diupload ke Firebase
  canvas.toBlob(
    function (blob) {
      capturedSelfieBlob = blob;
      // Tampilkan hasil foto
      imgResult.src = URL.createObjectURL(blob);
      $$("#selfie-result").show();
      $$("#btn-submit-presensi").show();

      app.toast
        .create({
          text: "Selfie berhasil diambil!",
          closeTimeout: 2000,
        })
        .open();
    },
    "image/jpeg",
    0.8
  );
}

// 5. Submit ke Firebase (Simpan Data & Upload Foto)
function submitPresensi() {
  if (!scannedEventId || !capturedSelfieBlob) {
    app.dialog.alert("Data tidak lengkap!");
    return;
  }

  app.preloader.show();

  // A. Upload Foto ke Firebase Storage
  // Asumsi: kamu sudah import 'ref', 'uploadBytes', 'getDownloadURL' dari firebase/storage
  // dan 'collection', 'addDoc' dari firebase/firestore

  // Buat nama file unik: presensi/ID_USER/TIMESTAMP.jpg
  // Ganti 'user-123' dengan ID user yang sedang login (ambil dari localStorage/state)
  const userId = localStorage.getItem("user_uid") || "guest";
  const fileName = `presensi/${userId}/${Date.now()}.jpg`;
  const storageRef = firebase.storage().ref(fileName); // Sesuaikan syntax v9 jika pakai modular

  // Proses Upload
  storageRef
    .put(capturedSelfieBlob)
    .then((snapshot) => {
      return snapshot.ref.getDownloadURL();
    })
    .then((downloadURL) => {
      // B. Simpan Data ke Firestore
      const presensiData = {
        userId: userId,
        eventId: scannedEventId,
        waktu: firebase.firestore.FieldValue.serverTimestamp(),
        selfieUrl: downloadURL,
        lokasi: "Mencari lokasi...", // (Opsional: Tambahkan Geolocation API disini)
        status: "Hadir",
      };

      return firebase.firestore().collection("presensi").add(presensiData);
    })
    .then(() => {
      app.preloader.hide();
      app.dialog.alert("Presensi Berhasil!", "Sukses", function () {
        app.views.main.router.back(); // Kembali ke halaman utama
      });
    })
    .catch((error) => {
      app.preloader.hide();
      console.error("Error upload/simpan:", error);
      app.dialog.alert("Gagal melakukan presensi: " + error.message);
    });
}
// ... konfigurasi app lainnya ...
routes: [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/presensi/',
    // JANGAN gunakan 'url', HARUS 'componentUrl'
    componentUrl: './pages/presensi/presensi.html', 
  },
  // ... route lainnya ...
]
// ...