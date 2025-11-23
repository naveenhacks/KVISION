import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect, useContext } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { Notification, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    markAsRead: (userId: string, userRole: UserRole) => Promise<void>;
    getUnreadCount: (userRole: UserRole, userId: string) => number;
    getNotificationsForUser: (userRole: UserRole, userId: string) => Notification[];
}

export const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const q = query(collection(db, "notifications"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            setNotifications(list);
        }, (error) => {
            console.error("Error fetching notifications:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
        await addDoc(collection(db, "notifications"), {
            ...notification,
            date: new Date().toISOString(),
            readBy: [],
        });
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        await deleteDoc(doc(db, "notifications", id));
    }, []);

    const getNotificationsForUser = useCallback((userRole: UserRole, userId: string): Notification[] => {
        return notifications.filter(n => n.target === 'all' || n.target === userRole);
    }, [notifications]);

    const getUnreadCount = useCallback((userRole: UserRole, userId: string): number => {
        const userNotifs = getNotificationsForUser(userRole, userId);
        return userNotifs.filter(n => !n.readBy?.includes(userId)).length;
    }, [notifications, getNotificationsForUser]);

    const markAsRead = useCallback(async (userId: string, userRole: UserRole) => {
        // In Firestore, we must update each doc individually.
        // Optimization: Filter locally first
        const unreadDocs = notifications.filter(n => 
            (n.target === 'all' || n.target === userRole) && 
            !n.readBy?.includes(userId)
        );

        await Promise.all(unreadDocs.map(n => {
            const newReadBy = [...(n.readBy || []), userId];
            return updateDoc(doc(db, "notifications", n.id), { readBy: newReadBy });
        }));
    }, [notifications]);

    const contextValue = useMemo(() => ({
        notifications,
        addNotification,
        deleteNotification,
        markAsRead,
        getUnreadCount,
        getNotificationsForUser,
    }), [notifications, addNotification, deleteNotification, markAsRead, getUnreadCount, getNotificationsForUser]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};