import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { Homework } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { uploadHomeworkFile } from '../services/firebaseService.ts';

interface HomeworkContextType {
    homeworks: Homework[];
    addHomework: (homework: Omit<Homework, 'id' | 'uploadDate' | 'completedBy'>) => Promise<void>;
    updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
    deleteHomework: (id: string) => Promise<void>;
    getHomeworkById: (id: string) => Homework | undefined;
    toggleHomeworkCompletion: (id: string) => Promise<void>;
}

export const HomeworkContext = createContext<HomeworkContextType>({} as HomeworkContextType);

interface HomeworkProviderProps {
    children: ReactNode;
}

export const HomeworkProvider: React.FC<HomeworkProviderProps> = ({ children }) => {
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setHomeworks([]);
            return;
        }

        const q = query(collection(db, "homeworks"), orderBy("uploadDate", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const hwList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Homework));
            setHomeworks(hwList);
        }, (error) => {
            console.error("Error fetching homeworks:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const addHomework = useCallback(async (homework: Omit<Homework, 'id' | 'uploadDate' | 'completedBy'>) => {
        try {
            // 1. Create doc first to get ID
            const newHwRef = await addDoc(collection(db, "homeworks"), {
                ...homework,
                uploadDate: new Date().toISOString(),
                completedBy: [],
                // Don't save the raw file object if present in 'file', handled below
                file: homework.file ? { ...homework.file, dataUrl: '' } : undefined 
            });

            // 2. If file exists, upload it to Storage using the new ID
            if (homework.file && homework.file.dataUrl.startsWith('data:')) {
                // We generally expect the Page component to handle the upload to Storage and pass the URL
                // But if we receive a dataUrl here (which shouldn't happen in the new flow), update it.
                await updateDoc(newHwRef, { file: homework.file });
            }
        } catch (error) {
            console.error("Error adding homework:", error);
            throw error;
        }
    }, []);
    
    const updateHomework = useCallback(async (id: string, updates: Partial<Homework>) => {
        await updateDoc(doc(db, "homeworks", id), updates);
    }, []);

    const deleteHomework = useCallback(async (id: string) => {
        await deleteDoc(doc(db, "homeworks", id));
    }, []);

    const getHomeworkById = useCallback((id: string) => {
        return homeworks.find(hw => hw.id === id);
    }, [homeworks]);

    const toggleHomeworkCompletion = useCallback(async (id: string) => {
        if (!user) return;
        const hw = homeworks.find(h => h.id === id);
        if (!hw) return;

        const isCompleted = hw.completedBy?.includes(user.id);
        const newCompletedBy = isCompleted 
            ? hw.completedBy?.filter(uid => uid !== user.id) || []
            : [...(hw.completedBy || []), user.id];
        
        await updateDoc(doc(db, "homeworks", id), {
            completedBy: newCompletedBy
        });
    }, [user, homeworks]);

    const contextValue = useMemo(() => ({
        homeworks,
        addHomework,
        updateHomework,
        deleteHomework,
        getHomeworkById,
        toggleHomeworkCompletion,
    }), [homeworks, addHomework, updateHomework, deleteHomework, getHomeworkById, toggleHomeworkCompletion]);

    return (
        <HomeworkContext.Provider value={contextValue}>
            {children}
        </HomeworkContext.Provider>
    );
};