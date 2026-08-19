import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, Sparkles, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, Category } from '../types';
import api from '../services/api';

import { MAIN_CATEGORIES } from '../data/categoriesData';

export const RetailShop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const selectedCat = searchParams.get('category') || '';
  const searchVal = searchParams.get('search') || '';
  const purityVal = searchParams.get('purity') || '';
  const sortByVal = searchParams.get('sortBy') || 'created_at_desc';

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      try {
        let url = `/products?product_type=RETAIL`;
        if (selectedCat) url += `&category_slug=${selectedCat}`;
        if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
        if (purityVal) url += `&purity=${encodeURIComponent(purityVal)}`;
        if (sortByVal) url += `&sort_by=${sortByVal}`;

        const prodRes = await api.get(url);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [searchParams, selectedCat, searchVal, purityVal, sortByVal]);

  const updateFilter = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#202020]">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B9A77A] font-bold">
          RETAIL STOREFRONT
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#202020]">
          Fine Silver Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] font-sans">
          Select any of our 10 main categories below to view all subcategories and NABL-hallmarked products.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xs">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-[#202020] text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Filter className="w-4 h-4 text-[#B9A77A]" />
            10 Categories
          </button>
          <span className="text-xs text-[#666666] font-semibold">
            Showing <strong className="text-[#202020]">{products.length}</strong> Silver Products
          </span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-[#666666] font-semibold uppercase tracking-wider">Sort By:</span>
          <select 
            value={sortByVal}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
          >
            <option value="created_at_desc">Latest Additions</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="weight_asc">Weight: Low to High</option>
            <option value="weight_desc">Weight: High to Low</option>
          </select>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters: 10 Main Categories */}
        <div className="hidden lg:block space-y-6 bg-white border border-[#E6E1DA] rounded-2xl p-6 h-fit sticky top-24 shadow-xs">
          
          <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1918]">10 Main Categories</h3>
          </div>

          {/* 10 Main Categories List */}
          <div className="space-y-1.5">
            {MAIN_CATEGORIES.map((cat) => (
              <Link 
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="w-full flex items-center justify-between text-left py-2 px-3 rounded-xl hover:bg-[#1A1918] hover:text-white transition-all group font-semibold text-xs text-[#1A1918]"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-[#C5A059] group-hover:text-white font-bold">
                  {cat.subcategories.length} Subs &rarr;
                </span>
              </Link>
            ))}
          </div>

          {/* Purity Filter */}
          <div className="space-y-2 pt-4 border-t border-[#E6E1DA]">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Silver Purity</h4>
            <div className="space-y-1 text-xs">
              <button 
                onClick={() => updateFilter('purity', '')}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${!purityVal ? 'bg-[#1A1918] text-white font-bold' : 'hover:bg-[#FAF9F5]'}`}
              >
                All Purities
              </button>
              <button 
                onClick={() => updateFilter('purity', '925 Sterling Silver')}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${purityVal === '925 Sterling Silver' ? 'bg-[#1A1918] text-white font-bold' : 'hover:bg-[#FAF9F5]'}`}
              >
                925 Sterling Silver
              </button>
              <button 
                onClick={() => updateFilter('purity', '999 Fine Silver')}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${purityVal === '999 Fine Silver' ? 'bg-[#1A1918] text-white font-bold' : 'hover:bg-[#FAF9F5]'}`}
              >
                999 Fine Silver
              </button>
            </div>
          </div>

        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 border border-[#E6E1DA]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E1DA] space-y-4">
              <Sparkles className="w-12 h-12 text-[#C5A059] mx-auto" />
              <h3 className="font-serif text-2xl font-bold">No Products Found</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="px-6 py-2.5 bg-[#1A1918] text-white rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onQuickView={(prod) => setSelectedProduct(prod)} 
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Categories Slide-over */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1918]">10 Main Categories</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                {MAIN_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full flex items-center justify-between text-left py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#1A1918] hover:text-white transition-all font-semibold text-xs text-[#1A1918]"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-[#C5A059] font-bold">
                      {cat.subcategories.length} Subs &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-[#1A1918] text-white py-3 rounded-xl text-xs uppercase font-bold tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

    </div>
  );
};
