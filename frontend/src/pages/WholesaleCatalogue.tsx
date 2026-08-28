import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles, ShoppingBag, Play, Video, Search, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { Product, CompanyVideo } from '../types';
import api from '../services/api';
import { MAIN_CATEGORIES } from '../data/categoriesData';
import { initialVideosData } from '../data/videosData';
import { useWholesale } from '../context/WholesaleContext';
import { useCart } from '../context/CartContext';

export const WholesaleCatalogue: React.FC = () => {
  const { wholesaleCount } = useWholesale();
  const { totalQuantity, setIsCartOpen } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const factoryVideos = initialVideosData.slice(4, 8); // 4 factory reels

  // Filters State
  const selectedCat = searchParams.get('category') || '';
  const subCatVal = searchParams.get('subcategory') || '';
  const searchVal = searchParams.get('search') || '';
  const purityVal = searchParams.get('purity') || '';
  const priceRangeVal = searchParams.get('priceRange') || '';
  const weightVal = searchParams.get('weight') || '';
  const sortByVal = searchParams.get('sortBy') || 'created_at_desc';

  // Dynamic available subcategories
  const availableSubcategories = useMemo(() => {
    const subsSet = new Set<string>();
    
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

  // Fetch Wholesale Products
  useEffect(() => {
    const fetchWholesaleData = async () => {
      setLoading(true);
      try {
        let url = `/products?product_type=WHOLESALE`;
        if (selectedCat) url += `&category_slug=${selectedCat}`;
        if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
        if (purityVal) url += `&purity=${encodeURIComponent(purityVal)}`;
        if (sortByVal) url += `&sort_by=${sortByVal}`;

        let prodRes = await api.get(url);
        let data: Product[] = Array.isArray(prodRes.data) ? prodRes.data : [];

        // If specific WHOLESALE query returned no results, fetch all products as fallback
        if (data.length === 0) {
          let fallbackUrl = `/products?limit=200`;
          if (selectedCat) fallbackUrl += `&category_slug=${selectedCat}`;
          if (searchVal) fallbackUrl += `&search=${encodeURIComponent(searchVal)}`;
          if (purityVal) fallbackUrl += `&purity=${encodeURIComponent(purityVal)}`;
          if (sortByVal) fallbackUrl += `&sort_by=${sortByVal}`;
          const fallbackRes = await api.get(fallbackUrl);
          data = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
        }

        // Client-side subcategory filter
        if (subCatVal) {
          const target = subCatVal.toLowerCase().trim();
          data = data.filter(p => {
            if (!p.subcategory) return false;
            const sub = p.subcategory.toLowerCase().trim();
            return sub === target || sub.includes(target) || target.includes(sub);
          });
        }

        // Client-side price filter
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

        // Client-side weight filter
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
        console.error('Error fetching wholesale products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWholesaleData();
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

  const openVideo = (vid: CompanyVideo) => {
    setActiveVideo(vid);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-[#202020]">
      
      {/* Header Banner */}
      <div className="bg-white text-[#202020] rounded-3xl p-8 sm:p-12 border border-[#E5E0D8] relative overflow-hidden product-shadow">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="bg-[#B9A77A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            B2B WHOLESALE PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light leading-tight text-[#202020]">
            Direct Silver Manufacturing & Bulk Quotes
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] font-sans leading-relaxed">
            Browse our certified 999 pure & 925 sterling silver wholesale collection. Filter by category, subcategory, price, weight, or purity to add items directly to your B2B quotation request.
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

      {/* Top Filter Bar Panel (Matching Retail Filter UI) */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-xs space-y-4">
        
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
              placeholder="Search wholesale products..."
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
            Showing <strong className="text-[#202020] font-bold">{products.length}</strong> Wholesale Products
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

      {/* Wholesale Product Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isWholesaleOnly={true}
                onQuickView={(prod) => setSelectedProduct(prod)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* 10 Main Categories Showcase Grid */}
      <div className="space-y-8 pt-6 border-t border-[#E5E0D8]">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.35em] text-[#B9A77A] font-bold">
            EXPLORE BY CATEGORY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#202020]">
            Main Silver Categories
          </h2>
          <p className="text-xs text-[#666666] font-sans">
            Click on any category to view its subcategories and dedicated catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden product-card-hover flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-black overflow-hidden p-2">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 bg-black"
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

      {/* B2B Factory Manufacturing Video Reels */}
      <div className="bg-white rounded-3xl p-8 border border-[#E5E0D8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#B9A77A]/10 text-[#B9A77A] rounded-lg">
                <Video className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B9A77A]">
                FACTORY REELS
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#202020] mt-1">
              Live Tenali Plant Operations
            </h3>
          </div>
          <Link
            to="/about#video-archive"
            className="text-xs font-bold text-[#B9A77A] hover:underline flex items-center gap-1"
          >
            <span>View All 171 Process Videos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {factoryVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => openVideo(vid)}
              className="group relative bg-black rounded-2xl overflow-hidden aspect-16/10 border border-[#E5E0D8] shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-3"
            >
              <video
                src={vid.video_url}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                muted
                loop
                playsInline
                autoPlay
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-0.5 bg-black/60 text-[#B9A77A] text-[9px] font-bold uppercase tracking-wider rounded">
                  {vid.category}
                </span>
                <span className="px-1.5 py-0.5 bg-white/20 text-white text-[9px] font-mono rounded">
                  MUTED
                </span>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#B9A77A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <h4 className="font-serif text-xs font-bold text-white line-clamp-1">
                  {vid.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {/* Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={activeVideo.video_url}
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}

      {/* Floating Bottom Action Bar for Cart */}
      {(totalQuantity > 0 || wholesaleCount > 0) && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#1A1918] text-[#FAF9F5] p-4 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center gap-4">
          <div>
            <p className="text-xs font-bold">{wholesaleCount || totalQuantity} Items Selected</p>
            <p className="text-[10px] text-gray-400">Items ready in your wholesale request</p>
          </div>
          <Link 
            to="/wholesale/request"
            className="bg-[#C5A059] text-[#1A1918] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>VIEW REQUEST LIST</span>
            <Briefcase className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};
