import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Briefcase, Package, FileText, ArrowRight, MessageSquare, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { DashboardStats, RetailOrder, WholesaleRequest } from '../../types';
import { openWhatsAppOrderMessage } from '../../utils/whatsapp';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RetailOrder[]>([]);
  const [wholesaleRequests, setWholesaleRequests] = useState<WholesaleRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'retail' | 'wholesale'>('retail');
  const [selectedReq, setSelectedReq] = useState<WholesaleRequest | null>(null);

  // Quote Generation Form State
  const [discountAmount, setDiscountAmount] = useState(500);
  const [taxAmount, setTaxAmount] = useState(1200);
  const [shippingCharge, setShippingCharge] = useState(350);
  const [validUntil, setValidUntil] = useState('2026-09-30');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance upon quotation acceptance, 50% prior to dispatch.');
  const [deliveryTerms, setDeliveryTerms] = useState('Dispatch via insured logistics within 5 business days.');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statRes, ordRes, reqRes, quoteRes] = await Promise.all([
        api.get('/dashboard/analytics'),
        api.get('/orders'),
        api.get('/wholesale/requests'),
        api.get('/quotations/all')
      ]);
      setStats(statRes.data);
      setOrders(ordRes.data);
      setWholesaleRequests(reqRes.data);
      setQuotations(quoteRes.data);
    } catch (err) {
      console.error('Error fetching dashboard analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const items = selectedReq.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        purity: '925 Sterling Silver',
        weight_g: 50.0,
        quantity: item.requested_quantity,
        unit_price: 3500.0,
        subtotal: item.requested_quantity * 3500.0
      }));

      const payload = {
        wholesale_request_id: selectedReq.id,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        shipping_charge: shippingCharge,
        valid_until: validUntil,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        notes: 'Official quotation issued by Sai Balaji Silverworks Sales Desk.',
        items
      };

      const res = await api.post('/quotations', payload);
      alert(`Quotation ${res.data.quotation_number} generated successfully!`);
      setSelectedReq(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(getErrorMessage(err, 'Failed to generate quotation'));
    }
  };

  const downloadPDF = (quotationId: number) => {
    window.open(`/api/v1/quotations/${quotationId}/pdf`, '_blank');
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-20 font-serif text-[#C5A059] text-xl animate-pulse">
        Loading Commercial Dashboard Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[#1A1918]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            EXECUTIVE CONTROL PANEL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">
            Dashboard Overview
          </h1>
        </div>

        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white border border-[#E6E1DA] px-4 py-2 rounded-xl text-xs font-semibold hover:border-[#C5A059]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            ₹{(stats?.total_revenue ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-green-600 font-bold">+18.5% from retail & wholesale</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Retail Bookings</span>
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {orders.length}
          </p>
          <span className="text-[10px] text-gray-500">Retail customer bookings</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Wholesale Bookings</span>
            <Briefcase className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {wholesaleRequests.length}
          </p>
          <span className="text-[10px] text-[#C5A059] font-bold">B2B quotation requests</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
            <Package className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {stats?.total_products_count ?? 0} Products
          </p>
          <span className="text-[10px] text-gray-500">925 Sterling & 999 Fine Silver</span>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-2 flex space-x-2 text-xs font-bold uppercase tracking-wider shadow-xs">
        <button
          onClick={() => setActiveTab('retail')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'retail' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
          <span>1. Retail Bookings ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wholesale')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wholesale' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#C5A059]" />
          <span>2. Wholesale Bookings ({wholesaleRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Retail Bookings Table */}
      {activeTab === 'retail' && (
        <div className="bg-white border border-[#E6E1DA] rounded-3xl overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Retail Bookings & Orders</h3>
            <span className="text-xs text-gray-500 font-semibold">{orders.length} Retail Orders Placed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] uppercase tracking-wider font-serif">
                <tr>
                  <th className="py-4 px-4">Order Ref</th>
                  <th className="py-4 px-4">Customer Info & Phone</th>
                  <th className="py-4 px-4">Delivery Address</th>
                  <th className="py-4 px-4">Items & Value</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#C5A059]">
                      {ord.order_number}
                      <div className="text-[10px] text-gray-400 font-normal">{new Date(ord.created_at).toLocaleDateString()}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#1A1918]">{ord.customer_name || 'Retail Customer'}</div>
                      <div className="text-[11px] text-[#C5A059] font-bold">{ord.customer_phone || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 max-w-xs text-[#1A1918]">
                      <p className="truncate font-medium">{typeof ord.shipping_address === 'string' ? ord.shipping_address : (ord.shipping_address?.address || 'N/A')}</p>
                      <p className="text-[10px] text-gray-500">{ord.shipping_city || ord.shipping_address?.city || 'N/A'}, {ord.shipping_state || ord.shipping_address?.state || ''}</p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#1A1918]">₹{(ord.grand_total ?? ord.total_amount ?? 0).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500">{ord.items?.length || 0} Products</div>
                    </td>

                    <td className="py-4 px-4">
                      <select 
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A1918] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openWhatsAppOrderMessage(ord)}
                        className="bg-[#25D366] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ml-auto shadow-xs hover:bg-[#128C7E]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp Order</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Wholesale Bookings Requisitions & PDF Generator */}
      {activeTab === 'wholesale' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Requisitions List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1918]">Incoming Wholesale Bookings</h3>
            
            <div className="space-y-3">
              {wholesaleRequests.map((req) => {
                const matchedQuote = quotations.find((q) => q.wholesale_request_id === req.id);
                return (
                  <div 
                    key={req.id} 
                    onClick={() => setSelectedReq(req)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                      selectedReq?.id === req.id ? 'bg-[#FAF9F5] border-[#C5A059] ring-2 ring-[#C5A059]/30' : 'bg-white border-[#E6E1DA] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-[#C5A059] block">{req.request_number}</span>
                        <h4 className="font-serif text-base font-bold text-[#1A1918]">{req.company_name}</h4>
                        <p className="text-xs text-gray-500">Contact: {req.contact_person} ({req.phone})</p>
                      </div>

                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        matchedQuote ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {matchedQuote ? 'Quote Issued' : 'Pending Quote'}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-600">{req.items?.length || 0} Bulk Line Items</span>
                      {matchedQuote ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(matchedQuote.id);
                          }}
                          className="bg-[#1A1918] text-[#FAF9F5] px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#C5A059]"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Download PDF ({matchedQuote.quotation_number})</span>
                        </button>
                      ) : (
                        <span className="text-[#C5A059] font-bold">Click to Issue Quote &rarr;</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: B2B PDF Quote Generator */}
          <div className="lg:col-span-6">
            {selectedReq ? (
              <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-xs space-y-6">
                <div className="border-b border-[#E6E1DA] pb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059]">ISSUE FORMAL B2B QUOTATION</span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1918]">{selectedReq.company_name}</h3>
                  <p className="text-xs text-gray-500">Request Ref: {selectedReq.request_number} | Phone: {selectedReq.phone}</p>
                </div>

                <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">Requested Items & Quantities</label>
                    {selectedReq.items.map((item) => (
                      <div key={item.id} className="flex justify-between p-2.5 bg-[#FAF9F5] rounded-xl border border-gray-100">
                        <span>• {item.product_name}</span>
                        <span className="font-bold text-[#1A1918]">{item.requested_quantity} Pcs</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Discount (₹)</label>
                      <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(parseFloat(e.target.value))} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">GST Tax (₹)</label>
                      <input type="number" value={taxAmount} onChange={(e) => setTaxAmount(parseFloat(e.target.value))} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Shipping (₹)</label>
                      <input type="number" value={shippingCharge} onChange={(e) => setShippingCharge(parseFloat(e.target.value))} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Valid Until Date</label>
                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Payment Terms</label>
                    <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#C5A059]" />
                    <span>Generate Official ReportLab PDF Quotation</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-[#E6E1DA] rounded-3xl p-12 text-center text-gray-400 font-serif">
                Select a wholesale booking on the left to generate an official PDF quotation.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
