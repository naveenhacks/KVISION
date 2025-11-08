
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { HomeworkContext } from '../../context/HomeworkContext';
import { NotificationContext } from '../../context/NotificationContext';
import { User, UserRole, Homework, Notification } from '../../types';
import AdminMessaging from './messaging/AdminMessaging';
import Alert from '../common/Alert';
import AdminHomepageManager from './admin/HomepageManager';
import ConfirmationModal from '../common/ConfirmationModal';
import { 
    Users, UserPlus, Trash2, Edit, X, Copy, Check, CheckCircle, ShieldAlert, 
    LayoutDashboard, GraduationCap, Presentation, BookMarked, MessageSquare, Bell, Settings, Menu, Search,
    Shield, ShieldOff, Globe, FileText, Eye, EyeOff, Send
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- HELPER & REUSABLE COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-brand-light-blue p-5 rounded-xl border border-white/10 flex items-center space-x-4 transform transition-transform hover:-translate-y-1 h-full">
        <div className={`p-3 bg-${color}-500/20 rounded-full`}>{React.cloneElement(icon as React.ReactElement, { className: `text-${color}-400` })}</div>
        <div>
            <p className="text-brand-silver-gray text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'homepage', label: 'Homepage Mngmt', icon: <Globe size={20} /> },
    { id: 'teachers', label: 'Teacher Management', icon: <Presentation size={20} /> },
    { id: 'students', label: 'Student Management', icon: <GraduationCap size={20} /> },
    { id: 'homework', label: 'Homework Control', icon: <BookMarked size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};


// --- SIDEBAR COMPONENT ---
const AdminSidebar: React.FC<{ 
    activeView: string; 
    setActiveView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const { user } = useContext(AuthContext);

    const handleNavClick = (viewId: string) => {
        setActiveView(viewId);
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <>
            <motion.div
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="fixed top-0 left-0 h-full w-64 bg-brand-light-blue/80 dark:bg-brand-deep-blue/80 backdrop-blur-lg border-r border-white/10 z-40 lg:translate-x-0"
            >
                <div className="p-4 flex flex-col h-full">
                    {/* Profile Section */}
                    <div className="flex items-center space-x-3 mb-8 p-2">
                        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name || 'Admin'}`} alt="Admin" className="w-12 h-12 rounded-full border-2 border-brand-neon-purple"/>
                        <div>
                            <p className="font-bold text-white text-md leading-tight">{user?.name}</p>
                            <p className="text-xs text-brand-silver-gray">{user?.email}</p>
                        </div>
                    </div>
                    {/* Navigation */}
                    <nav className="flex-grow">
                        <ul>
                            {navItems.map(item => (
                                <li key={item.id}>
                                    <button 
                                        onClick={() => handleNavClick(item.id)}
                                        className={`flex items-center w-full space-x-3 p-3 my-1 rounded-lg transition-all text-sm font-medium ${
                                            activeView === item.id 
                                            ? 'bg-brand-neon-purple/20 text-white' 
                                            : 'text-brand-silver-gray hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </motion.div>
            {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}
        </>
    );
};

// --- MODAL & PAGE COMPONENTS ---

const TeacherModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => User | void;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<User> | null>(null);
    const [credentials, setCredentials] = useState<User | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setFormData(user);
        setCredentials(null);
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData && formData.name && formData.email && formData.password) {
            if (mode === 'add') {
                const newTeacher = onSave({ ...formData, role: UserRole.Teacher });
                if (newTeacher) setCredentials(newTeacher as User);
            } else {
                onSave(formData);
                onClose();
            }
        }
    };
    
    const handleCopy = () => {
        if (!credentials) return;
        const textToCopy = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setCredentials(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl shadow-brand-neon-purple/30" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{credentials ? 'Teacher Created!' : (mode === 'add' ? 'Add New Teacher' : 'Edit Teacher')}</h2>
                        <button onClick={handleClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10 hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    {credentials ? (
                         <div className="space-y-4 text-center">
                            <p className="text-brand-silver-gray">Share these credentials with the new teacher.</p>
                            <div className="bg-white/10 p-4 rounded-lg space-y-2 text-left text-sm">
                                <p><span className="font-semibold text-brand-silver-gray">Email:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.email}</code></p>
                                <p><span className="font-semibold text-brand-silver-gray">Password:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.password}</code></p>
                            </div>
                            <button onClick={handleCopy} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors">
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                            </button>
                            <button onClick={handleClose} className="w-full px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" type="text" placeholder="Full Name" value={formData?.name || ''} onChange={handleChange} required className="w-full input-field"/>
                            <input name="email" type="email" placeholder="Email Address" value={formData?.email || ''} onChange={handleChange} required className="w-full input-field"/>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData?.password || ''} onChange={handleChange} required className="w-full input-field pr-10"/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-brand-silver-gray"><EyeOff size={18} /></button>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors">Save</button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const StudentModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => User | void;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<User> | null>(null);
    const [credentials, setCredentials] = useState<User | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setFormData(user);
        setCredentials(null);
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData && formData.name && formData.id && formData.password) {
            if (mode === 'add') {
                const newStudent = onSave({ ...formData, role: UserRole.Student });
                if (newStudent) setCredentials(newStudent as User);
            } else {
                onSave(formData);
                onClose();
            }
        }
    };
    
    const handleCopy = () => {
        if (!credentials) return;
        const textToCopy = `Student ID: ${credentials.id}\nPassword: ${credentials.password}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setCredentials(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{credentials ? 'Student Created!' : (mode === 'add' ? 'Add New Student' : 'Edit Student')}</h2>
                        <button onClick={handleClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                    </div>
                    {credentials ? (
                         <div className="space-y-4 text-center">
                            <p className="text-brand-silver-gray">Share these credentials with the new student.</p>
                            <div className="bg-white/10 p-4 rounded-lg space-y-2 text-left text-sm">
                                <p><span className="font-semibold text-brand-silver-gray">Student ID:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.id}</code></p>
                                <p><span className="font-semibold text-brand-silver-gray">Password:</span> <code className="bg-black/20 px-2 py-1 rounded text-brand-light-purple">{credentials.password}</code></p>
                            </div>
                            <button onClick={handleCopy} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white bg-brand-neon-purple"><Copy size={20} /><span>Copy Credentials</span></button>
                            <button onClick={handleClose} className="w-full px-4 py-2 rounded-lg text-white bg-white/10">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" type="text" placeholder="Full Name" value={formData?.name || ''} onChange={handleChange} required className="w-full input-field"/>
                            <input name="id" type="text" placeholder="Student ID (Apaar ID)" value={formData?.id || ''} onChange={handleChange} required className="w-full input-field" disabled={mode === 'edit'}/>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData?.password || ''} onChange={handleChange} required className="w-full input-field pr-10"/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-brand-silver-gray"><EyeOff size={18} /></button>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-white bg-white/10">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-brand-neon-purple">Save</button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const AdminOverview = () => {
    const { users } = useContext(AuthContext);
    const { homeworks } = useContext(HomeworkContext);
    const studentCount = users.filter(u => u.role === UserRole.Student).length;
    const teacherCount = users.filter(u => u.role === UserRole.Teacher).length;

    const userDistributionData = [
        { name: 'Students', value: studentCount },
        { name: 'Teachers', value: teacherCount },
    ];
    const COLORS = ['#8a2be2', '#c471ed'];
    
    const recentActivity = [
        { id: 1, user: 'Dr. Evelyn Reed', action: 'uploaded homework "Calculus Worksheet"', time: '2h ago', icon: <BookMarked className="text-blue-400" /> },
        { id: 2, user: 'Alex Johnson', action: 'submitted "Physics Lab Report"', time: '5h ago', icon: <CheckCircle className="text-green-400" /> },
        { id: 3, user: 'Admin', action: 'added new teacher "Mr. David Chen"', time: '1d ago', icon: <UserPlus className="text-purple-400" /> },
        { id: 4, user: 'Admin', action: 'removed student "Old Student"', time: '2d ago', icon: <Trash2 className="text-red-400" /> },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={studentCount} icon={<GraduationCap size={24} />} color="purple" />
                <StatCard title="Total Teachers" value={teacherCount} icon={<Presentation size={24} />} color="indigo" />
                <StatCard title="Homeworks" value={homeworks.length} icon={<BookMarked size={24} />} color="blue" />
                <StatCard title="Courses" value="24" icon={<BookMarked size={24} />} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.map(item => (
                            <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-white/5">
                                <div className="p-2 bg-white/10 rounded-full">{item.icon}</div>
                                <div>
                                    <p className="text-sm text-white"><span className="font-bold">{item.user}</span> {item.action}</p>
                                    <p className="text-xs text-brand-silver-gray">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">User Distribution</h2>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={userDistributionData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e1a50', border: 'none', borderRadius: '10px' }}/>
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserManagementTable: React.FC<{
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onToggleBlock: (userId: string) => void;
    onMessage?: (userId: string) => void;
}> = ({ users, onEdit, onDelete, onToggleBlock, onMessage }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-white/20">
                    <th className="p-3 text-sm font-semibold text-brand-silver-gray">Name</th>
                    <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden md:table-cell">ID / Email</th>
                    <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden sm:table-cell">Status</th>
                    <th className="p-3 text-sm font-semibold text-brand-silver-gray text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <AnimatePresence>
                    {users.map(user => (
                        <motion.tr key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`border-b border-white/10 hover:bg-white/5 ${user.blocked ? 'opacity-50' : ''}`}>
                            <td className="p-3 text-white font-medium">{user.name}</td>
                            <td className="p-3 text-gray-300 hidden md:table-cell">{user.email}</td>
                            <td className="p-3 hidden sm:table-cell">
                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${user.blocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{user.blocked ? 'Blocked' : 'Active'}</span>
                            </td>
                            <td className="p-3 flex items-center justify-end space-x-1">
                                {onMessage && <button onClick={() => onMessage(user.id)} className="text-blue-400 p-2 rounded-md hover:bg-blue-400/10" title="Message User"><MessageSquare size={16}/></button>}
                                <button onClick={() => onToggleBlock(user.id)} className={`${user.blocked ? 'text-green-400' : 'text-red-400'} p-2 rounded-md hover:bg-red-400/10`} title={user.blocked ? 'Unblock' : 'Block'}>{user.blocked ? <ShieldOff size={16}/> : <Shield size={16}/>}</button>
                                <button onClick={() => onEdit(user)} className="text-yellow-400 p-2 rounded-md hover:bg-yellow-400/10" title="Edit"><Edit size={16}/></button>
                                <button onClick={() => onDelete(user)} className="text-red-400 p-2 rounded-md hover:bg-red-400/10" title="Remove"><Trash2 size={16}/></button>
                            </td>
                        </motion.tr>
                    ))}
                </AnimatePresence>
            </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-brand-silver-gray py-8">No users found.</p>}
    </div>
);


const AdminUserManagement: React.FC<{ onMessageUser: (userId: string) => void }> = ({ onMessageUser }) => {
    const { users, updateUsers, addTeacher, deleteUser } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleAddUser = () => {
        setModalMode('add');
        setCurrentUser({ name: '', email: '', role: UserRole.Teacher, password: '' });
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setModalMode('edit');
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleRemoveClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmRemoveUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.id);
            setAlert({ message: `User "${userToDelete.name}" removed successfully.`, type: 'success' });
        } catch (error) {
            const err = error as Error;
            setAlert({ message: err.message || `Failed to remove user. Please try again.`, type: 'error' });
        }
        setUserToDelete(null);
    };
    
    const handleToggleBlock = (userId: string) => {
        const userToBlock = users.find(u => u.id === userId);
        if (userToBlock) {
            updateUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === userId ? { ...u, blocked: !u.blocked } : u
                )
            );
            setAlert({ message: `User "${userToBlock.name}" has been ${userToBlock.blocked ? 'unblocked' : 'blocked'}.`, type: 'success' });
        }
    };

    const handleSaveUser = (userData: Partial<User>): User | void => {
        if (modalMode === 'add') {
            if (userData.role === UserRole.Teacher && userData.name && userData.email && userData.password) {
                const newTeacher = addTeacher(userData.name, userData.email, userData.password);
                setAlert({ message: `Teacher "${newTeacher.name}" added successfully.`, type: 'success' });
                return newTeacher;
            }
        } else { // Edit mode
            updateUsers(prevUsers => prevUsers.map(u => (u.id === userData.id ? { ...u, ...userData } as User : u)));
            setAlert({ message: `User "${userData.name}" updated successfully.`, type: 'success' });
            setIsModalOpen(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => roleFilter === 'all' || user.role === roleFilter)
            .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, roleFilter, searchTerm]);

    return (
        <div className="space-y-6">
             <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmRemoveUser}
                title="Remove User"
                message={`Are you sure you want to permanently remove ${userToDelete?.name}? This action cannot be undone.`}
                confirmText="Remove User"
            />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <div className="bg-brand-light-blue p-4 sm:p-6 rounded-xl border border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-silver-gray" size={20} />
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-64 input-field pl-10" />
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-full sm:w-auto">
                            <option value="all">All Roles</option>
                            <option value={UserRole.Student}>Students</option>
                            <option value={UserRole.Teacher}>Teachers</option>
                        </select>
                         <button onClick={handleAddUser} className="flex items-center justify-center space-x-2 bg-brand-neon-purple text-white px-4 py-2.5 rounded-lg hover:bg-opacity-80 transition-colors text-sm font-semibold whitespace-nowrap">
                            <UserPlus size={18}/> <span>Add Teacher</span>
                        </button>
                    </div>
                </div>
                <UserManagementTable 
                    users={filteredUsers} 
                    onEdit={handleEditUser} 
                    onDelete={handleRemoveClick}
                    onToggleBlock={handleToggleBlock}
                    onMessage={(userId) => users.find(u => u.id === userId)?.role === UserRole.Student ? onMessageUser(userId) : undefined}
                />
            </div>
            <TeacherModal isOpen={isModalOpen} mode={modalMode} user={currentUser} onSave={handleSaveUser} onClose={() => setIsModalOpen(false)}/>
        </div>
    );
};

const HomeworkControl = () => {
    const { homeworks, deleteHomework } = useContext(HomeworkContext);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Homework | null>(null);

    const handleRemoveClick = (homework: Homework) => {
        setItemToDelete(homework);
    };

    const confirmRemove = async () => {
        if (!itemToDelete) return;
        try {
            await deleteHomework(itemToDelete.id);
            setAlert({ message: 'Homework removed successfully.', type: 'success' });
        } catch (error) {
            setAlert({ message: 'Failed to remove homework.', type: 'error' });
        }
        setItemToDelete(null);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmRemove}
                title="Remove Homework"
                message={`Are you sure you want to remove "${itemToDelete?.title}"? This cannot be undone.`}
                confirmText="Remove"
            />
            <h1 className="text-3xl font-bold text-white">Homework Control</h1>
            <div className="bg-brand-light-blue p-4 sm:p-6 rounded-xl border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray">Title</th>
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray">Subject</th>
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden sm:table-cell">Teacher</th>
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray hidden md:table-cell">Due Date</th>
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray">File</th>
                                <th className="p-3 text-sm font-semibold text-brand-silver-gray text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {homeworks.map(hw => (
                                    <motion.tr
                                        key={hw.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                        className="border-b border-white/10 hover:bg-white/5"
                                    >
                                        <td className="p-3 text-white font-medium">{hw.title}</td>
                                        <td className="p-3 text-gray-300">{hw.course}</td>
                                        <td className="p-3 text-gray-300 hidden sm:table-cell">{hw.teacherName}</td>
                                        <td className="p-3 text-gray-300 hidden md:table-cell">{new Date(hw.dueDate).toLocaleDateString()}</td>
                                        <td className="p-3 text-gray-300">
                                            {hw.file ? <FileText size={18} className="text-blue-400"/> : 'None'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleRemoveClick(hw)} className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-red-400/10" title="Remove Homework"><Trash2 size={16}/></button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {homeworks.length === 0 && <p className="text-center text-brand-silver-gray py-8">No homework has been uploaded.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminTeacherManagement: React.FC = () => {
    const { users, updateUsers, addTeacher, deleteUser } = useContext(AuthContext);
    const teachers = users.filter(u => u.role === UserRole.Teacher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleAdd = () => {
        setModalMode('add');
        setCurrentUser({ name: '', email: '', role: UserRole.Teacher, password: '' });
        setIsModalOpen(true);
    };
    const handleEdit = (user: User) => {
        setModalMode('edit');
        setCurrentUser(user);
        setIsModalOpen(true);
    };
    const handleSave = (userData: Partial<User>): User | void => {
        if (modalMode === 'add') {
             if (userData.name && userData.email && userData.password) {
                const newTeacher = addTeacher(userData.name, userData.email, userData.password);
                setAlert({ message: `Teacher "${newTeacher.name}" added successfully.`, type: 'success' });
                return newTeacher;
            }
        } else {
            updateUsers(prev => prev.map(u => (u.id === userData.id ? { ...u, ...userData } as User : u)));
            setAlert({ message: `Teacher "${userData.name}" updated.`, type: 'success' });
            setIsModalOpen(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        await deleteUser(userToDelete.id);
        setAlert({ message: `Teacher "${userToDelete.name}" deleted.`, type: 'success' });
        setUserToDelete(null);
    };
    const handleToggleBlock = (userId: string) => {
        updateUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>{alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}</AnimatePresence>
            <ConfirmationModal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} title="Delete Teacher" message={`Are you sure you want to delete ${userToDelete?.name}?`} />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Teacher Management</h1>
                <button onClick={handleAdd} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg"><UserPlus size={18}/><span>Add Teacher</span></button>
            </div>
            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                <UserManagementTable users={teachers} onEdit={handleEdit} onDelete={setUserToDelete} onToggleBlock={handleToggleBlock} />
            </div>
            <TeacherModal isOpen={isModalOpen} mode={modalMode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const AdminStudentManagement: React.FC<{ onMessageUser: (userId: string) => void }> = ({ onMessageUser }) => {
    const { users, updateUsers, addStudent, deleteUser } = useContext(AuthContext);
    const students = users.filter(u => u.role === UserRole.Student);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleAdd = () => {
        setModalMode('add');
        setCurrentUser({ name: '', id: '', password: '' });
        setIsModalOpen(true);
    };
    const handleEdit = (user: User) => {
        setModalMode('edit');
        setCurrentUser(user);
        setIsModalOpen(true);
    };
    const handleSave = (userData: Partial<User>): User | void => {
        if (modalMode === 'add') {
             if (userData.name && userData.id && userData.password) {
                const newStudent = addStudent(userData.name, userData.id, userData.password);
                setAlert({ message: `Student "${newStudent.name}" added successfully.`, type: 'success' });
                return newStudent;
            }
        } else {
            updateUsers(prev => prev.map(u => (u.id === userData.id ? { ...u, name: userData.name, password: userData.password } as User : u)));
            setAlert({ message: `Student "${userData.name}" updated.`, type: 'success' });
            setIsModalOpen(false);
        }
    };
     const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        await deleteUser(userToDelete.id);
        setAlert({ message: `Student "${userToDelete.name}" deleted.`, type: 'success' });
        setUserToDelete(null);
    };
    const handleToggleBlock = (userId: string) => {
        updateUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>{alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}</AnimatePresence>
            <ConfirmationModal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} title="Delete Student" message={`Are you sure you want to delete ${userToDelete?.name}?`} />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Student Management</h1>
                <button onClick={handleAdd} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg"><UserPlus size={18}/><span>Add Student</span></button>
            </div>
            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                <UserManagementTable users={students} onEdit={handleEdit} onDelete={setUserToDelete} onToggleBlock={handleToggleBlock} onMessage={onMessageUser} />
            </div>
            <StudentModal isOpen={isModalOpen} mode={modalMode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const AdminNotifications: React.FC = () => {
    const { notifications, addNotification, deleteNotification } = useContext(NotificationContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState<'all' | UserRole>('all');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSend = () => {
        if (!title || !content) {
            setAlert({ message: "Title and content are required.", type: 'error' });
            return;
        }
        addNotification({ title, content, target });
        setAlert({ message: "Notification sent successfully!", type: 'success' });
        setTitle('');
        setContent('');
        setTarget('all');
    };
    
    return (
         <div className="space-y-6">
            <AnimatePresence>{alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}</AnimatePresence>
            <h1 className="text-3xl font-bold text-white">Send Notifications</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 space-y-4">
                     <h2 className="text-xl font-semibold text-white">Create Notification</h2>
                     <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full input-field" />
                     <textarea placeholder="Message content..." value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full input-field" />
                     <select value={target} onChange={e => setTarget(e.target.value as any)} className="w-full input-field">
                         <option value="all">All Users</option>
                         <option value={UserRole.Student}>Students Only</option>
                         <option value={UserRole.Teacher}>Teachers Only</option>
                     </select>
                     <button onClick={handleSend} className="w-full flex justify-center items-center space-x-2 bg-brand-neon-purple text-white py-2.5 rounded-lg"><Send size={18} /><span>Send</span></button>
                </div>
                 <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Sent History</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                            <motion.div key={notif.id} layout className="bg-white/5 p-3 rounded-lg flex justify-between items-start gap-2">
                                <div>
                                    <p className="font-bold text-white">{notif.title} <span className="text-xs font-normal capitalize bg-white/10 px-2 py-0.5 rounded-full ml-2">{notif.target}</span></p>
                                    <p className="text-sm text-brand-silver-gray">{notif.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.date).toLocaleString()}</p>
                                </div>
                                <button onClick={() => deleteNotification(notif.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md flex-shrink-0"><Trash2 size={16}/></button>
                            </motion.div>
                        ))}
                         {notifications.length === 0 && <p className="text-center text-brand-silver-gray py-8">No notifications sent yet.</p>}
                    </div>
                 </div>
            </div>
         </div>
    );
};

// --- MAIN ADMIN DASHBOARD LAYOUT ---
const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMessageUserId, setSelectedMessageUserId] = useState<string | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize(); // Set initial state
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleMessageUserClick = (userId: string) => {
        setSelectedMessageUserId(userId);
        setActiveView('messages');
    };

    const renderContent = () => {
        switch(activeView) {
            case 'overview': return <AdminOverview />;
            case 'users': return <AdminUserManagement onMessageUser={handleMessageUserClick} />;
            case 'homepage': return <AdminHomepageManager />;
            case 'messages': return <AdminMessaging selectedUserId={selectedMessageUserId} setSelectedUserId={setSelectedMessageUserId} />;
            case 'teachers': return <AdminTeacherManagement />;
            case 'students': return <AdminStudentManagement onMessageUser={handleMessageUserClick} />;
            case 'homework': return <HomeworkControl />;
            case 'notifications': return <AdminNotifications />;
            case 'settings': return <div>Settings content goes here</div>;
            default: return <AdminOverview />;
        }
    }
    
    return (
        <div className="relative">
             <AdminSidebar 
                activeView={activeView} 
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
             />
             <div className="lg:pl-64 transition-all duration-300">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-20 left-4 z-20 p-2 rounded-md bg-brand-light-blue/50 backdrop-blur-sm">
                    <Menu className="text-white" />
                </button>
                 <div className="p-4 sm:p-6 lg:p-8">
                     <AnimatePresence mode="wait">
                         <motion.div
                             key={activeView}
                             variants={contentVariants}
                             initial="initial"
                             animate="animate"
                             exit="exit"
                         >
                            {renderContent()}
                         </motion.div>
                     </AnimatePresence>
                 </div>
             </div>
        </div>
    );
};

export default AdminDashboard;