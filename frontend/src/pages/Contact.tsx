import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
          GET IN TOUCH
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1918]">
          Contact Sai Balaji Silverworks
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Visit our Hyderabad showroom or submit your retail & wholesale inquiries directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Info Box */}
        <div className="lg:col-span-5 bg-[#1A1918] text-white rounded-3xl p-8 space-y-8 border border-[#C5A059]/40 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              HYDERABAD FACTORY SHOWROOM
            </span>
            <h3 className="font-serif text-2xl font-bold">Sai Balaji Silverworks Pvt Ltd</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <p className="leading-relaxed">Main Road, Silver Market, Near Charminar Heritage Zone, Hyderabad, Telangana - 500002</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C5A059] shrink-0" />
                <p>+91 98765 43210 / +91 040 2456 7890</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C5A059] shrink-0" />
                <p>wholesale@saibalajisilverworks.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#C5A059] shrink-0" />
                <p>Monday – Saturday: 10:00 AM – 8:30 PM IST</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-[#C5A059] italic">
            <p>"Direct Manufacturing & Wholesale Inquiries Welcome"</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#E6E1DA] shadow-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="font-serif text-2xl font-bold">Inquiry Sent Successfully</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Thank you for reaching out. Our representative will contact you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-[#1A1918] text-white rounded-xl text-xs uppercase">Send Another Message</button>
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
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs" />
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
              <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
