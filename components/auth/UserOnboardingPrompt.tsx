// Conflux Platform — First-Time Visitor Role Selection & Onboarding Prompt

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, X, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';

const ONBOARDING_DISMISSED_KEY = 'conflux_onboarding_dismissed_session';

export const UserOnboardingPrompt: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show prompt if user is not logged in, not on /auth or /admin routes, and hasn't dismissed it in this browser session
    if (user) {
      setIsVisible(false);
      return;
    }

    if (location.pathname.startsWith('/admin') || location.pathname === '/auth') {
      setIsVisible(false);
      return;
    }

    const dismissed = sessionStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (!dismissed) {
      // Short delay for a clean smooth entry after page loads
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  };

  const handleSelectRole = (targetRole: 'OWNER' | 'CUSTOMER') => {
    handleDismiss();
    if (targetRole === 'OWNER') {
      navigate('/list-business');
    } else {
      navigate('/discover');
    }
  };

  const handleOpenAuth = (roleType?: string) => {
    handleDismiss();
    navigate(roleType ? `/auth?role=${roleType}` : '/auth');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[120] max-w-md w-[calc(100vw-2rem)] sm:w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 p-5 sm:p-6 space-y-4 font-inter text-slate-900"
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 block">
                Welcome to Conflux AI
              </span>
              <h4 className="text-base font-bold font-orbitron text-slate-900 leading-tight">
                Who are you?
              </h4>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Dismiss prompt"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Tell us your role so we can guide you to the right tools on the Conflux Business Graph.
        </p>

        {/* Role Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          
          {/* Business Owner Choice */}
          <button
            onClick={() => handleSelectRole('OWNER')}
            className="p-3.5 rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-left group flex flex-col justify-between space-y-1.5 cursor-pointer shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-orbitron text-emerald-950 flex items-center gap-1.5">
                <Building2 size={15} className="text-emerald-600 shrink-0" /> Business Owner
              </span>
              <ArrowRight size={13} className="text-emerald-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-tight">
              List &amp; verify your business, upload license proof, and get customer leads.
            </p>
          </button>

          {/* Customer Choice */}
          <button
            onClick={() => handleSelectRole('CUSTOMER')}
            className="p-3.5 rounded-2xl border-2 border-blue-600/30 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all text-left group flex flex-col justify-between space-y-1.5 cursor-pointer shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-orbitron text-blue-950 flex items-center gap-1.5">
                <Search size={15} className="text-blue-600 shrink-0" /> Customer / Buyer
              </span>
              <ArrowRight size={13} className="text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-blue-800/90 leading-tight">
              Discover verified local services &amp; connect on WhatsApp or call.
            </p>
          </button>

        </div>

        {/* Footer with Sign In & Dismiss */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => handleOpenAuth()}
            className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <UserCheck size={13} /> Sign In / Register
          </button>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
          >
            Continue as guest
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
