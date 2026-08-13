import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, Sparkles, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, Category } from '../types';
import api from '../services/api';

export const RetailShop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        let url = `/products?product_type=RETAIL`;
        if (selectedCat) {
          const matchedCat = catRes.data.find((c: Category) => c.slug === selectedCat);
          if (matchedCat) url += `&category_id=${matchedCat.id}`;
        }
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
  }, [searchParams]);

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
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          RETAIL STOREFRONT
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1918]">
          Silver Fine Collection
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Handcrafted 925 sterling silver & 999 fine silver products directly from our manufacturing unit.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-[#1A1918] text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <span className="text-xs text-gray-500 font-semibold">
            Showing {products.length} Silver Creations
          </span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-500 font-semibold">Sort By:</span>
          <select 
            value={sortByVal}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C5A059]"
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
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white border border-[#E6E1DA] rounded-2xl p-6 h-fit sticky top-24">
          
          <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1918]">Filter By</h3>
            {(selectedCat || purityVal || searchVal) && (
              <button 
                onClick={() => setSearchParams({})}
                className="text-[11px] text-[#C5A059] font-bold uppercase hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Category</h4>
            <div className="space-y-1 text-xs">
              <button 
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${!selectedCat ? 'bg-[#1A1918] text-white font-bold' : 'hover:bg-[#FAF9F5]'}`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${selectedCat === c.slug ? 'bg-[#1A1918] text-white font-bold' : 'hover:bg-[#FAF9F5]'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
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

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

    </div>
  );
};
