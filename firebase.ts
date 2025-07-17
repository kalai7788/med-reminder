// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAus9FXUOZKpqVAxi1XPAkyrtcwk1YJXdQ",
  authDomain: "med-reminder-6912d.firebaseapp.com",
  projectId: "med-reminder-6912d",
  storageBucket: "med-reminder-6912d.firebasestorage.app",
  messagingSenderId: "261294268396",
  appId: "1:261294268396:web:852324651ec61496c7aac9",
  measurementId: "G-Y90RF8KM8B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
