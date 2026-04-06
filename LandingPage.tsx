
import React from 'react';
import Hero from './components/Hero.tsx';
import InfrastructureSuite from './components/InfrastructureSuite.tsx';
import CreativeSuite from './components/CreativeSuite.tsx';
import SocialImpact from './components/SocialImpact.tsx';
import BlueprintVault from './components/BlueprintVault.tsx';
import VideoTrust from './components/VideoTrust.tsx';
import GEOPowerhouse from './components/GEOPowerhouse.tsx';
import VoiceFAQ from './components/VoiceFAQ.tsx';
import DataVault from './components/DataVault.tsx';
import TrustEngine from './components/TrustEngine.tsx';
import SemanticMap from './components/SemanticMap.tsx';
import Founders from './components/Founders.tsx';
import Reviews from './components/Reviews.tsx';
import ContactForm from './components/ContactForm.tsx';
import BlogSection from './components/BlogSection.tsx';
import AICore from './components/AICore.tsx';
import Projects from './components/Projects.tsx';
import AuthoritySignals from './components/AuthoritySignals.tsx';
import QuickServices from './components/QuickServices.tsx';

const LandingPage: React.FC = () => {
  return (
    <main className="relative z-10 w-full overflow-hidden">
      {/* DARK SECTION 1: Hero */}
      <section id="home" className="relative" style={{ backgroundColor: '#020c1b' }}>
        <Hero />
      </section>

      {/* Services At A Glance */}
      <QuickServices />

      {/* LIGHT SECTION 1: Infrastructure */}
      <section id="infrastructure" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#ffffff' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,255,0.3), transparent)' }} />
        <InfrastructureSuite />
      </section>

      {/* 2026 Engagement: Digital Creative Suite */}
      <section id="creative-suite" className="py-24 relative bg-[#f8fafc]">
        <CreativeSuite />
      </section>

      {/* 2026 Engagement: Social Impact & Reach */}
      <SocialImpact />

      {/* 2026 Engagement: The Blueprint Vault */}
      <BlueprintVault />

      {/* 2026 GEO: Data Vault */}
      <DataVault />

      {/* LIGHT SECTION 2: Impact */}
      <section id="impact" className="py-24 relative" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid rgba(15,23,42,0.04)', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
        <TrustEngine />
      </section>

      {/* 2026 GEO: Semantic Connectivity Cluster */}
      <SemanticMap />

      {/* DARK SECTION 2: AI Core */}
      <section id="ai-core" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: '#020c1b' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <AICore />
      </section>

      {/* LIGHT SECTION 3: Projects */}
      <section id="projects" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#ffffff' }}>
        <Projects />
      </section>

      {/* LIGHT SECTION 4: Reviews */}
      <section id="reviews" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid rgba(15,23,42,0.04)' }}>
        <Reviews />
      </section>
      
      {/* 2026 Engagement: Authority Signals */}
      <AuthoritySignals />

      {/* LIGHT SECTION 5: Founders */}
      <section id="founders" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#ffffff', borderTop: '1px solid rgba(15,23,42,0.04)' }}>
        <Founders />
      </section>

      {/* 2026 Engagement: Video Trust Showcase */}
      <VideoTrust />

      {/* 2026 Engagement: GEO Powerhouse (AI Citations) */}
      <GEOPowerhouse />

      {/* 2026 Engagement: Daily Authority (Recent Articles) */}
      <BlogSection />

      {/* 2026 GEO: Conversational Solution Engine */}
      <VoiceFAQ />

      {/* DARK SECTION 4: Contact */}
      <section id="contact" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: '#020c1b' }}>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(120px)' }} />
        <ContactForm />
      </section>
    </main>
  );
};

export default LandingPage;
