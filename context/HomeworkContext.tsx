
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Homework } from '../types.ts';
import { apiDelete } from '../services/apiService.ts';

interface HomeworkContextType {
    homeworks: Homework[];
    addHomework: (homework: Omit<Homework, 'id' | 'uploadDate'>) => void;
    updateHomework: (id: string, updates: Partial<Homework>) => void;
    deleteHomework: (id: string) => Promise<void>;
    getHomeworkById: (id: string) => Homework | undefined;
    toggleHomeworkCompletion: (id: string) => void;
}

export const HomeworkContext = createContext<HomeworkContextType>({
    homeworks: [],
    addHomework: () => {},
    updateHomework: () => {},
    deleteHomework: async () => {},
    getHomeworkById: () => undefined,
    toggleHomeworkCompletion: () => {},
});

interface HomeworkProviderProps {
    children: ReactNode;
}

const HOMEWORK_STORAGE_KEY = 'kvision-homework';

const getInitialHomework = (): Homework[] => {
    try {
        const storedHomework = localStorage.getItem(HOMEWORK_STORAGE_KEY);
        if (storedHomework) {
            return JSON.parse(storedHomework);
        }
    } catch (error) {
        console.error("Failed to parse homework from localStorage", error);
    }
    return [
        {
            id: 'hw-mock-1',
            title: 'Quantum Physics Problem Set',
            course: 'Advanced Physics',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Complete problems 1-5 from chapter 3 of the textbook. Show all your work.',
            uploadDate: new Date().toISOString(),
            teacherId: 't1',
            teacherName: 'Dr. Evelyn Reed',
            completed: false,
        }
    ];
};

export const HomeworkProvider: React.FC<HomeworkProviderProps> = ({ children }) => {
    const [homeworks, setHomeworks] = useState<Homework[]>(getInitialHomework);

    useEffect(() => {
        try {
            localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(homeworks));
        } catch (error) {
            console.error("Failed to save homework to localStorage", error);
        }
    }, [homeworks]);

    const addHomework = useCallback((homework: Omit<Homework, 'id' | 'uploadDate'>) => {
        const newHomework: Homework = {
            ...homework,
            id: `hw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            uploadDate: new Date().toISOString(),
        };
        setHomeworks(prev => [newHomework, ...prev]);
    }, []);
    
    const updateHomework = useCallback((id: string, updates: Partial<Homework>) => {
        setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates } : hw));
    }, []);

    const deleteHomework = useCallback(async (id: string) => {
        await apiDelete('/api/remove/homework', id);
        setHomeworks(prev => prev.filter(hw => hw.id !== id));
    }, []);

    const getHomeworkById = useCallback((id: string) => {
        return homeworks.find(hw => hw.id === id);
    }, [homeworks]);

    const toggleHomeworkCompletion = useCallback((id: string) => {
        setHomeworks(prev => 
            prev.map(hw => 
                hw.id === id ? { ...hw, completed: !hw.completed } : hw
            )
        );
    }, []);

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