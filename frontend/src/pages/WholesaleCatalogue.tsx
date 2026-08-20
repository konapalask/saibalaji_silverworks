import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { MAIN_CATEGORIES } from '../data/categoriesData';
import { useWholesale } from '../context/WholesaleContext';
import { useCart } from '../context/CartContext';

export const WholesaleCatalogue: React.FC = () => {
  const { wholesaleCount } = useWholesale();
  const { totalQuantity, setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#202020]">
      
      {/* Header Banner */}
      <div className="bg-white text-[#202020] rounded-3xl p-8 sm:p-12 mb-12 border border-[#E5E0D8] relative overflow-hidden product-shadow">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="bg-[#B9A77A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            B2B WHOLESALE PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light leading-tight text-[#202020]">
            Direct Silver Manufacturing & Bulk Quotes
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] font-sans leading-relaxed">
            Select any of our 10 main categories below to view all subcategories and add products to your wholesale quotation request.
          </p>
          {wholesaleCount > 0 && (
            <div className="pt-2 flex items-center gap-4">
              <Link 
                to="/wholesale/request" 
                className="bg-[#202020] text-white hover:bg-[#B9A77A] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-[#B9A77A]" />
                <span>View Wholesale Request List ({wholesaleCount} Items)</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 10 Main Categories Showcase Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.35em] text-[#B9A77A] font-bold">
            B2B WHOLESALE CATEGORIES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#202020]">
            10 Main Silver Categories
          </h2>
          <p className="text-xs text-[#666666] font-sans">
            Click on any category to view its subcategories and bulk ordering options.
          </p>
        </div>

        {/* 10 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden product-card-hover flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-[#FAF8F5] overflow-hidden p-2">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-4 left-4 bg-white/95 text-[#202020] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#E5E0D8]">
                  {cat.subcategories.length} Subcategories
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202020] group-hover:text-[#B9A77A] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-2 mt-1 font-sans leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs font-semibold text-[#202020] group-hover:text-[#B9A77A]">
                  <span>Explore Subcategories</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B9A77A]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Bottom Action Bar for Cart */}
      {(totalQuantity > 0 || wholesaleCount > 0) && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#1A1918] text-[#FAF9F5] p-4 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center gap-4">
          <div>
            <p className="text-xs font-bold">{totalQuantity || wholesaleCount} Items Selected</p>
            <p className="text-[10px] text-gray-400">Items ready in your cart</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#C5A059] text-[#1A1918] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>VIEW CART</span>
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
