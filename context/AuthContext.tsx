
import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { apiDelete } from '../services/apiService.ts';

// Hardcoded static users for direct credential checking
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
  addStudent: () => ({} as User),
  addTeacher: () => ({} as User),
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
  const [users, setUsers] = useState<User[]>(ALL_USERS);
  const [loading, setLoading] = useState(true);
  
  // Effect to restore session on initial load
  useEffect(() => {
    try {
        const storedUser = sessionStorage.getItem(SESSION_USER_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse session user", error);
    }
    setLoading(false);
  }, []);

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
    const newStudent: User = {
      id: apaarId,
      name,
      email: `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`, // Create a dummy email
      role: UserRole.Student,
      password: password,
      blocked: false,
    };
    setUsers(prevUsers => [...prevUsers, newStudent]);
    return newStudent;
  }, []);

  const addTeacher = useCallback((name: string, email: string, password: string): User => {
    const newId = `t${Math.floor(Math.random() * 1000) + 2}`; // e.g., t101
    const newTeacher: User = {
      id: newId,
      name,
      email,
      role: UserRole.Teacher,
      password: password,
    };
    setUsers(prevUsers => [...prevUsers, newTeacher]);
    return newTeacher;
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    await apiDelete('/api/remove/user', userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  }, []);

  const updateUsers = useCallback((updater: (prevUsers: User[]) => User[]) => {
    setUsers(updater);
  }, []);
  
  const updatePassword = useCallback(async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay

    // For static users, we don't persist password changes.
    // In a real app, this would be an API call.
    const userToUpdate = users.find(u => u.id === userId);
    
    if (!userToUpdate) {
        return { success: false, message: 'User not found.' };
    }

    if (userToUpdate.password !== oldPass) {
        return { success: false, message: 'Current password does not match.' };
    }
    
    return { success: true, message: 'Password updated successfully!' };
  }, [users]);

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
