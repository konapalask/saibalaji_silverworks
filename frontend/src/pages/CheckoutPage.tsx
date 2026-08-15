import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Package, User, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  generateOrderId, 
  generateFullCartWhatsAppMessage, 
  openWhatsAppOrderUrl 
} from '../utils/whatsappOrder';

export const CheckoutPage: React.FC = () => {
  const { effectiveCartItems, totalQuantity, cartType, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderId] = useState<string>(() => generateOrderId());

  const [customer, setCustomer] = useState(() => {
    let savedAddr: any = {};
    try {
      const stored = localStorage.getItem('sbs_user_address');
      if (stored) savedAddr = JSON.parse(stored);
    } catch (e) {}

    return {
      name: user?.full_name || '',
      mobile: savedAddr.phone || user?.phone || '',
      address: savedAddr.street_address || '',
      city: savedAddr.city || 'Hyderabad',
      pincode: savedAddr.pincode || '500033',
      notes: ''
    };
  });

  const [buttonState, setButtonState] = useState<'idle' | 'preparing' | 'opening' | 'success'>('idle');
  const [showNotice, setShowNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tax = Math.round(subtotal * 0.03);
  const grandTotal = subtotal + tax;

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) {
      setErrorMsg('Please enter your Customer Name.');
      return;
    }
    if (!customer.mobile.trim()) {
      setErrorMsg('Please enter your Mobile Number.');
      return;
    }

    setErrorMsg('');
    setButtonState('preparing');

    setTimeout(() => {
      setButtonState('opening');

      const rawMessage = generateFullCartWhatsAppMessage(orderId, customer, {
        items: effectiveCartItems,
        totalQuantity,
        cartType,
        subtotal,
        tax,
        shipping: 0,
        grandTotal
      });

      // Save customer address to localStorage
      try {
        localStorage.setItem('sbs_user_address', JSON.stringify({
          phone: customer.mobile,
          street_address: customer.address,
          city: customer.city,
          pincode: customer.pincode
        }));
      } catch (e) {}

      // Open WhatsApp Click-to-Chat
      openWhatsAppOrderUrl(rawMessage);

      setButtonState('success');
      setShowNotice(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-[#1A1918]">
      
      {/* Header Indicator */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#25D366] fill-current" />
          WHATSAPP RETAIL ORDER CHECKOUT
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Order via WhatsApp</h1>
        <p className="text-xs text-gray-500">Order ID Ref: <span className="font-bold text-[#C5A059]">{orderId}</span></p>
      </div>

      {showNotice && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-2xl text-xs mb-6 space-y-1 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 font-bold text-sm text-green-900">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>WhatsApp Opened Successfully!</span>
          </div>
          <p>
            Please send the prepared order message in your WhatsApp app to complete your order request with <strong>Sai Balaji Silver Works</strong>.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center mb-6 max-w-2xl mx-auto">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Customer Details Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSendWhatsAppOrder} className="bg-white border border-[#E6E1DA] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E6E1DA] pb-3">
              <User className="w-5 h-5 text-[#C5A059]" />
              <span>Customer Details for WhatsApp Order</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Customer Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Your Full Name"
                  className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Mobile / WhatsApp Number *</label>
                <input 
                  type="text" 
                  required
                  value={customer.mobile}
                  onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Delivery Address (Optional)</label>
                <input 
                  type="text" 
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Door No., Street, Area..."
                  className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City</label>
                  <input 
                    type="text" 
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Order Notes (Optional)</label>
                <input 
                  type="text" 
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="Gift packing, urgent dispatch..."
                  className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={buttonState === 'preparing' || buttonState === 'opening'}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl text-xs uppercase font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 pt-3"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>
                {buttonState === 'idle' && 'CONFIRM & ORDER ON WHATSAPP'}
                {buttonState === 'preparing' && 'Preparing Order...'}
                {buttonState === 'opening' && 'Opening WhatsApp...'}
                {buttonState === 'success' && 'Order message prepared in WhatsApp'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1A1918] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C5A059]" />
                <span>Order Summary</span>
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#1A1918] text-white">
                RETAIL MODE ({totalQuantity} ITEMS)
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {effectiveCartItems.map(({ product, quantity, effectivePrice, itemSubtotal }) => (
                <div key={product.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                  <div className="flex gap-3 items-center">
                    <img src={product.featured_image} alt="" className="w-12 h-12 object-cover rounded-lg bg-[#FAF9F5]" />
                    <div>
                      <h5 className="font-bold text-[#1A1918] line-clamp-1">{product.title}</h5>
                      <span className="text-gray-400">Qty: {quantity} × ₹{effectivePrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="font-bold">₹{itemSubtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (3% Silver Tax)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#1A1918] pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#C5A059]/30 text-[10px] text-gray-600 text-center">
              💬 Clicking <strong>CONFIRM & ORDER ON WHATSAPP</strong> opens WhatsApp with your complete pre-filled order summary.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
