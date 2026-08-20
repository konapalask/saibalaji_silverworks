import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration read from Vite Environment Variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCN3NugsWb4t7XJCswLAYblcQ2pmx52bVI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sai-balajji.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sai-balajji",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sai-balajji.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "692516345900",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:692516345900:web:cceb5245284e32e69ed989",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DYDQKDLRCE"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication ONLY
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
