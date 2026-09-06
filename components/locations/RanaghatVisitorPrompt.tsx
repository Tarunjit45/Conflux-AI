// Conflux Platform — Ranaghat Visitor Entry Prompt
// Non-blocking, lightweight, mobile-first, >=44px touch targets.
// Remembers dismissal in sessionStorage so it doesn't repeatedly annoy visitors.
// Two clear paths: Join Community (/onboarding) vs List Business (/list-business).

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Users, Store, ArrowRight, MapPin } from 'lucide-react';

interface RanaghatVisitorPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCommunity: () => void;
}

export const RanaghatVisitorPrompt: React.FC<RanaghatVisitorPromptProps> = ({
  isOpen,
  onClose,
  onJoinCommunity
}) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('conflux_ranaghat_prompt_dismissed', 'true');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 font-inter text-slate-900 relative overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ranaghat-prompt-title"
        >
          {/* Close button - comfortable touch target >= 44px */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close popup"
          >
            <X size={20} />
          </button>

          {/* Location Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <MapPin size={13} className="text-blue-600" />
            <span>Ranaghat, Nadia</span>
          </div>

          <h2
            id="ranaghat-prompt-title"
            className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight leading-tight mb-2"
          >
            This is where Ranaghat comes together.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Find verified local updates, real jobs, trusted neighbors, and authentic businesses across Ranaghat. How would you like to take part?
          </p>

          {/* Two Primary Action Cards */}
          <div className="space-y-3 mb-5">
            {/* Action 1: Join Community */}
            <button
              type="button"
              onClick={() => {
                handleDismiss();
                onJoinCommunity();
              }}
              className="w-full min-h-[52px] p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-between transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Join the Ranaghat Community</div>
                  <div className="text-[11px] text-blue-100 font-normal">Connect, share local updates & build your Local Trust Score</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Action 2: List Trusted Business */}
            <Link
              to="/list-business"
              onClick={handleDismiss}
              className="w-full min-h-[52px] p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-900 font-bold text-sm flex items-center justify-between transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Store size={20} className="text-emerald-700" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">List Your Trusted Business</div>
                  <div className="text-[11px] text-slate-500 font-normal">Get discovered on Google, Maps & AI engines with verified trust</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          {/* Footer Action: Continue Browsing */}
          <div className="text-center pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Continue browsing Ranaghat &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
