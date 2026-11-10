import React from 'react';

export type CoverTheme = 'quiet_sea' | 'brighter_day' | 'last_horizon' | 'small_departures' | 'default';

interface BookCoverArtProps {
  theme?: CoverTheme | string;
  title?: string;
  subtitle?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'square' | 'banner';
}

export const BookCoverArt: React.FC<BookCoverArtProps> = ({
  theme = 'quiet_sea',
  title = 'بحر السكينة',
  subtitle = 'رواية ملحمية',
  className = '',
  aspectRatio = 'portrait'
}) => {
  // Normalize theme
  const t = (theme || 'quiet_sea').toLowerCase();

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'banner':
        return 'aspect-[21/9]';
      case 'portrait':
      default:
        return 'aspect-[3/4]';
    }
  };

  if (t.includes('day') || t.includes('brighter') || t.includes('botanical') || t.includes('يوم') || t.includes('نور')) {
    // Botanical & Terracotta Sun (A Brighter Day)
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#EFE8DC] border border-[#DDD4C5] shadow-sm select-none ${getAspectClass()} ${className}`}
      >
        <svg viewBox="0 0 300 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          {/* Background cream */}
          <rect width="300" height="400" fill="#EAE2D3" />
          {/* Warm Sun */}
          <circle cx="210" cy="140" r="42" fill="#C05638" />
          {/* Minimalist Botanical Branch */}
          <path
            d="M 60 360 C 90 280, 110 200, 150 90"
            fill="none"
            stroke="#263832"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path d="M 150 90 C 130 70, 110 80, 120 110 C 135 115, 145 105, 150 90 Z" fill="#2D463E" />
          <path d="M 135 130 C 100 120, 90 145, 105 165 C 120 165, 130 150, 135 130 Z" fill="#263832" />
          <path d="M 142 145 C 170 135, 180 160, 165 175 C 150 175, 145 160, 142 145 Z" fill="#3D5A50" />
          <path d="M 120 185 C 80 180, 75 210, 95 225 C 110 220, 115 200, 120 185 Z" fill="#263832" />
          <path d="M 115 235 C 150 225, 160 255, 140 270 C 125 270, 120 250, 115 235 Z" fill="#2D463E" />
          <path d="M 95 275 C 60 280, 65 310, 85 320 C 100 315, 100 295, 95 275 Z" fill="#3D5A50" />
        </svg>
        {title && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#EAE2D3]/90 via-[#EAE2D3]/50 to-transparent">
            <h4 className="font-serif font-bold text-[#1C1E21] text-sm sm:text-base leading-tight truncate">{title}</h4>
            {subtitle && <p className="text-[11px] text-[#756F68] font-sans mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>
    );
  }

  if (t.includes('horizon') || t.includes('night') || t.includes('moon') || t.includes('أفق') || t.includes('ليل')) {
    // Night Horizon with Crescent Moon & Mountains (The Last Horizon)
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#14202E] border border-[#23354A] shadow-sm select-none ${getAspectClass()} ${className}`}
      >
        <svg viewBox="0 0 300 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          {/* Deep Navy Night Canvas */}
          <rect width="300" height="400" fill="#131E2B" />
          {/* Stars */}
          <circle cx="60" cy="80" r="1.5" fill="#E8EDF5" opacity="0.8" />
          <circle cx="120" cy="50" r="2" fill="#E8EDF5" opacity="0.9" />
          <circle cx="240" cy="90" r="1.5" fill="#E8EDF5" opacity="0.7" />
          <circle cx="180" cy="130" r="1" fill="#E8EDF5" opacity="0.6" />
          {/* Crescent Moon */}
          <path
            d="M 140 100 A 30 30 0 1 0 170 145 A 25 25 0 1 1 140 100 Z"
            fill="#F4EAD4"
          />
          {/* Mountain Silhouettes */}
          <path d="M 0 400 L 0 290 Q 70 240, 140 270 T 300 250 L 300 400 Z" fill="#243345" />
          <path d="M 0 400 L 0 330 Q 90 290, 180 320 T 300 300 L 300 400 Z" fill="#1B2735" />
          {/* Terracotta Dune Accent */}
          <path d="M 0 400 Q 120 350, 300 380 L 300 400 Z" fill="#C05638" opacity="0.85" />
        </svg>
        {title && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#131E2B]/95 via-[#131E2B]/60 to-transparent">
            <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-tight truncate">{title}</h4>
            {subtitle && <p className="text-[11px] text-[#A2B1C2] font-sans mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>
    );
  }

  if (t.includes('departure') || t.includes('desert') || t.includes('dune') || t.includes('صحراء') || t.includes('رمال')) {
    // Warm Terracotta Desert Dunes (Small Departures)
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#EBD8C3] border border-[#D9C4AB] shadow-sm select-none ${getAspectClass()} ${className}`}
      >
        <svg viewBox="0 0 300 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="#EAD5BE" />
          {/* Pale Sun */}
          <circle cx="150" cy="110" r="38" fill="#FBF3E8" />
          {/* Terracotta Dunes Layer 1 */}
          <path d="M 0 400 L 0 260 Q 90 210, 200 250 T 300 240 L 300 400 Z" fill="#D98A5B" />
          {/* Dunes Layer 2 */}
          <path d="M 0 400 L 0 310 Q 110 270, 210 320 T 300 290 L 300 400 Z" fill="#C05638" />
          {/* Dunes Layer 3 */}
          <path d="M 0 400 Q 140 330, 300 360 L 300 400 Z" fill="#9C3C24" />
        </svg>
        {title && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#9C3C24]/90 via-[#C05638]/50 to-transparent">
            <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-tight truncate">{title}</h4>
            {subtitle && <p className="text-[11px] text-[#FBECE7] font-sans mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>
    );
  }

  // The Quiet Sea - Master Cover matching Image 2 perfectly!
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#233544] border border-[#374C5E] shadow-md select-none group ${getAspectClass()} ${className}`}
    >
      <svg viewBox="0 0 300 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
        {/* Soft Warm Sky */}
        <rect width="300" height="400" fill="#E5DFD3" />
        {/* Glowing Sun in Pale Sand */}
        <circle cx="150" cy="115" r="32" fill="#FDFBF7" />
        {/* Distant Hills in Deep Indigo */}
        <path d="M 0 200 Q 60 160, 130 185 T 300 170 L 300 400 L 0 400 Z" fill="#243444" />
        {/* Terracotta Middle Ridge */}
        <path d="M 120 185 Q 210 170, 300 210 L 300 260 L 120 230 Z" fill="#C05638" />
        {/* Serene Winding Sea Channel */}
        <path
          d="M 100 210 Q 140 230, 110 270 Q 70 310, 150 400 L 0 400 L 0 210 Z"
          fill="#1C2C3A"
        />
        {/* Sea Ripple Texture */}
        <path d="M 20 280 Q 50 275, 90 282" stroke="#4A657D" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 40 320 Q 80 315, 120 325" stroke="#4A657D" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 15 350 Q 70 345, 140 355" stroke="#4A657D" strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
      {/* Title typography inside card */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-[#1C2C3A]/90 via-[#1C2C3A]/30 to-transparent">
        <span className="text-[10px] tracking-[0.25em] text-[#C5D3E0] uppercase font-sans">
          A NOVEL
        </span>
        <h3 className="font-serif font-bold text-white text-xl sm:text-2xl mt-1 leading-tight tracking-wide">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[#E5DFD3]/80 font-serif italic mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
