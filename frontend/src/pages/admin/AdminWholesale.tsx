import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, Download, Plus, CheckCircle2, Clock } from 'lucide-react';
import { WholesaleRequest, Product } from '../../types';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';
import { getItemImageUrl } from '../../utils/orderImage';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';

export const AdminWholesale: React.FC = () => {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [productCatalogMap, setProductCatalogMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<WholesaleRequest | null>(null);
  const [previewImageData, setPreviewImageData] = useState<{ url: string; title?: string; sku?: string } | null>(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, quoteRes, prodRes] = await Promise.all([
        api.get('/wholesale/requests'),
        api.get('/quotations/all'),
        api.get('/products?limit=500')
      ]);
      const sortedReqs = Array.isArray(reqRes.data)
        ? [...reqRes.data].sort((a: any, b: any) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime())
        : [];
      setRequests(sortedReqs);
      setQuotations(quoteRes.data);
      const catMap: Record<number, Product> = {};
      if (Array.isArray(prodRes.data)) {
        prodRes.data.forEach((p: Product) => {
          if (p.id) catMap[p.id] = p;
        });
      }
      setProductCatalogMap(catMap);
    } catch (err) {
      console.error('Error fetching admin wholesale', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData();
    } catch (err: any) {
      alert(getErrorMessage(err, 'Failed to generate quotation'));
    }
  };

  const downloadPDF = (quotationId: number) => {
    window.open(`/api/v1/quotations/${quotationId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          B2B QUOTATION ENGINE
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Wholesale Requests & Formal PDF Quotes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Request List */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Incoming Wholesale Inquiries</h3>
          
          <div className="space-y-3">
            {requests.map((req) => {
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
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
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
                    <span className="text-gray-600 font-medium">{req.items.length} Line Items Requested</span>
                    
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
                            fetchData();
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          title="Accept Wholesale Order"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Accept Order</span>
                        </button>
                      )}

                      {matchedQuote ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(matchedQuote.id);
                          }}
                          className="bg-[#1A1918] text-[#FAF9F5] px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#C5A059] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Download PDF ({matchedQuote.quotation_number})</span>
                        </button>
                      ) : (
                        <span className="text-[#C5A059] font-bold">Click to Generate Quote &rarr;</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: PDF Quote Generator */}
        <div className="lg:col-span-6">
          {selectedReq ? (
            <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-[#E6E1DA] pb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059]">GENERATING FORMAL B2B QUOTATION</span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1918]">{selectedReq.company_name}</h3>
                <p className="text-xs text-gray-500">Request Ref: {selectedReq.request_number} | GSTIN: {selectedReq.gstin || 'N/A'}</p>
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
                    <label className="font-bold text-gray-700 block mb-1">Special Discount (₹)</label>
                    <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(parseFloat(e.target.value))} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">GST Tax (₹)</label>
                    <input type="number" value={taxAmount} onChange={(e) => setTaxAmount(parseFloat(e.target.value))} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Freight Insurance (₹)</label>
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

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery Terms</label>
                  <input type="text" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#C5A059]" />
                  <span>Generate Official ReportLab PDF Quotation</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-[#E6E1DA] rounded-3xl p-12 text-center text-gray-400 font-serif">
              Select a wholesale request on the left to issue a formal PDF quotation.
            </div>
          )}
        </div>

      </div>

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
