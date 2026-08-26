import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { Product, Category } from '../../types';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';
import { useLiveSilver } from '../../context/LiveSilverContext';

export const AdminProducts: React.FC = () => {
  const { silverStats, refreshSilverRate, updateBaselineRate } = useLiveSilver();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [manualRateInput, setManualRateInput] = useState<string>('');

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
    dimensions: 'Height: 4 inches, Diameter: 3 inches',
    retail_price: 4500,
    wholesale_price: 3800,
    min_wholesale_qty: 10,
    stock: 50,
    description: '',
    specifications: '',
    featured_image: '/public/sai balajji products/Floral Engraved Silver Pooja Thali Set.webp',
    is_featured: true,
    is_new_arrival: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=200'),
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

  const handleOpenAdd = () => {
    setEditingProduct(null);
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
      dimensions: '',
      retail_price: 4500,
      wholesale_price: 3800,
      min_wholesale_qty: 10,
      stock: 50,
      description: 'Handcrafted silver piece created with hallmark precision.',
      specifications: 'Material: 925 Sterling Silver',
      featured_image: '/public/sai balajji products/Floral Engraved Silver Pooja Thali Set.webp',
      is_featured: true,
      is_new_arrival: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
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
    } catch (err) {
      alert('Failed to delete product');
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
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            CATALOGUE & PRICING MANAGEMENT
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Products, Prices & Measurements</h1>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add New Silver Product</span>
        </button>
      </div>

      {/* LIVE SILVER RATE SYSTEM CARD */}
      <div className="bg-[#1A1918] text-white rounded-3xl p-6 shadow-xl border border-[#C5A059]/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                LIVE SILVER RATE SYSTEM • RB GOLD SPOT API
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl font-bold text-white">
                ₹{silverStats.live_silver_rate.toLocaleString()}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${silverStats.rate_difference >= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {silverStats.rate_difference >= 0 ? `+₹${silverStats.rate_difference}` : `-₹${Math.abs(silverStats.rate_difference)}`}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Prices of all <strong>177 products</strong> automatically react to this rate without page refresh.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Previous Rate</span>
              <span className="font-bold text-white font-mono">₹{silverStats.previous_silver_rate.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Change</span>
              <span className={`font-bold font-mono ${silverStats.rate_difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {silverStats.rate_difference >= 0 ? `+₹${silverStats.rate_difference}` : `-₹${Math.abs(silverStats.rate_difference)}`}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Last Updated</span>
              <span className="font-semibold text-gray-300 font-mono text-[11px]">
                {silverStats.last_updated_at ? new Date(silverStats.last_updated_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : ''}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">API Status</span>
              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${silverStats.api_status === 'CONNECTED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {silverStats.api_status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => refreshSilverRate()}
              className="bg-white/10 hover:bg-[#C5A059] text-white p-3 rounded-2xl transition-colors border border-white/10"
              title="Sync Live Silver Rate Now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E6E1DA] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] uppercase tracking-wider font-serif">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">SKU / Subcategory</th>
                <th className="py-4 px-6">Weight (Net / Gross)</th>
                <th className="py-4 px-6">Making Charges</th>
                <th className="py-4 px-6">Prices (Retail / Wholesale)</th>
                <th className="py-4 px-6">Dimensions</th>
                <th className="py-4 px-6 text-center">Stock Status (ON / OFF)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {products.map((p) => {
                const isInStock = (p.stock === undefined || p.stock > 0) && p.in_stock !== false;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={p.featured_image} alt="" className="w-12 h-14 object-cover rounded-lg bg-[#FAF9F5]" />
                      <div>
                        <span className="font-serif text-sm font-bold text-[#1A1918] block">{p.title}</span>
                        <span className="text-[10px] text-[#C5A059] font-semibold">{p.category_name || p.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-600">
                      <div className="font-bold text-[#1A1918]">{p.sku}</div>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-sans text-gray-700 block mt-1">{p.subcategory || 'General'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-[#1A1918] text-white text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-0.5">
                        {p.silver_purity}
                      </span>
                      <div className="text-[11px] font-semibold text-gray-800">Net: {p.net_silver_weight_g || p.weight_g}g</div>
                      {p.gross_weight_g && <div className="text-[10px] text-gray-400">Gross: {p.gross_weight_g}g</div>}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#1A1918]">
                      {p.making_charges ? `₹${p.making_charges.toLocaleString()}` : <span className="text-gray-400 italic">Included</span>}
                    </td>
                    <td className="py-4 px-6 font-bold">
                      <div className="text-[#1A1918]">Retail: ₹{p.retail_price.toLocaleString()}</div>
                      <div className="text-[#C5A059] text-[11px]">Wholesale: ₹{p.wholesale_price?.toLocaleString() || p.retail_price.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-[11px]">
                      {p.dimensions || <span className="text-gray-400 italic">Standard</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-2xs ${
                          isInStock
                            ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                        }`}
                        title="Click to toggle In Stock (ON) / Out of Stock (OFF)"
                      >
                        <span className={`w-2 h-2 rounded-full ${ isInStock ? 'bg-green-600 animate-pulse' : 'bg-red-600' }`} />
                        <span>{isInStock ? 'IN STOCK (ON)' : 'OUT OF STOCK (OFF)'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-gray-600 hover:text-[#C5A059] rounded-lg border border-[#E6E1DA]" title="Edit Product">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-600 hover:text-red-600 rounded-lg border border-[#E6E1DA]" title="Delete Product">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold mb-6 text-[#1A1918]">
              {editingProduct ? `Edit Product Details: ${editingProduct.title}` : 'Add New Silver Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU Code *</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5 font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Main Category *</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subcategory Name</label>
                  <input type="text" placeholder="e.g. Kalash & Sacred Pots" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
                </div>
              </div>

              {/* Weights & Purity Section */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] space-y-3">
                <span className="font-bold text-[#C5A059] uppercase tracking-wider block text-[10px]">WEIGHT & PURITY MEASUREMENTS</span>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Silver Purity</label>
                    <select value={formData.silver_purity} onChange={(e) => setFormData({ ...formData, silver_purity: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2">
                      <option value="925 Sterling Silver">925 Sterling Silver</option>
                      <option value="999 Fine Silver">999 Fine Silver</option>
                      <option value="Silver Plated / Stainless Steel">Silver Plated / Stainless Steel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Net Silver Weight (g)</label>
                    <input type="number" step="0.1" value={formData.net_silver_weight_g} onChange={(e) => setFormData({ ...formData, net_silver_weight_g: parseFloat(e.target.value), weight_g: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Gross Weight (g)</label>
                    <input type="number" step="0.1" value={formData.gross_weight_g} onChange={(e) => setFormData({ ...formData, gross_weight_g: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Dimensions / Size</label>
                    <input type="text" placeholder="Height: 5 in, Width: 3 in" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>
                </div>
              </div>

              {/* Pricing & Making Charges Section */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] space-y-3">
                <span className="font-bold text-[#C5A059] uppercase tracking-wider block text-[10px]">PRICING & MAKING CHARGES</span>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Retail Price (₹)</label>
                    <input type="number" value={formData.retail_price} onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 font-bold text-[#1A1918]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Wholesale Rate (₹)</label>
                    <input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({ ...formData, wholesale_price: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 font-bold text-[#C5A059]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Making Charges (₹)</label>
                    <input type="number" value={formData.making_charges} onChange={(e) => setFormData({ ...formData, making_charges: parseFloat(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Stock Units</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 font-bold" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Featured Image Path / URL</label>
                <input type="text" value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5 font-mono text-[11px]" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Specifications & Material Details</label>
                <input type="text" value={formData.specifications} onChange={(e) => setFormData({ ...formData, specifications: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl uppercase tracking-widest font-bold text-xs shadow-lg transition-colors">
                Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
