
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Homework } from '../../types.ts';
import { AuthContext } from '../../context/AuthContext.tsx';
import { HomeworkContext } from '../../context/HomeworkContext.tsx';
import { Book, Clock, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const attendanceData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 15 },
];
const COLORS = ['#8a2be2', '#4a4a70'];


const StudentDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { homeworks } = useContext(HomeworkContext);
    
    const pendingHomework = homeworks.filter(hw => !hw.completed);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">
                Welcome back, {user?.name.split(' ')[0]}!
            </motion.h1>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Homework Panel</h2>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 h-full">
                        {pendingHomework.length > 0 ? (
                            <ul className="space-y-4">
                                {pendingHomework.map(hw => (
                                    <li key={hw.id} className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <div className="flex items-start space-x-3">
                                                <Book className="text-brand-light-purple flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="font-semibold text-white">{hw.title}</p>
                                                    <p className="text-sm text-brand-silver-gray">{hw.course} - by {hw.teacherName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm self-start sm:self-center pt-2 sm:pt-0 pl-9 sm:pl-0 flex-shrink-0">
                                                {hw.file && (
                                                    <a href={hw.file.dataUrl} download={hw.file.name} className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                                                        <Download size={16} className="mr-1"/> Download
                                                    </a>
                                                )}
                                                <span className="flex items-center text-yellow-400"><Clock size={16} className="mr-1"/> Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {hw.description && (
                                            <div className="pl-9">
                                                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{hw.description}</p>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-center text-brand-silver-gray py-4">No homework available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-semibold mb-4 text-brand-light-purple">Attendance</h2>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex-grow min-h-[250px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e1a50', border: 'none', borderRadius: '10px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default StudentDashboard;