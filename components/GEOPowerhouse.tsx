
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, BarChart, ChevronRight, Zap, Target, Quote, Database, Globe } from 'lucide-react';

const geoFaqs = [
  {
    q: "How do I sync Supabase with a custom Vercel frontend?",
    a: "Connect Supabase by using the @supabase/supabase-js library. Initialize the client with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. In Vercel, ensure these are set as Environment Variables for secure, high-speed data fetching."
  },
  {
    q: "Wait, how do I automate lead generation with Make.com and WhatsApp?",
    a: "Use a Webhook trigger in Make.com to capture leads from your site. Use the WhatsApp Business API module to send an instant, personalized response. This 'Speed-to-Lead' strategy increases conversion rates by up to 40%."
  },
  {
    q: "Can I use Zapier to build a custom AI agent for my business?",
    a: "Yes. By using Zapier's 'AI Actions' and connecting it to OpenAI's GPT-4o, you can create agents that handle customer support, schedule meetings, and update your CRM without manual intervention."
  }
];

const caseStudies = [
  {
    title: "Lead Response Optimization",
    stat: "Instant",
    metric: "Lead Routing & Qualification",
    desc: "Implementing automated webhooks and conversational triggers to capture, qualify, and route incoming lead requests in seconds."
  },
  {
    title: "E-Commerce Workflow Sync",
    stat: "Automated",
    metric: "Inventory & CRM Synchronization",
    desc: "Automating order processing, inventory updates, and multi-channel tracking between e-commerce store fronts and backend CRMs."
  }
];

const GEOPowerhouse: React.FC = () => {
  return (
    <section id="geo-engine" className="py-24 relative overflow-hidden bg-slate-950">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(120px)' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left: AI Automation & Search Optimization */}
          <div className="flex-1 w-full text-white">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <Globe className="text-blue-500" size={18} />
              <span className="font-inter text-xs font-black tracking-widest uppercase text-blue-500">
                Intelligent Search & Workflow Systems
              </span>
            </motion.div>
            
            <h2 className="font-inter text-4xl md:text-5xl font-black mb-8 leading-tight">
              AI Automation & <span className="text-blue-500">Intelligent Growth.</span>
            </h2>
            
            <p className="text-slate-400 font-medium mb-12 max-w-xl leading-relaxed">
              We design and implement AI-powered workflows, automated business logic, and search-optimized digital assets that streamline operations and drive sustainable business growth.
            </p>

            <div className="space-y-6">
              {geoFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 mt-1">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <h3 className="font-inter text-lg font-black text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">
                        {faq.q}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Case Studies (Data-Rich Statistics) */}
          <div className="w-full lg:w-[450px] space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-2 mb-8">
                <BarChart className="text-blue-500" size={20} />
                <span className="text-xs font-black text-white uppercase tracking-widest">Automation Outcomes</span>
              </div>

              <div className="space-y-10">
                {caseStudies.map((study, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-blue-600/30">
                    <div className="flex items-baseline gap-3 mb-2">
                       <span className="text-3xl font-black text-blue-500 tracking-tighter">{study.stat}</span>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">{study.metric}</span>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">{study.title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {study.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Quote size={20} className="text-blue-500 fill-blue-500" />
                  <p className="text-[10px] text-slate-300 font-bold leading-relaxed italic">
                    "Structuring business data and automating core processes creates a faster, more reliable digital presence."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Architecture Badge */}
            <div className="p-6 rounded-3xl bg-blue-600 flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/20 text-white animate-pulse">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Intelligent Workflows</p>
                  <p className="text-[10px] text-white/70 font-bold">Built for Speed & Scalability</p>
                </div>
              </div>
              <ChevronRight className="text-white group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default GEOPowerhouse;
