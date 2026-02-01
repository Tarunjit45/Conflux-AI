
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfrastructureSuite from './components/InfrastructureSuite';
import TrustEngine from './components/TrustEngine';
import AICore from './components/AICore';
import Reviews from './components/Reviews';
import ContactForm from './components/ContactForm';
import BrandingControl from './components/BrandingControl';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Branding state
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('conflux_custom_logo');
    if (savedLogo) {
      setSiteLogo(savedLogo);
    }
  }, []);

  const handleLogoUpload = (logoData: string) => {
    setSiteLogo(logoData);
    localStorage.setItem('conflux_custom_logo', logoData);
  };

  const handleLogoReset = () => {
    setSiteLogo(null);
    localStorage.removeItem('conflux_custom_logo');
  };
  
  // Dynamic background color transition based on scroll
  const background = useTransform(smoothProgress, [0, 0.5, 1], ["#020617", "#0f172a", "#020617"]);

  return (
    <motion.div style={{ background }} className="relative min-h-screen selection:bg-blue-500/30">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-800/10 blur-[120px] rounded-full" />
      </div>

      <Navbar customLogo={siteLogo} />

      <main className="relative z-10">
        <section id="home">
          <Hero />
        </section>

        <section id="infrastructure" className="py-24 px-6 md:px-12 lg:px-24">
          <InfrastructureSuite />
        </section>

        <section id="impact" className="py-24 bg-slate-900/30 border-y border-white/5 overflow-hidden">
          <TrustEngine />
        </section>

        <section id="ai-core" className="py-24 px-6 md:px-12 lg:px-24">
          <AICore />
        </section>

        <section id="reviews" className="py-24 px-6 md:px-12 lg:px-24 bg-slate-900/10">
          <Reviews />
        </section>

        <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
          <ContactForm />
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="mb-6 flex flex-wrap justify-center gap-x-8 gap-y-2 font-orbitron text-[10px] tracking-[0.2em] uppercase">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          <a href="mailto:tarunjitbiswas24@gmail.com" className="text-blue-500 hover:text-blue-400 transition-colors">tarunjitbiswas24@gmail.com</a>
        </div>
        <div className="flex justify-center mb-4">
          {siteLogo ? (
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden opacity-50 hover:opacity-100 grayscale hover:grayscale-0 transition-all">
               <img src={siteLogo} alt="Site Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="font-orbitron font-bold text-xs tracking-tighter opacity-50">CONFLUX<span className="text-blue-500">AI</span></span>
          )}
        </div>
        <p className="font-orbitron text-[8px] tracking-[0.1em] opacity-40">&copy; {new Date().getFullYear()} CONFLUX AI infrastructure node 0x24. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* Manual Logo Upload Control */}
      <BrandingControl onUpload={handleLogoUpload} onReset={handleLogoReset} currentLogo={siteLogo} />
    </motion.div>
  );
};

export default App;
