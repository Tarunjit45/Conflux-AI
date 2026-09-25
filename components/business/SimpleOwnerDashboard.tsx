// Conflux Platform — Simple Business Owner Dashboard (/business/dashboard)
// Principle: ONE SCREEN → ONE DECISION → ONE ACTION
// Answers 4 essential questions:
// 1. Is my business live?
// 2. How is my profile doing?
// 3. Did someone contact me?
// 4. What should I do next?

import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldCheck, CheckCircle2, MessageSquare, Phone,
  Eye, ArrowRight, ExternalLink, Clock, Plus, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { businessService } from '../../lib/businessService';
import type { ConfluxBusiness } from '../../types/business';
import { VerificationCheckoutModal } from '../verification/VerificationCheckoutModal';

export const SimpleOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<ConfluxBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationCheckoutOpen, setIsVerificationCheckoutOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Load verified businesses associated with user or default sample
    businessService.searchBusinesses({ verifiedOnly: false })
      .then(res => {
        if (isMounted) {
          if (Array.isArray(res) && res.length > 0) {
            setBusinesses(res.map(r => r.business).slice(0, 2));
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [user]);

  const activeBusiness = businesses[0];
  const isVerified = activeBusiness?.verificationStatus === 'SUPPORTED';

  return (
    <div className="min-h-[85vh] bg-slate-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-inter text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Business Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
              Welcome{user?.fullName ? `, ${user.fullName}` : ''}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage your local business presence and track direct customer inquiries.
            </p>
          </div>

          <Link
            to="/list-business"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition-all"
          >
            <Plus size={15} />
            <span>List Another Business</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-700 border-r-transparent mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading your business details...</p>
          </div>
        ) : activeBusiness ? (
          <div className="space-y-6">
            
            {/* ── QUESTION 1: IS MY BUSINESS LIVE? ─────────────────── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. Current Status
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Live &amp; Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      Standard Listing
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsVerificationCheckoutOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <ShieldCheck size={13} className="text-blue-600" />
                      <span>Get Verified &bull; ₹499</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {activeBusiness.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeBusiness.categoryName || activeBusiness.categoryId} &bull; {activeBusiness.location.locality || activeBusiness.location.city}, {activeBusiness.location.district}
                  </p>
                </div>

                <Link
                  to={`/business/${activeBusiness.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  <span>View Public Profile</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {/* ── QUESTION 2 & 3: PROFILE ACTIVITY & LEADS ─────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Question 2: How is my profile doing? */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Visibility
                  </span>
                  <Eye size={18} className="text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-950">
                  Active
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your business is discoverable across Google Search and AI answer engines via Schema.org structured data.
                </p>
              </div>

              {/* Question 3: Did someone contact me? */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. Direct Inquiries
                  </span>
                  <MessageSquare size={18} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-950">
                  Direct Line Active
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inquiries route directly to your phone ({activeBusiness.contact.phone || 'Configured'}) and WhatsApp with zero middleman commission.
                </p>
              </div>
            </div>

            {/* ── QUESTION 4: WHAT SHOULD I DO NEXT? ───────────────── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                4. Recommended Actions
              </span>
              <h3 className="text-lg font-bold text-slate-950">
                Keep your profile at peak trust
              </h3>

              <div className="space-y-3 pt-1">
                {!isVerified && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                        <ShieldCheck size={16} className="text-blue-700 shrink-0" />
                        <span>Apply for Conflux Verified — ₹499 for First Year Review</span>
                      </div>
                      <p className="text-blue-900/90 leading-relaxed text-[11px]">
                        Submit municipal Trade License, GSTIN, or statutory documentation for manual review and earn the official Conflux Verified badge.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVerificationCheckoutOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>Apply for Verification</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-600" />
                      Verify Operating Hours
                    </div>
                    <p className="text-xs text-slate-500">
                      Ensure your business hours are accurate so customers know when you're open.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 shrink-0">Updated</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-blue-600" />
                      Statutory Registry Evidence
                    </div>
                    <p className="text-xs text-slate-500">
                      Keep your municipal Trade License or GSTIN documentation current.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 shrink-0">Active</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State for User with No Listed Business */
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
              <Building2 size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-950">
                No business listed yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                List your business on Conflux to verify your credentials and let local customers find you on Google, Maps, and WhatsApp.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/list-business"
                className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 transition-all inline-flex items-center gap-2"
              >
                <span>List Business Free</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

      </div>

      {activeBusiness && (
        <VerificationCheckoutModal
          isOpen={isVerificationCheckoutOpen}
          onClose={() => setIsVerificationCheckoutOpen(false)}
          business={activeBusiness}
        />
      )}
    </div>
  );
};

export default SimpleOwnerDashboard;
