// Conflux Platform — Administrator Authentication & Access Portal

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { user, role, login, register, logout } = useAuth();
  const navigate = useNavigate();

  // Mode: Sign In vs First-Time Admin Account Setup
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Admin Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError?: boolean;
    isRateLimit?: boolean;
    isHelpfulHint?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setMessage(null);

    if (mode === 'LOGIN') {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Authenticated successfully! Redirecting to Admin Command Center...' });
        setTimeout(() => {
          navigate('/admin/businesses');
        }, 700);
      } else {
        const rawErr = res.error || '';
        const isRateLimit = rawErr.toLowerCase().includes('rate limit');
        const isInvalid = rawErr.includes('Invalid login credentials');
        
        let errorMsg = rawErr || 'Authentication failed. Please check your admin credentials.';
        if (isInvalid) {
          errorMsg = 'Invalid email or password. If you have not created your admin account yet, switch to "Create Admin Account" below.';
        } else if (rawErr.includes('Email not confirmed')) {
          errorMsg = 'Email is not confirmed yet. In Supabase Dashboard -> Authentication -> Providers -> Email, disable "Confirm email" or verify in your mailbox.';
        } else if (isRateLimit) {
          errorMsg = 'Too many login attempts. Please wait a moment or disable email confirmation in Supabase.';
        }

        setMessage({ text: errorMsg, isError: true, isRateLimit, isHelpfulHint: isInvalid });
      }
    } else {
      // First-time Admin Registration
      const res = await register({
        email,
        password,
        fullName: fullName || email.split('@')[0],
        role: 'ADMIN'
      });
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Admin account created and authenticated! Redirecting to Admin Command Center...' });
        setTimeout(() => {
          navigate('/admin/businesses');
        }, 700);
      } else {
        const rawErr = res.error || '';
        const isRateLimit = res.isRateLimit || rawErr.toLowerCase().includes('rate limit');
        
        let errorMsg = rawErr || 'Admin creation failed.';
        if (isRateLimit) {
          errorMsg = 'Supabase email rate limit exceeded. To bypass: in your Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF "Confirm email" (or create your user directly under Authentication -> Users -> Add User with "Auto Confirm").';
        } else if (res.isAlreadyRegistered) {
          errorMsg = 'An account with this email already exists. Please switch to "Sign In".';
        }

        setMessage({ text: errorMsg, isError: true, isRateLimit });
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-inter text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6"
      >
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-900 text-blue-400 flex items-center justify-center shadow-lg shadow-slate-900/30">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
            {mode === 'LOGIN' ? 'Admin Sign In' : 'Create Admin Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            {mode === 'LOGIN' 
              ? 'Sign in to access the Conflux Knowledge Graph, audit verification claims, and manage submissions.'
              : 'Initial setup for platform administrators with verified credentials.'
            }
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'LOGIN' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'REGISTER' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Admin Account
          </button>
        </div>

        {/* Active Session Info (If already signed in as ADMIN) */}
        {user && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Admin Session</div>
                <div className="text-sm font-bold text-white truncate max-w-[220px]">{user.email}</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-400">
                  <Shield size={13} /> Role: <span className="font-mono">{role}</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-3 py-1.5 rounded-xl border border-rose-800/60 shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>

            <Link
              to="/admin/businesses"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Open Admin Command Center <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {mode === 'REGISTER' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Administrator Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tarunjit Biswas"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-medium"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Administrator Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@confluxai.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-medium"
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
              {message.isHelpfulHint && mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => { setMode('REGISTER'); setMessage(null); }}
                  className="mt-1 text-blue-600 underline font-bold hover:text-blue-800 cursor-pointer block"
                >
                  Click here to Create Admin Account →
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              'Processing...'
            ) : mode === 'LOGIN' ? (
              <>Sign In as Administrator <ArrowRight size={16} /></>
            ) : (
              <>Create Admin Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Quick Helper Links */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <Link to="/discover" className="hover:text-blue-600 hover:underline">
            ← Back to Discover Directory
          </Link>
          <Link to="/list-business" className="hover:text-emerald-700 hover:underline font-semibold">
            Public Business Submission →
          </Link>
        </div>

      </motion.div>
    </div>
  );
};
