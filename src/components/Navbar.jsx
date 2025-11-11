import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Sun, Moon, LogOut, UserCircle } from 'lucide-react';

const KVisionLogo = () => (
    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light-purple via-white to-brand-silver-gray">
      KVISION
    </h1>
);

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Dummy theme toggle state for UI preservation
    const [theme, setTheme] = React.useState('dark'); 
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-brand-deep-blue/50 dark:bg-brand-deep-blue/80 backdrop-blur-lg border-b border-white/10 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <KVisionLogo />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <div>
                                <p className="text-white font-semibold">{user?.name}</p>
                                <p className="text-xs text-brand-silver-gray capitalize">{user?.role}</p>
                            </div>
                            <UserCircle className="text-brand-light-purple" />
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-brand-deep-blue" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} className="text-red-400" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
