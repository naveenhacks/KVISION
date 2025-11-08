import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, ShieldAlert } from 'lucide-react';

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
            className={`fixed top-24 right-8 z-[100] p-4 rounded-lg flex items-center space-x-3 text-sm border ${bgColor} ${textColor} shadow-lg`}
        >
            <Icon className="w-5 h-5" />
            <span>{message}</span>
            <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full">
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Alert;
