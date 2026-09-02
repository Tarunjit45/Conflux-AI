import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  Globe, 
  TrendingUp, 
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Palette,
  Video,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const primaryServices = [
  {
    id: "ai-automation",
    title: "AI Automation",
    subtitle: "Automate repetitive enterprise processes using intelligent AI microservices and pipelines.",
    icon: Zap,
    image: "/images/ai-automation/ai-automation_1.jpg",
    points: ["Autonomous workflow pipelines", "Custom AI agent routing", "ERP & CRM system integrations"],
    diagram: "CRM → AI Agent → Automated Action → DB"
  },
  {
    id: "chatbot-development",
    title: "AI Agents & Chatbots",
    subtitle: "Deploy 24/7 intelligent conversational agents that qualify prospects and answer complex queries.",
    icon: MessageSquare,
    image: "/images/chatbot-development/chatbot-development_1.jpg",
    points: ["Context-aware AI embeddings", "Lead qualification & booking", "Live agent handoff"],
    diagram: "User → AI Chatbot → Lead Qualification → CRM"
  },
  {
    id: "workflow-automation",
    title: "Business Workflow Automation",
    subtitle: "Streamline multi-department operations with API webhooks, trigger events, and automated data sync.",
    icon: Cpu,
    image: "/images/ai-automation/ai-automation_1.jpg",
    points: ["Make.com & Zapier custom flows", "Database trigger automation", "Real-time alert notifications"],
    diagram: "Webhook Trigger → Data Parsing → Action"
  },
  {
    id: "digital-solutions",
    title: "AI-Powered Digital Solutions",
    subtitle: "Bespoke digital software systems and web portals integrated with generative AI capabilities.",
    icon: Layers,
    image: "/images/website-development/website-development_1.jpg",
    points: ["Custom AI app architecture", "Automated client portals", "High-security data processing"],
    diagram: "Client Portal → AI Engine → Analytics"
  }
];

const secondaryServices = [
  {
    id: "website-development",
    title: "Web Development",
    subtitle: "Ultra-fast, high-converting digital platforms engineered on React 18, Vite, and serverless edge cloud.",
    icon: Globe,
    points: ["Vite + Serverless architecture", "Sub-second loading", "Responsive design"]
  },
  {
    id: "seo-geo",
    title: "SEO & Search Optimization",
    subtitle: "Technical SEO, Schema.org JSON-LD data structures, and crawl optimization for traditional & AI search.",
    icon: TrendingUp,
    points: ["Schema.org JSON-LD graphing", "Technical crawl optimization", "Search visibility"]
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    subtitle: "Data-driven B2B lead generation campaigns, multi-channel growth strategies, and funnel optimization.",
    icon: Megaphone,
    points: ["Targeted lead funnels", "Conversion optimization", "Real-time analytics"]
  },
  {
    id: "social-media",
    title: "Social Media Management",
    subtitle: "Strategic audience engagement, content scheduling, and social channel growth management.",
    icon: Share2,
    points: ["Content strategy", "Community growth", "Platform management"]
  },
  {
    id: "graphic-design",
    title: "Graphic Design & Branding",
    subtitle: "High-impact brand identity, UI/UX interface design, and custom visual marketing assets.",
    icon: Palette,
    points: ["Brand identity & assets", "UI/UX design", "Marketing collateral"]
  },
  {
    id: "video-production",
    title: "Video Production & Editing",
    subtitle: "High-engagement short-form and long-form video content editing for social channels and ads.",
    icon: Video,
    points: ["Shorts & Reels editing", "Ad creative production", "Brand storytelling"]
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
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight text-slate-900">
              Platform Solutions
            </h2>
          </div>
          <p className="text-slate-600 text-sm md:text-base max-w-md font-normal leading-relaxed">
            Prioritizing autonomous AI engineering and business workflow automation, supported by complete digital growth services.
          </p>
        </div>

        {/* Primary Services Grid */}
        <div className="mb-20">
          <h3 className="text-xl font-bold font-orbitron text-slate-900 mb-8 border-l-4 border-blue-600 pl-3">
            Primary AI & Automation Solutions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {primaryServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Visual Image Header */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 border-b border-slate-100">
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
                    <h4 className="text-2xl font-bold font-orbitron text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h4>
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
                    to={`/solutions`} 
                    className="inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-700 pt-4 border-t border-slate-100"
                  >
                    <span>Explore Solution Architecture</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Secondary Services Section */}
        <div>
          <h3 className="text-xl font-bold font-orbitron text-slate-900 mb-8 border-l-4 border-blue-600 pl-3">
            Growth & Creative Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <service.icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h4>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">
                    {service.subtitle}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {service.points.map((pt, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/solutions"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default QuickServices;
