

import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageContext, Conversation } from '../../context/MessageContext.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';
import { Message, User, UserRole, UploadedFile } from '../../types.ts';
import { Send, Search, X, MessageSquare, Paperclip, FileText, Image, Download, Check, CheckCheck, Trash2 } from 'lucide-react';
import Alert from './Alert.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
    if (status === 'read') return <CheckCheck size={16} className="text-blue-400" />;
    if (status === 'delivered') return <CheckCheck size={16} />;
    return <Check size={16} />;
};

const FileMessage: React.FC<{ file: UploadedFile, isSender: boolean }> = ({ file, isSender }) => {
    if (file.type.startsWith('image/')) {
        return (
            <div className="p-1">
                <img src={file.dataUrl} alt={file.name} className="max-w-[200px] rounded-lg cursor-pointer" onClick={() => window.open(file.dataUrl)}/>
            </div>
        )
    }
    return (
        <div className={`flex items-center space-x-3 p-2 rounded-lg ${isSender ? 'bg-brand-neon-purple/80' : 'bg-black/20'}`}>
            <FileText size={28} className="text-brand-silver-gray flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-brand-silver-gray">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <a href={file.dataUrl} download={file.name} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Download size={18} />
            </a>
        </div>
    );
};

const MessagingCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, users } = useContext(AuthContext);
    const { conversations, sendMessage, markConversationAsRead, deleteMessage } = useContext(MessageContext);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [fileToSend, setFileToSend] = useState<File | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

    const contacts = useMemo(() => {
        if (!user) return [];
        const roleToList = user.role === UserRole.Student ? UserRole.Teacher : UserRole.Student;
        return users.filter(u => u.role === roleToList);
    }, [user, users]);

    const displayedConversations = useMemo(() => {
        const activeConvoUserIds = new Set(conversations.map(c => c.otherUser.id));
        const newContacts = contacts.filter(c => !activeConvoUserIds.has(c.id));

        const filteredConversations = conversations.filter(c => c.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const filteredNewContacts = newContacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return { active: filteredConversations, new: filteredNewContacts };

    }, [conversations, contacts, searchTerm]);


    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.otherUser.id === selectedUserId)
    }, [conversations, selectedUserId]);

    const selectedUser = useMemo(() => {
        return users.find(u => u.id === selectedUserId);
    }, [users, selectedUserId]);

    useEffect(() => {
        if (selectedConversation && user) {
            markConversationAsRead(selectedConversation.id, user.id);
        }
    }, [selectedConversation, user, markConversationAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversation]);
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setAlert({ message: 'File is too large. Max 5MB.', type: 'error' });
                return;
            }
            setFileToSend(file);
        }
    };

    const handleSendMessage = () => {
        if (!user || !selectedUserId) return;
        if (!messageText.trim() && !fileToSend) return;

        if (fileToSend) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadedFile: UploadedFile = {
                    name: fileToSend.name,
                    type: fileToSend.type,
                    size: fileToSend.size,
                    dataUrl: e.target?.result as string,
                };
                sendMessage(user.id, selectedUserId, { type: 'file', value: uploadedFile });
            };
            reader.readAsDataURL(fileToSend);
        }

        if (messageText.trim()) {
            sendMessage(user.id, selectedUserId, { type: 'text', value: messageText.trim() });
        }

        setMessageText('');
        setFileToSend(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleRemoveClick = (message: Message) => {
        setMessageToDelete(message);
    };

    const confirmRemoveMessage = async () => {
        if (selectedConversation && messageToDelete) {
            try {
                await deleteMessage(selectedConversation.id, messageToDelete.id);
                setAlert({ message: "Message removed successfully.", type: "success" });
            } catch (error) {
                setAlert({ message: "Failed to remove message. Please try again.", type: 'error' });
            }
        }
        setMessageToDelete(null);
    };

    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-brand-deep-blue/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <ConfirmationModal
                isOpen={!!messageToDelete}
                onClose={() => setMessageToDelete(null)}
                onConfirm={confirmRemoveMessage}
                title="Remove Message"
                message="Are you sure you want to permanently remove this message?"
                confirmText="Remove"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-5xl h-[90vh] max-h-[800px] bg-white dark:bg-brand-light-blue rounded-2xl shadow-2xl flex border border-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Conversation List */}
                <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-white/10 flex flex-col transition-transform duration-300 ${selectedUserId && 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-black dark:text-white">Messages</h2>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-brand-silver-gray" size={20} />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-2 pl-10 text-black dark:text-white" />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2">
                        {displayedConversations.active.length > 0 && <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-brand-silver-gray uppercase">Active Chats</p>}
                        {displayedConversations.active.map(convo => (
                            <ConversationListItem key={convo.id} convo={convo} isSelected={selectedUserId === convo.otherUser.id} onClick={() => setSelectedUserId(convo.otherUser.id)} />
                        ))}

                        {displayedConversations.new.length > 0 && <p className="px-3 py-2 mt-2 text-xs font-semibold text-gray-500 dark:text-brand-silver-gray uppercase">New Conversation</p>}
                        {displayedConversations.new.map(contact => (
                            <NewContactItem key={contact.id} user={contact} onClick={() => setSelectedUserId(contact.id)} />
                        ))}
                    </div>
                </div>
                {/* Chat Window */}
                <div className={`w-full md:w-2/3 flex flex-col transition-transform duration-300 ${!selectedUserId && 'hidden md:flex'}`}>
                    {selectedUser ? (
                         <>
                            <div className="p-3.5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.name}`} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-black dark:text-white">{selectedUser.name}</h3>
                                        <p className="text-xs text-green-500 dark:text-green-400">Online</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-gray-500 dark:text-brand-silver-gray rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" aria-label="Close chat">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-brand-deep-blue min-h-0">
                                <AnimatePresence initial={false}>
                                    {(selectedConversation?.messages || []).map((msg) => (
                                        <motion.div
                                            key={msg.id} layout
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            className={`group flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.senderId !== user.id && <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.name}`} alt="avatar" className="w-6 h-6 rounded-full mb-1 flex-shrink-0" />}
                                            
                                            {msg.senderId === user.id && (
                                                <button onClick={() => handleRemoveClick(msg)} className="shrink-0 opacity-0 group-hover:opacity-100 text-red-400 p-1 rounded-full hover:bg-red-500/20 transition-opacity self-end mb-1" title="Remove message">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            <div className={`max-w-xs md:max-w-md rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-brand-neon-purple text-white rounded-br-none' : 'bg-white dark:bg-white/10 text-black dark:text-white rounded-bl-none'}`}>
                                                {msg.content.type === 'text' ? (
                                                    <p className="p-3 break-words">{msg.content.value}</p>
                                                ) : (
                                                    <FileMessage file={msg.content.value} isSender={msg.senderId === user.id} />
                                                )}
                                            </div>

                                            {msg.senderId === user.id && (
                                                <div className="shrink-0 self-end mb-1 text-gray-400 dark:text-brand-silver-gray">
                                                    <MessageStatus status={msg.status}/>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0 bg-white dark:bg-brand-light-blue">
                                {fileToSend && (
                                    <div className="mb-2 p-2 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center space-x-2 overflow-hidden">
                                            <FileText className="text-brand-light-purple flex-shrink-0" />
                                            <p className="text-sm truncate">{fileToSend.name}</p>
                                        </div>
                                        <button onClick={() => { setFileToSend(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
                                    </div>
                                )}
                                <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-lg text-gray-600 dark:text-brand-silver-gray bg-gray-100 dark:bg-brand-deep-blue hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-grow min-w-0 bg-gray-100 dark:bg-brand-deep-blue border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple transition-all"
                                    />
                                    <button type="submit" className="bg-brand-neon-purple p-3 rounded-lg text-white disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-all aspect-square">
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-brand-silver-gray p-4">
                            <MessageSquare size={64} className="mb-4 opacity-50"/>
                            <h2 className="text-xl font-bold text-black dark:text-white">Select a conversation</h2>
                            <p>Choose a person from the list to start chatting.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ConversationListItem: React.FC<{ convo: Conversation, isSelected: boolean, onClick: () => void}> = ({ convo, isSelected, onClick }) => {
    const lastMessage = convo.messages[convo.messages.length-1];
    return (
        <button onClick={onClick} className={`w-full text-left p-3 flex items-center space-x-3 rounded-lg transition-colors ${isSelected ? 'bg-brand-neon-purple/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
            <div className="relative flex-shrink-0">
                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${convo.otherUser.name}`} alt={convo.otherUser.name} className="w-12 h-12 rounded-full" />
                {convo.unreadCount > 0 && <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{convo.unreadCount}</span>}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-black dark:text-white truncate">{convo.otherUser.name}</p>
                <p className={`text-sm truncate ${isSelected ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-brand-silver-gray'}`}>
                    {lastMessage ? (lastMessage.content.type === 'text' ? lastMessage.content.value : 'File attachment') : `Start a conversation...`}
                </p>
            </div>
        </button>
    )
};

const NewContactItem: React.FC<{ user: User, onClick: () => void}> = ({ user, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-12 h-12 rounded-full" />
        <div className="flex-grow overflow-hidden">
            <p className="font-bold text-black dark:text-white truncate">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-brand-silver-gray truncate italic">
                {`Start a conversation...`}
            </p>
        </div>
    </button>
);

export default MessagingCenter;