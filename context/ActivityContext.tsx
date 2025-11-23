
import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { ActivityLog } from '../types.ts';

interface ActivityContextType {
    logs: ActivityLog[];
    logActivity: (action: string, performedBy: string, type?: ActivityLog['type']) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType>({} as ActivityContextType);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActivityLog));
            setLogs(fetchedLogs);
        }, (err) => {
            console.error("Error fetching activity logs", err);
        });
        return () => unsubscribe();
    }, []);

    const logActivity = useCallback(async (action: string, performedBy: string, type: ActivityLog['type'] = 'info') => {
        try {
            await addDoc(collection(db, "activity_logs"), {
                action,
                performedBy,
                timestamp: new Date().toISOString(),
                type
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    }, []);

    const value = useMemo(() => ({ logs, logActivity }), [logs, logActivity]);

    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    );
};
