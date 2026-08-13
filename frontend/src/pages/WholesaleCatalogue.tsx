import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Check, Sparkles, Filter, Plus } from 'lucide-react';
import { Product } from '../types';
import { useWholesale } from '../context/WholesaleContext';
import api from '../services/api';

export const WholesaleCatalogue: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { wholesaleItems, addToWholesaleCart, wholesaleCount } = useWholesale();

  useEffect(() => {
    const fetchWholesaleProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products?product_type=WHOLESALE');
        setProducts(res.data);
      } catch (err) {
        console.error('Error loading wholesale products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWholesaleProducts();
  }, []);

  const isAdded = (productId: number) => wholesaleItems.some((i) => i.product.id === productId);

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-[#1A1918] text-[#FAF9F5] rounded-3xl p-8 sm:p-12 mb-10 border border-[#C5A059]/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="bg-[#C5A059] text-[#1A1918] text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            B2B WHOLESALE CATALOGUE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
            Direct Silver Manufacturing Quotes
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Select bulk quantities for your retail showroom or business. Submit a wholesale request to receive a formal server-generated PDF quotation from Sai Balaji Silverworks.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link 
              to="/wholesale/request" 
              className="bg-[#C5A059] text-[#1A1918] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>View Wholesale Request List ({wholesaleCount} Items)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Bulk Silver Inventory</h3>
        <span className="text-xs text-gray-500 font-semibold">{products.length} Products Available</span>
      </div>

      {/* Products Table/Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-[#E6E1DA]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const added = isAdded(product.id);
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-[#E6E1DA] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-4">
                    <img 
                      src={product.featured_image} 
                      alt={product.title} 
                      className="w-24 h-28 object-cover rounded-xl bg-[#FAF9F5]"
                    />
                    <div className="flex-1 space-y-1">
                      <span className="bg-[#1A1918] text-[#FAF9F5] text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full inline-block">
                        {product.silver_purity}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#1A1918] line-clamp-1">{product.title}</h4>
                      <p className="text-[10px] text-gray-400">SKU: {product.sku}</p>
                      <p className="text-[11px] text-gray-600">Unit Weight: {product.weight_g}g</p>
                      <p className="text-xs font-bold text-[#C5A059] mt-1">
                        Est. Rate: ₹{product.wholesale_price ? product.wholesale_price.toLocaleString() : product.retail_price.toLocaleString()} / unit
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6E1DA] flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">
                    MOQ: <span className="text-[#1A1918] font-bold">{product.min_wholesale_qty} Pcs</span>
                  </span>

                  <button 
                    onClick={() => addToWholesaleCart(product)}
                    className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-1.5 ${
                      added 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-[#1A1918] hover:bg-[#C5A059] text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Request</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bulk ({product.min_wholesale_qty} Pcs)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
