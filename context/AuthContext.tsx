
import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { apiDelete } from '../services/apiService.ts';

// Hardcoded static users for initial setup if no data is in local storage
const ALL_USERS: User[] = [
    { id: 'admin1', name: 'Naveen Rajpoot', email: 'naveenrajpoot157@gmail.com', role: UserRole.Admin, password: 'Naveen@9956' },
    { id: 'admin2', name: 'KV Unnao Principal', email: 'kvunnao85@gmail.com', role: UserRole.Admin, password: 'KVU@2025' },
    { id: 't1', name: 'KV Teacher', email: 'teacher@kvision.com', role: UserRole.Teacher, password: 'Teacher@123' },
    { id: 's1', name: 'KV Student', email: 'student@kvision.com', role: UserRole.Student, password: 'Student@123' },
    // Keep other mock users for data consistency in other parts of the app like messaging
    { id: 's2', name: 'Maria Garcia', email: 'maria@edu.com', role: UserRole.Student, password: 'password456' },
    { id: 't-extra', name: 'Dr. Evelyn Reed', email: 'evelyn@edu.com', role: UserRole.Teacher, password: 'teacherpass' },
];


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (role: UserRole, email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addStudent: (name: string, apaarId: string, password: string) => User;
  addTeacher: (name: string, email: string, password: string) => User;
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
  addStudent: () => { throw new Error('Function not ready.') },
  addTeacher: () => { throw new Error('Function not ready.') },
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
  
  // Effect to restore session on initial load
  useEffect(() => {
    try {
        const storedUser = sessionStorage.getItem(SESSION_USER_KEY);
        if (storedUser) {
            const sessionUser = JSON.parse(storedUser);
            // Verify the session user still exists and is not blocked
            const userExists = users.find(u => u.id === sessionUser.id && !u.blocked);
            if (userExists) {
                setUser(userExists);
            } else {
                sessionStorage.removeItem(SESSION_USER_KEY);
            }
        }
    } catch (error) {
        console.error("Failed to parse session user", error);
    }
    setLoading(false);
  }, [users]);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    
    const targetUser = users.find(u => u.role === role && u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (targetUser) {
        if (targetUser.blocked) {
            return { success: false, message: 'Your account has been blocked.' };
        }
        setUser(targetUser);
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(targetUser));
        return { success: true };
    }

    return { success: false, message: 'Invalid credentials. Please check and try again.' };
  }, [users]);
  
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
  }, []);

  const addStudent = useCallback((name: string, apaarId: string, password: string): User => {
    const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;

    if (users.some(u => u.id === apaarId)) {
        throw new Error("A user with this Apaar ID already exists.");
    }
    if (users.some(u => u.email.toLowerCase() === studentEmail)) {
        throw new Error("A user with the generated email already exists. Please choose a different Apaar ID.");
    }

    const newStudent: User = {
      id: apaarId,
      name,
      email: studentEmail,
      role: UserRole.Student,
      password: password,
      blocked: false,
    };
    setUsers(prevUsers => [...prevUsers, newStudent]);
    return newStudent;
  }, [users]);

  const addTeacher = useCallback((name: string, email: string, password: string): User => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("A user with this email already exists.");
    }
    
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
  }, [users]);

  const deleteUser = useCallback(async (userId: string) => {
    await apiDelete('/api/remove/user', userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  }, []);

  const updateUsers = useCallback((updater: (prevUsers: User[]) => User[]) => {
    setUsers(updater);
  }, []);
  
  const updatePassword = useCallback(async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay

    const userToUpdate = users.find(u => u.id === userId);
    
    if (!userToUpdate) {
        return { success: false, message: 'User not found.' };
    }

    if (userToUpdate.password !== oldPass) {
        return { success: false, message: 'Current password does not match.' };
    }
    
    // Using functional update ensures we are updating based on the latest state,
    // and correctly triggers the useEffect to save to localStorage.
    setUsers(prev => {
        const updatedUsers = prev.map(u => u.id === userId ? { ...u, password: newPass } : u);
        // also update the currently logged-in user if they are the one changing the password
        if(user?.id === userId) {
            const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
            if(updatedCurrentUser) {
                sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedCurrentUser));
                setUser(updatedCurrentUser);
            }
        }
        return updatedUsers;
    });
    
    return { success: true, message: 'Password updated successfully!' };
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
