import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Notification, UserRole } from '../types.ts';
import { db } from '../firebaseConfig.ts';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

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

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    ...docData,
                    id: doc.id,
                    date: docData.date.toDate().toISOString(),
                } as Notification
            });
            setNotifications(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
        return () => unsubscribe();
    }, []);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
        await addDoc(collection(db, 'notifications'), {
            ...notification,
            date: serverTimestamp(),
            readBy: [],
        });
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        await deleteDoc(doc(db, 'notifications', id));
    }, []);

    const getNotificationsForUser = useCallback((userRole: UserRole, userId: string): Notification[] => {
        return notifications.filter(n => n.target === 'all' || n.target === userRole);
    }, [notifications]);

    const getUnreadCount = useCallback((userRole: UserRole, userId: string): number => {
        const userNotifs = getNotificationsForUser(userRole, userId);
        return userNotifs.filter(n => !n.readBy.includes(userId)).length;
    }, [notifications, getNotificationsForUser]);

    const markAsRead = useCallback(async (userId: string, userRole: UserRole) => {
        const userNotifs = getNotificationsForUser(userRole, userId);
        const promises: Promise<void>[] = [];
        userNotifs.forEach((n) => {
            if (!n.readBy.includes(userId)) {
                promises.push(updateDoc(doc(db, 'notifications', n.id), {
                    readBy: arrayUnion(userId)
                }));
            }
        });
        await Promise.all(promises);
    }, [getNotificationsForUser]);

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