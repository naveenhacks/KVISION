import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login Success:", userCredential.user.email);
    
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (!userDoc.exists()) {
        throw new Error("User data not found in database.");
    }
    if (userDoc.data().blocked) {
        throw new Error("Your account has been blocked.");
    }

    return { uid: userCredential.user.uid, ...userDoc.data() };
  } catch (error) {
    console.error("❌ Login Failed:", error.message);
    throw error;
  }
}

export async function logout() {
    await signOut(auth);
}

export function onAuthChanged(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function registerUser(email, password, userData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid, ...dataToSave } = userData; // Exclude uid if present, it's the doc ID
    await setDoc(doc(db, "users", userCredential.user.uid), dataToSave);
    return { ...userData, uid: userCredential.user.uid };
}
