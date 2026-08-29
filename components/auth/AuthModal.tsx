// Conflux Platform — Multi-Tenant Authentication & Role Registration System

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import {
  ShieldCheck, UserCheck, Lock, Mail, ArrowRight, CheckCircle2,
  Building2, User, Shield, AlertCircle, Phone, Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import type { UserRole } from '../../types/business';

export const AuthModal: React.FC = () => {
  const { user, role, login, register, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auth Mode: 'SIGN_IN' | 'REGISTER'
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'REGISTER'>('REGISTER');
  
  // Selected Role Choice
  const initialRoleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRoleParam === 'admin' ? 'ADMIN' : initialRoleParam === 'owner' ? 'BUSINESS_OWNER' : 'BUSINESS_OWNER'
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (initialRoleParam === 'owner') setSelectedRole('BUSINESS_OWNER');
    if (initialRoleParam === 'user' || initialRoleParam === 'customer') setSelectedRole('USER');
    if (initialRoleParam === 'admin') setSelectedRole('ADMIN');
  }, [initialRoleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setMessage(null);

    if (authMode === 'REGISTER') {
      const res = await register({
        email,
        password,
        fullName: fullName || email.split('@')[0],
        role: selectedRole,
        phone
      });
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: `Account created successfully as ${selectedRole.replace(/_/g, ' ')}!` });
        setTimeout(() => {
          if (selectedRole === 'BUSINESS_OWNER') {
            navigate('/list-business');
          } else if (selectedRole === 'ADMIN') {
            navigate('/admin/businesses');
          } else {
            navigate('/discover');
          }
        }, 800);
      } else {
        setMessage({ text: res.error || 'Registration failed', isError: true });
      }
    } else {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Signed in successfully!' });
        setTimeout(() => {
          if (selectedRole === 'BUSINESS_OWNER') {
            navigate('/list-business');
          } else if (selectedRole === 'ADMIN') {
            navigate('/admin/businesses');
          } else {
            navigate('/discover');
          }
        }, 800);
      } else {
        setMessage({ text: res.error || 'Login failed', isError: true });
      }
    }
  };

  const handleQuickRole = (r: UserRole) => {
    switchRole(r);
    setMessage({ text: `Switched active role to ${r}` });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-inter text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
            Welcome to Conflux AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            {authMode === 'REGISTER'
              ? 'Create your account to get verified, list businesses, or discover trusted local services.'
              : 'Sign in to access your business profile, moderation queue, or saved services.'}
          </p>
        </div>

        {/* Active Session Info */}
        {user && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Active Session</div>
              <div className="text-sm font-bold text-slate-900">{user.email}</div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                <UserCheck size={14} /> Role: <span className="font-mono">{role}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Auth Mode Tabs (Register / Log In) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setAuthMode('REGISTER')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'REGISTER'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account (Sign Up)
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('SIGN_IN')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'SIGN_IN'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In (Log In)
          </button>
        </div>

        {/* ── ROLE SELECTION: "WHO ARE YOU?" ──────────────────────── */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
            Select Your Role: Who Are You? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Business Owner */}
            <div
              onClick={() => setSelectedRole('BUSINESS_OWNER')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                selectedRole === 'BUSINESS_OWNER'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold font-orbitron text-emerald-950">
                <Building2 size={15} className="text-emerald-600 shrink-0" /> Business Owner
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                List &amp; verify enterprise, get customer leads.
              </p>
            </div>

            {/* 2. Customer / User */}
            <div
              onClick={() => setSelectedRole('USER')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                selectedRole === 'USER'
                  ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold font-orbitron text-blue-950">
                <User size={15} className="text-blue-600 shrink-0" /> Customer / User
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                Discover verified businesses &amp; write reviews.
              </p>
            </div>

            {/* 3. Platform Admin */}
            <div
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                selectedRole === 'ADMIN'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`flex items-center gap-1.5 text-xs font-bold font-orbitron ${selectedRole === 'ADMIN' ? 'text-white' : 'text-slate-900'}`}>
                <Shield size={15} className={selectedRole === 'ADMIN' ? 'text-blue-400' : 'text-slate-600'} /> Administrator
              </div>
              <p className={`text-[10px] leading-tight ${selectedRole === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                Internal audit &amp; graph verification portal.
              </p>
            </div>

          </div>
        </div>

        {/* ── FORM ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {authMode === 'REGISTER' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name / Contact Person *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={selectedRole === 'BUSINESS_OWNER' ? 'e.g. Tarunjit Biswas (Proprietor)' : 'e.g. Rahul Sharma'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
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
                placeholder="name@business.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                required
              />
            </div>
          </div>

          {authMode === 'REGISTER' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98300 XXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              'Processing...'
            ) : authMode === 'REGISTER' ? (
              <>Register as {selectedRole.replace(/_/g, ' ')} <ArrowRight size={16} /></>
            ) : (
              <>Sign In to Conflux <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Quick Helper Links */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <Link to="/discover" className="hover:text-blue-600 hover:underline">
            ← Explore Discover Directory
          </Link>
          <Link to="/list-business" className="hover:text-emerald-700 hover:underline font-semibold">
            List Business Directly →
          </Link>
        </div>

      </motion.div>
    </div>
  );
};
