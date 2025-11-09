
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.tsx';
import DashboardLayout from '../components/layout/DashboardLayout.tsx';
import { UserCircle, Mail, Key, Shield, BookOpen, Percent, BarChart, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import Alert from '../components/common/Alert.tsx';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3">
        <div className="p-2 bg-white/10 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-xs text-brand-silver-gray">{label}</p>
            <p className="font-semibold text-white">{value}</p>
        </div>
    </div>
);

const ProfilePage: React.FC = () => {
    const { user, updatePassword } = useContext(AuthContext);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    if (!user) {
        return <DashboardLayout><div>Loading profile...</div></DashboardLayout>;
    }
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlert(null);
        if (newPassword !== confirmPassword) {
            setAlert({ message: "New passwords do not match.", type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setAlert({ message: "Password must be at least 6 characters.", type: 'error' });
            return;
        }
        setLoading(true);
        const result = await updatePassword(user.id, currentPassword, newPassword);
        setLoading(false);
        setAlert(result);
        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    // Mock academic data
    const academicHistory = {
        overallAttendance: 92,
        currentGrade: 88,
        recentGrades: [
            { subject: 'Physics', grade: 'A', score: 95 },
            { subject: 'Mathematics', grade: 'B+', score: 88 },
            { subject: 'Chemistry', grade: 'A-', score: 91 },
            { subject: 'English', grade: 'B', score: 82 },
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <DashboardLayout>
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.h1 variants={itemVariants} className="text-4xl font-bold text-white mb-8">My Profile</motion.h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info & Security */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div variants={itemVariants} className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-semibold text-brand-light-purple mb-6">Personal Information</h2>
                            <div className="flex items-center space-x-6 mb-6">
                                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-brand-neon-purple" />
                                <div className="space-y-3">
                                    <InfoCard icon={<UserCircle size={20} className="text-brand-light-purple" />} label="Full Name" value={user.name} />
                                    <InfoCard icon={<Key size={20} className="text-brand-light-purple" />} label="Student ID" value={user.id} />
                                    <InfoCard icon={<Mail size={20} className="text-brand-light-purple" />} label="Email Address" value={user.email} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.form onSubmit={handlePasswordUpdate} variants={itemVariants} className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-semibold text-brand-light-purple mb-6">Update Password</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm text-brand-silver-gray mb-1">Current Password</label>
                                    <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full input-field pr-10" required />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-9 text-brand-silver-gray">{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm text-brand-silver-gray mb-1">New Password</label>
                                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full input-field pr-10" required />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-9 text-brand-silver-gray">{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                <div>
                                    <label className="block text-sm text-brand-silver-gray mb-1">Confirm New Password</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full input-field" required />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors disabled:bg-opacity-50">
                                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    </div>

                    {/* Right Column: Academic History */}
                    <motion.div variants={itemVariants} className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h2 className="text-2xl font-semibold text-brand-light-purple mb-6">Academic History</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Percent size={20} className="text-green-400" />
                                    <span className="text-brand-silver-gray">Overall Attendance</span>
                                </div>
                                <span className="font-bold text-lg text-white">{academicHistory.overallAttendance}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${academicHistory.overallAttendance}%` }}></div>
                            </div>

                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BarChart size={20} className="text-yellow-400" />
                                    <span className="text-brand-silver-gray">Grade Average</span>
                                </div>
                                <span className="font-bold text-lg text-white">{academicHistory.currentGrade}%</span>
                            </div>
                             <div className="w-full bg-white/10 rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${academicHistory.currentGrade}%` }}></div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Recent Grades</h3>
                                <ul className="space-y-3">
                                    {academicHistory.recentGrades.map(item => (
                                        <li key={item.subject} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="text-brand-silver-gray">{item.subject}</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-md text-sm ${item.score >= 90 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.grade}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default ProfilePage;