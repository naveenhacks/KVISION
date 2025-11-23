import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword,
    updatePassword as firebaseUpdatePassword,
    User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from '../firebaseConfig.ts';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[]; // List of all users for admin/teacher view
  loading: boolean;
  connectionStatus: 'pending' | 'success' | 'error';
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
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setConnectionStatus('success');
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    
                    // Security Block Check
                    if (userData.blocked) {
                         await signOut(auth);
                         setUser(null);
                         alert("Your account has been blocked. Please contact the administrator.");
                         return;
                    }
                    
                    // Admin Override Logic
                    if (firebaseUser.email === 'kvunnao85@gmail.com' && userData.role !== UserRole.Admin) {
                        await updateDoc(userDocRef, { role: UserRole.Admin });
                        userData.role = UserRole.Admin;
                    }

                    setUser({ ...userData, uid: firebaseUser.uid });
                } else {
                     // Fallback for specific admin email if doc doesn't exist
                     if (firebaseUser.email === 'kvunnao85@gmail.com') {
                        const newAdmin: User = {
                            id: 'admin-main',
                            uid: firebaseUser.uid,
                            name: 'KVISION Admin',
                            email: firebaseUser.email!,
                            role: UserRole.Admin,
                            preferences: { theme: 'dark' }
                        };
                        await setDoc(userDocRef, newAdmin);
                        setUser(newAdmin);
                     } else {
                        // Unknown user
                        await signOut(auth);
                        setUser(null);
                     }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setConnectionStatus('error');
                setUser(null);
            }
        } else {
            // Only clear user if we are not in a manually set fallback session
            // Since checking for fallback is complex without extra state, we just allow clear
            // which means fallback sessions don't persist on refresh (acceptable for fix).
            setUser(null);
            setConnectionStatus('success'); // Connected but not logged in
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to All Users (for Admin/Teachers)
  useEffect(() => {
      if (user && (user.role === UserRole.Admin || user.role === UserRole.Teacher)) {
          const q = query(collection(db, "users"));
          const unsubscribe = onSnapshot(q, (snapshot) => {
              const userList: User[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
              setUsers(userList);
          }, (error) => {
              console.error("Error fetching users:", error);
          });
          return () => unsubscribe();
      } else {
          setUsers([]);
      }
  }, [user?.role]);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.role !== role && !(email === 'kvunnao85@gmail.com' && role === UserRole.Admin)) {
                 await signOut(auth);
                 return { success: false, message: `Account exists but is not registered as a ${role}.` };
            }
             if (userData.blocked) {
                 await signOut(auth);
                 return { success: false, message: 'Your account has been blocked.' };
            }
            // User is set via onAuthStateChanged
        } else if (email === 'kvunnao85@gmail.com' && role === UserRole.Admin) {
            // Allow explicit first-time admin login
            return { success: true };
        } else {
             await signOut(auth);
             return { success: false, message: 'User data not found.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Login error", error);
        
        // Fallback: Check Firestore directly if Auth fails (e.g., operation-not-allowed)
        // This is for the demo environment where Auth might not be enabled.
        if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const q = query(collection(db, "users"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data() as User;

                    // Check password (only for this demo/fallback scenario where we stored it)
                    if (userData.password === pass) {
                        if (userData.role !== role && !(email === 'kvunnao85@gmail.com' && role === UserRole.Admin)) {
                             return { success: false, message: `Account exists but is not registered as a ${role}.` };
                        }
                         if (userData.blocked) {
                             return { success: false, message: 'Your account has been blocked.' };
                        }
                        
                        // Force update the user state for local session
                        setUser({ ...userData, uid: userDoc.id }); 
                        return { success: true };
                    }
                }
                
                // Special fallback for hardcoded Admin if not in DB yet and Auth failed
                if (email === 'kvunnao85@gmail.com' && pass === 'KVU@2025' && role === UserRole.Admin) {
                     const adminUser: User = {
                        id: 'admin-main',
                        uid: 'admin-fallback-uid',
                        name: 'KVISION Admin',
                        email: email,
                        role: UserRole.Admin,
                        preferences: { theme: 'dark' }
                     };
                     // Create the admin user in Firestore for future reference
                     await setDoc(doc(db, 'users', 'admin-fallback-uid'), adminUser);
                     setUser(adminUser);
                     return { success: true };
                }

            } catch (firestoreError) {
                console.error("Fallback login failed", firestoreError);
            }
        }

        let msg = 'Invalid credentials.';
        if (error.code === 'auth/user-not-found') msg = 'User not found.';
        if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (error.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.';
        if (error.code === 'auth/operation-not-allowed') msg = 'Login via Firebase Auth is disabled. Fallback failed. Check Console.';
        return { success: false, message: msg };
    }
  }, []);
  
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const addStudent = useCallback(async (name: string, apaarId: string, password: string): Promise<User> => {
      const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;
      const dummyUid = `student-${Date.now()}`;
      
      const newUser: User = {
          id: apaarId,
          uid: dummyUid,
          name,
          email: studentEmail,
          role: UserRole.Student,
          password: password, 
          blocked: false,
          studentData: { courses: ['General Science', 'Mathematics', 'English'], attendance: 100, overallGrade: 0 },
          preferences: { theme: 'dark' }
      };
      
      await setDoc(doc(db, 'users', dummyUid), newUser);
      return newUser;

  }, []);

  const addTeacher = useCallback(async (name: string, email: string, password: string): Promise<User> => {
      const newId = `t-${Date.now().toString().slice(-6)}`;
      const dummyUid = `teacher-${Date.now()}`;
      const newUser: User = {
          id: newId,
          uid: dummyUid,
          name, 
          email, 
          role: UserRole.Teacher,
          password: password,
          preferences: { theme: 'dark' }
      };
      
      await setDoc(doc(db, 'users', dummyUid), newUser);
      return newUser;
  }, []);
  
  const deleteUser = useCallback(async (userId: string, userUid: string) => {
      await deleteDoc(doc(db, 'users', userUid));
  }, []);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
          await updateDoc(doc(db, 'users', targetUser.uid), data);
      }
  }, [users]);

  const updateUsers = useCallback(async (updater: (prevUsers: User[]) => User[]) => {
      console.warn("Bulk updateUsers not implemented for Firestore");
  }, []);
  
  const updatePassword = useCallback(async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) return { success: false, message: 'Not authenticated.' };
    
    try {
        await firebaseUpdatePassword(auth.currentUser, newPass);
        return { success: true, message: 'Password updated successfully!' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    users,
    loading,
    connectionStatus,
    login,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUsers,
    updateUser,
    updatePassword,
  }), [user, users, loading, connectionStatus, login, logout, addStudent, addTeacher, deleteUser, updateUsers, updateUser, updatePassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};