// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyC4RfXZ4JkX8jX8jX8jX8jX8jX8jX8jX8jX8",
    authDomain: "presinize-app.firebaseapp.com",
    databaseURL: "https://presinize-app-default-rtdb.firebaseio.com",
    projectId: "presinize-app",
    storageBucket: "presinize-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();