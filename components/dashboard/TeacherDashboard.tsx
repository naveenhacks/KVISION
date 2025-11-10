import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.tsx';
import { HomeworkContext } from '../../context/HomeworkContext.tsx';
import { AnnouncementContext } from '../../context/AnnouncementContext.tsx';
import { User, Announcement, StudentPerformance, Homework, UserRole } from '../../types.ts';
import { PlusCircle, Bell, UserCheck, UserPlus, X, Copy, Check, Trash2, Edit, FileText, FileImage, File, Globe, Eye, EyeOff, Shield, ShieldOff, Megaphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Alert from '../common/Alert.tsx';
import ContributionModal from './teacher/ContributionModal.tsx';
import ConfirmationModal from '../common/ConfirmationModal.tsx';
import AttendanceModal from './teacher/AttendanceModal.tsx';


const EditStudentModal: React.FC<{
    student: User;
    onClose: () => void;
    onSave: () => void;
}> = ({ student, onClose, onSave }) => {
    const { updateUser } = useContext(AuthContext);
    const [name, setName] = useState(student.name);
    const [password, setPassword] = useState(student.password || '');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser(student.id, { name, password });
        onSave();
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Edit Student</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-silver-gray">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-silver-gray">Apaar ID (Read-only)</label>
                            <input type="text" value={student.id} readOnly className="mt-1 w-full input-field bg-white/5 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-silver-gray">Password</label>
                             <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full input-field pr-10" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-brand-silver-gray">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80">Save Changes</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AnnouncementModal: React.FC<{
    onClose: () => void;
    onSave: (title: string, content: string) => void;
}> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (title.trim() && content.trim()) {
            onSave(title, content);
            onClose();
        }
    };
    
    return (
         <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Post Announcement</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full input-field" />
                        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." rows={4} className="w-full input-field" />
                    </div>
                    <div className="pt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80">Post</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const FileTypeIcon = ({ fileType }: { fileType?: string }) => {
    if (!fileType) return <File size={24} className="text-brand-silver-gray" />;
    if (fileType.startsWith('image/')) return <FileImage size={24} className="text-blue-400" />;
    if (fileType === 'application/pdf') return <FileText size={24} className="text-red-400" />;
    return <File size={24} className="text-brand-silver-gray" />;
};

const TeacherDashboard: React.FC = () => {
    const { user, users, updateUser, deleteUser } = useContext(AuthContext);
    const { homeworks, deleteHomework } = useContext(HomeworkContext);
    const { announcements, addAnnouncement } = useContext(AnnouncementContext);
    const navigate = useNavigate();
    const [isContribModalOpen, setContribModalOpen] = useState(false);
    const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
    const [editingStudent, setEditingStudent] = useState<User | null>(null);

    const teacherHomeworks = homeworks.filter(hw => hw.teacherId === user?.id);
    const students = users.filter(u => u.role === UserRole.Student);
    const teacherAnnouncements = announcements.filter(ann => ann.teacherName === user?.name);

    const studentPerformanceData = useMemo((): StudentPerformance[] => {
        return students
            .map(student => {
                const nameParts = student.name.split(' ');
                const displayName = nameParts.length > 1 
                    ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.` 
                    : nameParts[0];
                return {
                    name: displayName,
                    attendance: student.studentData?.attendance ?? 0,
                    grade: student.studentData?.overallGrade ?? 0,
                };
            })
            .slice(0, 5); // Keep the chart clean with a max of 5 students
    }, [students]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    
    const handleRemoveClick = (homework: Homework) => {
        setHomeworkToDelete(homework);
    };

    const confirmRemoveHomework = () => {
        if (!homeworkToDelete) return;
        deleteHomework(homeworkToDelete.id)
            .then(() => {
                setAlert({ message: `Homework "${homeworkToDelete.title}" removed successfully.`, type: 'success' });
            })
            .catch((error) => {
                 setAlert({ message: error.message || 'Failed to remove homework.', type: 'error' });
            })
            .finally(() => {
                setHomeworkToDelete(null);
            });
    };

    const handleBlockToggle = (studentId: string) => {
        const studentToToggle = students.find(s => s.id === studentId);
        if (studentToToggle) {
            updateUser(studentId, { blocked: !studentToToggle.blocked });
            setAlert({
                message: `Student "${studentToToggle.name}" has been ${studentToToggle.blocked ? 'unblocked' : 'blocked'}.`,
                type: 'success'
            });
        }
    };

    const handleDeleteClick = (student: User) => {
        setStudentToDelete(student);
    };

    const confirmDeleteStudent = () => {
        if (!studentToDelete) return;
        deleteUser(studentToDelete.id, studentToDelete.uid)
            .then(() => {
                setAlert({ message: `Student "${studentToDelete.name}" removed successfully.`, type: 'success' });
            })
            .catch(() => {
                setAlert({ message: `Failed to remove student.`, type: 'error' });
            })
            .finally(() => {
                setStudentToDelete(null);
            });
    };
    
    const handleSubmissionSuccess = () => {
        setContribModalOpen(false);
        setAlert({ message: "Content submitted for review successfully!", type: "success" });
    }

    const handleAttendanceSubmit = (attendanceData: Record<string, 'present' | 'absent' | 'late'>) => {
        console.log("Attendance Submitted:", attendanceData);
        setAttendanceModalOpen(false);
        setAlert({
            message: 'Attendance for today has been submitted successfully!',
            type: 'success',
        });
    };

    const handleAddAnnouncement = (title: string, content: string) => {
        if (user) {
            addAnnouncement({ title, content, teacherName: user.name });
            setAlert({ message: 'Announcement posted successfully!', type: 'success' });
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {isContribModalOpen && (
                    <ContributionModal
                        onClose={() => setContribModalOpen(false)}
                        onSuccess={handleSubmissionSuccess}
                    />
                )}
                {isAttendanceModalOpen && (
                    <AttendanceModal
                        onClose={() => setAttendanceModalOpen(false)}
                        students={students}
                        onSubmit={handleAttendanceSubmit}
                    />
                )}
                {isAnnouncementModalOpen && (
                    <AnnouncementModal
                        onClose={() => setAnnouncementModalOpen(false)}
                        onSave={handleAddAnnouncement}
                    />
                )}
                {editingStudent && (
                    <EditStudentModal
                        student={editingStudent}
                        onClose={() => setEditingStudent(null)}
                        onSave={() => setAlert({ message: 'Student details updated successfully.', type: 'success' })}
                    />
                )}
            </AnimatePresence>
            <ConfirmationModal
                isOpen={!!homeworkToDelete}
                onClose={() => setHomeworkToDelete(null)}
                onConfirm={confirmRemoveHomework}
                title="Remove Homework"
                message={`Are you sure you want to permanently remove the homework "${homeworkToDelete?.title}"? This action cannot be undone.`}
                confirmText="Remove Homework"
            />
            <ConfirmationModal
                isOpen={!!studentToDelete}
                onClose={() => setStudentToDelete(null)}
                onConfirm={confirmDeleteStudent}
                title="Delete Student"
                message={`Are you sure you want to permanently delete the student "${studentToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete Student"
            />


            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">
                Teacher Dashboard - Welcome, {user?.name}!
            </motion.h1>

            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => navigate('/dashboard/homework/new')} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <PlusCircle /> <span>Upload Homework</span>
                </button>
                <button onClick={() => setAnnouncementModalOpen(true)} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <Megaphone /> <span>Post Announcement</span>
                </button>
                <button onClick={() => setContribModalOpen(true)} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <Globe /> <span>Contribute</span>
                </button>
                <button onClick={() => setAttendanceModalOpen(true)} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <UserCheck /> <span>Take Attendance</span>
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-1 bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Homework Management</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {teacherHomeworks.length > 0 ? (
                            <AnimatePresence>
                                {teacherHomeworks.map(hw => (
                                    <motion.div
                                        key={hw.id}
                                        layout
                                        variants={itemVariants}
                                        exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors gap-4"
                                    >
                                        <div className="flex items-start space-x-4 mb-3 md:mb-0">
                                            <FileTypeIcon fileType={hw.file?.type} />
                                            <div>
                                                <p className="font-bold text-white">{hw.title}</p>
                                                <p className="text-sm text-brand-silver-gray">{hw.course} - Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 self-end md:self-center">
                                            <button onClick={() => navigate(`/dashboard/homework/edit/${hw.id}`)} className="p-2 rounded-md text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Edit Homework"><Edit size={18} /></button>
                                            <button onClick={() => handleRemoveClick(hw)} className="p-2 rounded-md text-red-400 hover:bg-red-500/20 transition-colors" title="Remove Homework"><Trash2 size={18} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <p className="text-center text-brand-silver-gray py-4">No homework uploaded yet.</p>
                        )}
                    </div>
                </motion.div>
                
                 <motion.div variants={itemVariants} className="lg:col-span-1 bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Student Performance</h2>
                     <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#c0c0c0" fontSize={12} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8a2be2" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#c471ed" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e1a50', border: 'none', borderRadius: '10px' }}/>
                                <Legend />
                                <Bar yAxisId="left" dataKey="attendance" fill="#8a2be2" name="Attendance (%)" />
                                <Bar yAxisId="right" dataKey="grade" fill="#c471ed" name="Grade (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Student Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="p-3 text-sm font-semibold text-brand-silver-gray">Name</th>
                                    <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden sm:table-cell">Apaar ID</th>
                                    <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden md:table-cell">Status</th>
                                    <th className="p-3 text-sm font-semibold text-brand-silver-gray text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className={`border-b border-white/10 hover:bg-white/5 transition-colors ${student.blocked ? 'opacity-50' : ''}`}>
                                        <td className="p-3 text-white font-medium">{student.name}</td>
                                        <td className="p-3 text-gray-300 hidden sm:table-cell">{student.id}</td>
                                        <td className="p-3 hidden md:table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${student.blocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {student.blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-3 flex items-center justify-end space-x-1">
                                            <button onClick={() => handleBlockToggle(student.id)} className={`${student.blocked ? 'text-green-400' : 'text-red-400'} p-2 rounded-md hover:bg-red-400/10`} title={student.blocked ? 'Unblock' : 'Block'}>
                                                {student.blocked ? <ShieldOff size={16}/> : <Shield size={16}/>}
                                            </button>
                                            <button onClick={() => setEditingStudent(student)} className="text-yellow-400 p-2 rounded-md hover:bg-yellow-400/10" title="Edit"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteClick(student)} className="text-red-400 p-2 rounded-md hover:bg-red-400/10" title="Remove"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {students.length === 0 && <p className="text-center text-brand-silver-gray py-8">No students added yet.</p>}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;