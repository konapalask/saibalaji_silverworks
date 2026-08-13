import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: 'Hyderabad',
    shipping_state: 'Telangana',
    shipping_pincode: '500033',
    payment_method: 'UPI / Razorpay'
  });

  const [loading, setLoading] = useState(false);

  const tax = Math.round(subtotal * 0.03);
  const shipping = subtotal > 5000 || cart.length === 0 ? 0 : 150;
  const grandTotal = subtotal + tax + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity
        }))
      };

      const res = await api.post('/orders', payload);
      clearCart();
      navigate('/order-success', { state: { order: res.data } });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Step Indicator Header */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-serif">1</span>
            <span>Customer</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-serif">2</span>
            <span>Shipping</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-serif">3</span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="bg-white border border-[#E6E1DA] rounded-3xl p-8 space-y-6 shadow-sm">
            
            {/* Step 1: Customer Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Customer Information</h3>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Shipping Address</h3>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Street Address *</label>
                  <textarea 
                    required
                    rows={2}
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    placeholder="House / Flat No., Street, Landmark..."
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City</label>
                    <input 
                      type="text" 
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">State</label>
                    <input 
                      type="text" 
                      value={formData.shipping_state}
                      onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      value={formData.shipping_pincode}
                      onChange={(e) => setFormData({ ...formData, shipping_pincode: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="border border-[#E6E1DA] px-6 py-3 rounded-xl text-xs uppercase font-semibold"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Select Payment Gateway</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-[#C5A059] rounded-2xl bg-[#FAF9F5] cursor-pointer">
                    <input 
                      type="radio" 
                      name="pay" 
                      checked={formData.payment_method === 'UPI / Razorpay'}
                      onChange={() => setFormData({ ...formData, payment_method: 'UPI / Razorpay' })}
                    />
                    <Smartphone className="w-5 h-5 text-[#C5A059]" />
                    <div className="text-xs">
                      <p className="font-bold text-[#1A1918]">Instant UPI / QR Code / GPay / PhonePe</p>
                      <p className="text-gray-500">Secure server-side verification</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-[#E6E1DA] rounded-2xl bg-white cursor-pointer">
                    <input 
                      type="radio" 
                      name="pay" 
                      checked={formData.payment_method === 'Credit / Debit Card'}
                      onChange={() => setFormData({ ...formData, payment_method: 'Credit / Debit Card' })}
                    />
                    <CreditCard className="w-5 h-5 text-[#C5A059]" />
                    <div className="text-xs">
                      <p className="font-bold text-[#1A1918]">Credit / Debit Card</p>
                      <p className="text-gray-500">Visa, Mastercard, RuPay, Amex</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="border border-[#E6E1DA] px-6 py-3 rounded-xl text-xs uppercase font-semibold"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1A1918] hover:bg-[#C5A059] text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-xl"
                  >
                    {loading ? 'Processing Payment...' : `Pay ₹${grandTotal.toLocaleString()} & Complete Order`}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#1A1918]">Order Summary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-xs">
                  <div className="flex gap-3 items-center">
                    <img src={product.featured_image} alt="" className="w-12 h-12 object-cover rounded-lg bg-[#FAF9F5]" />
                    <div>
                      <h5 className="font-bold text-[#1A1918] line-clamp-1">{product.title}</h5>
                      <span className="text-gray-400">Qty: {quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#C5A059]">₹{(product.retail_price * quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E6E1DA] space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (3%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Insured Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A1918] pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
