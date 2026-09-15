// Conflux Platform — Calm User & Business Authentication Portal (/login)
// Principle: ONE SCREEN → ONE DECISION → ONE ACTION
// Minimal, clear, zero jargon.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { user, role, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError?: boolean;
    isRateLimit?: boolean;
  } | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (role === 'ADMIN') {
        navigate('/admin/businesses', { replace: true });
      } else {
        navigate('/discover', { replace: true });
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setMessage(null);

    if (mode === 'LOGIN') {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Signed in successfully!' });
      } else {
        const rawErr = res.error || '';
        const isRateLimit = rawErr.toLowerCase().includes('rate limit');
        const isInvalid = rawErr.includes('Invalid login credentials');
        
        let errorMsg = rawErr || 'Authentication failed. Please check your credentials.';
        if (isInvalid) {
          errorMsg = 'Invalid email or password. Please verify your credentials.';
        } else if (rawErr.includes('Email not confirmed')) {
          errorMsg = 'Email is not confirmed yet. Please verify your email inbox.';
        } else if (isRateLimit) {
          errorMsg = 'Too many attempts. Please wait a moment before trying again.';
        }

        setMessage({ text: errorMsg, isError: true, isRateLimit });
      }
    } else {
      // REGISTER
      if (password.length < 6) {
        setIsLoading(false);
        setMessage({ text: 'Password must be at least 6 characters.', isError: true });
        return;
      }

      const res = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
        role: 'PUBLIC_USER'
      });
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Account created successfully! Signing in...' });
      } else {
        setMessage({
          text: res.error || 'Registration failed. Please try again with a valid email.',
          isError: true,
          isRateLimit: res.isRateLimit
        });
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-inter text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
            {mode === 'LOGIN' ? 'Sign in to Conflux' : 'Create your account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            {mode === 'LOGIN'
              ? 'Access your business profile, contributions, or administrator tools.'
              : 'Join Conflux to suggest local updates and manage your verified listings.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {mode === 'REGISTER' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Shouvik Roy"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password *</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                required
                minLength={6}
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs space-y-1.5 ${
              message.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <div className="flex items-start gap-2">
                {message.isError ? <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
                <span className="font-bold leading-relaxed">{message.text}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                <span>{mode === 'LOGIN' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Looking to list your local business?{' '}
          <Link to="/list-business" className="font-bold text-blue-700 hover:underline">
            List free on Conflux &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
