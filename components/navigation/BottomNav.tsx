import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Building2, User } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface NavTab {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
}

const NAV_TABS: NavTab[] = [
  {
    id: 'discover',
    name: 'Discover',
    path: '/discover',
    icon: Search
  },
  {
    id: 'locations',
    name: 'Locations',
    path: '/locations',
    icon: MapPin
  },
  {
    id: 'business',
    name: 'For Business',
    path: '/business',
    icon: Building2
  },
  {
    id: 'account',
    name: 'Account',
    path: '/login',
    icon: User
  }
];

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { user, role } = useAuth();

  // Hide on admin routes and business profile pages (where profile's sticky contact bar takes precedence)
  const isBusinessDetail = pathname.startsWith('/business/') && pathname !== '/business' && pathname !== '/business/audit';
  if (pathname.startsWith('/admin') || isBusinessDetail) {
    return null;
  }

  const isTabActive = (tab: NavTab) => {
    if (tab.id === 'discover') {
      return pathname === '/discover' || pathname === '/';
    }
    if (tab.id === 'locations') {
      return pathname.startsWith('/locations');
    }
    if (tab.id === 'business') {
      return pathname === '/business' || pathname === '/list-business';
    }
    if (tab.id === 'account') {
      return pathname === '/login' || pathname === '/auth' || pathname.startsWith('/admin');
    }
    return pathname === tab.path;
  };

  const getTargetTabPath = (tab: NavTab) => {
    if (tab.id === 'account' && user && role === 'ADMIN') {
      return '/admin/businesses';
    }
    return tab.path;
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] transition-transform duration-200"
    >
      <div className="grid grid-cols-4 h-14 items-stretch px-1">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab);
          return (
            <Link
              key={tab.id}
              to={getTargetTabPath(tab)}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 rounded-xl transition-all select-none active:scale-95 ${
                active
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                  active ? 'bg-blue-50 text-blue-600' : 'text-slate-500'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span className="text-[11px] font-inter tracking-tight leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
