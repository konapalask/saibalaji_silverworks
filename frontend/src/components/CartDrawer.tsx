import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const tax = Math.round(subtotal * 0.03);
  const shipping = subtotal > 5000 || cart.length === 0 ? 0 : 150;
  const grandTotal = subtotal + tax + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#1A1918]/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F5] shadow-2xl flex flex-col justify-between border-l border-[#C5A059]/40">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E6E1DA] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-serif text-2xl font-bold text-[#1A1918]">Your Shopping Bag</h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6E1DA]/50 flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-xl font-bold text-[#1A1918]">Your cart is empty</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Discover our handcrafted 925 sterling silver & 999 fine silver collections.</p>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop/retail');
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#1A1918] text-white rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-3 bg-white rounded-xl border border-[#E6E1DA] shadow-sm">
                  <img 
                    src={product.featured_image} 
                    alt={product.title}
                    className="w-20 h-24 object-cover rounded-lg bg-[#FAF9F5]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1">{product.title}</h4>
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500">Purity: {product.silver_purity} | {product.weight_g}g</p>
                      <p className="text-xs font-bold text-[#C5A059] mt-1">₹{product.retail_price.toLocaleString()}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center border border-[#E6E1DA] rounded-lg bg-[#FAF9F5]">
                        <button 
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#1A1918]">
                        ₹{(product.retail_price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E6E1DA] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (3% Silver Tax)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Insured Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1A1918] pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
