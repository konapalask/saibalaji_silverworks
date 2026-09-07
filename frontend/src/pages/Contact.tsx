import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { CountryPhoneInput } from '../components/CountryPhoneInput';
import { getAdminWhatsAppNumber, syncAdminWhatsAppNumber } from '../config/whatsappConfig';
import { openWhatsAppOrderUrl } from '../utils/whatsappOrder';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [adminPhone, setAdminPhone] = useState(getAdminWhatsAppNumber());
  const [lastMsg, setLastMsg] = useState('');

  useEffect(() => {
    syncAdminWhatsAppNumber().then(num => {
      if (num) setAdminPhone(num);
    });
  }, []);

  const formattedPhone = adminPhone
    ? (adminPhone.startsWith('91')
        ? `+91 ${adminPhone.slice(2, 7)} ${adminPhone.slice(7)}`
        : `+${adminPhone}`)
    : '+91 94926 64870';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let msg = `Hello Sai Balaji Silver Works Admin,\n\n`;
    msg += `I am submitting an inquiry from your website:\n\n`;
    msg += `CUSTOMER DETAILS\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Name: ${formData.name}\n`;
    msg += `Email: ${formData.email}\n`;
    if (formData.phone) msg += `Mobile / WhatsApp: ${formData.phone}\n`;
    if (formData.subject) msg += `Subject: ${formData.subject}\n`;
    msg += `\nINQUIRY MESSAGE\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `${formData.message}\n\n`;
    msg += `Please get back to me with details. Thank you!`;

    setLastMsg(msg);
    openWhatsAppOrderUrl(msg);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-[#202020]">
      
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B9A77A] font-bold">
          GET IN TOUCH
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#202020]">
          Contact Sai Balaji Silverworks
        </h1>
        <p className="text-xs sm:text-sm text-[#666666]">
          Visit our Tenali showroom or submit your retail & wholesale inquiries directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Info Box */}
        <div className="lg:col-span-5 bg-[#202020] text-white rounded-3xl p-8 space-y-8 border border-[#E5E0D8] shadow-md flex flex-col justify-between">
          <div className="space-y-6">
            <span className="bg-[#B9A77A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              TENALI FACTORY SHOWROOM
            </span>
            <h3 className="font-serif text-2xl font-bold">Sai Balaji Silverworks Pvt Ltd</h3>
            
            <div className="space-y-4 text-xs text-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#B9A77A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">Main Silver Market, Autonagar, Tenali, Andhra Pradesh - 522201</p>
              </div>
              <a href={`https://wa.me/${adminPhone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#B9A77A] transition-colors" title="Chat on WhatsApp">
                <Phone className="w-5 h-5 text-[#B9A77A] shrink-0" />
                <p>{formattedPhone}</p>
              </a>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#B9A77A] shrink-0" />
                <p>wholesale@saibalajisilverworks.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#B9A77A] shrink-0" />
                <p>Monday – Saturday: 10:00 AM – 8:30 PM IST</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-[#B9A77A] italic">
            <p>"Direct Manufacturing & Wholesale Inquiries Welcome"</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#E6E1DA] shadow-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-5">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Inquiry Sent to Admin WhatsApp</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Your details have been compiled and sent to our Admin WhatsApp number (<strong>{formattedPhone}</strong>). If WhatsApp did not open automatically, click the button below.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => openWhatsAppOrderUrl(lastMsg)}
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Admin WhatsApp Chat</span>
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-[#1A1918] hover:bg-[#B9A77A] text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1918]">Send Us an Inquiry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Your Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email Address *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number</label>
                  <CountryPhoneInput
                    value={formData.phone}
                    onChange={(fullPhone) => setFormData({ ...formData, phone: fullPhone })}
                    placeholder="98765 43210"
                    bgClass="bg-[#FAF9F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Retail / Wholesale Inquiry" className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Message *</label>
                <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs" />
              </div>
              <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#25D366] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all">
                <Send className="w-4 h-4" />
                <span>Submit & Chat on Admin WhatsApp</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
