// Conflux Platform — Admin Business Management Command Center (Web-Operable CRUD)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle2,
  XCircle, Edit3, Trash2, Globe, ExternalLink, RefreshCw, Phone, MessageSquare,
  MapPin, Check, AlertCircle, ArrowRight, X, Clock, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import type { ConfluxBusiness, BusinessPublishStatus } from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../../data/taxonomiesData';

export const AdminBusinessDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<ConfluxBusiness[]>([]);
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
    fullAddress: '',
    phone: '',
    whatsapp: '',
    email: '',
    websiteUrl: '',
    bookingUrl: ''
  });

  const loadBusinesses = async () => {
    setIsLoading(true);
    const data = await businessService.getAllBusinesses();
    setBusinesses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
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

    try {
      if (editingBusiness) {
        await businessService.updateBusiness(editingBusiness.id, {
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary,
          location: {
            ...editingBusiness.location,
            district: formState.district,
            city: formState.city,
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
        showNotification(`Updated ${formState.name} successfully.`);
        setEditingBusiness(null);
      } else {
        const created = await businessService.createBusiness({
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary,
          district: formState.district,
          city: formState.city,
          fullAddress: formState.fullAddress,
          phone: formState.phone,
          whatsapp: formState.whatsapp,
          email: formState.email,
          websiteUrl: formState.websiteUrl,
          bookingUrl: formState.bookingUrl
        });
        showNotification(`Created business ${created.confluxBusinessId} (${created.name}).`);
        setIsCreateModalOpen(false);
      }
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message || 'Error saving business.');
    }
  };

  const handleTogglePublish = async (biz: ConfluxBusiness) => {
    const nextStatus: BusinessPublishStatus = biz.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await businessService.setPublishStatus(biz.id, nextStatus);
    showNotification(`${biz.name} is now ${nextStatus}`);
    await loadBusinesses();
  };

  const handleDelete = async (biz: ConfluxBusiness) => {
    if (confirm(`Are you sure you want to delete ${biz.name} (${biz.confluxBusinessId})?`)) {
      await businessService.deleteBusiness(biz.id);
      showNotification(`Deleted ${biz.name}`);
      await loadBusinesses();
    }
  };

  const handleRunVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingBusiness || !verifyClaimStatement) return;
    setIsVerifying(true);

    try {
      const updated = await businessService.verifyBusinessClaim(verifyingBusiness.id, verifyClaimStatement);
      showNotification(`Verification finished: ${updated.verificationStatus} (${updated.confidenceScore}%)`);
      setVerifyingBusiness(null);
      setVerifyClaimStatement('');
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter Logic
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 font-mono">
              <Building2 size={16} /> Conflux Business Graph OS
            </div>
            <h1 className="text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
              Business Identity &amp; Verification Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add, verify, manage, and publish businesses without deploying code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Business
            </button>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              <Globe size={16} /> View Discover
            </Link>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            {statusMessage}
          </motion.div>
        )}

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
              onClick={loadBusinesses}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Refresh Graph
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading Business Graph records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="mx-auto text-slate-300" size={40} />
              <div className="text-base font-bold text-slate-700">No businesses match your filters.</div>
              <button
                onClick={handleOpenCreate}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Add a new business now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6">Business ID / Name</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Trust Status</th>
                    <th className="py-4 px-4">Publishing</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(biz => {
                    const isPublished = biz.status === 'PUBLISHED';
                    const isVerified = biz.verificationStatus === 'SUPPORTED';
                    const profilePath = `/business/india/west-bengal/${biz.location.district}/${biz.location.city}/${biz.slug}`;

                    return (
                      <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID & Name */}
                        <td className="py-4 px-6">
                          <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                            {biz.confluxBusinessId}
                          </div>
                          <div className="font-bold text-slate-900 text-base">{biz.name}</div>
                          {biz.legalName && (
                            <div className="text-xs text-slate-400">{biz.legalName}</div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-800 capitalize">
                            {biz.location.city}, {biz.location.district}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {biz.location.fullAddress}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                            {biz.categoryName || biz.categoryId}
                          </span>
                        </td>

                        {/* Trust Status */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                                <ShieldCheck size={14} className="text-emerald-600" /> {biz.verificationStatus}
                              </span>
                            ) : biz.verificationStatus === 'PARTIALLY_SUPPORTED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                                <AlertCircle size={14} className="text-amber-600" /> PARTIAL ({biz.confidenceScore}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                                <Clock size={14} /> UNVERIFIED
                              </span>
                            )}
                          </div>
                          {biz.primaryRegistrar && (
                            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {biz.primaryRegistrar}
                            </div>
                          )}
                        </td>

                        {/* Publishing Status */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleTogglePublish(biz)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isPublished
                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {biz.status}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setVerifyingBusiness(biz);
                                setVerifyClaimStatement(biz.evidenceSummary || `${biz.name} is a registered business operating in ${biz.location.city}, Nadia`);
                              }}
                              className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Run Evidence Verification"
                            >
                              <ShieldCheck size={16} />
                            </button>

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
                              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Business"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(biz)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  className="text-slate-400 hover:text-slate-700"
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
                      placeholder="e.g. Ranaghat Agro Processing"
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
                      placeholder="e.g. Ranaghat Agro Pvt Ltd"
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
                      placeholder="e.g. Ranaghat, Kalyani, Kolkata"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Physical Address *</label>
                  <input
                    type="text"
                    value={formState.fullAddress}
                    onChange={e => setFormState({ ...formState, fullAddress: e.target.value })}
                    placeholder="e.g. NH-12 Agro Corridor, Ranaghat, Nadia 741201"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <input
                    type="text"
                    value={formState.categoryId}
                    onChange={e => setFormState({ ...formState, categoryId: e.target.value })}
                    placeholder="e.g. agriculture-farming, manufacturing, healthcare, restaurants"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description *</label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={e => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Detailed overview of products, services, and operational capabilities..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number (E.164)</label>
                    <input
                      type="text"
                      value={formState.phone}
                      onChange={e => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
                    <input
                      type="text"
                      value={formState.whatsapp}
                      onChange={e => setFormState({ ...formState, whatsapp: e.target.value })}
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Website URL</label>
                    <input
                      type="url"
                      value={formState.websiteUrl}
                      onChange={e => setFormState({ ...formState, websiteUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Booking / Appointment URL</label>
                    <input
                      type="url"
                      value={formState.bookingUrl}
                      onChange={e => setFormState({ ...formState, bookingUrl: e.target.value })}
                      placeholder="https://.../book"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingBusiness(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    {editingBusiness ? 'Update Business' : 'Create Business'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFY CLAIM MODAL */}
      <AnimatePresence>
        {verifyingBusiness && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <ShieldCheck size={20} /> Conflux Verify Engine Integration
                </div>
                <button
                  onClick={() => setVerifyingBusiness(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold font-orbitron text-slate-900">
                  Verify Claims for {verifyingBusiness.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluates the claim statement against statutory registrars (MCA, GSTIN, FSSAI, IAF ISO) via deterministic verification rules.
                </p>
              </div>

              <form onSubmit={handleRunVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Claim Statement to Verify *</label>
                  <textarea
                    rows={3}
                    value={verifyClaimStatement}
                    onChange={e => setVerifyClaimStatement(e.target.value)}
                    placeholder="e.g. Holds active FSSAI food processing license in Nadia district"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold block text-slate-700">Current Status:</span>
                  <div>Status: <span className="font-mono font-bold text-slate-900">{verifyingBusiness.verificationStatus}</span></div>
                  <div>Confidence: <span className="font-mono font-bold text-slate-900">{verifyingBusiness.confidenceScore}%</span></div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerifyingBusiness(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> Evaluating Registrar...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Run Verification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
