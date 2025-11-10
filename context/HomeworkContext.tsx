import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect, useContext } from 'react';
import { Homework } from '../types.ts';
import { db } from '../firebaseConfig.ts';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { AuthContext } from './AuthContext.tsx';

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
        const unsubscribe = onSnapshot(collection(db, 'homeworks'), (snapshot) => {
            const homeworksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Homework));
            setHomeworks(homeworksData);
        });
        return () => unsubscribe();
    }, []);

    const addHomework = useCallback(async (homework: Omit<Homework, 'id' | 'uploadDate' | 'completedBy'>) => {
        const newHomework = {
            ...homework,
            uploadDate: new Date().toISOString(),
            completedBy: [],
        };
        await addDoc(collection(db, 'homeworks'), newHomework);
    }, []);
    
    const updateHomework = useCallback(async (id: string, updates: Partial<Homework>) => {
        await updateDoc(doc(db, 'homeworks', id), updates);
    }, []);

    const deleteHomework = useCallback(async (id: string) => {
        await deleteDoc(doc(db, 'homeworks', id));
    }, []);

    const getHomeworkById = useCallback((id: string) => {
        return homeworks.find(hw => hw.id === id);
    }, [homeworks]);

    const toggleHomeworkCompletion = useCallback(async (id: string) => {
        if (!user) return;
        const homework = homeworks.find(hw => hw.id === id);
        if (!homework) return;

        const isCompleted = homework.completedBy?.includes(user.id);
        await updateDoc(doc(db, 'homeworks', id), {
            completedBy: isCompleted ? arrayRemove(user.id) : arrayUnion(user.id)
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