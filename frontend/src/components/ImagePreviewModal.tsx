import React from 'react';
import { X, ZoomIn } from 'lucide-react';

export interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  sku?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  sku
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#1A1918]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#121212] border-2 border-[#C5A059]/60 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#1A1918] border-b border-[#C5A059]/30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 bg-[#C5A059]/20 text-[#C5A059] rounded-lg">
              <ZoomIn className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              {title && <h4 className="font-serif font-bold text-sm text-white truncate">{title}</h4>}
              {sku && <span className="text-[10px] font-mono text-[#C5A059] block">SKU: {sku}</span>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Resolution Full Image Viewer Container */}
        <div className="p-4 flex-1 flex items-center justify-center bg-black/90 min-h-[300px] max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt={title || 'Product Image Preview'}
            className="max-w-full max-h-[70vh] object-contain rounded-2xl drop-shadow-2xl transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 bg-[#1A1918] border-t border-white/10 text-center text-xs text-gray-400">
          <span>Click anywhere outside or press Close to dismiss zoom view</span>
        </div>
      </div>
    </div>
  );
};
