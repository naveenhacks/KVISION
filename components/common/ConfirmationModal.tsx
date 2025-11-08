import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl shadow-brand-neon-purple/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`mt-1 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isDestructive ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                <ShieldAlert className={`${isDestructive ? 'text-red-400' : 'text-blue-400'}`} size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-brand-silver-gray">
                        {message}
                    </p>
                </div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                isDestructive 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-brand-neon-purple hover:bg-opacity-80 focus:ring-brand-light-purple'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-light-blue`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-white/20 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-brand-silver-gray hover:bg-white/10 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;
