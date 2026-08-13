
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
import ServiceDetailPage from './components/ServiceDetailPage.tsx';
import ThankYouPage from './components/ThankYouPage.tsx';
import CareersPage from './components/CareersPage.tsx';
import ContactPage from './components/ContactPage.tsx';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Conflux AI | AI Automation & Digital Solutions Agency',
    description: 'Conflux AI is an AI automation and digital solutions agency headquartered in Kolkata, India. We build AI-powered systems, business automation workflows and digital solutions.'
  },
  '/about': {
    title: 'About Us | Conflux AI - Mission & Leadership',
    description: 'Learn about Conflux AI, founded by Tarunjit Biswas & Shouvik Majumdar. We democratize enterprise AI automation and digital solutions from Kolkata, India.'
  },
  '/solutions': {
    title: 'Enterprise AI Solutions & Automation Architecture | Conflux AI',
    description: 'Explore Conflux AI enterprise automation workflows, custom chatbot integrations, web architecture, and digital transformation solutions.'
  },
  '/creative': {
    title: 'Creative Suite & Video Editing Services | Conflux AI',
    description: 'High-impact video editing, social media management, graphic design, and retention-focused creative direction by Conflux AI.'
  },
  '/impact': {
    title: 'Client Impact & Growth Metrics | Conflux AI',
    description: 'See how Conflux AI delivers measurable ROI, autonomous workflows, and accelerated growth for modern enterprises.'
  },
  '/portfolio': {
    title: 'Selected Client Work & Case Studies | Conflux AI',
    description: 'View live client projects, screen video demos, and visual web applications built by Conflux AI across e-commerce, hospitality, and consultancy.'
  },
  '/work': {
    title: 'Selected Client Work & Case Studies | Conflux AI',
    description: 'View live client projects, screen video demos, and visual web applications built by Conflux AI across e-commerce, hospitality, and consultancy.'
  },
  '/careers': {
    title: 'Careers & Engineering Opportunities | Join Conflux AI',
    description: 'Join Conflux AI in building next-generation AI automation, web infrastructure, and generative engine optimization tools.'
  },
  '/contact': {
    title: 'Contact Us | Conflux AI Kolkata',
    description: 'Connect with Conflux AI engineering leadership in Kolkata, India. Request custom proposals, AI blueprints, and project consultations.'
  },
  '/authority': {
    title: 'Technical Authority & Security Standards | Conflux AI',
    description: 'Review Conflux AI verification signals, security benchmarks, clean web architecture, and data protection standards.'
  },
  '/faq': {
    title: 'Frequently Asked Questions | Conflux AI',
    description: 'Answers to common questions regarding AI automation, chatbot integrations, pricing, web development timelines, and services.'
  },
  '/semantic-map': {
    title: 'Generative Engine Optimization (GEO) & Semantic Map | Conflux AI',
    description: 'Learn how Conflux AI optimizes entity graphs and knowledge bases for AI search engines like Gemini, ChatGPT, and Perplexity.'
  },
  '/blog': {
    title: 'AI Engineering & Growth Blog | Conflux AI',
    description: 'Technical articles, AI automation tutorials, search engine optimization insights, and software guides by Conflux AI.'
  },
  '/thank-you': {
    title: 'Thank You | Conflux AI',
    description: 'Thank you for reaching out to Conflux AI. Our technical team will get back to you within 24 hours.'
  },
  '/admin/cms': {
    title: 'Admin CMS | Conflux AI',
    description: 'Internal content management system for Conflux AI.'
  }
};

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

    const meta = routeMeta[pathname] || {
      title: 'Conflux AI | AI Automation & Digital Solutions Agency',
      description: 'Conflux AI is an AI automation and digital solutions agency headquartered in Kolkata, India. We build AI-powered systems, business automation workflows and digital solutions.'
    };

    document.title = meta.title;
    const metaDescriptionEl = document.querySelector('meta[name="description"]');
    if (metaDescriptionEl) {
      metaDescriptionEl.setAttribute('content', meta.description);
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
        <Route path="/work" element={<PortfolioPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/authority" element={<AuthorityPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/semantic-map" element={<SemanticPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
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
