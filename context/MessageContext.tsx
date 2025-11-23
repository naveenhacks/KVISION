import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, getDoc, query, where } from "firebase/firestore";
import { db } from '../firebaseConfig.ts';
import { Message, User, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';

export const generateConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('--');
};

export interface Conversation {
    id: string;
    otherUser: User;
    messages: Message[];
    unreadCount: number;
}

interface MessageContextType {
    conversations: Conversation[];
    sendMessage: (senderId: string, receiverId: string, content: Message['content']) => Promise<void>;
    deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
    markConversationAsRead: (conversationId: string, readerId: string) => Promise<void>;
    getConversationsForUser: (userId: string) => Conversation[];
}

export const MessageContext = createContext<MessageContextType>({} as MessageContextType);

interface MessageProviderProps {
    children: ReactNode;
}

// Firestore Structure: Collection 'conversations' -> Doc ID 'user1--user2' -> Field 'messages' (array) or Subcollection
// For this scale, Array of messages in a doc is simplest, provided < 1MB.

const ADMIN_VIRTUAL_USER_ID = 'kvision_admin_inbox';

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const { user, users } = useContext(AuthContext);
    const [rawConversations, setRawConversations] = useState<any[]>([]);

    useEffect(() => {
        if (!user) {
            setRawConversations([]);
            return;
        }

        // Determine the ID used for messaging (Admin uses a virtual ID)
        const messageUserId = user.role === UserRole.Admin ? ADMIN_VIRTUAL_USER_ID : user.id;

        // Query only conversations where the user is a participant
        const q = query(
            collection(db, "conversations"), 
            where("participants", "array-contains", messageUserId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setRawConversations(convos);
        }, (error) => {
            console.error("Error fetching conversations:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const conversations = useMemo(() => {
        if (!user) return [];

        const messageUserId = user.role === UserRole.Admin ? ADMIN_VIRTUAL_USER_ID : user.id;
        const adminUser: User = { id: ADMIN_VIRTUAL_USER_ID, uid: ADMIN_VIRTUAL_USER_ID, name: 'KVISION Admin', email: '', role: UserRole.Admin };
        const allUsers = [...users, adminUser];

        return rawConversations
            .filter((c: any) => c.participants && c.participants.includes(messageUserId))
            .map((c: any) => {
                const otherUserId = c.participants.find((p: string) => p !== messageUserId);
                const otherUser = allUsers.find(u => u.id === otherUserId);
                
                if (!otherUser) return null;

                const msgs = (c.messages || []) as Message[];

                return {
                    id: c.id,
                    otherUser,
                    messages: msgs,
                    unreadCount: msgs.filter(m => m.receiverId === messageUserId && m.status !== 'read').length
                };
            })
            .filter((c): c is Conversation => c !== null)
            .sort((a, b) => {
                const lastMsgA = a.messages[a.messages.length - 1];
                const lastMsgB = b.messages[b.messages.length - 1];
                if (!lastMsgA) return 1;
                if (!lastMsgB) return -1;
                return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
            });

    }, [user, users, rawConversations]);

    const getConversationsForUser = useCallback((userId: string): Conversation[] => {
        return conversations;
    }, [conversations]);

    const sendMessage = useCallback(async (senderId: string, receiverId: string, content: Message['content']) => {
        const conversationId = generateConversationId(senderId, receiverId);
        
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            content,
            timestamp: new Date().toISOString(),
            senderId,
            receiverId,
            status: 'sent',
        };
        
        const convoRef = doc(db, "conversations", conversationId);
        const convoSnap = await getDoc(convoRef);

        if (!convoSnap.exists()) {
            await setDoc(convoRef, {
                participants: [senderId, receiverId],
                messages: [newMessage]
            });
        } else {
            await updateDoc(convoRef, {
                messages: arrayUnion(newMessage)
            });
        }

    }, []);

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        const convoRef = doc(db, "conversations", conversationId);
        const convoSnap = await getDoc(convoRef);
        if (convoSnap.exists()) {
            const data = convoSnap.data();
            const updatedMessages = (data.messages as Message[]).filter(m => m.id !== messageId);
            await updateDoc(convoRef, { messages: updatedMessages });
        }
    }, []);

    const markConversationAsRead = useCallback(async (conversationId: string, readerId: string) => {
        const messageUserId = (user?.role === UserRole.Admin) ? ADMIN_VIRTUAL_USER_ID : readerId;
        
        const convoRef = doc(db, "conversations", conversationId);
        const convoSnap = await getDoc(convoRef);
        
        if (convoSnap.exists()) {
            const data = convoSnap.data();
            const updatedMessages = (data.messages as Message[]).map(msg => 
                msg.receiverId === messageUserId && msg.status !== 'read' 
                ? { ...msg, status: 'read' as const } 
                : msg
            );
            
            // Only update if changes were made to avoid loops (comparing stringified to handle deep object comparison simply)
            if (JSON.stringify(data.messages) !== JSON.stringify(updatedMessages)) {
                await updateDoc(convoRef, { messages: updatedMessages });
            }
        }
    }, [user]);

    const contextValue = useMemo(() => ({
        conversations,
        sendMessage,
        deleteMessage,
        markConversationAsRead,
        getConversationsForUser,
    }), [conversations, sendMessage, deleteMessage, markConversationAsRead, getConversationsForUser]);

    return (
        <MessageContext.Provider value={contextValue}>
            {children}
        </MessageContext.Provider>
    );
};