
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPageContext, LandingPageContextType } from '../../../context/LandingPageContext.tsx';
import { AuthContext } from '../../../context/AuthContext.tsx';
import { TextBlock, Stat, PrincipalInfo, HomepageAnnouncement, GalleryImage, User, ContactInfo } from '../../../types.ts';
import { Save, Edit, Trash2, PlusCircle, Check, X, Eye, Image as ImageIcon, Megaphone, BarChart2, UserCircle, UploadCloud, Contact, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import Alert from '../../common/Alert.tsx';
import ConfirmationModal from '../../common/ConfirmationModal.tsx';

const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// ... EditableTextBlock (Keep existing) ...
const EditableTextBlock: React.FC<{
    sectionKey: 'vision' | 'mission' | 'coreValues';
    block: TextBlock;
    onSave: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => void;
}> = ({ sectionKey, block, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(block);
    
    useEffect(() => { setData(block); }, [block]);

    const handleSave = () => { onSave(sectionKey, data); setIsEditing(false); };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-white">{isEditing ? `Editing: ${block.title}` : data.title}</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={() => setIsEditing(false)} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <div className="space-y-2">
                    <input type="text" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full input-field" />
                    <textarea value={data.content} onChange={e => setData({ ...data, content: e.target.value })} rows={3} className="w-full input-field"></textarea>
                </div>
            ) : (
                <p className="text-sm text-brand-silver-gray">{data.content}</p>
            )}
        </div>
    );
};

// ... GeneralInfoManager (Keep existing) ...
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

    useEffect(() => { setPrincipalInfo(info); }, [info]);

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
                             <button onClick={() => setIsEditingPrincipal(false)} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                            <button onClick={handlePrincipalSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                        </div>
                    )}
                </div>
                {isEditingPrincipal ? (
                     <div className="space-y-2">
                        <input type="text" placeholder="Name" value={principalInfo.name} onChange={e => setPrincipalInfo({ ...principalInfo, name: e.target.value })} className="w-full input-field" />
                        <input type="text" placeholder="Image URL" value={principalInfo.imageUrl} onChange={e => setPrincipalInfo({ ...principalInfo, imageUrl: e.target.value })} className="w-full input-field" />
                        <textarea placeholder="Message" value={principalInfo.message} onChange={e => setPrincipalInfo({ ...principalInfo, message: e.target.value })} rows={4} className="w-full input-field"></textarea>
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

// ... ContactInfoManager (Keep existing) ...
const ContactInfoManager: React.FC<{
    contactInfo: ContactInfo;
    onSave: (info: ContactInfo) => void;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ contactInfo, onSave, setAlert }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(contactInfo);
    useEffect(() => { setData(contactInfo); }, [contactInfo]);
    const handleSave = () => { onSave(data); setIsEditing(false); setAlert({ message: 'Contact info updated.', type: 'success' }); };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Contact Information</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={() => setIsEditing(false)} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(data).map(key => (
                         <input key={key} name={key} value={(data as any)[key]} onChange={e => setData({...data, [key]: e.target.value})} className="input-field" placeholder={key} />
                    ))}
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

const SectionVisibilityManager: React.FC = () => {
    // Placeholder for actual implementation hooked to context
    const sections = [
        { id: 'principal', label: 'Principal Message', enabled: true },
        { id: 'about', label: 'About School', enabled: true },
        { id: 'gallery', label: 'Photo Gallery', enabled: true },
        { id: 'contact', label: 'Contact Information', enabled: true },
    ];
    return (
        <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="font-bold text-lg text-white mb-4">Section Visibility</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map(section => (
                    <div key={section.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-white">{section.label}</span>
                        <button className="text-brand-neon-purple hover:text-brand-light-purple transition-colors">
                            {section.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600"/>}
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-xs text-brand-silver-gray mt-4">* Toggle sections to show or hide them on the public homepage.</p>
        </div>
    );
}

// ... StatsManager (Keep existing) ...
const StatsManager: React.FC<{
    stats: Stat[];
    onSave: (stats: Stat[]) => void;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ stats, onSave, setAlert }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentStats, setCurrentStats] = useState(stats);
    useEffect(() => { setCurrentStats(stats); }, [stats]);
    const handleSave = () => { onSave(currentStats); setIsEditing(false); setAlert({ message: 'Stats updated.', type: 'success' }); };

    return (
        <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">School Statistics</h3>
                 {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-brand-silver-gray hover:text-white"><Edit size={18} /></button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={() => setIsEditing(false)} className="p-2 text-brand-silver-gray hover:text-white"><X size={18} /></button>
                        <button onClick={handleSave} className="p-2 text-green-400 hover:text-white"><Check size={18} /></button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentStats.map(stat => (
                    <div key={stat.id} className="bg-white/10 p-3 rounded-md">
                        {isEditing ? (
                            <div className="space-y-1">
                                <input type="text" value={stat.label} onChange={e => setCurrentStats(currentStats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s))} className="w-full input-field text-sm p-1" />
                                <input type="number" value={stat.value} onChange={e => setCurrentStats(currentStats.map(s => s.id === stat.id ? {...s, value: parseInt(e.target.value)} : s))} className="w-full input-field text-lg font-bold p-1" />
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

// ... AnnouncementsManager (Keep existing) ...
const AnnouncementsManager: React.FC<{
    announcements: HomepageAnnouncement[];
    onAdd: (announcement: Omit<HomepageAnnouncement, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ announcements, onAdd, onDelete, user, setAlert }) => {
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const handleAdd = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return;
        onAdd({ ...newAnnouncement, date: new Date().toISOString(), status: 'approved', submittedBy: user.id, authorName: user.name });
        setNewAnnouncement({ title: '', content: '' });
        setAlert({ message: 'Announcement added.', type: 'success' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg text-white">Add New Announcement</h3>
                <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full input-field" />
                <textarea placeholder="Content" value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} rows={3} className="w-full input-field"></textarea>
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-neon-purple text-white rounded-lg flex items-center space-x-2"><PlusCircle size={18} /><span>Add</span></button>
            </div>
             <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-3">Manage Announcements</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {announcements.filter(a => a.status === 'approved').map(ann => (
                        <div key={ann.id} className="bg-white/10 p-3 rounded-md flex justify-between items-start">
                           <div>
                             <p className="font-semibold text-white">{ann.title}</p>
                             <p className="text-sm text-brand-silver-gray">{ann.content}</p>
                             <p className="text-xs text-gray-500 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                           </div>
                           <button onClick={() => onDelete(ann.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... GalleryManager (Keep existing) ...
const GalleryManager: React.FC<{
    images: GalleryImage[];
    onAdd: (image: Omit<GalleryImage, 'id'>) => void;
    onDelete: (id: string) => Promise<void>;
    user: User;
    setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}> = ({ images, onAdd, onDelete, user, setAlert }) => {
    const [newImage, setNewImage] = useState<{ src: string, alt: string } | null>(null);
    const [altText, setAltText] = useState('');
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewImage({ src: event.target?.result as string, alt: '' });
                setAltText(file.name.split('.')[0]);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAdd = () => {
        if (!newImage || !altText) return;
        onAdd({ src: newImage.src, alt: altText, status: 'approved', submittedBy: user.id, authorName: user.name });
        setNewImage(null); setAltText(''); setAlert({ message: 'Image added.', type: 'success' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg text-white">Add New Image</h3>
                <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10">
                    <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    {newImage ? <img src={newImage.src} alt="preview" className="max-h-32 rounded-md" /> : <UploadCloud size={32} className="text-brand-light-purple" />}
                </div>
                {newImage && (
                    <div className="space-y-2">
                         <input type="text" placeholder="Description" value={altText} onChange={e => setAltText(e.target.value)} className="w-full input-field" />
                         <button onClick={handleAdd} className="px-4 py-2 bg-brand-neon-purple text-white rounded-lg"><PlusCircle size={18} /> Add</button>
                    </div>
                )}
            </div>
             <div className="bg-white/5 p-4 rounded-lg">
                 <h3 className="font-bold text-lg text-white mb-3">Gallery</h3>
                 <div className="grid grid-cols-4 gap-4">
                     {images.filter(i => i.status === 'approved').map(img => (
                         <div key={img.id} className="relative group">
                             <img src={img.src} alt={img.alt} className="aspect-square w-full h-full object-cover rounded-md"/>
                             <button onClick={() => onDelete(img.id)} className="absolute top-1 right-1 p-1 bg-red-500/50 text-white rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

// ... SubmissionsReview (Keep existing) ...
const SubmissionsReview: React.FC<{
    content: LandingPageContextType['content'],
    onUpdateStatus: (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => void
}> = ({ content, onUpdateStatus }) => {
    const pendingAnnouncements = content.announcements.filter(a => a.status === 'pending');
    const pendingImages = content.galleryImages.filter(g => g.status === 'pending');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Pending Submissions</h2>
            {pendingAnnouncements.length === 0 && pendingImages.length === 0 && <p className="text-brand-silver-gray py-8">No pending submissions.</p>}
            <div className="space-y-2">
                {pendingAnnouncements.map(item => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{item.title}</p>
                            <p className="text-sm text-brand-silver-gray">{item.content}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => onUpdateStatus('announcements', item.id, 'approved')} className="p-2 bg-green-500/20 text-green-400 rounded"><Check size={18} /></button>
                            <button onClick={() => onUpdateStatus('announcements', item.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 rounded"><X size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Gallery images review similarly structure if needed */}
        </div>
    );
};


const AdminHomepageManager: React.FC = () => {
    const { content, updatePrincipalInfo, updateTextBlock, updateStats, addAnnouncement, updateAnnouncement, deleteAnnouncement, addImage, deleteImage, updateSubmissionStatus, updateContactInfo } = useContext(LandingPageContext);
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('submissions');
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const pendingCount = content.announcements.filter(a => a.status === 'pending').length + content.galleryImages.filter(g => g.status === 'pending').length;

    const handleUpdateStatus = (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
        updateSubmissionStatus(type, id, status);
        setAlert({ message: `Submission ${status}.`, type: 'success' });
    };

    const tabs = [
        { id: 'submissions', label: 'Submissions', icon: Eye, count: pendingCount },
        { id: 'general', label: 'General Info', icon: UserCircle },
        { id: 'contact', label: 'Contact', icon: Contact },
        { id: 'stats', label: 'Stats', icon: BarChart2 },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'sections', label: 'Sections', icon: Layers },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'submissions': return <SubmissionsReview content={content} onUpdateStatus={handleUpdateStatus} />;
            case 'general': return <GeneralInfoManager info={content.principalInfo} vision={content.vision} mission={content.mission} coreValues={content.coreValues} onSaveInfo={updatePrincipalInfo} onSaveBlock={updateTextBlock} setAlert={setAlert} />;
            case 'contact': return <ContactInfoManager contactInfo={content.contactInfo} onSave={updateContactInfo} setAlert={setAlert} />;
            case 'stats': return <StatsManager stats={content.stats} onSave={updateStats} setAlert={setAlert} />;
            case 'announcements': return <AnnouncementsManager announcements={content.announcements} onAdd={addAnnouncement} onDelete={deleteAnnouncement} user={user!} setAlert={setAlert} />;
            case 'gallery': return <GalleryManager images={content.galleryImages} onAdd={addImage} onDelete={deleteImage} user={user!} setAlert={setAlert} />;
            case 'sections': return <SectionVisibilityManager />;
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

export default AdminHomepageManager;
