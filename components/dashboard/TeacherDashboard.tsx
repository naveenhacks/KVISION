import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { HomeworkContext } from '../../context/HomeworkContext';
import { User, Announcement, StudentPerformance, Homework, UserRole } from '../../types';
import { PlusCircle, Bell, UserCheck, UserPlus, X, Copy, Check, Trash2, Edit, FileText, FileImage, File, Globe, Eye, EyeOff, Shield, ShieldOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Alert from '../common/Alert';
import ContributionModal from './teacher/ContributionModal';
import ConfirmationModal from '../common/ConfirmationModal';
import AttendanceModal from './teacher/AttendanceModal';


const AddStudentModal: React.FC<{
    onClose: () => void;
    onStudentAdded: (credentials: User) => void;
    credentials: User | null;
}> = ({ onClose, onStudentAdded, credentials }) => {
    const { addStudent } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [apaarId, setApaarId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !apaarId || !password) {
            setError('Please fill out all fields.');
            return;
        }
        setLoading(true);
        setError('');
        
        setTimeout(() => {
            try {
                const newStudent = addStudent(name, apaarId, password);
                onStudentAdded(newStudent);
            } catch (err) {
                setError('Failed to create student. Please try again.');
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleCopy = () => {
        if (!credentials) return;
        const textToCopy = `Apaar ID: ${credentials.id}\nPassword: ${credentials.password}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl shadow-brand-neon-purple/30"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {credentials ? 'Student Created!' : 'Add New Student'}
                        </h2>
                        <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {credentials ? (
                        <div className="space-y-4 text-center">
                            <p className="text-brand-silver-gray">Share the following credentials with the student.</p>
                            <div className="bg-white/10 p-4 rounded-lg space-y-2 text-left">
                                <p><span className="font-semibold text-brand-silver-gray">Apaar ID:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.id}</code></p>
                                <p><span className="font-semibold text-brand-silver-gray">Password:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.password}</code></p>
                            </div>
                            <button onClick={handleCopy} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors">
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                            </button>
                             <button onClick={onClose} className="w-full px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-brand-silver-gray">Full Name</label>
                                <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple"/>
                            </div>
                            <div>
                                <label htmlFor="apaarId" className="block text-sm font-medium text-brand-silver-gray">Apaar ID</label>
                                <input id="apaarId" name="apaarId" type="text" value={apaarId} onChange={(e) => setApaarId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple"/>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-brand-silver-gray">Set Password</label>
                                <input id="password" name="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple"/>
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors disabled:bg-opacity-50 disabled:cursor-wait">
                                    {loading ? 'Creating...' : 'Create Student'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const EditStudentModal: React.FC<{
    student: User;
    onClose: () => void;
    onSave: () => void;
}> = ({ student, onClose, onSave }) => {
    const { updateUsers } = useContext(AuthContext);
    const [name, setName] = useState(student.name);
    const [password, setPassword] = useState(student.password || '');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUsers(prev => prev.map(u => u.id === student.id ? { ...u, name, password } : u));
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


const mockAnnouncements: Announcement[] = [
    { id: 'a1', title: 'Midterm Exams Schedule', content: 'Midterm exams will be held next week. Please check the portal for the detailed schedule.', date: '2 days ago', teacherName: 'Dr. Anya Sharma' },
    { id: 'a2', title: 'Science Fair Submissions', content: 'The deadline for science fair project submissions is this Friday.', date: '4 days ago', teacherName: 'Dr. Anya Sharma' },
];

const mockPerformance: StudentPerformance[] = [
    { name: 'Alex J.', attendance: 95, grade: 88 },
    { name: 'Maria G.', attendance: 92, grade: 91 },
    { name: 'Rohan V.', attendance: 98, grade: 85 },
    { name: 'Priya S.', attendance: 88, grade: 94 },
    { name: 'Sam K.', attendance: 96, grade: 78 },
];

const FileTypeIcon = ({ fileType }: { fileType?: string }) => {
    if (!fileType) return <File size={24} className="text-brand-silver-gray" />;
    if (fileType.startsWith('image/')) return <FileImage size={24} className="text-blue-400" />;
    if (fileType === 'application/pdf') return <FileText size={24} className="text-red-400" />;
    return <File size={24} className="text-brand-silver-gray" />;
};

const TeacherDashboard: React.FC = () => {
    const { user, users, updateUsers, deleteUser } = useContext(AuthContext);
    const { homeworks, deleteHomework } = useContext(HomeworkContext);
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
    const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
    const [isContribModalOpen, setContribModalOpen] = useState(false);
    const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [newStudentCredentials, setNewStudentCredentials] = useState<User | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
    const [editingStudent, setEditingStudent] = useState<User | null>(null);

    const teacherHomeworks = homeworks.filter(hw => hw.teacherId === user?.id);
    const students = users.filter(u => u.role === UserRole.Student);

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

    const confirmRemoveHomework = async () => {
        if (!homeworkToDelete) return;

        try {
            await deleteHomework(homeworkToDelete.id);
            setAlert({ message: `Homework "${homeworkToDelete.title}" removed successfully.`, type: 'success' });
        } catch (error) {
            const err = error as Error;
            setAlert({ message: err.message || 'Failed to remove homework. Please try again.', type: 'error' });
        } finally {
            setHomeworkToDelete(null);
        }
    };

    const handleBlockToggle = (studentId: string) => {
        const studentToToggle = students.find(s => s.id === studentId);
        if (studentToToggle) {
            updateUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === studentId ? { ...u, blocked: !u.blocked } : u
                )
            );
            setAlert({
                message: `Student "${studentToToggle.name}" has been ${studentToToggle.blocked ? 'unblocked' : 'blocked'}.`,
                type: 'success'
            });
        }
    };

    const handleDeleteClick = (student: User) => {
        setStudentToDelete(student);
    };

    const confirmDeleteStudent = async () => {
        if (!studentToDelete) return;
        try {
            await deleteUser(studentToDelete.id);
            setAlert({ message: `Student "${studentToDelete.name}" removed successfully.`, type: 'success' });
        } catch (error) {
            setAlert({ message: `Failed to remove student. Please try again.`, type: 'error' });
        }
        setStudentToDelete(null);
    };
    
    const handleSubmissionSuccess = () => {
        setContribModalOpen(false);
        setAlert({ message: "Content submitted for review successfully!", type: 'success' });
    }

    const handleAttendanceSubmit = (attendanceData: Record<string, 'present' | 'absent' | 'late'>) => {
        // In a real app, this would be an API call.
        console.log("Attendance Submitted:", attendanceData);
        setAttendanceModalOpen(false); // Close modal on submit
        setAlert({
            message: 'Attendance for today has been submitted successfully!',
            type: 'success',
        });
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {isAddStudentModalOpen && (
                    <AddStudentModal
                        onClose={() => { setAddStudentModalOpen(false); setNewStudentCredentials(null); }}
                        onStudentAdded={(creds) => setNewStudentCredentials(creds)}
                        credentials={newStudentCredentials}
                    />
                )}
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
                 <button onClick={() => setAddStudentModalOpen(true)} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <UserPlus /> <span>Add Student</span>
                </button>
                <button onClick={() => navigate('/dashboard/homework/new')} className="h-full flex items-center justify-center space-x-2 bg-brand-light-blue text-white p-6 rounded-xl hover:bg-brand-neon-purple transition-all duration-300 border border-brand-neon-purple/50 transform hover:-translate-y-1">
                    <PlusCircle /> <span>Upload Homework</span>
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
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Student Management</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                         <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="p-2 text-sm font-semibold text-brand-silver-gray">Name</th>
                                    <th className="p-2 text-sm font-semibold text-brand-silver-gray">Apaar ID</th>
                                    <th className="p-2 text-sm font-semibold text-brand-silver-gray">Status</th>
                                    <th className="p-2 text-sm font-semibold text-brand-silver-gray text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className={`border-b border-white/10 hover:bg-white/5 ${student.blocked ? 'opacity-60' : ''}`}>
                                        <td className="p-2 text-white">{student.name}</td>
                                        <td className="p-2 text-brand-silver-gray">{student.id}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${student.blocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {student.blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right space-x-1">
                                            <button onClick={() => setEditingStudent(student)} className="p-2 rounded-md text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Edit Student">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleBlockToggle(student.id)} className={`p-2 rounded-md transition-colors ${student.blocked ? 'text-green-400 hover:bg-green-500/20' : 'text-red-400 hover:bg-red-500/20'}`} title={student.blocked ? 'Unblock Student' : 'Block Student'}>
                                                {student.blocked ? <ShieldOff size={18} /> : <Shield size={18} />}
                                            </button>
                                            <button onClick={() => handleDeleteClick(student)} className="p-2 rounded-md text-red-400 hover:bg-red-500/20 transition-colors" title="Delete Student">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="text-center text-brand-silver-gray py-4">No students added yet.</p>}
                    </div>
                </motion.div>
            </div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Recent Announcements</h2>
                    <ul className="space-y-4">
                        {announcements.map(ann => (
                            <li key={ann.id} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white">{ann.title}</h3>
                                    <span className="text-xs text-brand-silver-gray">{ann.date}</span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">{ann.content}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Student Performance Overview</h2>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                <XAxis dataKey="name" stroke="#c0c0c0" />
                                <YAxis stroke="#c0c0c0" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e1a50', border: 'none', borderRadius: '10px' }}/>
                                <Legend />
                                <Bar dataKey="grade" fill="#8a2be2" name="Average Grade" />
                                <Bar dataKey="attendance" fill="#c471ed" name="Attendance (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default TeacherDashboard;