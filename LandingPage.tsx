
import React from 'react';
import Hero from './components/Hero.tsx';
import Reviews from './components/Reviews.tsx';
import ContactForm from './components/ContactForm.tsx';
import VideoTrust from './components/VideoTrust.tsx';
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



      {/* LIGHT SECTION 4: Reviews */}
      <section id="reviews" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid rgba(15,23,42,0.04)' }}>
        <Reviews />
      </section>
      


      {/* 2026 Engagement: Video Trust Showcase (Watch Us In Action) */}
      <VideoTrust />



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
