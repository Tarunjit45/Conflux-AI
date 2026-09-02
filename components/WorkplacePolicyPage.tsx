// Conflux Platform — Workplace Policy & Operating Principles

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Target, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  HeartHandshake, 
  TrendingUp, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Shield, 
  Mail,
  Building2
} from 'lucide-react';

const WorkplacePolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const principles = [
    {
      icon: <Target className="text-blue-600" size={24} />,
      title: "End-to-End Ownership",
      subtitle: "Think like a founder, own the outcome",
      description: "We expect contributors and collaborators to take full responsibility for their work from initial scoping to production delivery. You are empowered to make decisions, solve ambiguity, and see initiatives through without requiring micromanagement."
    },
    {
      icon: <MessageSquare className="text-emerald-600" size={24} />,
      title: "Asynchronous & Transparent Communication",
      subtitle: "Clarity, documentation, proactive alignment",
      description: "As a remote-first organization, high-fidelity written communication is our default. We document technical decisions, share updates openly, and flag blockers or timeline risks early so the team can adapt without friction."
    },
    {
      icon: <Users className="text-indigo-600" size={24} />,
      title: "High-Trust Collaboration",
      subtitle: "Ego-free teamwork and constructive peer review",
      description: "We foster an open environment where code reviews, design critiques, and technical debates are driven by objective quality rather than hierarchy. We celebrate shared wins and assist teammates whenever challenges arise."
    },
    {
      icon: <ShieldCheck className="text-purple-600" size={24} />,
      title: "Rigorous Accountability",
      subtitle: "Reliability in commitments and root-cause learning",
      description: "We stand behind what we build. When systems fail or deadlines shift, we conduct blameless post-mortems, identify systemic root causes, and implement automated guardrails to prevent repeat issues."
    },
    {
      icon: <GraduationCap className="text-amber-600" size={24} />,
      title: "Continuous Learning & Mastery",
      subtitle: "Deep curiosity in a rapidly evolving AI ecosystem",
      description: "The AI search, entity optimization, and software development landscape shifts continuously. We encourage continuous skill refinement, exploration of state-of-the-art tools, and sharing newly discovered best practices."
    },
    {
      icon: <HeartHandshake className="text-rose-600" size={24} />,
      title: "Respectful & Ethical Conduct",
      subtitle: "Integrity, inclusivity, and zero tolerance for harassment",
      description: "We treat every colleague, partner, client, and community member with dignity and fairness. We enforce zero tolerance for discrimination, harassment, dishonesty, or any behavior that compromises team psychological safety or platform trust."
    },
    {
      icon: <TrendingUp className="text-cyan-600" size={24} />,
      title: "Results & Client Impact Over Hours",
      subtitle: "Outcomes that matter, not performative presence",
      description: "We evaluate contributions by measurable impact—shipping reliable features, verifying local business claims accurately, and accelerating customer value—rather than rigid desk hours or artificial activity metrics."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      <div className="pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={14} /> Return to Home
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
              <Building2 size={14} /> Workplace Policy &amp; Operating Standards
            </span>
            <h1 className="font-orbitron text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Workplace Policy &amp; <span className="text-blue-600">Operating Principles</span>
            </h1>
            <p className="text-slate-600 font-normal text-base sm:text-lg leading-relaxed">
              How we work, collaborate, and maintain professional standards as a remote-first, flexible team at Conflux AI.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 italic text-slate-600 text-xs font-semibold shrink-0">
            <Sparkles size={18} className="text-blue-600 shrink-0" />
            <span>"Autonomy, Accountability, &amp; Respect"</span>
          </div>
        </div>

        {/* Operating Model Summary Box */}
        <div className="mb-20 p-8 rounded-3xl bg-blue-50/60 border border-blue-100/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
            <Globe size={16} className="text-blue-600 shrink-0" /> Remote-First &amp; Flexible Workplace Philosophy
          </div>
          <p className="text-slate-800 text-base md:text-lg font-medium leading-relaxed">
            Conflux AI operates as a remote-first, flexible organization based in Kolkata, West Bengal. We believe exceptional engineers, growth strategists, and creators produce their best work when given trust, autonomy, and clear goals rather than rigid physical office mandates.
          </p>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We collaborate across flexible schedules with asynchronous communication at our core, prioritizing deep work, high craft standards, and reliable outcomes for local business visibility.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="mb-24">
          <div className="mb-10">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 mb-2">
              Our Core Expectations &amp; Values
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              These seven principles guide how we work together, solve difficult engineering problems, and uphold our commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {item.subtitle}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workplace Practices & Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-slate-900">Flexibility &amp; Time Management</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              We respect individual working styles and time zones. While we do not impose fixed punch-in hours, team members are expected to maintain availability for critical milestone syncs, respond to messages within reasonable working windows, and coordinate proactively with project leads.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Async-first workflow with structured documentation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Advance notice for unavailability or planned downtime.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Prompt communication during live production incidents.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-slate-900">Security &amp; Data Integrity</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Protecting business client data, proprietary verification models, and infrastructure access is a non-negotiable responsibility for all contributors and engineering collaborators.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Strict credential hygiene and multi-factor authentication.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero sharing of private client records or database keys.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Adherence to audited data validation and verification rules.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Team Structure & Transparency Disclosure */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden mb-20">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">
              Team Structure &amp; Transparency
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
              Lean, High-Leverage Organization
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Conflux AI is a focused, agile organization founded by Tarunjit Biswas (CEO &amp; CTO) and Shouvik Majumdar (CFO &amp; CMO) in Kolkata, working alongside specialized engineers, researchers, and technical collaborators. We deliberately maintain a lean operating structure to ensure rapid decision-making, direct communication, and uncompromised execution quality.
            </p>
          </div>
        </div>

        {/* Inquiries / Questions */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-orbitron text-lg font-bold text-slate-900">Questions Regarding Our Workplace Policy?</h4>
            <p className="text-slate-600 text-xs sm:text-sm">
              Reach out to the Conflux AI leadership team for policy clarifications or collaboration inquiries.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <a 
              href="mailto:confluxai45@gmail.com?subject=Workplace Policy Inquiry — Conflux AI"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
            >
              <Mail size={16} /> Email Leadership
            </a>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Learn About Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkplacePolicyPage;
