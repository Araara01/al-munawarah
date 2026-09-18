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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside className={`
        fixed lg:sticky top-0 z-50 h-screen w-[286px] shrink-0 
        border-r border-border/60 bg-background/95 lg:bg-background/60 backdrop-blur-xl
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Logo & Close for Mobile */}
        <div className="px-4 pt-5 flex items-center justify-between">
          <button 
            onClick={() => {
              if (onGoHome) onGoHome();
              if (onClose) onClose();
            }}
            className="text-left hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Logo size="sm" showSubtitle={false} />
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat CTA Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (onClose) onClose();
            }}
            data-testid="new-chat-btn"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm shadow hover:bg-primary/90 h-9 px-4 py-2 w-full rounded-full bg-primary font-semibold text-primary-foreground transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Percakapan Baru</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1 px-3">
          <button
            onClick={() => {
              setCurrentTab('chat');
              if (onClose) onClose();
            }}
            data-testid="nav-chat"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
              currentTab === 'chat' 
                ? 'bg-secondary text-foreground' 
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <MessageSquareQuote className="h-4 w-4 text-gold" />
            <span>Tanya AI</span>
          </button>

          <button
            onClick={() => {
              if (onOpenQuran) onOpenQuran();
              if (onClose) onClose();
            }}
            data-testid="nav-quran"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
              currentTab === 'quran'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4 text-emerald" />
            <span>Jelajahi Al-Qur'an</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSaved) onOpenSaved();
              if (onClose) onClose();
            }}
            data-testid="nav-saved"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
              currentTab === 'saved'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <BookmarkCheck className="h-4 w-4 text-gold" />
            <span>Ayat Tersimpan</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              if (onClose) onClose();
            }}
            data-testid="nav-settings"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAdmin) onOpenAdmin();
              if (onClose) onClose();
            }}
            data-testid="nav-admin"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-emerald" />
            <span>Admin & Statistik</span>
          </button>
        </nav>

        <div className="hairline mx-4 my-4" />

        {/* Conversation History Section with Search Input */}
        <div className="px-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Riwayat
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">
                {conversations.length}
              </span>
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

          <div className="relative mt-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari riwayat..."
              data-testid="history-search-input"
              className="flex w-full border border-border/80 px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold h-9 rounded-full bg-secondary/60 text-xs text-foreground"
            />
          </div>
        </div>

        {/* Scrollable History List */}
        <div className="mt-3 flex-1 overflow-y-auto px-3 pb-4" data-testid="history-list">
          {filteredConversations.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              {conversations.length === 0 ? "Belum ada percakapan." : "Tidak ditemukan riwayat yang cocok."}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 truncate transition-colors cursor-pointer ${
                    activeConversationId === conv.id
                      ? 'bg-secondary text-gold font-semibold'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                  <span className="truncate">{conv.title || "Percakapan Baru"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom User Pill */}
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex items-center justify-center h-8 w-8">
              <svg viewBox="0 0 48 48" className="relative h-full w-full" aria-hidden="true">
                <g fill="none" stroke="hsl(var(--gold))" strokeWidth="1.4" strokeLinejoin="round">
                  <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(0 24 24)" opacity="0.9"></rect>
                  <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(45 24 24)" opacity="0.55"></rect>
                </g>
                <circle cx="24" cy="24" r="5.2" fill="hsl(var(--gold))" opacity="0.95"></circle>
                <circle cx="24" cy="24" r="9.4" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.7" opacity="0.5"></circle>
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Mode Tamu</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {currentMode === 'muslim' ? "Mode Muslim" : "Mode Wawasan"}
              </p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
