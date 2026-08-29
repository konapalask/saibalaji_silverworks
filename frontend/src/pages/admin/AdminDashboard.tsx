import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Briefcase, Package, FileText, ArrowRight, MessageSquare, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { DashboardStats, RetailOrder, WholesaleRequest, Product } from '../../types';
import { openWhatsAppOrderMessage } from '../../utils/whatsapp';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';
import { getItemImageUrl } from '../../utils/orderImage';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RetailOrder[]>([]);
  const [wholesaleRequests, setWholesaleRequests] = useState<WholesaleRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [productCatalogMap, setProductCatalogMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [previewImageData, setPreviewImageData] = useState<{ url: string; title?: string; sku?: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'retail' | 'wholesale'>('retail');
  const [selectedReq, setSelectedReq] = useState<WholesaleRequest | null>(null);

  // Quote Generation Form State
  const [discountAmount, setDiscountAmount] = useState(500);
  const [taxAmount, setTaxAmount] = useState(1200);
  const [shippingCharge, setShippingCharge] = useState(350);
  const [validUntil, setValidUntil] = useState('2026-09-30');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance upon quotation acceptance, 50% prior to dispatch.');
  const [deliveryTerms, setDeliveryTerms] = useState('Dispatch via insured logistics within 5 business days.');

  const getAcceptedIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem('accepted_wholesale_order_ids');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  };

  const saveAcceptedId = (id: string | number) => {
    try {
      const set = getAcceptedIds();
      set.add(String(id));
      localStorage.setItem('accepted_wholesale_order_ids', JSON.stringify(Array.from(set)));
    } catch (e) {}
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statRes, ordRes, reqRes, quoteRes, prodRes] = await Promise.all([
        api.get('/dashboard/analytics'),
        api.get('/orders'),
        api.get('/wholesale/requests'),
        api.get('/quotations/all'),
        api.get('/products?limit=500')
      ]);
      setStats(statRes.data);
      setOrders(Array.isArray(ordRes.data) ? [...ordRes.data].sort((a: any, b: any) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime()) : []);
      setWholesaleRequests(Array.isArray(reqRes.data) ? [...reqRes.data].sort((a: any, b: any) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime()) : []);
      setQuotations(quoteRes.data);
      const catMap: Record<number, Product> = {};
      if (Array.isArray(prodRes.data)) {
        prodRes.data.forEach((p: Product) => {
          if (p.id) catMap[p.id] = p;
        });
      }
      setProductCatalogMap(catMap);
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
      const items = selectedReq.items.map((item: any) => {
        const p = productCatalogMap[item.product_id];
        const meas = item.measurement || item.selected_measurement || item.size || item.selected_variant?.measurement || p?.dimensions || 'Standard';
        const wG = item.weight_g || item.selected_variant?.weight_g || p?.weight_g || 50;
        const uPrice = item.unit_price || item.price || p?.wholesale_price || p?.retail_price || 3500;
        const qty = item.requested_quantity || item.quantity || 1;
        return {
          product_id: item.product_id,
          product_name: item.product_name || p?.title || 'Silver Wholesale Product',
          product_sku: item.product_sku || item.sku || p?.sku || 'SBS-WS',
          measurement: meas,
          selected_measurement: meas,
          size: meas,
          purity: p?.silver_purity || '925 Sterling Silver',
          weight_g: wG,
          quantity: qty,
          unit_price: uPrice,
          subtotal: qty * uPrice,
          featured_image: getItemImageUrl(item, productCatalogMap)
        };
      });

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
                      <p className="truncate font-medium">{typeof ord.shipping_address === 'string' ? ord.shipping_address : ((ord.shipping_address as any)?.address || 'N/A')}</p>
                      <p className="text-[10px] text-gray-500">{ord.shipping_city || (typeof ord.shipping_address === 'object' ? (ord.shipping_address as any)?.city : 'N/A') || 'N/A'}, {ord.shipping_state || (typeof ord.shipping_address === 'object' ? (ord.shipping_address as any)?.state : '') || ''}</p>
                    </td>

                    <td className="py-4 px-4 min-w-[240px]">
                      <div className="space-y-2">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((item: any, idx: number) => {
                            const img = getItemImageUrl(item, productCatalogMap);
                            const name = item.product_name || item.name || productCatalogMap[item.product_id]?.title || 'Silver Item';
                            const sku = item.product_sku || item.sku || productCatalogMap[item.product_id]?.sku || '';
                            return (
                              <div key={item.id || idx} className="flex items-center gap-2.5 bg-[#FAF9F5] p-2 rounded-xl border border-[#E6E1DA]">
                                {img ? (
                                  <img 
                                    src={img} 
                                    alt={name} 
                                    onClick={() => setPreviewImageData({ url: img, title: name, sku })}
                                    title="Click to expand image"
                                    className="w-10 h-12 object-cover rounded-lg bg-black border border-gray-200 shrink-0 cursor-pointer hover:scale-105 transition-transform" 
                                  />
                                ) : (
                                  <div className="w-10 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[#C5A059] shrink-0">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#1A1918] text-[11px] truncate">{item.product_name || 'Silver Item'}</p>
                                  <p className="text-[10px] text-gray-500">
                                    Qty: <strong className="text-[#1A1918]">{item.quantity}</strong> {item.unit_price ? `× ₹${item.unit_price.toLocaleString()}` : ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-[10px] text-gray-400 font-italic">No item details</div>
                        )}
                        <div className="pt-1 flex justify-between items-center text-xs font-bold border-t border-gray-100">
                          <span>Total:</span>
                          <span className="text-[#C5A059]">₹{(ord.grand_total ?? (ord as any).total_amount ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <select 
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A1918] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Order Accepted">Order Accepted</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right space-y-1">
                      {ord.status !== 'Order Accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Order Accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ml-auto shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                      )}

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
                const matchedQuote = quotations.find((q) => q.wholesale_request_id === req.id || String(q.wholesale_request_id) === String(req.id) || q.wholesale_request_id === req.request_number);
                const acceptedSet = getAcceptedIds();
                const isAccepted = req.status === 'Order Accepted' || 
                                   matchedQuote?.status === 'Order Accepted' || 
                                   acceptedSet.has(String(req.id)) || 
                                   acceptedSet.has(String(req.request_number));
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

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-2xs ${
                          isAccepted ? 'bg-green-600 text-white font-bold' :
                          matchedQuote ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAccepted ? '✓ ORDER ACCEPTED' : matchedQuote ? 'Quote Issued' : 'Pending Quote'}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail Row Preview */}
                    {req.items && req.items.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                        {req.items.map((item: any, idx: number) => {
                          const img = getItemImageUrl(item, productCatalogMap);
                          const name = item.product_name || item.name || productCatalogMap[item.product_id]?.title || 'Product';
                          return img ? (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={name} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImageData({ url: img, title: name, sku: item.product_sku });
                              }}
                              title={`${name} (Click to expand)`} 
                              className="w-9 h-11 object-cover rounded-lg bg-black border border-gray-200 shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                            />
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">{req.items?.length || 0} Bulk Line Items</span>
                      
                      <div className="flex items-center gap-2">
                        {isAccepted ? (
                          <span className="bg-green-100 text-green-800 border border-green-300 font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>Order Accepted</span>
                          </span>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              req.status = 'Order Accepted';
                              if (req.id) saveAcceptedId(req.id);
                              if (req.request_number) saveAcceptedId(req.request_number);
                              try {
                                const targetId = req.id || req.request_number;
                                await api.put(`/wholesale/requests/${targetId}/status`, { status: 'Order Accepted' });
                              } catch (err: any) {
                                try {
                                  const targetId = req.id || req.request_number;
                                  await api.post(`/wholesale/requests/${targetId}/status`, { status: 'Order Accepted' });
                                } catch (e2) {}
                              }
                              fetchDashboardData();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            title="Accept Wholesale Order"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Accept Order</span>
                          </button>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (matchedQuote) {
                              downloadPDF(matchedQuote.id);
                            } else {
                              window.open(`/api/v1/wholesale/requests/${req.id}/pdf`, '_blank');
                            }
                          }}
                          className="bg-[#1A1918] text-[#FAF9F5] px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#C5A059] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>View PDF</span>
                        </button>
                      </div>
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
                    <label className="font-bold text-gray-700 block text-xs">Requested Items & Quantities</label>
                    {selectedReq.items.map((item: any, idx: number) => {
                      const name = item.product_name || item.name || productCatalogMap[item.product_id]?.title || 'Silver Wholesale Product';
                      const img = getItemImageUrl(item, productCatalogMap);
                      const sku = item.product_sku || item.sku || productCatalogMap[item.product_id]?.sku || '';
                      const size = item.measurement || item.selected_measurement || item.size || item.selected_variant?.measurement || productCatalogMap[item.product_id]?.dimensions || '';
                      const qty = item.requested_quantity || item.quantity || 1;
                      const unitPrice = item.unit_price || item.price || productCatalogMap[item.product_id]?.retail_price || 0;

                      return (
                        <div key={item.id || idx} className="flex items-center gap-3 p-3 bg-[#FAF9F5] rounded-2xl border border-[#E6E1DA]">
                          {img ? (
                            <img 
                              src={img} 
                              alt={name} 
                              onClick={() => setPreviewImageData({ url: img, title: name, sku })}
                              title="Click to expand image"
                              className="w-12 h-14 object-cover rounded-xl bg-black shrink-0 border border-gray-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform" 
                            />
                          ) : (
                            <div className="w-12 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-[#C5A059] shrink-0">
                              <Briefcase className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[#1A1918] text-xs truncate">{name}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mt-1">
                              {sku && <span className="font-mono bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-semibold">SKU: {sku}</span>}
                              {size && <span className="bg-[#1A1918] text-white px-1.5 py-0.5 rounded font-semibold">Size: {size}</span>}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-xs text-[#202020] block">{qty} Pcs</span>
                            {unitPrice > 0 && (
                              <span className="text-[10px] text-[#C5A059] font-bold block">₹{(unitPrice * qty).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

      <ImagePreviewModal
        isOpen={Boolean(previewImageData)}
        onClose={() => setPreviewImageData(null)}
        imageUrl={previewImageData?.url || ''}
        title={previewImageData?.title}
        sku={previewImageData?.sku}
      />

    </div>
  );
};
