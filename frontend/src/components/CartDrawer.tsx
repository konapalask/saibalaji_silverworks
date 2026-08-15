import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, CheckCircle2, AlertCircle, MessageSquare, Briefcase } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WhatsAppOrderModal } from './WhatsAppOrderModal';
import { FullCartOrder } from '../utils/whatsappOrder';

export const CartDrawer: React.FC = () => {
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
    itemsToWholesale
  } = useCart();
  const navigate = useNavigate();

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappCartData, setWhatsappCartData] = useState<FullCartOrder | null>(null);

  if (!isCartOpen) return null;

  const tax = Math.round(subtotal * 0.03);
  const shipping = 0; // No shipping fee
  const grandTotal = subtotal + tax;

  const progressPercent = Math.min(100, Math.round((totalQuantity / WHOLESALE_MOQ) * 100));

  const handleOrderCartOnWhatsApp = () => {
    setWhatsappCartData({
      items: effectiveCartItems,
      totalQuantity,
      cartType,
      subtotal,
      tax,
      shipping: 0,
      grandTotal
    });
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[#1A1918]">
      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#1A1918]/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F5] shadow-2xl flex flex-col justify-between border-l border-[#C5A059]/40">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E6E1DA] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
                <h2 className="font-serif text-xl font-bold text-[#1A1918]">Your Shopping Bag</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Cart Mode Banner & Progress Indicator */}
            {totalQuantity > 0 && (
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isWholesale 
                  ? 'bg-[#1A1918] border-[#C5A059] text-white shadow-md' 
                  : 'bg-white border-[#E6E1DA] text-[#1A1918]'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    isWholesale 
                      ? 'bg-[#C5A059] text-[#1A1918]' 
                      : 'bg-[#1A1918] text-white'
                  }`}>
                    🛒 {cartType} CART
                  </span>
                  <span className="text-[11px] font-bold">
                    {totalQuantity} / {WHOLESALE_MOQ} Items
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E6E1DA]/40 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isWholesale ? 'bg-[#C5A059]' : 'bg-[#1A1918]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Status Message */}
                <div className="text-[11px] font-medium flex items-center gap-1.5">
                  {isWholesale ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="text-gray-200">🎉 Wholesale Pricing Unlocked! (Admin Requisition Mode)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="text-gray-600">
                        Add <strong className="text-[#1A1918]">{itemsToWholesale} more item(s)</strong> to unlock Wholesale Pricing (MOQ: {WHOLESALE_MOQ})
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
              effectiveCartItems.map(({ product, quantity, effectivePrice, hasWholesalePrice, itemSubtotal }) => (
                <div key={product.id} className="flex gap-3 p-3 bg-white rounded-2xl border border-[#E6E1DA] shadow-xs">
                  <img 
                    src={product.featured_image} 
                    alt={product.title}
                    className="w-20 h-24 object-cover rounded-xl bg-[#FAF9F5]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1">{product.title}</h4>
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500">SKU: {product.sku} | {product.weight_g}g</p>

                      {/* Pricing Tag */}
                      <div className="mt-1">
                        {isWholesale ? (
                          hasWholesalePrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#C5A059]">₹{effectivePrice.toLocaleString()} / unit</span>
                              <span className="text-[9px] bg-[#C5A059]/15 text-[#C5A059] font-bold px-1.5 py-0.5 rounded">Wholesale</span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-[#1A1918]">₹{effectivePrice.toLocaleString()} / unit</span>
                              <div className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Wholesale rate unavailable (Retail applied)</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-xs font-bold text-[#1A1918]">₹{effectivePrice.toLocaleString()} / unit</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center border border-[#E6E1DA] rounded-lg bg-[#FAF9F5]">
                        <button 
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-gray-600 hover:text-black transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-gray-600 hover:text-black transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#1A1918]">
                        ₹{itemSubtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations */}
          {effectiveCartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E6E1DA] space-y-3">
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
                    {/* WHOLESALE ORDERS GO DIRECTLY TO ADMIN (NO WHATSAPP MSG) */}
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/wholesale/request');
                      }}
                      className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Briefcase className="w-4 h-4 text-[#C5A059]" />
                      <span>SUBMIT WHOLESALE BOOKING TO ADMIN</span>
                    </button>

                    <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[10px] text-gray-500 text-center border border-[#C5A059]/30">
                      ℹ️ Wholesale B2B bookings are submitted directly to the Admin Desk for ReportLab PDF Quotation issuance.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* WhatsApp Order Modal for Retail Cart */}
      {!isWholesale && (
        <WhatsAppOrderModal 
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          fullCartOrder={whatsappCartData}
        />
      )}
    </div>
  );
};
