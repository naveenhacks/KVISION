
import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { MOCK_USERS } from '../constants.ts';
import { apiDelete } from '../services/apiService.ts';

// To satisfy TypeScript for the EmailJS CDN script
declare const emailjs: any;

// --- EMAILJS CONFIGURATION ---
// Replace with your actual EmailJS credentials to send real emails.
// 1. Go to https://www.emailjs.com/ to create an account.
// 2. Add an email service (e.g., Gmail).
// 3. Create an email template with variables: {{to_name}}, {{to_email}}, {{otp}}.
// 4. Find your keys and IDs in your account settings and paste them below.
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (role: UserRole, emailOrId: string, pass: string) => Promise<{ success: boolean, message?: string, otp?: string }>;
  verifyOtpAndLogin: (otp: string) => Promise<{ success: boolean, message?: string }>;
  resendOtp: () => Promise<{ success: boolean, message?: string, otp?: string }>;
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
  verifyOtpAndLogin: async () => ({ success: false, message: 'Function not ready.' }),
  resendOtp: async () => ({ success: false, message: 'Function not ready.' }),
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

const USERS_STORAGE_KEY = 'kvision-users';
const SESSION_USER_KEY = 'kvision-session-user';
const OTP_STORAGE_KEY = 'kvision-otp';


// In a real application, these credentials would NOT be stored in the frontend.
// They would be stored securely in a backend database with hashed passwords.
const ADMIN_ACCOUNTS = [
    { email: 'naveenrajpoot157@gmail.com', password: 'Naveen@9956', name: 'Naveen Rajpoot' },
    { email: 'kvunnao85@gmail.com', password: 'KVU@2025', name: 'KV Unnao Principal' },
];

const getInitialUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
  }
  return MOCK_USERS;
};

const logAdminAttempt = (email: string, status: 'success' | 'failure') => {
    // In a real application, this would be an API call to a secure logging service on the backend.
    // The backend would then record the IP address from the request.
    console.log(
        `[ADMIN LOGIN ${status.toUpperCase()}]`,
        `Timestamp: ${new Date().toISOString()}`,
        `Email: ${email}`
    );
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(getInitialUsers);
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

  // Effect to persist users to localStorage whenever the user list changes.
  useEffect(() => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch(error) {
        console.error("Failed to save users to localStorage", error);
    }
  }, [users]);

  const sendOtpEmail = async (recipient: { name: string; email: string }): Promise<{ success: boolean; message?: string, otp?: string }> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({ otp, expiry }));

    // If EmailJS is not configured, log OTP to console for development AND return it for display
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.log(`%c[OTP SENT - SIMULATED] Your OTP is: ${otp}. It will expire in 5 minutes.`, 'color: #c471ed; font-weight: bold;');
        console.warn('%cEmailJS is not configured. OTP is logged to the console for testing. Please update credentials in context/AuthContext.tsx.', 'color: orange;');
        return { success: true, otp: otp };
    }

    const templateParams = {
        to_name: recipient.name,
        to_email: recipient.email,
        otp: otp,
    };

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        console.log(`[OTP SENT] An OTP email has been sent to ${recipient.email}.`);
        return { success: true };
    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, message: 'Failed to send OTP email. Please check your EmailJS configuration and try again.' };
    }
  };

  const login = useCallback(async (role: UserRole, emailOrId: string, pass: string): Promise<{ success: boolean, message?: string, otp?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    
    // Admin Login Flow (with OTP)
    if (role === UserRole.Admin) {
        const adminAccount = ADMIN_ACCOUNTS.find(acc => acc.email === emailOrId && acc.password === pass);
        if (adminAccount) {
            logAdminAttempt(emailOrId, 'success');
            const targetAdminUser = { id: 'admin01', name: adminAccount.name, email: adminAccount.email, role };
            setPendingUser(targetAdminUser);
            const emailResult = await sendOtpEmail({ name: targetAdminUser.name, email: targetAdminUser.email });
            return emailResult;
        } else {
            logAdminAttempt(emailOrId, 'failure');
            return { success: false, message: 'Invalid credentials. Please check and try again.' };
        }
    }

    // Student & Teacher Login Flow (direct login, no OTP)
    const targetUser = users.find(u => {
        if (role === UserRole.Teacher) return u.role === UserRole.Teacher && u.email === emailOrId;
        if (role === UserRole.Student) return u.role === UserRole.Student && u.id === emailOrId;
        return false;
    });

    if (!targetUser) return { success: false, message: 'Invalid credentials. Please check and try again.' };
    if (targetUser.blocked) return { success: false, message: 'Your account has been blocked.' };
    
    if (targetUser.password === pass) {
        setUser(targetUser);
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(targetUser));
        return { success: true };
    }

    return { success: false, message: 'Invalid credentials. Please check and try again.' };
  }, [users]);

  const verifyOtpAndLogin = useCallback(async (otp: string): Promise<{ success: boolean, message?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    
    if (!pendingUser) return { success: false, message: 'Session expired. Please start the login process again.' };

    const otpDetailsStr = sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!otpDetailsStr) return { success: false, message: 'No OTP found. Please request one.' };

    try {
        const { otp: storedOtp, expiry } = JSON.parse(otpDetailsStr);
        if (Date.now() > expiry) {
            sessionStorage.removeItem(OTP_STORAGE_KEY);
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }
        if (storedOtp === otp) {
            setUser(pendingUser);
            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(pendingUser));
            setPendingUser(null);
            sessionStorage.removeItem(OTP_STORAGE_KEY);
            return { success: true };
        } else {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }
    } catch (e) {
        return { success: false, message: 'An error occurred during OTP verification.' };
    }
  }, [pendingUser]);
  
  const resendOtp = useCallback(async (): Promise<{ success: boolean, message?: string, otp?: string }> => {
    await new Promise(res => setTimeout(res, 500));
    if (!pendingUser) return { success: false, message: 'No pending login session found. Please start over.' };
    
    const emailResult = await sendOtpEmail({ name: pendingUser.name, email: pendingUser.email });
    if (emailResult.success) {
        return { success: true, message: 'A new OTP has been sent.', otp: emailResult.otp };
    } else {
        return { success: false, message: emailResult.message };
    }
  }, [pendingUser]);

  const logout = useCallback(() => {
    setUser(null);
    setPendingUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(OTP_STORAGE_KEY);
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

    const userToUpdate = users.find(u => u.id === userId);
    
    if (!userToUpdate) {
        return { success: false, message: 'User not found.' };
    }

    if (userToUpdate.password !== oldPass) {
        return { success: false, message: 'Current password does not match.' };
    }

    setUsers(prevUsers => 
        prevUsers.map(u => 
            u.id === userId ? { ...u, password: newPass } : u
        )
    );
    
    return { success: true, message: 'Password updated successfully!' };
  }, [users]);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    users,
    login,
    verifyOtpAndLogin,
    resendOtp,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUsers,
    updatePassword,
  }), [user, users, login, verifyOtpAndLogin, resendOtp, logout, addStudent, addTeacher, deleteUser, updateUsers, updatePassword]);


  if(loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};