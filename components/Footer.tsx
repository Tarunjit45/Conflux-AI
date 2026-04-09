
import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Facebook, Instagram, Linkedin, Twitter, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC<{ siteLogo: string | null }> = ({ siteLogo }) => {
  const navyColor = "#000080";

  const footerSections = [
    {
      title: "Solutions",
      links: [
        { name: "AI Infrastructure", path: "/solutions" },
        { name: "Creative Suite", path: "/creative" },
        { name: "AI Core Engine", path: "/solutions" },
        { name: "Semantic Mapping", path: "/semantic-map" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Our Impact", path: "/impact" },
        { name: "Case Studies", path: "/portfolio" },
        { name: "Network Blog", path: "/blog" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "FAQ & Support", path: "/faq" },
        { name: "Authority Signals", path: "/authority" },
        { name: "Client Access", path: "/#contact" },
        { name: "Privacy Policy", path: "#" },
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
    <footer className="pt-24 pb-12 px-6 md:px-12 lg:px-24 bg-[#020c1b] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="mb-8">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto mb-6" />
              ) : (
                <span className="font-inter font-black text-2xl tracking-tighter uppercase">
                  CONFLUX<span className="text-blue-500">AI</span>
                </span>
              )}
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mt-6">
                Pioneering the next generation of AI automation and semantic search optimization. We build the infrastructure that makes your business "Recommended" by the world's most advanced AI models.
              </p>
            </div>
            
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i} className="lg:col-span-2">
              <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-500">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      to={link.path} 
                      className="text-slate-400 hover:text-white text-sm font-medium transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-500">
              Connect
            </h4>
            <div className="space-y-4 text-sm text-slate-400 font-medium">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-blue-500 mt-1" />
                <a href="mailto:confluxdotai@gmail.com" className="hover:text-white transition-colors">confluxdotai@gmail.com</a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-500 mt-1" />
                <span>Kolkata, West Bengal, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            © {new Date().getFullYear()} CONFLUXAI.IN. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

