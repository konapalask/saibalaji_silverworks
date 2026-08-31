import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold block">
          LEGAL & TRANSPARENCY
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#202020]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans max-w-2xl mx-auto">
          At Sai Balaji Silverworks Pvt. Ltd., we respect your privacy and are committed to protecting the personal and business information you share with us.
        </p>
      </div>

      {/* Key Guarantees Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">256-Bit SSL Encryption</h4>
            <p className="text-[11px] text-gray-600">All data transactions are strictly encrypted.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">No Data Selling</h4>
            <p className="text-[11px] text-gray-600">We never sell your details to third parties.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#C5A059] border border-[#E5E0D8]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1918]">NABL Compliant Record</h4>
            <p className="text-[11px] text-gray-600">Audit logs strictly for hallmarking & compliance.</p>
          </div>
        </div>
      </div>

      {/* Detailed Policy Content */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-12 space-y-10 shadow-xs">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">01.</span> Introduction & Scope
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            This Privacy Policy describes how Sai Balaji Silverworks Pvt. Ltd. ("Sai Balaji Silverworks", "we", "us", or "our") collects, uses, stores, and protects information when you visit our website, place retail orders, request B2B wholesale quotations, or interact with our services.
          </p>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            By utilizing our digital platform or providing information at our Tenali atelier, you consent to the data practices described in this policy.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">02.</span> Information We Collect
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-700">
            <p className="font-bold text-[#1A1918]">We collect information directly from you when you register, make a purchase, or submit a wholesale quotation request:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li><strong>Personal Identification:</strong> Full name, email address, phone number, and delivery street address.</li>
              <li><strong>B2B Wholesale Credentials:</strong> Store or company name, GSTIN (GST identification number), business address, and quotation specifications.</li>
              <li><strong>Transaction & Order History:</strong> Details of purchased 999 fine silver & 925 sterling articles, weights, melt certificates, order amounts, and payment status.</li>
              <li><strong>Communication Data:</strong> Inquiries, WhatsApp support messages, and feedback submitted to our team.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and site interaction cookies.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">03.</span> How We Use Your Information
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-700">
            <p>Your information is used exclusively for legitimate business and fulfillment purposes:</p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>Processing and delivering retail and bulk wholesale silver orders.</li>
              <li>Generating official NABL spectrometry purity certificates and tax invoices.</li>
              <li>Coordinating secure, insured logistics and courier dispatch.</li>
              <li>Sending order status updates, payment confirmations, and delivery notifications.</li>
              <li>Preventing fraudulent transactions and maintaining compliance with Indian tax and bullion regulations.</li>
              <li>Improving user experience and website navigation.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">04.</span> Data Protection & Security
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            We implement robust physical, technical, and administrative security safeguards to protect your personal information against unauthorized access, loss, or alteration. Online transactions utilize encrypted protocols (HTTPS / 256-bit SSL). Payment gateway interactions are directly handled by PCI-DSS compliant payment gateways; we do not store full credit card numbers or UPI PINs on our servers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">05.</span> Information Sharing & Third Parties
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            We do not sell, rent, or trade your personal information. We only share necessary data with trusted service providers bound by strict confidentiality:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <li><strong>Insured Courier Partners:</strong> For safe transit and delivery of precious silver goods to your doorstep.</li>
            <li><strong>Payment Gateways & Banking Institutions:</strong> To process authorized transactions securely.</li>
            <li><strong>Legal & Regulatory Authorities:</strong> When strictly required by law, court order, or GST statutory audits.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">06.</span> Your Privacy Rights & Choices
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            You have the right to access, update, or correct your personal information stored in your Sai Balaji Silverworks account at any time. If you wish to delete your account or request data removal, please contact our privacy compliance officer.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <span className="text-[#C5A059] text-base">07.</span> Contacting Privacy Officer
          </h2>
          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E0D8] space-y-3 text-xs sm:text-sm text-gray-700">
            <p className="font-bold text-[#1A1918]">Sai Balaji Silverworks Pvt. Ltd. — Legal & Privacy Division</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Main Silver Market, Autonagar, Tenali, Andhra Pradesh - 522201, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>privacy@saibalajisilverworks.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 9492664870</span>
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer link to Terms & Conditions */}
      <div className="text-center pt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
        <span>Looking for Terms of Service?</span>
        <Link to="/terms-and-conditions" className="text-[#C5A059] font-bold hover:underline flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>View Terms & Conditions</span>
        </Link>
      </div>

    </div>
  );
};

export default PrivacyPolicy;
