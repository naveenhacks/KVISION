

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Image as ImageIcon, UploadCloud, File as FileIcon } from 'lucide-react';
import { LandingPageContext } from '../../../context/LandingPageContext';
import { AuthContext } from '../../../context/AuthContext';
import { UploadedFile } from '../../../types';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ContributionModal: React.FC<{ onClose: () => void; onSuccess: () => void; }> = ({ onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const { addAnnouncement, addImage } = useContext(LandingPageContext);
    const [activeTab, setActiveTab] = useState('announcement');
    
    // Announcement state
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });

    // Image state
    const [image, setImage] = useState<UploadedFile | null>(null);
    const [altText, setAltText] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;
        setError('');
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File is too large. Maximum size is 2MB.');
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload a PNG, JPG, or WEBP.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImage({
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                dataUrl: reader.result as string,
            });
            if (!altText) setAltText(selectedFile.name.split('.')[0]);
        };
        reader.readAsDataURL(selectedFile);
    };
    
    const handleSubmit = () => {
        if (!user) return;

        if (activeTab === 'announcement' && announcement.title && announcement.content) {
            addAnnouncement({
                ...announcement,
                date: new Date().toISOString(),
                status: 'pending',
                submittedBy: user.id,
                authorName: user.name,
            });
            onSuccess();
        } else if (activeTab === 'image' && image && altText) {
            addImage({
                src: image.dataUrl,
                alt: altText,
                status: 'pending',
                submittedBy: user.id,
                authorName: user.name,
            });
            onSuccess();
        } else {
            setError("Please fill all required fields.");
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
                className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Contribute to Homepage</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10"><X size={20} /></button>
                    </div>

                    <div className="flex border-b border-white/10 mb-4">
                        <TabButton id="announcement" label="Announcement" icon={Megaphone} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="image" label="Gallery Image" icon={ImageIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {activeTab === 'announcement' ? (
                                <>
                                    <input type="text" placeholder="Announcement Title" value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} className="w-full input-field" />
                                    <textarea placeholder="Content..." value={announcement.content} onChange={e => setAnnouncement({ ...announcement, content: e.target.value })} rows={4} className="w-full input-field" />
                                </>
                            ) : (
                                <>
                                    <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10" onClick={() => document.getElementById('file-upload')?.click()}>
                                        {image ? (
                                            <img src={image.dataUrl} alt="preview" className="max-h-32 rounded-md" />
                                        ) : (
                                             <>
                                                <UploadCloud size={32} className="text-brand-light-purple" />
                                                <p className="mt-2 text-sm text-brand-silver-gray">Click to upload image</p>
                                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                                             </>
                                        )}
                                        <input id="file-upload" type="file" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" accept={ALLOWED_FILE_TYPES.join(',')} />
                                    </div>
                                    <input type="text" placeholder="Image description (alt text)" value={altText} onChange={e => setAltText(e.target.value)} className="w-full input-field" />
                                </>
                            )}
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </motion.div>
                    </AnimatePresence>
                    
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSubmit} className="px-5 py-2.5 bg-brand-neon-purple text-white rounded-lg hover:bg-opacity-80 transition-colors">Submit for Review</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ElementType;
    activeTab: string;
    setActiveTab: (id: string) => void;
}> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === id ? 'text-brand-light-purple' : 'text-brand-silver-gray hover:text-white'
        }`}
    >
        <Icon size={16} />
        <span>{label}</span>
        {activeTab === id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-light-purple" />}
    </button>
);

export default ContributionModal;