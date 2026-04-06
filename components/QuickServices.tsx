import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  MessageSquare, 
  Zap, 
  Megaphone, 
  Share2, 
  Video, 
  Palette, 
  TrendingUp, 
  Star, 
  Monitor, 
  Layers,
  ArrowRight
} from 'lucide-react';

const services = [
  { icon: Globe, name: "Website Building", color: "#3b82f6" },
  { icon: MessageSquare, name: "Chatbot Integration", color: "#8b5cf6" },
  { icon: Zap, name: "AI Automation", color: "#0000ff" },
  { icon: Megaphone, name: "Social Media Marketing", color: "#ec4899" },
  { icon: Share2, name: "Social Media Management", color: "#f59e0b" },
  { icon: Video, name: "Video Editing", color: "#ef4444" },
  { icon: Palette, name: "Graphic Design", color: "#10b981" },
  { icon: TrendingUp, name: "SEO Optimization", color: "#6366f1" },
  { icon: Star, name: "Organic Google Reviews Increasing", color: "#fbbf24" },
  { icon: Monitor, name: "Thumbnail Design", color: "#14b8a6" },
  { icon: Layers, name: "All Online Services Provide", color: "#0f172a" },
];

const QuickServices: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Our <span className="text-blue-600">Core Services</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium">Everything you need to scale your business online.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Scroll to explore <ArrowRight size={14} className="animate-pulse" />
          </div>
        </div>

        {/* Desktop Grid / Mobile Scroll */}
        <div className="flex overflow-x-auto pb-6 md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 no-scrollbar scroll-smooth">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[200px] md:w-auto p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20 transition-all duration-300 group cursor-default"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                style={{ backgroundColor: `${service.color}10`, color: service.color }}
              >
                <service.icon size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                {service.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

export default QuickServices;
