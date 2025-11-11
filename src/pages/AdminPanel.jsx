
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx';
import * as dataService from '../firebase/dataService.js';
import { UserRole } from '../types.js';
import Navbar from '../components/Navbar.jsx';
import { LayoutDashboard, GraduationCap, Users, BookMarked, Megaphone, Bell, Settings, Trash2, PlusCircle, X } from 'lucide-react';

// --- Reusable & Section Components ---

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-brand-light-blue p-5 rounded-xl border border-white/10 flex items-center space-x-4">
        <div className="p-3 bg-brand-neon-purple/20 rounded-full text-brand-light-purple">{icon}</div>
        <div>
            <p className="text-brand-silver-gray text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AddStudentModal = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [apaarId, setApaarId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(name, apaarId, password);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Add New Student</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full input-field" />
                    <input type="text" placeholder="Apaar ID (Roll No.)" value={apaarId} onChange={e => setApaarId(e.target.value)} required className="w-full input-field" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full input-field" />
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="px-4 py-2 bg-brand-neon-purple text-white rounded-lg">Add Student</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DashboardSection = ({ stats }) => (
    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Students" value={stats.students} icon={<GraduationCap size={24} />} />
            <StatCard title="Total Teachers" value={stats.teachers} icon={<Users size={24} />} />
            <StatCard title="Homeworks Assigned" value={stats.homeworks} icon={<BookMarked size={24} />} />
        </div>
    </motion.div>
);

const StudentsSection = ({ students, onAdd, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const handleAddStudent = async (name, apaarId, password) => {
        try {
            await onAdd(name, apaarId, password);
            setShowModal(false);
        } catch(error) {
            alert(`Error adding student: ${error.message}`);
        }
    };

    return (
        <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
            {showModal && <AddStudentModal onAdd={handleAddStudent} onClose={() => setShowModal(false)} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Students</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg">
                    <PlusCircle size={18}/><span>Add Student</span>
                </button>
            </div>
            <div className="bg-brand-light-blue p-4 rounded-xl border border-white/10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="p-3 text-sm font-semibold text-brand-silver-gray">Name</th>
                            <th className="p-3 text-sm font-semibold text-brand-silver-gray">Roll No. (Apaar ID)</th>
                            <th className="p-3 text-sm font-semibold text-brand-silver-gray">Class / Courses</th>
                            <th className="p-3 text-sm font-semibold text-brand-silver-gray text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.uid} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 text-white font-medium">{student.name}</td>
                                <td className="p-3 text-gray-300">{student.id}</td>
                                <td className="p-3 text-gray-300">{student.studentData?.courses.join(', ')}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onDelete(student.uid)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const TeachersSection = ({ teachers }) => (
     <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Teachers</h2>
        <div className="bg-brand-light-blue p-4 rounded-xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/20">
                        <th className="p-3 text-sm font-semibold text-brand-silver-gray">Name</th>
                        <th className="p-3 text-sm font-semibold text-brand-silver-gray">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map(teacher => (
                        <tr key={teacher.uid} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-3 text-white font-medium">{teacher.name}</td>
                            <td className="p-3 text-gray-300">{teacher.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

const HomeworkSection = ({ homeworks }) => (
    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Homework</h2>
        <div className="bg-brand-light-blue p-4 rounded-xl border border-white/10 space-y-3">
             {homeworks.map(hw => (
                <div key={hw.id} className="bg-white/5 p-3 rounded-lg">
                    <p className="font-bold text-white">{hw.title}</p>
                    <p className="text-sm text-brand-silver-gray">Due: {hw.dueDate} | Status: {hw.completedBy?.length > 0 ? `${hw.completedBy.length} completed` : 'Pending'}</p>
                </div>
            ))}
        </div>
    </motion.div>
);

const AnnouncementsSection = ({ announcements }) => (
    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Announcements</h2>
        <div className="bg-brand-light-blue p-4 rounded-xl border border-white/10 space-y-3">
            {announcements.map(ann => (
                <div key={ann.id} className="bg-white/5 p-3 rounded-lg">
                    <p className="text-white">{ann.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(ann.date).toLocaleString()}</p>
                </div>
            ))}
        </div>
    </motion.div>
);

const NotificationsSection = ({ notifications }) => (
    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
         <div className="bg-brand-light-blue p-4 rounded-xl border border-white/10 space-y-3">
            {notifications.map(n => (
                <div key={n.id} className={`bg-white/5 p-3 rounded-lg ${n.readBy.includes('admin') ? 'opacity-50' : ''}`}>
                    <p className="font-semibold text-white">{n.title}</p>
                    <p className="text-sm text-brand-silver-gray">{n.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleString()}</p>
                </div>
            ))}
        </div>
    </motion.div>
);

const SettingsSection = () => (
    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        <div className="bg-brand-light-blue p-8 rounded-xl border border-white/10">
            <p className="text-brand-silver-gray">Settings section is under construction.</p>
        </div>
    </motion.div>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: Users },
        { id: 'homework', label: 'Homework', icon: BookMarked },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside className="w-64 bg-brand-light-blue/50 p-4 border-r border-white/10 flex-shrink-0">
            <nav>
                <ul>
                    {navItems.map(item => (
                        <li key={item.id}>
                            <button 
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center w-full space-x-3 p-3 my-1 rounded-lg transition-all text-sm font-medium ${
                                    activeTab === item.id 
                                    ? 'bg-brand-neon-purple/20 text-white' 
                                    : 'text-brand-silver-gray hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const { addStudent, deleteUser, user } = useContext(AuthContext);

    useEffect(() => {
        let synced = false;
        const unsubUsers = dataService.onUsersUpdate(setUsers);
        const unsubHomeworks = dataService.onHomeworksUpdate(setHomeworks);
        const unsubAnnouncements = dataService.onAnnouncementsUpdate(setAnnouncements);
        const unsubNotifications = dataService.onNotificationsUpdate(setNotifications);

        const logSync = () => {
            if (!synced) {
                console.log("✅ Data synced with Firebase");
                synced = true;
            }
        };
        const timer = setTimeout(logSync, 1500); // Wait for initial data load

        return () => {
            unsubUsers();
            unsubHomeworks();
            unsubAnnouncements();
            unsubNotifications();
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'notifications' && user) {
            const unread = notifications.filter(n => !n.readBy.includes(user.uid));
            if (unread.length > 0) {
                dataService.markNotificationsAsRead(unread, user.uid);
            }
        }
    }, [activeTab, notifications, user]);

    const students = users.filter(u => u.role === UserRole.Student);
    const teachers = users.filter(u => u.role === UserRole.Teacher);

    const stats = {
        students: students.length,
        teachers: teachers.length,
        homeworks: homeworks.length,
    };
  
    const handleDeleteStudent = (studentUid) => {
        if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
            deleteUser(studentUid).catch(err => alert(`Error: ${err.message}`));
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardSection stats={stats} />;
            case 'students': return <StudentsSection students={students} onAdd={addStudent} onDelete={handleDeleteStudent} />;
            case 'teachers': return <TeachersSection teachers={teachers} />;
            case 'homework': return <HomeworkSection homeworks={homeworks} />;
            case 'announcements': return <AnnouncementsSection announcements={announcements} />;
            case 'notifications': return <NotificationsSection notifications={notifications} />;
            case 'settings': return <SettingsSection />;
            default: return <DashboardSection stats={stats} />;
        }
    };

    return (
        <div className="min-h-screen bg-brand-deep-blue text-white">
            <Navbar />
            <div className="flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-grow p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
