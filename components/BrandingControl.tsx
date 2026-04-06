
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
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[60] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-2xl overflow-hidden group"
        style={{
          background: 'rgba(2,12,27,0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,255,0.4)',
          color: '#3333ff',
          boxShadow: '0 8px 30px rgba(0,0,255,0.3)'
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,255,0.2)' }} />
        <Settings size={20} className={`${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`} />
      </motion.button>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, rotateX: 20 }}
            animate={{ opacity: 1, x: 0, rotateX: 0 }}
            exit={{ opacity: 0, x: -20, rotateX: 20 }}
            className="fixed bottom-24 left-6 z-[60] w-80 rounded-2xl shadow-2xl p-6 overflow-hidden perspective-1000"
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(2,12,27,0.98))',
              border: '1px solid rgba(0,0,255,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,255,0.1)'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-[0.03] rotate-12 -translate-y-4" style={{ color: '#3333ff' }}>
              <Settings size={150} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-inter text-[11px] font-bold tracking-widest uppercase text-blue-400">Design Settings</h3>
                <button onClick={() => setIsOpen(false)} className="transition-colors text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs mb-8 leading-relaxed text-slate-300">
                Upload your business logo here. It will automatically update across the entire website.
              </p>

              <div className="space-y-4">
                {/* Logo Preview / Placeholder */}
                <div className="h-24 w-full rounded-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
                  style={{ background: 'rgba(15,23,42,0.6)', border: '1px dashed rgba(0,0,255,0.3)' }}>
                  {currentLogo ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,255,0.4)] bg-white"
                      style={{ border: '2px solid rgba(0,0,255,0.8)' }}>
                      <img src={currentLogo} alt="Current Identity" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,255,0.2)]"
                        style={{ background: 'rgba(0,0,255,0.15)', color: '#3333ff' }}>
                        <Upload size={16} />
                      </div>
                      <span className="text-[10px] font-inter font-bold tracking-wide text-slate-400 uppercase">No Logo Uploaded</span>
                    </>
                  )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex items-center justify-center gap-2 py-3 text-white font-inter font-bold text-[11px] tracking-wide rounded-lg transition-all uppercase overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0000ff, #0000cc)', boxShadow: '0 4px 15px rgba(0,0,255,0.3)' }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    <Upload size={12} /> Upload
                  </button>
                  <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 py-3 font-inter font-bold text-[11px] tracking-wide rounded-lg transition-all uppercase text-slate-400 hover:text-white"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 flex items-center gap-2 border-t border-slate-800">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[9px] font-inter font-bold tracking-widest uppercase italic text-slate-500">Design Panel — Protected</span>
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
