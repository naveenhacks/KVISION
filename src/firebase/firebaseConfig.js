import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_nDxRMp_wNVoh0Y33M2kcM-0NN1rHb7o",
  authDomain: "kvision-100e7.firebaseapp.com",
  projectId: "kvision-100e7",
  storageBucket: "kvision-100e7.appspot.com",
  messagingSenderId: "548673823145",
  appId: "1:548673823145:web:d440e2c60b348b258e24b8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test connection on startup
(async () => {
  try {
    // A simple read operation to a document. It won't fail if the document
    // doesn't exist, but will fail on connection/permission errors.
    await getDoc(doc(db, "health_check", "status"));
    console.log("🔥 Firebase Connected Successfully");
  } catch (error) {
    console.error("⚠️ Firebase connection failed");
  }
})();
