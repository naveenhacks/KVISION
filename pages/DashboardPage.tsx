
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import AdminDashboard from '../components/dashboard/AdminDashboard.tsx';
import TeacherDashboard from '../components/dashboard/TeacherDashboard.tsx';
import StudentDashboard from '../components/dashboard/StudentDashboard.tsx';
import DashboardLayout from '../components/layout/DashboardLayout.tsx';

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
    <DashboardLayout fullWidth={user?.role === UserRole.Admin}>
      {user ? renderDashboard() : <div>Loading...</div>}
    </DashboardLayout>
  );
};

export default DashboardPage;
