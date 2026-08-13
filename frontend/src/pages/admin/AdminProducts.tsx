import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../../types';
import api from '../../services/api';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    category_id: 1,
    product_type: 'BOTH',
    silver_purity: '925 Sterling Silver',
    weight_g: 50.0,
    retail_price: 4500,
    wholesale_price: 3800,
    min_wholesale_qty: 10,
    stock: 50,
    description: '',
    specifications: '',
    featured_image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    is_new_arrival: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
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
      product_type: 'BOTH',
      silver_purity: '925 Sterling Silver',
      weight_g: 50.0,
      retail_price: 4500,
      wholesale_price: 3800,
      min_wholesale_qty: 10,
      stock: 50,
      description: 'Handcrafted silver piece.',
      specifications: 'Material: 925 Sterling Silver',
      featured_image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80',
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
      product_type: prod.product_type,
      silver_purity: prod.silver_purity,
      weight_g: prod.weight_g,
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
      alert(err.response?.data?.detail || 'Failed to save product');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            CATALOGUE MANAGEMENT
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Products & Inventory</h1>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add New Silver Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] uppercase tracking-wider font-serif">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">SKU / Type</th>
                <th className="py-4 px-6">Purity & Weight</th>
                <th className="py-4 px-6">Prices (Retail / Wholesale)</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img src={p.featured_image} alt="" className="w-12 h-14 object-cover rounded-lg bg-[#FAF9F5]" />
                    <div>
                      <span className="font-serif text-sm font-bold text-[#1A1918] block">{p.title}</span>
                      <span className="text-[10px] text-gray-400">{p.category?.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-600">
                    <div>{p.sku}</div>
                    <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded font-sans font-bold text-gray-700">{p.product_type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#1A1918] text-white text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-0.5">
                      {p.silver_purity}
                    </span>
                    <div className="text-[11px] text-gray-500">{p.weight_g} grams</div>
                  </td>
                  <td className="py-4 px-6 font-bold">
                    <div className="text-[#1A1918]">Retail: ₹{p.retail_price.toLocaleString()}</div>
                    <div className="text-[#C5A059] text-[11px]">Wholesale: ₹{p.wholesale_price?.toLocaleString() || p.retail_price.toLocaleString()} (Min {p.min_wholesale_qty} Pcs)</div>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-2 text-gray-600 hover:text-[#C5A059] rounded-lg border border-[#E6E1DA]">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-600 hover:text-red-600 rounded-lg border border-[#E6E1DA]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Silver Creation'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU Code *</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Silver Purity</label>
                  <select value={formData.silver_purity} onChange={(e) => setFormData({ ...formData, silver_purity: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2">
                    <option value="925 Sterling Silver">925 Sterling Silver</option>
                    <option value="999 Fine Silver">999 Fine Silver</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Weight (grams)</label>
                  <input type="number" step="0.1" value={formData.weight_g} onChange={(e) => setFormData({ ...formData, weight_g: parseFloat(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Units</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Retail Price (₹)</label>
                  <input type="number" value={formData.retail_price} onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Wholesale Rate (₹)</label>
                  <input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({ ...formData, wholesale_price: parseFloat(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Wholesale MOQ</label>
                  <input type="number" value={formData.min_wholesale_qty} onChange={(e) => setFormData({ ...formData, min_wholesale_qty: parseInt(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Featured Image URL</label>
                <input type="text" value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl uppercase tracking-widest font-bold">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
