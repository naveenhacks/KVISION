
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Import LandingPageContextType
import { LandingPageContext, LandingPageContextType } from '../../../context/LandingPageContext';
import { AuthContext } from '../../../context/AuthContext';
import { TextBlock, Stat, PrincipalInfo, HomepageAnnouncement, GalleryImage, User, ContactInfo } from '../../../types';
import { Save, Edit, Trash2, PlusCircle, Check, X, Eye, Image as ImageIcon, Megaphone, BarChart2, UserCircle, UploadCloud, Contact } from 'lucide-react';
import Alert from '../../common/Alert';
import ConfirmationModal from '../../common/ConfirmationModal';

const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const EditableTextBlock: React.FC<{
    sectionKey: 'vision' | 'mission' | 'coreValues';
    block: TextBlock;
    onSave: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => void;
}> = ({ sectionKey, block, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(block);
    
    useEffect(() => {
        setData(block);
    }, [block]);

    const handleSave = () => {
        onSave(sectionKey, data);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setData(block);
        setIsEditing(false);
    };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-white">{isEditing ? `Editing: ${block.title}` : data.title}</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white">
                        <Edit size={18} />
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={handleCancel} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <div className="space-y-2">
                    <label className="text-xs text-brand-silver-gray">Title</label>
                    <input type="text" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full input-field" />
                    <label className="text-xs text-brand-silver-gray">Content</label>
                    <textarea value={data.content} onChange={e => setData({ ...data, content: e.target.value })} rows={3} className="w-full input-field"></textarea>
                </div>
            ) : (
                <p className="text-sm text-brand-silver-gray">{data.content}</p>
            )}
        </div>
    );
};

const AdminHomepageManager: React.FC = () => {
    const { content, updatePrincipalInfo, updateTextBlock, updateStats, addAnnouncement, updateAnnouncement, deleteAnnouncement, addImage, deleteImage, updateSubmissionStatus, updateContactInfo } = useContext(LandingPageContext);
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('submissions');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const pendingSubmissions = [
        ...content.announcements.filter(a => a.status === 'pending'),
        ...content.galleryImages.filter(g => g.status === 'pending')
    ];

    const handleUpdateStatus = (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
        updateSubmissionStatus(type, id, status);
        setAlert({ message: `Submission ${status}.`, type: 'success' });
    };

    const tabs = [
        { id: 'submissions', label: 'Submissions', icon: Eye, count: pendingSubmissions.length },
        { id: 'general', label: 'General Info', icon: UserCircle },
        { id: 'contact', label: 'Contact Info', icon: Contact },
        { id: 'stats', label: 'Stats', icon: BarChart2 },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'submissions': return <SubmissionsReview content={content} onUpdateStatus={handleUpdateStatus} />;
            case 'general': return <GeneralInfoManager info={content.principalInfo} vision={content.vision} mission={content.mission} coreValues={content.coreValues} onSaveInfo={updatePrincipalInfo} onSaveBlock={updateTextBlock} setAlert={setAlert} />;
            case 'contact': return <ContactInfoManager contactInfo={content.contactInfo} onSave={updateContactInfo} setAlert={setAlert} />;
            case 'stats': return <StatsManager stats={content.stats} onSave={updateStats} setAlert={setAlert} />;
            case 'announcements': return <AnnouncementsManager announcements={content.announcements} onAdd={addAnnouncement} onDelete={deleteAnnouncement} user={user!} setAlert={setAlert} />;
            case 'gallery': return <GalleryManager images={content.galleryImages} onAdd={addImage} onDelete={deleteImage} user={user!} setAlert={setAlert} />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <h1 className="text-3xl font-bold text-white">Homepage Management</h1>
            
            <div className="border-b border-white/10">
                <div className="flex space-x-1 overflow-x-auto tab-scrollbar">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-light-blue text-white' : 'text-brand-silver-gray hover:bg-white/5 hover:text-white'}`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            {tab.count > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const SubmissionsReview: React.FC<{
    content: LandingPageContextType['content'],
    onUpdateStatus: (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => void
}> = ({ content, onUpdateStatus }) => {
    const pendingAnnouncements = content.announcements.filter(a => a.status === 'pending');
    const pendingImages = content.galleryImages.filter(g => g.status === 'pending');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Pending Submissions</h2>
            {pendingAnnouncements.length === 0 && pendingImages.length === 0 && (
                <p className="text-brand-silver-gray text-center py-8">No pending submissions to review.</p>
            )}
            
            {pendingAnnouncements.length > 0 && <h3 className="text-lg font-semibold text-brand-light-purple border-b border-white/10 pb-2">Announcements</h3>}
            <AnimatePresence>
            {pendingAnnouncements.map(item => (
                <motion.div
                    key={item.id} layout exit={{ opacity: 0, x: -50 }}
                    className="bg-white/5 p-4 rounded-lg flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
                >
                    <div className="flex-1 min-w-[250px] sm:min-w-[300px]">
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-sm text-brand-silver-gray mt-1 break-words">{item.content}</p>
                        <p className="text-xs text-gray-500 mt-2">Submitted by: {item.authorName} on {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                        <button onClick={() => onUpdateStatus('announcements', item.id, 'approved')} className="p-2 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/40"><Check size={18} /></button>
                        <button onClick={() => onUpdateStatus('announcements', item.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40"><X size={18} /></button>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
            
            {pendingImages.length > 0 && <h3 className="text-lg font-semibold text-brand-light-purple border-b border-white/10 pb-2 mt-6">Gallery Images</h3>}
             <AnimatePresence>
            {pendingImages.map(item => (
                <motion.div
                    key={item.id} layout exit={{ opacity: 0, x: -50 }}
                    className="bg-white/5 p-4 rounded-lg flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
                >
                    <div className="flex items-center space-x-4 flex-1 min-w-[250px] sm:min-w-[300px]">
                        <img src={item.src} alt={item.alt} className="w-20 h-20 object-cover rounded-md flex-shrink-0"/>
                        <div className="min-w-0">
                             <p className="font-bold text-white truncate">{item.alt}</p>
                            <p className="text-xs text-gray-500 mt-2">Submitted by: {item.authorName}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                        <button onClick={() => onUpdateStatus('galleryImages', item.id, 'approved')} className="p-2 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/40"><Check size={18} /></button>
                        <button onClick={() => onUpdateStatus('galleryImages', item.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40"><X size={18} /></button>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
    )
}

const GeneralInfoManager: React.FC<{
    info: PrincipalInfo;
    vision: TextBlock;
    mission: TextBlock;
    coreValues: TextBlock;
    onSaveInfo: (data: Partial<PrincipalInfo>) => void;
    onSaveBlock: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => void;
    setAlert: (alert: { message: string, type: 'success' | 'error' } | null) => void;
}> = ({ info, vision, mission, coreValues, onSaveInfo, onSaveBlock, setAlert }) => {
    
    const [principalData, setPrincipalData] = useState(info);
    const [isEditingPrincipal, setIsEditingPrincipal] = useState(false);

    useEffect(() => {
        setPrincipalData(info);
    }, [info]);
    
    const handleSavePrincipal = () => {
        onSaveInfo(principalData);
        setIsEditingPrincipal(false);
        setAlert({ message: 'Principal info updated.', type: 'success' });
    }

    const handleCancelPrincipal = () => {
        setPrincipalData(info);
        setIsEditingPrincipal(false);
    }
    
     const handleSaveBlock = (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => {
        onSaveBlock(key, data);
        setAlert({ message: `${key.charAt(0).toUpperCase() + key.slice(1)} section updated.`, type: 'success' });
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">General Information</h2>
            <div className="bg-white/5 p-4 rounded-lg space-y-3">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Principal's Message</h3>
                    {!isEditingPrincipal ? (
                        <button onClick={() => setIsEditingPrincipal(true)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white/10 text-brand-silver-gray rounded-md hover:bg-white/20 hover:text-white">
                            <Edit size={14} /><span>Edit</span>
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                             <button onClick={handleCancelPrincipal} className="px-3 py-1.5 text-sm bg-white/10 text-brand-silver-gray rounded-md hover:bg-white/20 hover:text-white">Cancel</button>
                             <button onClick={handleSavePrincipal} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-brand-neon-purple text-white rounded-md hover:bg-opacity-80">
                                <Save size={14} /><span>Save</span>
                            </button>
                        </div>
                    )}
                 </div>
                 {isEditingPrincipal ? (
                    <>
                        <input type="text" placeholder="Principal Name" value={principalData.name} onChange={e => setPrincipalData({...principalData, name: e.target.value})} className="w-full input-field"/>
                        <input type="text" placeholder="Section Title" value={principalData.title} onChange={e => setPrincipalData({...principalData, title: e.target.value})} className="w-full input-field"/>
                        <textarea placeholder="Message" value={principalData.message} onChange={e => setPrincipalData({...principalData, message: e.target.value})} rows={4} className="w-full input-field"/>
                        <input type="text" placeholder="Image URL" value={principalData.imageUrl} onChange={e => setPrincipalData({...principalData, imageUrl: e.target.value})} className="w-full input-field"/>
                    </>
                 ) : (
                    <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                        <img src={principalData.imageUrl} alt={principalData.name} className="w-32 h-32 rounded-full object-cover border-4 border-brand-light-purple" />
                        <div className="text-left">
                            <h4 className="text-xl font-bold text-white">{principalData.title}</h4>
                            <p className="text-md font-semibold text-brand-silver-gray mt-1">{principalData.name}</p>
                            <p className="text-sm text-gray-400 mt-2">"{principalData.message}"</p>
                        </div>
                    </div>
                 )}
            </div>
            <EditableTextBlock sectionKey="vision" block={vision} onSave={handleSaveBlock} />
            <EditableTextBlock sectionKey="mission" block={mission} onSave={handleSaveBlock} />
            <EditableTextBlock sectionKey="coreValues" block={coreValues} onSave={handleSaveBlock} />
        </div>
    )
}

const ContactInfoManager: React.FC<{
    contactInfo: ContactInfo;
    onSave: (info: ContactInfo) => void;
    setAlert: (alert: { message: string, type: 'success' | 'error' } | null) => void;
}> = ({ contactInfo, onSave, setAlert }) => {
    const [formData, setFormData] = useState(contactInfo);

    useEffect(() => { setFormData(contactInfo) }, [contactInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(formData);
        setAlert({ message: 'Contact info updated successfully.', type: 'success' });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Manage Contact Information</h2>
            <div className="bg-white/5 p-6 rounded-lg space-y-4">
                <div>
                    <label className="text-sm text-brand-silver-gray">School Name</label>
                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full input-field mt-1" />
                </div>
                <div>
                    <label className="text-sm text-brand-silver-gray">Address</label>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full input-field mt-1" />
                </div>
                <div>
                    <label className="text-sm text-brand-silver-gray">Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full input-field mt-1" />
                </div>
                <div>
                    <label className="text-sm text-brand-silver-gray">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full input-field mt-1" />
                </div>
                <div>
                    <label className="text-sm text-brand-silver-gray">Website (without https://)</label>
                    <input name="website" value={formData.website} onChange={handleChange} className="w-full input-field mt-1" />
                </div>
                <div className="pt-2">
                    <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 text-sm bg-brand-neon-purple text-white rounded-md hover:bg-opacity-80">
                        <Save size={16} /><span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatsManager: React.FC<{
    stats: Stat[];
    onSave: (stats: Stat[]) => void;
    setAlert: (alert: { message: string, type: 'success' | 'error' } | null) => void;
}> = ({ stats, onSave, setAlert }) => {
    const [editingStats, setEditingStats] = useState<Stat[]>(stats);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        setEditingStats(stats);
    }, [stats]);

    const handleStatChange = (id: string, field: 'label' | 'value', value: string | number) => {
        setEditingStats(currentStats =>
            currentStats.map(stat =>
                stat.id === id ? { ...stat, [field]: field === 'value' ? Number(value) : value } : stat
            )
        );
    };

    const handleSave = () => {
        onSave(editingStats);
        setIsEditing(false);
        setAlert({ message: 'Stats updated successfully.', type: 'success' });
    };
    
    const handleCancel = () => {
        setEditingStats(stats);
        setIsEditing(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-white">Manage Statistics</h2>
                {!isEditing ? (
                     <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white/10 text-brand-silver-gray rounded-md hover:bg-white/20 hover:text-white">
                        <Edit size={14} /><span>Edit Stats</span>
                    </button>
                ) : (
                    <div className="flex space-x-2">
                         <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-white/10 text-brand-silver-gray rounded-md hover:bg-white/20 hover:text-white">Cancel</button>
                         <button onClick={handleSave} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-brand-neon-purple text-white rounded-md hover:bg-opacity-80">
                            <Save size={14} /><span>Save Changes</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editingStats.map(stat => (
                    <div key={stat.id} className="bg-white/5 p-4 rounded-lg">
                        {isEditing ? (
                             <div className="space-y-2">
                                <label className="text-xs text-brand-silver-gray">Label</label>
                                <input 
                                    type="text" 
                                    value={stat.label} 
                                    onChange={e => handleStatChange(stat.id, 'label', e.target.value)} 
                                    className="w-full input-field"
                                />
                                <label className="text-xs text-brand-silver-gray">Value</label>
                                <input 
                                    type="number" 
                                    value={stat.value} 
                                    onChange={e => handleStatChange(stat.id, 'value', e.target.value)} 
                                    className="w-full input-field"
                                />
                            </div>
                        ) : (
                             <div className="space-y-1">
                                <p className="text-brand-silver-gray text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}


const AnnouncementsManager: React.FC<{
    announcements: HomepageAnnouncement[];
    onAdd: (ann: Omit<HomepageAnnouncement, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string, type: 'success' | 'error' } | null) => void;
}> = ({ announcements, onAdd, onDelete, user, setAlert }) => {
    const [newAnn, setNewAnn] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    const [itemToDelete, setItemToDelete] = useState<HomepageAnnouncement | null>(null);
    
    const handleAdd = () => {
        if(!newAnn.title || !newAnn.content) return;
        onAdd({ ...newAnn, status: 'approved', submittedBy: user.id, authorName: user.name });
        setNewAnn({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
        setAlert({ message: 'Announcement added.', type: 'success'});
    }
    
    const handleRemoveClick = (announcement: HomepageAnnouncement) => {
        setItemToDelete(announcement);
    };

    const confirmRemove = async () => {
        if (!itemToDelete) return;
        try {
            await onDelete(itemToDelete.id);
            setAlert({ message: 'Announcement removed successfully.', type: 'success'});
        } catch (error) {
            setAlert({ message: 'Failed to remove announcement.', type: 'error'});
        }
        setItemToDelete(null);
    };
    
    return (
        <div className="space-y-4">
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmRemove}
                title="Remove Announcement"
                message={`Are you sure you want to remove "${itemToDelete?.title}"? This cannot be undone.`}
                confirmText="Remove"
            />
            <h2 className="text-2xl font-semibold text-white">Manage Announcements</h2>
             <div className="bg-white/5 p-4 rounded-lg space-y-2">
                <h3 className="font-bold">Add New Announcement</h3>
                <input type="text" placeholder="Title" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className="w-full input-field"/>
                <textarea placeholder="Content" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} className="w-full input-field" rows={2}></textarea>
                <input type="date" value={newAnn.date} onChange={e => setNewAnn({...newAnn, date: e.target.value})} className="w-full input-field"/>
                <button onClick={handleAdd} className="px-4 py-2 text-sm bg-brand-neon-purple rounded-lg">Add</button>
            </div>
            <div className="space-y-2">
                <AnimatePresence>
                {announcements.filter(a => a.status === 'approved').map(item => (
                    <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white/5 p-3 rounded-lg flex justify-between items-center gap-4"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-xs text-brand-silver-gray">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleRemoveClick(item)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md flex-shrink-0"><Trash2 size={16} /></button>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

const GalleryManager: React.FC<{
    images: GalleryImage[];
    onAdd: (img: Omit<GalleryImage, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string, type: 'success' | 'error' } | null) => void;
}> = ({ images, onAdd, onDelete, user, setAlert }) => {
    const [newImg, setNewImg] = useState({ src: '', alt: '' });
    const [itemToDelete, setItemToDelete] = useState<GalleryImage | null>(null);
    
    const handleAdd = () => {
        if(!newImg.src || !newImg.alt) return;
        onAdd({ ...newImg, status: 'approved', submittedBy: user.id, authorName: user.name });
        setNewImg({ src: '', alt: '' });
        setAlert({ message: 'Image added to gallery.', type: 'success'});
    }
    
    const handleRemoveClick = (image: GalleryImage) => {
        setItemToDelete(image);
    };

    const confirmRemove = async () => {
        if (!itemToDelete) return;
        try {
            await onDelete(itemToDelete.id);
            setAlert({ message: 'Image removed successfully.', type: 'success' });
        } catch (error) {
            setAlert({ message: 'Failed to remove image.', type: 'error' });
        }
        setItemToDelete(null);
    };

    return (
        <div className="space-y-4">
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmRemove}
                title="Remove Image"
                message={`Are you sure you want to remove the image "${itemToDelete?.alt}" from the gallery?`}
                confirmText="Remove"
            />
             <h2 className="text-2xl font-semibold text-white">Manage Gallery</h2>
             <div className="bg-white/5 p-4 rounded-lg space-y-2">
                <h3 className="font-bold">Add New Image</h3>
                <input type="text" placeholder="Image URL" value={newImg.src} onChange={e => setNewImg({...newImg, src: e.target.value})} className="w-full input-field"/>
                <input type="text" placeholder="Alt Text" value={newImg.alt} onChange={e => setNewImg({...newImg, alt: e.target.value})} className="w-full input-field"/>
                <button onClick={handleAdd} className="px-4 py-2 text-sm bg-brand-neon-purple rounded-lg">Add</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                {images.filter(img => img.status === 'approved').map(item => (
                    <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                        className="relative group"
                    >
                        <img src={item.src} alt={item.alt} className="w-full h-32 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button onClick={() => handleRemoveClick(item)} className="p-2 bg-red-500/80 text-white rounded-full"><Trash2 size={18}/></button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    )
};

export default AdminHomepageManager;
