
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reviews: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto font-inter">
      <div className="text-center py-16 px-6 md:px-12 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Verified Client Engagements
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
        >
          BUILDING MEASURABLE <span className="text-blue-600">AI SOLUTIONS</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Conflux AI partners directly with business founders and enterprise teams to engineer high-throughput automation pipelines, sub-second web platforms, and intelligent agent workflows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20"
          >
            <span>Partner With Conflux AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/work"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all border border-slate-200"
          >
            <span>View Technical Work</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Reviews;