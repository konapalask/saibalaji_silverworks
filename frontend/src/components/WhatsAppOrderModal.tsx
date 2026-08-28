import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2, ShieldCheck, MapPin, Phone, User, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { 
  CustomerDetails, 
  SingleProductOrder, 
  FullCartOrder, 
  generateOrderId, 
  generateSingleProductWhatsAppMessage, 
  generateFullCartWhatsAppMessage, 
  openWhatsAppOrderUrl 
} from '../utils/whatsappOrder';
import { CountryPhoneInput } from './CountryPhoneInput';
import { OrderSuccessModal } from './OrderSuccessModal';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleProductOrder?: SingleProductOrder | null;
  fullCartOrder?: FullCartOrder | null;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  singleProductOrder,
  fullCartOrder
}) => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [orderId] = useState<string>(() => generateOrderId());
  
  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    let savedAddr: any = {};
    try {
      const stored = localStorage.getItem('sbs_user_address');
      if (stored) savedAddr = JSON.parse(stored);
    } catch (e) {}

    return {
      name: user?.full_name || '',
      mobile: savedAddr.phone || user?.phone || '',
      address: savedAddr.street_address || '',
      city: savedAddr.city || '',
      pincode: savedAddr.pincode || '',
      notes: ''
    };
  });

  const [buttonState, setButtonState] = useState<'idle' | 'preparing' | 'opening' | 'success'>('idle');
  const [showNotice, setShowNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [preparedWhatsAppMsg, setPreparedWhatsAppMsg] = useState('');

  if (!isOpen) {
    if (isSuccessModalOpen) {
      return (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          orderNumber={orderId}
          customerName={customer.name}
          grandTotal={
            (singleProductOrder ? singleProductOrder.unitPrice * singleProductOrder.quantity : (fullCartOrder?.subtotal || 0)) * 1.03
          }
          items={singleProductOrder ? [{
            title: singleProductOrder.product.title,
            product_name: singleProductOrder.product.title,
            sku: singleProductOrder.product.sku,
            quantity: singleProductOrder.quantity,
            measurement: singleProductOrder.selected_measurement || singleProductOrder.selected_variant?.measurement || singleProductOrder.product.dimensions,
            effectivePrice: singleProductOrder.unitPrice,
            featured_image: singleProductOrder.product.featured_image
          }] : (fullCartOrder?.items || []).map(item => ({
            title: item.product.title,
            product_name: item.product.title,
            sku: item.product.sku,
            quantity: item.quantity,
            measurement: item.selected_measurement || item.selected_variant?.measurement || item.product.dimensions,
            effectivePrice: item.effectivePrice,
            featured_image: item.product.featured_image
          }))}
          whatsappMessage={preparedWhatsAppMsg}
          isWholesale={false}
        />
      );
    }
    return null;
  }


  // Determine items and totals for review
  const isSingle = !!singleProductOrder;
  
  const totalQty = isSingle 
    ? singleProductOrder!.quantity 
    : fullCartOrder?.totalQuantity || 0;
  
  const cartType = isSingle 
    ? singleProductOrder!.cartType 
    : fullCartOrder?.cartType || 'RETAIL';
  
  const subtotal = isSingle 
    ? singleProductOrder!.unitPrice * singleProductOrder!.quantity 
    : fullCartOrder?.subtotal || 0;

  const tax = Math.round(subtotal * 0.03);
  const shipping = 0; // No shipping fee
  const grandTotal = subtotal + tax;

  const handleConfirmAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) {
      setErrorMsg('Please enter your Customer Name.');
      return;
    }
    if (!customer.mobile.trim()) {
      setErrorMsg('Please enter your Mobile Number.');
      return;
    }

    setErrorMsg('');
    setButtonState('preparing');

    // Save order history to backend database
    try {
      const orderItems = isSingle && singleProductOrder ? [{
        id: singleProductOrder.product.id,
        product_id: singleProductOrder.product.id,
        product_name: singleProductOrder.product.title,
        product_sku: singleProductOrder.product.sku,
        measurement: singleProductOrder.selected_measurement || singleProductOrder.selected_variant?.measurement || singleProductOrder.product.dimensions,
        weight_g: singleProductOrder.weight_g ?? singleProductOrder.selected_variant?.weight_g ?? singleProductOrder.product.weight_g,
        unit_price: singleProductOrder.unitPrice,
        quantity: singleProductOrder.quantity,
        subtotal: singleProductOrder.unitPrice * singleProductOrder.quantity,
        featured_image: singleProductOrder.product.featured_image,
        image_url: singleProductOrder.product.featured_image,
        image: singleProductOrder.product.featured_image,
        full_image_url: singleProductOrder.product.featured_image ? (singleProductOrder.product.featured_image.startsWith('http') ? singleProductOrder.product.featured_image : `${window.location.origin}${singleProductOrder.product.featured_image.startsWith('/') ? '' : '/'}${singleProductOrder.product.featured_image}`) : undefined
      }] : (fullCartOrder?.items || []).map(item => ({
        id: item.product.id,
        product_id: item.product.id,
        product_name: item.product.title,
        product_sku: item.product.sku,
        measurement: item.selected_measurement || item.selected_variant?.measurement || item.product.dimensions,
        weight_g: item.weight_g ?? item.selected_variant?.weight_g ?? item.product.weight_g,
        unit_price: item.effectivePrice,
        quantity: item.quantity,
        subtotal: item.itemSubtotal,
        featured_image: item.product.featured_image,
        image_url: item.product.featured_image,
        image: item.product.featured_image,
        full_image_url: item.product.featured_image ? (item.product.featured_image.startsWith('http') ? item.product.featured_image : `${window.location.origin}${item.product.featured_image.startsWith('/') ? '' : '/'}${item.product.featured_image}`) : undefined
      }));

      await api.post('/orders', {
        order_number: orderId,
        user_id: user?.id,
        customer_name: customer.name,
        customer_email: user?.email || '',
        customer_phone: customer.mobile,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_pincode: customer.pincode,
        items: orderItems,
        subtotal,
        tax_amount: tax,
        shipping_charge: shipping,
        grand_total: grandTotal,
        status: 'Order Confirmed'
      });

      if (!isSingle) {
        clearCart();
      }
    } catch (err) {
      console.error('Failed to save order history to backend', err);
    }

    setTimeout(() => {
      setButtonState('opening');
      
      let rawMessage = '';
      if (isSingle && singleProductOrder) {
        rawMessage = generateSingleProductWhatsAppMessage(orderId, customer, singleProductOrder);
      } else if (fullCartOrder) {
        rawMessage = generateFullCartWhatsAppMessage(orderId, customer, {
          ...fullCartOrder,
          subtotal,
          tax,
          shipping,
          grandTotal
        });
      }

      setPreparedWhatsAppMsg(rawMessage);

      // Save customer address to localStorage for future use
      try {
        localStorage.setItem('sbs_user_address', JSON.stringify({
          phone: customer.mobile,
          street_address: customer.address,
          city: customer.city,
          pincode: customer.pincode
        }));
      } catch (e) {}

      // Open WhatsApp Click-to-Chat
      openWhatsAppOrderUrl(rawMessage);

      setButtonState('success');
      setShowNotice(true);
      setIsSuccessModalOpen(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1918]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-[#C5A059] rounded-3xl max-w-xl w-full shadow-2xl text-[#1A1918] relative animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Fixed Header */}
        <div className="p-5 sm:px-8 sm:pt-6 sm:pb-4 border-b border-[#E6E1DA] relative shrink-0 text-center bg-white">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-11 h-11 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
            DIRECT WHATSAPP ORDER ENGINE
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1918]">Confirm & Send WhatsApp Order</h3>
          <p className="text-xs text-gray-500">Order Ref: <span className="font-bold text-[#C5A059]">{orderId}</span></p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Website Notification after WhatsApp opens */}
          {showNotice && (
            <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-green-900">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>WhatsApp Opened Successfully!</span>
              </div>
              <p className="leading-relaxed">
                Please send the pre-filled order message to <strong>Sai Balaji Silver Works</strong> in your WhatsApp app to complete your order request.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleConfirmAndSend} className="space-y-6">
          
          {/* Customer Form Section */}
          <div className="bg-[#FAF9F5] border border-[#E6E1DA] rounded-2xl p-4 space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1918] border-b border-[#E6E1DA] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C5A059]" />
              <span>Customer Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Your Full Name"
                  className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Mobile / WhatsApp Number *</label>
                <CountryPhoneInput
                  required
                  value={customer.mobile}
                  onChange={(fullPhone) => setCustomer({ ...customer, mobile: fullPhone })}
                  placeholder="98765 43210"
                  bgClass="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Delivery Address (Optional)</label>
              <input 
                type="text" 
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="Door No., Street, Area..."
                className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">City</label>
                <input 
                  type="text" 
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Pincode</label>
                <input 
                  type="text" 
                  value={customer.pincode}
                  onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Additional Order Notes</label>
              <input 
                type="text" 
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                placeholder="Gift box, urgent dispatch, custom engraving notes..."
                className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Order Review Section */}
          <div className="border border-[#E6E1DA] rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-2">
              <h4 className="font-serif text-sm font-bold text-[#1A1918] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C5A059]" />
                <span>Order Review Summary</span>
              </h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                cartType === 'WHOLESALE' ? 'bg-[#C5A059] text-white' : 'bg-[#1A1918] text-white'
              }`}>
                🛒 {cartType} MODE
              </span>
            </div>

            {/* Line Items */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {isSingle && singleProductOrder ? (
                <div className="flex gap-3 items-center text-xs py-1">
                  <img 
                    src={singleProductOrder.product.featured_image} 
                    alt="" 
                    className="w-12 h-14 object-cover rounded-lg bg-[#FAF9F5]"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1918]">{singleProductOrder.product.title}</p>
                    <p className="text-[10px] text-gray-500">SKU: {singleProductOrder.product.sku} | Qty: {singleProductOrder.quantity}</p>
                  </div>
                  <p className="font-bold">₹{(singleProductOrder.unitPrice * singleProductOrder.quantity).toLocaleString()}</p>
                </div>
              ) : fullCartOrder ? (
                fullCartOrder.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center text-xs py-1 border-b border-gray-50 last:border-0">
                    <img 
                      src={item.product.featured_image} 
                      alt="" 
                      className="w-10 h-12 object-cover rounded-lg bg-[#FAF9F5]"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[#1A1918] line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-gray-500">SKU: {item.product.sku} | Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold">₹{item.itemSubtotal.toLocaleString()}</p>
                  </div>
                ))
              ) : null}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalQty} Total Items)</span>
                <span className="font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (3% Silver Tax)</span>
                <span className="font-bold">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Insured Freight Delivery</span>
                <span>{shipping === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1A1918] pt-2 border-t border-gray-200">
                <span>GRAND TOTAL</span>
                <span className="text-[#C5A059]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button with States */}
          <button
            type="submit"
            disabled={buttonState === 'preparing' || buttonState === 'opening'}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl text-xs uppercase font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>
              {buttonState === 'idle' && 'CONFIRM & ORDER ON WHATSAPP'}
              {buttonState === 'preparing' && 'Preparing Order...'}
              {buttonState === 'opening' && 'Opening WhatsApp...'}
              {buttonState === 'success' && 'Order message prepared in WhatsApp'}
            </span>
          </button>
        </form>

        </div>
      </div>
    </div>
  );
};
