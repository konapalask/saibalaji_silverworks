import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Camera,
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';
import { GalleryPhoto } from '../types';

interface PhotoGalleryCarouselProps {
  photos: GalleryPhoto[];
  title?: string;
  subtitle?: string;
}

export const PhotoGalleryCarousel: React.FC<PhotoGalleryCarouselProps> = ({
  photos,
  title = "Workshop & Atelier Photo Gallery",
  subtitle = "Step inside our Tenali manufacturing facility. Unfiltered glimpses of ancestral silversmithing, heavy industrial presses, and fine hand-finishing."
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const total = photos.length;
  const currentPhoto = photos[currentIndex] || photos[0];

  // Navigation handlers
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const goToIndex = (index: number) => {
    if (index >= 0 && index < total) {
      setCurrentIndex(index);
    }
  };

  // Auto-scroll active thumbnail inside horizontal filmstrip only (never scrolls page)
  useEffect(() => {
    const container = thumbnailScrollRef.current;
    if (container) {
      const activeThumb = container.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        const targetScrollLeft = activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.clientWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, isFullscreen]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || total <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, total]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (diff > minSwipeDistance) {
      goToNext(); // Swiped left -> next
    } else if (diff < -minSwipeDistance) {
      goToPrev(); // Swiped right -> prev
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" id="atelier-gallery">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E1DA] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#C5A059]/10 text-[#C5A059] rounded-lg">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
              ATELIER & CRAFTSMANSHIP
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Slide counter */}
          <div className="px-3.5 py-1.5 bg-white rounded-full border border-[#E6E1DA] text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>
              <strong className="text-[#1A1918]">{String(currentIndex + 1).padStart(2, '0')}</strong>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-500">{String(total).padStart(2, '0')}</span>
            </span>
          </div>

          {/* Autoplay Toggle */}
          <button
            onClick={() => setIsAutoPlaying(prev => !prev)}
            className={`p-2 rounded-full border transition-all text-xs flex items-center justify-center cursor-pointer ${isAutoPlaying
                ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-sm'
                : 'bg-white text-gray-700 border-[#E6E1DA] hover:border-[#C5A059]'
              }`}
            title={isAutoPlaying ? "Pause Autoplay" : "Start Autoplay"}
            aria-label="Toggle autoplay"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      </div>

      {/* Main Gallery Stage Card */}
      <div
        className="relative rounded-3xl overflow-hidden bg-[#0D0D0D] border border-[#E6E1DA] shadow-xl select-none group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient Blurred Background for visual immersion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 filter blur-3xl scale-110 transition-all duration-700">
          <img
            src={currentPhoto.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Central Display Area with Fixed Elegant Height */}
        <div className="relative z-10 w-full h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center p-4 sm:p-8">
          <img
            key={currentPhoto.image_url}
            src={currentPhoto.image_url}
            alt={currentPhoto.title}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
            onClick={() => setIsFullscreen(true)}
            title="Click to view full screen"
          />

          {/* Forward and Backward Floating Navigation Buttons (< >) */}
          {/* Previous Button (<) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#C5A059] text-white border border-white/20 hover:border-[#C5A059] backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn"
            aria-label="Previous Photo"
            title="Previous Photo (<)"
            id="gallery-prev-btn"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-white group-hover/btn:translate-x-[-1px] transition-transform" />
          </button>

          {/* Next Button (>) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#C5A059] text-white border border-white/20 hover:border-[#C5A059] backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn"
            aria-label="Next Photo"
            title="Next Photo (>)"
            id="gallery-next-btn"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-white group-hover/btn:translate-x-[1px] transition-transform" />
          </button>

          {/* Quick Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-[#C5A059] text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer"
            title="Expand Fullscreen"
            aria-label="Expand image to fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="relative z-10 bg-gradient-to-t from-black via-black/85 to-transparent px-5 sm:px-8 py-5 text-white border-t border-white/10 min-h-[115px] flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#C5A059] text-white">
                  {currentPhoto.category || "Manufacturing Unit"}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Photo {currentIndex + 1} of {total}
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">
                {currentPhoto.title}
              </h3>
              {currentPhoto.description && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                  {currentPhoto.description}
                </p>
              )}
            </div>

            {/* Quick Navigation Hint */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-gray-400 shrink-0">
              <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">← / →</span>
              <span>Use arrows or &lt;&gt; buttons to navigate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filmstrip Thumbnail Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Select photo from workshop gallery</span>
          </span>
          <span>Click image to jump</span>
        </div>

        <div
          ref={thumbnailScrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#C5A059] scrollbar-track-gray-100 px-1"
        >
          {photos.map((photo, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                type="button"
                key={photo.id || index}
                onClick={(e) => {
                  e.preventDefault();
                  goToIndex(index);
                }}
                className={`relative shrink-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${isActive
                    ? 'ring-3 ring-[#C5A059] ring-offset-2 scale-105 shadow-lg'
                    : 'opacity-60 hover:opacity-100 hover:scale-102 border border-[#E6E1DA]'
                  }`}
                style={{ width: '84px', height: '84px' }}
                aria-label={`View photo ${index + 1}: ${photo.title}`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-[#C5A059]/15 flex items-center justify-center">
                    <span className="bg-[#1A1918]/80 text-[#C5A059] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      {index + 1}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between z-20 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                {currentPhoto.category || "Manufacturing Unit"}
              </span>
              <h4 className="font-serif text-base sm:text-xl font-bold text-white">
                {currentPhoto.title}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono px-3 py-1 rounded-full bg-white/10">
                {currentIndex + 1} / {total}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C5A059] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Fullscreen"
                aria-label="Close fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Fullscreen Image Container */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.image_url}
              alt={currentPhoto.title}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />

            {/* Modal < and > navigation buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/70 hover:bg-[#C5A059] text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous Photo"
              title="Previous Photo (<)"
            >
              <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/70 hover:bg-[#C5A059] text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next Photo"
              title="Next Photo (>)"
            >
              <ChevronRight className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Modal Caption */}
          <div className="text-center max-w-2xl mx-auto z-20" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs sm:text-sm text-gray-300">
              {currentPhoto.description}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
