import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const heroShowcaseImages = [
  {
    title: "Enterprise AI Workflows",
    category: "AI Automation",
    src: "/images/ai-automation/ai-automation_1.jpg",
    desc: "Autonomous multi-system data processing & lead routing"
  },
  {
    title: "Conversational Intelligence",
    category: "AI Chatbots",
    src: "/images/chatbot-development/chatbot-development_1.jpg",
    desc: "24/7 intelligent prospect qualification & CRM sync"
  },
  {
    title: "High-Performance Web Architecture",
    category: "Website Engineering",
    src: "/images/website-development/website-development_1.jpg",
    desc: "Sub-second loading, React & Serverless infrastructure"
  },
  {
    title: "Generative Engine Optimization",
    category: "SEO & GEO",
    src: "/images/seo-geo/seo-geo_1.jpg",
    desc: "Optimized for Google SGE, ChatGPT & Perplexity citations"
  },
  {
    title: "Data-Driven Acquisition",
    category: "Digital Marketing",
    src: "/images/digital-marketing/digital-marketing_1.jpg",
    desc: "Targeted lead funnels & automated analytics"
  }
];

const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative min-h-[90vh] bg-white text-slate-900 pt-28 pb-20 px-4 sm:px-6 lg:px-12 flex items-center overflow-hidden font-inter border-b border-slate-100">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-slate-50/70 -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Clear Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Premier AI Automation & Web Agency
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron text-slate-900 tracking-tight leading-[1.1]">
            AI Automation & <span className="text-blue-600">Digital Solutions</span> Agency
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Conflux AI builds AI-powered systems, business automation workflows, digital experiences, and growth solutions that help businesses operate and scale smarter.
          </p>

          {/* Quick Key Benefits */}
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              "Autonomous AI Workflows",
              "24/7 Prospect Qualification",
              "Sub-Second Fast Websites",
              "Google SGE & GEO Optimized"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Dual Primary CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              to="/work"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm tracking-wide transition-all border border-slate-200"
            >
              Explore Our Work
            </Link>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-3 pt-4 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Production Lead Security & 100% Uptime Architecture</span>
          </div>
        </motion.div>

        {/* Right Column: Visual Showcase Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6"
        >
          <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-4">
            
            {/* Main Visual Image Preview */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200">
              <img 
                src={heroShowcaseImages[activeTab].src} 
                alt={heroShowcaseImages[activeTab].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                  {heroShowcaseImages[activeTab].category}
                </span>
                <h3 className="text-xl font-bold font-orbitron">
                  {heroShowcaseImages[activeTab].title}
                </h3>
                <p className="text-slate-300 text-xs mt-1">
                  {heroShowcaseImages[activeTab].desc}
                </p>
              </div>
            </div>

            {/* Interactive Capability Selector Tabs */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {heroShowcaseImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    activeTab === idx 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{img.category}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
