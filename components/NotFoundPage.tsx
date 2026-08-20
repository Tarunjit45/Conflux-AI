import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Search, MapPin, BookOpen } from 'lucide-react';
import { applySeoMetadata } from '../lib/seoMetadata';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    applySeoMetadata({
      title: '404 - Page Not Found | Conflux AI',
      description: 'The requested page or insight could not be found. Explore our West Bengal knowledge base, services, and local guides.',
      robots: 'noindex, follow'
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-32">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Compass size={32} />
        </div>

        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-100 mb-4 inline-block">
          Error 404
        </span>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Page or Insight Not Found
        </h1>

        <p className="text-slate-600 font-medium mb-8 leading-relaxed max-w-lg mx-auto text-sm md:text-base">
          The link you followed may be broken, outdated, or moved. Explore our active West Bengal local intelligence directory and technical services below.
        </p>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          <Link 
            to="/blog" 
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
          >
            <BookOpen size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block">Knowledge Base</span>
              <span className="text-[11px] text-slate-500">Explore 57+ West Bengal local guides & blueprints</span>
            </div>
          </Link>

          <Link 
            to="/locations/west-bengal" 
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex items-start gap-3 group"
          >
            <MapPin size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 block">West Bengal Districts</span>
              <span className="text-[11px] text-slate-500">View coverage across all 23 districts</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20"
          >
            <ArrowLeft size={14} /> Return to Home
          </Link>

          <Link
            to="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Browse All Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
