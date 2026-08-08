import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Layers } from 'lucide-react';

const Projects: React.FC = () => {
    const projects = [
        {
            title: "Vintage Phi",
            category: "Salon Interface",
            url: "https://vintage-phi.vercel.app/",
            image: "/images/website-development/website-development_1.jpg",
            description: "A premium, high-conversion reservation and branding platform engineered for elite salons.",
            delay: 0.1
        },
        {
            title: "Alert Ahead",
            category: "Enterprise Ecommerce",
            url: "https://alert-ahead.vercel.app/",
            image: "/images/website-development/website-development_2.jpg",
            description: "A high-velocity headless commerce system built for rapid scaling and complex inventory matrices.",
            delay: 0.2
        },
        {
            title: "Aura Fashion",
            category: "Fashion Retail",
            url: "https://aura-fasion.vercel.app/",
            image: "/images/website-development/website-development_3.jpg",
            description: "Visually stunning storefront optimized for high-resolution product displays and fluid user checkout.",
            delay: 0.3
        },
        {
            title: "Aurum Wine",
            category: "Restaurant & Hospitality",
            url: "https://aurum-wine.vercel.app/",
            image: "/images/website-development/website-development_4.jpg",
            description: "Dynamic menu architecture and immersive brand storytelling for premium culinary experiences.",
            delay: 0.4
        }
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center p-4 rounded-full mb-6 relative overflow-hidden group"
                    style={{ background: 'rgba(0,0,255,0.08)', color: '#0000ff' }}
                >
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Layers size={32} />
                </motion.div>

                <h2 className="font-inter text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight" style={{ color: '#0f172a' }}>
                    OUR RECENT <span className="text-gradient">WORK</span>
                </h2>
                <p className="font-inter text-[11px] md:text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#475569' }}>
                    Successful Sites for Our Clients
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: project.delay }}
                        className="group relative h-full flex flex-col"
                    >
                        {/* Hover Glow Background */}
                        <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                            style={{ background: 'rgba(0,0,255,0.15)' }} />

                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex flex-col h-full p-6 md:p-8 rounded-xl transition-all duration-300 hover:-translate-y-2"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))',
                                border: '1px solid rgba(15,23,42,0.08)',
                                boxShadow: '0 8px 32px rgba(15,23,42,0.04)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,255,0.4)';
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 40px rgba(0,0,255,0.12)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(15,23,42,0.08)';
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(15,23,42,0.04)';
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-[11px] font-inter font-bold tracking-wide uppercase py-1 px-3 rounded-full"
                                    style={{ color: '#0000ff', background: 'rgba(0,0,255,0.08)', border: '1px solid rgba(0,0,255,0.2)' }}>
                                    {project.category}
                                </div>
                                <ExternalLink size={18} className="transition-colors" style={{ color: '#94a3b8' }}
                                />
                            </div>

                            {/* Project Visual Image */}
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-4 border border-slate-200">
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>

                            <h3 className="text-xl font-inter font-black mb-3 transition-colors"
                                style={{ color: '#0f172a' }}
                                onMouseEnter={e => (e.currentTarget as HTMLHeadingElement).style.color = '#0000ff'}
                                onMouseLeave={e => (e.currentTarget as HTMLHeadingElement).style.color = '#0f172a'}
                            >
                                {project.title}
                            </h3>

                            <p className="text-sm font-inter leading-relaxed mb-8 flex-grow" style={{ color: '#475569' }}>
                                {project.description}
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-[11px] font-inter font-bold tracking-wide transition-colors"
                                style={{ color: '#475569' }}
                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.color = '#0000ff'}
                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.color = '#475569'}
                            >
                                <span className="w-4 h-[1px]" style={{ background: 'currentColor' }}></span>
                                VIEW WEBSITE
                            </div>
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
