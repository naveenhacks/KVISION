import { db } from "./firebaseConfig";
import { 
    collection, 
    onSnapshot,
    addDoc, 
    doc, 
    deleteDoc, 
    updateDoc, 
    getDoc,
    query,
    where,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    writeBatch
} from "firebase/firestore";
import { UserRole } from "../types";

// --- User Management ---
export function onUsersUpdate(callback) {
    return onSnapshot(collection(db, "users"), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
        callback(users);
    });
}

export async function getUser(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { uid, ...userDoc.data() } : null;
}

export async function updateUser(uid, data) {
    await updateDoc(doc(db, 'users', uid), data);
}

export async function deleteUserFromDB(uid) {
    // Note: Deleting from Firebase Auth is a privileged operation
    // and usually done from a backend. Here we only delete from Firestore.
    await deleteDoc(doc(db, 'users', uid));
}


// --- Generic Listener ---
function createCollectionListener(collectionName, callback) {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore timestamps to ISO strings
            const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
            return { ...data, id: doc.id, date };
        });
        // Sort by date descending
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(items);
    });
}


// --- Homework ---
export function onHomeworksUpdate(callback) {
    return onSnapshot(collection(db, 'homeworks'), (snapshot) => {
        const homeworks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(homeworks);
    });
}

export async function addHomework(homeworkData) {
    const newHomework = {
        ...homeworkData,
        uploadDate: new Date().toISOString(),
        completedBy: [],
    };
    await addDoc(collection(db, 'homeworks'), newHomework);
}

export async function updateHomework(id, updates) {
    await updateDoc(doc(db, 'homeworks', id), updates);
}

export async function deleteHomework(id) {
    await deleteDoc(doc(db, 'homeworks', id));
}

export async function toggleHomeworkCompletion(homeworkId, userId, isCompleted) {
    await updateDoc(doc(db, 'homeworks', homeworkId), {
        completedBy: isCompleted ? arrayRemove(userId) : arrayUnion(userId)
    });
}


// --- Announcements (for dashboard) ---
export function onAnnouncementsUpdate(callback) {
    return createCollectionListener('announcements', callback);
}

export async function addAnnouncement(announcementData) {
    await addDoc(collection(db, 'announcements'), {
        ...announcementData,
        date: serverTimestamp(),
    });
}


// --- Notifications ---
export function onNotificationsUpdate(callback) {
    return createCollectionListener('notifications', callback);
}

export async function addNotification(notificationData) {
     await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        date: serverTimestamp(),
        readBy: [],
    });
}

export async function deleteNotification(id) {
    await deleteDoc(doc(db, 'notifications', id));
}

export async function markNotificationsAsRead(notificationsToUpdate, userId) {
    const batch = writeBatch(db);
    notificationsToUpdate.forEach(notif => {
        if (!notif.readBy.includes(userId)) {
            const notifRef = doc(db, 'notifications', notif.id);
            batch.update(notifRef, { readBy: arrayUnion(userId) });
        }
    });
    await batch.commit();
}


// --- Messages ---
export function onConversationsUpdate(userId, userRole, callback) {
    const messageUserId = userRole === UserRole.Admin ? 'kvision_admin_inbox' : userId;
    const q = query(collection(db, "conversations"), where("participants", "array-contains", messageUserId));
    
    return onSnapshot(q, (querySnapshot) => {
        const convos = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const messages = (data.messages || []).map(msg => ({
                ...msg,
                timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate().toISOString() : new Date().toISOString()
            }));
            return {
                id: doc.id,
                participants: data.participants,
                messages: messages
            };
        });
        callback(convos);
    });
}


// --- Landing Page Content ---
export function onHomepageContentUpdate(callback) {
    const contentDocRef = doc(db, 'homepage', 'content');
    return onSnapshot(contentDocRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
}

export async function updateHomepageContent(data) {
    await updateDoc(doc(db, 'homepage', 'content'), data);
}
