import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration 
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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional and might throw if run in non-browser environment (though Vite handles it)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
