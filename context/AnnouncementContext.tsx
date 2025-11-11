import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Announcement } from '../types.ts';
import { db } from '../firebaseConfig.ts';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

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
        const unsubscribe = onSnapshot(collection(db, 'announcements'), (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    ...docData,
                    id: doc.id,
                    date: docData.date?.toDate ? docData.date.toDate().toISOString() : new Date().toISOString(),
                } as Announcement
            });
            setAnnouncements(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
        return () => unsubscribe();
    }, []);

    const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'date'>) => {
        await addDoc(collection(db, 'announcements'), {
            ...announcement,
            date: serverTimestamp(),
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