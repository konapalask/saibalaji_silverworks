import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#061020] text-[#F1F1EE] pt-24 pb-12 overflow-hidden border-t border-white/10 font-sans">

      {/* Ultra-Faint Full-Width Brand Wordmark Background (4% Opacity) */}
      <div className="absolute inset-x-0 bottom-12 text-center pointer-events-none select-none overflow-hidden opacity-[0.04] z-0">
        <span className="font-serif text-[14vw] font-bold tracking-[0.2em] text-[#C8C8C4] whitespace-nowrap uppercase block leading-none">
          SILVERWORKS
        </span>
      </div>

      <div className="relative z-10 max-w-[1450px] mx-auto px-6 sm:px-12 lg:px-20 space-y-20">

        {/* 01. TOP EDITORIAL STATEMENT & UNBOXED BRAND LOCKUP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end border-b border-white/10 pb-16">

          <div className="lg:col-span-8 space-y-5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-[#989894] block">
              THE HOUSE SIGNATURE
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#F1F1EE] leading-[1.1] tracking-tight">
              A LEGACY <br />
              <span className="text-silver-metallic font-normal italic">SHAPED IN SILVER.</span>
            </h2>
            <p className="max-w-2xl text-sm sm:text-base text-[#989894] font-light leading-relaxed">
              From our roots in Tenali to homes and businesses across India, Sai Balaji Silverworks continues to shape silver with precision, craftsmanship and purpose.
            </p>
          </div>

          {/* Brand Lockup with White Rounded Logo Container */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end space-y-3">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="bg-white p-1.5 rounded-xl shadow-sm border border-[#C8C8C4]/40">
                <img
                  src="/logo.PNG"
                  alt="Sai Balaji Silverworks Logo"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-normal tracking-[0.18em] text-[#F1F1EE] group-hover:text-white transition-colors leading-tight">
                  SAI BALAJI
                </span>
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#C8C8C4] font-semibold font-sans mt-0.5">
                  SILVERWORKS
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-[#6F6F6B] font-sans">
                  EST. 1998 • TENALI, INDIA
                </span>
              </div>
            </Link>
          </div>

        </div>

        {/* 02. 4-COLUMN EDITORIAL NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">

          {/* Column 1: Explore */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4] border-b border-white/10 pb-2 inline-block">
              EXPLORE
            </h3>
            <ul className="space-y-3 text-[#989894] font-light text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-[#F1F1EE] transition-colors flex items-center gap-1 group">
                  <span>Our Story</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <a href="/home#craftsmanship" className="hover:text-[#F1F1EE] transition-colors flex items-center gap-1 group">
                  <span>Craftsmanship</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </li>
              <li>
                <Link to="/shop/retail" className="hover:text-[#F1F1EE] transition-colors flex items-center gap-1 group">
                  <span>Retail Collections</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <a href="/home#manufacturing" className="hover:text-[#F1F1EE] transition-colors flex items-center gap-1 group">
                  <span>Manufacturing Atelier</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4] border-b border-white/10 pb-2 inline-block">
              COLLECTIONS
            </h3>
            <ul className="space-y-3 text-[#989894] font-light text-xs sm:text-sm">
              <li>
                <Link to="/category/silver-god-temple-items" className="hover:text-[#F1F1EE] transition-colors">
                  Silver God Idols
                </Link>
              </li>
              <li>
                <Link to="/category/silver-pooja-articles" className="hover:text-[#F1F1EE] transition-colors">
                  Pooja Collection
                </Link>
              </li>
              <li>
                <Link to="/category/silver-dining-tableware" className="hover:text-[#F1F1EE] transition-colors">
                  Silverware & Dining
                </Link>
              </li>
              <li>
                <Link to="/category/silver-home-decor" className="hover:text-[#F1F1EE] transition-colors">
                  Home & Décor
                </Link>
              </li>
              <li>
                <Link to="/category/silver-baby-kids-gifts" className="hover:text-[#F1F1EE] transition-colors">
                  Silver Gifts & Bullion
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Business */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4] border-b border-white/10 pb-2 inline-block">
              BUSINESS
            </h3>
            <ul className="space-y-3 text-[#989894] font-light text-xs sm:text-sm">
              <li>
                <Link to="/shop/wholesale" className="hover:text-[#F1F1EE] transition-colors">
                  B2B Wholesale
                </Link>
              </li>
              <li>
                <Link to="/category/customized-silver-products" className="hover:text-[#F1F1EE] transition-colors">
                  Custom Orders & Minting
                </Link>
              </li>
              <li>
                <Link to="/category/silver-corporate-premium-gifts" className="hover:text-[#F1F1EE] transition-colors">
                  Corporate Gifting
                </Link>
              </li>
              <li>
                <Link to="/wholesale/request" className="hover:text-[#F1F1EE] transition-colors">
                  Bulk PDF Quotation Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4] border-b border-white/10 pb-2 inline-block">
              CONNECT
            </h3>
            <div className="space-y-3 text-[#989894] font-light text-xs sm:text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C8C8C4] shrink-0 mt-0.5" />
                <span>Main Silver Market, Autonagar, Tenali, AP - 522201</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8C8C4] shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8C8C4] shrink-0" />
                <span>hello@saibalajisilverworks.com</span>
              </p>

              {/* Minimal Line Social Icons */}
              <div className="flex items-center gap-4 pt-3 text-[#989894]">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#F1F1EE] transition-colors" title="Instagram">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#F1F1EE] transition-colors" title="Facebook">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#F1F1EE] transition-colors" title="YouTube">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><polygon points="10 15 15 12 10 9 10 15" /></svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 03. MINIMAL B2B WHOLESALE ENQUIRY STRIP */}
        <div className="p-8 border border-white/10 bg-[#0D2040] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C8C8C4] block">
              WHOLESALE ENQUIRIES
            </span>
            <p className="text-xs text-[#989894] font-light">
              For jewellery showrooms, distributors, temples and bulk requirements.
            </p>
          </div>
          <Link
            to="/wholesale/request"
            className="px-6 py-3 bg-[#EEEEEA] hover:bg-[#C8C8C4] text-[#0A192F] text-[10px] font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-2 shrink-0"
          >
            <span>START AN ENQUIRY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 04. LEGAL ROW & NABL HALLMARKING TRUST METADATA */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#6F6F6B]">

          <div className="flex items-center gap-4 text-center md:text-left">
            <span>© 2026 Sai Balaji Silverworks Pvt Ltd. All Rights Reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="text-[#989894] font-semibold">100% NABL SPECTROMETRY HALLMARKED 999 & 925</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-[#F1F1EE] transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-[#F1F1EE] transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#F1F1EE] transition-colors">Shipping Policy</Link>
            <Link to="/contact" className="hover:text-[#F1F1EE] transition-colors">Refund Policy</Link>
          </div>

        </div>

      </div>
    </footer>
  );
};
