
import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageContext, generateConversationId } from '../../../context/MessageContext';
import { AuthContext } from '../../../context/AuthContext';
import { Message, User, UserRole } from '../../../types';
import { Send, Search, ArrowLeft, MessageSquare, Trash2, Download, FileText, Image } from 'lucide-react';
import Alert from '../../common/Alert';
import ConfirmationModal from '../../common/ConfirmationModal';

const FileMessage: React.FC<{ file: Message['content']['value'] }> = ({ file }) => {
    if (file.type.startsWith('image/')) {
        return (
            <div className="p-2">
                <img src={file.dataUrl} alt={file.name} className="max-w-[200px] rounded-lg" />
            </div>
        )
    }
    return (
        <div className="flex items-center space-x-3 p-2 bg-black/20 rounded-lg">
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


const AdminMessaging: React.FC<{
    selectedUserId: string | null;
    setSelectedUserId: (userId: string | null) => void;
}> = ({ selectedUserId, setSelectedUserId }) => {
    const { conversations, sendMessage, deleteMessage, getConversationsForUser } = useContext(MessageContext);
    const { users } = useContext(AuthContext);
    const [messageText, setMessageText] = useState('');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
    
    const conversationList = getConversationsForUser('admin01');
    const selectedUser = users.find(u => u.id === selectedUserId);
    
    const selectedConversationId = selectedUserId ? generateConversationId('admin01', selectedUserId) : null;
    const selectedConversation = selectedConversationId ? conversations[selectedConversationId] || [] : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageText.trim() && selectedUserId) {
            sendMessage('admin01', selectedUserId, { type: 'text', value: messageText.trim() });
            setMessageText('');
        }
    };
    
    const handleRemoveClick = (msg: Message) => {
        setMessageToDelete(msg);
    };

    const confirmRemoveMessage = async () => {
        if (selectedConversationId && messageToDelete) {
            try {
                await deleteMessage(selectedConversationId, messageToDelete.id);
                setAlert({ message: "Message removed successfully.", type: "success" });
            } catch (error) {
                setAlert({ message: "Failed to remove message. Please try again.", type: 'error' });
            }
        }
        setMessageToDelete(null);
    };

    const ConversationListItem: React.FC<{ user: User, lastMessage: Message | null, isSelected: boolean }> = ({ user, lastMessage, isSelected }) => (
        <button 
            onClick={() => setSelectedUserId(user.id)}
            className={`w-full text-left p-3 flex items-center space-x-3 rounded-lg transition-colors ${isSelected ? 'bg-brand-neon-purple/20' : 'hover:bg-white/5'}`}
        >
            <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-white truncate">{user.name}</p>
                <p className={`text-sm truncate ${isSelected ? 'text-gray-300' : 'text-brand-silver-gray'}`}>
                    {lastMessage ? (lastMessage.content.type === 'text' ? lastMessage.content.value : 'File attachment') : "No messages yet"}
                </p>
            </div>
        </button>
    );

    const studentUsers = users.filter(u => u.role === UserRole.Student);
    const convoUsers = new Set(conversationList.map(c => c.otherUser.id));
    const usersWithNoConvo = studentUsers.filter(u => !convoUsers.has(u.id));

    return (
        <>
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
            <div className="h-[calc(100vh-16rem)] bg-brand-light-blue rounded-2xl border border-white/10 flex overflow-hidden">
                <div className={`w-full md:w-1/3 border-r border-white/10 flex flex-col transition-transform duration-300 ${selectedUserId && 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">Student Messages</h2>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2">
                        <p className="px-3 py-2 text-xs font-semibold text-brand-silver-gray uppercase">Active Chats</p>
                        {conversationList.map(({ otherUser, messages }) => (
                            <ConversationListItem 
                                key={otherUser.id} 
                                user={otherUser} 
                                lastMessage={messages[messages.length - 1] || null} 
                                isSelected={selectedUserId === otherUser.id} 
                            />
                        ))}
                         <p className="px-3 py-2 mt-4 text-xs font-semibold text-brand-silver-gray uppercase">Start a new Chat</p>
                         {usersWithNoConvo.map(user => (
                             <ConversationListItem 
                                key={user.id} 
                                user={user} 
                                lastMessage={null} 
                                isSelected={selectedUserId === user.id} 
                            />
                         ))}
                    </div>
                </div>

                <div className={`w-full md:w-2/3 flex flex-col transition-transform duration-300 ${!selectedUserId && 'hidden md:flex'}`}>
                    {selectedUser ? (
                        <>
                            <div className="p-4 border-b border-white/10 flex items-center space-x-3">
                                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 rounded-full hover:bg-white/10">
                                    <ArrowLeft />
                                </button>
                                 <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.name}`} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                                 <div>
                                    <h3 className="font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-green-400">Online</p>
                                 </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                <AnimatePresence>
                                    {selectedConversation.map(msg => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            className={`group flex items-end gap-2 ${msg.senderId === 'admin01' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex items-center gap-2 ${msg.senderId === 'admin01' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {msg.senderId !== 'admin01' && (
                                                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.name}`} alt="avatar" className="w-6 h-6 rounded-full self-start mt-1" />
                                                )}
                                                <div className={`max-w-xs md:max-w-md rounded-2xl ${msg.senderId === 'admin01' ? 'bg-brand-neon-purple text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                                                    {msg.content.type === 'text' ? (
                                                        <p className="text-sm p-3 break-words">{msg.content.value}</p>
                                                    ) : (
                                                        <FileMessage file={msg.content.value} />
                                                    )}
                                                </div>
                                                <button onClick={() => handleRemoveClick(msg)} className="opacity-0 group-hover:opacity-100 text-red-400 p-1 rounded-full hover:bg-red-500/20 transition-opacity" title="Remove message">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                 <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-white/10">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-grow bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple transition-all"
                                    />
                                    <button type="submit" className="bg-brand-neon-purple p-3 rounded-lg text-white disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-all aspect-square">
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-brand-silver-gray p-4">
                             <MessageSquare size={64} className="mb-4 opacity-50"/>
                             <h2 className="text-xl font-bold text-white">Select a conversation</h2>
                             <p>Choose a student from the list to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminMessaging;