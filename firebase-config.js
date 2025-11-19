// firebase-config.js - VERSION COMPATIBLE (Global/Compat SDK)

const firebaseConfig = {
    // KUNCI YANG ANDA KIRIMKAN. HARAP DIPERHATIKAN: Jika error 'API key not valid' masih muncul,
    // MAKA KUNCI INI SALAH HARUS DISALIN ULANG DARI KONSOL FIREBASE.
    apiKey: "AIzaSyAvyn80VW8W_aedywFyk_goXCcs7J-Pbd0",
    authDomain: "presinize-app.firebaseapp.com",
    databaseURL: "https://presinize-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "presinize-app",
    storageBucket: "presinize-app.firebasestorage.app",
    messagingSenderId: "11679003186",
    appId: "1:11679003186:web:f4b7486bee8453ba6b022b",
    measurementId: "G-Y316YP3P5G"
};

// Initialize Firebase (Menggunakan format global 'firebase.initializeApp')
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    // Tambahkan variabel database global untuk akses mudah jika dibutuhkan
    window.db = firebase.database(); 
    console.log("Firebase initialized successfully with FINAL keys!");
} else {
    console.error("Firebase SDK not loaded.");
}