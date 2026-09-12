import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, BookOpen, User, Building2, LogOut, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

interface NavbarProps {
  customLogo?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ customLogo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Discover', path: '/discover' },
    { name: 'Locations', path: '/locations' },
    { name: 'For Businesses', path: '/business' }
  ];

  const primaryBlue = "#1d4ed8";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer no-underline"
        >
          {customLogo ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
              <img src={customLogo} alt="Conflux" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
                <Shield size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-inter font-extrabold text-base tracking-tight text-slate-900">
                  CONFLUX
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-wide -mt-1 hidden sm:block">
                  Trust &amp; Local Discovery
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-colors ${
                pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Actions: List Business + Sign In */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/list-business"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Building2 size={15} />
            <span>List Business</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {role === 'ADMIN' ? (
                <Link
                  to="/admin/businesses"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-black text-white transition-all shadow-sm"
                  title="Admin Console"
                >
                  <Shield size={13} className="text-blue-400" />
                  <span className="max-w-[100px] truncate">{user.fullName || user.email.split('@')[0]}</span>
                  <span className="text-[10px] font-mono text-blue-300 bg-slate-800 px-1 py-0.5 rounded">ADMIN</span>
                </Link>
              ) : (
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                  {user.fullName || user.email.split('@')[0]}
                </span>
              )}
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <User size={15} className="text-slate-500" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-[90] bg-white border-b border-slate-200 shadow-xl p-6 md:hidden flex flex-col gap-4 font-inter"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold py-2.5 px-3 rounded-xl transition-colors ${
                    pathname === item.path ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/list-business"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl text-center font-semibold text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Building2 size={16} />
                <span>List a Business Free</span>
              </Link>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl text-center font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <User size={16} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;