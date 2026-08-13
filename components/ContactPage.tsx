import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm.tsx';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Back Link */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest hover:gap-3 transition-all">
            <ArrowLeft size={14} /> Return to Home
          </Link>
        </div>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Direct Enquiry Channel
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-orbitron tracking-tight text-slate-900 mb-4">
            Start Your Next <span className="text-blue-600">AI Transformation Project</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Discuss your requirements directly with our technical lead. We provide custom architecture blueprints, clear proposals, and rapid deployment schedules within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Direct Channels & SLA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-md space-y-6">
              <h2 className="text-xl font-bold font-orbitron text-slate-900">Direct Communication</h2>
              
              {/* Official Email */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Official Email</div>
                  <a href="mailto:confluxdotai@gmail.com" className="text-slate-900 font-bold text-sm hover:text-blue-600 transition-colors">
                    confluxdotai@gmail.com
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">WhatsApp Direct</div>
                  <a href="https://wa.me/918972517557" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-bold text-sm hover:text-emerald-600 transition-colors">
                    +91 89725 17557
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Base Location</div>
                  <div className="text-slate-900 font-bold text-sm">Kolkata, West Bengal, India (Remote-First)</div>
                </div>
              </div>
            </div>

            {/* SLA Card */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Response Expectation</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                All submitted enquiries are stored immediately in our secure database and dispatched to our technical team. You will receive an initial response within 24 hours.
              </p>

              <div className="pt-2 flex items-center gap-3 border-t border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-slate-700 font-medium">Strict NDA & Lead Data Protection</span>
              </div>
            </div>
          </div>

          {/* Right Side: High-Contrast Lead Intake Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/60 relative">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
