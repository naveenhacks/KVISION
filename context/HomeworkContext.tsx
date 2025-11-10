import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Homework } from '../types.ts';
import { db } from '../services/firebase.ts';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface HomeworkContextType {
    homeworks: Homework[];
    addHomework: (homework: Omit<Homework, 'id' | 'uploadDate'>) => Promise<void>;
    updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
    deleteHomework: (id: string) => Promise<void>;
    getHomeworkById: (id: string) => Homework | undefined;
    toggleHomeworkCompletion: (id: string) => Promise<void>;
}

export const HomeworkContext = createContext<HomeworkContextType>({
    homeworks: [],
    addHomework: async () => {},
    updateHomework: async () => {},
    deleteHomework: async () => {},
    getHomeworkById: () => undefined,
    toggleHomeworkCompletion: async () => {},
});

interface HomeworkProviderProps {
    children: ReactNode;
}

export const HomeworkProvider: React.FC<HomeworkProviderProps> = ({ children }) => {
    const [homeworks, setHomeworks] = useState<Homework[]>([]);

    useEffect(() => {
        const q = query(collection(db, "homework"), orderBy("uploadDate", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const homeworksData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Homework));
            setHomeworks(homeworksData);
        });

        return () => unsubscribe();
    }, []);

    const addHomework = useCallback(async (homework: Omit<Homework, 'id' | 'uploadDate'>) => {
        const newHomework = {
            ...homework,
            uploadDate: new Date().toISOString(),
            completed: false,
        };
        await addDoc(collection(db, "homework"), newHomework);
    }, []);
    
    const updateHomework = useCallback(async (id: string, updates: Partial<Homework>) => {
        const homeworkDoc = doc(db, "homework", id);
        await updateDoc(homeworkDoc, updates);
    }, []);

    const deleteHomework = useCallback(async (id: string) => {
        const homeworkDoc = doc(db, "homework", id);
        await deleteDoc(homeworkDoc);
    }, []);

    const getHomeworkById = useCallback((id: string) => {
        return homeworks.find(hw => hw.id === id);
    }, [homeworks]);

    const toggleHomeworkCompletion = useCallback(async (id: string) => {
        const homework = homeworks.find(hw => hw.id === id);
        if (homework) {
            const homeworkDoc = doc(db, "homework", id);
            await updateDoc(homeworkDoc, { completed: !homework.completed });
        }
    }, [homeworks]);

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
