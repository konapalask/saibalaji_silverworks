import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageSquare, Package, X, Sparkles } from 'lucide-react';
import { openWhatsAppOrderUrl } from '../utils/whatsappOrder';

export interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  customerName?: string;
  grandTotal?: number;
  items?: Array<{
    title?: string;
    product_name?: string;
    sku?: string;
    quantity: number;
    size?: string;
    measurement?: string;
    price?: number;
    unitPrice?: number;
    effectivePrice?: number;
    featured_image?: string;
    image_url?: string;
  }>;
  whatsappMessage?: string;
  isWholesale?: boolean;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  customerName,
  grandTotal,
  items = [],
  whatsappMessage,
  isWholesale = false
}) => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; bg: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate celebratory confetti particles
      const colors = ['#C5A059', '#25D366', '#FFD700', '#1A1918', '#E6E1DA'];
      const p = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        bg: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(p);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    if (whatsappMessage) {
      openWhatsAppOrderUrl(whatsappMessage);
    }
  };

  const handleViewMyOrders = () => {
    onClose();
    navigate('/account');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1918]/75 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Celebration Confetti Burst */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map((pt) => (
          <div
            key={pt.id}
            className="absolute w-2.5 h-2.5 rounded-full animate-bounce opacity-80"
            style={{
              left: `${pt.left}%`,
              top: `${10 + Math.random() * 40}%`,
              backgroundColor: pt.bg,
              animationDelay: `${pt.delay}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      <div className="bg-white border-2 border-[#C5A059] rounded-3xl max-w-lg w-full shadow-2xl text-[#1A1918] relative z-20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1A1918] via-[#2A2927] to-[#1A1918] text-white pt-5 pb-4 px-6 text-center relative border-b border-[#C5A059]/40">
          <button 
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Gold Check Icon */}
          <div className="relative w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#C5A059] animate-ping opacity-20" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#F1E0B0] flex items-center justify-center text-[#1A1918] shadow-md">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A059] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>ORDER CONFIRMED & PLACED</span>
            <Sparkles className="w-3 h-3" />
          </span>

          <h2 className="font-serif text-xl sm:text-2xl font-bold mt-0.5 text-[#FFF8EB]">
            {isWholesale ? 'Wholesale Requisition Placed!' : 'Order Confirmed!'}
          </h2>

          <div className="mt-1.5 inline-block px-3 py-0.5 bg-[#C5A059]/20 border border-[#C5A059]/50 rounded-full text-[11px] font-mono font-bold text-[#F1E0B0]">
            Order Ref: {orderNumber}
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-5 space-y-3.5 max-h-[50vh] overflow-y-auto">
          
          <div className="p-3.5 bg-[#FAF9F5] border border-[#E6E1DA] rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold">Status:</span>
              <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>Order Confirmed</span>
              </span>
            </div>
            
            {customerName && (
              <div className="flex justify-between items-center border-t border-gray-200/60 pt-1.5">
                <span className="text-gray-500 font-semibold">Customer:</span>
                <span className="font-bold text-[#1A1918]">{customerName}</span>
              </div>
            )}

            {grandTotal !== undefined && (
              <div className="flex justify-between items-center border-t border-gray-200/60 pt-1.5">
                <span className="text-gray-500 font-semibold">Grand Total:</span>
                <span className="font-serif font-bold text-base text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Items Summary */}
          {items.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-gray-500">Order Items:</h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {items.map((it, idx) => {
                  const name = it.product_name || it.title || 'Silver Product';
                  const img = it.featured_image || it.image_url;
                  const qty = it.quantity || 1;
                  const price = it.effectivePrice || it.unitPrice || it.price;
                  const sz = it.measurement || it.size;

                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAF9F5] rounded-xl border border-gray-200 text-xs">
                      {img ? (
                        <img src={img} alt="" className="w-9 h-10 object-cover rounded-lg bg-black shrink-0" />
                      ) : (
                        <div className="w-9 h-10 bg-white rounded-lg flex items-center justify-center text-[#C5A059] shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1918] truncate text-[11px]">{name}</p>
                        <div className="flex items-center gap-2 text-[9.5px] text-gray-500">
                          {sz && <span className="bg-[#1A1918] text-white px-1.5 py-0.1 rounded">Size: {sz}</span>}
                          <span>Qty: {qty}</span>
                        </div>
                      </div>
                      {price && (
                        <span className="font-bold text-[#1A1918] text-xs">₹{(price * qty).toLocaleString()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] border-t border-[#E6E1DA] space-y-2">
          <button
            onClick={handleViewMyOrders}
            className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#C5A059]" />
            <span>VIEW IN MY ORDERS & TRACK STATUS</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-white border border-[#E6E1DA] hover:bg-gray-100 text-[#1A1918] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
