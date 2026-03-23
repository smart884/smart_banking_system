import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

/**
 * SmartBank - Firebase Configuration
 * Updated with production credentials for Firestore and Auth.
 */
const firebaseConfig = { 
  apiKey: "AIzaSyCRvpKllTWlf-g50S1KkGwShei2OWPK8qE", 
  authDomain: "smart-bank-47131.firebaseapp.com", 
  projectId: "smart-bank-47131", 
  storageBucket: "smart-bank-47131.firebasestorage.app", 
  messagingSenderId: "377827961253", 
  appId: "1:377827961253:web:00c7c4ba6d61c76f3d604c", 
  measurementId: "G-B4Q8NZHWH0" 
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
