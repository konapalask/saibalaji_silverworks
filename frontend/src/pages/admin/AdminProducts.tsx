import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Check, X, Sparkles, RefreshCw, 
  Search, Filter, ChevronDown, ChevronRight, MoreVertical, 
  Layers, Copy, AlertCircle, CheckSquare, Square, Eye, Package
} from 'lucide-react';
import { Product, Category, ProductVariant } from '../../types';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';
import { useLiveSilver } from '../../context/LiveSilverContext';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';

export const AdminProducts: React.FC = () => {
  const { silverStats, refreshSilverRate, calculateDynamicPrice } = useLiveSilver();
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImageData, setPreviewImageData] = useState<{ url: string; title?: string; sku?: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPurity, setSelectedPurity] = useState<string>('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('ALL');
  const [selectedProductStatus, setSelectedProductStatus] = useState<string>('ALL');
  
  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Expandable Rows (Product Variants)
  const [expandedProductIds, setExpandedProductIds] = useState<number[]>([]);

  // Action Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    category_id: 1,
    subcategory: '',
    product_type: 'BOTH' as 'RETAIL' | 'WHOLESALE' | 'BOTH',
    silver_purity: '925 Sterling Silver',
    weight_g: 50.0,
    gross_weight_g: 55.0,
    net_silver_weight_g: 50.0,
    making_charges: 350,
    making_charge_type: 'fixed' as 'fixed' | 'per_gram' | 'percentage',
    dimensions: 'Height: 4 inches, Diameter: 3 inches',
    retail_price: 4500,
    wholesale_price: 3800,
    min_wholesale_qty: 10,
    stock: 50,
    description: '',
    specifications: '',
    featured_image: '/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp',
    is_featured: true,
    is_new_arrival: true
  });

  // Variant Management inside Product Form
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState({
    id: '',
    measurement: '',
    weight_g: 25.0,
    making_charge: 300,
    making_charge_type: 'fixed' as 'fixed' | 'per_gram' | 'percentage',
    stock: 10,
    sku: '',
    image: '',
    is_active: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=500'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered & Searched Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesSub = (p.subcategory || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSku && !matchesSub) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && String(p.category_id) !== selectedCategory) {
        return false;
      }

      // Purity
      if (selectedPurity !== 'ALL') {
        const purity = (p.silver_purity || '').toLowerCase();
        if (selectedPurity === '925' && !purity.includes('925')) return false;
        if (selectedPurity === '999' && !purity.includes('999')) return false;
      }

      // Stock Status
      const inStockCount = p.stock !== undefined ? p.stock : 10;
      const isAvailable = inStockCount > 0 && p.in_stock !== false;
      
      if (selectedStockStatus === 'IN_STOCK' && (!isAvailable || inStockCount <= 2)) return false;
      if (selectedStockStatus === 'LOW_STOCK' && (inStockCount > 2 || inStockCount === 0)) return false;
      if (selectedStockStatus === 'OUT_OF_STOCK' && isAvailable) return false;

      // Product Status
      if (selectedProductStatus === 'ACTIVE' && p.in_stock === false) return false;
      if (selectedProductStatus === 'INACTIVE' && p.in_stock !== false) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedPurity, selectedStockStatus, selectedProductStatus]);

  // Paginated Products
  const totalProductsCount = filteredProducts.length;
  const totalPages = Math.ceil(totalProductsCount / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Metric Cards Counts
  const metrics = useMemo(() => {
    const total = products.length;
    let active = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const qty = p.stock !== undefined ? p.stock : 10;
      const inStock = qty > 0 && p.in_stock !== false;
      if (inStock) active++;
      if (inStock && qty <= 3) lowStock++;
      if (!inStock || qty === 0) outOfStock++;
    });

    return { total, active, lowStock, outOfStock };
  }, [products]);

  // Handlers for Add / Edit Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setVariants([]);
    setFormData({
      title: '',
      sku: `SBS-SLV-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: categories[0]?.id || 1,
      subcategory: '',
      product_type: 'BOTH',
      silver_purity: '925 Sterling Silver',
      weight_g: 50.0,
      gross_weight_g: 55.0,
      net_silver_weight_g: 50.0,
      making_charges: 350,
      making_charge_type: 'fixed',
      dimensions: 'Height: 5.0 in, Width: 3.5 in',
      retail_price: 4500,
      wholesale_price: 3800,
      min_wholesale_qty: 10,
      stock: 50,
      description: 'Handcrafted silver piece created with hallmark precision.',
      specifications: 'Material: 925 Sterling Silver',
      featured_image: '/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp',
      is_featured: true,
      is_new_arrival: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    let varList = Array.isArray(prod.variants) && prod.variants.length > 0 ? prod.variants : [];
    if (varList.length === 0) {
      const baseW = prod.net_silver_weight_g || prod.weight_g || 25;
      const baseMC = prod.making_charges || 300;
      const mcType = prod.making_charge_type || 'fixed';
      const sku = prod.sku || 'SKU';
      const stock = prod.stock !== undefined ? prod.stock : 10;
      varList = [
        { id: `v-${prod.id}-1`, measurement: `${Math.round(baseW * 10) / 10}g`, weight_g: Math.round(baseW * 10) / 10, making_charge: Math.round(baseMC), making_charge_type: mcType, sku: `${sku}-250G`, stock, is_active: true },
        { id: `v-${prod.id}-2`, measurement: `${Math.round(baseW * 1.6 * 10) / 10}g`, weight_g: Math.round(baseW * 1.6 * 10) / 10, making_charge: Math.round(baseMC * 1.5), making_charge_type: mcType, sku: `${sku}-400G`, stock: Math.max(1, Math.round(stock * 0.8)), is_active: true },
        { id: `v-${prod.id}-3`, measurement: `${Math.round(baseW * 2.5 * 10) / 10}g`, weight_g: Math.round(baseW * 2.5 * 10) / 10, making_charge: Math.round(baseMC * 2.0), making_charge_type: mcType, sku: `${sku}-625G`, stock: Math.max(1, Math.round(stock * 0.6)), is_active: true },
        { id: `v-${prod.id}-4`, measurement: `${Math.round(baseW * 4.0 * 10) / 10}g`, weight_g: Math.round(baseW * 4.0 * 10) / 10, making_charge: Math.round(baseMC * 3.0), making_charge_type: mcType, sku: `${sku}-1000G`, stock: Math.max(1, Math.round(stock * 0.4)), is_active: true }
      ];
    }
    setVariants(varList);
    setFormData({
      title: prod.title,
      sku: prod.sku,
      category_id: prod.category_id,
      subcategory: prod.subcategory || '',
      product_type: prod.product_type,
      silver_purity: prod.silver_purity,
      weight_g: prod.weight_g,
      gross_weight_g: prod.gross_weight_g || prod.weight_g,
      net_silver_weight_g: prod.net_silver_weight_g || prod.weight_g,
      making_charges: prod.making_charges || 0,
      making_charge_type: prod.making_charge_type || 'fixed',
      dimensions: prod.dimensions || '',
      retail_price: prod.retail_price,
      wholesale_price: prod.wholesale_price || prod.retail_price,
      min_wholesale_qty: prod.min_wholesale_qty,
      stock: prod.stock,
      description: prod.description || '',
      specifications: prod.specifications || '',
      featured_image: prod.featured_image,
      is_featured: prod.is_featured,
      is_new_arrival: prod.is_new_arrival
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, variants };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(getErrorMessage(err, 'Failed to save product'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      setSelectedProductIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleToggleStock = async (prod: Product) => {
    const isCurrentlyInStock = (prod.stock !== undefined ? prod.stock : 10) > 0 && prod.in_stock !== false;
    const newStock = isCurrentlyInStock ? 0 : 10;
    const newInStock = !isCurrentlyInStock;
    try {
      await api.put(`/products/${prod.id}`, { stock: newStock, in_stock: newInStock });
      fetchProducts();
    } catch (err) {
      alert('Failed to update stock status');
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDuplicate = async (prod: Product) => {
    try {
      const dup = {
        ...prod,
        title: `${prod.title} (Copy)`,
        sku: `${prod.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`
      };
      delete (dup as any).id;
      await api.post('/products', dup);
      fetchProducts();
    } catch (err) {
      alert('Failed to duplicate product');
    } finally {
      setActiveMenuId(null);
    }
  };

  // Bulk Action Handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === paginatedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(paginatedProducts.map(p => p.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProductIds.length} selected products?`)) return;
    try {
      await Promise.all(selectedProductIds.map(id => api.delete(`/products/${id}`)));
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      alert('Failed bulk deletion');
    }
  };

  const handleBulkStockUpdate = async (inStock: boolean) => {
    try {
      await Promise.all(selectedProductIds.map(id => api.put(`/products/${id}`, { stock: inStock ? 10 : 0, in_stock: inStock })));
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      alert('Failed bulk stock update');
    }
  };

  // Expand / Collapse Variant Row
  const toggleExpandVariant = (productId: number) => {
    setExpandedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Variant Form Modal Handlers
  const handleOpenAddVariant = () => {
    setEditingVariantIndex(null);
    setVariantForm({
      id: `var-${Date.now()}`,
      measurement: '',
      weight_g: 25.0,
      making_charge: 300,
      making_charge_type: 'fixed',
      stock: 10,
      sku: `${formData.sku || 'VAR'}-${variants.length + 1}`,
      image: '',
      is_active: true
    });
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (index: number) => {
    const v = variants[index];
    setEditingVariantIndex(index);
    setVariantForm({
      id: v.id || `var-${Date.now()}`,
      measurement: v.measurement,
      weight_g: v.weight_g,
      making_charge: v.making_charge,
      making_charge_type: v.making_charge_type || 'fixed',
      stock: v.stock,
      sku: v.sku,
      image: v.image || '',
      is_active: v.is_active !== false
    });
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.measurement.trim()) {
      alert('Measurement (size) is required for variant.');
      return;
    }
    if (variantForm.weight_g <= 0) {
      alert('Weight must be greater than 0.');
      return;
    }
    const updated = [...variants];
    if (editingVariantIndex !== null) {
      updated[editingVariantIndex] = { ...variantForm };
    } else {
      updated.push({ ...variantForm });
    }
    setVariants(updated);
    setIsVariantModalOpen(false);
  };

  const handleDeleteVariant = (index: number) => {
    if (!confirm('Remove this size/measurement variant?')) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Price calculation preview inside variant modal
  const variantPreview = calculateDynamicPrice(
    variantForm.weight_g,
    variantForm.making_charge,
    variantForm.making_charge_type,
    formData.silver_purity
  );

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto text-[#1A1918] font-sans pb-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E1DA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
              LUXURY SILVER JEWELLERY CATALOGUE
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1918] mt-0.5">Inventory Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* COMPACT LIVE SILVER RATE INDICATOR CARD */}
      <div className="bg-[#1A1918] text-white rounded-2xl p-4 shadow-md border border-[#C5A059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#C5A059]/15 rounded-xl border border-[#C5A059]/30 text-[#C5A059]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                LIVE SILVER RATE (RB GOLD SPOT API)
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif text-2xl font-bold text-white">
                ₹{silverStats.live_silver_rate.toLocaleString()} / g
              </span>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${silverStats.rate_difference >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {silverStats.rate_difference >= 0 ? `+₹${silverStats.rate_difference}` : `-₹${Math.abs(silverStats.rate_difference)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block text-gray-300">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Last Updated</span>
            <span className="font-mono text-[11px]">
              {silverStats.last_updated_at ? new Date(silverStats.last_updated_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Just now'}
            </span>
          </div>

          <button 
            onClick={() => refreshSilverRate()}
            className="bg-white/10 hover:bg-[#C5A059] text-white p-2.5 rounded-xl transition-colors border border-white/15 flex items-center gap-1.5 text-xs font-bold"
            title="Sync Live Silver Rate"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sync Rate</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STAT METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Products</span>
            <span className="font-serif text-2xl font-bold text-[#1A1918]">{metrics.total}</span>
          </div>
          <div className="p-2.5 bg-[#FAF9F5] text-[#1A1918] rounded-xl border border-[#E6E1DA]">
            <Package className="w-5 h-5 text-[#C5A059]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Active Products</span>
            <span className="font-serif text-2xl font-bold text-green-700">{metrics.active}</span>
          </div>
          <div className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-200">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Low Stock</span>
            <span className="font-serif text-2xl font-bold text-amber-700">{metrics.lowStock}</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Out of Stock</span>
            <span className="font-serif text-2xl font-bold text-red-700">{metrics.outOfStock}</span>
          </div>
          <div className="p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search products by title, SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1A1918] focus:bg-white focus:outline-none focus:border-[#C5A059]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Purity Dropdown */}
            <select
              value={selectedPurity}
              onChange={(e) => { setSelectedPurity(e.target.value); setCurrentPage(1); }}
              className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Purity</option>
              <option value="925">925 Sterling</option>
              <option value="999">999 Fine Silver</option>
            </select>

            {/* Stock Status Dropdown */}
            <select
              value={selectedStockStatus}
              onChange={(e) => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
              className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Stock Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (≤3)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            {/* Product Status Dropdown */}
            <select
              value={selectedProductStatus}
              onChange={(e) => { setSelectedProductStatus(e.target.value); setCurrentPage(1); }}
              className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS TOOLBAR (Appears when items are selected) */}
        {selectedProductIds.length > 0 && (
          <div className="bg-[#1A1918] text-white p-3 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="bg-[#C5A059] text-black font-bold px-2 py-0.5 rounded text-[10px]">
                {selectedProductIds.length} SELECTED
              </span>
              <span className="text-gray-300 hidden sm:inline">Bulk actions available:</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkStockUpdate(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px]"
              >
                Mark In Stock
              </button>
              <button 
                onClick={() => handleBulkStockUpdate(false)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px]"
              >
                Mark Out of Stock
              </button>
              <button 
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px]"
              >
                Delete Selected
              </button>
              <button 
                onClick={() => setSelectedProductIds([])}
                className="text-gray-400 hover:text-white p-1 ml-2"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HIGH DENSITY HIGH-SPEED INVENTORY TABLE */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] font-bold text-[11px] uppercase tracking-wider font-serif">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-gray-500 hover:text-black">
                    {selectedProductIds.length > 0 && selectedProductIds.length === paginatedProducts.length ? (
                      <CheckSquare className="w-4 h-4 text-[#C5A059]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 min-w-[220px]">Product Details</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Weight (Net/Gross)</th>
                <th className="py-3 px-3">Silver Value</th>
                <th className="py-3 px-3">Making Charge</th>
                <th className="py-3 px-4 min-w-[130px]">Selling Price</th>
                <th className="py-3 px-3 text-center">Variants</th>
                <th className="py-3 px-3 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#C5A059] mb-2"></div>
                    <p>Loading inventory items...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    No products match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isExpanded = expandedProductIds.includes(p.id);
                  
                  // Product purity & calculations
                  const purityFactor = (p.silver_purity || '').toLowerCase().includes('999') ? 1.0 : 0.925;
                  const netWeight = p.net_silver_weight_g || p.weight_g || 25;
                  const grossWeight = p.gross_weight_g || netWeight;
                  const silverRate = silverStats.live_silver_rate || 250.64;
                  
                  const silverValue = Math.round(netWeight * purityFactor * silverRate);
                  const making = p.making_charges || 0;

                  // Price breakdown
                  const calcPrice = calculateDynamicPrice(netWeight, making, p.making_charge_type || 'fixed', p.silver_purity);
                  const displayPrice = calcPrice.finalPrice;

                  // Stock logic
                  const stockQty = p.stock !== undefined ? p.stock : 10;
                  const isInStock = stockQty > 0 && p.in_stock !== false;
                  const isLowStock = isInStock && stockQty <= 3;

                  // Has Custom Variants
                  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
                  const variantCount = hasVariants ? p.variants!.length : 0;

                  return (
                    <React.Fragment key={p.id}>
                      <tr className={`hover:bg-[#FAF9F5]/70 transition-colors h-[76px] ${isSelected ? 'bg-amber-50/40' : ''}`}>
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleSelectOne(p.id)} className="text-gray-400 hover:text-black">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#C5A059]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                        </td>

                        {/* Product Detail (Thumbnail + Title + Category) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.featured_image} 
                              alt={p.title} 
                              onClick={() => setPreviewImageData({ url: p.featured_image, title: p.title, sku: p.sku })}
                              className="w-14 h-14 object-cover rounded-xl bg-black border border-[#E6E1DA] shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs" 
                              title="Click to expand image"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-serif font-bold text-xs text-[#1A1918] line-clamp-2 leading-snug block" title={p.title}>
                                {p.title}
                              </span>
                              <span className="text-[10px] text-[#C5A059] font-medium block truncate mt-0.5">
                                {p.category_name || p.category?.name || 'Silver Collection'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU & Subcategory */}
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <div className="font-bold text-[#1A1918]">{p.sku}</div>
                          {p.subcategory && (
                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.2 rounded font-sans text-gray-600 block mt-0.5 truncate max-w-[100px]">
                              {p.subcategory}
                            </span>
                          )}
                        </td>

                        {/* Weight (Net / Gross) */}
                        <td className="py-3 px-3 text-[11px]">
                          <div className="font-bold text-[#1A1918]">Net: {netWeight}g</div>
                          <div className="text-[10px] text-gray-400">Gross: {grossWeight}g</div>
                        </td>

                        {/* Silver Value */}
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-gray-700">
                          ₹{silverValue.toLocaleString()}
                        </td>

                        {/* Making Charge */}
                        <td className="py-3 px-3 font-mono text-[11px]">
                          {making > 0 ? (
                            <span className="font-semibold text-gray-800">
                              ₹{making.toLocaleString()}
                              {p.making_charge_type && p.making_charge_type !== 'fixed' && (
                                <span className="text-[9px] text-gray-500 block">({p.making_charge_type})</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Included</span>
                          )}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 min-w-[120px]">
                          <div className="font-bold text-xs text-[#1A1918] font-mono">
                            ₹{calcPrice.finalPrice.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">
                            Sil ₹{(silverValue/1000).toFixed(1)}k | Mk ₹{(calcPrice.makingCharge/1000).toFixed(1)}k
                          </div>
                        </td>

                        {/* Variants Count & Expand Action */}
                        <td className="py-3 px-3 text-center">
                          {hasVariants ? (
                            <button
                              onClick={() => toggleExpandVariant(p.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                                isExpanded 
                                  ? 'bg-[#1A1918] text-white border-[#1A1918]' 
                                  : 'bg-[#FAF9F5] text-gray-800 border-[#E6E1DA] hover:border-[#C5A059]'
                              }`}
                            >
                              <Layers className="w-3 h-3 text-[#C5A059]" />
                              <span>{variantCount} Var</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">1 Standard</span>
                          )}
                        </td>

                        {/* Stock Status Pill */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all cursor-pointer border ${
                              isInStock
                                ? isLowStock
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                  : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                                : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                            }`}
                            title="Click to quick toggle stock status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? (isLowStock ? 'bg-amber-600' : 'bg-green-600 animate-pulse') : 'bg-red-600'}`} />
                            <span>
                              {isInStock ? (isLowStock ? `Low (${stockQty})` : `In Stock (${stockQty})`) : 'Out of Stock'}
                            </span>
                          </button>
                        </td>

                        {/* Actions (Edit / Options Menu) */}
                        <td className="py-3 px-4 text-right">
                          <div className="relative inline-flex items-center gap-1">
                            <button 
                              onClick={() => handleOpenEdit(p)} 
                              className="px-2.5 py-1 bg-white hover:bg-[#FAF9F5] text-gray-700 hover:text-[#C5A059] rounded-lg border border-[#E6E1DA] font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Dropdown Menu Trigger */}
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                              className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 border border-[#E6E1DA] transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Options Dropdown Menu */}
                            {activeMenuId === p.id && (
                              <div className="absolute right-0 top-8 z-30 bg-white border border-[#E6E1DA] rounded-xl shadow-xl py-1.5 w-44 text-left font-sans text-xs animate-fadeIn">
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-[#FAF9F5] flex items-center gap-2 text-gray-700"
                                >
                                  <Edit className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>Edit Details</span>
                                </button>
                                <button
                                  onClick={() => { toggleExpandVariant(p.id); setActiveMenuId(null); }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-[#FAF9F5] flex items-center gap-2 text-gray-700"
                                >
                                  <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>Manage Variants</span>
                                </button>
                                <button
                                  onClick={() => handleToggleStock(p)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-[#FAF9F5] flex items-center gap-2 text-gray-700"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>Toggle Stock</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicate(p)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-[#FAF9F5] flex items-center gap-2 text-gray-700"
                                >
                                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Duplicate</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Product</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE INLINE VARIANTS SUB-TABLE ROW */}
                      {isExpanded && (
                        <tr className="bg-[#FAF9F5] border-b border-[#E6E1DA]">
                          <td colSpan={11} className="p-4">
                            <div className="bg-white rounded-xl border border-[#E6E1DA] p-4 space-y-3 shadow-inner">
                              <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-[#C5A059]" />
                                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#1A1918]">
                                    Product Variants ({p.title})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="text-[11px] font-bold text-[#C5A059] hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Edit Variants in Product Manager</span>
                                </button>
                              </div>

                              {hasVariants ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[11px]">
                                    <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] font-bold text-[#1A1918]">
                                      <tr>
                                        <th className="py-2 px-3">Measurement / Size</th>
                                        <th className="py-2 px-3">Net Weight</th>
                                        <th className="py-2 px-3">Gross Weight</th>
                                        <th className="py-2 px-3">Making Charge</th>
                                        <th className="py-2 px-3">Calculated Price</th>
                                        <th className="py-2 px-3">SKU</th>
                                        <th className="py-2 px-3 text-center">Stock</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-sans">
                                      {p.variants!.map((v, vIdx) => {
                                        const vCalc = calculateDynamicPrice(v.weight_g, v.making_charge, v.making_charge_type || 'fixed', p.silver_purity);
                                        return (
                                          <tr key={vIdx} className="hover:bg-gray-50">
                                            <td className="py-2 px-3 font-bold text-[#1A1918]">{v.measurement}</td>
                                            <td className="py-2 px-3 font-mono">{v.weight_g} g</td>
                                            <td className="py-2 px-3 font-mono">{v.weight_g} g</td>
                                            <td className="py-2 px-3 font-mono">₹{v.making_charge}</td>
                                            <td className="py-2 px-3 font-bold text-green-700 font-mono">₹{vCalc.finalPrice.toLocaleString()}</td>
                                            <td className="py-2 px-3 font-mono text-gray-500">{v.sku}</td>
                                            <td className="py-2 px-3 text-center font-bold">
                                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${v.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {v.stock} pcs
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic">No variants created for this product yet.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="bg-[#FAF9F5] border-t border-[#E6E1DA] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="text-gray-600">
            Showing <span className="font-bold text-[#1A1918]">{totalProductsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-[#1A1918]">{Math.min(currentPage * pageSize, totalProductsCount)}</span> of <span className="font-bold text-[#1A1918]">{totalProductsCount}</span> products
          </div>

          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-[11px]">Items per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-[#E6E1DA] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-gray-700 hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs"
              >
                Previous
              </button>

              <span className="px-3 text-xs font-bold text-[#1A1918]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-gray-700 hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] text-xs font-sans relative overflow-hidden my-auto">
            
            {/* Pinned Header */}
            <div className="bg-white px-5 py-3 border-b border-[#E6E1DA] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block">PRODUCT INVENTORY MANAGER</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1918]">
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Silver Product'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="bg-white hover:bg-gray-100 border border-[#E6E1DA] px-3 py-1.5 rounded-xl text-gray-600 hover:text-black transition-colors flex items-center gap-1.5 shadow-2xs font-bold text-xs cursor-pointer"
                title="Close Modal & Go Back"
              >
                <X className="w-4 h-4 text-red-600" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SKU Code *</label>
                    <input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2 font-mono" />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Main Category *</label>
                    <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2">
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Subcategory Name</label>
                    <input type="text" placeholder="e.g. Kalash & Sacred Pots" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2" />
                  </div>
                </div>

                {/* Weights & Purity Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E6E1DA] space-y-2.5">
                  <span className="font-bold text-[#C5A059] uppercase tracking-wider block text-[10px]">WEIGHT & PURITY MEASUREMENTS</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Silver Purity</label>
                      <select value={formData.silver_purity} onChange={(e) => setFormData({ ...formData, silver_purity: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-2.5 py-1.5 text-xs">
                        <option value="925 Sterling Silver">925 Sterling Silver</option>
                        <option value="999 Fine Silver">999 Fine Silver</option>
                        <option value="Silver Plated / Stainless Steel">Silver Plated / Stainless Steel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Net Silver Weight (g)</label>
                      <input type="number" step="0.1" value={formData.net_silver_weight_g} onChange={(e) => setFormData({ ...formData, net_silver_weight_g: parseFloat(e.target.value), weight_g: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-2.5 py-1.5 font-bold" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Gross Weight (g)</label>
                      <input type="number" step="0.1" value={formData.gross_weight_g} onChange={(e) => setFormData({ ...formData, gross_weight_g: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Dimensions / Size</label>
                      <input type="text" placeholder="Height: 5 in, Width: 3 in" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-2.5 py-1.5" />
                    </div>
                  </div>
                </div>

                {/* Pricing & Making Charges Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E6E1DA] space-y-2.5">
                  <span className="font-bold text-[#C5A059] uppercase tracking-wider block text-[10px]">PRICING & MAKING CHARGES</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Selling Base Price (₹)</label>
                      <input type="number" value={formData.retail_price} onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value), wholesale_price: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold text-[#1A1918]" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Making Charges (₹)</label>
                      <input type="number" value={formData.making_charges} onChange={(e) => setFormData({ ...formData, making_charges: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Stock Units</label>
                      <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold" />
                    </div>
                  </div>
                </div>

                {/* PRODUCT VARIANTS / MEASUREMENTS SECTION */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E6E1DA] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#C5A059] uppercase tracking-wider block text-[10px]">PRODUCT VARIANTS / MEASUREMENTS</span>
                      <p className="text-[10.5px] text-gray-500">Define multiple size/measurement variants (e.g. 2", 3", 4", 6") with custom weights & making charges.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddVariant}
                      className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-bold tracking-wider flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>+ Add Variant</span>
                    </button>
                  </div>

                  {variants.length > 0 ? (
                    <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] font-bold text-[#1A1918]">
                          <tr>
                            <th className="py-2 px-3">Measurement</th>
                            <th className="py-2 px-3">Weight (g)</th>
                            <th className="py-2 px-3">Making Charge</th>
                            <th className="py-2 px-3">Calculated Price</th>
                            <th className="py-2 px-3">Stock</th>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans">
                          {variants.map((v, idx) => {
                            const pCalc = calculateDynamicPrice(v.weight_g, v.making_charge, v.making_charge_type || 'fixed', formData.silver_purity);
                            return (
                              <tr key={idx} className="hover:bg-[#FAF9F5]/60">
                                <td className="py-1.5 px-3 font-bold text-[#1A1918]">{v.measurement}</td>
                                <td className="py-1.5 px-3 font-mono">{v.weight_g} g</td>
                                <td className="py-1.5 px-3 font-mono">₹{v.making_charge}</td>
                                <td className="py-1.5 px-3 font-bold text-green-700 font-mono">₹{pCalc.finalPrice.toLocaleString()}</td>
                                <td className="py-1.5 px-3 font-mono">{v.stock} pcs</td>
                                <td className="py-1.5 px-3 font-mono text-gray-500">{v.sku}</td>
                                <td className="py-1.5 px-3 text-right space-x-1">
                                  <button type="button" onClick={() => handleOpenEditVariant(idx)} className="p-1 text-gray-600 hover:text-[#C5A059]">
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteVariant(idx)} className="p-1 text-gray-600 hover:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-[#FAF9F5] rounded-xl border border-dashed border-[#E6E1DA] text-gray-500 text-[11px]">
                      No custom measurements/variants created. Click <strong>+ Add Variant</strong> to set size options.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Featured Image Path / URL</label>
                  <input type="text" value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2 font-mono text-[11px]" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Description</label>
                  <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3.5 py-2" />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-3.5 bg-white border-t border-[#E6E1DA] shrink-0">
                <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3 rounded-xl uppercase tracking-widest font-bold text-xs shadow-lg transition-colors cursor-pointer">
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VARIANT ADD / EDIT MODAL */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] text-xs font-sans relative overflow-hidden my-auto">
            
            <div className="bg-white px-5 py-3 border-b border-[#E6E1DA] flex items-center justify-between shrink-0">
              <h4 className="font-serif text-lg font-bold text-[#1A1918]">
                {editingVariantIndex !== null ? 'Edit Variant / Size' : 'Add New Variant / Size'}
              </h4>
              <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-500 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVariant} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Measurement / Size *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 inch, 3 inch, 250g"
                      value={variantForm.measurement}
                      onChange={(e) => setVariantForm({ ...variantForm, measurement: e.target.value })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Variant SKU *</label>
                    <input
                      type="text"
                      required
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Weight (g) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="0.1"
                      value={variantForm.weight_g}
                      onChange={(e) => setVariantForm({ ...variantForm, weight_g: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Making Charge *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variantForm.making_charge}
                      onChange={(e) => setVariantForm({ ...variantForm, making_charge: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Charge Type</label>
                    <select
                      value={variantForm.making_charge_type}
                      onChange={(e) => setVariantForm({ ...variantForm, making_charge_type: e.target.value as any })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-2 py-1.5 font-medium"
                    >
                      <option value="fixed">Fixed (₹)</option>
                      <option value="per_gram">Per Gram (₹/g)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Stock Units *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm({ ...variantForm, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Variant Image (Optional)</label>
                    <input
                      type="text"
                      placeholder="/public/Saibalaji products S/..."
                      value={variantForm.image}
                      onChange={(e) => setVariantForm({ ...variantForm, image: e.target.value })}
                      className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* LIVE PRICE PREVIEW CARD */}
                <div className="bg-[#1A1918] text-white p-3 rounded-2xl border border-[#C5A059]/40 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1">
                    <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#C5A059]">
                      DYNAMIC PRICE PREVIEW (LIVE)
                    </span>
                    <span className="text-[9.5px] font-mono text-gray-300">
                      Silver Rate: ₹{silverStats.live_silver_rate}/g
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">Weight</span>
                      <span className="font-bold text-white font-mono">{variantPreview.weight} g</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9.5px]">Silver Value</span>
                      <span className="font-bold text-white font-mono">₹{variantPreview.silverValue.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9.5px]">Making Charges</span>
                      <span className="font-bold text-white font-mono">₹{variantPreview.makingCharge.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9.5px]">Current Selling Price</span>
                      <span className="font-bold text-[#C5A059] font-mono text-xs">₹{variantPreview.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-white border-t border-[#E6E1DA] flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="w-1/2 py-2 border border-[#E6E1DA] rounded-xl font-bold uppercase text-[11px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-xl font-bold uppercase text-[11px] shadow-md cursor-pointer"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      <ImagePreviewModal
        isOpen={Boolean(previewImageData)}
        onClose={() => setPreviewImageData(null)}
        imageUrl={previewImageData?.url || ''}
        title={previewImageData?.title}
        sku={previewImageData?.sku}
      />

    </div>
  );
};
