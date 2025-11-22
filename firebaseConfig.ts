import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdQilvCxlmz4bzSkuCVVEiwnLgivuW8V4",
  authDomain: "kv-unnao.firebaseapp.com",
  projectId: "kv-unnao",
  storageBucket: "kv-unnao.firebasestorage.app",
  messagingSenderId: "579438930224",
  appId: "1:579438930224:web:0b040e1623df512e4cc0f5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
