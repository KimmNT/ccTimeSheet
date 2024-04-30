// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhcbNGi6XciFUp-qZwdZCaMT6yYwviE2o",
  authDomain: "cctimesheet-b3d1b.firebaseapp.com",
  databaseURL: "https://cctimesheet-b3d1b-default-rtdb.firebaseio.com",
  projectId: "cctimesheet-b3d1b",
  storageBucket: "cctimesheet-b3d1b.appspot.com",
  messagingSenderId: "704293857939",
  appId: "1:704293857939:web:2974c6c6fe9b4f3efd7b66",
  measurementId: "G-SJ8C9ZNNK3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
