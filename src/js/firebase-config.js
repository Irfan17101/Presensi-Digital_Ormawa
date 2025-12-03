// firebase-config.js - VERSION COMPATIBLE (Global/Compat SDK)

const firebaseConfig = {
    apiKey: "AIzaSyAvyn80VW8W_aedywFyk_goXCcs7J-Pbd0",
    authDomain: "presinize-app.firebaseapp.com",
    databaseURL: "https://presinize-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "presinize-app",
    storageBucket: "presinize-app.firebasestorage.app",
    messagingSenderId: "11679003186",
    appId: "1:11679003186:web:f4b7486bee8453ba6b022b",
    measurementId: "G-Y316YP3P5G"
};

// 🟢 PERBAIKAN: Tambahkan waiting mechanism
window.firebaseReady = false;
window.firebaseReadyCallbacks = [];

// 🟢 PERBAIKAN: Better initialization dengan retry
function initializeFirebase() {
    if (typeof firebase !== 'undefined' && firebase.app) {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            window.db = firebase.database();
            window.firebaseReady = true;
            
            // Execute all waiting callbacks
            window.firebaseReadyCallbacks.forEach(callback => callback());
            window.firebaseReadyCallbacks = [];
            
            console.log("✅ Firebase initialized successfully!");
        } catch (error) {
            console.error("❌ Firebase initialization error:", error);
            setTimeout(initializeFirebase, 500);
        }
    } else {
        console.log("⏳ Firebase SDK not loaded yet, retrying...");
        setTimeout(initializeFirebase, 200);
    }
}

// 🟢 PERBAIKAN: Start initialization immediately
initializeFirebase();

// 🟢 PERBAIKAN: Utility functions untuk wait
window.isFirebaseReady = function() {
    return window.firebaseReady;
};

window.waitForFirebase = function(callback) {
    if (window.firebaseReady) {
        callback();
    } else {
        window.firebaseReadyCallbacks.push(callback);
    }
};