import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, ArrowUpDown, ChevronDown, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Breadcrumb, BreadcrumbItem } from '../components/Breadcrumb';
import { MAIN_CATEGORIES, getCategoryBySlug, MainCategory } from '../data/categoriesData';
import { useWholesale } from '../context/WholesaleContext';
import { useCart } from '../context/CartContext';
import { ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export const CategoryPage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug?: string; subcategorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { wholesaleCount } = useWholesale();
  const { totalQuantity, setIsCartOpen } = useCart();

  // Selected Category (default to first category if invalid or default route)
  const currentCategory: MainCategory = useMemo(() => {
    if (categorySlug) {
      const found = getCategoryBySlug(categorySlug);
      if (found) return found;
    }
    return MAIN_CATEGORIES[0]; // fallback
  }, [categorySlug]);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedWeightRange, setSelectedWeightRange] = useState<string>('all');
  const [availability, setAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync subcategory from URL params or subcategorySlug route parameter
  useEffect(() => {
    if (subcategorySlug) {
      // Find matching subcategory name from current category
      const matchedSub = currentCategory.subcategories.find(s => s.slug === subcategorySlug);
      if (matchedSub) {
        setSelectedSubcategories([matchedSub.name]);
      }
    } else {
      const subFromQuery = searchParams.get('subcategory');
      if (subFromQuery) {
        setSelectedSubcategories(subFromQuery.split(','));
      } else {
        setSelectedSubcategories([]);
      }
    }
  }, [categorySlug, subcategorySlug, currentCategory, searchParams]);

  // Fetch Products Data from Backend API (with fallback mock filtering if backend API fails)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/products', {
          params: {
            category_slug: currentCategory.slug,
            sort_by: sortBy,
            limit: 200
          }
        });
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('API error, relying on category products', err);
        // Retry without category_slug filter or fallback
        try {
          const res = await api.get('/products');
          if (Array.isArray(res.data)) {
            setProducts(res.data);
          }
        } catch (e) {
          setError('Failed to load products. Please check server connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory.slug, sortBy]);

  // Filter Products Dynamically
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter (ensure product belongs to current category)
      if (product.category && product.category.slug !== currentCategory.slug) {
        // Soft match if category_id matches or slug matches
      }

      // 2. Subcategory Filter
      if (selectedSubcategories.length > 0) {
        if (!product.subcategory) return false;
        const matched = selectedSubcategories.some(
          sub => sub.toLowerCase().trim() === product.subcategory?.toLowerCase().trim()
        );
        if (!matched) return false;
      }

      // 3. Price Filter
      const price = product.retail_price;
      if (selectedPriceRange === 'under-1000' && price >= 1000) return false;
      if (selectedPriceRange === '1000-5000' && (price < 1000 || price > 5000)) return false;
      if (selectedPriceRange === '5000-10000' && (price < 5000 || price > 10000)) return false;
      if (selectedPriceRange === '10000-25000' && (price < 10000 || price > 25000)) return false;
      if (selectedPriceRange === '25000-plus' && price <= 25000) return false;

      // 4. Weight Filter
      const weight = product.weight_g;
      if (selectedWeightRange === 'under-5' && weight >= 5) return false;
      if (selectedWeightRange === '5-10' && (weight < 5 || weight > 10)) return false;
      if (selectedWeightRange === '10-25' && (weight < 10 || weight > 25)) return false;
      if (selectedWeightRange === '25-50' && (weight < 25 || weight > 50)) return false;
      if (selectedWeightRange === '50-100' && (weight < 50 || weight > 100)) return false;
      if (selectedWeightRange === '100-plus' && weight <= 100) return false;

      // 5. Availability
      if (availability === 'in-stock' && product.stock <= 0) return false;
      if (availability === 'out-stock' && product.stock > 0) return false;

      return true;
    });
  }, [products, currentCategory.slug, selectedSubcategories, selectedPriceRange, selectedWeightRange, availability]);

  // Handlers
  const handleSubcategoryToggle = (subName: string) => {
    const subObj = currentCategory.subcategories.find(s => s.name === subName);

    // If clicking the currently active subcategory, toggle it off -> reset to All Subcategories
    if (selectedSubcategories.length === 1 && selectedSubcategories[0] === subName) {
      setSelectedSubcategories([]);
      navigate(`/category/${currentCategory.slug}`, { replace: true });
    } else {
      // Switch directly to the clicked subcategory
      setSelectedSubcategories([subName]);
      if (subObj) {
        navigate(`/category/${currentCategory.slug}/${subObj.slug}`, { replace: true });
      } else {
        navigate(`/category/${currentCategory.slug}`, { replace: true });
      }
    }
  };

  const handleSubcategoryChipClick = (subSlug?: string, subName?: string) => {
    if (!subSlug || !subName) {
      // "All" clicked
      setSelectedSubcategories([]);
      navigate(`/category/${currentCategory.slug}`, { replace: true });
    } else {
      setSelectedSubcategories([subName]);
      navigate(`/category/${currentCategory.slug}/${subSlug}`, { replace: true });
    }
  };

  const clearAllFilters = () => {
    setSelectedSubcategories([]);
    setSelectedPriceRange('all');
    setSelectedWeightRange('all');
    setAvailability('all');
    setSortBy('featured');
    navigate(`/category/${currentCategory.slug}`, { replace: true });
  };

  // Active subcategory name for breadcrumbs
  const activeSubcategoryObject = useMemo(() => {
    if (selectedSubcategories.length === 1) {
      return currentCategory.subcategories.find(s => s.name === selectedSubcategories[0]);
    }
    return null;
  }, [selectedSubcategories, currentCategory]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: currentCategory.name, url: `/category/${currentCategory.slug}` }
  ];
  if (activeSubcategoryObject) {
    breadcrumbItems.push({ label: activeSubcategoryObject.name });
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#202020]">
      
      {/* Category Banner & Editorial Header */}
      <div className="relative bg-white text-[#202020] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E5E0D8] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={currentCategory.bannerImage} 
            alt={currentCategory.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto space-y-3">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B9A77A]">
                SAI BALAJI SILVERWORKS CATALOGUE
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-[#202020] mt-1">
                {currentCategory.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] max-w-2xl mt-2 font-sans leading-relaxed">
                {currentCategory.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Main Categories Pills / Chips Navigation Bar */}
      <div className="bg-white border-b border-[#E5E0D8] sticky top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {MAIN_CATEGORIES.map((cat) => {
              const isSelected = cat.slug === currentCategory.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedSubcategories([]);
                    navigate(`/category/${cat.slug}`);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#202020] text-white shadow-2xs font-bold'
                      : 'bg-[#F8F6F1] text-[#202020] hover:bg-[#E5E0D8] border border-[#E5E0D8]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#B9A77A]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: Filter Sidebar + Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Control Bar (Mobile Filters Trigger & Sorting) */}
        <div className="flex flex-col sm:flex-row justify-between items-center pb-6 mb-6 border-b border-[#E5E0D8] gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-[#202020] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex-1 sm:flex-initial shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#B9A77A]" />
              <span>Filters</span>
              {(selectedSubcategories.length > 0 || selectedPriceRange !== 'all' || selectedWeightRange !== 'all' || availability !== 'all') && (
                <span className="bg-[#B9A77A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>

            <span className="text-xs text-[#666666] font-medium">
              Showing <strong className="text-[#202020] font-bold">{filteredProducts.length}</strong> Products
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sortBy" className="text-xs font-semibold text-[#666666] uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#B9A77A]" />
              <span>Sort By:</span>
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Featured Collection</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="weight-low-high">Weight: Low to High</option>
              <option value="weight-high-low">Weight: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs sticky top-36 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#1A1918] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#C5A059]" />
                Filter Products
              </h3>
              {(selectedSubcategories.length > 0 || selectedPriceRange !== 'all' || selectedWeightRange !== 'all' || availability !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-red-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Subcategory Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918]">
                Subcategories ({currentCategory.subcategories.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={selectedSubcategories.length === 0}
                    onChange={() => handleSubcategoryChipClick()}
                    className="rounded text-[#C5A059] focus:ring-[#C5A059]"
                  />
                  <span className="font-semibold">All Subcategories</span>
                </label>
                {currentCategory.subcategories.map((sub) => {
                  const isChecked = selectedSubcategories.includes(sub.name);
                  return (
                    <label key={sub.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#C5A059]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryToggle(sub.name)}
                        className="rounded text-[#C5A059] focus:ring-[#C5A059]"
                      />
                      <span>{sub.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Range Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E6E1DA]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918]">
                Price Range
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-1000', label: 'Under ₹1,000' },
                  { id: '1000-5000', label: '₹1,000 – ₹5,000' },
                  { id: '5000-10000', label: '₹5,000 – ₹10,000' },
                  { id: '10000-25000', label: '₹10,000 – ₹25,000' },
                  { id: '25000-plus', label: '₹25,000+' }
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer hover:text-black">
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.id}
                      checked={selectedPriceRange === range.id}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="text-[#C5A059] focus:ring-[#C5A059]"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Weight Range Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E6E1DA]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918]">
                Silver Weight
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                {[
                  { id: 'all', label: 'All Weights' },
                  { id: 'under-5', label: 'Under 5g' },
                  { id: '5-10', label: '5g – 10g' },
                  { id: '10-25', label: '10g – 25g' },
                  { id: '25-50', label: '25g – 50g' },
                  { id: '50-100', label: '50g – 100g' },
                  { id: '100-plus', label: '100g+' }
                ].map((w) => (
                  <label key={w.id} className="flex items-center gap-2 cursor-pointer hover:text-black">
                    <input
                      type="radio"
                      name="weightRange"
                      value={w.id}
                      checked={selectedWeightRange === w.id}
                      onChange={(e) => setSelectedWeightRange(e.target.value)}
                      className="text-[#C5A059] focus:ring-[#C5A059]"
                    />
                    <span>{w.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Availability Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E6E1DA]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918]">
                Availability
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="all"
                    checked={availability === 'all'}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="text-[#C5A059]"
                  />
                  <span>All Items</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="in-stock"
                    checked={availability === 'in-stock'}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="text-[#C5A059]"
                  />
                  <span className="text-green-700 font-medium">In Stock</span>
                </label>
              </div>
            </div>

          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-4 border border-[#E6E1DA] animate-pulse h-80 flex flex-col justify-between">
                    <div className="bg-gray-200 h-48 rounded-xl w-full" />
                    <div className="space-y-2 pt-4">
                      <div className="bg-gray-200 h-4 rounded w-3/4" />
                      <div className="bg-gray-200 h-4 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E6E1DA] rounded-3xl p-12 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-[#C5A059] mx-auto" />
                <h3 className="font-serif text-2xl text-[#1A1918]">No Matching Products Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  We couldn't find any products matching your selected subcategory or price/weight filters. Try clearing filters to see full collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#1A1918] text-white px-6 py-2.5 rounded-xl text-xs uppercase font-semibold tracking-wider hover:bg-[#C5A059] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1918]">Filter Products</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Subcategories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">Subcategories</h4>
                {currentCategory.subcategories.map((sub) => (
                  <label key={sub.id} className="flex items-center gap-2 text-xs text-gray-700 py-1">
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(sub.name)}
                      onChange={() => handleSubcategoryToggle(sub.name)}
                    />
                    <span>{sub.name}</span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-2 pt-4 border-t border-[#E6E1DA]">
                <h4 className="text-xs font-bold uppercase tracking-wider">Price</h4>
                {['all', 'under-1000', '1000-5000', '5000-10000', '10000-25000', '25000-plus'].map((p) => (
                  <label key={p} className="flex items-center gap-2 text-xs text-gray-700 py-1">
                    <input
                      type="radio"
                      name="mobilePrice"
                      checked={selectedPriceRange === p}
                      onChange={() => setSelectedPriceRange(p)}
                    />
                    <span>{p.replace('-', ' ').toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-[#1A1918] text-white py-3 rounded-xl text-xs uppercase font-bold tracking-widest"
            >
              Apply Filters ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Floating Bottom Action Bar for Cart */}
      {(totalQuantity > 0 || wholesaleCount > 0) && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 bg-[#1A1918] text-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-bold">{totalQuantity || wholesaleCount} Items Selected</p>
            <p className="text-[10px] text-gray-400">Items ready in your cart</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#C5A059] text-[#1A1918] px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <span>VIEW CART</span>
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
