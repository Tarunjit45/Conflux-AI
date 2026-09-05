// Conflux Platform — Claim Business Ownership Workflow Modal

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, X, CheckCircle2, Lock, ArrowRight, Building2,
  FileCheck, Send, AlertCircle
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import type { ConfluxBusiness } from '../../types/business';

interface ClaimBusinessModalProps {
  business: ConfluxBusiness;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({
  business,
  isOpen,
  onClose,
  onClaimSuccess
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [statutoryProof, setStatutoryProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerEmail || !ownerPhone || !statutoryProof) {
      setErrorMessage('Please provide your name, contact details, and statutory proof.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Log telemetry event
      await connectService.logEvent({
        businessId: business.id,
        eventType: 'CLAIM_CLICK',
        channel: 'HUMAN_WEB'
      });

      const res = await businessService.claimBusiness(business.id, {
        ownerName,
        ownerEmail,
        ownerPhone,
        statutoryProofText: statutoryProof
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.message);
        if (onClaimSuccess) onClaimSuccess();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error submitting claim request.');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 my-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg font-orbitron">
            <ShieldCheck size={22} className="text-blue-600" /> Claim Business Profile
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Target Entity Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claiming Profile:</div>
          <div className="text-base font-bold text-slate-900">{business.name}</div>
          <div className="text-xs font-mono text-blue-700">Conflux Business ID: {business.confluxBusinessId}</div>
        </div>

        {/* Business Value Proposition */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Building2 size={15} className="text-amber-700" /> Value to Business Owners:
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Claim your existing profile &rarr; verify your business with official statutory evidence &rarr; control accurate business information &rarr; receive authentic local calls &amp; inquiries &rarr; measure genuine customer interactions.
          </p>
        </div>

        {successMessage ? (
          <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 size={20} className="text-emerald-600" />
              Ownership Claim Under Review
            </div>
            <p className="text-xs leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Your Full Legal Name *</label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="e.g. Tarunjit Biswas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email *</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  placeholder="owner@company.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Direct Phone / WhatsApp *</label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Statutory Evidence Proof *
              </label>
              <textarea
                rows={3}
                value={statutoryProof}
                onChange={e => setStatutoryProof(e.target.value)}
                placeholder="State your registration certificate identifier (Trade License #, FSSAI #, GSTIN, or Udyam #)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <p className="text-[11px] text-slate-500">
                Conflux Verify validates this statement against government registries before unlocking dashboard privileges.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {errorMessage}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Submitting Claim...' : 'Submit Claim Request'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
