// Conflux Platform — Business Value View & Activity Ledger
// Answers: "How much customer activity did Conflux generate for this business?"

import React, { useState, useEffect } from 'react';
import {
  Eye, MousePointer, MessageSquare, Phone, Globe, Send,
  Calendar, ShieldCheck, CheckCircle2, Clock, X, RefreshCw,
  Zap, Lock, User, AlertCircle
} from 'lucide-react';
import type { ConfluxBusiness } from '../../types/business.ts';
import { connectService, type BusinessActivityReport } from '../../lib/connectService.ts';
import { subscriptionService } from '../../lib/subscriptionService.ts';
import type { BusinessSubscription, BusinessEntitlements, PlanTier } from '../../types/subscription.ts';
import { CONFLUX_PLANS } from '../../types/subscription.ts';

interface BusinessValueModalProps {
  business: ConfluxBusiness | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const BusinessValueModal: React.FC<BusinessValueModalProps> = ({
  business,
  isOpen,
  onClose,
  isAdmin = false
}) => {
  const [report, setReport] = useState<BusinessActivityReport | null>(null);
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
  const [entitlements, setEntitlements] = useState<BusinessEntitlements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const [actReport, subData, entData] = await Promise.all([
        connectService.getBusinessActivityReport(business.id, business.name),
        subscriptionService.getBusinessSubscription(business.id),
        subscriptionService.getBusinessEntitlements(business.id)
      ]);
      setReport(actReport);
      setSubscription(subData);
      setEntitlements(entData);
    } catch (err) {
      console.error('[BusinessValueModal] Error loading activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && business) {
      loadData();
    }
  }, [isOpen, business?.id]);

  if (!isOpen || !business) return null;

  const handlePlanChange = async (newPlan: PlanTier) => {
    if (!business) return;
    setIsUpdatingPlan(true);
    setActionNotice(null);
    try {
      const updated = await subscriptionService.updateBusinessSubscription({
        businessId: business.id,
        plan: newPlan,
        status: newPlan === 'FREE' ? 'INACTIVE' : 'ACTIVE',
        durationDays: 30,
        paymentProvider: 'OFFLINE_MANUAL',
        paymentReference: `ADMIN-UPDATE-${Date.now()}`
      });
      const newEnt = subscriptionService.evaluateEntitlements(updated);
      setSubscription(updated);
      setEntitlements(newEnt);
      setActionNotice(`Plan successfully updated to ${CONFLUX_PLANS[newPlan].name}.`);
    } catch (err: any) {
      setActionNotice(`Failed to update plan: ${err.message}`);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-inter">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold">
                CUSTOMER VALUE &amp; ACTIVITY LEDGER
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {business.confluxBusinessId}
              </span>
              {entitlements?.isPaid ? (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                  ★ {CONFLUX_PLANS[entitlements.plan].name}
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                  Free Directory Tier
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-orbitron text-white">
              {business.name}
            </h2>
            <div className="text-xs text-slate-400">
              {business.location.city}, {business.location.district} • {business.categoryName || business.categoryId}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <span className="font-medium">{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-blue-700 hover:text-blue-900 font-bold">Dismiss</button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">

          {/* Section 1: Customer Activity Generated by Conflux */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black font-orbitron text-slate-900 uppercase tracking-wider">
                  Activity Generated by Conflux
                </h3>
                <p className="text-xs text-slate-500">
                  Real-world customer interactions recorded across search, profile, and direct connects.
                </p>
              </div>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Querying customer interaction ledger...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Views */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] uppercase font-mono font-bold">Views</span>
                    <Eye size={14} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-slate-900">
                    {report?.totalViews || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Profile visits</div>
                </div>

                {/* Total Connects */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-blue-700">
                    <span className="text-[10px] uppercase font-mono font-bold">Connects</span>
                    <MousePointer size={14} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-blue-900">
                    {report?.totalContactActions || 0}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">All CTAs clicked</div>
                </div>

                {/* WhatsApp */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[10px] uppercase font-mono font-bold">WhatsApp</span>
                    <MessageSquare size={14} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-emerald-900">
                    {report?.whatsappClicks || 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Chat intents</div>
                </div>

                {/* Phone */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] uppercase font-mono font-bold">Calls</span>
                    <Phone size={14} className="text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-slate-900">
                    {report?.phoneClicks || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Call clicks</div>
                </div>

                {/* Website */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] uppercase font-mono font-bold">Website</span>
                    <Globe size={14} className="text-purple-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-slate-900">
                    {report?.websiteClicks || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Site referrals</div>
                </div>

                {/* Leads */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[10px] uppercase font-mono font-bold">Leads</span>
                    <Send size={14} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black font-orbitron text-amber-900">
                    {report?.leadSubmissions || 0}
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">Inquiries filed</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Inbound Customer Inquiries (Leads Ledger) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black font-orbitron text-slate-900 uppercase tracking-wider">
                  Inbound Customer Inquiries ({report?.leads?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Customer lead dockets submitted via the verified profile.
                </p>
              </div>
            </div>

            {(!report?.leads || report.leads.length === 0) ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-700">No customer inquiries submitted yet.</div>
                <div className="text-[11px] text-slate-500">
                  Customer messages routed through the public profile lead form will appear in this ledger.
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {report.leads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-900">{lead.contact_name}</td>
                        <td className="p-3 space-y-0.5">
                          <div className="text-blue-600">{lead.contact_email}</div>
                          {lead.contact_phone && (
                            <div className="text-slate-500 font-mono text-[11px]">{lead.contact_phone}</div>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{lead.service_requested || 'General Inquiry'}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate" title={lead.message}>
                          {lead.message || '—'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            lead.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lead.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Commercial Plan & Entitlements Management */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black font-orbitron text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Zap size={16} className="text-blue-600" /> Commercial Plan &amp; Value Entitlement
                </h3>
                <p className="text-xs text-slate-500">
                  Governs instant lead forwarding, 1-tap WhatsApp buttons, and commercial profile badges.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start">
                Status: <span className={entitlements?.isPaid ? 'text-emerald-700' : 'text-slate-500'}>{subscription?.status || 'INACTIVE'}</span>
              </div>
            </div>

            {/* Entitlements Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Instant Lead Forwarding:</span>
                  <span className={entitlements?.features.directLeadForwarding ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {entitlements?.features.directLeadForwarding ? '✓ Active' : '✗ Free Batching'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Real-time email and WhatsApp notifications directly to business.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>1-Tap WhatsApp &amp; Call CTAs:</span>
                  <span className={entitlements?.features.directActionCtas ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {entitlements?.features.directActionCtas ? '✓ Enabled' : 'Standard'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">High-contrast conversion buttons on mobile profile &amp; directory.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Customer Activity Reporting:</span>
                  <span className={entitlements?.features.analyticsReporting ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {entitlements?.features.analyticsReporting ? '✓ Unlocked' : 'Basic'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Full telemetry counts and customer contact ledger view.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Commercial Growth Badge:</span>
                  <span className={entitlements?.features.partnerBadge ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {entitlements?.features.partnerBadge ? '★ Displayed' : 'None'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Featured Partner designation (strictly distinct from statutory verification).</p>
              </div>
            </div>

            {/* Admin Plan Switcher / Testing Control */}
            {isAdmin && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Admin Plan Control (Testing / Manual Billing Activation)
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(['FREE', 'VERIFIED_GROWTH', 'REGIONAL_SCALE', 'ENTERPRISE'] as PlanTier[]).map(plan => {
                    const isCurrent = (subscription?.plan || 'FREE') === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        disabled={isUpdatingPlan || isCurrent}
                        onClick={() => handlePlanChange(plan)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        } disabled:opacity-50`}
                      >
                        {plan === 'FREE' ? 'Free Directory' : CONFLUX_PLANS[plan].name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compliance & Trust Notice */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 space-y-0.5">
              <strong className="block font-bold">Conflux Integrity Policy</strong>
              <span>Commercial plan subscriptions fund lead delivery and search infrastructure. Paid status does <strong>not</strong> influence statutory license verification (GSTIN/FSSAI/MCA), which is audited independently.</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
