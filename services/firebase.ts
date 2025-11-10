import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFOMSvWk9643dCMmpo4gXfNYl5xZHTwaE",
  authDomain: "kvision-kvunnao.firebaseapp.com",
  projectId: "kvision-kvunnao",
  storageBucket: "kvision-kvunnao.appspot.com",
  messagingSenderId: "841837270339",
  appId: "1:841837270339:web:2a3367a9f2e18b20720bf6",
  measurementId: "G-DF4JLRQ9TY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
