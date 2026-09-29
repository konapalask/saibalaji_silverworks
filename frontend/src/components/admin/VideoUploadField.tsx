import React, { useState, useRef } from 'react';
import { UploadCloud, Film, Play, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2, Sparkles, RefreshCw, Link as LinkIcon, HardDrive } from 'lucide-react';
import api from '../../services/api';

interface VideoUploadFieldProps {
  label?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoSizeMb?: string;
  onVideoChange: (videoUrl: string, thumbnailUrl?: string, sizeMb?: string, originalName?: string) => void;
  onThumbnailChange?: (thumbnailUrl: string) => void;
  required?: boolean;
  helperText?: string;
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label = 'Product / Showcase Video (.mp4, .mov, .webm)',
  videoUrl,
  thumbnailUrl,
  videoSizeMb,
  onVideoChange,
  onThumbnailChange,
  required = false,
  helperText = 'Upload authentic workshop, unboxing, or product videos. Formats: .mp4, .mov, .webm, .m4v. Max weight/size: 500 MB.'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Validate format and size
  const validateVideoFile = (file: File): string | null => {
    const validExtensions = ['.mp4', '.mov', '.webm', '.m4v', '.mkv', '.avi'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));
    const isVideoMime = file.type ? file.type.startsWith('video/') : false;

    if (!hasValidExt && !isVideoMime) {
      return `Unsupported file format. Please upload a .mp4, .mov, or .webm video.`;
    }

    const maxBytes = 500 * 1024 * 1024; // 500 MB
    if (file.size > maxBytes) {
      return `File weight too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed weight is 500 MB.`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateVideoFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);
    const weightMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setUploadStatusText(`Uploading ${file.name} (${weightMb})...`);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await api.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            const loadedMb = (progressEvent.loaded / (1024 * 1024)).toFixed(1);
            const totalMb = (progressEvent.total / (1024 * 1024)).toFixed(1);
            setUploadStatusText(`Uploading ${loadedMb} MB / ${totalMb} MB (${percentCompleted}%)...`);
          }
        }
      });

      if (res.data && res.data.success) {
        setUploadStatusText('Video uploaded! Finalizing thumbnail preview...');
        onVideoChange(
          res.data.video_url,
          res.data.thumbnail_url || thumbnailUrl,
          res.data.size_mb || weightMb,
          res.data.original_name || file.name
        );
      } else {
        throw new Error(res.data?.detail || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading video:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to upload video file. Please check server connection.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCustomThumbUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.webp, .jpg, .png)');
      return;
    }
    setIsUploadingThumb(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.image_url) {
        if (onThumbnailChange) {
          onThumbnailChange(res.data.image_url);
        } else {
          onVideoChange(videoUrl, res.data.image_url, videoSizeMb);
        }
      }
    } catch (err: any) {
      alert('Failed to upload custom thumbnail: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingThumb(false);
      if (thumbInputRef.current) {
        thumbInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveVideo = () => {
    onVideoChange('', '', '');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2.5 text-xs font-sans">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Film className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[10px] text-[#C5A059] hover:underline flex items-center gap-1 font-semibold"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showManualUrl ? 'Switch to File Upload' : 'Enter Direct URL'}</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Manual URL Input Option */}
      {showManualUrl && (
        <div className="p-3 bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl space-y-2">
          <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Direct Video URL (.mp4 / .mov or stream path)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrl}
              placeholder="/public/videos/sample.mp4 or https://..."
              onChange={(e) => onVideoChange(e.target.value, thumbnailUrl, videoSizeMb)}
              className="flex-1 bg-white border border-[#E6E1DA] rounded-lg px-3 py-1.5 font-mono text-[11px] text-[#1A1918]"
            />
            {videoUrl && (
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-bold text-[11px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Uploading Progress Screen */}
      {isUploading && (
        <div className="bg-[#FAF9F5] border-2 border-dashed border-[#C5A059] rounded-2xl p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#C5A059] font-bold text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{uploadStatusText}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-[#C5A059] to-[#8C6D2D] h-full rounded-full transition-all duration-300 relative"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            Please wait while your video file is securely streamed to the server and processed.
          </p>
        </div>
      )}

      {/* ACTIVE VIDEO PREVIEW CARD (When a videoUrl is loaded) */}
      {!isUploading && videoUrl && (
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
            
            {/* Embedded Video Player */}
            <div className="sm:col-span-6 relative bg-black rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md flex items-center justify-center group">
              <video
                src={videoUrl}
                poster={thumbnailUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <span className="bg-black/80 backdrop-blur-xs text-[#C5A059] font-bold text-[9px] uppercase px-2 py-0.5 rounded-full border border-[#C5A059]/40 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" /> Live Video
                </span>
              </div>
            </div>

            {/* Video Details & Meta Badges */}
            <div className="sm:col-span-6 space-y-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Video Attached Ready</span>
                </div>
                <p className="font-mono text-[10px] text-gray-700 truncate font-semibold" title={videoUrl}>
                  {videoUrl}
                </p>
              </div>

              {/* Badges: Format & Weight */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                {videoSizeMb && (
                  <span className="bg-[#FAF9F5] border border-[#E6E1DA] px-2 py-0.5 rounded-md font-mono font-bold text-gray-700 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#C5A059]" />
                    Weight: {videoSizeMb}
                  </span>
                )}
                <span className="bg-[#1A1918] text-[#C5A059] px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                  {videoUrl.split('.').pop() || 'VIDEO'}
                </span>
              </div>

              {/* Thumbnail Status Preview */}
              {thumbnailUrl && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail Preview"
                    className="w-12 h-8 object-cover rounded-md border border-gray-200 bg-black shrink-0"
                  />
                  <div className="text-[10px] truncate">
                    <span className="font-bold text-gray-700 block flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" /> WebP Thumbnail
                    </span>
                    <span className="text-gray-400 font-mono text-[9px] truncate block">{thumbnailUrl}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#1A1918] hover:text-white text-[#1A1918] border border-[#E6E1DA] rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#C5A059]" />
                  <span>Replace Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={isUploadingThumb}
                  className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#C5A059] hover:text-white text-[#1A1918] border border-[#E6E1DA] rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-3 h-3 text-[#C5A059]" />
                  <span>{isUploadingThumb ? 'Uploading Thumb...' : 'Custom Thumbnail'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DROPZONE / FILE PICKER (Shown when no video is uploaded yet) */}
      {!isUploading && !videoUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[#C5A059] bg-[#FAF9F5] scale-[1.01]'
              : 'border-gray-300 hover:border-[#C5A059] bg-[#FAF9F5]/60 hover:bg-[#FAF9F5]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E1DA] flex items-center justify-center text-[#C5A059] shadow-2xs group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-0.5">
              <p className="font-bold text-[#1A1918] text-xs">
                Click to Browse or Drag & Drop Video File
              </p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                {helperText}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-mono font-bold text-[9px]">
                .MP4
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-mono font-bold text-[9px]">
                .MOV
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-mono font-bold text-[9px]">
                .WEBM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1A1918] text-[#C5A059] font-mono font-bold text-[9px]">
                UP TO 500 MB
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-bold text-[9px] flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Auto-Thumbnail
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mov,.webm,.m4v,.mkv,video/mp4,video/quicktime,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={thumbInputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png,image/avif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCustomThumbUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
};
