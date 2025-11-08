
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '../types';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardPage: React.FC = () => {
  const { user } = useContext(AuthContext);

  const renderDashboard = () => {
    switch (user?.role) {
      case UserRole.Admin:
        return <AdminDashboard />;
      case UserRole.Teacher:
        return <TeacherDashboard />;
      case UserRole.Student:
        return <StudentDashboard />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return (
    <DashboardLayout>
      {user ? renderDashboard() : <div>Loading...</div>}
    </DashboardLayout>
  );
};

export default DashboardPage;
