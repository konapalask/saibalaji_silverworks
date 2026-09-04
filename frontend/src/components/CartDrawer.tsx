import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, CheckCircle2, AlertCircle, MessageSquare, Briefcase } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { generateOrderId, generateFullCartWhatsAppMessage, openWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { OrderSuccessModal } from './OrderSuccessModal';

export const CartDrawer: React.FC = () => {
  const { user } = useAuth();
  const { 
    effectiveCartItems, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    isCartOpen, 
    setIsCartOpen,
    totalQuantity,
    cartType,
    isWholesale,
    WHOLESALE_MOQ,
    itemsToWholesale,
    clearCart
  } = useCart();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState<any>(null);

  if (!isCartOpen) {
    if (isSuccessModalOpen && successOrderData) {
      return (
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
      );
    }
    return null;
  }


  const tax = Math.round(subtotal * 0.03);
  const shipping = 0; // No shipping fee
  const grandTotal = subtotal + tax;

  const progressPercent = Math.min(100, Math.round((totalQuantity / WHOLESALE_MOQ) * 100));

  const handleOrderCartOnWhatsApp = async () => {
    // 1. Mandatory login check
    if (!user) {
      sessionStorage.setItem('sbs_open_cart_after_login', 'true');
      setIsCartOpen(false);
      navigate(`/account/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // 2. Direct order placement for logged in user (no address modal)
    setIsSubmitting(true);
    try {
      const orderId = generateOrderId();
      const customer = {
        name: user.full_name || user.email.split('@')[0],
        mobile: user.phone || 'Not Provided',
        address: user.street_address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        notes: ''
      };

      const orderItems = effectiveCartItems.map(item => ({
        id: item.product.id,
        product_id: item.product.id,
        product_name: item.product.title,
        product_sku: item.product.sku,
        measurement: item.selected_measurement || item.selected_variant?.measurement || item.product.dimensions,
        weight_g: item.weight_g ?? item.selected_variant?.weight_g ?? item.product.weight_g,
        unit_price: item.effectivePrice,
        quantity: item.quantity,
        subtotal: item.itemSubtotal,
        featured_image: item.product.featured_image,
        image_url: item.product.featured_image
      }));

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
        grand_total: grandTotal,
        status: 'Order Confirmed'
      });

      const rawMessage = generateFullCartWhatsAppMessage(orderId, customer, {
        items: effectiveCartItems,
        totalQuantity,
        cartType,
        subtotal,
        tax,
        shipping: 0,
        grandTotal
      });

      setSuccessOrderData({
        orderNumber: orderId,
        customerName: customer.name,
        grandTotal,
        items: effectiveCartItems.map(item => ({
          title: item.product.title,
          product_name: item.product.title,
          sku: item.product.sku,
          quantity: item.quantity,
          measurement: item.selected_measurement || item.selected_variant?.measurement || item.product.dimensions,
          effectivePrice: item.effectivePrice,
          featured_image: item.product.featured_image
        })),
        whatsappMessage: rawMessage
      });

      clearCart();
      setIsCartOpen(false);
      setIsSuccessModalOpen(true);
      openWhatsAppOrderUrl(rawMessage);
    } catch (err) {
      console.error('Failed to create WhatsApp order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[#1A1918]">
      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#1A1918]/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F6F1] shadow-2xl flex flex-col justify-between border-l border-[#E5E0D8]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E5E0D8] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#B9A77A]" />
                <h2 className="font-serif text-xl font-bold text-[#202020]">Your Shopping Bag</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-gray-400 hover:text-[#202020] rounded-full hover:bg-[#F1EFEB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Cart Mode Banner & Progress Indicator */}
            {totalQuantity > 0 && (
              <div className={`p-3.5 rounded-xl border transition-all ${
                isWholesale 
                  ? 'bg-[#202020] border-[#B9A77A] text-white shadow-xs' 
                  : 'bg-[#F8F6F1] border-[#E5E0D8] text-[#202020]'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    isWholesale 
                      ? 'bg-[#B9A77A] text-[#202020]' 
                      : 'bg-[#202020] text-white'
                  }`}>
                    🛒 {cartType} CART
                  </span>
                  <span className="text-[11px] font-bold">
                    {totalQuantity} / {WHOLESALE_MOQ} Items
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isWholesale ? 'bg-[#B9A77A]' : 'bg-[#202020]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Status Message */}
                <div className="text-[11px] font-medium flex items-center gap-1.5">
                  {isWholesale ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B9A77A] shrink-0" />
                      <span className="text-gray-200">🎉 Wholesale Pricing Unlocked! (Admin Requisition Mode)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#B9A77A] shrink-0" />
                      <span className="text-gray-600">
                        Add <strong className="text-[#202020]">{itemsToWholesale} more item(s)</strong> to unlock Wholesale Pricing (MOQ: {WHOLESALE_MOQ})
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {effectiveCartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6E1DA]/50 flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-xl font-bold text-[#1A1918]">Your cart is empty</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Discover our handcrafted 925 sterling silver & 999 fine silver collections.</p>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/category/silver-pooja-articles');
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#1A1918] text-white rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              effectiveCartItems.map(({ product, quantity, effectivePrice, hasWholesalePrice, itemSubtotal, selected_measurement, variant_id, weight_g }) => {
                const varKey = variant_id || selected_measurement || 'default';
                return (
                  <div key={`${product.id}-${varKey}`} className="flex gap-3 p-3 bg-white rounded-2xl border border-[#E6E1DA] shadow-xs">
                    <div className="w-28 sm:w-32 aspect-3/2 bg-black rounded-xl p-0.5 overflow-hidden shrink-0 border border-gray-900 flex items-center justify-center">
                      <img 
                        src={product.featured_image} 
                        alt={product.title}
                        className="w-full h-full object-contain scale-115 sm:scale-120 bg-black"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1">{product.title}</h4>
                          <button 
                            onClick={() => removeFromCart(product.id, varKey)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {selected_measurement && (
                            <span className="text-[10px] font-bold bg-[#1A1918] text-white px-2 py-0.5 rounded-full">
                              Weight: {selected_measurement.includes('inch') ? `${weight_g || product.weight_g}g` : selected_measurement}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-mono">SKU: {product.sku} | {weight_g || product.weight_g}g</span>
                        </div>

                        {/* Pricing Tag */}
                        <div className="mt-1">
                          {isWholesale ? (
                            <span className="text-xs font-bold text-[#C5A059]">B2B Wholesale Requisition</span>
                          ) : (
                            <span className="text-xs font-bold text-[#1A1918]">₹{effectivePrice.toLocaleString()} / unit</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center border border-[#E6E1DA] rounded-lg bg-[#FAF9F5]">
                          <button 
                            onClick={() => updateQuantity(product.id, quantity - 1, varKey)}
                            className="p-1 text-gray-600 hover:text-black transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold">{quantity} Pcs</span>
                          <button 
                            onClick={() => updateQuantity(product.id, quantity + 1, varKey)}
                            className="p-1 text-gray-600 hover:text-black transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isWholesale && (
                          <span className="text-xs font-bold text-[#1A1918]">
                            ₹{itemSubtotal.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Calculations */}
          {effectiveCartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E6E1DA] space-y-3">
              {!isWholesale ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalQuantity} items)</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (3% Silver Tax)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1A1918] pt-2 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span className="text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#C5A059]/30 text-center space-y-1">
                  <p className="text-xs font-bold text-[#1A1918]">B2B Wholesale Requisition List ({totalQuantity} Items)</p>
                  <p className="text-[10px] text-gray-500">Official B2B PDF Quotation will be issued by Admin upon submission.</p>
                </div>
              )}

              <div className="space-y-2">
                {/* RETAIL vs WHOLESALE ACTION BUTTONS */}
                {!isWholesale ? (
                  /* WHATSAPP IS ONLY FOR RETAIL ORDERS */
                  <button 
                    onClick={handleOrderCartOnWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>ORDER RETAIL CART ON WHATSAPP</span>
                  </button>
                ) : (
                  <>
                    {/* WHOLESALE BOOKINGS SUBMIT TO ADMIN DB & ADMIN WHATSAPP WITH PDF LINK */}
                    <button 
                      onClick={() => {
                        if (!user) {
                          sessionStorage.setItem('sbs_open_cart_after_login', 'true');
                          setIsCartOpen(false);
                          navigate(`/account/login?redirect=${encodeURIComponent('/wholesale/request')}`);
                          return;
                        }
                        setIsCartOpen(false);
                        navigate('/wholesale/request');
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>SUBMIT WHOLESALE BOOKING ON WHATSAPP</span>
                    </button>

                    <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[10px] text-gray-500 text-center border border-[#C5A059]/30">
                      ℹ️ Submits request to Admin Dashboard & launches Admin WhatsApp with auto-generated B2B PDF Quotation.
                    </div>
                  </>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
