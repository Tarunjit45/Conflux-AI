import React from 'react';
import { MapPin, Users, Target, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompanyGlance: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="p-8 md:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden font-inter">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Entity Information
            </div>
            <h3 className="text-2xl md:text-3xl font-black font-orbitron tracking-tight text-white">
              Conflux AI <span className="text-blue-500">at a Glance</span>
            </h3>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            Learn More About Our Team &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Platform Type & Focus</div>
              <div className="text-white font-bold text-sm mt-0.5">Local Visibility + Trust Platform</div>
              <div className="text-xs text-slate-400 font-medium">Discoverable, Trusted & Contactable</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Base Location</div>
              <div className="text-white font-bold text-sm mt-0.5">Kolkata, West Bengal, India</div>
              <div className="text-xs text-slate-400 font-medium">Local Visibility + Trust Platform</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Founders</div>
              <div className="text-white font-bold text-sm mt-0.5">Tarunjit Biswas & Shouvik Majumdar</div>
              <div className="text-xs text-slate-400 font-medium">CEO/CTO & CFO/CMO</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Official Domain & Contact</div>
              <a href="https://confluxai.in/" className="text-blue-400 hover:text-blue-300 font-bold text-sm mt-0.5 block">confluxai.in</a>
              <a href="mailto:confluxdotai@gmail.com" className="text-xs text-slate-400 hover:text-slate-300 font-medium block">confluxdotai@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyGlance;
