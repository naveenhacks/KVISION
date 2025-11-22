import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebaseConfig.ts";
import { UploadedFile } from "../types.ts";

// --- Firestore Helpers ---

export const getCollection = (collectionName: string) => collection(db, collectionName);

export const getDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const addDocument = async (collectionName: string, data: any) => {
    return await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
    });
};

export const setDocument = async (collectionName: string, id: string, data: any, merge = true) => {
    return await setDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
    }, { merge });
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteDocument = async (collectionName: string, id: string) => {
    return await deleteDoc(doc(db, collectionName, id));
};

// --- Storage Helpers ---

export const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};

export const deleteFile = async (url: string) => {
    const storageRef = ref(storage, url);
    return await deleteObject(storageRef);
};

export const uploadHomeworkFile = async (file: File, homeworkId: string): Promise<UploadedFile> => {
    const path = `assignments/${homeworkId}/${file.name}`;
    const url = await uploadFile(file, path);
    
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = () => {
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: url, // We store the Firebase URL here instead of Base64 for persistence
            });
        };
        reader.readAsDataURL(file);
    });
};
