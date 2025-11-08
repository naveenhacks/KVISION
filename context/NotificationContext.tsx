
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Notification, UserRole } from '../types';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => void;
    deleteNotification: (id: string) => void;
    markAsRead: (userId: string) => void;
    getUnreadCount: (userId: string) => number;
    getNotificationsForUser: (userRole: UserRole, userId: string) => Notification[];
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: () => {},
    deleteNotification: () => {},
    markAsRead: () => {},
    getUnreadCount: () => 0,
    getNotificationsForUser: () => [],
});

interface NotificationProviderProps {
    children: ReactNode;
}

const NOTIFICATIONS_STORAGE_KEY = 'kvision-notifications';

const getInitialNotifications = (): Notification[] => {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse notifications from localStorage", error);
        return [];
    }
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(getInitialNotifications);

    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error("Failed to save notifications to localStorage", error);
        }
    }, [notifications]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            date: new Date().toISOString(),
            readBy: [],
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getNotificationsForUser = useCallback((userRole: UserRole, userId: string): Notification[] => {
        return notifications
            .filter(n => n.target === 'all' || n.target === userRole)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [notifications]);

    const getUnreadCount = useCallback((userId: string): number => {
        return notifications.filter(n => !n.readBy.includes(userId)).length;
    }, [notifications]);

    const markAsRead = useCallback((userId: string) => {
        setNotifications(prev => 
            prev.map(n => 
                n.readBy.includes(userId) ? n : { ...n, readBy: [...n.readBy, userId] }
            )
        );
    }, []);

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
