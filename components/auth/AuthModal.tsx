// Conflux Platform — Administrator Authentication & Access Portal

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { user, role, login, logout } = useAuth();
  const navigate = useNavigate();

  // Admin Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError?: boolean;
    isRateLimit?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setMessage(null);

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
      const errorMsg = rawErr.includes('Invalid login credentials')
        ? 'Invalid administrator email or password. Please verify your credentials.'
        : rawErr.includes('Email not confirmed')
        ? 'Email not confirmed yet. Please check your admin mailbox.'
        : isRateLimit
        ? 'Too many login attempts. Please wait a few minutes before trying again.'
        : rawErr || 'Authentication failed. Please check your admin credentials.';
      setMessage({ text: errorMsg, isError: true, isRateLimit });
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
            Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Restricted authentication portal for platform administrators to manage the Conflux Knowledge Graph, audit verification claims, and review submissions.
          </p>
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
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs space-y-1 ${
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
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>Sign In as Administrator <ArrowRight size={16} /></>
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
