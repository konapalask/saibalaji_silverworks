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
  const subCatVal = searchParams.get('subcategory') || '';
  const searchVal = searchParams.get('search') || '';
  const purityVal = searchParams.get('purity') || '';
  const priceRangeVal = searchParams.get('priceRange') || '';
  const weightVal = searchParams.get('weight') || '';
  const sortByVal = searchParams.get('sortBy') || 'created_at_desc';

  // Compute available subcategories dynamically from products and category definitions
  const availableSubcategories = React.useMemo(() => {
    const subsSet = new Set<string>();
    
    // First gather from MAIN_CATEGORIES
    if (selectedCat) {
      const catObj = MAIN_CATEGORIES.find(c => c.slug === selectedCat);
      if (catObj) {
        catObj.subcategories.forEach(s => subsSet.add(s.name));
      }
    } else {
      MAIN_CATEGORIES.forEach(cat => {
        cat.subcategories.forEach(sub => subsSet.add(sub.name));
      });
    }

    // Also include subcategories directly present on loaded products
    products.forEach(p => {
      if (p.subcategory && p.subcategory.trim()) {
        subsSet.add(p.subcategory.trim());
      }
    });

    return Array.from(subsSet).sort().map((name, idx) => ({
      id: `sub-${idx}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
  }, [selectedCat, products]);

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
        let data: Product[] = Array.isArray(prodRes.data) ? prodRes.data : [];

        // Client-side filtering for subcategory (case-insensitive)
        if (subCatVal) {
          const target = subCatVal.toLowerCase().trim();
          data = data.filter(p => {
            if (!p.subcategory) return false;
            const sub = p.subcategory.toLowerCase().trim();
            return sub === target || sub.includes(target) || target.includes(sub);
          });
        }

        // Client-side filtering for price and weight
        if (priceRangeVal) {
          data = data.filter(p => {
            const price = p.retail_price;
            if (priceRangeVal === 'under-1000') return price < 1000;
            if (priceRangeVal === '1000-5000') return price >= 1000 && price <= 5000;
            if (priceRangeVal === '5000-10000') return price >= 5000 && price <= 10000;
            if (priceRangeVal === '10000-25000') return price >= 10000 && price <= 25000;
            if (priceRangeVal === '25000-plus') return price > 25000;
            return true;
          });
        }

        if (weightVal) {
          data = data.filter(p => {
            const w = p.weight_g;
            if (weightVal === 'under-5') return w < 5;
            if (weightVal === '5-10') return w >= 5 && w <= 10;
            if (weightVal === '10-25') return w >= 10 && w <= 25;
            if (weightVal === '25-50') return w >= 25 && w <= 50;
            if (weightVal === '50-100') return w >= 50 && w <= 100;
            if (weightVal === '100-plus') return w > 100;
            return true;
          });
        }

        setProducts(data);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [searchParams, selectedCat, subCatVal, searchVal, purityVal, priceRangeVal, weightVal, sortByVal]);

  const updateFilter = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(selectedCat || subCatVal || searchVal || purityVal || priceRangeVal || weightVal);

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#202020]">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B9A77A] font-bold">
          RETAIL STOREFRONT
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#202020]">
          Fine Silver Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] font-sans">
          Browse our certified NABL-hallmarked 999 pure and 925 sterling silver collections.
        </p>
      </div>

      {/* Top Filter Bar Panel */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 mb-8 shadow-xs space-y-4">
        
        {/* Category Quick Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-[#F0ECE4]">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              !selectedCat
                ? 'bg-[#202020] text-white shadow-2xs'
                : 'bg-[#F8F6F1] text-[#666666] hover:bg-[#E5E0D8] border border-[#E5E0D8]'
            }`}
          >
            All Categories
          </button>
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCat === cat.slug
                  ? 'bg-[#202020] text-white shadow-2xs font-bold'
                  : 'bg-[#F8F6F1] text-[#666666] hover:bg-[#E5E0D8] border border-[#E5E0D8]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search Bar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-center">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#B9A77A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search silver products..."
              value={searchVal}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            />
            {searchVal && (
              <button 
                onClick={() => updateFilter('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subcategory Filter */}
          <div>
            <select
              value={subCatVal}
              onChange={(e) => updateFilter('subcategory', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            >
              <option value="">Subcategory: All</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id || sub.slug} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={priceRangeVal}
              onChange={(e) => updateFilter('priceRange', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            >
              <option value="">Price: All</option>
              <option value="under-1000">Under ₹1,000</option>
              <option value="1000-5000">₹1,000 – ₹5,000</option>
              <option value="5000-10000">₹5,000 – ₹10,000</option>
              <option value="10000-25000">₹10,000 – ₹25,000</option>
              <option value="25000-plus">₹25,000+</option>
            </select>
          </div>

          {/* Silver Weight Filter */}
          <div>
            <select
              value={weightVal}
              onChange={(e) => updateFilter('weight', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            >
              <option value="">Weight: All</option>
              <option value="under-5">Under 5g</option>
              <option value="5-10">5g – 10g</option>
              <option value="10-25">10g – 25g</option>
              <option value="25-50">25g – 50g</option>
              <option value="50-100">50g – 100g</option>
              <option value="100-plus">100g+</option>
            </select>
          </div>

          {/* Purity Filter */}
          <div>
            <select
              value={purityVal}
              onChange={(e) => updateFilter('purity', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            >
              <option value="">Purity: All</option>
              <option value="999">999 Fine Pure Silver</option>
              <option value="925">925 Sterling Silver</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <select 
              value={sortByVal}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#B9A77A]"
            >
              <option value="created_at_desc">Latest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="weight_asc">Weight: Low to High</option>
              <option value="weight_desc">Weight: High to Low</option>
            </select>
          </div>

        </div>

        {/* Results Counter & Reset Action Bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 text-xs border-t border-[#F0ECE4] gap-2">
          <span className="text-[#666666] font-medium">
            Showing <strong className="text-[#202020] font-bold">{products.length}</strong> Silver Products
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

      </div>

      {/* Main Content Layout — Full Width Product Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4,5,6,7,8].map((i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
