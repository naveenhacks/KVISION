
import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageContext, generateConversationId } from '../../../context/MessageContext.tsx';
import { AuthContext } from '../../../context/AuthContext.tsx';
import { ActivityContext } from '../../../context/ActivityContext.tsx';
import { Message, User, UserRole, UploadedFile } from '../../../types.ts';
import { Send, ArrowLeft, MessageSquare, Trash2, Download, FileText, Radio } from 'lucide-react';
import Alert from '../../common/Alert.tsx';
import ConfirmationModal from '../../common/ConfirmationModal.tsx';

const ADMIN_MESSAGING_ID = 'kvision_admin_inbox';

const FileMessage: React.FC<{ file: UploadedFile }> = ({ file }) => {
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
    const { conversations, sendMessage, deleteMessage } = useContext(MessageContext);
    const { users, user: adminUser } = useContext(AuthContext);
    const { logActivity } = useContext(ActivityContext);
    const [messageText, setMessageText] = useState('');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
    
    // Broadcast State
    const [isBroadcastMode, setIsBroadcastMode] = useState(false);
    const [broadcastTarget, setBroadcastTarget] = useState<'all' | UserRole.Teacher | UserRole.Student>('all');

    const selectedUser = users.find(u => u.id === selectedUserId);
    const selectedConversationId = selectedUserId ? generateConversationId(ADMIN_MESSAGING_ID, selectedUserId) : null;
    const selectedConversationObj = conversations.find(c => c.id === selectedConversationId);
    const selectedMessages = selectedConversationObj?.messages || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedMessages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        if (isBroadcastMode) {
            const targets = users.filter(u => broadcastTarget === 'all' || u.role === broadcastTarget);
            let count = 0;
            for (const targetUser of targets) {
                // Skip self (admin)
                if (targetUser.role !== UserRole.Admin) {
                     await sendMessage(ADMIN_MESSAGING_ID, targetUser.id, { type: 'text', value: messageText.trim() });
                     count++;
                }
            }
            logActivity(`Broadcasted message to ${count} users`, adminUser?.name || 'Admin', 'info');
            setAlert({ message: `Broadcast sent to ${count} users.`, type: 'success' });
            setMessageText('');
            setIsBroadcastMode(false);
        } else if (selectedUserId) {
            sendMessage(ADMIN_MESSAGING_ID, selectedUserId, { type: 'text', value: messageText.trim() });
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
            onClick={() => { setSelectedUserId(user.id); setIsBroadcastMode(false); }}
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

    const activeConversationUsers = conversations.map(c => c.otherUser);

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
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <h2 className="text-2xl font-bold text-white">Inbox</h2>
                        <button 
                            onClick={() => { setIsBroadcastMode(true); setSelectedUserId(null); }}
                            className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors border ${isBroadcastMode ? 'bg-brand-neon-purple text-white border-brand-neon-purple' : 'bg-transparent text-brand-silver-gray border-white/10 hover:bg-white/5'}`}
                        >
                            <Radio size={18} />
                            <span>Broadcast Message</span>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2">
                        {conversations.map(({ otherUser, messages }) => (
                            <ConversationListItem 
                                key={otherUser.id} 
                                user={otherUser} 
                                lastMessage={messages[messages.length - 1] || null} 
                                isSelected={selectedUserId === otherUser.id} 
                            />
                        ))}
                    </div>
                </div>

                <div className={`w-full md:w-2/3 flex flex-col transition-transform duration-300 ${!selectedUserId && !isBroadcastMode && 'hidden md:flex'}`}>
                    {isBroadcastMode ? (
                        <div className="flex-grow flex flex-col p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Radio /> Broadcast Message</h2>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex-grow flex flex-col space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-brand-silver-gray mb-2">Target Audience</label>
                                    <div className="flex space-x-4">
                                        {['all', UserRole.Teacher, UserRole.Student].map(role => (
                                            <button 
                                                key={role}
                                                onClick={() => setBroadcastTarget(role as any)}
                                                className={`px-4 py-2 rounded-full capitalize text-sm ${broadcastTarget === role ? 'bg-brand-neon-purple text-white' : 'bg-white/10 text-brand-silver-gray'}`}
                                            >
                                                {role}s
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-brand-silver-gray mb-2">Message</label>
                                    <textarea 
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        className="w-full h-full input-field resize-none p-4"
                                        placeholder="Type your broadcast message here..."
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleSendMessage} className="bg-brand-neon-purple text-white px-8 py-3 rounded-lg hover:bg-opacity-80 flex items-center gap-2">
                                        <Send size={18} /> Send Broadcast
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : selectedUser ? (
                        <>
                            <div className="p-4 border-b border-white/10 flex items-center space-x-3">
                                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 rounded-full hover:bg-white/10">
                                    <ArrowLeft />
                                </button>
                                 <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.name}`} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                                 <div>
                                    <h3 className="font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-brand-silver-gray capitalize">{selectedUser.role}</p>
                                 </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                <AnimatePresence>
                                    {selectedMessages.map(msg => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            className={`group flex items-end gap-2 ${msg.senderId === ADMIN_MESSAGING_ID ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex items-center gap-2 ${msg.senderId === ADMIN_MESSAGING_ID ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`max-w-xs md:max-w-md rounded-2xl ${msg.senderId === ADMIN_MESSAGING_ID ? 'bg-brand-neon-purple text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
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
                                        className="flex-grow input-field"
                                    />
                                    <button type="submit" className="bg-brand-neon-purple p-3 rounded-lg text-white hover:bg-opacity-80">
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-brand-silver-gray p-4">
                             <MessageSquare size={64} className="mb-4 opacity-50"/>
                             <h2 className="text-xl font-bold text-white">Messaging Center</h2>
                             <p>Select a user or start a broadcast.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminMessaging;
