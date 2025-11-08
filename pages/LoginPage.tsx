
import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '../types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const RESEND_TIMEOUT = 30; // 30 seconds

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login, verifyOtpAndLogin, resendOtp } = useContext(AuthContext);

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const userRole = role as UserRole;
  if (!Object.values(UserRole).includes(userRole)) {
    navigate('/');
    return null;
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(userRole, email, password);
    
    if (result.success) {
      if (userRole === UserRole.Admin) {
        // Admin flow: go to OTP step
        setStep('otp');
        setTimer(RESEND_TIMEOUT);
        if (result.otp) {
          setDemoOtp(result.otp);
        }
      } else {
        // Student/Teacher flow: login successful, navigate to dashboard
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyOtpAndLogin(otp);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setError('');
    const result = await resendOtp();
    if (result.success) {
        setTimer(RESEND_TIMEOUT);
        if (result.otp) {
            setDemoOtp(result.otp);
        }
    } else {
        setError(result.message || 'Could not resend OTP.');
    }
    setLoading(false);
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setError('');
    setOtp('');
    setDemoOtp(null);
  };

  const title = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const isStudentLogin = userRole === UserRole.Student;
  const submitButtonText = userRole === UserRole.Admin ? 'Send OTP' : 'Login';

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

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
        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.div
              key="credentials"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-white">{title} Login</h1>
                <p className="text-brand-silver-gray mt-2">Welcome to KVISION</p>
              </div>
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-silver-gray">{isStudentLogin ? 'Student ID' : 'Email'}</label>
                  <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full input-field" placeholder={isStudentLogin ? 'e.g. s1' : 'you@example.com'} />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-brand-silver-gray">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full input-field" placeholder="********"/>
                </div>
                {error && <ErrorMessage message={error} />}
                <div>
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-neon-purple hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-purple transition-all duration-300 disabled:bg-opacity-50">
                    {loading ? <LoadingSpinner /> : submitButtonText}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <button type="button" onClick={handleBackToCredentials} className="flex items-center text-sm text-brand-silver-gray hover:text-white mb-4">
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white">Enter Verification Code</h2>
                <p className="text-brand-silver-gray mt-2 text-sm">An OTP has been sent to the email associated with <br/><span className="font-semibold text-white">{email}</span>.</p>
              </div>
              {demoOtp && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 p-3 rounded-lg text-sm text-center mb-4"
                >
                    <p className="font-bold">DEMO MODE</p>
                    <p>Your OTP is: <strong className="text-white tracking-widest font-mono">{demoOtp}</strong></p>
                </motion.div>
              )}
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                 <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-brand-silver-gray text-center tracking-widest">OTP</label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="mt-1 block w-full text-center text-2xl tracking-[0.5em] font-mono py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light-purple"
                  />
                </div>
                {error && <ErrorMessage message={error} />}
                <div>
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-neon-purple hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-purple transition-all duration-300 disabled:bg-opacity-50">
                    {loading ? <LoadingSpinner /> : 'Verify & Sign In'}
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center text-sm text-brand-silver-gray">
                {timer > 0 ? (
                  <span>Resend OTP in {timer}s</span>
                ) : (
                  <button onClick={handleResendOtp} disabled={loading} className="underline hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed">
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
