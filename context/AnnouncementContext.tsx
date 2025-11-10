
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Announcement } from '../types.ts';

interface AnnouncementContextType {
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
}

export const AnnouncementContext = createContext<AnnouncementContextType>({
    announcements: [],
    addAnnouncement: () => {},
});

interface AnnouncementProviderProps {
    children: ReactNode;
}

const ANNOUNCEMENT_STORAGE_KEY = 'kvision-announcements';

const getInitialAnnouncements = (): Announcement[] => {
    try {
        const stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Failed to parse announcements from localStorage", error);
    }
    return [
        {
            id: 'ann-mock-1',
            title: 'School Reopening Notice',
            content: 'The school will reopen on Monday. All students are requested to attend.',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            teacherName: 'KV Teacher',
        }
    ];
};

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(getInitialAnnouncements);

    useEffect(() => {
        try {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(announcements));
        } catch (error) {
            console.error("Failed to save announcements to localStorage", error);
        }
    }, [announcements]);

    const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'date'>) => {
        const newAnnouncement: Announcement = {
            ...announcement,
            id: `ann-${Date.now()}`,
            date: new Date().toISOString(),
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
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
