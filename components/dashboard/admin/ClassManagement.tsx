
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassContext } from '../../../context/ClassContext.tsx';
import { AuthContext } from '../../../context/AuthContext.tsx';
import { ActivityContext } from '../../../context/ActivityContext.tsx';
import { UserRole } from '../../../types.ts';
import { PlusCircle, Trash2, Edit, Save, X, BookOpen, Users } from 'lucide-react';
import Alert from '../../common/Alert.tsx';
import ConfirmationModal from '../../common/ConfirmationModal.tsx';

const ClassManagement: React.FC = () => {
    const { classes, addClass, updateClass, deleteClass } = useContext(ClassContext);
    const { users } = useContext(AuthContext);
    const { logActivity } = useContext(ActivityContext);
    const { user: adminUser } = useContext(AuthContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentClass, setCurrentClass] = useState<{ id?: string; name: string; subjects: string; teacherId: string }>({ name: '', subjects: '', teacherId: '' });
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [classToDelete, setClassToDelete] = useState<string | null>(null);

    const teachers = users.filter(u => u.role === UserRole.Teacher);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const subjectList = currentClass.subjects.split(',').map(s => s.trim()).filter(s => s);
        
        try {
            if (modalMode === 'add') {
                await addClass(currentClass.name, subjectList);
                logActivity(`Created class ${currentClass.name}`, adminUser?.name || 'Admin', 'success');
                setAlert({ message: 'Class created successfully!', type: 'success' });
            } else if (currentClass.id) {
                await updateClass(currentClass.id, { 
                    name: currentClass.name, 
                    subjects: subjectList,
                    classTeacherId: currentClass.teacherId || undefined
                });
                logActivity(`Updated class ${currentClass.name}`, adminUser?.name || 'Admin', 'info');
                setAlert({ message: 'Class updated successfully!', type: 'success' });
            }
            setIsModalOpen(false);
        } catch (error) {
            setAlert({ message: 'Operation failed.', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (classToDelete) {
            await deleteClass(classToDelete);
            logActivity(`Deleted class group`, adminUser?.name || 'Admin', 'warning');
            setAlert({ message: 'Class deleted.', type: 'success' });
            setClassToDelete(null);
        }
    };

    const openEdit = (cls: any) => {
        setModalMode('edit');
        setCurrentClass({ 
            id: cls.id, 
            name: cls.name, 
            subjects: cls.subjects.join(', '), 
            teacherId: cls.classTeacherId || '' 
        });
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setModalMode('add');
        setCurrentClass({ name: '', subjects: '', teacherId: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
             <ConfirmationModal
                isOpen={!!classToDelete}
                onClose={() => setClassToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Class"
                message="Are you sure? This will remove the class and subject associations."
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Class & Course Management</h1>
                <button onClick={openAdd} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                    <PlusCircle size={18} /><span>Add Class</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-light-blue border border-white/10 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 bg-gradient-to-l from-brand-light-blue to-transparent">
                            <button onClick={() => openEdit(cls)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40"><Edit size={16}/></button>
                            <button onClick={() => setClassToDelete(cls.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40"><Trash2 size={16}/></button>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-brand-neon-purple/20 rounded-lg text-brand-light-purple">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                                <p className="text-xs text-brand-silver-gray">{cls.subjects.length} Subjects</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-brand-silver-gray uppercase tracking-wider mb-1">Class Teacher</p>
                                <div className="flex items-center space-x-2">
                                    <Users size={16} className="text-gray-400"/>
                                    <span className="text-white">
                                        {teachers.find(t => t.id === cls.classTeacherId)?.name || <span className="text-gray-500 italic">Unassigned</span>}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs font-semibold text-brand-silver-gray uppercase tracking-wider mb-2">Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {cls.subjects.map((sub, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                                            {sub}
                                        </span>
                                    ))}
                                    {cls.subjects.length === 0 && <span className="text-xs text-gray-500 italic">No subjects added</span>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-brand-light-blue w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">{modalMode === 'add' ? 'Add New Class' : 'Edit Class'}</h2>
                                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-brand-silver-gray mb-1">Class Name</label>
                                    <input type="text" value={currentClass.name} onChange={e => setCurrentClass({...currentClass, name: e.target.value})} placeholder="e.g. 10-A" className="w-full input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-brand-silver-gray mb-1">Subjects (comma separated)</label>
                                    <input type="text" value={currentClass.subjects} onChange={e => setCurrentClass({...currentClass, subjects: e.target.value})} placeholder="Math, Physics, English" className="w-full input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm text-brand-silver-gray mb-1">Assign Class Teacher</label>
                                    <select value={currentClass.teacherId} onChange={e => setCurrentClass({...currentClass, teacherId: e.target.value})} className="w-full input-field">
                                        <option value="">Select a teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-6 py-2 bg-brand-neon-purple text-white rounded-lg hover:bg-opacity-80 transition-colors">Save Class</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClassManagement;
