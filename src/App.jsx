import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LandingPage from './components/LandingPage';
import QuranBrowser from './components/QuranBrowser';
import SavedAyat from './components/SavedAyat';
import AboutPage from './components/AboutPage';
import AdminStats from './components/AdminStats';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import QuoteExportModal from './components/QuoteExportModal';
import AmbientPlayer from './components/AmbientPlayer';
import DailyWisdomBanner from './components/DailyWisdomBanner';
import { ToastProvider, useToast } from './components/Toast';
import { askGuidanceAI } from './services/aiService';
import { saveLastRead, getLastRead } from './services/quranService';
import { 
  House, 
  MessageSquareQuote, 
  BookOpen, 
  BookmarkCheck, 
  Settings 
} from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();

  // Dark Theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('munawwarah_theme');
    return saved ? saved === 'dark' : true;
  });

  // Onboarding status
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('munawwarah_onboarded') === 'true';
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Active Tab / Route
  const [currentTab, setCurrentTab] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path === 'chat') return 'chat';
    if (path === 'quran') return 'quran';
    if (path === 'saved') return 'saved';
    if (path === 'settings') return 'settings';
    if (path === 'about') return 'about';
    if (path === 'admin') return 'admin';
    return 'landing';
  });

  // User Mode: 'muslim' or 'wawasan'
  const [currentMode, setCurrentMode] = useState(() => {
    return localStorage.getItem('munawwarah_mode') || 'muslim';
  });

  // Latin display toggle
  const [showLatin, setShowLatin] = useState(() => {
    const saved = localStorage.getItem('munawwarah_show_latin');
    return saved !== null ? saved === 'true' : true;
  });

  // AI settings
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('munawwarah_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('munawwarah_model');
    if (!saved || saved.startsWith('gemini')) return 'gemini-2.5-pro';
    if (saved.startsWith('gpt') || saved.startsWith('o1') || saved.startsWith('o3')) return 'gpt-4o';
    if (saved.startsWith('claude')) return 'claude-3-7-sonnet';
    if (saved.startsWith('qwen')) return 'qwen-max';
    return 'gemini-2.5-pro';
  });

  // Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportQuoteData, setExportQuoteData] = useState(null);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Saved Ayahs Bookmarks
  const [savedAyahs, setSavedAyahs] = useState(() => {
    try {
      const saved = localStorage.getItem('munawwarah_saved_ayahs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last Read State (Synchronized reading position across Jelajah Al-Qur'an & Ayat Tersimpan)
  const [lastRead, setLastRead] = useState(() => getLastRead());

  // Chat Conversations
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('munawwarah_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState(() => 'conv-init');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync theme with document class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('munawwarah_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('munawwarah_theme', 'light');
    }
  }, [isDark]);

  // Persist user mode
  useEffect(() => {
    localStorage.setItem('munawwarah_mode', currentMode);
  }, [currentMode]);

  // Persist Latin preference
  useEffect(() => {
    localStorage.setItem('munawwarah_show_latin', String(showLatin));
  }, [showLatin]);

  // Persist saved ayahs
  useEffect(() => {
    localStorage.setItem('munawwarah_saved_ayahs', JSON.stringify(savedAyahs));
  }, [savedAyahs]);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem('munawwarah_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Sync route with browser URL history
  const [quranTarget, setQuranTarget] = useState({ surahNumber: null, ayahNumber: null });

  const handleOpenSurah = (surahNum, ayahNum = 1) => {
    setQuranTarget({ surahNumber: surahNum, ayahNumber: ayahNum });
    navigateTo('quran');
  };

  const navigateTo = (tab) => {
    setCurrentTab(tab);
    const targetPath = tab === 'landing' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'chat') setCurrentTab('chat');
      else if (path === 'quran') setCurrentTab('quran');
      else if (path === 'saved') setCurrentTab('saved');
      else if (path === 'settings') setCurrentTab('settings');
      else if (path === 'about') setCurrentTab('about');
      else if (path === 'admin') setCurrentTab('admin');
      else setCurrentTab('landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load active conversation messages
  useEffect(() => {
    const found = conversations.find(c => c.id === activeConvId);
    if (found) {
      setMessages(found.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeConvId, conversations]);

  // New Chat
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    setActiveConvId(newId);
    setMessages([]);
    navigateTo('chat');
  };

  // Start Chat from Landing / CTA
  const handleStartChatFromLanding = () => {
    if (!isOnboarded) {
      setShowOnboarding(true);
    } else {
      navigateTo('chat');
    }
  };

  // Start Chat from Landing with a pre-filled prompt (Crisis Topics)
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const handleStartChatWithPrompt = (prompt) => {
    setPendingPrompt(prompt);
    if (!isOnboarded) {
      setShowOnboarding(true);
    } else {
      navigateTo('chat');
      // Slight delay to let the navigation settle before sending
      setTimeout(() => {
        handleSendMessage(prompt);
        setPendingPrompt(null);
      }, 200);
    }
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (chosenMode) => {
    setCurrentMode(chosenMode);
    setIsOnboarded(true);
    localStorage.setItem('munawwarah_onboarded', 'true');
    setShowOnboarding(false);
    showToast(`Mode ${chosenMode === 'muslim' ? 'Muslim' : 'Wawasan'} aktif`, "success");
    navigateTo('chat');
    // Fire pending crisis-topic prompt if any
    if (pendingPrompt) {
      setTimeout(() => {
        handleSendMessage(pendingPrompt);
        setPendingPrompt(null);
      }, 350);
    }
  };

  // Helper to extract normalized surah and ayah keys
  const getAyahKeys = (ay) => {
    if (!ay) return { surah: '', ayah: '' };
    return {
      surah: String(ay.surah_number || ay.surahNumber || ''),
      ayah: String(ay.ayah_number || ay.ayahNumber || '')
    };
  };

  // Update Last Read / Reading Checkpoint (Synchronizes Jelajah Al-Qur'an & Ayat Tersimpan)
  const handleUpdateLastRead = (readData, autoSaveToAyahs = false) => {
    if (!readData) return;
    const sNum = parseInt(readData.surahNumber, 10);
    const aNum = parseInt(readData.ayahNumber, 10) || 1;
    const saved = saveLastRead(
      sNum,
      readData.surahName,
      aNum,
      readData.surahArabic
    );
    if (saved) {
      setLastRead(saved);
      if (autoSaveToAyahs && readData.ayahDetails) {
        const target = {
          surah: String(sNum),
          ayah: String(aNum)
        };
        const exists = savedAyahs.some(a => {
          const k = getAyahKeys(a);
          return k.surah === target.surah && k.ayah === target.ayah;
        });
        if (!exists) {
          const standardizedAyah = {
            ...readData.ayahDetails,
            surah_number: sNum,
            ayah_number: aNum,
            surah_name: readData.surahName || `Surat ${sNum}`,
            arabic_text: readData.ayahDetails.arabic_text || readData.surahArabic,
            isLastRead: true,
            savedAt: Date.now()
          };
          setSavedAyahs(prev => [standardizedAyah, ...prev]);
        }
      }
    }
  };

  // Toggle Save / Bookmark Ayah
  const handleToggleSaveAyah = (ayah) => {
    if (!ayah) return;
    const target = getAyahKeys(ayah);
    if (!target.surah || !target.ayah) return;

    const exists = savedAyahs.some(a => {
      const k = getAyahKeys(a);
      return k.surah === target.surah && k.ayah === target.ayah;
    });

    if (exists) {
      setSavedAyahs(prev => prev.filter(a => {
        const k = getAyahKeys(a);
        return !(k.surah === target.surah && k.ayah === target.ayah);
      }));
      showToast("Ayat dihapus dari Ayat Tersimpan", "info");
    } else {
      const sNum = parseInt(target.surah, 10);
      const aNum = parseInt(target.ayah, 10);
      const sName = ayah.surah_name || ayah.surahName || `Surat ${target.surah}`;
      const standardizedAyah = {
        ...ayah,
        surah_number: sNum,
        ayah_number: aNum,
        surah_name: sName,
        savedAt: Date.now()
      };
      setSavedAyahs(prev => [standardizedAyah, ...prev]);

      // If user has no active reading position yet, automatically set this marked ayah as reading position
      if (!lastRead) {
        const autoRead = saveLastRead(sNum, sName, aNum, ayah.arabic_text || '');
        if (autoRead) setLastRead(autoRead);
      }

      showToast(`QS. ${standardizedAyah.surah_name}: ${target.ayah} ditandai & tersimpan`, "success");
    }
  };

  const handleRemoveAyah = (ayah) => {
    const target = getAyahKeys(ayah);
    setSavedAyahs(prev => prev.filter(a => {
      const k = getAyahKeys(a);
      return !(k.surah === target.surah && k.ayah === target.ayah);
    }));
  };

  // Send message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const convTitle = messages.length === 0 ? (text.length > 28 ? text.slice(0, 28) + '...' : text) : undefined;

    try {
      const responseData = await askGuidanceAI({
        messages: newMessages,
        mode: currentMode,
        apiKey: apiKey,
        model: selectedModel
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseData,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      // Update conversations
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === activeConvId);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = {
            ...clone[idx],
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
          return clone;
        } else {
          return [
            {
              id: activeConvId,
              title: convTitle || "Pertanyaan Baru",
              mode: currentMode,
              messages: updatedMessages,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            ...prev
          ];
        }
      });

    } catch (err) {
      console.error("AI send error:", err);
      showToast("Terjadi kendala saat memproses jawaban", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Hapus seluruh riwayat percakapan?")) {
      setConversations([]);
      setMessages([]);
      localStorage.removeItem('munawwarah_conversations');
      showToast("Riwayat percakapan dibersihkan", "info");
    }
  };

  // Page titles
  const TAB_TITLES = {
    chat: "Tanya AI",
    quran: "Jelajahi Al-Qur'an",
    saved: "Ayat Tersimpan",
    settings: "Pengaturan",
    about: "Tentang Al Munawwarah",
    admin: "Admin & Statistik"
  };

  // If on Landing Page, render Landing Page full view
  if (currentTab === 'landing') {
    return (
      <>
        <LandingPage
          onStartChat={handleStartChatFromLanding}
          onStartChatWithPrompt={handleStartChatWithPrompt}
          onOpenQuran={() => navigateTo('quran')}
          onOpenSaved={() => navigateTo('saved')}
          onOpenAbout={() => navigateTo('about')}
          onOpenSettings={() => navigateTo('settings')}
          onOpenAdmin={() => navigateTo('admin')}
          isDark={isDark}
          toggleDark={() => setIsDark(!isDark)}
        />
        <OnboardingModal
          isOpen={showOnboarding}
          currentMode={currentMode}
          onComplete={handleCompleteOnboarding}
        />
      </>
    );
  }

  // Otherwise, render full App Layout with Sidebar & Header
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-gold/30 selection:text-gold-bright">
      
      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={navigateTo}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={(id) => {
          setActiveConvId(id);
          navigateTo('chat');
        }}
        onClearHistory={handleClearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentMode={currentMode}
        onOpenQuran={() => navigateTo('quran')}
        onOpenSaved={() => navigateTo('saved')}
        onOpenSettings={() => navigateTo('settings')}
        onOpenAdmin={() => navigateTo('admin')}
        onGoHome={() => navigateTo('landing')}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        
        {/* Sticky Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          currentMode={currentMode}
          onToggleMode={() => {
            const next = currentMode === 'muslim' ? 'wawasan' : 'muslim';
            setCurrentMode(next);
            showToast(`Mode diganti ke ${next === 'muslim' ? 'Muslim' : 'Wawasan'}`, "info");
          }}
          isDark={isDark}
          toggleDark={() => setIsDark(!isDark)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleAmbient={() => setIsAmbientOpen(prev => !prev)}
          isAmbientPlaying={isAmbientPlaying}
          title={TAB_TITLES[currentTab] || "Al Munawwarah"}
        />

        {/* View Switcher */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {currentTab === 'chat' && (
            <>
              {/* Daily Wisdom Banner – shown on chat tab above messages */}
              <DailyWisdomBanner onExportQuote={(q) => setExportQuoteData(q)} />
              <ChatArea
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                currentMode={currentMode}
                onOpenSurah={handleOpenSurah}
                onExportQuote={(q) => setExportQuoteData(q)}
                savedAyahs={savedAyahs}
                onToggleSaveAyah={handleToggleSaveAyah}
              />
            </>
          )}

          {currentTab === 'quran' && (
            <QuranBrowser
              targetSurahNumber={quranTarget.surahNumber}
              targetAyahNumber={quranTarget.ayahNumber}
              onClearTarget={() => setQuranTarget({ surahNumber: null, ayahNumber: null })}
              savedAyahs={savedAyahs}
              onToggleSaveAyah={handleToggleSaveAyah}
              lastRead={lastRead}
              onUpdateLastRead={handleUpdateLastRead}
              onExportQuote={(q) => setExportQuoteData(q)}
              onGoToSaved={() => navigateTo('saved')}
              defaultShowLatin={showLatin}
              currentMode={currentMode}
            />
          )}

          {currentTab === 'saved' && (
            <SavedAyat
              savedAyahs={savedAyahs}
              lastRead={lastRead}
              onSetLastRead={(ayah) => {
                const sNum = parseInt(ayah.surah_number || ayah.surahNumber, 10);
                const aNum = parseInt(ayah.ayah_number || ayah.ayahNumber, 10) || 1;
                const sName = ayah.surah_name || ayah.surahName || `Surat ${sNum}`;
                const sArabic = ayah.arabic_text || '';
                handleUpdateLastRead({
                  surahNumber: sNum,
                  surahName: sName,
                  ayahNumber: aNum,
                  surahArabic: sArabic
                });
                showToast(`QS. ${sName} : ${aNum} dijadikan posisi tilawah aktif`, "success");
              }}
              onRemoveAyah={handleRemoveAyah}
              onOpenSurah={handleOpenSurah}
              onExportQuote={(q) => setExportQuoteData(q)}
              onGoToQuran={() => navigateTo('quran')}
            />
          )}

          {currentTab === 'settings' && (
            <div className="max-w-2xl mx-auto py-4">
              <SettingsModal
                isOpen={true}
                onClose={() => navigateTo('chat')}
                apiKey={apiKey}
                setApiKey={setApiKey}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                currentMode={currentMode}
                setCurrentMode={setCurrentMode}
                showLatin={showLatin}
                setShowLatin={setShowLatin}
                isDark={isDark}
                toggleDark={() => setIsDark(!isDark)}
              />
            </div>
          )}

          {currentTab === 'about' && (
            <AboutPage />
          )}

          {currentTab === 'admin' && (
            <AdminStats
              conversationsCount={conversations.length}
              savedCount={savedAyahs.length}
              lastRead={lastRead}
              apiKey={apiKey}
            />
          )}
        </main>

      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <nav 
        className="glass fixed bottom-0 left-0 right-0 z-40 flex border-t border-border/60 pb-[env(safe-area-inset-bottom)] lg:hidden"
        data-testid="mobile-bottom-nav"
      >
        <button
          onClick={() => navigateTo('landing')}
          data-testid="mnav-home"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            currentTab === 'landing' ? 'text-gold font-semibold' : 'text-muted-foreground'
          }`}
        >
          <House className="h-5 w-5" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => navigateTo('chat')}
          data-testid="mnav-chat"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            currentTab === 'chat' ? 'text-gold font-semibold' : 'text-muted-foreground'
          }`}
        >
          <MessageSquareQuote className="h-5 w-5" />
          <span>Tanya AI</span>
        </button>

        <button
          onClick={() => navigateTo('quran')}
          data-testid="mnav-quran"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            currentTab === 'quran' ? 'text-gold font-semibold' : 'text-muted-foreground'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span>Al-Qur'an</span>
        </button>

        <button
          onClick={() => navigateTo('saved')}
          data-testid="mnav-saved"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            currentTab === 'saved' ? 'text-gold font-semibold' : 'text-muted-foreground'
          }`}
        >
          <BookmarkCheck className="h-5 w-5" />
          <span>Tersimpan</span>
        </button>

        <button
          onClick={() => navigateTo('settings')}
          data-testid="mnav-settings"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            currentTab === 'settings' ? 'text-gold font-semibold' : 'text-muted-foreground'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* Settings Modal (when opened from Header button) */}
      {isSettingsOpen && currentTab !== 'settings' && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          showLatin={showLatin}
          setShowLatin={setShowLatin}
          isDark={isDark}
          toggleDark={() => setIsDark(!isDark)}
        />
      )}

      {/* Quote Export Modal */}
      <QuoteExportModal
        isOpen={!!exportQuoteData}
        onClose={() => setExportQuoteData(null)}
        quoteData={exportQuoteData}
      />

      {/* Ambient Sound Player Widget */}
      <AmbientPlayer
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
        onStateChange={(playing) => setIsAmbientPlaying(playing)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
