import React from 'react';

export default function Logo({ size = "md", showSubtitle = false, className = "" }) {
  const iconSizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12"
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-2xl sm:text-3xl"
  };

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} data-testid="app-logo">
      <span className={`relative inline-flex items-center justify-center ${iconSizeClasses[size] || iconSizeClasses.md}`}>
        {/* Animated Golden Halo */}
        <span 
          className="absolute inset-0 rounded-full animate-halo" 
          style={{ background: "radial-gradient(circle, var(--gold-glow), transparent 68%)" }}
        />
        
        {/* Islamic Crescent & Star Emblem (Bulan Bintang khas Lambang Islam) */}
        <svg viewBox="0 0 48 48" className="relative h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="islamicGoldLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--gold-bright, 44 88% 76%))" />
              <stop offset="48%" stopColor="hsl(var(--gold, 40 75% 68%))" />
              <stop offset="100%" stopColor="hsl(var(--gold-deep, 38 60% 52%))" />
            </linearGradient>
            <radialGradient id="islamicGoldGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--gold-bright, 44 88% 76%))" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(var(--gold, 40 75% 68%))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Celestial Astrolabe / Orbit Rings */}
          <circle
            cx="24"
            cy="24"
            r="22.5"
            fill="none"
            stroke="hsl(var(--gold))"
            strokeWidth="0.8"
            opacity="0.38"
          />
          <circle
            cx="24"
            cy="24"
            r="19.8"
            fill="none"
            stroke="hsl(var(--gold))"
            strokeWidth="0.5"
            strokeDasharray="1.5 2.5"
            opacity="0.28"
          />

          {/* Hilal & Star (Ascending celestial angle -18°) */}
          <g transform="translate(1.2, 2.2) rotate(-18 24 24)">
            {/* Soft Star Aura */}
            <circle cx="32" cy="24" r="6" fill="url(#islamicGoldGlowGrad)" />

            {/* Crescent Moon (Hilal) */}
            <path
              d="M 33.64 13.77 A 15.5 15.5 0 1 0 33.64 34.23 A 12.2 12.2 0 1 1 33.64 13.77 Z"
              fill="url(#islamicGoldLogoGrad)"
              stroke="hsl(var(--gold-bright))"
              strokeWidth="0.4"
            />

            {/* 5-Pointed Star (Bintang 5 Sudut khas Islam) */}
            <polygon
              points="26.80,24.00 30.30,22.77 30.39,19.05 32.65,22.00 36.21,20.94 34.10,24.00 36.71,27.06 32.65,26.00 30.39,28.95 30.30,25.23"
              fill="url(#islamicGoldLogoGrad)"
              stroke="hsl(var(--gold-bright))"
              strokeWidth="0.3"
            />

            {/* Center Core Sparkle (Cahaya) */}
            <circle cx="32" cy="24" r="0.85" fill="#ffffff" opacity="0.95" />
          </g>
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span className={`font-display font-semibold tracking-[0.16em] ${textClasses[size] || textClasses.md} gold-text`}>
          AL MUNAWWARAH
        </span>
        {showSubtitle && (
          <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Cahaya Al-Qur'an
          </span>
        )}
      </span>
    </span>
  );
}
