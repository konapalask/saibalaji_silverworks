import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Briefcase, Users, Package, FileText, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../types';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/analytics');
        setStats(res.data);
      } catch (err) {
        console.error('Error loading dashboard analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="text-center py-20 font-serif text-xl">Loading Commercial Analytics...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          EXECUTIVE OVERVIEW
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">
          Sai Balaji Operations & Sales Analytics
        </h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            ₹{stats.total_revenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-green-600 font-bold">+18.5% from retail & wholesale</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Retail Orders</span>
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {stats.retail_orders_count}
          </p>
          <span className="text-[10px] text-gray-500">{stats.pending_orders_count} Pending Fulfillment</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">B2B Wholesale Requisitions</span>
            <Briefcase className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {stats.wholesale_requests_count}
          </p>
          <span className="text-[10px] text-[#C5A059] font-bold">PDF Quotations Active</span>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
            <Package className="w-5 h-5 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1918]">
            {stats.total_products_count} Products
          </p>
          <span className="text-[10px] text-gray-500">925 Sterling & 999 Fine Silver</span>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Retail Orders */}
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Recent Retail Orders</h3>
          <div className="space-y-3">
            {stats.recent_orders.map((ord) => (
              <div key={ord.id} className="flex justify-between items-center p-3 bg-[#FAF9F5] rounded-xl border border-[#E6E1DA] text-xs">
                <div>
                  <p className="font-bold text-[#1A1918]">{ord.order_number}</p>
                  <p className="text-[10px] text-gray-500">{ord.customer_name} • {new Date(ord.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C5A059]">₹{ord.grand_total.toLocaleString()}</p>
                  <span className="text-[9px] uppercase font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Wholesale Requisitions */}
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Recent B2B Wholesale Requisitions</h3>
          <div className="space-y-3">
            {stats.recent_wholesale.map((req) => (
              <div key={req.id} className="flex justify-between items-center p-3 bg-[#FAF9F5] rounded-xl border border-[#E6E1DA] text-xs">
                <div>
                  <p className="font-bold text-[#1A1918]">{req.request_number}</p>
                  <p className="text-[10px] text-gray-500">{req.company_name} • Contact: {req.contact_person}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
