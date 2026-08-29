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
  const [message, setMessage] = useState<{
    text: string;
    isError?: boolean;
    isRateLimit?: boolean;
    isAlreadyRegistered?: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialRoleParam === 'admin') {
      setSelectedRole('ADMIN');
      setAuthMode('SIGN_IN');
    } else if (initialRoleParam === 'owner') {
      setSelectedRole('BUSINESS_OWNER');
    } else if (initialRoleParam === 'user' || initialRoleParam === 'customer') {
      setSelectedRole('USER');
    }
  }, [initialRoleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setMessage(null);

    // Administrator role is strictly Sign In only
    const isActualRegister = authMode === 'REGISTER' && selectedRole !== 'ADMIN';

    if (isActualRegister) {
      const res = await register({
        email,
        password,
        fullName: fullName || email.split('@')[0],
        role: selectedRole,
        phone
      });

      if (res.success) {
        // Try auto-login
        const loginRes = await login(email, password);
        setIsLoading(false);

        if (loginRes.success) {
          setMessage({ text: `Account created & signed in as ${selectedRole.replace(/_/g, ' ')}!` });
          setTimeout(() => {
            if (selectedRole === 'BUSINESS_OWNER') {
              navigate('/list-business');
            } else {
              navigate('/discover');
            }
          }, 800);
        } else {
          setMessage({
            text: 'Account registered successfully! If required by your organization, please verify your email before logging in.'
          });
        }
      } else {
        setIsLoading(false);
        if (res.isRateLimit) {
          setMessage({
            text: 'Supabase email rate limit exceeded: Too many signups have been requested in the last hour. Please wait a few minutes, or try signing in if you already registered.',
            isError: true,
            isRateLimit: true
          });
        } else if (res.isAlreadyRegistered) {
          setMessage({
            text: 'This email is already registered with Conflux AI. Please switch to Sign In.',
            isError: true,
            isAlreadyRegistered: true
          });
        } else {
          setMessage({ text: res.error || 'Registration failed', isError: true });
        }
      }
    } else {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.success) {
        setMessage({ text: 'Signed in successfully!' });
        setTimeout(() => {
          if (selectedRole === 'ADMIN') {
            navigate('/admin/businesses');
          } else if (selectedRole === 'BUSINESS_OWNER') {
            navigate('/list-business');
          } else {
            navigate('/discover');
          }
        }, 800);
      } else {
        const rawErr = res.error || '';
        const isRateLimit = rawErr.toLowerCase().includes('rate limit');
        const errorMsg = rawErr.includes('Email not confirmed')
          ? 'Email not confirmed yet. Please check your inbox or spam folder to verify your email.'
          : isRateLimit
          ? 'Supabase email rate limit exceeded. Please wait a few minutes before trying again.'
          : rawErr || 'Login failed';
        setMessage({ text: errorMsg, isError: true, isRateLimit });
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
          <div className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center shadow-lg transition-all ${
            selectedRole === 'ADMIN'
              ? 'bg-slate-900 text-blue-400 shadow-slate-900/30'
              : 'bg-blue-600 text-white shadow-blue-500/20'
          }`}>
            {selectedRole === 'ADMIN' ? <Shield size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
            {selectedRole === 'ADMIN' ? 'Conflux AI Admin Console' : 'Welcome to Conflux AI'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            {selectedRole === 'ADMIN'
              ? 'Sign in with your authorized platform administrator credentials to manage the Business Graph, review applications, and audit claims.'
              : authMode === 'REGISTER'
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
        {selectedRole === 'ADMIN' ? (
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between px-4 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold font-orbitron">
              <Shield size={16} className="text-blue-400" />
              <span>Administrator Access Portal</span>
            </div>
            <span className="text-[10px] font-bold font-mono text-blue-300 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Lock size={10} /> Sign In Only
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setMessage(null);
              }}
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
              onClick={() => {
                setAuthMode('SIGN_IN');
                setMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'SIGN_IN'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (Log In)
            </button>
          </div>
        )}

        {/* ── ROLE SELECTION: "WHO ARE YOU?" ──────────────────────── */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
            Select Your Role: Who Are You? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Business Owner */}
            <div
              onClick={() => {
                setSelectedRole('BUSINESS_OWNER');
                setMessage(null);
              }}
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
              onClick={() => {
                setSelectedRole('USER');
                setMessage(null);
              }}
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
              onClick={() => {
                setSelectedRole('ADMIN');
                setAuthMode('SIGN_IN');
                setMessage(null);
              }}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                selectedRole === 'ADMIN'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold font-orbitron ${selectedRole === 'ADMIN' ? 'text-white' : 'text-slate-900'}`}>
                  <Shield size={15} className={selectedRole === 'ADMIN' ? 'text-blue-400' : 'text-slate-600'} /> Administrator
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  selectedRole === 'ADMIN' ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  Sign In Only
                </span>
              </div>
              <p className={`text-[10px] leading-tight ${selectedRole === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                Internal audit &amp; graph verification portal.
              </p>
            </div>

          </div>
        </div>

        {/* ── FORM ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {authMode === 'REGISTER' && selectedRole !== 'ADMIN' && (
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
            <label className="text-xs font-bold text-slate-700">
              {selectedRole === 'ADMIN' ? 'Administrator Email Address *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={selectedRole === 'ADMIN' ? 'admin@confluxai.in' : 'name@business.in'}
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

          {authMode === 'REGISTER' && selectedRole !== 'ADMIN' && (
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
            <div className={`p-4 rounded-2xl text-xs space-y-2.5 ${
              message.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <div className="flex items-start gap-2.5">
                {message.isError ? <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" /> : <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />}
                <div className="space-y-1 font-medium leading-relaxed">
                  <p className="font-bold">{message.text}</p>
                  
                  {message.isRateLimit && (
                    <p className="text-[11px] text-rose-700">
                      Supabase limits verification emails to 3–4 requests/hour on default settings. If you already created your account in an earlier step, you can sign in directly.
                    </p>
                  )}
                </div>
              </div>

              {(message.isRateLimit || message.isAlreadyRegistered) && (
                <div className="pt-2 border-t border-rose-200/70 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGN_IN');
                      setMessage(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Switch to Sign In (Log In) &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'ADMIN'
                ? 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isLoading ? (
              'Processing...'
            ) : selectedRole === 'ADMIN' ? (
              <>Sign In as Administrator <ArrowRight size={16} /></>
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
