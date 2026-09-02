import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Truck, Scale, ArrowLeft, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F6F1] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 text-[#202020]">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#C5A059] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About Us</span>
        </Link>
        <span className="text-xs text-[#888888]">Last Updated: August 2026</span>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-white border border-[#E5E0D8] rounded-2xl shadow-xs text-[#C5A059]">
            <FileText className="w-8 h-8" />
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold block">
          LEGAL & GOVERNANCE
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#202020]">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using our platform, purchasing silver items, or submitting wholesale quotation requests with Sai Balaji Silverworks.
        </p>
      </div>

      {/* Key Policy Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">Live Silver Rates</h4>
            <p className="text-[11px] text-gray-600">Prices reflect daily market silver bullion rates.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">100% Hallmarked</h4>
            <p className="text-[11px] text-gray-600">Certified 925 sterling & 999 fine purity.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">Fully Insured Transit</h4>
            <p className="text-[11px] text-gray-600">Shipments are 100% insured against loss or damage.</p>
          </div>
        </div>
      </div>

      {/* Detailed Terms Content */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-12 space-y-10 shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">01.</span> Agreement to Terms
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            These Terms and Conditions constitute a legally binding agreement between you ("Customer", "Buyer", or "User") and Sai Balaji Silverworks Pvt. Ltd. ("Company", "we", "us"). By accessing our website, creating an account, browsing product catalogues, purchasing silver products, or issuing B2B quotation requests, you agree to be bound by all terms outlined herein.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">02.</span> Silver Products, Purity & Pricing Dynamics
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p><strong>Purity Standards:</strong> All silver articles, divine idols, tableware, coins, and jewellery manufactured or sold by Sai Balaji Silverworks conform to official purity standards — either 999 Fine Silver (99.9% purity) or 925 Sterling Silver (92.5% purity) stamped with NABL spectrometry hallmarking tags.</p>
            <p><strong>Daily Market Silver Fluctuations:</strong> Due to continuous movements in national and international silver bullion spot prices, retail and wholesale prices quoted on our portal are tied to live market silver rates. Confirmed orders lock in the price at the exact timestamp of checkout or quotation acceptance.</p>
            <p><strong>Weight & Craftsmanship Tolerances:</strong> Handcrafted and cast silver articles may carry minor weight variations (+/- 2%) standard in precious metal manufacturing. Invoices state the precise final hallmarked weight.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">03.</span> Orders & B2B Wholesale Quotations
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Retail Purchases:</strong> Orders placed via the retail storefront are subject to stock availability and payment authorization.</li>
              <li><strong>B2B Wholesale Quotation Requests:</strong> Registered showrooms, jewellers, and corporate buyers can request custom bulk quotations. Quotes are valid for the timeframe specified on the official PDF document generated by our sales team.</li>
              <li><strong>Custom Silver Minting:</strong> Custom engraved coins, specialized idols, or bespoke corporate gifts require prior approval of design proofs and non-refundable advance deposits.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">04.</span> Payment Terms & Taxation
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Payments must be made in Indian Rupees (INR) through authorized payment gateways, bank wire transfers (RTGS/NEFT), or UPI. All transactions include applicable Goods and Services Tax (GST 3% on precious metals / GST 18% on making charges where applicable). Tax invoices with GSTIN details are issued for all purchases.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">05.</span> Shipping, Delivery & Transit Insurance
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>Every shipment dispatched from our Tenali unit is enclosed in tamper-evident, sealed security packaging and covered by comprehensive transit insurance until handed over to the receiver.</p>
            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E5E0D8] text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <strong>Unboxing Video Requirement:</strong> Customers are required to record a continuous unboxing video prior to opening outer courier seals. In the rare event of transit damage or missing articles, this unboxing video is required for processing insurance claims and replacements.
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">06.</span> Intellectual Property
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            All content on this platform — including product photography, 3D render designs, video documentaries, logos, trademarks, and text — is the exclusive intellectual property of Sai Balaji Silverworks Pvt. Ltd. Unauthorized reproduction, scraping, or commercial use is strictly prohibited.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">07.</span> Governing Law & Legal Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            These Terms and Conditions and any separate agreements shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in <strong>Tenali / Guntur District, Andhra Pradesh, India</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">08.</span> Legal Contact & Queries
          </h2>
          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E0D8] space-y-3 text-xs sm:text-sm text-gray-700">
            <p className="font-bold text-[#1A1918]">Sai Balaji Silverworks Pvt. Ltd. — Legal & Corporate Desk</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Main Silver Market, Autonagar, Tenali, Andhra Pradesh - 522201, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>legal@saibalajisilverworks.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 9492664870</span>
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer link to Privacy Policy */}
      <div className="text-center pt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
        <span>Looking for Privacy Policy?</span>
        <Link to="/privacy" className="text-[#C5A059] font-bold hover:underline flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>View Privacy Policy</span>
        </Link>
      </div>

    </div>
  );
};

export default TermsAndConditions;
