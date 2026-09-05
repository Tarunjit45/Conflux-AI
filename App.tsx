
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import LocationHubPage from './components/locations/LocationHubPage';
import DistrictDirectoryPage from './components/locations/DistrictDirectoryPage';
import LocationDetailPage from './components/locations/LocationDetailPage';
import IndustryLocationPage from './components/locations/IndustryLocationPage';
import RuralDigitalSolutionsPage from './components/services/RuralDigitalSolutionsPage';
import LocationCoverageDashboard from './components/admin/LocationCoverageDashboard';
import NotFoundPage from './components/NotFoundPage';
import VerifyPortal from './components/verify/VerifyPortal';
import MethodologyPage from './components/verify/MethodologyPage';
import VerifyGuideDetailPage from './components/verify/guides/VerifyGuideDetailPage';
import WorkplacePolicyPage from './components/WorkplacePolicyPage';
import { DiscoverPage } from './components/discover/DiscoverPage';
import { ForBusinessPage } from './components/business/ForBusinessPage';
import { VisibilityAuditPage } from './components/business/VisibilityAuditPage';
import { PublicBusinessProfile } from './components/business/PublicBusinessProfile';
import { BusinessSubmissionPage } from './components/submission/BusinessSubmissionPage';
import { AdminBusinessDashboard } from './components/admin/AdminBusinessDashboard';
import { MyLocalConfluxPage } from './components/user/MyLocalConfluxPage';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserOnboardingPrompt } from './components/auth/UserOnboardingPrompt';
import { BottomNav } from './components/navigation/BottomNav';
import { AuthProvider } from './lib/authContext';
import { trackPageView } from './lib/analytics';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/my-local': {
    title: 'My Local Conflux | Local Intelligence, Reputation & Community Signals | Conflux AI',
    description: 'Personalized local intelligence dashboard. View your local reputation score, community confirmations, demand requests, and followed businesses in your locality.'
  },
  '/verify/methodology': {
    title: 'Conflux Verify Methodology & Evidence Standards | Conflux AI',
    description: 'Deterministic evidence evaluation framework for business claims against primary statutory registries, MCA master data, GSTIN, and accredited ISO repositories.'
  },
  '/verify/guides/how-to-verify-indian-company-legal-existence': {
    title: 'How to Verify Indian Company Legal Existence (MCA Master Data Guide) | Conflux AI',
    description: 'Step-by-step guide to verifying an Indian company’s legal existence, 21-character CIN syntax, active ROC status, and incorporation dockets on MCA Master Data.'
  },
  '/verify/guides/how-to-verify-gst-udyam-registration': {
    title: 'How to Verify GSTIN & MSME Udyam Registration in India | Conflux AI',
    description: 'Learn how to verify 15-digit GSTIN tax numbers and 19-digit MSME Udyam registration certificates using official government portals.'
  },
  '/verify/guides/how-to-verify-iso-certificate': {
    title: 'How to Verify an ISO 9001 / 27001 Certificate (IAF CertSearch Guide) | Conflux AI',
    description: 'Learn how to detect unaccredited certificate mills and verify authentic ISO 9001, ISO 14001, and ISO 27001 certifications via the IAF CertSearch database.'
  },
  '/verify/guides/how-to-check-expired-certification': {
    title: 'How to Check Expired & Lapsed Certifications (Temporal Validity Guide) | Conflux AI',
    description: 'Understand how temporal validity affects ISO accreditations, government licenses, and compliance claims, and learn how to identify lapsed certifications.'
  },
  '/verify/guides/active-vs-struck-off-company': {
    title: 'Active vs Struck-Off Company: Legal Differences & Verification | Conflux AI',
    description: 'Understand the legal consequences of MCA Section 248 Strike-Off status, and learn why struck-off companies cannot enter into enforceable commercial contracts.'
  },
  '/verify/guides/company-not-found-does-not-mean-fake': {
    title: 'Why "Company Not Found" Does Not Mean Fake (Absence ≠ Contradiction) | Conflux AI',
    description: 'Learn why the absence of a record in a single database does not prove a business is fake, and understand Conflux Verify’s core principle: Absence ≠ Contradiction.'
  },
  '/verify': {
    title: 'Conflux Verify | Bounded Business Claim & Evidence Verification Engine',
    description: 'Evaluate corporate legal existence, statutory GSTIN/Udyam registrations, and accredited certifications through deterministic verification and live registrar lookup.'
  },
  '/services/digital-solutions-west-bengal': {
    title: 'Digital Solutions for Businesses Across West Bengal | Conflux AI',
    description: 'Conflux AI provides remote-first digital solutions, website development, WhatsApp automation, and AI chatbots for small and medium businesses across West Bengal.'
  },
  '/locations/west-bengal': {
    title: 'Local Business Visibility & Verification in West Bengal | Conflux AI',
    description: 'Conflux AI is a Local Visibility + Trust Platform helping businesses across West Bengal become discoverable, trusted, and contactable across Google and AI search.'
  },
  '/': {
    title: 'Conflux AI | Local Visibility + Trust Platform',
    description: 'Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search.'
  },
  '/about': {
    title: 'About Us | Conflux AI - Local Visibility + Trust Platform',
    description: 'Learn about Conflux AI, founded by Tarunjit Biswas & Shouvik Majumdar. Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search.'
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
  '/workplace-policy': {
    title: 'Workplace Policy & Operating Principles | Conflux AI',
    description: 'Conflux AI workplace principles, remote-first operational expectations, ownership standards, communication, and professional conduct.'
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
  '/services/ai-automation': {
    title: 'Enterprise AI Automation Services | Conflux AI',
    description: 'Custom AI automation pipelines, system integrations, and process optimization by Conflux AI based in Kolkata, India.'
  },
  '/services/ai-agents': {
    title: 'AI Agents & Autonomous Multi-Agent Systems | Conflux AI',
    description: 'Deploy context-aware AI agents for prospect qualification, automated research, and multi-step task execution.'
  },
  '/services/whatsapp-automation': {
    title: 'WhatsApp Business Automation Systems | Conflux AI',
    description: 'Automate WhatsApp lead generation, customer support, order tracking, and instant CRM synchronization.'
  },
  '/services/chatbot-development': {
    title: 'Custom AI Chatbot Development | Conflux AI',
    description: '24/7 intelligent conversational chatbots trained on your company knowledge base using Retrieval-Augmented Generation (RAG).'
  },
  '/services/workflow-automation': {
    title: 'Business Workflow Automation Services | Conflux AI',
    description: 'Streamline multi-department workflows with custom Make.com, Zapier, and API integrations.'
  },
  '/services/website-development': {
    title: 'High-Performance Web Development | Conflux AI',
    description: 'Sub-second React + Vite + TypeScript web applications engineered for high conversion and fast loading.'
  },
  '/services/seo-geo': {
    title: 'SEO & Technical Search Engine Optimization | Conflux AI',
    description: 'Technical SEO, Schema.org JSON-LD data structures, and crawl optimization for traditional and AI search engines.'
  },
  '/services/digital-marketing': {
    title: 'Digital Marketing & Growth Services | Conflux AI',
    description: 'Data-driven B2B client acquisition, video content editing, social media management, and reputation management.'
  },
  '/services/ecommerce-development': {
    title: 'E-Commerce Development & WhatsApp Catalogs | Conflux AI',
    description: 'Custom e-commerce platforms, automated WhatsApp product catalogs, and zero-friction UPI checkout systems by Conflux AI.'
  },
  '/services/meta-ads': {
    title: 'Meta Ads & Paid Social Acquisition | Conflux AI',
    description: 'Targeted Facebook & Instagram ad campaigns engineered for B2B and D2C customer acquisition.'
  },
  '/services/google-ads': {
    title: 'Google Ads & PPC Search Marketing | Conflux AI',
    description: 'High-intent search campaigns, keyword targeting, and conversion-focused landing pages.'
  },
  '/services': {
    title: 'Enterprise AI Solutions & Full-Stack Automation Services | Conflux AI',
    description: 'Explore Conflux AI enterprise automation workflows, custom chatbot integrations, web architecture, and digital transformation solutions.'
  },
  '/locations': {
    title: 'Remote AI Automation Services Across West Bengal | Conflux AI',
    description: 'Conflux AI provides remote-first AI automation, WhatsApp lead bots, custom chatbots, and web development for businesses across all districts of West Bengal.'
  },
  '/services/enterprise-ai-automation': {
    title: 'Enterprise AI Automation Services | Conflux AI',
    description: 'Custom AI automation pipelines, system integrations, and process optimization by Conflux AI based in Kolkata, India.'
  },
  '/services/whatsapp-business-automation': {
    title: 'WhatsApp Business Automation Systems | Conflux AI',
    description: 'Automate WhatsApp lead generation, customer support, order tracking, and instant CRM synchronization.'
  },
  '/services/ai-chatbot-development': {
    title: 'Custom AI Chatbot Development | Conflux AI',
    description: '24/7 intelligent conversational chatbots trained on your company knowledge base using Retrieval-Augmented Generation (RAG).'
  },
  '/services/business-workflow-automation': {
    title: 'Business Workflow Automation Services | Conflux AI',
    description: 'Streamline multi-department workflows with custom Make.com, Zapier, and API integrations.'
  },
  '/services/web-development': {
    title: 'High-Performance Web Development | Conflux AI',
    description: 'Sub-second React + Vite + TypeScript web applications engineered for high conversion and fast loading.'
  },
  '/services/seo': {
    title: 'SEO & Technical Search Engine Optimization | Conflux AI',
    description: 'Technical SEO, Schema.org JSON-LD data structures, and crawl optimization for traditional and AI search engines.'
  },
  '/services/rural-digital-solutions': {
    title: 'Digital Solutions for Businesses Across West Bengal | Conflux AI',
    description: 'Conflux AI provides remote-first digital solutions, website development, WhatsApp automation, and AI chatbots for small and medium businesses across West Bengal.'
  },
  '/thank-you': {
    title: 'Thank You | Conflux AI',
    description: 'Thank you for reaching out to Conflux AI. Our technical team will get back to you within 24 hours.'
  },
  '/admin/cms': {
    title: 'Admin CMS | Conflux AI',
    description: 'Internal content management system for Conflux AI.'
  },
  '/admin/businesses': {
    title: 'Business Identity & Verification Management | Conflux AI',
    description: 'Admin command center for managing, verifying, and publishing Conflux Business Graph entities.'
  },
  '/discover': {
    title: 'Discover Verified Local Businesses in West Bengal | Conflux AI',
    description: 'Find trusted local businesses across West Bengal. Check statutory evidence, verification dockets, operating hours, and contact verified proprietors directly.'
  },
  '/list-business': {
    title: 'List & Verify Your Local Business | Conflux AI Onboarding',
    description: 'Get your local business discoverable and trusted across Google, Maps, and AI search engines. Submit your business for statutory verification.'
  },
  '/submit-business': {
    title: 'List & Verify Your Local Business | Conflux AI Onboarding',
    description: 'Get your local business discoverable and trusted across Google, Maps, and AI search engines. Submit your business for statutory verification.'
  },
  '/apply': {
    title: 'Apply for Conflux Verification | Conflux AI',
    description: 'Submit your business credentials for statutory evidence verification and inclusion in the Conflux Business Graph.'
  },
  '/business': {
    title: 'For Businesses: Get Discovered, Trusted & Contacted | Conflux AI',
    description: 'Make your local business discoverable across Google search, Maps, and AI engines with Schema.org markup, statutory verification trust badges, and direct WhatsApp lead routing.'
  },
  '/business/audit': {
    title: 'Local Business Visibility & AI Readiness Audit | Conflux AI',
    description: 'Free evidence-based audit evaluating technical SEO, Schema.org LocalBusiness markup, statutory evidence depth, and AI-search readiness.'
  },
  '/admin': {
    title: 'Admin Command Center | Conflux AI',
    description: 'Internal audit and administrative portal for Conflux AI.'
  },
  '/auth': {
    title: 'Admin Authentication | Conflux Platform',
    description: 'Secure administrative login portal for Conflux AI.'
  },
  '/login': {
    title: 'Sign In | Conflux Platform Auth',
    description: 'Role-based access portal for administrators and verified business owners.'
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
      title: 'Conflux AI | Local Visibility + Trust Platform',
      description: 'Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search.'
    };

    // Update document title
    document.title = meta.title;

    // Update meta description
    let metaDescriptionEl = document.querySelector('meta[name="description"]');
    if (!metaDescriptionEl) {
      metaDescriptionEl = document.createElement('meta');
      metaDescriptionEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionEl);
    }
    metaDescriptionEl.setAttribute('content', meta.description);

    // Dynamically manage self-referencing canonical URL based on active route
    const canonicalOrigin = 'https://confluxai.in';
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$|(?<=^.+)\/$/g, '');
    const canonicalUrl = `${canonicalOrigin}${cleanPath}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // Update Open Graph & Twitter meta tags for consistency
    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) ogUrlEl.setAttribute('content', canonicalUrl);

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', meta.title);

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', meta.description);

    const twitterUrlEl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrlEl) twitterUrlEl.setAttribute('content', canonicalUrl);

    const twitterTitleEl = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleEl) twitterTitleEl.setAttribute('content', meta.title);

    const twitterDescEl = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescEl) twitterDescEl.setAttribute('content', meta.description);

    // ── Google Analytics 4 (GA4): SPA Page View Tracking ──────────────
    // Detail routes like /business/:slug and /blog/:slug manage their own async titles & canonical URLs
    const isDynamicDetailRoute = pathname.startsWith('/business/') || (pathname.startsWith('/blog/') && pathname !== '/blog');
    if (!isDynamicDetailRoute) {
      trackPageView(meta.title, canonicalUrl, cleanPath);
    }
  }, [pathname, hash]);
  
  return null;
};

const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
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
    <AuthProvider>
      <div className={`relative min-h-screen w-full bg-[#f8fafc] selection:bg-blue-600 selection:text-white overflow-x-hidden font-inter ${isAdminRoute ? '' : 'pb-16 md:pb-0'}`}>
        <ScrollToTop />
        
        {/* Scroll progress bar — blue */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] z-[200]"
          style={{ scaleX, transformOrigin: 'left', background: 'linear-gradient(90deg, #0000ff, #3333ff, #6666ff)' }}
        />

        <Navbar customLogo={siteLogo} />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/my-local" element={<MyLocalConfluxPage />} />
          <Route path="/business" element={<ForBusinessPage />} />
          <Route path="/business/audit" element={<VisibilityAuditPage />} />
          <Route path="/list-business" element={<BusinessSubmissionPage />} />
          <Route path="/submit-business" element={<BusinessSubmissionPage />} />
          <Route path="/apply" element={<BusinessSubmissionPage />} />
          <Route path="/business/india/west-bengal/:district/:city/:slug" element={<PublicBusinessProfile />} />
          <Route path="/business/:slug" element={<PublicBusinessProfile />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/services" element={<SolutionsPage />} />
          <Route path="/creative" element={<CreativePage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/work" element={<PortfolioPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/workplace-policy" element={<WorkplacePolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/authority" element={<AuthorityPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/semantic-map" element={<SemanticPage />} />
          <Route path="/services/digital-solutions-west-bengal" element={<RuralDigitalSolutionsPage />} />
          <Route path="/services/rural-digital-solutions" element={<RuralDigitalSolutionsPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/locations" element={<LocationHubPage />} />
          <Route path="/locations/:districtSlug" element={<DistrictDirectoryPage />} />
          <Route path="/locations/:districtSlug/:citySlug" element={<LocationDetailPage />} />
          <Route path="/locations/west-bengal" element={<LocationHubPage />} />
          <Route path="/locations/west-bengal/:districtSlug" element={<DistrictDirectoryPage />} />
          <Route path="/locations/west-bengal/:districtSlug/:citySlug" element={<LocationDetailPage />} />
          <Route path="/locations/west-bengal/:citySlug/:industrySlug" element={<IndustryLocationPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/verify" element={<VerifyPortal />} />
          <Route path="/verify/methodology" element={<MethodologyPage />} />
          <Route path="/verify/guides/:guideSlug" element={<VerifyGuideDetailPage />} />
          <Route path="/verify/:entitySlug/:claimSlug" element={<VerifyPortal />} />
          <Route path="/admin" element={<Navigate to="/admin/businesses" replace />} />
          <Route path="/admin/businesses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cms" element={<AdminCMS />} />
          <Route path="/admin/location-coverage" element={<LocationCoverageDashboard />} />
          <Route path="/login" element={<AuthModal />} />
          <Route path="/auth" element={<AuthModal />} />
          <Route path="/register" element={<AuthModal />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer siteLogo={siteLogo} />

        {/* Manual Logo Upload Control — Restricted to Admin portal only */}
        {isAdminRoute && (
          <BrandingControl onUpload={handleLogoUpload} onReset={handleLogoReset} currentLogo={siteLogo} />
        )}

        {/* First-Time User Onboarding & Role Selection Prompt */}
        <UserOnboardingPrompt />

        {/* Integrated Chatbot */}
        <Chatbot />

        {/* Mobile-Only Bottom Navigation */}
        <BottomNav />
      </div>
    </AuthProvider>
  );
};

export default App;
