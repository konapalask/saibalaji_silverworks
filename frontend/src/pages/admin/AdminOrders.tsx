import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import { RetailOrder, Product } from '../../types';
import api from '../../services/api';
import { getItemImageUrl } from '../../utils/orderImage';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<RetailOrder[]>([]);
  const [productCatalogMap, setProductCatalogMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?limit=500')
      ]);
      setOrders(ordRes.data);
      const catMap: Record<number, Product> = {};
      if (Array.isArray(prodRes.data)) {
        prodRes.data.forEach((p: Product) => {
          if (p.id) catMap[p.id] = p;
        });
      }
      setProductCatalogMap(catMap);
    } catch (err) {
      console.error('Error fetching admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          RETAIL FULFILLMENT
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Retail Orders Management</h1>
      </div>

      <div className="bg-white border border-[#E6E1DA] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] uppercase tracking-wider font-serif">
              <tr>
                <th className="py-4 px-6">Order Number</th>
                <th className="py-4 px-6">Customer Details</th>
                <th className="py-4 px-6">Items & Value</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#C5A059]">
                    {ord.order_number}
                    <div className="text-[10px] text-gray-400 font-normal">{new Date(ord.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#1A1918]">{ord.customer_name || 'Retail Customer'}</div>
                    <div className="text-[10px] text-gray-500">{ord.customer_phone || 'N/A'} | {typeof ord.shipping_address === 'string' ? ord.shipping_address : (ord.shipping_city || (ord.shipping_address as any)?.city || 'N/A')}</div>
                  </td>
                  <td className="py-4 px-6 min-w-[240px]">
                    <div className="space-y-2">
                      {ord.items && ord.items.length > 0 ? (
                        ord.items.map((item: any, idx: number) => {
                          const img = getItemImageUrl(item, productCatalogMap);
                          return (
                            <div key={item.id || idx} className="flex items-center gap-2.5 bg-[#FAF9F5] p-2 rounded-xl border border-[#E6E1DA]">
                              {img ? (
                                <img src={img} alt="" className="w-10 h-12 object-cover rounded-lg bg-white border border-gray-200 shrink-0" />
                              ) : (
                                <div className="w-10 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[#C5A059] shrink-0">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1A1918] text-[11px] truncate">{item.product_name || 'Silver Item'}</p>
                                <p className="text-[10px] text-gray-500">Qty: <strong>{item.quantity}</strong> {item.unit_price ? `× ₹${item.unit_price.toLocaleString()}` : ''}</p>
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
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                      ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select 
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg px-2 py-1 text-xs font-semibold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
