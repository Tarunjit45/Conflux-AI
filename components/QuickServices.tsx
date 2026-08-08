import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  Globe, 
  TrendingUp, 
  Megaphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mainServices = [
  {
    id: "ai-automation",
    title: "AI Automation",
    subtitle: "Automate repetitive enterprise workflows using intelligent AI systems.",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    glow: "rgba(59, 130, 246, 0.15)",
    points: ["Workflow automation", "Custom AI agents", "ERP & CRM integrations"],
    diagram: "CRM → AI Agent → WhatsApp → Email → Database → Dashboard"
  },
  {
    id: "chatbot-development",
    title: "Chatbot Development",
    subtitle: "Deploy 24/7 intelligent conversational agents that qualify prospects.",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600",
    glow: "rgba(168, 85, 247, 0.15)",
    points: ["Context-aware LLMs", "Lead qualification", "Live agent handoff"],
    diagram: "Customer → AI Chatbot → Intent Qualification → Live Agent"
  },
  {
    id: "website-development",
    title: "Website Development",
    subtitle: "Build ultra-fast, high-converting digital product interfaces and platforms.",
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6, 182, 212, 0.15)",
    points: ["Vite + Serverless architecture", "Sub-second loading", "Responsive design"],
    diagram: "Design System → React Architecture → Serverless API → 100% Uptime"
  },
  {
    id: "seo-geo",
    title: "SEO & GEO",
    subtitle: "Optimize for traditional Google search and Gemini/ChatGPT AI Overviews.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(16, 185, 129, 0.15)",
    points: ["Generative Engine Optimization", "Entity Schema graphing", "AUTHORITY indexing"],
    diagram: "Search Query → AI Overview Synthesizer → Website → Lead"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    subtitle: "Data-driven growth engineering and multi-channel customer acquisition.",
    icon: Megaphone,
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245, 158, 11, 0.15)",
    points: ["Targeted lead funnels", "Conversion optimization", "Real-time analytics"],
    diagram: "Campaign → Audience Targeting → Conversion Funnel → Analytics"
  }
];

const QuickServices: React.FC = () => {
  return (
    <section id="solutions" className="py-20 bg-[#07090e] text-white relative overflow-hidden font-inter border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
              Agency Service Suite
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-md font-light leading-relaxed">
            High-performance AI automation, web engineering, and search optimization designed to turn visitors into revenue.
          </p>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              style={{ boxShadow: `0 0 40px ${service.glow}` }}
            >
              <div>
                {/* Icon Header */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} p-0.5 mb-6 shadow-lg`}>
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold font-orbitron text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {service.subtitle}
                </p>

                {/* Animated Visual Diagram Schematic */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-6 font-mono text-[11px] text-blue-400 tracking-wide leading-tight">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-sans font-semibold">Workflow Schematic</div>
                  {service.diagram}
                </div>

                {/* Key Points */}
                <ul className="space-y-2.5 mb-8">
                  {service.points.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <Link 
                to={`/services/${service.id}`} 
                className="inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-400 group-hover:text-white transition-colors pt-4 border-t border-slate-800/60"
              >
                <span>Explore Capability</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickServices;
