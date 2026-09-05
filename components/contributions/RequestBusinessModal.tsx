// Conflux Platform — Request a Business Modal ("Can't Find This Business?")
// Captures consumer demand signals to trigger local business outreach, onboarding, and verification.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Store,
  MapPin,
  Link2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { useAuth } from '../../lib/authContext';
import type { BusinessDemandRequest } from '../../types/localKnowledge';

interface RequestBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (request: BusinessDemandRequest) => void;
  defaultLocality?: string;
}

export const RequestBusinessModal: React.FC<RequestBusinessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultLocality = 'Ranaghat'
}) => {
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [locality, setLocality] = useState(defaultLocality);
  const [category, setCategory] = useState('');
  const [addressHint, setAddressHint] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [reason, setReason] = useState('');
  const [submitterName, setSubmitterName] = useState(user?.fullName || '');
  const [submitterEmail, setSubmitterEmail] = useState(user?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!businessName.trim()) {
      setErrorMessage('Business name is required.');
      return;
    }
    if (!locality.trim()) {
      setErrorMessage('Locality is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const request = await localKnowledgeService.requestBusiness({
        businessName: businessName.trim(),
        locality: locality.trim(),
        category: category.trim() || undefined,
        addressHint: addressHint.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        reason: reason.trim() || undefined,
        requestedBy: {
          userId: user?.id,
          displayName: submitterName.trim() || user?.fullName || 'Local Resident',
          email: submitterEmail.trim() || user?.email
        }
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccess) onSuccess(request);

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setBusinessName('');
        setAddressHint('');
        setSourceUrl('');
        setReason('');
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit business request.');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Store size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold font-mono text-blue-700 uppercase tracking-wider">
                Local Demand Signal
              </div>
              <h2 className="text-base font-bold font-orbitron text-slate-900">
                Can't find this business in {locality}?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold font-orbitron text-slate-900">
                Demand Signal Recorded!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you! Your request for <strong>{businessName}</strong> in {locality} has been registered. Our local team will initiate verified onboarding.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Tell us about a missing business in your area. This creates a verified demand signal that prioritizes statutory onboarding.
              </p>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ghosh Sweets, Nadia Diagnostic Centre..."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sweet Shop, Clinic, Saree Store"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Landmark / Street Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Near Station Platform 1, opposite Netaji Statue..."
                  value={addressHint}
                  onChange={(e) => setAddressHint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Public Source / Web Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g., Google Maps link, Facebook page, or website"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Email (For Notification)
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
