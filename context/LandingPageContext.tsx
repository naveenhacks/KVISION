import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { HomepageContent, PrincipalInfo, TextBlock, Stat, HomepageAnnouncement, GalleryImage, ContactInfo } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';

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
        message: "Welcome to Kendriya Vidyalaya Unnao...",
        imageUrl: "https://unnao.kvs.ac.in/sites/default/files/principal-new.jpg"
    },
    vision: { title: "Our Vision", content: "To cater to the educational needs..." },
    mission: { title: "Our Mission", content: "To pursue excellence..." },
    coreValues: { title: "Core Values", content: "To develop the spirit..." },
    stats: [ { id: 'stat1', value: 1985, label: "Established" }, { id: 'stat2', value: 1200, label: "Students" }, { id: 'stat3', value: 50, label: "Dedicated Staff" } ],
    announcements: [],
    galleryImages: [],
    contactInfo: { schoolName: 'PM Shree Kendriya Vidyalaya Unnao', address: 'Dahi Chowki, Unnao – 209801', email: 'kvunnao85@gmail.com', phone: '+91 0515-2826444', website: 'unnao.kvs.ac.in' }
});

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<HomepageContent>(getDefaultContent());
    const { users } = useContext(AuthContext);

    const docRef = doc(db, "homepage", "main_content");

    useEffect(() => {
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setContent(docSnap.data() as HomepageContent);
            } else {
                // Initialize if doesn't exist
                setDoc(docRef, getDefaultContent());
            }
        });
        return () => unsubscribe();
    }, []);

    const createId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatePrincipalInfo = async (info: Partial<PrincipalInfo>) => {
        await updateDoc(docRef, {
            principalInfo: { ...content.principalInfo, ...info }
        });
    };

    const updateTextBlock = async (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => {
         await updateDoc(docRef, { [key]: data });
    };

    const updateStats = async (stats: Stat[]) => {
         await updateDoc(docRef, { stats });
    };

    const updateContactInfo = async (info: ContactInfo) => {
         await updateDoc(docRef, { contactInfo: info });
    };

    const addAnnouncement = async (announcement: Omit<HomepageAnnouncement, 'id'>) => {
        const author = users.find(u => u.id === announcement.submittedBy);
        const newAnnouncement: HomepageAnnouncement = { 
            ...announcement, 
            id: createId(), 
            authorName: author?.name || 'Unknown' 
        };
        await updateDoc(docRef, { announcements: [...content.announcements, newAnnouncement] });
    };

    const updateAnnouncement = async (id: string, updates: Partial<HomepageAnnouncement>) => {
        const updated = content.announcements.map(a => a.id === id ? { ...a, ...updates } : a);
        await updateDoc(docRef, { announcements: updated });
    };

    const deleteAnnouncement = async (id: string) => {
        const updated = content.announcements.filter(a => a.id !== id);
        await updateDoc(docRef, { announcements: updated });
    };

    const addImage = async (image: Omit<GalleryImage, 'id'>) => {
        const author = users.find(u => u.id === image.submittedBy);
        const newImage: GalleryImage = { 
            ...image, 
            id: createId(), 
            authorName: author?.name || 'Unknown' 
        };
         await updateDoc(docRef, { galleryImages: [...content.galleryImages, newImage] });
    };

    const deleteImage = async (id: string) => {
        const updated = content.galleryImages.filter(img => img.id !== id);
        await updateDoc(docRef, { galleryImages: updated });
    };

    const updateSubmissionStatus = async (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
        const items = content[type] as any[];
        const updatedItems = items.map(item => item.id === id ? { ...item, status } : item);
        await updateDoc(docRef, { [type]: updatedItems });
    };

    const contextValue = useMemo(() => ({
        content, updatePrincipalInfo, updateTextBlock, updateStats, addAnnouncement,
        updateAnnouncement, deleteAnnouncement, addImage, deleteImage, updateSubmissionStatus, updateContactInfo,
    }), [content, users]);

    return (
        <LandingPageContext.Provider value={contextValue}>
            {children}
        </LandingPageContext.Provider>
    );
};
