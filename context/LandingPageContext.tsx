
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from 'react';
import { HomepageContent, PrincipalInfo, TextBlock, Stat, HomepageAnnouncement, GalleryImage, ContactInfo } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { apiDelete } from '../services/apiService.ts';

export interface LandingPageContextType {
    content: HomepageContent;
    updatePrincipalInfo: (info: Partial<PrincipalInfo>) => void;
    updateTextBlock: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => void;
    updateStats: (stats: Stat[]) => void;
    addAnnouncement: (announcement: Omit<HomepageAnnouncement, 'id'>) => void;
    updateAnnouncement: (id: string, updates: Partial<HomepageAnnouncement>) => void;
    deleteAnnouncement: (id: string) => Promise<void>;
    addImage: (image: Omit<GalleryImage, 'id'>) => void;
    deleteImage: (id: string) => Promise<void>;
    updateSubmissionStatus: (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => void;
    updateContactInfo: (info: ContactInfo) => void;
}

export const LandingPageContext = createContext<LandingPageContextType>({} as LandingPageContextType);

const LANDING_PAGE_STORAGE_KEY = 'kvision-landing-page-content';

const getDefaultContent = (): HomepageContent => ({
    principalInfo: {
        name: "Mr. Krishna Prasad Yadav (KP Yadav)",
        title: "A Word from Our Principal",
        message: "Welcome to Kendriya Vidyalaya Unnao! We believe in fostering an environment of academic excellence and holistic development. Our dedicated staff and state-of-the-art facilities aim to empower students to become responsible global citizens. We are committed to nurturing each student's potential and guiding them towards a future of success and discovery. Join us in our journey of shaping the leaders of tomorrow.",
        imageUrl: "https://unnao.kvs.ac.in/sites/default/files/principal-new.jpg"
    },
    vision: {
        title: "Our Vision",
        content: "To cater to the educational needs of children of transferable Central Government including Defence and Para-military personnel by providing a common programme of education."
    },
    mission: {
        title: "Our Mission",
        content: "To pursue excellence and set the pace in the field of school education. To initiate and promote experimentation and innovations in education in collaboration with other bodies like CBSE and NCERT."
    },
    coreValues: {
        title: "Core Values",
        content: "To develop the spirit of national integration and create a sense of 'Indianness' among children. We are committed to nurturing talent and fostering a spirit of lifelong learning."
    },
    stats: [
        { id: 'stat1', value: 1985, label: "Established" },
        { id: 'stat2', value: 1200, label: "Students" },
        { id: 'stat3', value: 50, label: "Dedicated Staff" }
    ],
    announcements: [
        { id: 'ann1', title: "Annual Sports Day 2024", date: "2024-12-20", content: "The annual sports day will be held on the school grounds. All students are requested to participate enthusiastically.", status: 'approved', submittedBy: 'admin01' },
        { id: 'ann2', title: "Parent-Teacher Meeting", date: "2024-11-15", content: "The half-yearly PTM for classes I-XII will be held to discuss student progress. Attendance is mandatory for all parents.", status: 'approved', submittedBy: 'admin01' },
    ],
    galleryImages: [
        { id: 'gal1', src: "https://unnao.kvs.ac.in/sites/default/files/styles/fancy_box/public/2023-11/IMG-20231102-WA0025.jpg", alt: "Campus Image 1", status: 'approved', submittedBy: 'admin01' },
        { id: 'gal2', src: "https://unnao.kvs.ac.in/sites/default/files/styles/fancy_box/public/2024-02/IMG-20240126-WA0023.jpg", alt: "Campus Image 2", status: 'approved', submittedBy: 'admin01' },
        { id: 'gal3', src: "https://unnao.kvs.ac.in/sites/default/files/styles/fancy_box/public/2024-02/IMG-20240126-WA0032.jpg", alt: "Campus Image 3", status: 'approved', submittedBy: 'admin01' },
        { id: 'gal4', src: "https://unnao.kvs.ac.in/sites/default/files/styles/fancy_box/public/2024-02/IMG-20240126-WA0019.jpg", alt: "Campus Image 4", status: 'approved', submittedBy: 'admin01' },
    ],
    contactInfo: {
        schoolName: 'PM Shree Kendriya Vidyalaya Unnao',
        address: 'Dahi Chowki, Unnao – 209801',
        email: 'kvunnao85@gmail.com',
        phone: '+91 0515-2826444',
        website: 'unnao.kvs.ac.in'
    }
});

const getInitialContent = (): HomepageContent => {
    try {
        const stored = localStorage.getItem(LANDING_PAGE_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Failed to parse landing page content from localStorage", error);
    }
    return getDefaultContent();
};

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<HomepageContent>(getInitialContent);
    const { users } = useContext(AuthContext);

    useEffect(() => {
        // Hydrate author names
        const addAuthorNames = (items: (HomepageAnnouncement[] | GalleryImage[])) => {
            return items.map((item: HomepageAnnouncement | GalleryImage) => {
                if (!item.authorName) {
                    const author = users.find(u => u.id === item.submittedBy);
                    return { ...item, authorName: author?.name || 'Unknown' };
                }
                return item;
            });
        };
        
        setContent(prev => ({
            ...prev,
            announcements: addAuthorNames(prev.announcements) as HomepageAnnouncement[],
            galleryImages: addAuthorNames(prev.galleryImages) as GalleryImage[],
        }));
    }, [users]);

    useEffect(() => {
        try {
            localStorage.setItem(LANDING_PAGE_STORAGE_KEY, JSON.stringify(content));
        } catch (error) {
            console.error("Failed to save landing page content", error);
        }
    }, [content]);

    const createId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatePrincipalInfo = useCallback((info: Partial<PrincipalInfo>) => setContent(c => ({ ...c, principalInfo: { ...c.principalInfo, ...info } })), []);
    const updateTextBlock = useCallback((key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => setContent(c => ({ ...c, [key]: data })), []);
    const updateStats = useCallback((stats: Stat[]) => setContent(c => ({ ...c, stats })), []);
    const addAnnouncement = useCallback((announcement: Omit<HomepageAnnouncement, 'id'>) => setContent(c => ({ ...c, announcements: [{ ...announcement, id: createId() }, ...c.announcements] })), []);
    const updateAnnouncement = useCallback((id: string, updates: Partial<HomepageAnnouncement>) => setContent(c => ({ ...c, announcements: c.announcements.map(a => a.id === id ? { ...a, ...updates } : a) })), []);
    
    const deleteAnnouncement = useCallback(async (id: string) => {
        await apiDelete('/api/remove/notice', id);
        setContent(c => ({ ...c, announcements: c.announcements.filter(a => a.id !== id) }));
    }, []);
    
    const addImage = useCallback((image: Omit<GalleryImage, 'id'>) => setContent(c => ({ ...c, galleryImages: [{ ...image, id: createId() }, ...c.galleryImages] })), []);
    
    const deleteImage = useCallback(async (id: string) => {
        await apiDelete('/api/remove/image', id);
        setContent(c => ({ ...c, galleryImages: c.galleryImages.filter(img => img.id !== id) }));
    }, []);
    
    const updateSubmissionStatus = useCallback((type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
         setContent(c => ({
            ...c,
            [type]: c[type].map((item: any) => item.id === id ? { ...item, status } : item)
        }));
    }, []);

    const updateContactInfo = useCallback((info: ContactInfo) => setContent(c => ({ ...c, contactInfo: info })), []);

    const contextValue = useMemo(() => ({
        content,
        updatePrincipalInfo,
        updateTextBlock,
        updateStats,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addImage,
        deleteImage,
        updateSubmissionStatus,
        updateContactInfo,
    }), [
        content, 
        updatePrincipalInfo, 
        updateTextBlock, 
        updateStats, 
        addAnnouncement, 
        updateAnnouncement, 
        deleteAnnouncement, 
        addImage, 
        deleteImage, 
        updateSubmissionStatus,
        updateContactInfo,
    ]);

    return (
        <LandingPageContext.Provider value={contextValue}>
            {children}
        </LandingPageContext.Provider>
    );
};