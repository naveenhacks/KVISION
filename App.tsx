
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { HomeworkProvider } from './context/HomeworkContext';
import { MessageProvider } from './context/MessageContext';
import { NotificationProvider } from './context/NotificationContext';
// The new LandingPage does not use this context provider.
import { LandingPageProvider } from './context/LandingPageContext';
// FIX: The component is now a default export.
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HomeworkPage from './pages/HomeworkPage';
import ProfilePage from './pages/ProfilePage';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HomeworkProvider>
          <MessageProvider>
            <NotificationProvider>
              <LandingPageProvider>
                <AppContent />
              </LandingPageProvider>
            </NotificationProvider>
          </MessageProvider>
        </HomeworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme} font-sans`}>
      <div className="bg-white dark:bg-brand-deep-blue text-black dark:text-white min-h-screen transition-colors duration-500">
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
