import React from 'react';

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  size = 'md',
  className = '',
  showText = false
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-13 h-13',
    lg: 'w-18 h-18',
    xl: 'w-26 h-26',
    '2xl': 'w-36 h-36'
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Exact Official IMROP Seal Logo based on institutional insignia */}
      <div className={`relative ${sizeMap[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Top Text Path for Arabic circular inscription */}
            <path
              id="imropArabicArc"
              d="M 28 110 A 82 82 0 0 1 192 110"
              fill="none"
            />

            {/* Bottom Text Path for French circular inscription */}
            <path
              id="imropFrenchArc"
              d="M 192 110 A 82 82 0 0 1 28 110"
              fill="none"
            />

            {/* Inner Curving Path for IMROP acronym */}
            <path
              id="imropCenterArc"
              d="M 58 84 Q 110 52 162 84"
              fill="none"
            />

            {/* Gradients */}
            <linearGradient id="fishBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00AEEF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="waveSprayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            <linearGradient id="oceanDeepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#0A4D8C" />
            </linearGradient>
          </defs>

          {/* White Circular Base with Navy Rim */}
          <circle cx="110" cy="110" r="105" fill="#FFFFFF" />
          <circle cx="110" cy="110" r="103" stroke="#1A3382" strokeWidth="4.5" fill="#FFFFFF" />

          {/* Top Arabic Inscription */}
          <text fill="#1A3382" fontSize="12" fontWeight="800" fontFamily="sans-serif">
            <textPath href="#imropArabicArc" startOffset="50%" textAnchor="middle">
              المعهد الموريتاني لبحوث المحيطات و الصيد -
            </textPath>
          </text>

          {/* Bottom French Inscription */}
          <text fill="#1A3382" fontSize="7.8" fontWeight="800" letterSpacing="0.4" fontFamily="sans-serif">
            <textPath href="#imropFrenchArc" startOffset="50%" textAnchor="middle">
              - INSTITUT MAURITANIEN DE RECHERCHES OCÉANOGRAPHIQUES ET DES PÊCHES
            </textPath>
          </text>

          {/* Scientific Graph / Coordinate Grid (Upper Right Background) */}
          <g transform="translate(132, 72) scale(0.85)" opacity="0.6">
            {/* Grid Axes */}
            <line x1="0" y1="24" x2="44" y2="24" stroke="#94A3B8" strokeWidth="0.8" />
            <line x1="0" y1="0" x2="0" y2="24" stroke="#94A3B8" strokeWidth="0.8" />
            {/* Grid Lines */}
            <line x1="11" y1="0" x2="11" y2="24" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="22" y1="0" x2="22" y2="24" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="33" y1="0" x2="33" y2="24" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="44" y1="0" x2="44" y2="24" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="0" y1="6" x2="44" y2="6" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="0" y1="12" x2="44" y2="12" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="0" y1="18" x2="44" y2="18" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="1 1" />
            {/* Trend Data Curve */}
            <path
              d="M 4 20 L 12 15 L 20 18 L 28 10 L 36 12 L 42 4"
              fill="none"
              stroke="#1A3382"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Curved "IMROP" Acronym */}
          <text fill="#0070BA" fontSize="23" fontWeight="900" letterSpacing="3.5" fontFamily="system-ui, -apple-system, sans-serif">
            <textPath href="#imropCenterArc" startOffset="50%" textAnchor="middle">
              IMROP
            </textPath>
          </text>

          {/* Central Marine Fish & Dynamic Water Splash Wave Ensemble */}
          <g id="imropMarineGraphics">
            {/* 1. Deep Ocean Basin (Bottom Blue Fill) */}
            <path
              d="M 36 112 
                 C 34 135, 48 168, 86 182 
                 C 118 194, 154 186, 172 165 
                 C 152 178, 126 182, 102 172 
                 C 74 160, 62 140, 58 124 
                 C 50 128, 42 122, 36 112 Z"
              fill="url(#oceanDeepGrad)"
            />

            {/* 2. Main Splash Waves & Water Tendrils (Curving to the right) */}
            {/* Upper Wave Splash Spray 1 (Reaching Top-Right) */}
            <path
              d="M 112 118 
                 C 126 102, 146 82, 168 84 
                 C 172 84, 170 94, 162 96 
                 C 146 98, 130 114, 120 126 Z"
              fill="url(#waveSprayGrad)"
            />

            {/* Middle Wave Splash Finger 2 (Center-Right Bloom) */}
            <path
              d="M 116 128 
                 C 134 116, 160 110, 180 120 
                 C 186 124, 182 134, 172 136 
                 C 150 138, 132 144, 118 142 Z"
              fill="url(#waveSprayGrad)"
            />

            {/* Lower Cresting Wave Swell 3 (Curving inwards) */}
            <path
              d="M 106 140 
                 C 125 142, 152 148, 164 162 
                 C 168 166, 160 172, 152 170 
                 C 136 166, 120 156, 102 152 Z"
              fill="url(#waveSprayGrad)"
            />

            {/* Solid Fluid Blue Base Wave connecting Fish to Swell */}
            <path
              d="M 36 112 
                 C 52 122, 84 134, 116 128 
                 C 124 136, 118 152, 102 168 
                 C 74 162, 46 142, 36 112 Z"
              fill="url(#oceanDeepGrad)"
            />

            {/* 3. The Stylized Blue Fish (Facing Left) */}
            <path
              d="M 36 106 
                 C 32 108, 32 112, 36 114 
                 C 48 126, 72 132, 100 124 
                 C 120 118, 138 98, 164 88 
                 C 142 94, 122 106, 104 108 
                 C 78 110, 56 100, 36 106 Z"
              fill="url(#fishBodyGrad)"
            />

            {/* Fish Head & Belly Smooth Curve */}
            <path
              d="M 36 106 
                 C 32 102, 42 94, 58 94 
                 C 80 94, 106 102, 128 102 
                 C 106 108, 76 112, 54 116 
                 C 42 118, 34 112, 36 106 Z"
              fill="url(#fishBodyGrad)"
            />

            {/* Fish Eye (White Dot with crisp outline) */}
            <circle cx="48" cy="104" r="3.2" fill="#FFFFFF" />
            <circle cx="48" cy="104" r="1.2" fill="#0284C7" />

            {/* Fish Gill Arc */}
            <path
              d="M 64 97 C 68 104, 68 111, 63 116"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-start leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl">
              IMROP
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
              RH PRO
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Institut Mauritanien de Recherches Océanographiques et des Pêches
          </span>
        </div>
      )}
    </div>
  );
};
