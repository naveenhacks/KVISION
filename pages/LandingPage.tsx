
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import { LandingPageContext } from '../context/LandingPageContext';
import { UserRole } from '../types';
import {
    Menu, X, Sun, Moon, ArrowUp, User, GraduationCap, Shield,
    MapPin, Mail, Phone, Globe, Building2
} from 'lucide-react';

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Principal', href: '#principal' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
];

const ParticleBackground: React.FC = () => <div className="particle-bg"></div>;

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-accent-blue bg-glass-dark hover:bg-glass-dark/50 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-theme-dark/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-end h-20">
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link, i) => (
                             <motion.a 
                                key={link.name} 
                                href={link.href} 
                                className="font-semibold text-gray-300 hover:text-white relative group"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                            >
                                {link.name}
                                <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-accent-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
                            </motion.a>
                        ))}
                        <motion.div
                             initial={{ opacity: 0, y: -20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <ThemeToggle />
                        </motion.div>
                    </nav>
                    <div className="lg:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu" className="p-2 text-white">
                            <Menu />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                             initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                             className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-theme-dark/90 shadow-2xl"
                             onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-end p-6">
                                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-2 text-white"> <X /> </button>
                            </div>
                            <nav className="flex flex-col items-center justify-center h-full -mt-20 space-y-8">
                                {navLinks.map(link => (
                                    <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-3xl font-semibold text-gray-300 hover:text-white">
                                        {link.name}
                                    </a>
                                ))}
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

const Section: React.FC<{ id: string; className?: string; children: React.ReactNode }> = ({ id, className, children }) => (
    <motion.section
        id={id}
        className={`py-20 md:py-28 overflow-hidden ${className}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.2 }}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    </motion.section>
);

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const HeroSection: React.FC = () => {
    const loginCards = [
        { role: 'Student', icon: <GraduationCap size={36} />, link: `/login/${UserRole.Student}` },
        { role: 'Teacher', icon: <User size={36} />, link: `/login/${UserRole.Teacher}` },
        { role: 'Admin', icon: <Shield size={36} />, link: `/login/${UserRole.Admin}` },
    ];
    
    return (
        <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-theme-dark to-blue-900/80 -z-10"></div>
            <ParticleBackground />
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 p-4">
                 <motion.h1
                    className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white text-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Kendriya Vidyalaya Unnao
                </motion.h1>
                <motion.p
                    className="mt-4 text-xl md:text-2xl font-medium text-accent-gold/90"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    तमसो मा ज्योतिर्गमय — From Darkness to Light
                </motion.p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loginCards.map((card, i) => (
                        <motion.div
                            key={card.role}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                        >
                            <Link to={card.link} className="block p-8 bg-glass-dark backdrop-blur-md rounded-2xl border border-glass-border text-center transition-all group hover:border-accent-blue/50 hover:-translate-y-2 hover:shadow-[0_0_20px_theme(colors.accent-blue)]">
                                <div className="text-accent-blue group-hover:text-white transition-colors duration-300 mb-4 inline-block">
                                    {card.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white">{card.role} Login</h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AboutSection: React.FC = () => (
    <Section id="about" className="bg-theme-dark/80">
        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-center text-white mb-4">About Our School</motion.h2>
        <motion.div variants={itemVariants} className="glowing-divider mx-auto w-1/4 mb-16"></motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl shadow-2xl shadow-black/20">
                <motion.img 
                    src="https://unnao.kvs.ac.in/sites/default/files/styles/fancy_box/public/2023-11/IMG-20231102-WA0025.jpg" 
                    alt="KV Unnao Campus" 
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                    Kendriya Vidyalaya Unnao is dedicated to nurturing young minds and fostering holistic development. Our mission is to provide quality education that inspires creativity, critical thinking, and a lifelong passion for learning. We strive for excellence in both academics and co-curricular activities, preparing students to become responsible and compassionate global citizens.
                </p>
            </motion.div>
        </div>
    </Section>
);

const PrincipalSection: React.FC = () => {
    const { content } = useContext(LandingPageContext);
    const { principalInfo } = content;

    return (
     <Section id="principal" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-theme-dark/80 to-theme-dark -z-10"></div>
        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-center text-white mb-16">A Word From The Principal</motion.h2>
        <motion.div 
            variants={itemVariants}
            className="max-w-4xl mx-auto bg-theme-dark/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-black/20 flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-glass-border"
        >
            <motion.img
                src={principalInfo.imageUrl}
                alt={`Principal ${principalInfo.name}`}
                className="w-48 h-48 rounded-full object-cover border-4 border-accent-blue/50 flex-shrink-0 shadow-lg shadow-accent-blue/20"
                whileHover={{ scale: 1.05, rotate: 2, boxShadow: '0 0 20px #1E90FF' }}
            />
            <div className="text-center md:text-left">
                <p className="text-gray-300 leading-relaxed italic mb-4 text-lg">
                    "{principalInfo.message}"
                </p>
                <h3 className="font-caveat text-4xl font-bold text-accent-gold">{principalInfo.name}</h3>
                <p className="text-accent-blue font-medium">Principal, PM Shree KV Unnao</p>
            </div>
        </motion.div>
    </Section>
    );
};

const GallerySection: React.FC = () => {
    const { content } = useContext(LandingPageContext);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    const approvedImages = content.galleryImages.filter(img => img.status === 'approved');

    return (
        <>
            <Section id="gallery" className="relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-theme-dark to-blue-900/40 -z-10"></div>
                <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
                    Our Gallery
                </motion.h2>
                <motion.div variants={itemVariants} className="glowing-divider mx-auto w-1/4 mb-16"></motion.div>
                
                {approvedImages.length > 0 ? (
                    <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {approvedImages.map((image) => (
                            <motion.div
                                key={image.id}
                                variants={itemVariants}
                                className="relative aspect-video sm:aspect-square overflow-hidden rounded-2xl shadow-lg cursor-pointer group border-2 border-transparent hover:border-accent-blue transition-all"
                                onClick={() => setSelectedImg(image.src)}
                            >
                                <motion.img 
                                    src={image.src} 
                                    alt={image.alt} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                    layoutId={image.src}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <p className="text-white text-center text-sm font-semibold">{image.alt}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p variants={itemVariants} className="text-center text-brand-silver-gray">
                        The gallery is currently empty. More images coming soon!
                    </motion.p>
                )}
            </Section>

            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setSelectedImg(null)}
                    >
                        <motion.img
                            src={selectedImg}
                            alt="Enlarged view"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            layoutId={selectedImg}
                        />
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0, scale: 0 }}
                            onClick={() => setSelectedImg(null)}
                            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                            aria-label="Close image view"
                        >
                            <X />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

type InfoItem = {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
};

const ContactSection: React.FC = () => {
    const { content } = useContext(LandingPageContext);
    const { contactInfo } = content;

    const infoItems: InfoItem[] = [
        { icon: <Building2 />, label: 'School Name', value: contactInfo.schoolName},
        { icon: <MapPin />, label: 'Address', value: contactInfo.address },
        { icon: <Mail />, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
        { icon: <Phone />, label: 'Contact', value: contactInfo.phone, href: `tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}` },
        { icon: <Globe />, label: 'Website', value: contactInfo.website, href: `https://${contactInfo.website}` },
    ];
    
    return (
        <Section id="contact" className="bg-theme-dark/80">
             <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Get In Touch</motion.h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                {infoItems.map((item) => {
                    const cardContent = (
                        <>
                            <motion.div 
                                className="inline-block p-4 bg-accent-blue/10 text-accent-blue rounded-full transition-all duration-300 group-hover:shadow-[0_0_15px_theme(colors.accent-blue)] group-hover:text-white group-hover:bg-accent-blue"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                                {item.icon}
                            </motion.div>
                            <h4 className="font-bold text-lg mt-5 text-white">{item.label}</h4>
                            <p className="text-sm text-gray-400 mt-1 break-words">{item.value}</p>
                        </>
                    );

                    const commonClasses = "text-center p-6 bg-glass-dark backdrop-blur-md rounded-2xl shadow-lg shadow-black/20 border border-glass-border group flex flex-col items-center justify-center h-full";

                    return (
                        <motion.div key={item.label} variants={itemVariants}>
                            {item.href ? (
                                <a 
                                    href={item.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`${commonClasses} transition-colors hover:border-accent-blue/50`}
                                >
                                    {cardContent}
                                </a>
                            ) : (
                                <div className={commonClasses}>
                                    {cardContent}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
             </div>
        </Section>
    );
};

const Footer: React.FC = () => (
    <motion.footer 
        className="bg-black text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
            <p className="font-semibold">&copy; 2025 All Rights Reserved by PM Shree Kendriya Vidyalaya Unnao</p>
            <p className="text-sm mt-1">Powered by <span className="font-bold text-accent-blue">KVISION</span></p>
        </div>
    </motion.footer>
);

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-accent-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-80 transition-colors shadow-accent-blue/40"
                    aria-label="Scroll to top"
                >
                    <ArrowUp />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

const LandingPage: React.FC = () => {
    return (
        <div className="bg-theme-dark text-gray-200 font-sans transition-colors duration-400">
            <Header />
            <main>
                <HeroSection />
                <AboutSection />
                <PrincipalSection />
                <GallerySection />
                <ContactSection />
            </main>
            <Footer />
            <ScrollToTopButton />
        </div>
    );
};

export default LandingPage;
