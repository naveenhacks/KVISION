import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Announcement } from '../types.ts';
import { db } from '../services/firebase.ts';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

interface AnnouncementContextType {
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
}

export const AnnouncementContext = createContext<AnnouncementContextType>({
    announcements: [],
    addAnnouncement: async () => {},
});

interface AnnouncementProviderProps {
    children: ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const announcementsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Announcement));
            setAnnouncements(announcementsData);
        });

        return () => unsubscribe();
    }, []);

    const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'date'>) => {
        const newAnnouncement = {
            ...announcement,
            date: new Date().toISOString(),
        };
        await addDoc(collection(db, "announcements"), newAnnouncement);
    }, []);
    
    const contextValue = useMemo(() => ({
        announcements,
        addAnnouncement,
    }), [announcements, addAnnouncement]);

    return (
        <AnnouncementContext.Provider value={contextValue}>
            {children}
        </AnnouncementContext.Provider>
    );
};
