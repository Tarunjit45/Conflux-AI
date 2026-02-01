
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Upload, X, RotateCcw, ShieldCheck } from 'lucide-react';

interface BrandingControlProps {
  onUpload: (data: string) => void;
  onReset: () => void;
  currentLogo: string | null;
}

const BrandingControl: React.FC<BrandingControlProps> = ({ onUpload, onReset, currentLogo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[60] w-12 h-12 glass border border-white/10 rounded-full flex items-center justify-center text-blue-400 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Settings size={20} className={`${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`} />
      </motion.button>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-24 left-6 z-[60] w-80 glass border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-[0.03] rotate-12 -translate-y-4">
              <Settings size={150} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-orbitron text-[10px] tracking-[0.3em] text-blue-400 uppercase">Identity Console</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                Manually uplink your organization's brand identity. This vector will propagate across all core infrastructure layers.
              </p>

              <div className="space-y-4">
                {/* Logo Preview / Placeholder */}
                <div className="h-24 w-full bg-slate-900/50 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                  {currentLogo ? (
                    <div className="w-16 h-16 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-white/5">
                      <img src={currentLogo} alt="Current Identity" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400/50">
                        <Upload size={16} />
                      </div>
                      <span className="text-[9px] font-orbitron text-slate-600 tracking-wider">NO CUSTOM VECTOR</span>
                    </>
                  )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-orbitron text-[9px] tracking-widest rounded-sm hover:bg-blue-500 transition-all uppercase"
                  >
                    <Upload size={12} /> Uplink
                  </button>
                  <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 py-3 glass border border-white/10 text-slate-400 font-orbitron text-[9px] tracking-widest rounded-sm hover:text-white transition-all uppercase"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500/50" />
                <span className="text-[8px] font-orbitron text-slate-600 tracking-widest uppercase italic">Session Encrypted: LOCAL_NODE</span>
              </div>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandingControl;
