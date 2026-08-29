// Conflux Platform — Authentication & Role Switcher Modal / Page

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types/business';

export const AuthModal: React.FC = () => {
  const { user, role, login, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      setMessage({ text: 'Signed in successfully!' });
      setTimeout(() => navigate('/admin/businesses'), 600);
    } else {
      setMessage({ text: res.error || 'Login failed', isError: true });
    }
  };

  const handleQuickRole = (r: UserRole) => {
    switchRole(r);
    setMessage({ text: `Switched role to ${r}` });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-900">Conflux Platform Auth</h2>
          <p className="text-xs text-slate-500">
            Role-Based Access for Administrators, Verified Business Owners & Public Users.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Session</div>
              <div className="text-sm font-bold text-slate-900">{user.email}</div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                <UserCheck size={14} /> Role: <span className="font-mono">{role}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Quick Role Switcher for Conflux Operations */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Quick Role Switcher (Platform Operations)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('ADMIN')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                role === 'ADMIN'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('BUSINESS_OWNER')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                role === 'BUSINESS_OWNER'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              OWNER
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('PUBLIC_USER')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                role === 'PUBLIC_USER'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              PUBLIC
            </button>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@confluxai.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password / Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold ${message.isError ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center">
          <a
            href="/admin/businesses"
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            Go to Admin Business Management &rarr;
          </a>
        </div>
      </motion.div>
    </div>
  );
};
