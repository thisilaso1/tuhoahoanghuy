import React from 'react';

interface MoonPhaseProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const MoonPhase: React.FC<MoonPhaseProps> = ({ size = 64, className = '', glow = true }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow Halo */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100/20 via-yellow-200/10 to-transparent blur-md"
          style={{ transform: 'scale(1.35)' }}
        />
      )}

      {/* Moon Disc */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <circle cx="50" cy="50" r="46" fill="url(#moonGradient)" stroke="#E9DDC6" strokeWidth="1" strokeOpacity="0.3" />
        {/* Subtle Crater Texture */}
        <ellipse cx="36" cy="38" rx="8" ry="6" fill="#D6C6A8" fillOpacity="0.25" />
        <ellipse cx="64" cy="58" rx="11" ry="8" fill="#D6C6A8" fillOpacity="0.2" />
        <ellipse cx="44" cy="68" rx="7" ry="5" fill="#D6C6A8" fillOpacity="0.18" />
        <ellipse cx="68" cy="34" rx="6" ry="4" fill="#D6C6A8" fillOpacity="0.22" />

        {/* Crescent Shading / Ambient Terminator */}
        <path
          d="M50 4C75.4051 4 96 24.5949 96 50C96 75.4051 75.4051 96 50 96C62 80 66 65 66 50C66 35 62 20 50 4Z"
          fill="#101A29"
          fillOpacity="0.35"
        />

        <defs>
          <radialGradient
            id="moonGradient"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(38 32) rotate(48.8141) scale(62)"
          >
            <stop stopColor="#FFFDF7" />
            <stop offset="0.55" stopColor="#F5EEDB" />
            <stop offset="1" stopColor="#DFCEAA" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
