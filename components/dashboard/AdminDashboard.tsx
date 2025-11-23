
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext.tsx';
import { HomeworkContext } from '../../context/HomeworkContext.tsx';
import { NotificationContext } from '../../context/NotificationContext.tsx';
import { ActivityContext } from '../../context/ActivityContext.tsx';
import { ClassContext } from '../../context/ClassContext.tsx';
import { User, UserRole, Homework, ActivityLog } from '../../types.ts';
import AdminMessaging from './messaging/AdminMessaging.tsx';
import Alert from '../common/Alert.tsx';
import AdminHomepageManager from './admin/HomepageManager.tsx';
import ClassManagement from './admin/ClassManagement.tsx';
import ConfirmationModal from '../common/ConfirmationModal.tsx';
import { 
    Users, UserPlus, Trash2, Edit, X, Copy, Check, ShieldAlert, 
    LayoutDashboard, GraduationCap, Presentation, BookMarked, MessageSquare, Bell, Settings, Search,
    Shield, ShieldOff, Globe, FileText, Eye, EyeOff, Send, CheckCircle, Activity, BookOpen, Download, HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- HELPER COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color: string }> = ({ title, value, icon, color }) => {
    const colorMap: { [key: string]: string } = {
        purple: 'bg-purple-500/20 text-purple-400',
        indigo: 'bg-indigo-500/20 text-indigo-400',
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
        pink: 'bg-pink-500/20 text-pink-400',
    };
    const style = colorMap[color] || 'bg-gray-500/20 text-gray-400';

    return (
        <div className="bg-brand-light-blue p-5 rounded-xl border border-white/10 flex items-center space-x-4 transform transition-transform hover:-translate-y-1 h-full shadow-lg">
            <div className={`p-3 rounded-full ${style}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-brand-silver-gray text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'homepage', label: 'Manage Homepage', icon: <Globe size={20} /> },
    { id: 'notifications', label: 'Notices & News', icon: <Bell size={20} /> },
    { id: 'teachers', label: 'Teachers', icon: <Presentation size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'classes', label: 'Classes & Courses', icon: <BookOpen size={20} /> },
    { id: 'homework', label: 'Homework Control', icon: <BookMarked size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

// --- SIDEBAR ---
const AdminSidebar: React.FC<{ 
    activeView: string; 
    setActiveView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const { user } = useContext(AuthContext);

    return (
        <>
            <motion.div
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                className={`fixed inset-y-0 left-0 w-64 bg-brand-light-blue rounded-r-2xl shadow-2xl z-40 lg:relative lg:translate-x-0 lg:flex-shrink-0 border-r border-white/5`}
            >
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-8 p-2 bg-white/5 rounded-xl">
                        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt="Admin" className="w-10 h-10 rounded-full border-2 border-brand-neon-purple"/>
                        <div>
                            <p className="font-bold text-white text-sm">{user?.name}</p>
                            <p className="text-xs text-brand-silver-gray">Super Admin</p>
                        </div>
                    </div>
                    <nav className="flex-grow overflow-y-auto space-y-1">
                        {navItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveView(item.id); if (window.innerWidth < 1024) setIsOpen(false); }}
                                className={`flex items-center w-full space-x-3 p-3 rounded-lg transition-all text-sm font-medium ${
                                    activeView === item.id 
                                    ? 'bg-brand-neon-purple text-white shadow-lg shadow-brand-neon-purple/20' 
                                    : 'text-brand-silver-gray hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="mt-auto pt-6 border-t border-white/10">
                         <p className="text-xs text-center text-brand-silver-gray">KVISION Admin Panel v2.0</p>
                    </div>
                </div>
            </motion.div>
             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// --- COMPONENTS ---

const AdminOverview = () => {
    const { users } = useContext(AuthContext);
    const { homeworks } = useContext(HomeworkContext);
    const { classes } = useContext(ClassContext);
    const { logs } = useContext(ActivityContext); // New Context

    const studentCount = users.filter(u => u.role === UserRole.Student).length;
    const teacherCount = users.filter(u => u.role === UserRole.Teacher).length;

    const userDistributionData = [
        { name: 'Students', value: studentCount },
        { name: 'Teachers', value: teacherCount },
    ];
    const COLORS = ['#8a2be2', '#c471ed'];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={studentCount} icon={<GraduationCap />} color="purple" />
                <StatCard title="Total Teachers" value={teacherCount} icon={<Presentation />} color="indigo" />
                <StatCard title="Total Classes" value={classes.length} icon={<Users />} color="blue" />
                <StatCard title="Total Homework" value={homeworks.length} icon={<BookMarked />} color="pink" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Log */}
                <div className="lg:col-span-2 bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2"><Activity size={20}/> Recent Activity</h2>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {logs.length > 0 ? logs.map(log => (
                            <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                    log.type === 'success' ? 'bg-green-400' : 
                                    log.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'
                                }`} />
                                <div>
                                    <p className="text-sm text-white"><span className="font-bold">{log.performedBy}</span> {log.action}</p>
                                    <p className="text-xs text-brand-silver-gray">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-500">No activity logged yet.</p>}
                    </div>
                </div>
                
                {/* Ratio Chart */}
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">User Ratio</h2>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={userDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e1a50', borderRadius: '8px' }} itemStyle={{ color: '#fff' }}/>
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... TeacherModal updated ...
const TeacherModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<User | void>;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const { classes } = useContext(ClassContext);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [credentials, setCredentials] = useState<User | null>(null);

    useEffect(() => { setFormData(user || {}); setCredentials(null); }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await onSave(formData);
        if (mode === 'add' && res) setCredentials(res as User);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{credentials ? 'Teacher Added!' : `${mode === 'add' ? 'Add' : 'Edit'} Teacher`}</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                {credentials ? (
                    <div className="bg-white/10 p-4 rounded-lg text-center space-y-4">
                        <p className="text-gray-300">Credentials generated. Copy them now.</p>
                        <div className="text-left bg-black/30 p-3 rounded">
                            <p>Email: <span className="text-white font-mono">{credentials.email}</span></p>
                            <p>Password: <span className="text-white font-mono">{credentials.password}</span></p>
                        </div>
                        <button onClick={onClose} className="btn-primary w-full">Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full input-field" required />
                        <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full input-field" required disabled={mode==='edit'}/>
                        {mode === 'add' && <input type="password" placeholder="Password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full input-field" required />}
                        
                        <div>
                            <label className="text-sm text-gray-400">Class Teacher Assigned To (Optional)</label>
                            <select value={formData.assignedClass || ''} onChange={e => setFormData({...formData, assignedClass: e.target.value})} className="w-full input-field mt-1">
                                <option value="">None</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const AdminTeacherManagement = () => {
    const { users, addTeacher, updateUser, deleteUser } = useContext(AuthContext);
    const { logActivity } = useContext(ActivityContext);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [mode, setMode] = useState<'add' | 'edit'>('add');

    useEffect(() => { setTeachers(users.filter(u => u.role === UserRole.Teacher)); }, [users]);

    const handleSave = async (data: Partial<User>) => {
        if (mode === 'add') {
            const res = await addTeacher(data.name!, data.email!, data.password!);
            logActivity(`Added teacher ${res.name}`, 'Admin', 'success');
            return res;
        } else {
            await updateUser(data.id!, data);
            logActivity(`Updated teacher ${data.name}`, 'Admin', 'info');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Teachers</h1>
                <button onClick={() => { setMode('add'); setCurrentUser({}); setIsModalOpen(true); }} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg"><UserPlus size={18}/><span>Add Teacher</span></button>
            </div>
            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20 text-brand-silver-gray"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {teachers.map(t => (
                            <tr key={t.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 text-white">{t.name}</td>
                                <td className="p-3 text-gray-300">{t.email}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => { setMode('edit'); setCurrentUser(t); setIsModalOpen(true); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded"><Edit size={16}/></button>
                                    <button onClick={() => deleteUser(t.id, t.uid)} className="text-red-400 p-2 hover:bg-white/10 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <TeacherModal isOpen={isModalOpen} mode={mode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

// ... StudentModal updated ...
const StudentModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<User | void>;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const { classes } = useContext(ClassContext);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [credentials, setCredentials] = useState<User | null>(null);

    useEffect(() => { 
        setFormData(user || { studentData: { courses: [], attendance: 0, overallGrade: 0 } }); 
        setCredentials(null); 
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await onSave(formData);
        if (mode === 'add' && res) setCredentials(res as User);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{credentials ? 'Student Added!' : `${mode === 'add' ? 'Add' : 'Edit'} Student`}</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                {credentials ? (
                    <div className="bg-white/10 p-4 rounded-lg text-center space-y-4">
                         <p className="text-gray-300">Credentials generated.</p>
                         <div className="text-left bg-black/30 p-3 rounded">
                            <p>Apaar ID: <span className="text-white font-mono">{credentials.id}</span></p>
                            <p>Password: <span className="text-white font-mono">{credentials.password}</span></p>
                        </div>
                        <button onClick={onClose} className="btn-primary w-full bg-brand-neon-purple p-2 rounded text-white">Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full input-field" required />
                        <input type="text" placeholder="Apaar ID (Roll No.)" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full input-field" required disabled={mode==='edit'}/>
                        {mode === 'add' && <input type="password" placeholder="Password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full input-field" required />}
                        
                         <div>
                            <label className="text-sm text-gray-400">Class (Optional)</label>
                            <select 
                                value={formData.studentData?.className || ''} 
                                onChange={e => setFormData({
                                    ...formData, 
                                    studentData: { ...formData.studentData!, className: e.target.value }
                                })} 
                                className="w-full input-field mt-1"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                             <button type="submit" className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const AdminStudentManagement = () => {
    const { users, addStudent, updateUser, deleteUser } = useContext(AuthContext);
    const { logActivity } = useContext(ActivityContext);
    const [students, setStudents] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [mode, setMode] = useState<'add' | 'edit'>('add');

    useEffect(() => { setStudents(users.filter(u => u.role === UserRole.Student)); }, [users]);

    const handleSave = async (data: Partial<User>) => {
        if (mode === 'add') {
             const res = await addStudent(data.name!, data.id!, data.password!);
             logActivity(`Added student ${res.name}`, 'Admin', 'success');
             // Update student class info separately if needed or inside context
             if (data.studentData?.className) {
                 await updateUser(res.id, { studentData: { ...res.studentData, className: data.studentData.className } });
             }
             return res;
        } else {
            await updateUser(data.id!, data);
            logActivity(`Updated student ${data.name}`, 'Admin', 'info');
        }
    };

     return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Students</h1>
                <button onClick={() => { setMode('add'); setCurrentUser({}); setIsModalOpen(true); }} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg"><UserPlus size={18}/><span>Add Student</span></button>
            </div>
            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20 text-brand-silver-gray"><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3">Class</th><th className="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 text-white">{s.name}</td>
                                <td className="p-3 text-gray-300">{s.id}</td>
                                <td className="p-3 text-gray-300">{s.studentData?.className || '-'}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => { setMode('edit'); setCurrentUser(s); setIsModalOpen(true); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded"><Edit size={16}/></button>
                                    <button onClick={() => deleteUser(s.id, s.uid)} className="text-red-400 p-2 hover:bg-white/10 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <StudentModal isOpen={isModalOpen} mode={mode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const SettingsSection = () => {
    const { users } = useContext(AuthContext);
    
    const exportData = () => {
        const dataStr = JSON.stringify(users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'kvision_users_backup.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                    <p className="text-brand-silver-gray mb-4">Export all user data and system logs for backup purposes.</p>
                    <button onClick={exportData} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <Download size={18} /><span>Export User Data (JSON)</span>
                    </button>
                </div>
                 <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Appearance</h2>
                    <p className="text-brand-silver-gray mb-4">Customize the admin panel theme.</p>
                    <div className="flex space-x-3">
                        <button className="w-8 h-8 rounded-full bg-brand-neon-purple ring-2 ring-white"></button>
                        <button className="w-8 h-8 rounded-full bg-blue-500"></button>
                        <button className="w-8 h-8 rounded-full bg-green-500"></button>
                    </div>
                </div>
                 <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 md:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4">System Info</h2>
                    <p className="text-brand-silver-gray">Version: 2.1.0 (Firebase Connected)</p>
                    <p className="text-brand-silver-gray">Support: kvunnao85@gmail.com</p>
                </div>
            </div>
        </div>
    );
}

const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMessageUserId, setSelectedMessageUserId] = useState<string | null>(null);

    const renderContent = () => {
        switch(activeView) {
            case 'overview': return <AdminOverview />;
            case 'homepage': return <AdminHomepageManager />;
            case 'teachers': return <AdminTeacherManagement />;
            case 'students': return <AdminStudentManagement />;
            case 'classes': return <ClassManagement />;
            case 'messages': return <AdminMessaging selectedUserId={selectedMessageUserId} setSelectedUserId={setSelectedMessageUserId} />;
            case 'settings': return <SettingsSection />;
            default: return <AdminOverview />;
        }
    }
    
    return (
        <div className="flex h-screen bg-brand-deep-blue text-white overflow-hidden">
             <AdminSidebar 
                activeView={activeView} 
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
             />
             <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                 <div className="p-4 sm:p-6 lg:p-8 min-h-full">
                     <AnimatePresence mode="wait">
                         <motion.div
                             key={activeView}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             transition={{ duration: 0.3 }}
                         >
                            {renderContent()}
                         </motion.div>
                     </AnimatePresence>
                 </div>
             </main>
        </div>
    );
};

export default AdminDashboard;
