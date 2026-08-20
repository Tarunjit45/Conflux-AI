import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../lib/structuredData';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium ${className}`}
    >
      <Link 
        to="/" 
        className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
        title="Conflux AI Home"
      >
        <Home size={13} className="text-slate-400" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-bold truncate max-w-[240px] md:max-w-md" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link 
                to={item.url} 
                className="hover:text-blue-600 transition-colors truncate max-w-[160px]"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
