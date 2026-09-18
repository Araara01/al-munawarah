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
        
        {/* 8-Pointed Rub el Hizb Emblem */}
        <svg viewBox="0 0 48 48" className="relative h-full w-full" aria-hidden="true">
          <g fill="none" stroke="hsl(var(--gold))" strokeWidth="1.4" strokeLinejoin="round">
            <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(0 24 24)" opacity="0.9"></rect>
            <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(45 24 24)" opacity="0.55"></rect>
          </g>
          <circle cx="24" cy="24" r="5.2" fill="hsl(var(--gold))" opacity="0.95"></circle>
          <circle cx="24" cy="24" r="9.4" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.7" opacity="0.5"></circle>
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
