
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from 'react';
import { Message, User, UploadedFile, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import { apiDelete } from '../services/apiService.ts';

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
    sendMessage: (senderId: string, receiverId: string, content: Message['content']) => void;
    deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
    markConversationAsRead: (conversationId: string, readerId: string) => void;
    getConversationsForUser: (userId: string) => Conversation[];
}

export const MessageContext = createContext<MessageContextType>({
    conversations: {},
    sendMessage: () => {},
    deleteMessage: async () => {},
    markConversationAsRead: () => {},
    getConversationsForUser: () => [],
});

interface MessageProviderProps {
    children: ReactNode;
}

const MESSAGES_STORAGE_KEY = 'kvision-messages';

// A virtual user for the shared admin inbox
const ADMIN_VIRTUAL_USER: User = { id: 'kvision_admin_inbox', name: 'KVISION Admin', email: '', role: UserRole.Admin };

const getInitialMessages = (): Record<string, Message[]> => {
    try {
        const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (storedMessages) {
            return JSON.parse(storedMessages);
        }
    } catch (error) {
        console.error("Failed to parse messages from localStorage", error);
    }
    return {};
};

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const { users } = useContext(AuthContext);
    const [conversations, setConversations] = useState<Record<string, Message[]>>(getInitialMessages);

    useEffect(() => {
        try {
            // NOTE: In a real application, this would sync with a backend database (e.g., Firestore, DynamoDB).
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(conversations));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [conversations]);

    const sendMessage = useCallback((senderId: string, receiverId: string, content: Message['content']) => {
        const conversationId = generateConversationId(senderId, receiverId);
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            content,
            timestamp: new Date().toISOString(),
            senderId,
            receiverId,
            status: 'sent', // Would be 'delivered' after backend confirmation
        };
        
        // NOTE: In a real application, this would be an API call.
        // The backend would then push the new message to the receiver via WebSockets.
        setConversations(prev => {
            const updatedConvo = [...(prev[conversationId] || []), newMessage];
            return { ...prev, [conversationId]: updatedConvo };
        });
    }, []);

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        // We use messageId for the API call, as it's the unique identifier for the resource.
        await apiDelete('/api/remove/message', messageId);
        setConversations(prev => {
            const convo = prev[conversationId];
            if (!convo) return prev;
            
            const updatedConvo = convo.filter(msg => msg.id !== messageId);
            
            return { ...prev, [conversationId]: updatedConvo };
        });
    }, []);

    const markConversationAsRead = useCallback((conversationId: string, readerId: string) => {
        setConversations(prev => {
            const convo = prev[conversationId];
            if (!convo) return prev;

            const updatedConvo = convo.map(msg => 
                msg.receiverId === readerId && msg.status !== 'read' 
                ? { ...msg, status: 'read' as const } 
                : msg
            );
            return { ...prev, [conversationId]: updatedConvo };
        });
    }, []);

    const getConversationsForUser = useCallback((userId: string): Conversation[] => {
        const allUsers = [...users, ADMIN_VIRTUAL_USER]; // Include virtual admin for lookups

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

        // Sort by most recent message
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