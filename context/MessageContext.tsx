import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { Message, User, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { db } from '../firebaseConfig.ts';
// FIX: Add setDoc to imports.
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, where, query, serverTimestamp, orderBy, writeBatch, setDoc } from 'firebase/firestore';


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
    // FIX: Add getConversationsForUser to the context type to match the provided value.
    getConversationsForUser: (userId: string) => Conversation[];
}

export const MessageContext = createContext<MessageContextType>({} as MessageContextType);

interface MessageProviderProps {
    children: ReactNode;
}

const ADMIN_VIRTUAL_USER_ID = 'kvision_admin_inbox';

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const { user, users } = useContext(AuthContext);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!user) {
            setConversations([]);
            return;
        }

        // FIX: Use the virtual admin ID for admins to fetch all student conversations.
        const messageUserId = user.role === UserRole.Admin ? ADMIN_VIRTUAL_USER_ID : user.id;
        const q = query(collection(db, "conversations"), where("participants", "array-contains", messageUserId));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const convos: Conversation[] = [];
            const adminUser: User = { id: ADMIN_VIRTUAL_USER_ID, uid: ADMIN_VIRTUAL_USER_ID, name: 'KVISION Admin', email: '', role: UserRole.Admin };
            const allUsers = [...users, adminUser];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const otherUserId = data.participants.find((p: string) => p !== messageUserId);
                const otherUser = allUsers.find(u => u.id === otherUserId);
                
                if (otherUser) {
                     const messages = (data.messages || []).map((msg: any) => ({
                        ...msg,
                        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate().toISOString() : new Date().toISOString()
                    }));

                    convos.push({
                        id: doc.id,
                        otherUser,
                        messages,
                        unreadCount: messages.filter((m: Message) => m.receiverId === messageUserId && m.status !== 'read').length
                    });
                }
            });
            
             convos.sort((a, b) => {
                const lastMsgA = a.messages[a.messages.length - 1];
                const lastMsgB = b.messages[b.messages.length - 1];
                if (!lastMsgA) return 1;
                if (!lastMsgB) return -1;
                // FIX: Corrected typo from a.timestamp to lastMsgA.timestamp for correct sorting.
                return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
            });

            setConversations(convos);
        });

        return () => unsubscribe();

    }, [user, users]);

    const getConversationsForUser = useCallback((userId: string): Conversation[] => {
        // This function becomes a simple pass-through since the useEffect handles the logic now.
        return conversations;
    }, [conversations]);

    const sendMessage = useCallback(async (senderId: string, receiverId: string, content: Message['content']) => {
        const conversationId = generateConversationId(senderId, receiverId);
        const convoRef = doc(db, "conversations", conversationId);
        
        const newMessage: Omit<Message, 'id'> & { timestamp: any } = {
            content,
            timestamp: serverTimestamp(),
            senderId,
            receiverId,
            status: 'sent',
        };
        
        const existingConvo = conversations.find(c => c.id === conversationId);
        
        if (existingConvo) {
            const updatedMessages = [...existingConvo.messages, { ...newMessage, id: `msg-${Date.now()}` }];
            await updateDoc(convoRef, { messages: updatedMessages });
        } else {
             await setDoc(convoRef, {
                participants: [senderId, receiverId],
                messages: [{...newMessage, id: `msg-${Date.now()}`}]
            });
        }

    }, [conversations]);

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        const convo = conversations.find(c => c.id === conversationId);
        if (convo) {
            const updatedMessages = convo.messages.filter(m => m.id !== messageId);
            await updateDoc(doc(db, "conversations", conversationId), { messages: updatedMessages });
        }
    }, [conversations]);

    const markConversationAsRead = useCallback(async (conversationId: string, readerId: string) => {
        if (!user) return;
        const messageUserId = user.role === UserRole.Admin ? ADMIN_VIRTUAL_USER_ID : readerId;
        
        const convo = conversations.find(c => c.id === conversationId);
        if (convo) {
            const updatedMessages = convo.messages.map(msg => 
                msg.receiverId === messageUserId && msg.status !== 'read' 
                ? { ...msg, status: 'read' as const } 
                : msg
            );
            await updateDoc(doc(db, "conversations", conversationId), { messages: updatedMessages });
        }
    }, [conversations, user]);


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
