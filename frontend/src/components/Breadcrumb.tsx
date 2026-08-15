import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-gray-500 font-sans tracking-wide py-3 overflow-x-auto whitespace-nowrap scrollbar-none">
      <Link 
        to="/home" 
        className="flex items-center gap-1 hover:text-[#C5A059] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            {item.url && !isLast ? (
              <Link 
                to={item.url} 
                className="hover:text-[#C5A059] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold ${isLast ? 'text-[#1A1918]' : 'text-gray-600'}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
