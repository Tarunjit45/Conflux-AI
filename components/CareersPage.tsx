import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Briefcase, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Careers at Conflux AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-orbitron tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
            Build the Future of Autonomous AI Systems
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            We are a high-performance team of AI architects, full-stack engineers, and growth strategists building next-generation enterprise automation.
          </p>
        </motion.div>

        {/* Culture & Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xl font-bold font-orbitron text-white mb-2">Autonomous First</h3>
            <p className="text-slate-400 text-sm">We build self-healing, intelligent microservices and workflows that execute 24/7 without manual intervention.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xl font-bold font-orbitron text-white mb-2">High Impact</h3>
            <p className="text-slate-400 text-sm">Every line of code directly drives measurable growth, lead throughput, and efficiency for enterprise clients.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xl font-bold font-orbitron text-white mb-2">Continuous Innovation</h3>
            <p className="text-slate-400 text-sm">We constantly experiment with state-of-the-art LLMs, agentic tools, vector search, and web architectures.</p>
          </div>
        </div>

        {/* Current Openings Policy */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/20 text-center relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <Briefcase className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-orbitron text-white mb-3">Current Opportunities</h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-6">
            We currently don't have open full-time positions, but we're always interested in meeting exceptional AI developers, growth engineers, and technical creators.
          </p>
          <a 
            href="mailto:confluxdotai@gmail.com?subject=Spontaneous Application — Conflux AI Talent Pool"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-500/25"
          >
            <Mail className="w-4 h-4" />
            Send Spontaneous Portfolio / Resume
          </a>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
            ← Return to Conflux AI Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
