
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Import LandingPageContextType
import { LandingPageContext, LandingPageContextType } from '../../../context/LandingPageContext.tsx';
import { AuthContext } from '../../../context/AuthContext.tsx';
import { TextBlock, Stat, PrincipalInfo, HomepageAnnouncement, GalleryImage, User, ContactInfo } from '../../../types.ts';
import { Save, Edit, Trash2, PlusCircle, Check, X, Eye, Image as ImageIcon, Megaphone, BarChart2, UserCircle, UploadCloud, Contact } from 'lucide-react';
import Alert from '../../common/Alert.tsx';
import ConfirmationModal from '../../common/ConfirmationModal.tsx';

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

// FIX: Define missing components
const GeneralInfoManager: React.FC<{
    info: PrincipalInfo;
    vision: TextBlock;
    mission: TextBlock;
    coreValues: TextBlock;
    onSaveInfo: (info: Partial<PrincipalInfo>) => void;
    onSaveBlock: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => void;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ info, vision, mission, coreValues, onSaveInfo, onSaveBlock, setAlert }) => {
    const [principalInfo, setPrincipalInfo] = useState(info);
    const [isEditingPrincipal, setIsEditingPrincipal] = useState(false);

    useEffect(() => {
        setPrincipalInfo(info);
    }, [info]);

    const handlePrincipalSave = () => {
        onSaveInfo(principalInfo);
        setIsEditingPrincipal(false);
        setAlert({ message: 'Principal info updated.', type: 'success' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-white">Principal's Message</h3>
                    {!isEditingPrincipal ? (
                        <button onClick={() => setIsEditingPrincipal(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                    ) : (
                        <div className="flex space-x-2">
                             <button onClick={() => { setIsEditingPrincipal(false); setPrincipalInfo(info); }} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                            <button onClick={handlePrincipalSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                        </div>
                    )}
                </div>
                {isEditingPrincipal ? (
                     <div className="space-y-2">
                        <label className="text-xs text-brand-silver-gray">Name</label>
                        <input type="text" value={principalInfo.name} onChange={e => setPrincipalInfo({ ...principalInfo, name: e.target.value })} className="w-full input-field" />
                        <label className="text-xs text-brand-silver-gray">Image URL</label>
                        <input type="text" value={principalInfo.imageUrl} onChange={e => setPrincipalInfo({ ...principalInfo, imageUrl: e.target.value })} className="w-full input-field" />
                        <label className="text-xs text-brand-silver-gray">Message</label>
                        <textarea value={principalInfo.message} onChange={e => setPrincipalInfo({ ...principalInfo, message: e.target.value })} rows={4} className="w-full input-field"></textarea>
                    </div>
                ) : (
                    <div className="flex items-start space-x-4">
                        <img src={principalInfo.imageUrl} alt={principalInfo.name} className="w-24 h-24 rounded-full object-cover"/>
                        <div>
                            <p className="font-bold text-white">{principalInfo.name}</p>
                            <p className="text-sm text-brand-silver-gray italic">"{principalInfo.message}"</p>
                        </div>
                    </div>
                )}
            </div>
            <EditableTextBlock sectionKey="vision" block={vision} onSave={onSaveBlock} />
            <EditableTextBlock sectionKey="mission" block={mission} onSave={onSaveBlock} />
            <EditableTextBlock sectionKey="coreValues" block={coreValues} onSave={onSaveBlock} />
        </div>
    );
};

const ContactInfoManager: React.FC<{
    contactInfo: ContactInfo;
    onSave: (info: ContactInfo) => void;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ contactInfo, onSave, setAlert }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(contactInfo);

    useEffect(() => {
        setData(contactInfo);
    }, [contactInfo]);

    const handleSave = () => {
        onSave(data);
        setIsEditing(false);
        setAlert({ message: 'Contact info updated.', type: 'success' });
    };

    const handleCancel = () => {
        setData(contactInfo);
        setIsEditing(false);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Contact Information</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={handleCancel} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="schoolName" value={data.schoolName} onChange={handleChange} className="input-field" placeholder="School Name" />
                    <input name="address" value={data.address} onChange={handleChange} className="input-field" placeholder="Address" />
                    <input name="email" value={data.email} onChange={handleChange} className="input-field" placeholder="Email" />
                    <input name="phone" value={data.phone} onChange={handleChange} className="input-field" placeholder="Phone" />
                    <input name="website" value={data.website} onChange={handleChange} className="input-field md:col-span-2" placeholder="Website" />
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key}>
                            <p className="capitalize text-xs text-brand-silver-gray">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-white">{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatsManager: React.FC<{
    stats: Stat[];
    onSave: (stats: Stat[]) => void;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ stats, onSave, setAlert }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentStats, setCurrentStats] = useState(stats);
    
    useEffect(() => {
        setCurrentStats(stats);
    }, [stats]);

    const handleStatChange = (id: string, field: 'label' | 'value', value: string | number) => {
        setCurrentStats(currentStats.map(stat => stat.id === id ? { ...stat, [field]: value } : stat));
    };

    const handleSave = () => {
        onSave(currentStats);
        setIsEditing(false);
        setAlert({ message: 'Stats updated.', type: 'success' });
    };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">School Statistics</h3>
                 {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={() => { setIsEditing(false); setCurrentStats(stats); }} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentStats.map(stat => (
                    <div key={stat.id} className="bg-white/10 p-3 rounded-md">
                        {isEditing ? (
                            <div className="space-y-1">
                                <input type="text" value={stat.label} onChange={e => handleStatChange(stat.id, 'label', e.target.value)} className="w-full input-field text-sm p-1" />
                                <input type="number" value={stat.value} onChange={e => handleStatChange(stat.id, 'value', parseInt(e.target.value, 10))} className="w-full input-field text-lg font-bold p-1" />
                            </div>
                        ) : (
                             <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-brand-silver-gray">{stat.label}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnnouncementsManager: React.FC<{
    announcements: HomepageAnnouncement[];
    onAdd: (announcement: Omit<HomepageAnnouncement, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ announcements, onAdd, onDelete, user, setAlert }) => {
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [itemToDelete, setItemToDelete] = useState<HomepageAnnouncement | null>(null);

    const handleAdd = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            setAlert({ message: 'Title and content are required.', type: 'error' });
            return;
        }
        onAdd({
            ...newAnnouncement,
            date: new Date().toISOString(),
            status: 'approved',
            submittedBy: user.id,
            authorName: user.name,
        });
        setNewAnnouncement({ title: '', content: '' });
        setAlert({ message: 'Announcement added.', type: 'success' });
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        await onDelete(itemToDelete.id);
        setAlert({ message: 'Announcement deleted.', type: 'success' });
        setItemToDelete(null);
    };

    const approvedAnnouncements = announcements.filter(a => a.status === 'approved');

    return (
        <div className="space-y-6">
             <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} title="Delete Announcement" message={`Are you sure you want to delete "${itemToDelete?.title}"?`} />
            <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg text-white">Add New Announcement</h3>
                <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full input-field" />
                <textarea placeholder="Content" value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} rows={3} className="w-full input-field"></textarea>
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-neon-purple text-white rounded-lg flex items-center space-x-2"><PlusCircle size={18} /><span>Add</span></button>
            </div>
             <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-3">Manage Announcements</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {approvedAnnouncements.map(ann => (
                        <div key={ann.id} className="bg-white/10 p-3 rounded-md flex justify-between items-start">
                           <div>
                             <p className="font-semibold text-white">{ann.title}</p>
                             <p className="text-sm text-brand-silver-gray">{ann.content}</p>
                             <p className="text-xs text-gray-500 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                           </div>
                           <button onClick={() => setItemToDelete(ann)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md flex-shrink-0"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GalleryManager: React.FC<{
    images: GalleryImage[];
    onAdd: (image: Omit<GalleryImage, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ images, onAdd, onDelete, user, setAlert }) => {
    const [newImage, setNewImage] = useState<{ src: string, alt: string } | null>(null);
    const [altText, setAltText] = useState('');
    const [itemToDelete, setItemToDelete] = useState<GalleryImage | null>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewImage({ src: event.target?.result as string, alt: '' });
                setAltText(file.name.split('.')[0]); // Default alt text
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = () => {
        if (!newImage || !altText) {
            setAlert({ message: 'Image and description are required.', type: 'error' });
            return;
        }
        onAdd({
            src: newImage.src,
            alt: altText,
            status: 'approved',
            submittedBy: user.id,
            authorName: user.name,
        });
        setNewImage(null);
        setAltText('');
        setAlert({ message: 'Image added.', type: 'success' });
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        await onDelete(itemToDelete.id);
        setAlert({ message: 'Image deleted.', type: 'success' });
        setItemToDelete(null);
    };
    
    const approvedImages = images.filter(i => i.status === 'approved');

    return (
        <div className="space-y-6">
            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} title="Delete Image" message={`Are you sure you want to delete this image?`} />
            <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg text-white">Add New Image</h3>
                <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10">
                    <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    {newImage ? (
                        <img src={newImage.src} alt="preview" className="max-h-32 rounded-md" />
                    ) : (
                         <>
                            <UploadCloud size={32} className="text-brand-light-purple" />
                            <p className="mt-2 text-sm text-brand-silver-gray">Click to upload image</p>
                         </>
                    )}
                </div>
                {newImage && (
                    <div className="space-y-2">
                         <input type="text" placeholder="Image description (alt text)" value={altText} onChange={e => setAltText(e.target.value)} className="w-full input-field" />
                         <button onClick={handleAdd} className="px-4 py-2 bg-brand-neon-purple text-white rounded-lg flex items-center space-x-2"><PlusCircle size={18} /><span>Add Image</span></button>
                    </div>
                )}
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
                 <h3 className="font-bold text-lg text-white mb-3">Manage Gallery</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {approvedImages.map(img => (
                         <div key={img.id} className="relative group">
                             <img src={img.src} alt={img.alt} className="aspect-square w-full h-full object-cover rounded-md"/>
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <p className="text-white text-xs text-center">{img.alt}</p>
                                <button onClick={() => setItemToDelete(img)} className="absolute top-1 right-1 p-1 bg-red-500/50 text-white rounded-full hover:bg-red-500"><Trash2 size={14} /></button>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
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
    );
};

// FIX: Add default export
export default AdminHomepageManager;
