import React, { useState } from 'react';
import Logo from './Logo';
import {
  Plus,
  MessageSquareQuote,
  BookOpen,
  BookmarkCheck,
  Settings,
  LayoutDashboard,
  Search,
  Trash2,
  X,
  MessageSquare
} from 'lucide-react';

function NavItem({ icon: Icon, label, active, onClick, testId, iconColor = 'text-muted-foreground' }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left transition-all cursor-pointer rounded-r-2xl ${
        active
          ? 'border-l-2 border-gold bg-secondary/80 text-foreground'
          : 'border-l-2 border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-gold/30'
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${
        active ? 'text-gold' : iconColor !== 'text-muted-foreground' ? iconColor : ''
      }`} />
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  onNewChat,
  conversations,
  activeConversationId,
  onSelectConversation,
  onClearHistory,
  isOpen,
  onClose,
  currentMode,
  onOpenQuran,
  onOpenSaved,
  onOpenSettings,
  onOpenAdmin,
  onGoHome
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c =>
    !searchQuery.trim() ||
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 z-50 h-screen flex flex-col
        bg-background/85 backdrop-blur-2xl
        border-r border-border/50
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ width: 261 }}>

        {/* Right edge gradient accent */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none" />

        {/* ── Logo area ─────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <button
            onClick={() => { onGoHome?.(); onClose?.(); }}
            className="text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Logo size="sm" showSubtitle={false} />
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Geometric star divider */}
        <div className="flex items-center gap-2 px-5 mb-4">
          <div className="flex-1 hairline" />
          <svg viewBox="0 0 16 16" className="h-3 w-3 flex-shrink-0" style={{ color: 'hsl(var(--gold))' }}>
            <polygon points="8,1 9.5,5.5 14,5.5 10.5,8.5 12,13 8,10 4,13 5.5,8.5 2,5.5 6.5,5.5" fill="currentColor" opacity="0.6" />
          </svg>
          <div className="flex-1 hairline" />
        </div>

        {/* ── New Chat button ────────────────────────────────── */}
        <div className="px-4 mb-4">
          <button
            onClick={() => { onNewChat(); onClose?.(); }}
            data-testid="new-chat-btn"
            className="w-full flex items-center justify-center gap-2 h-9 rounded-full border border-gold/40 text-gold text-sm font-semibold hover:bg-gold/8 hover:border-gold/60 transition-all active:scale-95"
            style={{ background: 'hsl(var(--gold) / 0.05)' }}
          >
            <Plus className="h-4 w-4" />
            <span>Percakapan Baru</span>
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="space-y-0.5 pr-3 pl-2">
          <NavItem
            icon={MessageSquareQuote}
            label="Tanya AI"
            active={currentTab === 'chat'}
            testId="nav-chat"
            iconColor="text-gold"
            onClick={() => { setCurrentTab('chat'); onClose?.(); }}
          />
          <NavItem
            icon={BookOpen}
            label="Jelajahi Al-Qur'an"
            active={currentTab === 'quran'}
            testId="nav-quran"
            iconColor="text-emerald"
            onClick={() => { onOpenQuran?.(); onClose?.(); }}
          />
          <NavItem
            icon={BookmarkCheck}
            label="Ayat Tersimpan"
            active={currentTab === 'saved'}
            testId="nav-saved"
            iconColor="text-gold"
            onClick={() => { onOpenSaved?.(); onClose?.(); }}
          />
          <NavItem
            icon={Settings}
            label="Pengaturan"
            active={currentTab === 'settings'}
            testId="nav-settings"
            onClick={() => { onOpenSettings?.(); onClose?.(); }}
          />
          <NavItem
            icon={LayoutDashboard}
            label="Admin & Statistik"
            active={currentTab === 'admin'}
            testId="nav-admin"
            iconColor="text-emerald"
            onClick={() => { onOpenAdmin?.(); onClose?.(); }}
          />
        </nav>

        {/* ── Hairline ──────────────────────────────────────── */}
        <div className="hairline mx-4 my-4" />

        {/* ── History ───────────────────────────────────────── */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Riwayat
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">{conversations.length}</span>
              {conversations.length > 0 && (
                <button
                  onClick={onClearHistory}
                  title="Hapus riwayat"
                  className="text-muted-foreground hover:text-destructive p-0.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari riwayat..."
              data-testid="history-search-input"
              className="w-full h-8 pl-8 pr-3 rounded-full bg-secondary/60 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </div>

        {/* ── History List ──────────────────────────────────── */}
        <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4" data-testid="history-list">
          {filteredConversations.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              {conversations.length === 0 ? 'Belum ada percakapan.' : 'Tidak ditemukan riwayat yang cocok.'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => { onSelectConversation(conv.id); onClose?.(); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 truncate transition-colors cursor-pointer ${
                    activeConversationId === conv.id
                      ? 'bg-secondary text-gold font-semibold'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-gold/60" />
                  <span className="truncate">{conv.title || 'Percakapan Baru'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom User Pill ──────────────────────────────── */}
        <div className="border-t border-border/50 px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Breathing golden ring avatar */}
            <span className="relative breathing flex h-8 w-8 items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 48 48" className="absolute h-full w-full" aria-hidden="true">
                <g fill="none" stroke="hsl(var(--gold))" strokeWidth="1.2" strokeLinejoin="round">
                  <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(0 24 24)" opacity="0.85" />
                  <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(45 24 24)" opacity="0.45" />
                </g>
                <circle cx="24" cy="24" r="5" fill="hsl(var(--gold))" opacity="0.9" />
                <circle cx="24" cy="24" r="9" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.6" opacity="0.4" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Mode Tamu</p>
              <p className="text-[11px] text-muted-foreground">
                {currentMode === 'muslim' ? 'Mode Muslim' : 'Mode Wawasan'}
              </p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
