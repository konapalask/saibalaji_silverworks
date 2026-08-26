import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCw, ShoppingBag, Briefcase, Sparkles, Check, ArrowRight, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWholesale } from '../context/WholesaleContext';
import { useAuth } from '../context/AuthContext';
import { generateOrderId, generateSingleProductWhatsAppMessage, openWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { useLiveSilver } from '../context/LiveSilverContext';
import api from '../services/api';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { calculateCurrentPrice } = useLiveSilver();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'silver' | 'care'>('desc');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [added, setAdded] = useState(false);

  const { addToCart, isWholesale, cartType } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToWholesaleCart } = useWholesale();

  const [isSubmittingWhatsApp, setIsSubmittingWhatsApp] = useState(false);

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

  const handleBuyNowOnWhatsApp = async () => {
    if (!product) return;

    if (!user) {
      sessionStorage.setItem('sbs_open_cart_after_login', 'true');
      navigate(`/account/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmittingWhatsApp(true);
    try {
      const orderId = generateOrderId();
      const unitPrice = (isWholesale && product.wholesale_price) 
        ? product.wholesale_price 
        : product.retail_price;

      const customer = {
        name: user.full_name || user.email.split('@')[0],
        mobile: user.phone || 'Not Provided',
        address: user.street_address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        notes: ''
      };

      const singleOrder = {
        product,
        quantity: qty,
        unitPrice,
        cartType
      };

      const orderItems = [{
        id: product.id,
        product_id: product.id,
        product_name: product.title,
        product_sku: product.sku,
        unit_price: unitPrice,
        quantity: qty,
        subtotal: unitPrice * qty,
        featured_image: product.featured_image,
        image_url: product.featured_image
      }];

      const subtotal = unitPrice * qty;
      const tax = Math.round(subtotal * 0.03);

      await api.post('/orders', {
        order_number: orderId,
        user_id: user.id,
        customer_name: customer.name,
        customer_email: user.email,
        customer_phone: customer.mobile,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_pincode: customer.pincode,
        items: orderItems,
        subtotal,
        tax_amount: tax,
        shipping_charge: 0,
        grand_total: subtotal + tax,
        status: 'Order Placed'
      });

      const rawMessage = generateSingleProductWhatsAppMessage(orderId, customer, singleOrder);
      openWhatsAppOrderUrl(rawMessage);
    } catch (err) {
      console.error('Error placing single WhatsApp order:', err);
    } finally {
      setIsSubmittingWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#202020]">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-[#666666] mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-[#B9A77A]">Home</Link>
        <span>/</span>
        <Link to="/shop/retail" className="hover:text-[#B9A77A]">Retail Store</Link>
        <span>/</span>
        <span className="text-[#202020] font-semibold">{product.title}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side Gallery — Clean Uncropped Display */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#E5E0D8] p-3 rounded-3xl overflow-hidden product-shadow flex items-center justify-center aspect-3/2">
            <img 
              src={activeImage} 
              alt={product.title} 
              className="w-full h-full object-cover rounded-2xl drop-shadow-xl transition-all duration-500"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button 
                onClick={() => setActiveImage(product.featured_image)}
                className={`w-20 h-24 rounded-xl overflow-hidden border-2 p-1 bg-white transition-all ${
                  activeImage === product.featured_image ? 'border-[#B9A77A] shadow-xs' : 'border-[#E5E0D8] opacity-70'
                }`}
              >
                <img src={product.featured_image} alt="" className="w-full h-full object-contain" />
              </button>
              {product.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 p-1 bg-white transition-all ${
                    activeImage === img.image_url ? 'border-[#B9A77A] shadow-xs' : 'border-[#E5E0D8] opacity-70'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#202020] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#B9A77A]" />
                {product.silver_purity}
              </span>
              {(product.net_silver_weight_g || product.weight_g > 0) && (
                <span className="bg-white text-[#202020] border border-[#E5E0D8] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Net Weight: {product.net_silver_weight_g || product.weight_g}g
                </span>
              )}
              {product.gross_weight_g && product.gross_weight_g !== (product.net_silver_weight_g || product.weight_g) && (
                <span className="bg-[#FAF9F5] text-gray-600 border border-[#E5E0D8] text-xs font-medium px-3 py-0.5 rounded-full">
                  Gross: {product.gross_weight_g}g
                </span>
              )}
              {product.dimensions && (
                <span className="bg-[#FAF9F5] text-[#C5A059] border border-[#C5A059]/30 text-xs font-medium px-3 py-0.5 rounded-full">
                  {product.dimensions}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#202020]">{product.title}</h1>
            <p className="text-xs text-[#777777] mt-1">SKU: {product.sku} {product.subcategory ? `| ${product.subcategory}` : ''}</p>

            <div className="mt-6 flex flex-wrap items-baseline gap-4">
              <span className="font-sans text-4xl font-bold text-[#202020]">
                ₹{calculateCurrentPrice(product.base_price || product.retail_price, product.base_silver_rate).toLocaleString()}
              </span>
              <span className="text-[11px] text-[#C5A059] font-bold bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#C5A059]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Price linked to live silver rate
              </span>
              {product.making_charges !== undefined && (
                <span className="text-xs text-gray-600 font-medium bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E6E1DA]">
                  Making Charges: {product.making_charges > 0 ? `₹${product.making_charges.toLocaleString()}` : 'Included'}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs text-[#555555] leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            {/* Guarantees */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-[#E5E0D8] text-center text-xs">
              <div>
                <ShieldCheck className="w-5 h-5 text-[#B9A77A] mx-auto mb-1" />
                <span className="font-bold text-[11px] block text-[#202020]">NABL Hallmarked</span>
                <span className="text-[10px] text-[#666666]">100% Pure Silver</span>
              </div>
              <div>
                <Truck className="w-5 h-5 text-[#B9A77A] mx-auto mb-1" />
                <span className="font-bold text-[11px] block text-[#202020]">Insured Transit</span>
                <span className="text-[10px] text-[#666666]">Safe Delivery</span>
              </div>
              <div>
                <RefreshCw className="w-5 h-5 text-[#B9A77A] mx-auto mb-1" />
                <span className="font-bold text-[11px] block text-[#202020]">Direct Factory</span>
                <span className="text-[10px] text-[#666666]">Tenali Unit</span>
              </div>
            </div>
          </div>

          {/* Buying Actions */}
          <div className="space-y-3 pt-6 border-t border-[#E5E0D8]">
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

            {/* BUY NOW ON WHATSAPP BUTTON */}
            <button 
              onClick={handleBuyNowOnWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>BUY NOW ON WHATSAPP</span>
            </button>

            <button 
              onClick={() => addToWholesaleCart(product)}
              className="w-full bg-white border border-[#C5A059] text-[#1A1918] hover:bg-[#1A1918] hover:text-white py-2.5 rounded-2xl text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
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
            <div className="space-y-2 max-w-lg">
              <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">Silver Purity:</span> <span className="font-bold text-[#1A1918]">{product.silver_purity}</span></div>
              <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">Net Silver Weight:</span> <span className="font-bold text-[#1A1918]">{product.net_silver_weight_g || product.weight_g} grams</span></div>
              {product.gross_weight_g && <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">Gross Weight:</span> <span className="font-bold text-[#1A1918]">{product.gross_weight_g} grams</span></div>}
              {product.making_charges !== undefined && <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">Making Charges:</span> <span className="font-bold text-[#1A1918]">{product.making_charges > 0 ? `₹${product.making_charges}` : 'Included'}</span></div>}
              {product.dimensions && <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">Dimensions:</span> <span className="font-bold text-[#1A1918]">{product.dimensions}</span></div>}
              <div className="grid grid-cols-2 py-1.5 border-b border-gray-100"><span className="font-semibold text-gray-500">SKU Code:</span> <span className="font-mono text-[#1A1918]">{product.sku}</span></div>
              <div className="grid grid-cols-2 py-1.5"><span className="font-semibold text-gray-500">Hallmarking:</span> <span className="font-bold text-[#C5A059]">NABL Laser Hallmarked</span></div>
            </div>
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
