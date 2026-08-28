import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCw, ShoppingBag, Briefcase, Sparkles, Check, ArrowRight, MessageSquare, Share2, Copy, X } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWholesale } from '../context/WholesaleContext';
import { useAuth } from '../context/AuthContext';
import { generateOrderId, generateSingleProductWhatsAppMessage, openWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { useLiveSilver } from '../context/LiveSilverContext';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import api from '../services/api';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { calculateCurrentPrice } = useLiveSilver();

  const { calculateDynamicPrice, silverStats } = useLiveSilver();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'silver' | 'care'>('desc');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [added, setAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState<any>(null);

  const { cart, addToCart, updateQuantity, isWholesale, cartType, setIsCartOpen } = useCart();
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

        // Compute or select initial variant
        let initialVar = null;
        if (Array.isArray(res.data.variants) && res.data.variants.length > 0) {
          initialVar = res.data.variants[0];
        } else {
          const baseW = res.data.weight_g || 25;
          const baseMC = res.data.making_charges || 300;
          const baseDim = res.data.dimensions || '2 inch';
          initialVar = {
            id: 'v-1',
            measurement: baseDim.includes('inch') || baseDim.includes('cm') ? baseDim : '2 inch',
            weight_g: baseW,
            making_charge: baseMC,
            making_charge_type: res.data.making_charge_type || 'fixed',
            sku: res.data.sku,
            stock: res.data.stock || 10,
            is_active: true
          };
        }
        setSelectedVariant(initialVar);

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

  // Compute available variants (synthesize 2", 3", 4", 6" if explicit variants list is empty)
  const availableVariants = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.filter(v => v.is_active !== false);
    }

    const baseW = product.weight_g || 25;
    const baseMC = product.making_charges || 300;
    const baseMcType = product.making_charge_type || 'fixed';

    return [
      { id: 'v-2', measurement: '2 inch', weight_g: baseW, making_charge: baseMC, making_charge_type: baseMcType, sku: `${product.sku}-2IN`, stock: product.stock },
      { id: 'v-3', measurement: '3 inch', weight_g: Math.round(baseW * 1.6), making_charge: Math.round(baseMC * 1.5), making_charge_type: baseMcType, sku: `${product.sku}-3IN`, stock: product.stock },
      { id: 'v-4', measurement: '4 inch', weight_g: Math.round(baseW * 2.5), making_charge: Math.round(baseMC * 2.2), making_charge_type: baseMcType, sku: `${product.sku}-4IN`, stock: product.stock },
      { id: 'v-6', measurement: '6 inch', weight_g: Math.round(baseW * 4.0), making_charge: Math.round(baseMC * 3.5), making_charge_type: baseMcType, sku: `${product.sku}-6IN`, stock: product.stock }
    ];
  }, [product]);

  const activeVar = selectedVariant || availableVariants[0] || { weight_g: product?.weight_g || 25, making_charge: product?.making_charges || 300, making_charge_type: 'fixed', measurement: product?.dimensions || 'Standard' };

  // Sync quantity state per active size variant with cart
  useEffect(() => {
    if (!product || !activeVar) return;
    const varId = activeVar.id || activeVar.measurement || 'default';
    const cartItem = cart.find((i) => {
      const itemVarId = i.variant_id || i.selected_measurement || 'default';
      return i.product.id === product.id && (itemVarId === varId || i.selected_measurement === activeVar.measurement);
    });
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(1);
    }
  }, [selectedVariant, product, cart, availableVariants, activeVar]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"></div>
      </div>
    );
  }

  const priceBreakdown = calculateDynamicPrice(activeVar.weight_g, activeVar.making_charge, activeVar.making_charge_type || 'fixed', product.silver_purity);

  const isLiked = isInWishlist(product.id);

  // Cart item matching active variant
  const activeVarId = activeVar?.id || activeVar?.measurement || 'default';
  const currentCartItem = cart.find((i) => {
    const itemVarId = i.variant_id || i.selected_measurement || 'default';
    return i.product.id === product.id && (itemVarId === activeVarId || i.selected_measurement === activeVar?.measurement);
  });

  const currentCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const isItemInCart = currentCartQty > 0;
  const activeQty = isItemInCart ? currentCartQty : qty;
  const isWholesaleMode = isWholesale || activeQty >= (product.min_wholesale_qty || 5);

  const handleAddToCart = () => {
    if (isItemInCart) {
      setIsCartOpen(true);
    } else {
      addToCart(product, 1, activeVar);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, qty, activeVar);
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on Sai Balaji Silverworks`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // User cancelled share
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
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
        cartType,
        selected_measurement: activeVar?.measurement || product.dimensions,
        selected_variant: activeVar,
        weight_g: activeVar?.weight_g ?? product.weight_g
      };

      const orderItems = [{
        id: product.id,
        product_id: product.id,
        product_name: product.title,
        product_sku: product.sku,
        measurement: activeVar?.measurement || product.dimensions,
        weight_g: activeVar?.weight_g ?? product.weight_g,
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
        status: 'Order Confirmed'
      });

      const rawMessage = generateSingleProductWhatsAppMessage(orderId, customer, singleOrder);

      setSuccessOrderData({
        orderNumber: orderId,
        customerName: customer.name,
        grandTotal: subtotal + tax,
        items: [{
          title: product.title,
          product_name: product.title,
          sku: product.sku,
          quantity: qty,
          measurement: activeVar?.measurement || product.dimensions,
          effectivePrice: unitPrice,
          featured_image: product.featured_image
        }],
        whatsappMessage: rawMessage
      });

      setIsSuccessModalOpen(true);
      openWhatsAppOrderUrl(rawMessage);
    } catch (err) {
      console.error('Error placing single WhatsApp order:', err);
    } finally {
      setIsSubmittingWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#202020]">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-[#666666] mb-3 flex items-center gap-2">
        <Link to="/" className="hover:text-[#B9A77A]">Home</Link>
        <span>/</span>
        <Link to="/shop/retail" className="hover:text-[#B9A77A]">Retail</Link>
        <span>/</span>
        <span className="text-[#202020] font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Side Gallery — Clean Uncropped Display */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative bg-black border border-gray-800 p-2.5 rounded-3xl overflow-hidden product-shadow flex items-center justify-center aspect-3/2 max-h-[360px] lg:max-h-[400px]">
            <img 
              src={activeImage} 
              alt={product.title} 
              className="w-full h-full object-cover rounded-2xl drop-shadow-xl transition-all duration-500 bg-black"
            />
            {/* Top Right Floating Actions Overlay: Wishlist (top) & Share (down the like button) */}
            <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex flex-col gap-2 sm:gap-2.5 z-10">
              {/* Like / Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-1.5 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  isLiked ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-white/90 text-gray-700 hover:text-red-500 border border-[#E5E0D8]'
                }`}
                title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button (down the like button) */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-1.5 sm:p-2.5 rounded-full backdrop-blur-md bg-white/90 text-gray-700 hover:text-[#C5A059] border border-[#E5E0D8] transition-all shadow-md cursor-pointer"
                title="Share Product"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {(() => {
            const validGalleryImages = (product.images || []).filter(
              (img) => img && img.image_url && typeof img.image_url === 'string' && img.image_url.trim() !== '' && img.image_url !== product.featured_image
            );
            if (validGalleryImages.length === 0) return null;
            return (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                <button 
                  onClick={() => setActiveImage(product.featured_image)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 p-1 bg-black transition-all cursor-pointer ${
                    activeImage === product.featured_image ? 'border-[#B9A77A] shadow-xs' : 'border-[#E5E0D8] opacity-70'
                  }`}
                >
                  <img src={product.featured_image} alt="" className="w-full h-full object-contain bg-black" />
                </button>
                {validGalleryImages.map((img) => (
                  <button 
                    key={img.id || img.image_url}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 p-1 bg-black transition-all cursor-pointer ${
                      activeImage === img.image_url ? 'border-[#B9A77A] shadow-xs' : 'border-[#E5E0D8] opacity-70'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-contain bg-black" />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right Side Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#202020] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B9A77A]" />
                {product.silver_purity}
              </span>
              {(product.net_silver_weight_g || product.weight_g > 0) && (
                <span className="bg-white text-[#202020] border border-[#E5E0D8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Net: {product.net_silver_weight_g || product.weight_g}g
                </span>
              )}
              {product.gross_weight_g && product.gross_weight_g !== (product.net_silver_weight_g || product.weight_g) && (
                <span className="bg-[#FAF9F5] text-gray-600 border border-[#E5E0D8] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  Gross: {product.gross_weight_g}g
                </span>
              )}
              {product.dimensions && (
                <span className="bg-[#FAF9F5] text-[#C5A059] border border-[#C5A059]/30 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {product.dimensions}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020]">{product.title}</h1>
            <p className="text-[11px] text-[#777777] mt-0.5">SKU: {activeVar?.sku || product.sku} {product.subcategory ? `| ${product.subcategory}` : ''}</p>

            {/* DYNAMIC PRICE DISPLAY */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-sans text-3xl font-bold text-[#202020]">
                  ₹{priceBreakdown.finalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#C5A059] font-bold bg-[#FAF9F5] px-2.5 py-0.5 rounded-full border border-[#C5A059]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Silver Rate
                </span>
              </div>

              {/* Dynamic Formula Breakdown Pill */}
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E0D8] text-[11px] grid grid-cols-3 gap-2 text-center shadow-2xs">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-semibold">Net Weight</span>
                  <span className="font-bold text-[#202020] font-mono">{priceBreakdown.weight} g</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-semibold">Live Rate</span>
                  <span className="font-bold text-[#C5A059] font-mono">₹{priceBreakdown.silverRate}/g</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-semibold">Making Charge</span>
                  <span className="font-bold text-[#202020] font-mono">₹{priceBreakdown.makingCharge.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* MEASUREMENT / SIZE SELECTOR BUTTONS (HORIZONTAL SCROLL ON MOBILE) */}
            {availableVariants.length > 0 && (
              <div className="mt-3 space-y-1.5 bg-white p-3 rounded-2xl border border-[#E5E0D8]">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase font-bold text-[#202020] tracking-wider">
                    Select Measurement / Size:
                  </span>
                  <span className="text-[11px] font-bold text-[#C5A059]">
                    {activeVar?.measurement} ({activeVar?.weight_g}g)
                  </span>
                </div>

                <div className="flex gap-2 pt-0.5 overflow-x-auto scrollbar-none pb-1 whitespace-nowrap max-w-full">
                  {availableVariants.map((variant) => {
                    const isSelected = activeVar?.id === variant.id || activeVar?.measurement === variant.measurement;
                    const vCalc = calculateDynamicPrice(variant.weight_g, variant.making_charge, variant.making_charge_type || 'fixed', product.silver_purity);
                    return (
                      <button
                        key={variant.id || variant.measurement}
                        onClick={() => {
                          setSelectedVariant(variant);
                          if (variant.image) setActiveImage(variant.image);
                        }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border flex flex-col items-center gap-0.5 cursor-pointer shrink-0 min-w-[95px] sm:min-w-[110px] ${
                          isSelected
                            ? 'bg-[#1A1918] text-white border-[#1A1918] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#202020] border-[#E5E0D8] hover:border-[#C5A059]'
                        }`}
                      >
                        <span className="font-serif text-xs">{variant.measurement}</span>
                        <span className={`text-[9.5px] font-mono ${isSelected ? 'text-[#C5A059]' : 'text-gray-500'}`}>
                          ₹{vCalc.finalPrice.toLocaleString()} ({variant.weight_g}g)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-2.5">
              <p className="text-[11px] text-[#555555] leading-relaxed font-sans line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Guarantees */}
            <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-white rounded-xl border border-[#E5E0D8] text-center text-xs">
              <div>
                <ShieldCheck className="w-4 h-4 text-[#B9A77A] mx-auto mb-0.5" />
                <span className="font-bold text-[10px] block text-[#202020]">NABL Hallmarked</span>
                <span className="text-[9px] text-[#666666]">100% Pure Silver</span>
              </div>
              <div>
                <Truck className="w-4 h-4 text-[#B9A77A] mx-auto mb-0.5" />
                <span className="font-bold text-[10px] block text-[#202020]">Insured Transit</span>
                <span className="text-[9px] text-[#666666]">Safe Delivery</span>
              </div>
              <div>
                <RefreshCw className="w-4 h-4 text-[#B9A77A] mx-auto mb-0.5" />
                <span className="font-bold text-[10px] block text-[#202020]">Direct Factory</span>
                <span className="text-[9px] text-[#666666]">Tenali Unit</span>
              </div>
            </div>
          </div>

          {/* Buying Actions — Full Width on Mobile */}
          <div className="space-y-3 pt-6 border-t border-[#E5E0D8]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Stepper appears ONLY when variant is added to cart */}
              {isItemInCart && (
                <div className="flex items-center justify-between border border-[#E6E1DA] rounded-2xl bg-white px-4 py-3 sm:w-auto shadow-2xs">
                  <button 
                    onClick={() => updateQuantity(product.id, currentCartQty - 1, activeVarId)}
                    className="text-[#1A1918] hover:text-[#C5A059] font-bold px-2 text-base transition-colors cursor-pointer"
                    title="Decrease Quantity"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm px-4 font-mono text-[#1A1918]">{currentCartQty}</span>
                  <button 
                    onClick={() => updateQuantity(product.id, currentCartQty + 1, activeVarId)}
                    className="text-[#1A1918] hover:text-[#C5A059] font-bold px-2 text-base transition-colors cursor-pointer"
                    title="Increase Quantity"
                  >
                    +
                  </button>
                </div>
              )}

              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-4 sm:py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {added || isItemInCart ? <Check className="w-4 h-4 text-green-400" /> : <ShoppingBag className="w-4 h-4 text-[#C5A059]" />}
                <span>{isItemInCart ? 'IN SHOPPING BAG (VIEW BAG)' : 'ADD TO SHOPPING BAG'}</span>
              </button>
            </div>

            {/* Dynamic WhatsApp vs B2B Wholesale Button Toggle */}
            {!isWholesaleMode ? (
              <button 
                onClick={handleBuyNowOnWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>BUY NOW ON WHATSAPP</span>
              </button>
            ) : (
              <button 
                onClick={() => addToWholesaleCart(product, Math.max(activeQty, product.min_wholesale_qty || 5))}
                className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-[#C5A059]" />
                <span>ADD TO B2B WHOLESALE REQUEST LIST</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Tabs Section — Horizontally Scrollable Header on Mobile */}
      <div className="mt-12 sm:mt-16 bg-white border border-[#E6E1DA] rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="flex border-b border-[#E6E1DA] gap-6 overflow-x-auto scrollbar-none pb-2 whitespace-nowrap text-xs font-bold uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`shrink-0 pb-3 ${activeTab === 'desc' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`shrink-0 pb-3 ${activeTab === 'specs' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab('silver')}
            className={`shrink-0 pb-3 ${activeTab === 'silver' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
          >
            Silver Purity Details
          </button>
          <button 
            onClick={() => setActiveTab('care')}
            className={`shrink-0 pb-3 ${activeTab === 'care' ? 'border-b-2 border-[#C5A059] text-[#1A1918]' : 'text-gray-400'}`}
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

      {/* Share Product Modal with 2 Options (Copy Link & WhatsApp) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 border border-[#E5E0D8] shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif text-lg font-bold text-[#1A1918]">Share Product</h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-[#1A1918] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Share <strong>{product.title}</strong> with your contacts.
            </p>

            <div className="space-y-3 pt-1">
              {/* Option 1: Copy Link */}
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2000);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full bg-[#FAF8F5] hover:bg-[#F0ECE6] border border-[#E5E0D8] text-[#1A1918] py-3.5 px-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-xl text-[#C5A059] border border-[#E5E0D8]">
                    {copiedShare ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </span>
                  <span className="font-bold">{copiedShare ? 'Link Copied to Clipboard!' : 'Copy Link'}</span>
                </div>
                {copiedShare && <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Copied</span>}
              </button>

              {/* Option 2: Share via WhatsApp */}
              <button
                onClick={() => {
                  const shareText = `Check out ${product.title} on Sai Balaji Silverworks: ${window.location.href}`;
                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                  window.open(waUrl, '_blank');
                  setIsShareModalOpen(false);
                }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer shadow-sm"
              >
                <span className="p-2 bg-white/20 rounded-xl text-white">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </span>
                <span>Share via WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {successOrderData && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          orderNumber={successOrderData.orderNumber}
          customerName={successOrderData.customerName}
          grandTotal={successOrderData.grandTotal}
          items={successOrderData.items}
          whatsappMessage={successOrderData.whatsappMessage}
          isWholesale={false}
        />
      )}

    </div>
  );
};
