import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from 'react';
import { Message, User, UploadedFile, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { db } from '../services/firebase.ts';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, setDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';


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
    conversations: Record<string, Message[]>;
    sendMessage: (senderId: string, receiverId: string, content: Message['content']) => Promise<void>;
    deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
    markConversationAsRead: (conversationId: string, readerId: string) => Promise<void>;
    getConversationsForUser: (userId: string) => Conversation[];
}

export const MessageContext = createContext<MessageContextType>({
    conversations: {},
    sendMessage: async () => {},
    deleteMessage: async () => {},
    markConversationAsRead: async () => {},
    getConversationsForUser: () => [],
});

interface MessageProviderProps {
    children: ReactNode;
}

const ADMIN_VIRTUAL_USER_ID = 'kvision_admin_inbox';

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const { user, users } = useContext(AuthContext);
    const [conversations, setConversations] = useState<Record<string, Message[]>>({});

    useEffect(() => {
        if (!user) return;
        
        const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos: Record<string, Message[]> = {};
            snapshot.docs.forEach(doc => {
                convos[doc.id] = doc.data().messages || [];
            });
            setConversations(convos);
        });

        return () => unsubscribe();
    }, [user]);

    const sendMessage = useCallback(async (senderId: string, receiverId: string, content: Message['content']) => {
        const conversationId = generateConversationId(senderId, receiverId);
        const conversationRef = doc(db, 'conversations', conversationId);

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            content,
            timestamp: new Date().toISOString(),
            senderId,
            receiverId,
            status: 'sent',
        };

        try {
            await updateDoc(conversationRef, {
                messages: arrayUnion(newMessage)
            });
        } catch (error) {
            // If doc doesn't exist, create it
            await setDoc(conversationRef, {
                participants: [senderId, receiverId],
                messages: [newMessage]
            });
        }
    }, []);

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        const conversationRef = doc(db, 'conversations', conversationId);
        const convoMessages = conversations[conversationId] || [];
        const messageToDelete = convoMessages.find(msg => msg.id === messageId);
        
        if (messageToDelete) {
            await updateDoc(conversationRef, {
                messages: arrayRemove(messageToDelete)
            });
        }
    }, [conversations]);

    const markConversationAsRead = useCallback(async (conversationId: string, readerId: string) => {
        const conversationRef = doc(db, 'conversations', conversationId);
        const convoMessages = conversations[conversationId] || [];
        
        const updatedMessages = convoMessages.map(msg => 
            msg.receiverId === readerId && msg.status !== 'read' 
            ? { ...msg, status: 'read' as const } 
            : msg
        );

        if (JSON.stringify(updatedMessages) !== JSON.stringify(convoMessages)) {
             await updateDoc(conversationRef, { messages: updatedMessages });
        }
    }, [conversations]);

    const getConversationsForUser = useCallback((userId: string): Conversation[] => {
        const adminUser: User = { id: ADMIN_VIRTUAL_USER_ID, name: 'KVISION Admin', email: '', role: UserRole.Admin };
        const allUsers = [...users, adminUser];

        const userConversations = Object.entries(conversations)
            .filter(([id]) => id.includes(userId))
            .map(([id, messages]) => {
                const participantIds = id.split('--');
                const otherUserId = participantIds.find(pId => pId !== userId);
                const otherUser = allUsers.find(u => u.id === otherUserId);

                if (!otherUser || !Array.isArray(messages)) return null;

                const unreadCount = messages.filter(m => m.receiverId === userId && m.status !== 'read').length;

                return {
                    id,
                    otherUser,
                    messages,
                    unreadCount,
                };
            })
            .filter((c): c is Conversation => c !== null);

        userConversations.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1];
            const lastMsgB = b.messages[b.messages.length - 1];
            if (!lastMsgA) return 1;
            if (!lastMsgB) return -1;
            return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
        });

        return userConversations;

    }, [conversations, users]);


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
