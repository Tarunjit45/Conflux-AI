import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllLocations } from '../../data/locationsData';
import { LocationItem, LocationStatus } from '../../types/location';
import { MapPin, Filter, Search, ShieldCheck, ExternalLink, BarChart2, Layers, CheckCircle2, AlertCircle, ArrowLeft, Eye, MessageSquare, UserCheck } from 'lucide-react';
import { getLocationEventStats, getAnalyticsSummaryByLocation } from '../../lib/locationAnalytics';
import { LocalBusinessLead } from '../../types/article';

const LocationCoverageDashboard: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [eventStats, setEventStats] = useState<Record<string, Record<string, number>>>({});
  const [locationSummary, setLocationSummary] = useState<Record<string, { views: number; enquiries: number; clients: number }>>({});
  const [crmLeads, setCrmLeads] = useState<LocalBusinessLead[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Location Knowledge & Performance Dashboard | Conflux AI Admin';
    setLocations(getAllLocations());
    setEventStats(getLocationEventStats());
    setLocationSummary(getAnalyticsSummaryByLocation());

    const crmRaw = localStorage.getItem('conflux_local_crm_leads');
    if (crmRaw) {
      try { setCrmLeads(JSON.parse(crmRaw)); } catch (e) {}
    }
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
  const totalViews = Object.values(locationSummary).reduce((acc, curr) => acc + curr.views, 0);
  const totalEnquiries = Object.values(locationSummary).reduce((acc, curr) => acc + curr.enquiries, 0);
  const totalClients = crmLeads.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 pb-20 font-inter">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Layers size={14} /> Local Business Knowledge & Performance Intelligence
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">
              West Bengal <span className="text-blue-500">Location Performance Matrix</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-3xl">
              Tracks which locations, industries, and business problems are receiving manual content, traffic (page views), digital enquiries (WhatsApp/contact clicks), and client conversions.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/admin" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg shadow-blue-500/20">
              Open CMS Editor →
            </Link>
            <Link to="/locations/west-bengal" className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2">
              <ArrowLeft size={14} /> Public Hub
            </Link>
          </div>
        </div>

        {/* Executive Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Knowledge Locations</span>
            <span className="text-3xl font-black text-white">{locations.length}</span>
            <span className="text-[11px] text-blue-400 font-bold block mt-1">{publishedCount} Published Indexable Hubs</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Eye size={14} className="text-blue-400" /> Content Traffic (Views)
            </span>
            <span className="text-3xl font-black text-blue-400">{totalViews}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Real Reader Impressions</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-amber-400" /> Digital Enquiries
            </span>
            <span className="text-3xl font-black text-amber-400">{totalEnquiries}</span>
            <span className="text-[11px] text-slate-400 block mt-1">WhatsApp & Consultation Clicks</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <UserCheck size={14} className="text-emerald-400" /> Local Client Leads
            </span>
            <span className="text-3xl font-black text-emerald-400">{totalClients}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Tracked Business Relationships</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search town, locality, block..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED (Indexable)</option>
              <option value="DATA_ONLY">DATA_ONLY (Internal)</option>
              <option value="DRAFT">DRAFT</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
            Showing {filteredLocations.length} of {locations.length} location nodes
          </span>
        </div>

        {/* Coverage & Performance Data Table */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Locality Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">District / Subdivision</th>
                <th className="p-4">Traffic (Views)</th>
                <th className="p-4">Enquiries</th>
                <th className="p-4">Client Leads</th>
                <th className="p-4">Primary Industry</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLocations.map((item) => {
                const isPublished = item.status === 'PUBLISHED';
                const summary = locationSummary[item.id] || locationSummary[item.slug] || { views: 0, enquiries: 0, clients: 0 };
                const locLeads = crmLeads.filter(l => l.locationSlug === item.id || l.locationSlug === item.slug || l.locationName.includes(item.name));

                let publicUrl = '';
                if (item.type === 'state') publicUrl = '/locations/west-bengal';
                else if (item.type === 'district') publicUrl = `/locations/west-bengal/${item.slug}`;
                else if (item.districtSlug) publicUrl = `/locations/west-bengal/${item.districtSlug}/${item.slug}`;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className={isPublished ? "text-blue-400" : "text-slate-500"} />
                        <span>{item.displayName || item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 capitalize">{item.type.replace('_', ' ')}</td>
                    <td className="p-4 text-slate-400">
                      <div>{item.districtSlug || item.name}</div>
                      {item.subdivisionName && <div className="text-[10px] text-slate-500">{item.subdivisionName}</div>}
                    </td>
                    <td className="p-4 font-bold text-blue-400">
                      {summary.views}
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {summary.enquiries}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {locLeads.length || summary.clients}
                    </td>
                    <td className="p-4 text-slate-300">
                      {item.majorIndustries?.slice(0, 2).join(', ') || 'Retail & Trade'}
                    </td>
                    <td className="p-4 text-right">
                      {isPublished ? (
                        <Link 
                          to={publicUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-white font-bold text-xs"
                        >
                          Public Hub <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Data Node</span>
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
