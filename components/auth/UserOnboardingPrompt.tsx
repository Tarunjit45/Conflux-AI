// Conflux Platform — First-Time Visitor Role Selection & Onboarding Pop-up Modal

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, X, ArrowRight, ShieldCheck, Sparkles, UserCheck,
  CheckCircle2, Lock
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';

const ONBOARDING_DISMISSED_KEY = 'conflux_onboarding_popup_dismissed_session';

export const UserOnboardingPrompt: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Automatic pop-up disabled for public browsing to ensure a calm, mobile-first experience.
    // Preserves manual onboarding invocations without interrupting visitors.
    setIsVisible(false);
  }, [user, location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dimmed & Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-950/25 p-6 sm:p-8 space-y-6 font-inter text-slate-900 z-10 my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-modal-title"
        >
          {/* Top Close 'X' Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Close Pop-up (Esc)"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2 pr-6 pl-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase tracking-wider border border-blue-200">
              <Sparkles size={13} /> Welcome to Conflux AI
            </div>
            <h2
              id="onboarding-modal-title"
              className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight"
            >
              How can we help?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Explore West Bengal's verified business and service directory, or list your business for direct customer leads:
            </p>
          </div>

          {/* Action Choice Cards */}
          <div className="space-y-3 pt-1">
            
            {/* 1. BUSINESS OWNER CHOICE */}
            <div
              onClick={() => handleSelectRole('OWNER')}
              className="p-5 rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/90 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0 mt-0.5">
                  <Building2 size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-orbitron text-emerald-950">
                      List a Business
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Free &amp; Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Submit your business details, upload license proof, and get the <strong>Conflux Verified Badge</strong> with direct phone, WhatsApp &amp; leads.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Submit Business</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* 2. CUSTOMER / BUYER CHOICE */}
            <div
              onClick={() => handleSelectRole('CUSTOMER')}
              className="p-5 rounded-2xl border-2 border-blue-600/30 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/90 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0 mt-0.5">
                  <Search size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-orbitron text-blue-950">
                      Explore Local Businesses
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Discover
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Discover verified local stores, healthcare centres, professional workshops, and contact verified proprietors across West Bengal.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:text-blue-800">
                <span>Explore Directory</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

          </div>

          {/* Dismiss Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end text-xs">
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-xs font-medium"
            >
              Continue browsing as guest &rarr;
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
