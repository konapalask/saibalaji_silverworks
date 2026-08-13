import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Sparkles, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1918] text-[#FAF9F5] pt-16 pb-12 border-t border-[#C5A059]/40 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quality Guarantee Badges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-14 border-b border-white/10 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">100% NABL Hallmarked</h4>
              <p className="text-xs text-gray-400 mt-1">Guaranteed 925 Sterling & 999 Fine Silver Purity</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">Direct Manufacturer Pricing</h4>
              <p className="text-xs text-gray-400 mt-1">Unmatched wholesale quotes & retail value</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">Pan-India Insured Dispatch</h4>
              <p className="text-xs text-gray-400 mt-1">Secure transit insurance for all retail & bulk orders</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14">
          
          {/* Brand Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-bold tracking-widest text-white">
                SAI BALAJI
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold">
                SILVERWORKS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 pr-4">
              Sai Balaji Silverworks is a premier South Indian manufacturer and wholesaler of fine silver products. From handcrafted 999 silver idols and 925 sterling dinner sets to modern silver jewellery and B2B corporate supplies, we embody silver artistry and purity.
            </p>
            <div className="pt-2 text-xs text-[#C5A059]">
              <span className="font-serif italic text-sm">"Crafted in Silver. Designed to Last."</span>
            </div>
          </div>

          {/* Retail Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-[#C5A059] uppercase tracking-wider">Retail Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/shop/retail?category=silver-idols" className="hover:text-white transition-colors">Silver Idols & Deities</Link></li>
              <li><Link to="/shop/retail?category=silver-pooja-items" className="hover:text-white transition-colors">Silver Pooja Articles</Link></li>
              <li><Link to="/shop/retail?category=silver-jewellery" className="hover:text-white transition-colors">925 Sterling Jewellery</Link></li>
              <li><Link to="/shop/retail?category=silver-utensils" className="hover:text-white transition-colors">Silver Dinnerware & Utensils</Link></li>
              <li><Link to="/shop/retail?category=silver-gifts" className="hover:text-white transition-colors">Silver Gift Items</Link></li>
            </ul>
          </div>

          {/* Wholesale B2B Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-[#C5A059] uppercase tracking-wider">B2B Wholesale</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/shop/wholesale" className="hover:text-white transition-colors">Wholesale Product Catalogue</Link></li>
              <li><Link to="/shop/wholesale" className="hover:text-white transition-colors">Request Bulk Quotation</Link></li>
              <li><Link to="/shop/wholesale" className="hover:text-white transition-colors">Custom Silver Minting & Coins</Link></li>
              <li><Link to="/shop/wholesale" className="hover:text-white transition-colors">Corporate Gifting Orders</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Quotation PDF</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-[#C5A059] uppercase tracking-wider">Factory Showroom</h4>
            <ul className="space-y-2.5 text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Main Road, Silver Market, Hyderabad, TS - 500002</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>wholesale@saibalajisilverworks.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Mon - Sat: 10:00 AM - 8:30 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4 font-sans">
          <p>© {new Date().getFullYear()} SAI BALAJI SILVERWORKS. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Wholesale</span>
            <span className="hover:text-gray-400 cursor-pointer">Hallmark Verification</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
