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
    image: "/images/ai-automation/ai-automation_1.jpg",
    points: ["Workflow automation", "Custom AI agents", "ERP & CRM integrations"],
    diagram: "CRM → AI Agent → WhatsApp → Email → Database"
  },
  {
    id: "chatbot-development",
    title: "Chatbot Development",
    subtitle: "Deploy 24/7 intelligent conversational agents that qualify prospects.",
    icon: MessageSquare,
    image: "/images/chatbot-development/chatbot-development_1.jpg",
    points: ["Context-aware LLMs", "Lead qualification", "Live agent handoff"],
    diagram: "Customer → AI Chatbot → Qualification → Live Agent"
  },
  {
    id: "website-development",
    title: "Website Development",
    subtitle: "Build ultra-fast, high-converting digital product interfaces and platforms.",
    icon: Globe,
    image: "/images/website-development/website-development_1.jpg",
    points: ["Vite + Serverless architecture", "Sub-second loading", "Responsive design"],
    diagram: "Design System → React → Serverless API → 100% Uptime"
  },
  {
    id: "seo-geo",
    title: "SEO & GEO",
    subtitle: "Optimize for traditional Google search and Gemini/ChatGPT AI Overviews.",
    icon: TrendingUp,
    image: "/images/seo-geo/seo-geo_1.jpg",
    points: ["Generative Engine Optimization", "Entity Schema graphing", "AUTHORITY indexing"],
    diagram: "Search Query → AI Overview → Website → Lead"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    subtitle: "Data-driven growth engineering and multi-channel customer acquisition.",
    icon: Megaphone,
    image: "/images/digital-marketing/digital-marketing_1.jpg",
    points: ["Targeted lead funnels", "Conversion optimization", "Real-time analytics"],
    diagram: "Campaign → Audience Targeting → Conversion → Analytics"
  }
];

const QuickServices: React.FC = () => {
  return (
    <section id="solutions" className="py-20 bg-slate-50 text-slate-900 font-inter border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              Core Service Pillars
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight text-slate-900">
              Agency Capabilities
            </h2>
          </div>
          <p className="text-slate-600 text-sm md:text-base max-w-md font-normal leading-relaxed">
            Visual representations of our high-performance AI automation, web engineering, and digital growth services.
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
              className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Visual Image Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-orbitron text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {service.subtitle}
                  </p>

                  {/* Visual Diagram */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 font-mono text-[11px] text-blue-700 tracking-wide">
                    {service.diagram}
                  </div>

                  {/* Key Points */}
                  <ul className="space-y-2 mb-6">
                    {service.points.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Link */}
                <Link 
                  to={`/services/${service.id}`} 
                  className="inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-700 pt-4 border-t border-slate-100"
                >
                  <span>Explore Capability & Visual Gallery</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickServices;
