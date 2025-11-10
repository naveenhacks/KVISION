import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { db, auth } from '../services/firebase.ts';
import { 
  collection, query, where, getDocs, doc, setDoc, onSnapshot, getDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (role: UserRole, email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addStudent: (name: string, apaarId: string, password: string) => Promise<User>;
  addTeacher: (name: string, email: string, password: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  updateUsers: (updater: (prevUsers: User[]) => User[]) => void; // Kept for local UI updates before Firestore sync
  updatePassword: (userId: string, oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  users: [],
  login: async () => ({ success: false, message: 'Function not ready.' }),
  logout: () => {},
  addStudent: async () => { throw new Error('Function not ready.') },
  addTeacher: async () => { throw new Error('Function not ready.') },
  deleteUser: async () => {},
  updateUsers: () => {},
  updatePassword: async () => ({ success: false, message: 'Function not ready.'}),
});

interface AuthProviderProps {
  children: ReactNode;
}

const SESSION_USER_KEY = 'kvision-session-user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Effect to listen for all user changes in Firestore (for admin panels)
  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }) as User);
        setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Effect to listen for Firebase auth state changes (for the current user)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userProfile = docSnap.data() as User;
          if (!userProfile.blocked) {
            const currentUser = { ...userProfile, uid: firebaseUser.uid };
            setUser(currentUser);
            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
          } else {
            await signOut(auth);
            setUser(null);
          }
        } else {
          // User exists in auth but not DB, sign them out.
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return { success: false, message: 'Invalid credentials. Please check and try again.' };
      }
      const targetUser = querySnapshot.docs[0].data() as User;
      if (targetUser.blocked) {
        return { success: false, message: 'Your account has been blocked.' };
      }
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error: any) {
      let message = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          message = 'Invalid credentials. Please check and try again.';
      } else {
          console.error("Firebase login error:", error);
      }
      return { success: false, message };
    }
  }, []);
  
  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  const addStudent = useCallback(async (name: string, apaarId: string, password: string): Promise<User> => {
    const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;

    const q = query(collection(db, 'users'), where('id', '==', apaarId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("A user with this Apaar ID already exists.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
      const uid = userCredential.user.uid;
      const newStudent: User = {
        id: apaarId,
        uid,
        name,
        email: studentEmail,
        role: UserRole.Student,
        password: password, // Store for modals (e.g., copy credentials)
        blocked: false,
        studentData: {
          courses: ['General Science', 'Mathematics', 'English'],
          attendance: 100,
          overallGrade: 0,
        }
      };
      const { password: _, ...profileToSave } = newStudent;
      await setDoc(doc(db, "users", uid), profileToSave);
      return newStudent;
    } catch (error: any) {
       console.error("Firebase student creation error:", error);
       if (error.code === 'auth/email-already-in-use') throw new Error("This email is already registered.");
       if (error.code === 'auth/weak-password') throw new Error("Password must be at least 6 characters.");
       throw new Error("Failed to create user.");
    }
  }, []);

  const addTeacher = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const newId = `t-${uid.substring(0, 6)}`;
      const newTeacher: User = {
        id: newId,
        uid,
        name,
        email,
        role: UserRole.Teacher,
        password: password,
      };
      const { password: _, ...profileToSave } = newTeacher;
      await setDoc(doc(db, "users", uid), profileToSave);
      return newTeacher;
    } catch(error: any) {
        console.error("Firebase teacher creation error:", error);
        if (error.code === 'auth/email-already-in-use') throw new Error("This email is already registered.");
        if (error.code === 'auth/weak-password') throw new Error("Password must be at least 6 characters.");
        throw new Error("Failed to create user.");
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    // Note: Deleting from Auth is a privileged operation usually done server-side.
    // For this app, we will delete the Firestore record, effectively disabling them.
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete || !userToDelete.uid) return;
    if (userToDelete.uid === user?.uid) {
        await signOut(auth);
    }
    await deleteDoc(doc(db, "users", userToDelete.uid));
  }, [users, user]);

  const updateUsers = useCallback(async (updater: (prevUsers: User[]) => User[]) => {
      // This function is now primarily for client-side state updates triggered by admin actions
      // that will be shortly reflected by the Firestore listener.
      const newUsers = updater(users);
      // Persist block/unblock changes to Firestore
      for (const updatedUser of newUsers) {
          const originalUser = users.find(u => u.id === updatedUser.id);
          if (originalUser && originalUser.blocked !== updatedUser.blocked && updatedUser.uid) {
              const userDocRef = doc(db, 'users', updatedUser.uid);
              await updateDoc(userDocRef, { blocked: updatedUser.blocked });
          }
      }
      setUsers(newUsers);
  }, [users]);
  
  const updatePassword = useCallback(async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== user?.uid) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }
    try {
        const credential = EmailAuthProvider.credential(currentUser.email!, oldPass);
        await reauthenticateWithCredential(currentUser, credential);
        await firebaseUpdatePassword(currentUser, newPass);
        return { success: true, message: 'Password updated successfully!' };
    } catch (error: any) {
        console.error("Firebase password update error:", error);
        let message = 'Failed to update password. Please try again.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') message = 'Current password does not match.';
        else if (error.code === 'auth/weak-password') message = 'New password must be at least 6 characters.';
        return { success: false, message };
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    users,
    login,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUsers,
    updatePassword,
  }), [user, users, login, logout, addStudent, addTeacher, deleteUser, updateUsers, updatePassword]);

  if(loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
