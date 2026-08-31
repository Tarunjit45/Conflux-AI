// Conflux Platform — Global Footer

import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Facebook, Instagram, Linkedin, Twitter, ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

const Footer: React.FC<{ siteLogo: string | null }> = ({ siteLogo }) => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Discover Businesses", path: "/discover" },
        { name: "For Businesses", path: "/business" },
        { name: "Visibility Audit", path: "/business/audit" },
        { name: "List Your Business", path: "/list-business" },
        { name: "West Bengal Locations", path: "/locations" }
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "Local Search & Entity Graph", path: "/solutions" },
        { name: "AI Search Readiness (GEO)", path: "/solutions" },
        { name: "Evidence & Trust Badges", path: "/solutions" },
        { name: "WhatsApp Speed-to-Lead", path: "/solutions" },
        { name: "Semantic Knowledge Map", path: "/semantic-map" }
      ]
    },
    {
      title: "Verification",
      links: [
        { name: "Conflux Verify Portal", path: "/verify" },
        { name: "Evidence Methodology", path: "/verify/methodology" },
        { name: "Verify Indian Company", path: "/verify/guides/how-to-verify-indian-company-legal-existence" },
        { name: "Verify GST & Udyam", path: "/verify/guides/how-to-verify-gst-udyam-registration" },
        { name: "Verify ISO Certificate", path: "/verify/guides/how-to-verify-iso-certificate" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Conflux", path: "/about" },
        { name: "Authority Signals", path: "/authority" },
        { name: "Knowledge Blog", path: "/blog" },
        { name: "Social Impact", path: "/impact" },
        { name: "Contact Platform", path: "/contact" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Youtube size={18} />, href: "https://www.youtube.com/@Confluxai-z9o" },
    { icon: <Facebook size={18} />, href: "https://www.facebook.com/share/17dsWzvFYN/" },
    { icon: <Instagram size={18} />, href: "https://www.instagram.com/conflux.ai/" },
    { icon: <Linkedin size={18} />, href: "https://www.linkedin.com/company/conflux-ai/" },
    { icon: <Twitter size={18} />, href: "https://x.com/ConfluxA12947" },
  ];

  return (
    <footer className="pt-24 pb-12 px-6 md:px-12 lg:px-24 bg-[#020c1b] text-white relative overflow-hidden font-inter">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto mb-4" />
              ) : (
                <div className="flex flex-col">
                  <span className="font-inter font-black text-2xl tracking-tight uppercase text-white">
                    CONFLUX<span className="text-blue-500">AI</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Local Visibility &amp; Trust Platform
                  </span>
                </div>
              )}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mt-4">
                Conflux AI makes local businesses discoverable, understandable, trusted, and contactable across Google search, Maps, and AI search engines through evidence-based verification and automated lead conversion.
              </p>
            </div>
            
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} />
              <span>Evidence-First &bull; Zero Fabricated Rankings</span>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i} className="lg:col-span-2 space-y-4">
              <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-blue-400">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      to={link.path}
                      className="text-xs text-slate-400 hover:text-white hover:underline transition-colors flex items-center gap-1 group"
                    >
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="pt-8 pb-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <MapPin size={15} className="text-blue-400 shrink-0" />
            <span>Kolkata, West Bengal 700001, India</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={15} className="text-blue-400 shrink-0" />
            <a href="mailto:confluxai45@gmail.com" className="hover:text-white">confluxai45@gmail.com</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={15} className="text-blue-400 shrink-0" />
            <a href="tel:+919734433100" className="hover:text-white">+91 97344 33100</a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Conflux AI. All rights reserved. Connecting local businesses to verifiable trust and customer demand.
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-200">About</Link>
            <Link to="/business/audit" className="hover:text-slate-200">Visibility Audit</Link>
            <Link to="/verify/methodology" className="hover:text-slate-200">Verification Standards</Link>
            <Link to="/authority" className="hover:text-slate-200">Authority Signals</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
