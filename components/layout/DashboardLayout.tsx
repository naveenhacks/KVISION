import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext.tsx';
import { ThemeContext } from '../../context/ThemeContext.tsx';
import { MessageContext } from '../../context/MessageContext.tsx';
import { NotificationContext } from '../../context/NotificationContext.tsx';
import { Sun, Moon, LogOut, MessageCircle, UserCircle, Bell } from 'lucide-react';
import { UserRole } from '../../types.ts';
import NaviAiWidget from '../common/NaviAiWidget.tsx';
import MessagingCenter from '../common/MessagingCenter.tsx';
import NotificationCenter from '../common/NotificationCenter.tsx';

const KVisionLogo = () => (
    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light-purple via-white to-brand-silver-gray">
      KVISION
    </h1>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
    >
      {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-brand-deep-blue" />}
    </button>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isBackendConnected } = useContext(AuthContext);
  const { conversations } = useContext(MessageContext);
  const { getUnreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [isMessagingCenterOpen, setIsMessagingCenterOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (isBackendConnected) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isBackendConnected]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showNaviAi = user?.role === UserRole.Student || user?.role === UserRole.Teacher;
  const showMessaging = user?.role === UserRole.Student || user?.role === UserRole.Teacher;
  const showNotifications = user?.role !== UserRole.Admin;

  const unreadMessagesCount = useMemo(() => {
    if (!user) return 0;
    return conversations.reduce((acc, convo) => acc + convo.unreadCount, 0);
  }, [conversations, user]);

  const unreadNotificationsCount = user ? getUnreadCount(user.role, user.id) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-brand-light-blue dark:bg-brand-deep-blue">
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-500 text-white text-center p-2 font-semibold text-sm overflow-hidden"
          >
            Firebase Connected Successfully ✅
          </motion.div>
        )}
      </AnimatePresence>
      {!isBackendConnected && !showSuccessMessage && (
        <div className="bg-yellow-500 text-black text-center p-2 font-semibold text-sm">
          ⚠️ Backend not connected yet
        </div>
      )}
      <header className="sticky top-0 z-50 bg-brand-deep-blue/50 dark:bg-brand-deep-blue/80 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <KVisionLogo />
            </div>
            <div className="flex items-center space-x-4">
               <Link to="/dashboard/profile" className="text-right hidden sm:flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white font-semibold">{user?.name}</p>
                    <p className="text-xs text-brand-silver-gray capitalize">{user?.role}</p>
                  </div>
                  <UserCircle className="text-brand-light-purple" />
               </Link>
              {showMessaging && (
                <button 
                  onClick={() => setIsMessagingCenterOpen(true)} 
                  className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Messages"
                >
                  <MessageCircle size={20} className="text-brand-light-purple" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              )}
               {showNotifications && (
                 <button 
                  onClick={() => setIsNotificationCenterOpen(true)} 
                  className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} className="text-brand-light-purple" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 relative">
        {children}
      </main>
      {showNaviAi && <NaviAiWidget />}
      {isMessagingCenterOpen && <MessagingCenter onClose={() => setIsMessagingCenterOpen(false)} />}
      {isNotificationCenterOpen && <NotificationCenter onClose={() => setIsNotificationCenterOpen(false)} />}
    </div>
  );
};

export default DashboardLayout;