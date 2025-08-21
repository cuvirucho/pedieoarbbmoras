// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-SvcKVRPhndA5Kml7x9qI6fC0nLP3O44",
  authDomain: "morasnoelinar.firebaseapp.com",
  projectId: "morasnoelinar",
  storageBucket: "morasnoelinar.firebasestorage.app",
  messagingSenderId: "256331187104",
  appId: "1:256331187104:web:2274870527199d79cb9ac5",
  measurementId: "G-JZME4KJXYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const db = getFirestore(app);