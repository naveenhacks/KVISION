import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthChanged, login as authLogin, logout as authLogout, registerUser } from '../firebase/authService.js';
import { getUser, deleteUserFromDB, updateUser as updateUserData } from '../firebase/dataService.js';
import { UserRole } from '../types.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUser(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    const userData = await authLogin(email, password);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const addStudent = useCallback(async (name, apaarId, password) => {
      const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;
      const newStudentData = {
          id: apaarId,
          name,
          email: studentEmail,
          role: UserRole.Student,
          blocked: false,
          studentData: { courses: ['General Science', 'Mathematics', 'English'], attendance: 100, overallGrade: 0 }
      };
      return await registerUser(studentEmail, password, newStudentData);
  }, []);

  const addTeacher = useCallback(async (name, email, password) => {
      const newId = `t-${Date.now().toString().slice(-6)}`;
      const newTeacherData = {
          id: newId, name, email, role: UserRole.Teacher
      };
      return await registerUser(email, password, newTeacherData);
  }, []);

  const deleteUser = useCallback(async (userUid) => {
    await deleteUserFromDB(userUid);
  }, []);

  const updateUser = useCallback(async (userUid, data) => {
      await updateUserData(userUid, data);
  }, []);


  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUser
  }), [user, loading, login, logout, addStudent, addTeacher, deleteUser, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
