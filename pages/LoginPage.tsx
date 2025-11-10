
import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login, isBackendConnected } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const userRole = role as UserRole;
  if (!Object.values(UserRole).includes(userRole)) {
    navigate('/');
    return null;
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isBackendConnected) {
        setError("Cannot connect to the server. Please check your connection.");
        return;
    }
    
    setLoading(true);

    const result = await login(userRole, email, password);
    
    if (result.success) {
        navigate('/dashboard');
    } else {
      setError(result.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const title = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep-blue to-brand-light-blue p-4">
      <Link to="/" className="absolute top-5 left-5 text-brand-silver-gray hover:text-white transition-colors p-2 bg-white/10 rounded-full">
        <ArrowLeft />
      </Link>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-brand-neon-purple/20 overflow-hidden"
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white">{title} Login</h1>
          <p className="text-brand-silver-gray mt-2">Welcome to KVISION</p>
        </div>
        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-silver-gray">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-silver-gray">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full input-field" placeholder="********"/>
          </div>
          {error && <ErrorMessage message={error} />}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-neon-purple hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-purple transition-all duration-300 disabled:bg-opacity-50">
              {loading ? <LoadingSpinner /> : 'Login'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center space-x-3 text-sm"
    >
        <AlertTriangle size={20} />
        <span>{message}</span>
    </motion.div>
);

export default LoginPage;