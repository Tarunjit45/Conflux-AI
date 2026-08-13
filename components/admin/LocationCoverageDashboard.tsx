import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllLocations } from '../../data/locationsData';
import { LocationItem, LocationStatus } from '../../types/location';
import { MapPin, Filter, Search, ShieldCheck, ExternalLink, BarChart2, Layers, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { getLocationEventStats } from '../../lib/locationAnalytics';

const LocationCoverageDashboard: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [eventStats, setEventStats] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Location Coverage Dashboard | Conflux AI Admin';
    setLocations(getAllLocations());
    setEventStats(getLocationEventStats());
  }, []);

  const filteredLocations = locations.filter(item => {
    const matchesDistrict = selectedDistrict === 'ALL' || item.districtSlug === selectedDistrict || item.slug === selectedDistrict;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subdivisionName && item.subdivisionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.blockName && item.blockName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDistrict && matchesStatus && matchesSearch;
  });

  const publishedCount = locations.filter(l => l.status === 'PUBLISHED').length;
  const dataOnlyCount = locations.filter(l => l.status === 'DATA_ONLY').length;
  const draftCount = locations.filter(l => l.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-32 pb-20 font-inter">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Layers size={14} /> Internal Geographic Intelligence System
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-orbitron text-white">
              West Bengal <span className="text-blue-500">Location Coverage Map</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Internal control panel for managing geographic data model, publication tiers, opportunity scoring, and conversion metrics.
            </p>
          </div>
          
          <Link to="/locations/west-bengal" className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start">
            <ArrowLeft size={14} /> View Public Hub
          </Link>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Dataset Locations</span>
            <span className="text-3xl font-black font-orbitron text-white">{locations.length}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Full West Bengal Coverage Data</span>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/50">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Published Indexable</span>
            <span className="text-3xl font-black font-orbitron text-emerald-400">{publishedCount}</span>
            <span className="text-[11px] text-emerald-300/80 block mt-1">High-Quality Tier 1 & Tier 2 Pages</span>
          </div>

          <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-800/50">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">Data-Only Records</span>
            <span className="text-3xl font-black font-orbitron text-amber-400">{dataOnlyCount}</span>
            <span className="text-[11px] text-amber-300/80 block mt-1">Unindexed Administrative Data</span>
          </div>

          <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/50">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">Draft State</span>
            <span className="text-3xl font-black font-orbitron text-blue-400">{draftCount}</span>
            <span className="text-[11px] text-blue-300/80 block mt-1">Curated Content In Review</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search town, block, GP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED (Indexable)</option>
              <option value="DATA_ONLY">DATA_ONLY (Unindexed)</option>
              <option value="DRAFT">DRAFT</option>
            </select>

            {/* Filter by District */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Districts</option>
              <option value="nadia">Nadia District</option>
              <option value="kolkata">Kolkata District</option>
              <option value="purba-medinipur">Purba Medinipur</option>
              <option value="paschim-bardhaman">Paschim Bardhaman</option>
              <option value="darjeeling">Darjeeling</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredLocations.length} of {locations.length} records
          </span>
        </div>

        {/* Coverage Data Table */}
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-4">Location Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">District / Admin Hierarchy</th>
                <th className="p-4">Status</th>
                <th className="p-4">Opp. Score</th>
                <th className="p-4">Primary Services</th>
                <th className="p-4">URL / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLocations.map((item) => {
                const isPublished = item.status === 'PUBLISHED';
                const hasAnalytics = eventStats[item.slug];
                const pageViews = hasAnalytics?.['page_view'] || 0;
                const clicks = (hasAnalytics?.['whatsapp_click'] || 0) + (hasAnalytics?.['contact_click'] || 0);

                let publicUrl = '';
                if (item.type === 'state') publicUrl = '/locations/west-bengal';
                else if (item.type === 'district') publicUrl = `/locations/west-bengal/${item.slug}`;
                else if (item.districtSlug) publicUrl = `/locations/west-bengal/${item.districtSlug}/${item.slug}`;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className={isPublished ? "text-blue-400" : "text-slate-500"} />
                        <span>{item.displayName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 capitalize">{item.type.replace('_', ' ')}</td>
                    <td className="p-4 text-slate-400">
                      <div>{item.districtSlug || item.name}</div>
                      {item.subdivisionName && <div className="text-[10px] text-slate-500">{item.subdivisionName}</div>}
                      {item.blockName && <div className="text-[10px] text-slate-500">{item.blockName}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPublished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.status === 'DATA_ONLY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.opportunityScore ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-yellow-400 font-orbitron">{item.opportunityScore.overallScore.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-500">{item.opportunityScore.isEstimated ? '(Est.)' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      {item.majorIndustries?.slice(0, 2).join(', ') || 'AI Automation, WhatsApp'}
                    </td>
                    <td className="p-4">
                      {isPublished ? (
                        <Link 
                          to={publicUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-white font-bold text-xs"
                        >
                          View Page <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unindexed (Data)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationCoverageDashboard;
