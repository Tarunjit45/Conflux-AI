// Conflux Platform — Create Local Job Opportunity Modal
// Follows principle: ONE USER → ONE QUESTION / ACTION → CLEAR OUTCOME
// Mobile-first, >=44px touch targets, >=16px input fonts to prevent mobile zoom.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, Building2, Phone, MessageSquare, Check, Sparkles, AlertCircle } from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { useAuth } from '../../lib/authContext';
import type { LocalJob, JobType } from '../../types/localKnowledge';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (job: LocalJob) => void;
  locality?: string;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  locality = 'ranaghat'
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState<JobType>('FULL_TIME');
  const [contactMethod, setContactMethod] = useState<'WHATSAPP' | 'PHONE' | 'EMAIL' | 'WALK_IN'>('WHATSAPP');
  const [contactValue, setContactValue] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError('Please enter a specific job title (at least 3 characters).');
      return;
    }
    if (!companyName.trim() || companyName.trim().length < 2) {
      setError('Please enter the employer or business name.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please enter a brief job description (at least 10 characters).');
      return;
    }
    if (!contactValue.trim() || contactValue.trim().length < 3) {
      setError('Please provide contact details (phone, WhatsApp, or email) so candidates can reach you.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = user?.id || (typeof localStorage !== 'undefined' && localStorage.getItem('conflux_local_user_id')) || 'usr_employer_local';
      const userProfile = await localKnowledgeService.getLocalProfile(userId);
      const isVerified = Boolean(userProfile?.verificationStatus === 'VERIFIED' || userProfile?.isVerifiedResident);

      const parsedReqs = requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const newJob = await localKnowledgeService.createJob({
        title: title.trim(),
        companyName: companyName.trim(),
        locality,
        area: area.trim() || undefined,
        description: description.trim(),
        requirements: parsedReqs.length > 0 ? parsedReqs : undefined,
        salaryRange: salaryRange.trim() || undefined,
        jobType,
        contactMethod,
        contactValue: contactValue.trim(),
        postedBy: {
          userId,
          displayName: userProfile?.displayName || user?.fullName || companyName.trim(),
          isVerifiedBusiness: isVerified
        }
      });

      if (onSuccess) {
        onSuccess(newJob);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit job listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 font-inter text-slate-900 my-8 relative"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Briefcase size={22} />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
                Local Opportunities • Ranaghat
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-slate-900">
                Post a Local Job Listing
              </h2>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wholesale Billing Staff, Pharmacist, Sales Rep..."
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            {/* Employer Name & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Business / Employer Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Roy Agro Traders"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Area / Commercial Zone
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Station Road, Rathtala, NH 12..."
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Job Type & Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract / Seasonal</option>
                  <option value="INTERNSHIP">Internship / Trainee</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Salary / Pay Range (Optional)
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. ₹12,000 - ₹18,000 / month"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Job Description & Duties *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe daily work, shift hours, and expectations..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none"
              />
            </div>

            {/* Contact Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  How should candidates contact you?
                </label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as any)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="WHATSAPP">WhatsApp Direct</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="WALK_IN">Walk-in at Office / Shop</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Contact Number / Address *
                </label>
                <input
                  type="text"
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="e.g. 9876543210 or Office address"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>{isSubmitting ? 'Posting Job...' : 'Publish Job Listing'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
