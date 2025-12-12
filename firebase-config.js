// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFDngTucC8zvbYuFzr9aJFRg1U6dYoyJY",
  authDomain: "family-hieu1314.firebaseapp.com",
  projectId: "family-hieu1314",
  storageBucket: "family-hieu1314.firebasestorage.app",
  messagingSenderId: "500685412942",
  appId: "1:500685412942:web:cd74e1bc2a26819d96011f",
  measurementId: "G-QLSZXS5SGS"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
