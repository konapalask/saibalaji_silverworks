import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCw, ShoppingBag, Briefcase, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWholesale } from '../context/WholesaleContext';
import api from '../services/api';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'silver' | 'care'>('desc');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToWholesaleCart } = useWholesale();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        setActiveImage(res.data.featured_image);

        // Fetch related products
        const relRes = await api.get(`/products?category_id=${res.data.category_id}&limit=4`);
        setRelated(relRes.data.filter((p: Product) => p.id !== res.data.id));
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"></div>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-[#C5A059]">Home</Link>
        <span>/</span>
        <Link to="/shop/retail" className="hover:text-[#C5A059]">Retail Shop</Link>
        <span>/</span>
        <span className="text-[#1A1918] font-semibold">{product.title}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side Gallery with Editorial Arch Styling */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#F4EFEA] border border-[#C5A059]/40 p-4 rounded-3xl overflow-hidden shadow-lg">
            <div className="arch-top overflow-hidden bg-white p-2 aspect-4/5 w-full">
              <img 
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-cover rounded-t-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button 
                onClick={() => setActiveImage(product.featured_image)}
                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === product.featured_image ? 'border-[#C5A059]' : 'border-transparent opacity-60'
                }`}
              >
                <img src={product.featured_image} alt="" className="w-full h-full object-cover" />
              </button>
              {product.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img.image_url ? 'border-[#C5A059]' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#1A1918] text-[#FAF9F5] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                {product.silver_purity}
              </span>
              <span className="bg-[#FAF9F5] text-[#1A1918] border border-[#E6E1DA] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Weight: {product.weight_g}g
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">{product.title}</h1>
            <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-sans text-4xl font-bold text-[#1A1918]">
                ₹{product.retail_price.toLocaleString()}
              </span>
              {product.wholesale_price && (
                <span className="text-xs text-[#C5A059] font-semibold bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#C5A059]/30">
                  Bulk Wholesale Quote Available
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            {/* Guarantees */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-[#E6E1DA] text-center text-xs">
              <div>
                <ShieldCheck className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                <span className="font-bold text-[11px] block">NABL Hallmarked</span>
                <span className="text-[10px] text-gray-500">100% Pure Silver</span>
              </div>
              <div>
                <Truck className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                <span className="font-bold text-[11px] block">Insured Transit</span>
                <span className="text-[10px] text-gray-500">Safe Delivery</span>
              </div>
              <div>
                <RefreshCw className="w-5 h-5 text-[#C5A059] mx-auto mb-1" />
                <span className="font-bold text-[11px] block">Direct Factory</span>
                <span className="text-[10px] text-gray-500">Hyderabad Unit</span>
              </div>
            </div>
          </div>

          {/* Buying Actions */}
          <div className="space-y-4 pt-6 border-t border-[#E6E1DA]">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E6E1DA] rounded-2xl bg-white px-4 py-3">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-gray-500 font-bold px-2"
                >
                  -
                </button>
                <span className="font-bold text-sm px-4">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="text-gray-500 font-bold px-2"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-2xl text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {added ? <Check className="w-4 h-4 text-green-400" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{added ? 'Added to Bag' : 'Add to Shopping Bag'}</span>
              </button>

              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#E6E1DA] bg-white text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button 
              onClick={handleBuyNow}
              className="w-full bg-[#C5A059] hover:bg-[#1A1918] text-white py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Buy Now Direct</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => addToWholesaleCart(product)}
              className="w-full bg-white border border-[#C5A059] text-[#1A1918] hover:bg-[#1A1918] hover:text-white py-3 rounded-2xl text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-[#C5A059]" />
              <span>Add to B2B Wholesale Request List</span>
            </button>
          </div>

        </div>

      </div>

      {/* Tabs Section */}
      <div className="mt-16 bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-sm">
        <div className="flex border-b border-[#E6E1DA] space-x-8 text-xs font-bold uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`pb-3 ${activeTab === 'desc' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-3 ${activeTab === 'specs' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab('silver')}
            className={`pb-3 ${activeTab === 'silver' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Silver Purity Details
          </button>
          <button 
            onClick={() => setActiveTab('care')}
            className={`pb-3 ${activeTab === 'care' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Care Instructions
          </button>
        </div>

        <div className="py-6 text-xs text-gray-700 leading-relaxed font-sans">
          {activeTab === 'desc' && (
            <p>{product.description || 'Artisanal silver masterpiece crafted at Sai Balaji Silverworks manufacturing facility.'}</p>
          )}
          {activeTab === 'specs' && (
            <p className="whitespace-pre-line">{product.specifications || `Material: ${product.silver_purity}\nWeight: ${product.weight_g} grams\nSKU: ${product.sku}`}</p>
          )}
          {activeTab === 'silver' && (
            <p>Every piece crafted by Sai Balaji Silverworks is subjected to strict XRF spectroscopic testing and laser hallmarking, guaranteeing standard 925 sterling or 999 fine silver composition.</p>
          )}
          {activeTab === 'care' && (
            <p>Keep your silver creations away from harsh chemicals and direct perfume spray. Wipe gently with a soft micro-fiber polish cloth provided with your shipment.</p>
          )}
        </div>
      </div>

    </div>
  );
};
