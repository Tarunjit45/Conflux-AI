import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, User, Building2, Briefcase, CheckCircle2, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ContactForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    goal: '',
    message: '',
    website_url_hp: '' // Anti-spam honeypot
  });
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;

    setStatus('processing');
    setErrorMessage(null);

    const urlParams = new URLSearchParams(window.location.search);
    const leadPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      business: formData.company,
      goal: formData.goal,
      service: formData.goal,
      message: formData.message,
      source: document.referrer || 'Direct Website',
      landing_page: window.location.pathname,
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      website_url_hp: formData.website_url_hp
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setStatus('success');
        navigate('/thank-you');
        return;
      } else {
        throw new Error(resData.error || 'Server error processing request');
      }
    } catch (apiErr) {
      console.warn('Server API endpoint notice, trying client fallback:', apiErr);
      try {
        const { error: dbErr } = await supabase
          .from('leads')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              goal: formData.goal,
              message: formData.message,
              created_at: new Date().toISOString(),
            }
          ]);

        if (!dbErr) {
          setStatus('success');
          navigate('/thank-you');
          return;
        }
      } catch (dbErr) {
        console.warn('Supabase fallback notice:', dbErr);
      }

      setStatus('error');
      setErrorMessage('We could not transmit your project enquiry. Please try again or chat with our team directly on WhatsApp.');
    }
  };

  const serviceOptions = [
    { value: 'ai-automation', label: 'AI Automation & Microservices' },
    { value: 'chatbot-development', label: 'Custom AI Chatbot Development' },
    { value: 'website-development', label: 'High-Performance Web Development' },
    { value: 'seo-geo', label: 'SEO & Generative Engine Optimization (GEO)' },
    { value: 'digital-marketing', label: 'Digital Marketing & B2B Acquisition' },
  ];

  if (status === 'success') {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-8 rounded-3xl bg-white border border-slate-200 shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="font-orbitron text-2xl md:text-3xl font-black mb-3 text-slate-900">Enquiry Transmitted!</h3>
          <p className="text-slate-600 text-base mb-6 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-slate-900">{formData.name}</strong>. Our engineering team has received your project details and will reach out within <strong className="text-blue-600">24 hours</strong>.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
            <Mail size={14} />
            <span>confluxdotai@gmail.com</span>
          </div>
          <div className="mt-8">
            <button
              onClick={() => { setStatus('idle'); setFormData({ name: '', email: '', phone: '', company: '', goal: '', message: '', website_url_hp: '' }); }}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
            >
              Send Another Enquiry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-inter">
      {/* High-Contrast Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Mail className="w-3.5 h-3.5" />
          Direct Inquiry Channel
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-orbitron text-slate-900 tracking-tight mb-3">
          Start Your AI Project — <span className="text-blue-600">Let's Grow Together</span>
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto mb-4 leading-relaxed font-normal">
          Tell us about your business and goals. We deliver custom architecture proposals within 24 hours.
        </p>

        {/* High Contrast Official Email Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-300 transition-colors">
          <Mail className="w-4 h-4 text-blue-600" />
          <a 
            href="mailto:confluxdotai@gmail.com" 
            className="text-xs font-bold tracking-wide text-slate-800 hover:text-blue-600 transition-colors"
          >
            confluxdotai@gmail.com
          </a>
        </div>
      </div>

      {/* High-Contrast Form Container */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden"
      >
        {/* Top Window Bar */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Conflux AI Enquiry Portal
          </span>
        </div>

        <div className="p-6 md:p-10 space-y-6">
          {/* Anti-Spam Honeypot */}
          <input
            type="text"
            name="website_url_hp"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            value={formData.website_url_hp}
            onChange={(e) => setFormData({ ...formData, website_url_hp: e.target.value })}
          />

          {/* Error Banner */}
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage || 'Form transmission failed. Please try again.'}</span>
              </div>
              <a
                href="https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20had%20trouble%20submitting%20a%20request%20on%20your%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
              >
                Chat on WhatsApp
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" /> Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Company */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Company / Business *
              </label>
              <input
                type="text"
                required
                placeholder="Company Name"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Service Requirement */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Service Solution Required
              </label>
              <select
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer"
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
              >
                <option value="">Select a service solution...</option>
                {serviceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Send className="w-3.5 h-3.5 text-blue-600" /> Project Details & Goals
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your business goals, required timeline, or specific challenges..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-none"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={status === 'processing'}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-orbitron text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/25 disabled:opacity-60"
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <span>Transmit Project Proposal Request</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center mt-4 text-[11px] text-slate-500 font-medium">
                🔒 Enterprise Data Protection. All enquiries are stored securely and answered within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default ContactForm;
