import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, BookOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  customLogo?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ customLogo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Services', id: 'infrastructure' },
    { name: 'Blog', path: '/blog', isLink: true },
    { name: 'Impact', id: 'impact' },
    { name: 'AI Core', id: 'ai-core' },
    { name: 'Team', id: 'founders' },
  ];

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (pathname !== '/') {
        navigate('/#' + id);
        return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navyColor = "#000080";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-10 h-14 md:h-[72px] transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? `1px solid rgba(0, 0, 128, 0.1)`
            : '1px solid transparent'
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
          onClick={(e) => scrollToSection(e, 'home')}
        >
          {customLogo ? (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex items-center justify-center"
              style={{ border: `1px solid ${navyColor}22` }}>
              <img src={customLogo} alt="Brand Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <div className="w-7 h-7 md:w-8 md:h-8 relative transition-transform duration-500 group-hover:rotate-[180deg]">
                <div className="absolute inset-0 rounded-sm opacity-90 group-hover:opacity-100 transition-opacity"
                  style={{ background: navyColor, filter: 'blur(4px)' }} />
                <div className="relative w-full h-full rounded-sm overflow-hidden flex items-center justify-center"
                  style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', background: navyColor }} />
              </div>
              <span className="font-inter font-black text-base md:text-lg tracking-tight uppercase" style={{ color: navyColor }}>
                CONFLUX<span style={{ opacity: 0.8 }}>AI</span>
              </span>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            item.isLink ? (
              <Link
                key={item.path}
                to={item.path}
                className="text-[13px] font-inter font-semibold tracking-wide transition-all duration-200 uppercase hover:scale-105"
                style={{ color: pathname === item.path ? navyColor : '#475569' }}
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={(e) => scrollToSection(e, item.id || '')}
                className="text-[13px] font-inter font-semibold tracking-wide transition-all duration-200 bg-transparent border-none uppercase hover:scale-105"
                style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = navyColor}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#475569'}
              >
                {item.name}
              </button>
            )
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg font-inter font-bold text-[11px] tracking-wide transition-all duration-300"
            style={{ border: `1px solid ${navyColor}44`, background: `${navyColor}08`, color: navyColor }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${navyColor}15`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = navyColor;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${navyColor}08`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${navyColor}44`;
            }}
          >
            CLIENT ACCESS
          </button>

          <button
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-lg font-inter font-bold text-[11px] tracking-wide text-white transition-all duration-300 group shadow-lg"
            style={{ background: navyColor }}
          >
            GET STARTED
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 focus:outline-none bg-transparent border-none"
            style={{ color: navyColor }}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[90] flex flex-col md:hidden"
            style={{ background: '#ffffff', backdropFilter: 'blur(24px)' }}
          >
            <div className="flex items-center justify-between px-4 h-14" style={{ borderBottom: `1px solid ${navyColor}11` }}>
              <span className="font-inter font-black text-sm" style={{ color: navyColor }}>CONFLUX<span style={{ opacity: 0.6 }}>AI</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="bg-transparent border-none p-2" style={{ color: navyColor }}><X size={22} /></button>
            </div>

            <div className="flex flex-col items-start justify-center flex-1 px-8 gap-7">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className="text-2xl font-inter font-bold tracking-tight transition-colors bg-transparent border-none uppercase text-left"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = navyColor}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#475569'}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>

            <div className="px-8 pb-12 flex flex-col gap-4">
              <button
                onClick={(e) => scrollToSection(e, 'contact')}
                className="w-full py-4 font-inter font-bold text-[13px] tracking-wide text-white rounded-lg flex items-center justify-center gap-3 shadow-xl"
                style={{ background: navyColor }}
              >
                GET STARTED <ArrowRight size={14} />
              </button>
              <button
                onClick={(e) => scrollToSection(e, 'contact')}
                className="w-full py-4 font-inter font-bold text-[13px] tracking-wide rounded-lg"
                style={{ border: `1px solid ${navyColor}44`, background: `${navyColor}11`, color: navyColor }}
              >
                CLIENT ACCESS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;