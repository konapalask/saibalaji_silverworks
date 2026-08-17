import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if mouse is over interactive luxury element
      const target = e.target as HTMLElement | null;
      if (target) {
        const cursorText = target.getAttribute('data-cursor') || target.closest('[data-cursor]')?.getAttribute('data-cursor');
        if (cursorText) {
          setIsHovered(true);
          setHoverText(cursorText);
        } else if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
          setIsHovered(true);
          setHoverText(null);
        } else {
          setIsHovered(false);
          setHoverText(null);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Desktop fine pointer only
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Precision Core Dot */}
      <div 
        className="fixed w-2 h-2 bg-[#D4D4D0] rounded-full transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />

      {/* Expanding Soft Outer Silver Ring */}
      <div 
        className={`fixed rounded-full border border-[#D4D4D0]/60 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 flex items-center justify-center backdrop-blur-[1px] ${
          isHovered ? 'w-16 h-16 bg-[#D4D4D0]/10 border-[#F1F1ED]' : 'w-8 h-8 opacity-40'
        }`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        {hoverText && (
          <span className="text-[8px] font-sans font-bold uppercase tracking-[0.2em] text-white">
            {hoverText}
          </span>
        )}
      </div>
    </div>
  );
};
