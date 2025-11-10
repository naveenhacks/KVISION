import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { auth, db } from '../firebaseConfig.ts';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword as firebaseUpdatePassword,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  loading: boolean;
  isBackendConnected: boolean;
  login: (role: UserRole, email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addStudent: (name: string, apaarId: string, password: string) => Promise<User>;
  addTeacher: (name: string, email: string, password: string) => Promise<User>;
  deleteUser: (userId: string, userUid: string) => Promise<void>;
  updateUsers: (updater: (prevUsers: User[]) => User[]) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
        try {
            await getDoc(doc(db, "health_check", "status"));
            setIsBackendConnected(true);
        } catch (error) {
            console.error("Firebase connection check failed:", error);
            setIsBackendConnected(false);
        }
    };
    checkConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // User exists in Auth but not Firestore, log them out
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
        setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

        if (!userDoc.exists() || userDoc.data().role !== role) {
            await signOut(auth);
            return { success: false, message: 'Invalid credentials or role mismatch.' };
        }
        if (userDoc.data().blocked) {
            await signOut(auth);
            return { success: false, message: 'Your account has been blocked.' };
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, message: 'Invalid credentials. Please check and try again.' };
    }
  }, []);
  
  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const createUser = async (email: string, password: string, userData: Omit<User, 'uid' | 'password'>): Promise<User> => {
      // Note: This operation is sensitive and in a real-world app, would be better suited for a backend function.
      // For this project, we assume the admin client has sufficient privileges.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = { ...userData, uid: userCredential.user.uid, password }; // Store password for admin reference if needed
      // FIX: 'Omit' is a type, not a runtime function. Destructure to create an object for Firestore
      // by excluding the 'uid', which is already used as the document ID.
      const { uid, ...dataToSave } = newUser;
      await setDoc(doc(db, "users", userCredential.user.uid), dataToSave);
      return newUser;
  };

  const addStudent = useCallback(async (name: string, apaarId: string, password: string): Promise<User> => {
      const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;
      if (users.some(u => u.id === apaarId)) throw new Error("A user with this Apaar ID already exists.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      
      const newStudentData: Omit<User, 'uid' | 'password'> = {
          id: apaarId,
          name,
          email: studentEmail,
          role: UserRole.Student,
          blocked: false,
          studentData: { courses: ['General Science', 'Mathematics', 'English'], attendance: 100, overallGrade: 0 }
      };
      return createUser(studentEmail, password, newStudentData);
  }, [users]);

  const addTeacher = useCallback(async (name: string, email: string, password: string): Promise<User> => {
      if (users.some(u => u.email === email)) throw new Error("This email is already registered.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      const newId = `t-${Date.now().toString().slice(-6)}`;
      const newTeacherData: Omit<User, 'uid' | 'password'> = {
          id: newId, name, email, role: UserRole.Teacher
      };
      return createUser(email, password, newTeacherData);
  }, [users]);
  
  const deleteUser = useCallback(async (userId: string, userUid: string) => {
    // Deleting users from Auth is a privileged operation not available on the client SDK for other users.
    // We will delete their Firestore record, which effectively removes them from the application.
    const userDocRef = doc(db, 'users', userUid);
    await deleteDoc(userDocRef);
    if(user?.uid === userUid) {
        setUser(null); // Log out if deleting self
    }
  }, [user]);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
        await updateDoc(doc(db, 'users', userToUpdate.uid), data);
    }
  }, [users]);

  const updateUsers = useCallback(async (updater: (prevUsers: User[]) => User[]) => {
      const newUsers = updater(users);
      const batch = writeBatch(db);
      newUsers.forEach(u => {
          const ref = doc(db, 'users', u.uid);
          batch.set(ref, u);
      });
      await batch.commit();
  }, [users]);
  
  const updatePassword = useCallback(async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) return { success: false, message: 'Authentication error.' };
    if (newPass.length < 6) return { success: false, message: 'New password must be at least 6 characters.' };

    try {
        const credential = EmailAuthProvider.credential(firebaseUser.email, oldPass);
        await reauthenticateWithCredential(firebaseUser, credential);
        await firebaseUpdatePassword(firebaseUser, newPass);
        
        // Also update in Firestore if we are storing it there
        await updateDoc(doc(db, 'users', firebaseUser.uid), { password: newPass });

        return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
        return { success: false, message: 'Current password does not match.' };
    }
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    users,
    loading,
    isBackendConnected,
    login,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUsers,
    updateUser,
    updatePassword,
  }), [user, users, loading, isBackendConnected, login, logout, addStudent, addTeacher, deleteUser, updateUsers, updateUser, updatePassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
