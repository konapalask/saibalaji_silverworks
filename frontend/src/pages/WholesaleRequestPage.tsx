import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Trash2, Plus, Minus, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useWholesale } from '../context/WholesaleContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const WholesaleRequestPage: React.FC = () => {
  const { wholesaleItems, updateWholesaleQuantity, removeFromWholesaleCart, clearWholesaleCart } = useWholesale();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    let savedAddr: any = {};
    try {
      const stored = localStorage.getItem('sbs_user_address');
      if (stored) savedAddr = JSON.parse(stored);
    } catch (e) {}

    return {
      company_name: user?.company_name || '',
      contact_person: user?.full_name || '',
      phone: savedAddr.phone || user?.phone || '',
      email: user?.email || '',
      gstin: user?.gstin || '',
      address: savedAddr.street_address || '',
      city: savedAddr.city || 'Hyderabad',
      state: savedAddr.state || 'Telangana',
      pincode: savedAddr.pincode || '500002',
      expected_delivery_date: '',
      notes: ''
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wholesaleItems.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: wholesaleItems.map((item) => ({
          product_id: item.product.id,
          requested_quantity: item.requested_quantity,
          notes: item.notes || ''
        }))
      };

      const res = await api.post('/wholesale/requests', payload);
      setSubmittedRequest(res.data);
      clearWholesaleCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit wholesale request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] py-16 px-4 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          WHOLESALE INQUIRY RECEIVED
        </span>
        <h1 className="font-serif text-4xl font-bold text-[#1A1918]">Request Submitted Successfully</h1>
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 text-left space-y-3 shadow-sm max-w-lg mx-auto">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-xs text-gray-500 font-semibold">Wholesale Request ID:</span>
            <span className="text-xs font-bold text-[#C5A059]">{submittedRequest.request_number}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-xs text-gray-500 font-semibold">Company:</span>
            <span className="text-xs font-bold text-[#1A1918]">{submittedRequest.company_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 font-semibold">Total Bulk Line Items:</span>
            <span className="text-xs font-bold text-[#1A1918]">{submittedRequest.items?.length || 0}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Our sales manager will review your request, calculate formal bulk pricing and taxes, and generate an official PDF quotation accessible in your account.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link 
            to="/account" 
            className="bg-[#1A1918] text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059]"
          >
            Go to My Account
          </Link>
          <Link 
            to="/" 
            className="border border-[#E6E1DA] bg-white text-[#1A1918] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          B2B REQUISITION FORM
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1918]">
          Wholesale Quotation Request
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Review your requested silver inventory quantities and provide business credentials to generate a formal quotation.
        </p>
      </div>

      {wholesaleItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E6E1DA] max-w-xl mx-auto space-y-4">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold">No Items in Wholesale Request</h3>
          <p className="text-xs text-gray-500">Please select bulk products from our B2B wholesale catalogue first.</p>
          <Link 
            to="/shop/wholesale"
            className="inline-block px-6 py-3 bg-[#1A1918] text-white rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059]"
          >
            Browse Wholesale Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selected Items List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1918]">1. Requested Bulk Products</h3>
            <div className="space-y-3">
              {wholesaleItems.map(({ product, requested_quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-[#E6E1DA] p-4 flex gap-4 shadow-sm">
                  <img 
                    src={product.featured_image} 
                    alt={product.title}
                    className="w-20 h-24 object-cover rounded-xl bg-[#FAF9F5]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="font-serif text-base font-bold text-[#1A1918] line-clamp-1">{product.title}</h4>
                        <button 
                          onClick={() => removeFromWholesaleCart(product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">SKU: {product.sku} | Purity: {product.silver_purity}</p>
                      <p className="text-xs font-semibold text-[#C5A059] mt-1">
                        Base Rate: ₹{product.wholesale_price ? product.wholesale_price.toLocaleString() : product.retail_price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center border border-[#E6E1DA] rounded-lg bg-[#FAF9F5]">
                        <button 
                          onClick={() => updateWholesaleQuantity(product.id, requested_quantity - 5)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{requested_quantity} Pcs</span>
                        <button 
                          onClick={() => updateWholesaleQuantity(product.id, requested_quantity + 5)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-500">
                        MOQ: {product.min_wholesale_qty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Business Inquiry Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-[#E6E1DA] p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1918]">2. Business Credentials & Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Company / Firm Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="e.g. Royal Gems & Jewellers"
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Person *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Mobile / Phone *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="wholesale@company.com"
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">GSTIN Number (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="36AAAAA0000A1Z5"
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Business Shipping Address *</label>
                  <textarea 
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, Commercial Complex, Landmark..."
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">State</label>
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Special Requirements / Notes</label>
                  <textarea 
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Packaging requirements, logo minting details, custom weights..."
                    className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Request...' : 'Send Request to Sai Balaji Silverworks'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
