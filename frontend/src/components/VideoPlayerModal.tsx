import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen, videoUrl]);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
      <div 
        ref={containerRef}
        className="relative bg-black rounded-3xl overflow-hidden w-full max-w-5xl aspect-video shadow-2xl border border-[#C5A059]/40 flex flex-col justify-between"
      >
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 flex justify-between items-start text-white">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block">
              SAI BALAJI SILVERWORKS CINEMATIC EXPERIENCE
            </span>
            <h3 className="font-serif text-xl font-bold tracking-wide mt-0.5">{title}</h3>
            {description && <p className="text-xs text-gray-300 max-w-lg mt-1">{description}</p>}
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C5A059] hover:text-[#1A1918] text-white flex items-center justify-center transition-all border border-white/20"
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
          className="w-full h-full object-cover cursor-pointer"
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
                className="w-10 h-10 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button 
                onClick={toggleMute}
                className="text-white hover:text-[#C5A059] transition-colors"
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
                className="text-gray-300 hover:text-white text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>

              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-[#C5A059] transition-colors p-1"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
