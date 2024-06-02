// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9bE8uBIL_4h9dWAcLgKrG2mOtGxYViIc",
  authDomain: "letseat-5ecc4.firebaseapp.com",
  databaseURL: "https://letseat-5ecc4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "letseat-5ecc4",
  storageBucket: "letseat-5ecc4.appspot.com",
  messagingSenderId: "617476778354",
  appId: "1:617476778354:web:618f39b3e3c09e5bf655eb",
  measurementId: "G-63D59QHMKY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const FIREBASE_AUTH = getAuth(app);
export const FIREBASE_DB = getDatabase(app);
