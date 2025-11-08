
import React, { useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationContext } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext';
import { Bell, X } from 'lucide-react';
import { timeAgo } from '../../utils/timeAgo';

const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const { getNotificationsForUser, markAsRead, getUnreadCount } = useContext(NotificationContext);

    const userNotifications = user ? getNotificationsForUser(user.role, user.id) : [];

    useEffect(() => {
        // When the component mounts, mark all visible notifications as read for the current user
        if (user && getUnreadCount(user.id) > 0) {
            const timer = setTimeout(() => markAsRead(user.id), 1000); // Small delay
            return () => clearTimeout(timer);
        }
    }, [user, markAsRead, getUnreadCount]);
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-4 right-4 w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 flex justify-between items-center border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Bell />
                        <span>Notifications</span>
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                </header>

                <div className="max-h-[70vh] overflow-y-auto">
                    {userNotifications.length > 0 ? (
                        userNotifications.map(notif => (
                            <div key={notif.id} className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5">
                                <p className="font-semibold text-white">{notif.title}</p>
                                <p className="text-sm text-brand-silver-gray mt-1">{notif.content}</p>
                                <p className="text-xs text-gray-500 mt-2">{timeAgo(notif.date)}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-brand-silver-gray">
                            <p>You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NotificationCenter;
