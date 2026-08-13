import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  MessageSquare, 
  Globe, 
  TrendingUp, 
  Megaphone,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const servicesList = [
  {
    id: "ai-automation",
    name: "AI Automation",
    tagline: "Autonomous Microservices & Process Pipelines",
    description: "Conflux AI builds custom autonomous microservices and intelligent AI pipelines that connect your CRMs, databases, and communication channels, streamlining manual operations.",
    image: "/images/ai-automation/ai-automation_1.jpg",
    icon: Zap,
    points: [
      "Custom Automated Workflow Pipelines",
      "CRM & ERP API Integrations",
      "Real-Time Data Parsing & Ingestion",
      "Automated Security & Error Alerts"
    ],
    diagram: "CRM → AI Pipeline → Automated Action → Database"
  },
  {
    id: "chatbot-development",
    name: "AI Agents & Chatbots",
    tagline: "24/7 Intelligent Conversational Agents",
    description: "We build context-aware AI chatbots trained on your company knowledge base that answer complex questions, qualify leads, and schedule sales meetings automatically.",
    image: "/images/chatbot-development/chatbot-development_1.jpg",
    icon: MessageSquare,
    points: [
      "Custom Knowledge Base Embeddings",
      "Automated B2B Lead Qualification",
      "Direct Calendar & CRM Sync",
      "Zero-Latency Web Chat Widget"
    ],
    diagram: "Customer → AI Chatbot → Qualification → Live Agent"
  },
  {
    id: "workflow-automation",
    name: "Business Workflow Automation",
    tagline: "Enterprise Trigger & System Integration",
    description: "Connect multi-platform operations using custom Make.com and Zapier webhooks, automated database triggers, and synchronized internal tools.",
    image: "/images/ai-automation/ai-automation_1.jpg",
    icon: Zap,
    points: [
      "Webhook & API Trigger Automation",
      "Multi-App Data Synchronization",
      "Operational Error Handling",
      "Automated Report Generation"
    ],
    diagram: "Webhook Trigger → Process Logic → Multi-Channel Action"
  },
  {
    id: "website-development",
    name: "Web Development (Growth & Creative)",
    tagline: "High-Speed React & Serverless Web Platforms",
    description: "We engineer custom React + Vite + TypeScript web applications designed for sub-second load speeds, flawless mobile responsiveness, and high conversion.",
    image: "/images/website-development/website-development_1.jpg",
    icon: Globe,
    points: [
      "Custom React 18 & Vite Frontend",
      "100/100 Core Web Vitals Optimization",
      "Responsive Mobile & Desktop UX",
      "Vercel Edge Cloud Deployment"
    ],
    diagram: "Design System → React → Serverless API → High Uptime"
  },
  {
    id: "seo-geo",
    name: "SEO & Search Optimization (Growth & Creative)",
    tagline: "Google Search & Schema Technical Optimization",
    description: "We optimize your digital presence for search engines using Schema.org JSON-LD structured data, technical taxonomy, and high-authority documentation.",
    image: "/images/seo-geo/seo-geo_1.jpg",
    icon: TrendingUp,
    points: [
      "Schema.org JSON-LD Infrastructure",
      "Robots.txt & Sitemap Optimization",
      "Core Web Vitals Technical Optimization",
      "Entity & Knowledge Graph Setup"
    ],
    diagram: "Search Query → Structured Data → Website → Lead"
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing & Creative Services",
    tagline: "Data-Driven B2B Acquisition & Video Production",
    description: "We provide end-to-end B2B client acquisition campaigns, high-converting video editing, social media management, and reputation management.",
    image: "/images/digital-marketing/digital-marketing_1.jpg",
    icon: Megaphone,
    points: [
      "B2B Targeted Client Acquisition",
      "Short & Long-Form Video Editing",
      "Social Media Management & Strategy",
      "Reputation & Feedback Management"
    ],
    diagram: "Campaign → Targeted Audience → Conversion → Analytics"
  }
];

const SolutionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter pt-28 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Return to Home
        </Link>
        <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
          Capabilities Overview
        </span>
        <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Our Service <span className="text-blue-600">Solutions</span>.
        </h1>
        <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
          High-performance AI automation, web engineering, and digital growth services engineered for technical dominance and measurable client acquisition.
        </p>
      </div>

      {/* Alternating Zig-Zag Services Showcase */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-24">
        {servicesList.map((service, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 md:p-12 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all"
            >
              {/* Left or Right Visual Image */}
              <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200 border border-slate-300/80 group shadow-md">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Text Information Column */}
              <div className={`lg:col-span-6 space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                    0{index + 1} — {service.tagline}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold font-orbitron text-slate-900">
                    {service.name}
                  </h2>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {service.description}
                </p>

                {/* Workflow Diagram */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-blue-700 tracking-wide">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-sans font-semibold">Execution Schematic</div>
                  {service.diagram}
                </div>

                {/* Key Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {service.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Link */}
                <div className="pt-4">
                  <Link
                    to={`/services/${service.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>View Full {service.name} Architecture</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Conversion CTA */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-24">
        <div className="text-center py-16 px-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Custom Project Consultation
            </div>
          </div>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">
            Need a Dedicated AI Integration?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base font-light">
            Our engineering team builds custom workflows tailored to your specific business infrastructure.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
          >
            <span>Consult With Our Technical Lead</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default SolutionsPage;
