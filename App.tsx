
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import LandingPage from './LandingPage.tsx';
import BlogPage from './components/BlogPage.tsx';
import AdminCMS from './components/AdminCMS.tsx';
import ArticleDetail from './components/ArticleDetail.tsx';
import BrandingControl from './components/BrandingControl.tsx';
import Chatbot from './components/Chatbot.tsx';
import AboutUsPage from './components/AboutUsPage.tsx';
import SolutionsPage from './components/SolutionsPage.tsx';
import CreativePage from './components/CreativePage.tsx';
import ImpactPage from './components/ImpactPage.tsx';
import PortfolioPage from './components/PortfolioPage.tsx';
import AuthorityPage from './components/AuthorityPage.tsx';
import FaqPage from './components/FaqPage.tsx';
import SemanticPage from './components/SemanticPage.tsx';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  }, [pathname, hash]);
  
  return null;
};

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

  const scaleX = smoothProgress;

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] selection:bg-blue-600 selection:text-white overflow-x-hidden font-inter">
      <ScrollToTop />
      
      {/* Scroll progress bar — blue */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[200]"
        style={{ scaleX, transformOrigin: 'left', background: 'linear-gradient(90deg, #0000ff, #3333ff, #6666ff)' }}
      />

      <Navbar customLogo={siteLogo} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticleDetail />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/creative" element={<CreativePage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/authority" element={<AuthorityPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/semantic-map" element={<SemanticPage />} />
        <Route path="/admin/cms" element={<AdminCMS />} />
      </Routes>

      <Footer siteLogo={siteLogo} />

      {/* Manual Logo Upload Control */}
      <BrandingControl onUpload={handleLogoUpload} onReset={handleLogoReset} currentLogo={siteLogo} />

      {/* Integrated Chatbot */}
      <Chatbot />
    </div>
  );
};

export default App;
