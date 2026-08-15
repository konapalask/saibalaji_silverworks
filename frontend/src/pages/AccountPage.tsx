import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Package, Briefcase, FileText, Download, Heart, LogOut, MapPin, Phone, Edit3, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RetailOrder, WholesaleRequest, Product } from '../types';
import { AddressModal, UserAddress } from '../components/AddressModal';
import api from '../services/api';

export const AccountPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'wholesale' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<RetailOrder[]>([]);
  const [wholesaleRequests, setWholesaleRequests] = useState<WholesaleRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
    gstin: user?.gstin || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        company_name: user.company_name || '',
        gstin: user.gstin || ''
      });
    }
  }, [user]);

  const [savedAddress, setSavedAddress] = useState<UserAddress | null>(() => {
    try {
      const stored = localStorage.getItem('sbs_user_address');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [ordRes, reqRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/wholesale/my-requests')
        ]);
        setOrders(ordRes.data);
        setWholesaleRequests(reqRes.data);

        const quoteRes = await api.get('/quotations/all');
        setQuotations(quoteRes.data);
      } catch (err) {
        console.error('Error fetching account data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="font-serif text-3xl font-bold">Please Log In</h2>
        <p className="text-xs text-gray-500">Access your orders and wholesale quotations.</p>
        <Link to="/account/login" className="px-6 py-3 bg-[#1A1918] text-white rounded-xl text-xs uppercase font-bold">Log In Now</Link>
      </div>
    );
  }

  const downloadPDF = (quotationId: number, number: string) => {
    window.open(`/api/v1/quotations/${quotationId}/pdf`, '_blank');
  };

  const handleSaveAddress = (newAddress: UserAddress) => {
    setSavedAddress(newAddress);
    setIsEditAddressOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (err) {
      alert('Failed to update name and profile details');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-[#1A1918]">
      
      {/* User Header Profile Card */}
      <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
        
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="w-16 h-16 rounded-full bg-[#1A1918] text-[#C5A059] flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#C5A059] shrink-0">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!isEditingProfile ? (
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-[#1A1918]">{user.full_name}</h1>
                <span className="bg-[#C5A059] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1 text-xs text-[#C5A059] hover:underline font-bold ml-2"
                  title="Edit Customer Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Name</span>
                </button>
              </div>
              <p className="text-xs text-gray-500">{user.email}</p>
              {user.company_name && (
                <p className="text-xs text-[#C5A059] font-semibold">Company: {user.company_name} (GSTIN: {user.gstin || 'N/A'})</p>
              )}
            </div>
          ) : (
            /* Inline Profile Name Edit Form */
            <form onSubmit={handleSaveProfile} className="flex-1 space-y-3 bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1DA]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Customer Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1918]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Company Name (Optional)</label>
                  <input 
                    type="text" 
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-1.5 text-xs text-[#1A1918]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 border border-[#E6E1DA] text-gray-500 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-1.5 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile Name'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 border border-[#E6E1DA] text-gray-700 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Saved Delivery Location Card */}
      <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1918]">Saved Shipping Address & Contact</h3>
          </div>
          <button
            onClick={() => setIsEditAddressOpen(true)}
            className="flex items-center gap-1.5 bg-[#FAF9F5] border border-[#E6E1DA] hover:border-[#C5A059] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1A1918] transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Edit Address</span>
          </button>
        </div>

        {savedAddress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Contact Phone:</span>
              <p className="font-bold text-[#1A1918] text-sm mt-0.5">{savedAddress.phone || user.phone || 'Not Provided'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Street Address:</span>
              <p className="font-medium text-[#1A1918] mt-0.5">{savedAddress.street_address || 'No street address saved'}</p>
              <p className="text-gray-500 font-medium">{savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>No delivery address saved yet. Provide your shipping address to speed up checkout.</p>
            <button
              onClick={() => setIsEditAddressOpen(true)}
              className="bg-[#1A1918] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px]"
            >
              + Add Address
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-2 flex space-x-2 text-xs font-bold uppercase tracking-wider">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'orders' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <Package className="w-4 h-4 text-[#C5A059]" />
          <span>Retail Orders ({orders.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('wholesale')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wholesale' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#C5A059]" />
          <span>Wholesale Requests & Quotations ({wholesaleRequests.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Retail Order History</h3>
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E6E1DA]">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-[#1A1918]">No Orders Found</p>
              <p className="text-xs text-gray-500 mb-4">Explore our fine silver collections and place your first order.</p>
              <Link to="/shop/retail" className="px-6 py-2.5 bg-[#1A1918] text-white rounded-xl text-xs uppercase font-bold">Start Shopping</Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-[#E6E1DA] p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#C5A059] block">{ord.order_number}</span>
                    <span className="text-[10px] text-gray-400">{new Date(ord.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                      {ord.status}
                    </span>
                    <span className="font-bold text-sm text-[#1A1918]">₹{ord.grand_total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs py-1">
                      <span className="font-medium text-gray-700">{item.product_name} (Qty: {item.quantity})</span>
                      <span className="font-bold">₹{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'wholesale' && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Wholesale Requests & Quotations</h3>
          {wholesaleRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E6E1DA]">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-[#1A1918]">No Wholesale Requests</p>
              <p className="text-xs text-gray-500 mb-4">Request custom manufacturing quotes for your business.</p>
              <Link to="/shop/wholesale" className="px-6 py-2.5 bg-[#C5A059] text-white rounded-xl text-xs uppercase font-bold">Browse Wholesale</Link>
            </div>
          ) : (
            wholesaleRequests.map((req) => {
              const matchedQuote = quotations.find((q) => q.wholesale_request_id === req.id);
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-[#E6E1DA] p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#C5A059]">{req.request_number}</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">Company: {req.company_name} | Date: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>

                    {matchedQuote && (
                      <button 
                        onClick={() => downloadPDF(matchedQuote.id, matchedQuote.quotation_number)}
                        className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-md"
                      >
                        <Download className="w-4 h-4 text-[#C5A059]" />
                        <span>Download Quotation PDF ({matchedQuote.quotation_number})</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-500">Requested Items:</p>
                    {req.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-700">
                        <span>• {item.product_name}</span>
                        <span className="font-bold">{item.requested_quantity} Pcs</span>
                      </div>
                    ))}
                  </div>

                  {matchedQuote && (
                    <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs flex justify-between items-center border border-[#C5A059]/30">
                      <div>
                        <span className="font-bold text-[#1A1918]">Official Quote Total:</span>
                        <span className="text-[#C5A059] font-bold text-sm ml-2">₹{matchedQuote.grand_total.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Valid Until: {matchedQuote.valid_until}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit Address Modal */}
      <AddressModal
        isOpen={isEditAddressOpen}
        onSave={handleSaveAddress}
        onSkip={() => setIsEditAddressOpen(false)}
      />

    </div>
  );
};
