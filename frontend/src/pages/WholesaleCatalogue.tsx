import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles, ShoppingBag, Play, Video } from 'lucide-react';
import { MAIN_CATEGORIES } from '../data/categoriesData';
import { initialVideosData } from '../data/videosData';
import { CompanyVideo } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { useWholesale } from '../context/WholesaleContext';
import { useCart } from '../context/CartContext';

export const WholesaleCatalogue: React.FC = () => {
  const { wholesaleCount } = useWholesale();
  const { totalQuantity, setIsCartOpen } = useCart();
  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const factoryVideos = initialVideosData.slice(4, 8); // 4 factory reels

  const openVideo = (vid: CompanyVideo) => {
    setActiveVideo(vid);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-[#202020]">
      
      {/* Header Banner */}
      <div className="bg-white text-[#202020] rounded-3xl p-8 sm:p-12 border border-[#E5E0D8] relative overflow-hidden product-shadow">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="bg-[#B9A77A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            B2B WHOLESALE PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light leading-tight text-[#202020]">
            Direct Silver Manufacturing & Bulk Quotes
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] font-sans leading-relaxed">
            Select any of our 10 main categories below to view all subcategories and add products to your wholesale quotation request.
          </p>
          {wholesaleCount > 0 && (
            <div className="pt-2 flex items-center gap-4">
              <Link 
                to="/wholesale/request" 
                className="bg-[#202020] text-white hover:bg-[#B9A77A] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-[#B9A77A]" />
                <span>View Wholesale Request List ({wholesaleCount} Items)</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 10 Main Categories Showcase Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.35em] text-[#B9A77A] font-bold">
            B2B WHOLESALE CATEGORIES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#202020]">
            Main Silver Categories
          </h2>
          <p className="text-xs text-[#666666] font-sans">
            Click on any category to view its subcategories and bulk ordering options.
          </p>
        </div>

        {/* 4 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden product-card-hover flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-[#FAF8F5] overflow-hidden p-2">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-4 left-4 bg-white/95 text-[#202020] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#E5E0D8]">
                  {cat.subcategories.length} Subcategories
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202020] group-hover:text-[#B9A77A] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-2 mt-1 font-sans leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs font-semibold text-[#202020] group-hover:text-[#B9A77A]">
                  <span>Explore Subcategories</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B9A77A]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* B2B Factory Manufacturing Video Reels (Muted by default) */}
      <div className="bg-white rounded-3xl p-8 border border-[#E5E0D8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#B9A77A]/10 text-[#B9A77A] rounded-lg">
                <Video className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B9A77A]">
                FACTORY REELS
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#202020] mt-1">
              Live Tenali Plant Operations
            </h3>
          </div>
          <Link
            to="/about#video-archive"
            className="text-xs font-bold text-[#B9A77A] hover:underline flex items-center gap-1"
          >
            <span>View All 171 Process Videos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {factoryVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => openVideo(vid)}
              className="group relative bg-black rounded-2xl overflow-hidden aspect-16/10 border border-[#E5E0D8] shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-3"
            >
              <video
                src={vid.video_url}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                muted
                loop
                playsInline
                autoPlay
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-0.5 bg-black/60 text-[#B9A77A] text-[9px] font-bold uppercase tracking-wider rounded">
                  {vid.category}
                </span>
                <span className="px-1.5 py-0.5 bg-white/20 text-white text-[9px] font-mono rounded">
                  MUTED
                </span>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#B9A77A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <h4 className="font-serif text-xs font-bold text-white line-clamp-1">
                  {vid.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={activeVideo.video_url}
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}

      {/* Floating Bottom Action Bar for Cart */}
      {(totalQuantity > 0 || wholesaleCount > 0) && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#1A1918] text-[#FAF9F5] p-4 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center gap-4">
          <div>
            <p className="text-xs font-bold">{totalQuantity || wholesaleCount} Items Selected</p>
            <p className="text-[10px] text-gray-400">Items ready in your cart</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#C5A059] text-[#1A1918] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>VIEW CART</span>
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
