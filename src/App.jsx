import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import TeacherPanel from './pages/TeacherPanel.jsx';
import StudentPanel from './pages/StudentPanel.jsx';
import { UserRole } from './types.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // This component will be used inside a route that decides which panel to show
  return children;
};


const Dashboard = () => {
    const { user } = useContext(AuthContext);

    switch (user?.role) {
        case UserRole.Admin:
            return <AdminPanel />;
        case UserRole.Teacher:
            return <TeacherPanel />;
        case UserRole.Student:
            return <StudentPanel />;
        default:
            // This case should ideally not be reached if the user is authenticated
            return <Navigate to="/" />;
    }
};

const App = () => {
  return (
    <AuthProvider>
      <div className="font-sans bg-white dark:bg-brand-deep-blue text-black dark:text-white min-h-screen transition-colors duration-500">
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/:role" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Redirect any other path to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </div>
    </AuthProvider>
  );
};

export default App;
