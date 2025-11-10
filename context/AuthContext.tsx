import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { apiDelete } from '../services/apiService.ts';
import { auth } from '../services/firebase.ts';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';


// Hardcoded static users for initial setup if no data is in local storage
const ALL_USERS: User[] = [
    { id: 'admin1', name: 'Naveen Rajpoot', email: 'naveenrajpoot157@gmail.com', role: UserRole.Admin, password: 'Naveen@9956' },
    { id: 'admin2', name: 'KV Unnao Principal', email: 'kvunnao85@gmail.com', role: UserRole.Admin, password: 'KVU@2025' },
    { id: 't1', name: 'KV Teacher', email: 'teacher@kvision.com', role: UserRole.Teacher, password: 'Teacher@123' },
    { 
      id: 's1', 
      name: 'KV Student', 
      email: 'student@kvision.com', 
      role: UserRole.Student, 
      password: 'Student@123',
      studentData: {
        courses: ['Physics', 'Chemistry', 'Maths', 'CS'],
        attendance: 92,
        overallGrade: 88,
      }
    },
    { 
      id: 's2', 
      name: 'Maria Garcia', 
      email: 'maria@edu.com', 
      role: UserRole.Student, 
      password: 'password456',
      studentData: {
        courses: ['Biology', 'English', 'History', 'Art'],
        attendance: 95,
        overallGrade: 91,
      }
    },
    { id: 't-extra', name: 'Dr. Evelyn Reed', email: 'evelyn@edu.com', role: UserRole.Teacher, password: 'teacherpass' },
];


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (role: UserRole, email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addStudent: (name: string, apaarId: string, password: string) => Promise<User>;
  addTeacher: (name: string, email: string, password: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  updateUsers: (updater: (prevUsers: User[]) => User[]) => void;
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
const USERS_STORAGE_KEY = 'kvision-users';

// Helper to generate a guaranteed unique ID for new teachers.
const generateNewTeacherId = (existingUsers: User[]): string => {
    let newId: string;
    do {
        // Generate a random ID, e.g., 't-a1b2c3'
        newId = `t-${Math.random().toString(36).substring(2, 8)}`;
    } while (existingUsers.some(u => u.id === newId));
    return newId;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
    }
    return ALL_USERS;
  });
  const [loading, setLoading] = useState(true);
  
  // Effect to persist users list to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Failed to save users to localStorage", error);
    }
  }, [users]);
  
  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in via Firebase. Find their profile in our local user list.
        const userProfile = users.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        
        if (userProfile && !userProfile.blocked) {
          setUser(userProfile);
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(userProfile));
        } else {
          // User exists in Firebase but not in our system, or is blocked.
          // For security, sign them out of Firebase and clear local state.
          signOut(auth);
          setUser(null);
        }
      } else {
        // User is signed out.
        setUser(null);
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [users]);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    // First, verify the user exists with the correct role in our local database.
    const targetUser = users.find(u => u.role === role && u.email.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
        return { success: false, message: 'Invalid credentials. Please check and try again.' };
    }
    if (targetUser.blocked) {
        return { success: false, message: 'Your account has been blocked.' };
    }

    // If local checks pass, attempt to sign in with Firebase.
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged listener will handle setting the user state.
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
  }, [users]);
  
  const logout = useCallback(() => {
    signOut(auth);
    // onAuthStateChanged will clear user state and sessionStorage.
  }, []);

  const addStudent = useCallback(async (name: string, apaarId: string, password: string): Promise<User> => {
    const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;

    if (users.some(u => u.id === apaarId || u.email.toLowerCase() === studentEmail)) {
        throw new Error("A user with this Apaar ID or email already exists.");
    }

    try {
        await createUserWithEmailAndPassword(auth, studentEmail, password);
        // Firebase user created. Now create the local user profile.
        const newStudent: User = {
          id: apaarId,
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
        setUsers(prevUsers => [...prevUsers, newStudent]);
        return newStudent;
    } catch (error: any) {
        console.error("Firebase student creation error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered in the authentication system.");
        }
        if (error.code === 'auth/weak-password') {
            throw new Error("Password is too weak. It should be at least 6 characters.");
        }
        throw new Error("Failed to create user in the authentication system.");
    }
  }, [users]);

  const addTeacher = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("A user with this email already exists.");
    }
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Firebase user created. Now create the local user profile.
        const newId = generateNewTeacherId(users);
        const newTeacher: User = {
          id: newId,
          name,
          email,
          role: UserRole.Teacher,
          password: password,
        };
        setUsers(prevUsers => [...prevUsers, newTeacher]);
        return newTeacher;
    } catch(error: any) {
        console.error("Firebase teacher creation error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered in the authentication system.");
        }
        if (error.code === 'auth/weak-password') {
            throw new Error("Password is too weak. It should be at least 6 characters.");
        }
        throw new Error("Failed to create user in the authentication system.");
    }
  }, [users]);

  const deleteUser = useCallback(async (userId: string) => {
    // NOTE: Deleting a Firebase user is a privileged action that should be handled
    // on a secure backend (e.g., Firebase Functions), not from the client.
    // This function will only remove the user from the local application state.
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.id === user?.id) {
        await signOut(auth); // Log out if deleting self
    }
    await apiDelete('/api/remove/user', userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  }, [users, user]);

  const updateUsers = useCallback((updater: (prevUsers: User[]) => User[]) => {
    setUsers(updater);
  }, []);
  
  const updatePassword = useCallback(async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const currentUser = auth.currentUser;
    const localUser = users.find(u => u.id === userId);

    if (!currentUser || !localUser || currentUser.email !== localUser.email) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Re-authentication successful, now update the password in Firebase.
        await firebaseUpdatePassword(currentUser, newPass);
        
        // Also update the password in our local user list for consistency.
        setUsers(prev => {
            const updatedUsers = prev.map(u => u.id === userId ? { ...u, password: newPass } : u);
            if(user?.id === userId) {
                const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
                if(updatedCurrentUser) {
                    setUser(updatedCurrentUser); // Update current user state
                    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedCurrentUser));
                }
            }
            return updatedUsers;
        });
        
        return { success: true, message: 'Password updated successfully!' };
    } catch (error: any) {
        console.error("Firebase password update error:", error);
        let message = 'Failed to update password. Please try again.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = 'Current password does not match.';
        } else if (error.code === 'auth/weak-password') {
            message = 'New password is too weak. It must be at least 6 characters.';
        }
        return { success: false, message };
    }
  }, [users, user]);

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