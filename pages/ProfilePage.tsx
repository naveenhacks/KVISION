
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.tsx';
import DashboardLayout from '../components/layout/DashboardLayout.tsx';
import { UserRole } from '../types.ts';
import { UserCircle, Mail, Key, Shield, BookOpen, Percent, BarChart, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import Alert from '../components/common/Alert.tsx';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg">
        <div className="p-3 bg-brand-neon-purple/20 rounded-full text-brand-light-purple">{icon}</div>
        <div>
            <p className="text-sm text-brand-silver-gray">{label}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
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

    const handlePasswordChange = async (e: React.FormEvent) => {
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
        if (!user) return;

        setLoading(true);
        const result = await updatePassword(currentPassword, newPassword);
        setLoading(false);

        if (result.success) {
            setAlert({ message: result.message, type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setAlert({ message: result.message, type: 'error' });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    
    return (
        <DashboardLayout>
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-4xl mx-auto">
                <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">My Profile</motion.h1>

                {/* Account Details */}
                <motion.div variants={itemVariants} className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-brand-light-purple">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={<UserCircle />} label="Full Name" value={user?.name || 'N/A'} />
                        <InfoCard icon={<Mail />} label="Email Address" value={user?.email || 'N/A'} />
                        <InfoCard icon={<Shield />} label="Role" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'} />
                    </div>
                </motion.div>

                {/* Academic History (Student only) */}
                {user?.role === UserRole.Student && (
                    <motion.div variants={itemVariants} className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 text-brand-light-purple">Academic History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard icon={<BookOpen />} label="Courses" value={user.studentData?.courses.join(', ') || 'Not Enrolled'} />
                            <InfoCard icon={<Percent />} label="Attendance" value={`${user.studentData?.attendance || 0}%`} />
                            <InfoCard icon={<BarChart />} label="Overall Grade" value={`${user.studentData?.overallGrade || 0}%`} />
                        </div>
                    </motion.div>
                )}

                {/* Change Password */}
                <motion.div variants={itemVariants} className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-brand-light-purple">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-brand-silver-gray">Current Password</label>
                            <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full input-field pr-10 mt-1" />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-9 text-brand-silver-gray">{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-brand-silver-gray">New Password</label>
                                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full input-field pr-10 mt-1" />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-9 text-brand-silver-gray">{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-silver-gray">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full input-field mt-1" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-neon-purple text-white rounded-lg flex items-center space-x-2 disabled:bg-opacity-50">
                                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                                <span>{loading ? 'Saving...' : 'Save Password'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
};

export default ProfilePage;