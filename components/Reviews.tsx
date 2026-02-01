
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const ReviewCard: React.FC<{
  name: string;
  location: string;
  business: string;
  rating: number;
  content: string;
  isFeatured?: boolean;
}> = ({ name, location, business, rating, content, isFeatured }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className={`relative p-6 md:p-8 glass border ${isFeatured ? 'border-blue-500/50 glow-blue bg-blue-500/5' : 'border-white/5'} rounded-2xl flex flex-col h-full transition-all duration-300`}
  >
    <div className="absolute top-6 right-8 text-blue-500/10">
      <Quote size={32} />
    </div>

    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={`${i < rating ? 'text-blue-400 fill-blue-400' : 'text-slate-600'} ${isFeatured && i < rating ? 'drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : ''}`}
        />
      ))}
    </div>

    <p className="text-slate-300 text-sm leading-relaxed mb-6 italic flex-grow">
      "{content}"
    </p>

    <div className="flex items-center gap-4 border-t border-white/5 pt-6">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 flex items-center justify-center font-orbitron text-[9px] md:text-[10px] ${isFeatured ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="min-w-0">
        <h4 className="text-white font-orbitron text-[10px] md:text-xs tracking-wider truncate">{name}</h4>
        <p className="text-blue-400 text-[8px] md:text-[9px] font-orbitron tracking-widest uppercase truncate">{business}</p>
        <div className="flex items-center gap-2 mt-1">
           <span className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest">{location}</span>
           <div className="w-3 h-2 bg-gradient-to-r from-orange-400 via-white to-green-600 rounded-[1px] opacity-70" />
        </div>
      </div>
    </div>
  </motion.div>
);

const Reviews: React.FC = () => {
  const testimonials = [
    {
      name: "Rajesh Varma",
      location: "Surat, Gujarat",
      business: "Varma Silk Mills",
      rating: 5,
      content: "As a small manufacturing unit, managing customer queries on WhatsApp was a nightmare. Conflux AI's autonomous bot handled our entire order tracking automatically. My sales team now focuses only on high-value clients. Best investment this year.",
      isFeatured: false
    },
    {
      name: "Anjali Gupta",
      location: "Jaipur, Rajasthan",
      business: "The Craft Soul",
      rating: 5,
      content: "We were struggling to scale our D2C brand across India. Conflux built a website that loads instantly even on poor mobile networks. Our conversion rates jumped by 150% in the first month. They truly understand the Indian market dynamics.",
      isFeatured: true
    },
    {
      name: "Sandeep Deshmukh",
      location: "Pune, Maharashtra",
      business: "Deshmukh Agro-Tech",
      rating: 5,
      content: "Their Precision Ad Stacks saved our business. We were wasting lakhs on ineffective ads. Conflux optimized our spend using AI, and we reached farmers across 4 states with 40% less cost. Clinical efficiency!",
      isFeatured: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="text-center mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <div className="h-[1px] w-6 md:w-8 bg-blue-500" />
          <span className="font-orbitron text-[8px] md:text-[10px] tracking-[0.4em] text-blue-500 uppercase">Partner Testimonials</span>
          <div className="h-[1px] w-6 md:w-8 bg-blue-500" />
        </motion.div>
        <h2 className="font-orbitron text-2xl md:text-5xl font-black text-white mb-4 md:mb-6">
          PROVEN <span className="text-gradient">IMPACT</span>
        </h2>
        <p className="text-slate-500 text-[10px] md:text-sm max-w-xl mx-auto font-light px-4">
          Real results from Indian MSMEs and growing startups powered by Conflux Infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {testimonials.map((t, i) => (
          <ReviewCard key={i} {...t} />
        ))}
      </div>

      <div className="mt-12 md:mt-20 py-8 md:py-10 border-t border-white/5 flex flex-wrap justify-center gap-8 md:gap-24">
        <div className="text-center">
            <div className="text-white font-orbitron text-base md:text-xl font-bold mb-1">4.9/5</div>
            <div className="text-[7px] md:text-[8px] text-slate-500 tracking-[0.3em] uppercase">Trust Score</div>
        </div>
        <div className="text-center">
            <div className="text-white font-orbitron text-base md:text-xl font-bold mb-1">500+</div>
            <div className="text-[7px] md:text-[8px] text-slate-500 tracking-[0.3em] uppercase">Indian Deployments</div>
        </div>
        <div className="text-center">
            <div className="text-white font-orbitron text-base md:text-xl font-bold mb-1">₹12Cr+</div>
            <div className="text-[7px] md:text-[8px] text-slate-500 tracking-[0.3em] uppercase">Ad Capital Managed</div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;