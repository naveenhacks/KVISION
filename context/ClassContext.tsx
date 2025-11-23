
import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { ClassGroup } from '../types.ts';

interface ClassContextType {
    classes: ClassGroup[];
    addClass: (name: string, subjects: string[]) => Promise<void>;
    updateClass: (id: string, updates: Partial<ClassGroup>) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
}

export const ClassContext = createContext<ClassContextType>({} as ClassContextType);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [classes, setClasses] = useState<ClassGroup[]>([]);

    useEffect(() => {
        const q = query(collection(db, "classes"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ClassGroup));
            setClasses(list);
        }, (err) => {
            console.error("Error fetching classes", err);
        });
        return () => unsubscribe();
    }, []);

    const addClass = useCallback(async (name: string, subjects: string[]) => {
        await addDoc(collection(db, "classes"), {
            name,
            subjects,
        });
    }, []);

    const updateClass = useCallback(async (id: string, updates: Partial<ClassGroup>) => {
        await updateDoc(doc(db, "classes", id), updates);
    }, []);

    const deleteClass = useCallback(async (id: string) => {
        await deleteDoc(doc(db, "classes", id));
    }, []);

    const value = useMemo(() => ({ classes, addClass, updateClass, deleteClass }), [classes, addClass, updateClass, deleteClass]);

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
};
