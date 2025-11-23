
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, ThemeContext } from './context/ThemeContext.tsx';
import { AuthProvider, AuthContext } from './context/AuthContext.tsx';
import { HomeworkProvider } from './context/HomeworkContext.tsx';
import { MessageProvider } from './context/MessageContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { AnnouncementProvider } from './context/AnnouncementContext.tsx';
import { LandingPageProvider } from './context/LandingPageContext.tsx';
import { ClassProvider } from './context/ClassContext.tsx';
import { ActivityProvider } from './context/ActivityContext.tsx';

import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import HomeworkPage from './pages/HomeworkPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import { UserRole } from './types.ts';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ActivityProvider>
          <ClassProvider>
            <HomeworkProvider>
              <MessageProvider>
                <NotificationProvider>
                  <AnnouncementProvider>
                    <LandingPageProvider>
                      <AppContent />
                    </LandingPageProvider>
                  </AnnouncementProvider>
                </NotificationProvider>
              </MessageProvider>
            </HomeworkProvider>
          </ClassProvider>
        </ActivityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="font-sans bg-white dark:bg-brand-deep-blue text-black dark:text-white min-h-screen transition-colors duration-500">
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/homework/new"
            element={
              <ProtectedRoute>
                <HomeworkPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/homework/edit/:id"
            element={
              <ProtectedRoute>
                <HomeworkPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


export default App;
