import React from 'react';
import Hero from './components/Hero.tsx';
import Reviews from './components/Reviews.tsx';
import ContactForm from './components/ContactForm.tsx';
import VideoTrust from './components/VideoTrust.tsx';
import QuickServices from './components/QuickServices.tsx';
import Projects from './components/Projects.tsx';
import TrustEngine from './components/TrustEngine.tsx';
import CompanyGlance from './components/CompanyGlance.tsx';

const LandingPage: React.FC = () => {
  return (
    <main className="relative z-10 w-full overflow-hidden bg-white">
      {/* SECTION 1: Clean White Hero with Visual Showcase */}
      <section id="home" className="relative bg-white">
        <Hero />
      </section>

      {/* SECTION 2: Core Visual Services Suite */}
      <QuickServices />

      {/* SECTION 3: Trust & Partner Signals */}
      <section id="trust" className="py-20 bg-white border-b border-slate-100 overflow-hidden">
        <TrustEngine />
      </section>

      {/* SECTION 4: Visual Work & Case Studies Showcase */}
      <section id="portfolio-preview" className="py-20 bg-slate-50 border-b border-slate-200 px-4 md:px-6">
        <Projects />
      </section>

      {/* SECTION 5: Video Action Showcase */}
      <div className="bg-white border-b border-slate-100">
        <VideoTrust />
      </div>

      {/* SECTION 6: Customer Reviews */}
      <section id="reviews" className="py-20 px-4 sm:px-6 md:px-12 lg:px-24 relative bg-slate-50 border-b border-slate-200">
        <Reviews />
      </section>

      {/* SECTION 7: Conflux AI at a Glance */}
      <section className="bg-slate-950 py-6 border-b border-slate-900">
        <CompanyGlance />
      </section>

      {/* SECTION 8: Streamlined Direct Contact & Enquiry Form */}
      <section id="contact" className="py-20 px-4 sm:px-6 md:px-12 lg:px-24 relative bg-slate-50 border-t border-slate-200">
        <ContactForm />
      </section>
    </main>
  );
};

export default LandingPage;
