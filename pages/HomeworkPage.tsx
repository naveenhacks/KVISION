
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeworkContext } from '../context/HomeworkContext';
import { AuthContext } from '../context/AuthContext';
import { Homework, UploadedFile } from '../types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ArrowLeft, UploadCloud, File as FileIcon, X, CheckCircle, ShieldAlert, Loader } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const Alert: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50';
    const textColor = isSuccess ? 'text-green-300' : 'text-red-300';
    const Icon = isSuccess ? CheckCircle : ShieldAlert;
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className={`fixed top-24 right-8 z-50 p-4 rounded-lg flex items-center space-x-3 text-sm border ${bgColor} ${textColor} shadow-lg`}
        >
            <Icon className="w-5 h-5" />
            <span>{message}</span>
            <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full">
                <X size={16} />
            </button>
        </motion.div>
    );
};

const HomeworkPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addHomework, updateHomework, getHomeworkById } = useContext(HomeworkContext);
    const { user } = useContext(AuthContext);

    const isEditMode = Boolean(id);
    const [title, setTitle] = useState('');
    const [course, setCourse] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isEditMode && id) {
            const homeworkToEdit = getHomeworkById(id);
            if (homeworkToEdit) {
                setTitle(homeworkToEdit.title);
                setCourse(homeworkToEdit.course);
                setDueDate(homeworkToEdit.dueDate);
                setDescription(homeworkToEdit.description);
                setFile(homeworkToEdit.file || null);
            } else {
                 navigate('/dashboard'); // Homework not found
            }
        }
    }, [id, isEditMode, getHomeworkById, navigate]);
    
    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;

        setError('');
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File is too large. Maximum size is 5MB.');
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload a PDF, DOC, DOCX, PNG, or JPG.');
            return;
        }

        const reader = new FileReader();
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(progress);
            }
        };
        reader.onloadstart = () => {
            setIsUploading(true);
            setUploadProgress(0);
        };
        reader.onloadend = () => {
            setIsUploading(false);
            setUploadProgress(100);
        };
        reader.onload = () => {
            setFile({
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                dataUrl: reader.result as string,
            });
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-brand-light-purple');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => e.currentTarget.classList.add('border-brand-light-purple');
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => e.currentTarget.classList.remove('border-brand-light-purple');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !course || !dueDate || !description || !user) {
            setError('Please fill out all required fields.');
            return;
        }
        
        const homeworkData: Omit<Homework, 'id' | 'uploadDate' | 'completed'> = { 
            title, 
            course, 
            dueDate, 
            description, 
            teacherId: user.id,
            teacherName: user.name,
            file: file || undefined 
        };

        if (isEditMode && id) {
            updateHomework(id, homeworkData);
            setAlert({ message: 'Homework updated successfully!', type: 'success' });
        } else {
            addHomework(homeworkData as Omit<Homework, 'id' | 'uploadDate'>);
            setAlert({ message: 'Homework uploaded successfully!', type: 'success' });
        }
        
        setTimeout(() => navigate('/dashboard'), 1000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };
    
    return (
        <DashboardLayout>
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                <motion.div variants={containerVariants} className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 mr-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold text-white">{isEditMode ? 'Edit Homework' : 'Upload New Homework'}</h1>
                </motion.div>
                
                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={containerVariants}>
                            <label htmlFor="title" className="block text-sm font-medium text-brand-silver-gray">Title</label>
                            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full input-field" />
                        </motion.div>
                        <motion.div variants={containerVariants}>
                            <label htmlFor="course" className="block text-sm font-medium text-brand-silver-gray">Subject / Course</label>
                            <input id="course" type="text" value={course} onChange={e => setCourse(e.target.value)} required className="mt-1 block w-full input-field" />
                        </motion.div>
                    </div>

                    <motion.div variants={containerVariants}>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-brand-silver-gray">Due Date</label>
                        <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="mt-1 block w-full input-field"/>
                    </motion.div>

                    <motion.div variants={containerVariants}>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-silver-gray">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="mt-1 block w-full input-field min-h-[120px]"></textarea>
                    </motion.div>

                    <motion.div variants={containerVariants}>
                        <label className="block text-sm font-medium text-brand-silver-gray mb-1">Attach File (Optional)</label>
                        <div 
                           className="relative flex flex-col items-center justify-center p-8 mt-1 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10"
                           onDrop={handleDrop}
                           onDragOver={handleDragOver}
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                        >
                            <UploadCloud size={40} className="text-brand-light-purple" />
                            <p className="mt-2 text-brand-silver-gray">Drag & drop a file here, or click to select</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, PNG, JPG up to 5MB</p>
                            <input type="file" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                    {(isUploading || file) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            {isUploading ? (
                                <div className="flex items-center space-x-3">
                                    <Loader className="animate-spin text-brand-light-purple"/>
                                    <div className="w-full bg-white/10 rounded-full h-2.5">
                                        <div className="bg-brand-neon-purple h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                    <span className="text-sm">{uploadProgress}%</span>
                                </div>
                            ) : file && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        {file.type.startsWith('image/') ? (
                                            <img src={file.dataUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                        ) : (
                                            <FileIcon className="w-10 h-10 text-brand-silver-gray flex-shrink-0" />
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                            <p className="text-xs text-brand-silver-gray">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFile(null)} className="p-2 rounded-full text-red-400 hover:bg-red-500/20"><X size={16}/></button>
                                </div>
                            )}
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {error && <p className="text-red-400 text-sm flex items-center"><ShieldAlert size={16} className="mr-2"/>{error}</p>}

                    <motion.div variants={containerVariants} className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-white bg-brand-neon-purple hover:bg-opacity-80 transition-colors">{isEditMode ? 'Save Changes' : 'Upload Homework'}</button>
                    </motion.div>
                </form>
            </motion.div>
        </DashboardLayout>
    );
};

export default HomeworkPage;