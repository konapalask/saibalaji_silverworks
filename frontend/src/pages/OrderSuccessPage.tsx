import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Download, Package } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-16 px-4 max-w-3xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-300">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
        PAYMENT CONFIRMED
      </span>
      
      <h1 className="font-serif text-4xl font-bold text-[#1A1918]">Thank You for Your Purchase</h1>
      
      {order ? (
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 text-left space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-xs text-gray-500 font-semibold">Order Number:</span>
            <span className="text-xs font-bold text-[#C5A059]">{order.order_number}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-xs text-gray-500 font-semibold">Customer Name:</span>
            <span className="text-xs font-bold text-[#1A1918]">{order.customer_name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-xs text-gray-500 font-semibold">Shipping Address:</span>
            <span className="text-xs text-gray-700 font-medium text-right max-w-xs">{order.shipping_address}, {order.shipping_city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 font-semibold">Amount Paid:</span>
            <span className="text-sm font-bold text-[#1A1918]">₹{order.grand_total.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Your retail order has been placed and confirmed successfully.</p>
      )}

      <p className="text-xs text-gray-600 max-w-md mx-auto">
        We are preparing your hallmarked silver products for insured dispatch from our Hyderabad unit.
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <Link 
          to="/account" 
          className="bg-[#1A1918] text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059]"
        >
          View Order Tracking
        </Link>
        <Link 
          to="/shop/retail" 
          className="border border-[#E6E1DA] bg-white text-[#1A1918] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
