import React from 'react';
import { Menu, Moon, Sun, Settings, Music2, Zap } from 'lucide-react';

export default function Header({
  onOpenSidebar,
  currentMode,
  onToggleMode,
  isDark,
  toggleDark,
  onOpenSettings,
  onToggleAmbient,
  isAmbientPlaying = false,
  title = 'Tanya AI'
}) {
  return (
    <header className="glass sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6" style={{ height: '55px' }}>

      {/* Left: Mobile menu + page title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
          data-testid="open-sidebar-btn"
          aria-label="Buka menu"
        >
          <Menu className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </button>

        {/* Geometric logo mark */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          <h1 className="font-cormorant text-lg font-semibold italic tracking-wide text-foreground truncate">
            {title}
          </h1>
        </div>

        {/* Mobile title */}
        <h1 className="lg:hidden font-cormorant text-base font-semibold italic text-foreground truncate">
          {title}
        </h1>
      </div>

      {/* Center: Mode pill (desktop only) */}
      <button
        onClick={onToggleMode}
        data-testid="user-mode-toggle"
        title="Klik untuk mengganti mode penyampaian"
        className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-gold border border-gold/30 bg-gold/8 hover:bg-gold/15 hover:border-gold/50 transition-all active:scale-95"
        style={{ background: 'hsl(var(--gold) / 0.08)' }}
      >
        <span className="text-[13px] leading-none">
          {currentMode === 'muslim' ? '🕌' : '🌍'}
        </span>
        <span className="tracking-wide">
          {currentMode === 'muslim' ? 'Mode Muslim' : 'Mode Wawasan'}
        </span>
      </button>

      {/* Mobile mode button */}
      <button
        onClick={onToggleMode}
        title="Ganti Mode"
        className="sm:hidden p-2 rounded-full text-gold hover:bg-gold/10 transition-colors text-sm font-semibold"
      >
        {currentMode === 'muslim' ? '🕌' : '🌍'}
      </button>

      {/* Right: Icon cluster */}
      <div className="flex items-center gap-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-colors active:scale-95"
          data-testid="theme-toggle-btn"
          aria-label="Ganti tema"
        >
          {isDark
            ? <Sun className="h-[18px] w-[18px] text-gold" style={{ animation: 'floatUp 0.3s ease' }} />
            : <Moon className="h-[18px] w-[18px] text-slate-500" />}
        </button>

        {/* Ambient sound */}
        {onToggleAmbient && (
          <button
            onClick={onToggleAmbient}
            className={`p-2 rounded-full transition-colors active:scale-95 ${
              isAmbientPlaying
                ? 'text-gold bg-gold/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5'
            }`}
            title={isAmbientPlaying ? 'Hentikan Suara Ambient' : 'Putar Suara Penenang Jiwa'}
            aria-label="Toggle ambient sound"
          >
            <Music2 className={`h-[18px] w-[18px] ${isAmbientPlaying ? 'animate-pulse' : ''}`} />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-colors active:scale-95"
          title="Pengaturan AI & Model"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </header>
  );
}
