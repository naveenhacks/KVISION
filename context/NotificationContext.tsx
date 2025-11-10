import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Notification, UserRole } from '../types.ts';
import { db } from '../services/firebase.ts';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, arrayUnion, query, orderBy } from 'firebase/firestore';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    markAsRead: (userId: string) => Promise<void>;
    getUnreadCount: (userRole: UserRole, userId: string) => number;
    getNotificationsForUser: (userRole: UserRole, userId: string) => Notification[];
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: async () => {},
    deleteNotification: async () => {},
    markAsRead: async () => {},
    getUnreadCount: () => 0,
    getNotificationsForUser: () => [],
});

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const q = query(collection(db, "notifications"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Notification));
            setNotifications(notificationsData);
        });
        return () => unsubscribe();
    }, []);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
        const newNotification = {
            ...notification,
            date: new Date().toISOString(),
            readBy: [],
        };
        await addDoc(collection(db, "notifications"), newNotification);
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        await deleteDoc(doc(db, "notifications", id));
    }, []);

    const getNotificationsForUser = useCallback((userRole: UserRole, userId: string): Notification[] => {
        return notifications.filter(n => n.target === 'all' || n.target === userRole);
    }, [notifications]);

    const getUnreadCount = useCallback((userRole: UserRole, userId: string): number => {
        const userNotifs = getNotificationsForUser(userRole, userId);
        return userNotifs.filter(n => !n.readBy.includes(userId)).length;
    }, [notifications, getNotificationsForUser]);

    const markAsRead = useCallback(async (userId: string) => {
        const unreadNotifs = notifications.filter(n => !n.readBy.includes(userId));
        for (const notif of unreadNotifs) {
            const notifRef = doc(db, "notifications", notif.id);
            await updateDoc(notifRef, {
                readBy: arrayUnion(userId)
            });
        }
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