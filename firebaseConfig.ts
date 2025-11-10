import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_nDxRMp_wNVoh0Y33M2kcM-0NN1rHb7o",
  authDomain: "kvision-100e7.firebaseapp.com",
  projectId: "kvision-100e7",
  storageBucket: "kvision-100e7.appspot.com",
  messagingSenderId: "548673823145",
  appId: "1:548673823145:web:d440e2c60b348b258e24b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);