import React from 'react';
import { Menu, Moon, Sun, Settings, Music2 } from 'lucide-react';

export default function Header({
  onOpenSidebar,
  currentMode,
  onToggleMode,
  isDark,
  toggleDark,
  onOpenSettings,
  onToggleAmbient,
  isAmbientPlaying = false,
  title = "Tanya AI"
}) {
  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border/60 px-3 sm:px-5">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onOpenSidebar}
        className="rounded-xl p-2 text-muted-foreground hover:text-foreground lg:hidden transition-colors"
        data-testid="open-sidebar-btn"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page Title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-base font-semibold sm:text-lg text-foreground">
          {title}
        </h1>
      </div>

      {/* User Mode Toggle Pill (Muslim vs Wawasan/Non-Muslim) */}
      <button
        onClick={onToggleMode}
        data-testid="user-mode-toggle"
        title="Klik untuk mengganti mode penyampaian"
        className="hidden rounded-full border border-gold/35 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold/20 active:scale-95 sm:flex items-center gap-1.5 shadow-xs"
      >
        <span>{currentMode === 'muslim' ? "🕌 Mode Muslim" : "🌍 Mode Wawasan"}</span>
      </button>

      {/* Mobile mode switch button */}
      <button
        onClick={onToggleMode}
        title="Ganti Mode"
        className="sm:hidden rounded-xl p-2 text-gold hover:bg-gold/10 text-xs font-semibold"
      >
        {currentMode === 'muslim' ? "🕌" : "🌍"}
      </button>

      {/* Theme Toggle Button (Day & Night) */}
      <button
        onClick={toggleDark}
        className="rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        data-testid="theme-toggle-btn"
        aria-label="Ganti tema"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-gold animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="h-5 w-5 text-emerald-800 animate-in spin-in-180 duration-300" />
        )}
      </button>

      {/* Ambient Sound Toggle */}
      {onToggleAmbient && (
        <button
          onClick={onToggleAmbient}
          className={`rounded-xl p-2 transition-colors active:scale-95 ${
            isAmbientPlaying
              ? 'text-gold bg-gold/10 animate-pulse'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={isAmbientPlaying ? "Hentikan Suara Ambient" : "Putar Suara Penenang Jiwa"}
          aria-label="Toggle ambient sound"
        >
          <Music2 className="h-5 w-5" />
        </button>
      )}

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        className="rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        title="Pengaturan AI & Model"
      >
        <Settings className="h-5 w-5" />
      </button>
    </header>
  );
}
