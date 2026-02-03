// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwOJEo_cIWIWcG0BPppFn4qxAzQ4I3BnM",
  authDomain: "gladex-requisition-system.firebaseapp.com",
  projectId: "gladex-requisition-system",
  storageBucket: "gladex-requisition-system.firebasestorage.app",
  messagingSenderId: "886407181238",
  appId: "1:886407181238:web:d3c78ef44c726d78e08717",
  measurementId: "G-P99XYZGC1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;