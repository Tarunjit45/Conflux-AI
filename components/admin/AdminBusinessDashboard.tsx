// Conflux Platform — Admin Business Management Command Center (Web-Operable CRUD, Claim Audits & Telemetry)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle2,
  XCircle, Edit3, Trash2, Globe, ExternalLink, RefreshCw, Phone, MessageSquare,
  MapPin, Check, AlertCircle, ArrowRight, X, Clock, Layers, BarChart3,
  TrendingUp, Users, Send, Eye, MousePointer, Activity, UserCheck, ShieldOff,
  FileCheck, ThumbsUp, ThumbsDown, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import { connectService, type MeasurementReport } from '../../lib/connectService';
import type { ConfluxBusiness, BusinessPublishStatus } from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../../data/taxonomiesData';

export const AdminBusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'CLAIMS' | 'MEASUREMENT'>('ENTITIES');
  const [businesses, setBusinesses] = useState<ConfluxBusiness[]>([]);
  const [measurementReport, setMeasurementReport] = useState<MeasurementReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerStatus, setSelectedVerStatus] = useState('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<ConfluxBusiness | null>(null);
  const [verifyingBusiness, setVerifyingBusiness] = useState<ConfluxBusiness | null>(null);
  const [verifyClaimStatement, setVerifyClaimStatement] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formState, setFormState] = useState({
    name: '',
    legalName: '',
    businessType: 'LOCAL_BUSINESS' as ConfluxBusiness['businessType'],
    categoryId: 'retail-trade',
    description: '',
    shortSummary: '',
    district: 'nadia',
    city: 'ranaghat',
    landmark: '',
    services: '',
    fullAddress: '',
    phone: '',
    whatsapp: '',
    email: '',
    websiteUrl: '',
    bookingUrl: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    const data = await businessService.getAllBusinesses();
    setBusinesses(data);
    const report = await connectService.getMeasurementReport();
    setMeasurementReport(report);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormState({
      name: '',
      legalName: '',
      businessType: 'LOCAL_BUSINESS',
      categoryId: 'retail-trade',
      description: '',
      shortSummary: '',
      district: 'nadia',
      city: 'ranaghat',
      landmark: '',
      services: '',
      fullAddress: '',
      phone: '',
      whatsapp: '',
      email: '',
      websiteUrl: '',
      bookingUrl: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (biz: ConfluxBusiness) => {
    setEditingBusiness(biz);
    setFormState({
      name: biz.name,
      legalName: biz.legalName || '',
      businessType: biz.businessType,
      categoryId: biz.categoryId,
      description: biz.description,
      shortSummary: biz.shortSummary || '',
      district: biz.location.district,
      city: biz.location.city,
      landmark: biz.landmark || '',
      services: (biz.services || []).join(', '),
      fullAddress: biz.location.fullAddress,
      phone: biz.contact.phone || '',
      whatsapp: biz.contact.whatsapp || '',
      email: biz.contact.email || '',
      websiteUrl: biz.contact.websiteUrl || '',
      bookingUrl: biz.contact.bookingUrl || ''
    });
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.description || !formState.fullAddress) {
      alert('Please fill all required fields (Name, Description, Address).');
      return;
    }

    const servicesArray = formState.services
      ? formState.services.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      if (editingBusiness) {
        await businessService.updateBusiness(editingBusiness.id, {
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary || undefined,
          landmark: formState.landmark || undefined,
          services: servicesArray,
          location: {
            ...editingBusiness.location,
            district: formState.district,
            city: formState.city,
            landmark: formState.landmark || undefined,
            fullAddress: formState.fullAddress
          },
          contact: {
            ...editingBusiness.contact,
            phone: formState.phone || undefined,
            whatsapp: formState.whatsapp || undefined,
            email: formState.email || undefined,
            websiteUrl: formState.websiteUrl || undefined,
            bookingUrl: formState.bookingUrl || undefined
          }
        });
        showNotification(`Updated "${formState.name}" successfully.`);
      } else {
        const created = await businessService.createBusiness({
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary || undefined,
          district: formState.district,
          city: formState.city,
          landmark: formState.landmark || undefined,
          services: servicesArray,
          fullAddress: formState.fullAddress,
          phone: formState.phone || undefined,
          whatsapp: formState.whatsapp || undefined,
          email: formState.email || undefined,
          websiteUrl: formState.websiteUrl || undefined,
          bookingUrl: formState.bookingUrl || undefined
        });
        showNotification(`Created business ${created.confluxBusinessId} (Status: DRAFT, Unverified).`);
      }

      setIsCreateModalOpen(false);
      setEditingBusiness(null);
      await loadData();
    } catch (err: any) {
      alert(`Error saving business: ${err.message}`);
    }
  };

  const handleTogglePublish = async (biz: ConfluxBusiness) => {
    const nextStatus: BusinessPublishStatus = biz.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await businessService.setPublishStatus(biz.id, nextStatus);
    showNotification(`Status for ${biz.name} set to ${nextStatus}.`);
    await loadData();
  };

  const handleSuspend = async (biz: ConfluxBusiness) => {
    if (confirm(`Are you sure you want to SUSPEND "${biz.name}"? It will be removed from public discovery immediately.`)) {
      await businessService.suspendBusiness(biz.id);
      showNotification(`"${biz.name}" suspended successfully.`);
      await loadData();
    }
  };

  const handleApproveClaim = async (biz: ConfluxBusiness) => {
    if (confirm(`Approve ownership claim for "${biz.name}"? The verified owner will gain full management privileges.`)) {
      await businessService.approveClaim(biz.id);
      showNotification(`Ownership claim for "${biz.name}" APPROVED.`);
      await loadData();
    }
  };

  const handleRejectClaim = async (biz: ConfluxBusiness) => {
    if (confirm(`Reject ownership claim for "${biz.name}"? The entity will revert to publicly documented unclaimed status.`)) {
      await businessService.rejectClaim(biz.id);
      showNotification(`Ownership claim for "${biz.name}" REJECTED.`);
      await loadData();
    }
  };

  const handleOpenVerifyModal = (biz: ConfluxBusiness) => {
    setVerifyingBusiness(biz);
    setVerifyClaimStatement(
      `${biz.name} is an active registered enterprise operating in ${biz.location.city}, ${biz.location.district}, West Bengal.`
    );
  };

  const handleExecuteVerification = async () => {
    if (!verifyingBusiness || !verifyClaimStatement.trim()) return;
    setIsVerifying(true);

    try {
      const updated = await businessService.verifyBusinessClaim(
        verifyingBusiness.id,
        verifyClaimStatement.trim()
      );
      showNotification(`Verification evaluated. Status: ${updated.verificationStatus} (${updated.confidenceScore}% confidence)`);
      setVerifyingBusiness(null);
      await loadData();
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async (biz: ConfluxBusiness) => {
    if (confirm(`CONFIRM DELETION: Are you sure you want to permanently remove "${biz.name}" (${biz.confluxBusinessId}) from the Business Graph?`)) {
      await businessService.deleteBusiness(biz.id);
      showNotification(`Removed "${biz.name}" from Business Graph.`);
      await loadData();
    }
  };

  const filtered = businesses.filter(biz => {
    if (selectedDistrict !== 'all' && biz.location.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (selectedStatus !== 'all' && biz.status !== selectedStatus) {
      return false;
    }
    if (selectedVerStatus !== 'all' && biz.verificationStatus !== selectedVerStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        biz.name.toLowerCase().includes(q) ||
        biz.confluxBusinessId.toLowerCase().includes(q) ||
        biz.location.city.toLowerCase().includes(q) ||
        biz.categoryId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingClaims = businesses.filter(b => b.claimStatus === 'CLAIM_PENDING');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Private Admin Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 font-mono">
              <Lock size={15} /> Conflux Private Admin Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
              Business Graph &amp; Operational Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Add businesses, review statutory evidence, audit ownership claims, and monitor real telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Business
            </button>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
            >
              <Globe size={16} /> View Discover
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 w-fit">
          <button
            onClick={() => setActiveTab('ENTITIES')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ENTITIES'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={15} /> Business Entities ({businesses.length})
          </button>

          <button
            onClick={() => setActiveTab('CLAIMS')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CLAIMS'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={15} /> Owner Claims ({pendingClaims.length})
          </button>

          <button
            onClick={() => setActiveTab('MEASUREMENT')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MEASUREMENT'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={15} /> Telemetry &amp; Revenue Metrics
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            {statusMessage}
          </motion.div>
        )}

        {/* ── TAB 1: ENTITIES MANAGEMENT ─────────────────────────── */}
        {activeTab === 'ENTITIES' && (
          <div className="space-y-6">
            {/* Filters & Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, city..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">All Districts ({WEST_BENGAL_DISTRICTS.length})</option>
                  {WEST_BENGAL_DISTRICTS.map(d => (
                    <option key={d.slug} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">All Publishing Statuses</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Draft Only</option>
                  <option value="SUSPENDED">Suspended Only</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedVerStatus}
                  onChange={e => setSelectedVerStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="SUPPORTED">Verified (Supported)</option>
                  <option value="PARTIALLY_SUPPORTED">Partially Supported</option>
                  <option value="UNVERIFIED">Unverified</option>
                </select>
              </div>
            </div>

            {/* Business Graph Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold font-orbitron text-slate-900">
                  Businesses in Graph ({filtered.length})
                </h2>
                <button
                  onClick={loadData}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Graph
                </button>
              </div>

              {isLoading ? (
                <div className="p-16 text-center text-slate-400">Loading Business Graph nodes...</div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center text-slate-500">No businesses match the selected filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6">ID &amp; Name</th>
                        <th className="py-4 px-4">Location</th>
                        <th className="py-4 px-4">Verification</th>
                        <th className="py-4 px-4">Publish Status</th>
                        <th className="py-4 px-4">Claim Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filtered.map(biz => {
                        const isVerified = biz.verificationStatus === 'SUPPORTED';
                        const isPublished = biz.status === 'PUBLISHED';
                        const isSuspended = biz.status === 'SUSPENDED';
                        const profilePath = `/business/india/west-bengal/${biz.location.district}/${biz.location.city}/${biz.slug}`;

                        return (
                          <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 space-y-1">
                              <div className="font-mono text-xs font-bold text-blue-700">
                                {biz.confluxBusinessId}
                              </div>
                              <div className="font-bold text-slate-900 text-sm">{biz.name}</div>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {biz.categoryName || biz.categoryId}
                              </div>
                            </td>

                            <td className="py-4 px-4 space-y-0.5">
                              <div className="capitalize font-bold text-slate-800">{biz.location.city}</div>
                              <div className="text-[11px] text-slate-500 capitalize">{biz.location.district}</div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                                    <ShieldCheck size={12} /> {biz.confidenceScore}% VERIFIED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold font-mono">
                                    {biz.verificationStatus}
                                  </span>
                                )}
                                <div>
                                  <button
                                    onClick={() => handleOpenVerifyModal(biz)}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    Run Verification
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 space-y-1.5">
                              <div>
                                <button
                                  onClick={() => handleTogglePublish(biz)}
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                    isPublished
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : isSuspended
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                >
                                  {biz.status}
                                </button>
                              </div>
                              {isPublished && (
                                <button
                                  onClick={() => handleSuspend(biz)}
                                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold block cursor-pointer"
                                >
                                  Suspend Listing
                                </button>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                                biz.claimStatus === 'VERIFIED_OWNER'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : biz.claimStatus === 'CLAIM_PENDING'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {biz.claimStatus || 'UNCLAIMED_PUBLIC'}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  to={profilePath}
                                  target="_blank"
                                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                  title="View Public Profile"
                                >
                                  <ExternalLink size={16} />
                                </Link>

                                <button
                                  onClick={() => handleOpenEdit(biz)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Business"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  onClick={() => handleDelete(biz)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Business"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: OWNER CLAIMS REVIEW ─────────────────────────── */}
        {activeTab === 'CLAIMS' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900">
                    Pending Ownership Claims Review ({pendingClaims.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and corroborate ownership claims submitted by real business proprietors before unlocking profile control.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Claims
                </button>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No pending ownership claims awaiting review at this time.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingClaims.map(biz => (
                    <div key={biz.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {biz.confluxBusinessId}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{biz.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                            CLAIM PENDING
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold">Location:</span> {biz.location.fullAddress}
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold">Phone:</span> {biz.contact.phone || 'N/A'} • <span className="font-semibold">Email:</span> {biz.contact.email || 'N/A'}
                        </div>
                        {biz.evidenceSummary && (
                          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-700 font-mono">
                            Claim Proof: {biz.evidenceSummary}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveClaim(biz)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp size={14} /> Approve Claim
                        </button>
                        <button
                          onClick={() => handleRejectClaim(biz)}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsDown size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: REVENUE VALIDATION & MEASUREMENT ─────────────── */}
        {activeTab === 'MEASUREMENT' && measurementReport && (
          <div className="space-y-8">
            {/* Top Scorecard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Onboarded */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Onboarded</span>
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.businessesOnboarded.total}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-emerald-700 font-bold">{measurementReport.businessesOnboarded.published} Published</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">{measurementReport.businessesOnboarded.draft} Draft</span>
                </div>
              </div>

              {/* Card 2: Verified */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Verified</span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.verifiedBusinesses.totalVerified}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-emerald-700 font-bold">{measurementReport.verifiedBusinesses.supported} Supported</span>
                  <span>•</span>
                  <span>{measurementReport.verifiedBusinesses.unverified} Unverified</span>
                </div>
              </div>

              {/* Card 3: Claims Audited */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Owner Claims</span>
                  <UserCheck size={16} className="text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.claims?.total || 0}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-amber-700 font-bold">{measurementReport.claims?.pending || 0} Pending</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{measurementReport.claims?.verifiedOwners || 0} Verified</span>
                </div>
              </div>

              {/* Card 4: Connect Actions */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Connects</span>
                  <MousePointer size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.connectActions.total}
                </div>
                <div className="text-[11px] text-slate-500">
                  {measurementReport.connectActions.whatsapp} WA • {measurementReport.connectActions.calls} Calls • {measurementReport.connectActions.bookings} Book
                </div>
              </div>

              {/* Card 5: Inbound Leads */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Inbound Leads</span>
                  <Send size={16} className="text-indigo-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.leads.total}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Dispatched via Resend
                </div>
              </div>
            </div>

            {/* Ranaghat Corridor Focus Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-blue-300">
                <MapPin size={16} /> Ranaghat Local Pilot Corridor Status
              </div>
              <h3 className="text-xl font-bold font-orbitron">
                Ranaghat &amp; Nadia Pilot Onboarding Target: 10 Verified Businesses
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                Ready for manual onboarding of verified local enterprises (Agro-processors, Tant Weavers, Diagnostics &amp; Health Clinics, Gyms, HVAC Technicians, and Local Food services).
              </p>
            </div>

            {/* Real Recorded Telemetry Events Stream */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold font-orbitron text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" /> Real Telemetry Event Stream ({measurementReport.recentEvents.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">Zero Synthetic Traffic</span>
              </div>

              {measurementReport.recentEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No interaction events recorded yet. Perform searches on <Link to="/discover" className="text-blue-600 underline">/discover</Link> or click connect buttons on public profiles to see real events logged here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-6">Timestamp</th>
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Business ID / Intent</th>
                        <th className="py-3 px-6">Session ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {measurementReport.recentEvents.map(evt => (
                        <tr key={evt.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-6 text-slate-500">
                            {new Date(evt.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                              {evt.eventType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{evt.channel}</td>
                          <td className="py-3 px-4 text-slate-900 font-bold">
                            {evt.intentId || evt.businessId}
                          </td>
                          <td className="py-3 px-6 text-slate-400">{evt.sessionPseudonym}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {(isCreateModalOpen || editingBusiness) && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold font-orbitron text-slate-900">
                  {editingBusiness ? `Edit Business (${editingBusiness.confluxBusinessId})` : 'Register New Business'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingBusiness(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Business Brand Name *</label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Ranaghat Apex Diagnostic Centre"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Legal Registered Name</label>
                    <input
                      type="text"
                      value={formState.legalName}
                      onChange={e => setFormState({ ...formState, legalName: e.target.value })}
                      placeholder="e.g. Apex Health Diagnostic LLP"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">District *</label>
                    <select
                      value={formState.district}
                      onChange={e => setFormState({ ...formState, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    >
                      {WEST_BENGAL_DISTRICTS.map(d => (
                        <option key={d.slug} value={d.slug}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City / Town *</label>
                    <input
                      type="text"
                      value={formState.city}
                      onChange={e => setFormState({ ...formState, city: e.target.value })}
                      placeholder="e.g. ranaghat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Landmark (e.g. Near Station, Court More)</label>
                  <input
                    type="text"
                    value={formState.landmark}
                    onChange={e => setFormState({ ...formState, landmark: e.target.value })}
                    placeholder="e.g. Near Sub-Divisional Hospital Gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Physical Address *</label>
                  <input
                    type="text"
                    value={formState.fullAddress}
                    onChange={e => setFormState({ ...formState, fullAddress: e.target.value })}
                    placeholder="e.g. College Road, Near Sub-Divisional Hospital, Ranaghat, Nadia 741201"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <select
                    value={formState.categoryId}
                    onChange={e => setFormState({ ...formState, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="healthcare">Healthcare &amp; Diagnostics</option>
                    <option value="food-hospitality">Restaurants &amp; Food Services</option>
                    <option value="fitness-wellness">Gyms &amp; Fitness</option>
                    <option value="services-repairs">Repairs &amp; HVAC Services</option>
                    <option value="tourism-hospitality">Hotels &amp; Tourism</option>
                    <option value="salons-beauty">Salons &amp; Personal Care</option>
                    <option value="handloom-textiles">Handloom &amp; Textiles</option>
                    <option value="agriculture-farming">Agro-Processing &amp; Farming</option>
                    <option value="manufacturing-industrial">Manufacturing &amp; Machining</option>
                    <option value="it-software">IT, AI &amp; Software</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Services Offered (Comma Separated)</label>
                  <input
                    type="text"
                    value={formState.services}
                    onChange={e => setFormState({ ...formState, services: e.target.value })}
                    placeholder="e.g. Ultrasound (USG), Digital X-Ray, Pathology Blood Tests, Doctor Chamber"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description *</label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={e => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Comprehensive description of operations, products, and specialties..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Direct Phone</label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={e => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formState.whatsapp}
                      onChange={e => setFormState({ ...formState, whatsapp: e.target.value })}
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Website URL</label>
                    <input
                      type="url"
                      value={formState.websiteUrl}
                      onChange={e => setFormState({ ...formState, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Booking / Ordering URL</label>
                    <input
                      type="url"
                      value={formState.bookingUrl}
                      onChange={e => setFormState({ ...formState, bookingUrl: e.target.value })}
                      placeholder="https://example.com/book"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingBusiness(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    {editingBusiness ? 'Save Changes' : 'Register Business'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFICATION MODAL */}
      <AnimatePresence>
        {verifyingBusiness && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg font-orbitron">
                  <ShieldCheck size={22} className="text-blue-600" /> Verify Claim via Conflux Verify
                </div>
                <button
                  onClick={() => setVerifyingBusiness(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs space-y-1">
                  <div className="font-bold text-blue-900">Target Entity: {verifyingBusiness.name}</div>
                  <div className="font-mono text-blue-700">{verifyingBusiness.confluxBusinessId}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Verification Claim Statement *</label>
                  <textarea
                    rows={4}
                    value={verifyClaimStatement}
                    onChange={e => setVerifyClaimStatement(e.target.value)}
                    placeholder="Specify the factual claim to corroborate against statutory registers..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conflux Verify deterministically assesses this claim against primary statutory repositories (MCA, GSTIN, FSSAI, Clinical Establishments, IAF CertSearch) and generates an authoritative confidence score.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingBusiness(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteVerification}
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isVerifying ? 'Running Verify Engine...' : 'Corroborate & Ground'} <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
