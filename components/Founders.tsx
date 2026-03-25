import React from 'react';
import { motion } from 'framer-motion';

const Founders: React.FC = () => {
    const founders = [
        {
            name: "Tarunjit Biswas",
            role: "Founder, CEO & CTO",
            image: "/founder_tarunjit.jpg",
            initials: "TB",
            quote: "I love building tools that actually help people. Our goal is to give every small business in India the power of simple, smart AI.",
            specialties: ["Building AI Tools", "Business Strategy", "Expert Coding"],
            accentColor: "#0000ff",
            socials: [
                { platform: "LinkedIn", url: "https://www.linkedin.com/in/tarunjit-biswas-a5248131b/" },
                { platform: "YouTube", url: "https://www.youtube.com/@Confluxai-z9o" }
            ],
            delay: 0.15
        },
        {
            name: "Shouvik Majumdar",
            role: "Co-Founder, CFO & CMO",
            image: "/founder_shouvik.jpg",
            initials: "SM",
            quote: "We believe great tech should be easy for everyone to use. We build systems that help you grow and make your work easier every day.",
            specialties: ["Getting You More Sales", "Planning for Growth", "Marketing Expert"],
            accentColor: "#0f172a",
            socials: [
                { platform: "LinkedIn", url: "https://www.linkedin.com/in/shoubhik-majumdar-1a77032a1/" },
                { platform: "YouTube", url: "https://www.youtube.com/@Confluxai-z9o" }
            ],
            delay: 0.3
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0">
            {/* Header */}
            <div className="text-center mb-14 md:mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="section-tag justify-center mb-4"
                >
                    Leadership
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="font-inter text-3xl md:text-5xl font-black mb-3 uppercase tracking-tight"
                    style={{ color: '#0f172a' }}
                >
                    The <span className="text-gradient">Builders</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-sm max-w-md mx-auto"
                    style={{ color: '#64748b' }}
                >
                    Two builders with one mission — to make AI automation accessible to every business.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {founders.map((founder, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: founder.delay }}
                        className="group relative"
                    >
                        <div
                            className="relative h-full p-7 md:p-9 rounded-2xl overflow-hidden flex flex-col transition-all duration-500"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                                border: `1px solid rgba(0,0,255,0.4)`,
                                boxShadow: '0 12px 40px rgba(0,0,255,0.12)'
                            }}
                        >
                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                                style={{ background: `linear-gradient(135deg, ${founder.accentColor}05 0%, transparent 60%)`, border: `1px solid ${founder.accentColor}15` }}
                            />

                            {/* Corner accents */}
                            <div className="absolute top-0 right-0 w-14 h-14 rounded-tr-2xl opacity-20" style={{ borderTop: `1px solid ${founder.accentColor}`, borderRight: `1px solid ${founder.accentColor}` }} />
                            <div className="absolute bottom-0 left-0 w-14 h-14 rounded-bl-2xl opacity-20" style={{ borderBottom: `1px solid ${founder.accentColor}`, borderLeft: `1px solid ${founder.accentColor}` }} />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Profile Image */}
                                <div
                                    className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden mb-6 flex-shrink-0 transition-all duration-500 group-hover:scale-105"
                                    style={{
                                        border: `2px solid ${founder.accentColor}20`,
                                        boxShadow: `0 0 24px ${founder.accentColor}15`,
                                    }}
                                >
                                    <img
                                        src={founder.image}
                                        alt={founder.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback initials avatar
                                            const div = e.currentTarget.parentElement;
                                            if (div) {
                                                e.currentTarget.style.display = 'none';
                                                div.style.background = `linear-gradient(135deg, ${founder.accentColor}10, ${founder.accentColor}30)`;
                                                div.style.display = 'flex';
                                                div.style.alignItems = 'center';
                                                div.style.justifyContent = 'center';
                                                div.innerHTML = `<span style="font-family:Inter,sans-serif;font-size:2rem;font-weight:900;color:${founder.accentColor}">${founder.initials}</span>`;
                                            }
                                        }}
                                    />
                                </div>

                                {/* Name & Role */}
                                <h3 className="font-inter text-xl md:text-2xl font-black tracking-tight mb-1" style={{ color: '#0f172a' }}>
                                    {founder.name}
                                </h3>
                                <p className="font-inter text-[11px] font-bold tracking-widest uppercase mb-6" style={{ color: founder.accentColor }}>
                                    {founder.role}
                                </p>

                                {/* Quote */}
                                <div className="mb-7 px-2">
                                    <p className="text-sm leading-relaxed italic" style={{ color: '#475569' }}>
                                        "{founder.quote}"
                                    </p>
                                </div>

                                {/* Specialties */}
                                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                                    {founder.specialties.map((s, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-[10px] font-medium"
                                            style={{
                                                background: `${founder.accentColor}08`,
                                                border: `1px solid ${founder.accentColor}15`,
                                                color: founder.accentColor
                                            }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                {/* Social Links with rel="me" for Entity Authority */}
                                <div className="flex gap-4 mt-6">
                                    {founder.socials.map((social, i) => (
                                        <a 
                                            key={i} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer me"
                                            className="text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
                                            style={{ color: '#64748b' }}
                                        >
                                            {social.platform}
                                        </a>
                                    ))}
                                </div>

                                {/* 2026 GEO: Entity Link */}
                                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Knowledge Graph Signal</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Founders;
