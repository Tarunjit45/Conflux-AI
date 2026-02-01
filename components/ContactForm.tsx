
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send, Mail } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    goal: ''
  });

  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    // Simulation of uplink
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block p-4 rounded-full bg-blue-600/10 text-blue-400 mb-6"
        >
          <Terminal size={32} />
        </motion.div>
        <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">Apply for <span className="text-gradient">Growth</span></h2>
        <p className="text-slate-500 font-orbitron text-[10px] tracking-[0.4em] uppercase">Phase 01: Onboarding Protocol</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-400/60 font-orbitron text-[9px] tracking-widest">
          <Mail size={12} />
          <a href="mailto:tarunjitbiswas24@gmail.com" className="hover:text-blue-400 transition-colors">TARUNJITBISWAS24@GMAIL.COM</a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass border border-white/5 p-8 md:p-12 rounded-2xl relative overflow-hidden">
        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="text-blue-400 font-orbitron text-2xl mb-4">UPLINK SUCCESSFUL</div>
            <p className="text-slate-400 text-sm mb-6">Our growth engineers will contact you within 24 neural hours.</p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg inline-block">
              <p className="text-[10px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Direct Channel</p>
              <a href="mailto:tarunjitbiswas24@gmail.com" className="text-blue-400 font-orbitron text-xs hover:underline">tarunjitbiswas24@gmail.com</a>
            </div>
            <br />
            <button 
              onClick={() => setStatus('idle')}
              className="mt-8 text-blue-400 font-orbitron text-[10px] tracking-widest hover:underline"
            >
              RESET PROTOCOL
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-orbitron text-[10px] text-slate-500 tracking-widest uppercase mb-2">Full Identity</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Connor"
                  className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all rounded-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-orbitron text-[10px] text-slate-500 tracking-widest uppercase mb-2">Comms Channel</label>
                <input 
                  type="email" 
                  required
                  placeholder="resistance@conflux.ai"
                  className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all rounded-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-orbitron text-[10px] text-slate-500 tracking-widest uppercase mb-2">Organization</label>
                <input 
                  type="text" 
                  required
                  placeholder="Cyberdyne Systems"
                  className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all rounded-sm"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-orbitron text-[10px] text-slate-500 tracking-widest uppercase mb-2">Growth Vector</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all rounded-sm appearance-none"
                  value={formData.goal}
                  onChange={e => setFormData({...formData, goal: e.target.value})}
                >
                  <option value="" disabled className="bg-slate-900">Select objective...</option>
                  <option value="scale" className="bg-slate-900">Rapid Infrastructure Scaling</option>
                  <option value="ai" className="bg-slate-900">AI Automation Deployment</option>
                  <option value="ads" className="bg-slate-900">Ad Stack Optimization</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit"
                disabled={status === 'processing'}
                className="w-full group py-5 bg-blue-600 text-white font-orbitron text-xs tracking-[0.3em] rounded-sm flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {status === 'processing' ? 'PROCESSING...' : (
                  <>
                    SUBMIT APPLICATION <Send size={14} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Form terminal decor */}
        <div className="absolute bottom-2 right-4 font-orbitron text-[8px] text-slate-700 pointer-events-none">
          SECURE_UPLINK_v4.2.0-STABLE
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
