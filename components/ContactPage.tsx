import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import ContactForm from './ContactForm.tsx';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-orbitron tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
            Start Your Next AI Transformation Project
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Discuss your requirements with our technical lead. We provide clear proposals, architecture blueprints, and rapid deployment schedules.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Direct Contact Options */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <h2 className="text-xl font-bold font-orbitron text-white">Direct Communication Channels</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Official Email</div>
                  <a href="mailto:confluxdotai@gmail.com" className="text-white font-medium hover:text-blue-400 transition-colors">
                    confluxdotai@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">WhatsApp Qualification</div>
                  <a href="https://wa.me/918972517557" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-emerald-400 transition-colors">
                    +91 89725 17557
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Headquarters</div>
                  <div className="text-white font-medium">Kolkata, West Bengal, India</div>
                </div>
              </div>
            </div>

            {/* SLA & Security Card */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Response Expectation</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                All submitted enquiries are stored immediately in our secure database and dispatched to our technical team. You will receive an initial response within 24 hours.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-300 font-medium">Strict NDA & Lead Data Protection</span>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative">
              <h2 className="text-2xl font-bold font-orbitron text-white mb-6">Send an Enquiry</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
