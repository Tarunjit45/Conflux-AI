
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  customLogo?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ customLogo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'INFRASTRUCTURE', id: 'infrastructure' },
    { name: 'IMPACT', id: 'impact' },
    { name: 'AI CORE', id: 'ai-core' },
    { name: 'REVIEWS', id: 'reviews' },
    { name: 'GROWTH', id: 'contact' },
  ];

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 h-16 md:h-20 glass border-b border-white/5"
      >
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer" 
          onClick={(e) => scrollToSection(e, 'home')}
        >
          {customLogo ? (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-blue-500/30 overflow-hidden flex items-center justify-center bg-white/5 glow-blue">
              <img src={customLogo} alt="Brand Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 relative">
                <div className="absolute inset-0 bg-blue-600 blur-[4px] rounded-sm opacity-50" />
                <div className="relative w-full h-full bg-white clip-path-polygon-[50%_0%,100%_100%,0%_100%] flex items-center justify-center">
                  <div className="w-full h-full border-2 border-slate-900 bg-blue-600 rounded-sm" />
                </div>
              </div>
              <span className="font-orbitron font-bold text-lg md:text-xl tracking-tighter text-white uppercase">CONFLUX<span className="text-blue-500">AI</span></span>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={(e) => scrollToSection(e, item.id)}
              className="text-[10px] font-orbitron tracking-[0.2em] text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hidden sm:block px-5 py-2 glass border border-blue-500/30 text-[10px] font-orbitron tracking-[0.15em] text-white hover:bg-blue-500/20 transition-all rounded-sm glow-blue"
          >
            CLIENT ACCESS
          </button>
          
          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[90] bg-slate-950 flex flex-col items-center justify-center space-y-8 p-6 md:hidden"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => scrollToSection(e, item.id)}
                className="text-lg font-orbitron tracking-[0.2em] text-slate-300 hover:text-blue-500 transition-colors bg-transparent border-none"
              >
                {item.name}
              </button>
            ))}
            <button 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="mt-8 px-10 py-4 glass border border-blue-500/30 text-[12px] font-orbitron tracking-[0.15em] text-white w-full max-w-xs"
            >
              CLIENT ACCESS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
