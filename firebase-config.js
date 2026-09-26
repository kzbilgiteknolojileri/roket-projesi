const firebaseConfig = {
    apiKey: "AIzaSyA5fb9W169D_E9AsinOq_B_W1fT7ibI4pE",
    authDomain: "roket-kontrol.firebaseapp.com",
    projectId: "roket-kontrol",
    storageBucket: "roket-kontrol.firebasestorage.app",
    messagingSenderId: "295498180332",
    appId: "1:295498180332:web:6fd574bb2886415b5227c9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();