import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#17191C] text-[#F1F1EE] pt-20 pb-12 overflow-hidden border-t border-white/10 font-sans">

      {/* Ultra-Faint Full-Width Brand Wordmark Background */}
      <div className="absolute inset-x-0 bottom-12 text-center pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
        <span className="font-serif text-[14vw] font-bold tracking-[0.2em] text-white uppercase block leading-none">
          SILVERWORKS
        </span>
      </div>

      <div className="relative z-10 max-w-[1450px] mx-auto px-6 sm:px-12 lg:px-16 space-y-16">

        {/* 01. TOP EDITORIAL STATEMENT & BRAND LOCKUP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:items-end border-b border-white/10 pb-12 text-center sm:text-left">

          <div className="lg:col-span-8 space-y-4 flex flex-col items-center sm:items-start">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
              THE HOUSE OF SAI BALAJI
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F1F1EE] leading-[1.1] tracking-tight">
              A LEGACY SHAPED IN PURE SILVER.
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-[#A0A0A0] font-light leading-relaxed">
              From our atelier in Tenali to homes and businesses across India, Sai Balaji Silverworks shapes pure silver with precision, heritage, and NABL hallmarking standards.
            </p>
          </div>

          {/* Brand Lockup */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start lg:items-end space-y-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1.5 rounded-xl shadow-xs border border-white/20">
                <img
                  src="/logo.webp"
                  alt="Sai Balaji Silverworks Logo"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl font-normal tracking-[0.16em] text-white leading-tight">
                  SAI BALAJI
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#B9A77A] font-semibold font-sans mt-0.5">
                  SILVERWORKS
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-[#888888] font-sans">
                  EST. 2019 • TENALI, AP
                </span>
              </div>
            </Link>
          </div>

        </div>

        {/* 02. 4-COLUMN NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-sm text-center sm:text-left">

          {/* Column 1: Explore */}
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#B9A77A] border-b border-white/10 pb-2 inline-block">
              QUICK LINKS
            </h3>
            <ul className="space-y-2.5 text-[#A0A0A0] font-light text-xs sm:text-sm flex flex-col items-center sm:items-start">
              <li>
                <Link to="/home" className="hover:text-white transition-colors flex items-center gap-1 group justify-center sm:justify-start">
                  <span>Home</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#B9A77A]" />
                </Link>
              </li>
              <li>
                <Link to="/shop/retail" className="hover:text-white transition-colors flex items-center gap-1 group justify-center sm:justify-start">
                  <span>Shop All Products</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#B9A77A]" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1 group justify-center sm:justify-start">
                  <span>About Our Atelier</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#B9A77A]" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1 group justify-center sm:justify-start">
                  <span>Contact & Showroom</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#B9A77A]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#B9A77A] border-b border-white/10 pb-2 inline-block">
              COLLECTIONS
            </h3>
            <ul className="space-y-2.5 text-[#A0A0A0] font-light text-xs sm:text-sm flex flex-col items-center sm:items-start">
              <li>
                <Link to="/category/silver-god-temple-items" className="hover:text-white transition-colors">
                  Silver God & Goddess Idols
                </Link>
              </li>
              <li>
                <Link to="/category/silver-pooja-articles" className="hover:text-white transition-colors">
                  Silver Pooja Articles & Thalis
                </Link>
              </li>
              <li>
                <Link to="/category/silver-dining-tableware" className="hover:text-white transition-colors">
                  Dining & Tableware
                </Link>
              </li>
              <li>
                <Link to="/category/silver-home-decor" className="hover:text-white transition-colors">
                  Home Décor & Vases
                </Link>
              </li>
              <li>
                <Link to="/category/silver-baby-kids-gifts" className="hover:text-white transition-colors">
                  Silver Baby Gifts & Coins
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Business & Custom */}
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#B9A77A] border-b border-white/10 pb-2 inline-block">
              B2B & CUSTOM
            </h3>
            <ul className="space-y-2.5 text-[#A0A0A0] font-light text-xs sm:text-sm flex flex-col items-center sm:items-start">
              <li>
                <Link to="/shop/wholesale" className="hover:text-white transition-colors">
                  B2B Wholesale Portal
                </Link>
              </li>
              <li>
                <Link to="/category/customized-silver-products" className="hover:text-white transition-colors">
                  Custom Silver Minting
                </Link>
              </li>
              <li>
                <Link to="/category/silver-corporate-premium-gifts" className="hover:text-white transition-colors">
                  Corporate Gifting
                </Link>
              </li>
              <li>
                <Link to="/wholesale/request" className="hover:text-white transition-colors">
                  Bulk PDF Quotation Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Connect */}
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#B9A77A] border-b border-white/10 pb-2 inline-block">
              CONTACT ATELIER
            </h3>
            <div className="space-y-2.5 text-[#A0A0A0] font-light text-xs sm:text-sm flex flex-col items-center sm:items-start">
              <p className="flex items-start justify-center sm:justify-start gap-2 text-center sm:text-left">
                <MapPin className="w-4 h-4 text-[#B9A77A] shrink-0 mt-0.5" />
                <span>Main Silver Market, Autonagar, Tenali, AP - 522201</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-[#B9A77A] shrink-0" />
                <span>+91 9492664870</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-[#B9A77A] shrink-0" />
                <span>hello@saibalajisilverworks.com</span>
              </p>

              {/* Social Media */}
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-[#A0A0A0]">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#B9A77A] transition-colors" title="Instagram">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#B9A77A] transition-colors" title="Facebook">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#B9A77A] transition-colors" title="YouTube">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><polygon points="10 15 15 12 10 9 10 15" /></svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 03. WHOLESALE ENQUIRY STRIP */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B9A77A] block">
              WHOLESALE B2B ENQUIRIES
            </span>
            <p className="text-xs text-[#A0A0A0] font-light">
              For jewellery showrooms, distributors, temples, and bulk custom minting requirements.
            </p>
          </div>
          <Link
            to="/wholesale/request"
            className="px-6 py-2.5 bg-[#B9A77A] hover:bg-white text-[#17191C] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>START WHOLESALE ENQUIRY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 04. COPYRIGHT & NABL METADATA */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#888888]">

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span>© 2026 Sai Balaji Silverworks Pvt Ltd. All Rights Reserved.</span>
            <span>•</span>
            <span className="text-[#B9A77A] font-semibold">100% SPECTROMETRY HALLMARKED 999 & 925</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Shipping Policy</Link>
          </div>

        </div>

      </div>
    </footer>
  );
};
