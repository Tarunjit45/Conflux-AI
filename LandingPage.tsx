import React from 'react';
import Hero from './components/Hero.tsx';
import Reviews from './components/Reviews.tsx';
import ContactForm from './components/ContactForm.tsx';
import VideoTrust from './components/VideoTrust.tsx';
import QuickServices from './components/QuickServices.tsx';
import Projects from './components/Projects.tsx';
import TrustEngine from './components/TrustEngine.tsx';

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

      {/* SECTION 7: Streamlined Direct Contact & Enquiry Form */}
      <section id="contact" className="py-20 px-4 sm:px-6 md:px-12 lg:px-24 relative bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Let's Build Together
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-orbitron text-slate-900 tracking-tight">
              Start Your AI Project
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-2 max-w-md mx-auto">
              Send us your project details. We deliver custom architecture proposals within 24 hours.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
