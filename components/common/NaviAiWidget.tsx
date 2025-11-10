
import React, { useState, useContext, useRef, useEffect } from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types.ts';
import { getNaviAiResponse } from '../../services/geminiService.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ThinkingIndicator = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
  </div>
);

const NaviAiWidget: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeText = user?.role === UserRole.Student 
                ? `Hello, ${user?.name?.split(' ')[0]}! I'm your personal study assistant. Ask me anything about your subjects.`
                : `Hello, ${user?.name}! I'm your teaching assistant. How can I help with your lesson plans or class material today?`;
            
            setTimeout(() => {
                 setMessages([{ sender: 'ai', text: welcomeText }]);
            }, 500);
        }
    }, [isOpen, user, messages.length]);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        if (isOpen && !isLoading) {
            inputRef.current?.focus();
        }
    }, [messages, isLoading, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !user || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue.trim() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue.trim();
        setInputValue('');
        setIsLoading(true);

        try {
            const aiResponse = await getNaviAiResponse(currentInput, user.role);
            const aiMessage: Message = { sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { sender: 'ai', text: "I'm sorry, but I seem to be having trouble connecting. Please try again in a moment." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };
    
    // FIX: Add Variants type to fix type error for 'type' property.
    const floatingButtonVariants: Variants = {
      hidden: { scale: 0, opacity: 0, y: 100 },
      visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.5 } },
    };

    // FIX: Add Variants type to fix type error for 'type' property.
    const chatWindowVariants: Variants = {
        closed: { opacity: 0, y: 100, scale: 0.8, originX: 1, originY: 1 },
        open: { opacity: 1, y: 0, scale: 1, originX: 1, originY: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        variants={floatingButtonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        drag
                        dragConstraints={{ left: 8, right: window.innerWidth - 72, top: 8, bottom: window.innerHeight - 72 }}
                        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[90] w-16 h-16 bg-gradient-to-br from-brand-neon-purple to-brand-light-purple text-white rounded-full shadow-2xl shadow-brand-neon-purple/50 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        aria-label="Open NaviAI Assistant"
                    >
                        <Bot size={32} />
                    </motion.button>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 dark:bg-brand-deep-blue/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            variants={chatWindowVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="w-full max-w-2xl h-[90vh] max-h-[700px] bg-white dark:bg-brand-light-blue rounded-2xl shadow-2xl flex flex-col border border-white/10"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="naviai-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-brand-neon-purple to-brand-light-purple rounded-lg">
                                        <Bot size={24} className="text-white" />
                                    </div>
                                    <h2 id="naviai-title" className="text-xl font-bold text-black dark:text-white">NaviAI</h2>
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
                                        <span className="text-xs text-gray-500 dark:text-brand-silver-gray">{isLoading ? 'Thinking...' : 'Active'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 dark:text-brand-silver-gray rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" aria-label="Close chat">
                                    <X size={20} />
                                </button>
                            </header>

                            {/* Chat Area */}
                            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.sender === 'ai' && <Bot className="w-6 h-6 text-brand-light-purple flex-shrink-0 self-start mt-1" />}
                                        <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-neon-purple text-white rounded-br-none' : 'bg-gray-200 dark:bg-brand-deep-blue text-black dark:text-white rounded-bl-none'}`}>
                                            <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-1">
                                                <MarkdownRenderer content={msg.text} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5 justify-start">
                                        <Bot className="w-6 h-6 text-brand-light-purple flex-shrink-0 self-start mt-1" />
                                        <div className="max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-brand-deep-blue">
                                            <ThinkingIndicator />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Input Area */}
                            <footer className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
                                <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask NaviAI anything..."
                                        className="flex-grow bg-gray-100 dark:bg-brand-deep-blue border border-gray-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple transition-all"
                                        disabled={isLoading}
                                        aria-label="Chat input"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-brand-neon-purple p-3 rounded-lg text-white disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-all aspect-square flex items-center justify-center"
                                        disabled={isLoading || !inputValue.trim()}
                                        aria-label="Send message"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </footer>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NaviAiWidget;
