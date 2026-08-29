import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title = "Sai Balaji Silverworks - Cinematic Showcase",
  description
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isForcedLandscape, setIsForcedLandscape] = useState(false);

  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    const isSmallTouch = window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    return isMobileUA || isSmallTouch;
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    const handleFullscreenAndOrientation = () => {
      const fsElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const isFs = Boolean(
        fsElement &&
          containerRef.current &&
          (fsElement === containerRef.current || containerRef.current.contains(fsElement))
      );

      const activeFs = isFullscreen || isFs;
      setIsFullscreen(activeFs);

      if (activeFs && isMobileDevice()) {
        if (window.innerHeight > window.innerWidth) {
          setIsForcedLandscape(true);
        } else {
          setIsForcedLandscape(false);
        }
      } else {
        setIsForcedLandscape(false);
        if (!activeFs && isMobileDevice()) {
          if (screen.orientation && typeof screen.orientation.unlock === 'function') {
            try {
              screen.orientation.unlock();
            } catch (e) {
              // Ignore unlock error
            }
          }
        }
      }
    };

    handleFullscreenAndOrientation();

    document.addEventListener('fullscreenchange', handleFullscreenAndOrientation);
    document.addEventListener('webkitfullscreenchange', handleFullscreenAndOrientation);
    document.addEventListener('mozfullscreenchange', handleFullscreenAndOrientation);
    document.addEventListener('MSFullscreenChange', handleFullscreenAndOrientation);
    window.addEventListener('resize', handleFullscreenAndOrientation);
    window.addEventListener('orientationchange', handleFullscreenAndOrientation);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenAndOrientation);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenAndOrientation);
      document.removeEventListener('mozfullscreenchange', handleFullscreenAndOrientation);
      document.removeEventListener('MSFullscreenChange', handleFullscreenAndOrientation);
      window.removeEventListener('resize', handleFullscreenAndOrientation);
      window.removeEventListener('orientationchange', handleFullscreenAndOrientation);
    };
  }, [isFullscreen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((current / dur) * 100);
    setDuration(dur);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    const fsElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (fsElement || isFullscreen || isForcedLandscape) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }

      if (isMobileDevice()) {
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          try {
            screen.orientation.unlock();
          } catch (e) {}
        }
      }
      setIsFullscreen(false);
      setIsForcedLandscape(false);
    } else {
      // Enter fullscreen
      const el = containerRef.current as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
        return;
      }

      setIsFullscreen(true);

      if (isMobileDevice()) {
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          try {
            await screen.orientation.lock('landscape').catch(() => {});
          } catch (err) {}
        }
        if (window.innerHeight > window.innerWidth) {
          setIsForcedLandscape(true);
        }
      }
    }
  };

  const handleClose = () => {
    const fsElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (fsElement || isFullscreen || isForcedLandscape) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      if (isMobileDevice() && screen.orientation && typeof screen.orientation.unlock === 'function') {
        try {
          screen.orientation.unlock();
        } catch (e) {}
      }
    }
    setIsFullscreen(false);
    setIsForcedLandscape(false);
    onClose();
  };

  const containerClasses = [
    "video-player",
    "mobile-video-fullscreen",
    isForcedLandscape ? "mobile-landscape-forced" : "",
    "relative bg-black rounded-3xl overflow-hidden w-full max-w-5xl aspect-video shadow-2xl border border-[#C5A059]/40 flex flex-col justify-between"
  ].filter(Boolean).join(" ");

  const videoClasses = (isForcedLandscape || isFullscreen)
    ? "w-full h-full object-contain bg-black cursor-pointer"
    : "w-full h-full object-cover cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
      <div 
        ref={containerRef}
        className={containerClasses}
      >
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6 flex justify-between items-start text-white">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
              SAI BALAJI SILVERWORKS CINEMATIC SHOWCASE
            </span>
            <h3 className="font-serif text-sm sm:text-lg font-bold tracking-wide mt-0.5">{title}</h3>
          </div>

          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C5A059] hover:text-[#1A1918] text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Element */}
        <video 
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          className={videoClasses}
          playsInline
          autoPlay
          muted
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 space-y-3">
          {/* Timeline Slider */}
          <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 accent-[#C5A059] rounded-lg cursor-pointer transition-all"
          />

          {/* Action buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button 
                onClick={toggleMute}
                className="text-white hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <span className="text-[11px] text-gray-300 font-mono">
                {videoRef.current ? Math.floor(videoRef.current.currentTime) : 0}s / {Math.floor(duration)}s
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="text-gray-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>

              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-[#C5A059] transition-colors p-1 cursor-pointer"
              >
                {(isFullscreen || isForcedLandscape) ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
