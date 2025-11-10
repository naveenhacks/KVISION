import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { HomepageContent, PrincipalInfo, TextBlock, Stat, HomepageAnnouncement, GalleryImage, ContactInfo, User } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { db } from '../firebaseConfig.ts';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';

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

const contentDocRef = doc(db, 'homepage', 'content');

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<HomepageContent>(getDefaultContent);
    const { users } = useContext(AuthContext);

    useEffect(() => {
        const ensureDocExists = async () => {
            const docSnap = await getDoc(contentDocRef);
            if (!docSnap.exists()) {
                await setDoc(contentDocRef, getDefaultContent());
            }
        };
        ensureDocExists();
        
        const unsubscribe = onSnapshot(contentDocRef, (doc) => {
            if (doc.exists()) {
                setContent(doc.data() as HomepageContent);
            }
        });
        return () => unsubscribe();
    }, []);

    const createId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const updateFirestore = async (data: Partial<HomepageContent>) => {
        await updateDoc(contentDocRef, data);
    };

    const updatePrincipalInfo = async (info: Partial<PrincipalInfo>) => updateFirestore({ principalInfo: { ...content.principalInfo, ...info } });
    const updateTextBlock = async (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => updateFirestore({ [key]: data });
    const updateStats = async (stats: Stat[]) => updateFirestore({ stats });
    const updateContactInfo = async (info: ContactInfo) => updateFirestore({ contactInfo: info });

    const addAnnouncement = async (announcement: Omit<HomepageAnnouncement, 'id'>) => {
        const author = users.find(u => u.id === announcement.submittedBy);
        const newAnnouncement = { ...announcement, id: createId(), authorName: author?.name || 'Unknown' };
        await updateFirestore({ announcements: [...content.announcements, newAnnouncement] });
    };

    const updateAnnouncement = async (id: string, updates: Partial<HomepageAnnouncement>) => {
        const newAnnouncements = content.announcements.map(a => a.id === id ? { ...a, ...updates } : a);
        await updateFirestore({ announcements: newAnnouncements });
    };

    const deleteAnnouncement = async (id: string) => {
        const newAnnouncements = content.announcements.filter(a => a.id !== id);
        await updateFirestore({ announcements: newAnnouncements });
    };

    const addImage = async (image: Omit<GalleryImage, 'id'>) => {
        const author = users.find(u => u.id === image.submittedBy);
        const newImage = { ...image, id: createId(), authorName: author?.name || 'Unknown' };
        await updateFirestore({ galleryImages: [...content.galleryImages, newImage] });
    };

    const deleteImage = async (id: string) => {
        const newImages = content.galleryImages.filter(img => img.id !== id);
        await updateFirestore({ galleryImages: newImages });
    };

    const updateSubmissionStatus = async (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
        const key = type as 'announcements' | 'galleryImages';
        const updatedItems = (content[key] as any[]).map(item => item.id === id ? { ...item, status } : item);
        await updateFirestore({ [key]: updatedItems });
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