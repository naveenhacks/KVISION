import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { Announcement } from '../types.ts';

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
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Announcement));
            setAnnouncements(list);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            // Fail gracefully if permissions denied
        });
        return () => unsubscribe();
    }, []);

    const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'date'>) => {
        await addDoc(collection(db, "announcements"), {
            ...announcement,
            date: new Date().toISOString(),
        });
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