import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Thank You | Conflux AI';
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute('content', 'noindex, follow');

    return () => {
      // Restore default robots meta when navigating away
      const rEl = document.querySelector('meta[name="robots"]');
      if (rEl) rEl.setAttribute('content', 'index, follow');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pt-36 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-xl shadow-blue-500/10">
          <CheckCircle size={40} />
        </div>

        <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-2">
          <Sparkles size={12} /> Enquiry Transmitted
        </span>

        <h1 className="font-inter text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Thank You for Reaching Out to <span className="text-blue-600">Conflux AI.</span>
        </h1>

        <p className="text-lg md:text-xl font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Your project specifications have been logged in our engineering queue. Our technical lead will review your details and respond within **24 business hours**.
        </p>

        {/* Action Options */}
        <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-50 border border-slate-200 mb-16 text-left max-w-3xl mx-auto">
          <h3 className="font-black text-slate-900 text-xl mb-6">Need Immediate Assistance?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a 
              href="https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20just%20submitted%20a%20project%20request%20on%20your%20website."
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 transition-all flex items-center gap-4 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">Instant WhatsApp Support</h4>
                <p className="text-xs text-slate-500 font-medium">Connect directly with engineering</p>
              </div>
            </a>

            <Link 
              to="/blog"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 transition-all flex items-center gap-4 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">Explore Technical Insights</h4>
                <p className="text-xs text-slate-500 font-medium">Read our daily AI research blog</p>
              </div>
            </Link>
          </div>
        </div>

        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          Return to Homepage <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;
