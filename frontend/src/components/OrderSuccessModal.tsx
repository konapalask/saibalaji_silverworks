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
        <div className="bg-gradient-to-r from-[#1A1918] via-[#2A2927] to-[#1A1918] text-white p-6 text-center relative border-b border-[#C5A059]/40">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Glowing Gold Badge */}
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#C5A059] animate-ping opacity-25" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#F1E0B0] flex items-center justify-center text-[#1A1918] shadow-lg">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORDER CONFIRMED & PLACED</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-[#FFF8EB]">
            {isWholesale ? 'Wholesale Requisition Placed!' : 'Order Confirmed!'}
          </h2>

          <div className="mt-2 inline-block px-3 py-1 bg-[#C5A059]/20 border border-[#C5A059]/50 rounded-full text-xs font-mono font-bold text-[#F1E0B0]">
            Order Ref: {orderNumber}
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          <div className="p-4 bg-[#FAF9F5] border border-[#E6E1DA] rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-semibold">Status:</span>
              <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Order Confirmed</span>
              </span>
            </div>
            
            {customerName && (
              <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2">
                <span className="text-gray-500 font-semibold">Customer:</span>
                <span className="font-bold text-[#1A1918]">{customerName}</span>
              </div>
            )}

            {grandTotal !== undefined && (
              <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2">
                <span className="text-gray-500 font-semibold">Grand Total:</span>
                <span className="font-serif font-bold text-base text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Items Summary */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-gray-500">Order Items:</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {items.map((it, idx) => {
                  const name = it.product_name || it.title || 'Silver Product';
                  const img = it.featured_image || it.image_url;
                  const qty = it.quantity || 1;
                  const price = it.effectivePrice || it.unitPrice || it.price;
                  const sz = it.measurement || it.size;

                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAF9F5] rounded-xl border border-gray-200 text-xs">
                      {img ? (
                        <img src={img} alt="" className="w-10 h-12 object-cover rounded-lg bg-black shrink-0" />
                      ) : (
                        <div className="w-10 h-12 bg-white rounded-lg flex items-center justify-center text-[#C5A059] shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1918] truncate">{name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          {sz && <span className="bg-[#1A1918] text-white px-1.5 py-0.2 rounded">Size: {sz}</span>}
                          <span>Qty: {qty}</span>
                        </div>
                      </div>
                      {price && (
                        <span className="font-bold text-[#1A1918]">₹{(price * qty).toLocaleString()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WhatsApp Notice for Retail Orders */}
          {!isWholesale && whatsappMessage && (
            <div className="p-3 bg-green-50 border border-green-300 rounded-xl text-xs text-green-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#25D366] fill-current" />
                <span>WhatsApp Order Message Prepared</span>
              </p>
              <p className="text-[11px] text-green-800">
                Click below to send your pre-formatted order directly to Sai Balaji Silver Works on WhatsApp.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-[#FAF9F5] border-t border-[#E6E1DA] space-y-2">
          {!isWholesale && whatsappMessage && (
            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>SEND ORDER ON WHATSAPP NOW</span>
            </button>
          )}

          <button
            onClick={handleViewMyOrders}
            className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Package className="w-4 h-4 text-[#C5A059]" />
            <span>VIEW IN MY ORDERS & TRACK STATUS</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-white border border-[#E6E1DA] hover:bg-gray-100 text-[#1A1918] py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
