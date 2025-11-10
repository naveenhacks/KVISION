import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from 'react';
import { HomepageContent, PrincipalInfo, TextBlock, Stat, HomepageAnnouncement, GalleryImage, ContactInfo, User } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { db } from '../services/firebase.ts';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface LandingPageContextType {
    content: HomepageContent;
    updatePrincipalInfo: (info: Partial<PrincipalInfo>) => Promise<void>;
    updateTextBlock: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => Promise<void>;
    updateStats: (stats: Stat[]) => Promise<void>;
    addAnnouncement: (announcement: Omit<HomepageAnnouncement, 'id'>) => Promise<void>;
    updateAnnouncement: (id: string, updates: Partial<HomepageAnnouncement>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;
    addImage: (image: Omit<GalleryImage, 'id'>) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
    updateSubmissionStatus: (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => Promise<void>;
    updateContactInfo: (info: ContactInfo) => Promise<void>;
}

export const LandingPageContext = createContext<LandingPageContextType>({} as LandingPageContextType);

const getDefaultContent = (): HomepageContent => ({
    principalInfo: {
        name: "Mr. Krishna Prasad Yadav (KP Yadav)",
        title: "A Word from Our Principal",
        message: "Welcome to Kendriya Vidyalaya Unnao! We believe in fostering an environment of academic excellence and holistic development. Our dedicated staff and state-of-the-art facilities aim to empower students to become responsible global citizens. We are committed to nurturing each student's potential and guiding them towards a future of success and discovery. Join us in our journey of shaping the leaders of tomorrow.",
        imageUrl: "https://unnao.kvs.ac.in/sites/default/files/principal-new.jpg"
    },
    vision: { title: "Our Vision", content: "To cater to the educational needs of children of transferable Central Government including Defence and Para-military personnel by providing a common programme of education." },
    mission: { title: "Our Mission", content: "To pursue excellence and set the pace in the field of school education. To initiate and promote experimentation and innovations in education in collaboration with other bodies like CBSE and NCERT." },
    coreValues: { title: "Core Values", content: "To develop the spirit of national integration and create a sense of 'Indianness' among children. We are committed to nurturing talent and fostering a spirit of lifelong learning." },
    stats: [ { id: 'stat1', value: 1985, label: "Established" }, { id: 'stat2', value: 1200, label: "Students" }, { id: 'stat3', value: 50, label: "Dedicated Staff" } ],
    announcements: [],
    galleryImages: [],
    contactInfo: { schoolName: 'PM Shree Kendriya Vidyalaya Unnao', address: 'Dahi Chowki, Unnao – 209801', email: 'kvunnao85@gmail.com', phone: '+91 0515-2826444', website: 'unnao.kvs.ac.in' }
});

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<HomepageContent>(getDefaultContent);
    const { users } = useContext(AuthContext);
    const docRef = doc(db, 'homepage', 'content');

    useEffect(() => {
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as HomepageContent;
                // Hydrate author names
                const hydrateItems = (items: (HomepageAnnouncement[] | GalleryImage[]), allUsers: User[]) => 
                    items.map((item: HomepageAnnouncement | GalleryImage) => {
                        const author = allUsers.find(u => u.id === item.submittedBy);
                        return { ...item, authorName: author?.name || 'Unknown Contributor' };
                    });
                
                setContent({
                    ...data,
                    announcements: hydrateItems(data.announcements, users),
                    galleryImages: hydrateItems(data.galleryImages, users),
                });
            } else {
                console.log("No homepage content found, seeding default content.");
                setDoc(docRef, getDefaultContent());
            }
        });
        return () => unsubscribe();
    }, [users]);

    const createId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatePrincipalInfo = useCallback(async (info: Partial<PrincipalInfo>) => {
        await updateDoc(docRef, { principalInfo: { ...content.principalInfo, ...info } });
    }, [content.principalInfo]);
    
    const updateTextBlock = useCallback(async (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => {
        await updateDoc(docRef, { [key]: data });
    }, []);

    const updateStats = useCallback(async (stats: Stat[]) => await updateDoc(docRef, { stats }), []);
    
    const addAnnouncement = useCallback(async (announcement: Omit<HomepageAnnouncement, 'id'>) => {
        const newAnnouncement = { ...announcement, id: createId() };
        await updateDoc(docRef, { announcements: arrayUnion(newAnnouncement) });
    }, []);

    const updateItems = async (key: 'announcements' | 'galleryImages', id: string, updates: any) => {
        const currentItems = (content[key] as any[]).map(item => item.id === id ? { ...item, ...updates } : item);
        await updateDoc(docRef, { [key]: currentItems });
    };

    const updateAnnouncement = (id: string, updates: Partial<HomepageAnnouncement>) => updateItems('announcements', id, updates);

    const deleteAnnouncement = useCallback(async (id: string) => {
        const itemToDelete = content.announcements.find(a => a.id === id);
        if (itemToDelete) await updateDoc(docRef, { announcements: arrayRemove(itemToDelete) });
    }, [content.announcements]);
    
    const addImage = useCallback(async (image: Omit<GalleryImage, 'id'>) => {
        const newImage = { ...image, id: createId() };
        await updateDoc(docRef, { galleryImages: arrayUnion(newImage) });
    }, []);
    
    const deleteImage = useCallback(async (id: string) => {
        const itemToDelete = content.galleryImages.find(img => img.id === id);
        if (itemToDelete) await updateDoc(docRef, { galleryImages: arrayRemove(itemToDelete) });
    }, [content.galleryImages]);
    
    const updateSubmissionStatus = (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => updateItems(type, id, { status });

    const updateContactInfo = useCallback(async (info: ContactInfo) => await updateDoc(docRef, { contactInfo: info }), []);

    const contextValue = useMemo(() => ({
        content, updatePrincipalInfo, updateTextBlock, updateStats, addAnnouncement,
        updateAnnouncement, deleteAnnouncement, addImage, deleteImage, updateSubmissionStatus, updateContactInfo,
    }), [content]);

    return (
        <LandingPageContext.Provider value={contextValue}>
            {children}
        </LandingPageContext.Provider>
    );
};
