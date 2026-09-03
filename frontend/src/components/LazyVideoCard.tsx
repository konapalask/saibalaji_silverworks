import React, { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { CompanyVideo } from '../types';

interface LazyVideoCardProps {
  video: CompanyVideo;
  onOpen: (video: CompanyVideo) => void;
  aspectRatio?: string; // e.g. 'aspect-16/10' (About/Wholesale) or 'aspect-9/14' (Home Reels)
  layout?: 'card' | 'reel';
}

export const LazyVideoCard: React.FC<LazyVideoCardProps> = ({
  video,
  onOpen,
  aspectRatio = 'aspect-16/10',
  layout = 'card'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Debounced hover preview: Only mount and play preview if user intentionally hovers for >= 300ms
  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimerRef.current = setTimeout(() => {
      setIsPreviewActive(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsPreviewActive(false);
  };

  // Viewport Watchdog: Stop preview immediately if card scrolls out of view
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isPreviewActive) {
            setIsPreviewActive(false);
          }
        });
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isPreviewActive]);

  // Clean up any lingering hover timer
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const badgeCode = video.filename ? video.filename.replace(/\.(mp4|MP4)$/i, '') : '';
  const thumbnailSrc = video.thumbnail_url || (video.filename ? `/public/video_thumbnails/${badgeCode}.webp` : '');

  if (layout === 'reel') {
    return (
      <div
        ref={cardRef}
        onClick={() => onOpen(video)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`group relative bg-black rounded-2xl overflow-hidden ${aspectRatio} border border-[#E5E0D8] shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-4 select-none`}
      >
        {/* Poster Image */}
        {thumbnailSrc && (
          <img
            src={thumbnailSrc}
            alt={video.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 pointer-events-none ${
              isImageLoaded ? 'opacity-85' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover Silent Preview Video */}
        {isPreviewActive && (
          <video
            ref={videoRef}
            src={video.video_url}
            className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-300 pointer-events-none"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
          />
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex justify-between items-start">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#B9A77A] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
            {video.category || 'Craftsmanship'}
          </span>
          {badgeCode && (
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-mono rounded">
              #{badgeCode}
            </span>
          )}
        </div>

        {/* Bottom Title & Play CTA */}
        <div className="relative z-10 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#B9A77A] group-hover:text-white flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <h4 className="font-serif text-sm font-bold text-white line-clamp-1 group-hover:text-[#B9A77A] transition-colors">
            {video.title}
          </h4>
          <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>
      </div>
    );
  }

  // Standard Card Layout (for About & Wholesale Catalogue)
  return (
    <div
      ref={cardRef}
      onClick={() => onOpen(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E6E1DA] hover:border-[#C5A059] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between select-none"
    >
      {/* Thumbnail / Video Container */}
      <div className={`relative ${aspectRatio} bg-black overflow-hidden`}>
        {/* Placeholder Shimmer when image is loading */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#1A1918] animate-pulse" />
        )}

        {/* Lightweight WebP Poster */}
        {thumbnailSrc && (
          <img
            src={thumbnailSrc}
            alt={video.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isImageLoaded ? 'opacity-90' : 'opacity-0'
            }`}
          />
        )}

        {/* Dynamic Silent Preview Stream on Intentional Hover */}
        {isPreviewActive && (
          <video
            ref={videoRef}
            src={video.video_url}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
          />
        )}

        {/* Category & Badge overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#B9A77A] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
            {video.category || 'Craftsmanship'}
          </span>
          {badgeCode && (
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-mono rounded">
              #{badgeCode}
            </span>
          )}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#C5A059] group-hover:text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 space-y-2 bg-white">
        <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1 group-hover:text-[#C5A059] transition-colors">
          {video.title}
        </h4>
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
};
