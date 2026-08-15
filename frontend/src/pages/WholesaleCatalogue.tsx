import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { MAIN_CATEGORIES } from '../data/categoriesData';
import { useWholesale } from '../context/WholesaleContext';

export const WholesaleCatalogue: React.FC = () => {
  const { wholesaleCount } = useWholesale();

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#1A1918]">
      
      {/* Header Banner */}
      <div className="bg-[#1A1918] text-[#FAF9F5] rounded-3xl p-8 sm:p-12 mb-12 border border-[#C5A059]/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="bg-[#C5A059] text-[#1A1918] text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            B2B WHOLESALE PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
            Direct Silver Manufacturing & Bulk Quotes
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
            Select any of our 10 main categories below to view all subcategories and add products to your wholesale quotation request.
          </p>
          {wholesaleCount > 0 && (
            <div className="pt-2 flex items-center gap-4">
              <Link 
                to="/wholesale/request" 
                className="bg-[#C5A059] text-[#1A1918] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>View Wholesale Request List ({wholesaleCount} Items)</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 10 Main Categories Showcase Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold">
            B2B WHOLESALE CATEGORIES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1918]">
            10 Main Silver Categories
          </h2>
          <p className="text-xs text-gray-600 font-sans">
            Click on any category to view its subcategories and bulk ordering options.
          </p>
        </div>

        {/* 10 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-3xl border border-[#E6E1DA] overflow-hidden hover:shadow-2xl hover:border-[#C5A059] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-[#FAF9F5] overflow-hidden">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 bg-[#1A1918]/80 text-[#C5A059] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#C5A059]/40">
                  {cat.subcategories.length} Subcategories
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1A1918] group-hover:text-[#C5A059] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-sans leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E1DA] flex items-center justify-between text-xs font-semibold text-[#1A1918] group-hover:text-[#C5A059]">
                  <span>Explore Subcategories</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      {wholesaleCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#1A1918] text-[#FAF9F5] p-4 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center gap-4">
          <div>
            <p className="text-xs font-bold">{wholesaleCount} Bulk Items Selected</p>
            <p className="text-[10px] text-gray-400">Ready to request formal quotation PDF</p>
          </div>
          <Link 
            to="/wholesale/request"
            className="bg-[#C5A059] text-[#1A1918] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
          >
            <span>Proceed to Request Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};
