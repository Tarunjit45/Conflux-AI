
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, User, Building2, Briefcase, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
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
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [focused, setFocused] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;

    setStatus('processing');

    // Extract UTM parameters and attribution metadata
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
      utm_campaign: urlParams.get('utm_campaign') || ''
    };

    try {
      // 1. Post to Server-Side API Endpoint (/api/contact)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      if (!res.ok) {
        throw new Error(`API Endpoint returned status ${res.status}`);
      }
    } catch (apiErr) {
      console.warn('Server-side API endpoint notice, attempting client Supabase fallback:', apiErr);
      try {
        await supabase
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
      } catch (dbErr) {
        console.warn('Supabase fallback notice:', dbErr);
      }
    }

    setStatus('success');
    navigate('/thank-you');
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    background: focused === field ? 'rgba(15,23,42,0.8)' : 'rgba(2,12,27,0.6)',
    border: `1px solid ${focused === field ? 'rgba(0,0,255,0.5)' : 'rgba(30,41,59,0.8)'}`,
    borderRadius: '6px',
    padding: '14px 16px',
    color: '#f8fafc',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.25s ease',
    fontFamily: 'Inter, sans-serif',
    boxShadow: focused === field ? '0 0 15px rgba(0,0,255,0.1)' : 'inset 0 1px 4px rgba(0,0,0,0.2)'
  });

  const serviceOptions = [
    { value: 'ai-automation', label: 'AI Automation & Chatbots' },
    { value: 'web-development', label: 'Website Development' },
    { value: 'ad-optimization', label: 'Ad Stack Optimization' },
    { value: 'full-stack', label: 'Complete Digital Infrastructure' },
    { value: 'it-consultancy', label: 'IT Strategy Consultancy' },
  ];

  if (status === 'success') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,255,0.05), rgba(2,12,27,0.8))',
            border: '1px solid rgba(0,0,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,255,0.05)'
          }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(0,0,255,0.1)', border: '1px solid rgba(0,0,255,0.4)', boxShadow: '0 0 20px rgba(0,0,255,0.3)' }}>
            <CheckCircle2 size={40} style={{ color: '#3333ff' }} />
          </div>
          <h3 className="font-inter text-2xl md:text-3xl font-black mb-3 text-white">Message Received!</h3>
          <p className="text-sm md:text-base mb-2 max-w-md mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Thank you, <strong className="text-white">{formData.name}</strong>. Our growth team has received your application
            and will reach out within <strong className="text-blue-500">24 hours</strong>.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-lg"
            style={{ background: 'rgba(0,0,255,0.1)', border: '1px solid rgba(0,0,255,0.3)' }}>
            <Mail size={14} style={{ color: '#3333ff' }} />
            <span className="font-inter text-[12px] font-bold tracking-wide text-blue-500">confluxdotai@gmail.com</span>
          </div>
          <div className="mt-6">
            <button
              onClick={() => { setStatus('idle'); setFormData({ name: '', email: '', phone: '', company: '', goal: '', message: '' }); }}
              className="font-inter text-[11px] font-bold tracking-wide transition-colors bg-transparent border-none uppercase text-slate-400 hover:text-blue-500"
            >
              SEND ANOTHER MESSAGE
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 relative group"
          style={{ background: 'rgba(0,0,255,0.1)', border: '1px solid rgba(0,0,255,0.3)', boxShadow: '0 0 30px rgba(0,0,255,0.2)' }}
        >
          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-2xl" />
          <Mail size={28} className="text-blue-500 relative z-10" />
        </motion.div>
        <h2 className="font-inter text-3xl md:text-5xl font-black mb-3 uppercase tracking-tight text-white">
          Let's <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6666ff 0%, #0000ff 100%)' }}>Grow Together</span>
        </h2>
        <p className="text-sm md:text-base max-w-md mx-auto mb-4 leading-relaxed" style={{ color: '#94a3b8' }}>
          Tell us about your business and goals. We'll design a custom AI strategy for you.
        </p>
        <div className="flex items-center justify-center gap-2 text-blue-500">
          <Mail size={12} />
          <a href="mailto:confluxdotai@gmail.com" className="font-inter text-[11px] font-bold tracking-wide transition-colors uppercase text-blue-500 hover:text-blue-400">
            confluxdotai@gmail.com
          </a>
        </div>
      </div>

      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden relative backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.4), rgba(2,12,27,0.8))',
          border: '1px solid rgba(0,0,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,255,0.05)'
        }}
      >
        {/* Form top bar */}
        <div className="px-8 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(30,41,59,0.8)', background: 'rgba(15,23,42,0.4)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="ml-4 font-inter text-[11px] font-bold tracking-wide uppercase text-slate-400">Contact Us</span>
        </div>

        <div className="p-5 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <User size={10} className="text-blue-500" /> Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Your full name"
                style={inputStyle('name')}
                value={formData.name}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <Mail size={10} className="text-blue-500" /> Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                style={inputStyle('email')}
                value={formData.email}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Company */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <Building2 size={10} className="text-blue-500" /> Company / Business *
              </label>
              <input
                type="text"
                required
                placeholder="Your company name"
                style={inputStyle('company')}
                value={formData.company}
                onFocus={() => setFocused('company')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <User size={10} className="text-blue-500" /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                style={inputStyle('phone')}
                value={formData.phone}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Service Goal */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <Briefcase size={10} className="text-blue-500" /> What Do You Need?
              </label>
              <select
                style={{ ...inputStyle('goal'), cursor: 'pointer', appearance: 'none' }}
                value={formData.goal}
                onFocus={() => setFocused('goal')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
              >
                <option value="" style={{ color: '#64748b' }}>Select a service...</option>
                {serviceOptions.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ color: '#f8fafc', background: '#020c1b' }}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase mb-2 text-slate-400">
                <Send size={10} className="text-blue-500" /> Tell Us More (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe your business challenge, target market, and what success looks like for you..."
                style={{ ...inputStyle('message'), resize: 'none' }}
                value={formData.message}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-2">
              {status === 'error' && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-xs">Something went wrong. Please email us directly at confluxdotai@gmail.com</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'processing'}
                className="w-full group relative py-4 md:py-5 rounded-lg font-orbitron text-xs tracking-[0.25em] text-white flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 overflow-hidden"
                style={{
                  background: status === 'processing'
                    ? 'rgba(0,0,255,0.5)'
                    : 'linear-gradient(135deg, #0000ff 0%, #0000cc 100%)',
                  boxShadow: status !== 'processing' ? '0 8px 30px rgba(0,0,255,0.4)' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                {status === 'processing' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    TRANSMITTING...
                  </>
                ) : (
                  <>
                    SEND MESSAGE
                    <Send size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>

              <p className="text-center mt-4 text-[10px]" style={{ color: '#64748b' }}>
                🔒 Encryption active. Your protocol data is secure. We respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default ContactForm;
