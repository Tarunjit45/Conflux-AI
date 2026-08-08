import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Layers, Play, CheckCircle2 } from 'lucide-react';

const projectsList = [
  {
    id: "aura-fashion",
    title: "Aura Fashion",
    category: "Fashion & E-Commerce",
    url: "https://aura-fasion.vercel.app/",
    type: "video",
    video: "/works/aura/aura.mp4",
    summary: "Visually stunning luxury storefront engineered for high-resolution product showcases, fluid animations, and sub-second checkout.",
    tags: ["React 18", "Tailwind CSS", "Framer Motion", "High Conversion"]
  },
  {
    id: "vintage-phi",
    title: "Vintage Phi",
    category: "Salon & Reservation Platform",
    url: "https://vintage-phi.vercel.app/",
    type: "gallery",
    images: [
      "/works/vintage-phi/vintage_phi_1.png",
      "/works/vintage-phi/vintage_phi_2.png",
      "/works/vintage-phi/vintage_phi_3.png",
      "/works/vintage-phi/vintage_phi_4.png",
      "/works/vintage-phi/vintage_phi_5.png"
    ],
    summary: "A premium reservation interface and digital brand system built for elite beauty & wellness salons.",
    tags: ["Booking System", "Vite Architecture", "Responsive UX", "Brand Platform"]
  },
  {
    id: "aurum-wine",
    title: "Aurum Wine",
    category: "Hospitality & Dining Architecture",
    url: "https://aurum-wine.vercel.app/",
    type: "video",
    video: "/works/aurum/aurum.mp4",
    summary: "Dynamic menu architecture and immersive brand storytelling platform for high-end culinary & wine hospitality venues.",
    tags: ["Interactive Menu", "Fluid UI", "High Performance", "Custom Styling"]
  },
  {
    id: "alert-ahead",
    title: "Alert Ahead",
    category: "Enterprise Headless Commerce",
    url: "https://alert-ahead.vercel.app/",
    type: "image",
    image: "/images/website-development/website-development_2.jpg",
    summary: "High-velocity headless commerce platform built for rapid scaling and multi-inventory product management.",
    tags: ["Headless E-Commerce", "API Driven", "Vercel Edge", "Custom UI"]
  }
];

const VintagePhiGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
        <img 
          src={images[activeIdx]} 
          alt={`Vintage Phi Preview ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
          Screenshot {activeIdx + 1} of {images.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
              activeIdx === i ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto font-inter">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-orbitron text-slate-900 tracking-tight">
          Selected Client <span className="text-blue-600">Work</span>
        </h2>
        <p className="text-slate-600 text-sm md:text-base mt-2 max-w-md mx-auto font-normal">
          Real live projects, auto-playing video demos, and visual platform implementations built by Conflux AI.
        </p>
      </div>

      {/* Alternating Project Blocks */}
      <div className="space-y-16">
        {projectsList.map((project, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center p-6 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50"
            >
              {/* Media Column (Video, Gallery, or Image) */}
              <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                {project.type === 'video' && project.video && (
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
                    <video
                      src={project.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                      <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
                      Live Screen Demo
                    </div>
                  </div>
                )}

                {project.type === 'gallery' && project.images && (
                  <VintagePhiGallery images={project.images} />
                )}

                {project.type === 'image' && project.image && (
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md group">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Short Text Summary Column */}
              <div className={`lg:col-span-5 space-y-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider inline-block mb-3">
                    {project.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    {project.title}
                  </h3>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {project.summary}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Live Link Button */}
                <div className="pt-2">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>Visit Live Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
