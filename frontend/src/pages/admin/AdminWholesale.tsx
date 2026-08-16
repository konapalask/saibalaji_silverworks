import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, Download, Plus, CheckCircle2, Clock } from 'lucide-react';
import { WholesaleRequest } from '../../types';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/apiError';

export const AdminWholesale: React.FC = () => {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<WholesaleRequest | null>(null);

  // Quote Generation Form State
  const [discountAmount, setDiscountAmount] = useState(500);
  const [taxAmount, setTaxAmount] = useState(1200);
  const [shippingCharge, setShippingCharge] = useState(350);
  const [validUntil, setValidUntil] = useState('2026-09-30');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance upon quotation acceptance, 50% prior to dispatch.');
  const [deliveryTerms, setDeliveryTerms] = useState('Dispatch via insured logistics within 5 business days.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, quoteRes] = await Promise.all([
        api.get('/wholesale/requests'),
        api.get('/quotations/all')
      ]);
      setRequests(reqRes.data);
      setQuotations(quoteRes.data);
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
              const matchedQuote = quotations.find((q) => q.wholesale_request_id === req.id);
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

                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      matchedQuote ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {matchedQuote ? 'Quote Issued' : 'Pending Quote'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-gray-600">{req.items.length} Line Items Requested</span>
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
                      <span className="text-[#C5A059] font-bold">Click to Generate Quote &rarr;</span>
                    )}
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
                  className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
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

    </div>
  );
};
