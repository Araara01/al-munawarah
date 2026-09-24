import React, { useState, useEffect, useRef } from 'react';
import { SURAH_LIST, JUZ_LIST, THEMES, POPULAR_AYAHS, QARI_LIST } from '../data/quranData';
import { 
  getSurahDetail, 
  saveLastRead, 
  getLastRead, 
  getAyahAudioUrl, 
  getSurahFullAudioUrl,
  calculateQuranProgress,
  getSurahStatsMap,
  getJuzForAyah
} from '../services/quranService';
import { 
  Search, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Pin,
  Copy,
  Check,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Clock,
  Info,
  ArrowUp,
  Share2,
  TrendingUp,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useToast } from './Toast';

export default function QuranBrowser({
  targetSurahNumber = null,
  targetAyahNumber = null,
  onClearTarget,
  savedAyahs = [],
  onToggleSaveAyah,
  lastRead: externalLastRead = null,
  onUpdateLastRead = null,
  onExportQuote,
  onGoToSaved = null,
  defaultShowLatin = true,
  currentMode = 'muslim'
}) {
  const { showToast } = useToast();

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'reader'
  const [activeTab, setActiveTab] = useState('surat'); // 'surat' | 'juz' | 'bookmark' | 'tema'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Active Surah in Reader Mode
  const [currentSurahNum, setCurrentSurahNum] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [surahError, setSurahError] = useState(null);
  const [showSurahInfo, setShowSurahInfo] = useState(false);
  const [targetAyahToScroll, setTargetAyahToScroll] = useState(null);

  // Reader Customization Preferences
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('munawwarah_quran_font_size') || '28', 10);
  });
  const [showLatin, setShowLatin] = useState(defaultShowLatin);
  const [showTranslation, setShowTranslation] = useState(true);
  const [translationLang, setTranslationLang] = useState('id'); // 'id' | 'en'
  const [selectedQari, setSelectedQari] = useState('05'); // '05' is Misyari Rasyid
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [openTafsirMap, setOpenTafsirMap] = useState({});
  const [preferredTafsir, setPreferredTafsir] = useState(() => {
    return localStorage.getItem('munawwarah_preferred_tafsir') || 'ibnu_katsir';
  });
  const [activeTafsirTabMap, setActiveTafsirTabMap] = useState({});
  const [copiedAyah, setCopiedAyah] = useState(null);
  const [copiedTafsirAyah, setCopiedTafsirAyah] = useState(null);
  const [filterSavedOnlyInReader, setFilterSavedOnlyInReader] = useState(false);

  // Last Read State (Synchronized reading position across Jelajah Al-Qur'an & Ayat Tersimpan)
  const [internalLastRead, setInternalLastRead] = useState(() => getLastRead());
  const lastRead = externalLastRead !== undefined && externalLastRead !== null ? externalLastRead : internalLastRead;

  // Calculate live Quran reading progress & surah stats map based on marked ayahs
  const quranProgress = calculateQuranProgress(lastRead, savedAyahs);
  const surahStatsMap = getSurahStatsMap(savedAyahs, lastRead);

  // Audio Engine State
  // { isPlaying, type: 'ayah'|'surah', surahNumber, ayahNumber, qariId }
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    type: null,
    surahNumber: null,
    ayahNumber: null,
    qariId: '05'
  });
  const audioPlayerRef = useRef(null);

  // Save font size preference
  useEffect(() => {
    localStorage.setItem('munawwarah_quran_font_size', String(fontSize));
  }, [fontSize]);

  // Save preferred tafsir source
  useEffect(() => {
    localStorage.setItem('munawwarah_preferred_tafsir', preferredTafsir);
  }, [preferredTafsir]);

  // Handle external target navigation (e.g. from Chat or Saved Ayat)
  useEffect(() => {
    if (targetSurahNumber) {
      openSurah(targetSurahNumber, targetAyahNumber || 1);
      if (onClearTarget) onClearTarget();
    }
  }, [targetSurahNumber, targetAyahNumber]);

  // Stop audio when unmounting
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Filter Surahs
  const filteredSurahs = SURAH_LIST.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) ||
      s.translation.toLowerCase().includes(q) ||
      s.arabic.includes(q) ||
      String(s.number) === q;
  });

  // Filter Juz
  const filteredJuz = JUZ_LIST.filter(j => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return String(j.number) === q ||
      j.latin.toLowerCase().includes(q) ||
      j.start.surahName.toLowerCase().includes(q) ||
      j.end.surahName.toLowerCase().includes(q);
  });

  // Filter Saved Ayahs (Ayat Tersimpan)
  const filteredSavedAyahs = savedAyahs.filter(ay => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const surahName = (ay.surah_name || ay.surahName || '').toLowerCase();
    const translation = (ay.translation_id || '').toLowerCase();
    const arabic = (ay.arabic_text || '').toLowerCase();
    const latin = (ay.latin_text || '').toLowerCase();
    const ayahNum = String(ay.ayah_number || ay.ayahNumber || '');
    const surahNum = String(ay.surah_number || ay.surahNumber || '');
    return (
      surahName.includes(q) ||
      translation.includes(q) ||
      arabic.includes(q) ||
      latin.includes(q) ||
      ayahNum === q ||
      surahNum === q
    );
  });

  // Open Surah in Reader View
  const openSurah = async (surahNumber, ayahToScroll = null) => {
    const sNum = parseInt(surahNumber, 10);
    if (!sNum) return;

    // Reset states
    setCurrentSurahNum(sNum);
    setViewMode('reader');
    setIsLoadingSurah(true);
    setSurahError(null);
    setFilterSavedOnlyInReader(false);
    setTargetAyahToScroll(ayahToScroll);
    setOpenTafsirMap({});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await getSurahDetail(sNum);
      setSurahDetail(data);

      // Only initialize reading position if none exists yet — never overwrite user's marked progress!
      if (!lastRead) {
        const initialData = {
          surahNumber: sNum,
          surahName: data.name,
          ayahNumber: ayahToScroll || 1,
          surahArabic: data.arabic
        };
        if (onUpdateLastRead) {
          onUpdateLastRead(initialData, false);
        } else {
          const readData = saveLastRead(sNum, data.name, ayahToScroll || 1, data.arabic);
          if (readData) setInternalLastRead(readData);
        }
      }

    } catch (err) {
      console.error(err);
      setSurahError("Gagal mengambil data surat. Silakan periksa koneksi internet Anda.");
      showToast("Gagal memuat surat Al-Qur'an", "error");
    } finally {
      setIsLoadingSurah(false);
    }
  };

  // Helper to reliably scroll and highlight an ayah with retry
  const scrollToAyahWithHighlight = (ayahNum) => {
    if (!ayahNum) return;
    let attempts = 0;
    const maxAttempts = 15;
    const timer = setInterval(() => {
      attempts++;
      const el = document.getElementById(`ayah-${ayahNum}`);
      if (el) {
        clearInterval(timer);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-gold', 'bg-gold/15');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-gold', 'bg-gold/15');
        }, 3500);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 120);
  };

  // Scroll to target ayah once loaded
  useEffect(() => {
    if (!isLoadingSurah && surahDetail && targetAyahToScroll) {
      scrollToAyahWithHighlight(targetAyahToScroll);
    }
  }, [isLoadingSurah, surahDetail, targetAyahToScroll]);

  // Jump to Ayah inside Reader View
  const handleJumpToAyah = (ayahNum) => {
    scrollToAyahWithHighlight(ayahNum);
  };

  // Mark Specific Ayah as Last Read / Reading Checkpoint (Synchronizes with Ayat Tersimpan)
  const handleMarkLastRead = (ayah) => {
    if (!ayah && !surahDetail) return;
    const sNum = parseInt(ayah?.surah_number || ayah?.surahNumber || surahDetail?.number, 10);
    const aNum = parseInt(ayah?.ayah_number || ayah?.ayahNumber || (typeof ayah === 'number' ? ayah : 1), 10);
    const sName = ayah?.surah_name || ayah?.surahName || surahDetail?.name || `Surat ${sNum}`;
    const sArabic = ayah?.arabic_text || surahDetail?.arabic || '';
    const ayahObj = typeof ayah === 'object' ? ayah : surahDetail?.ayahs?.find(a => a.ayah_number === aNum);

    const readData = {
      surahNumber: sNum,
      surahName: sName,
      ayahNumber: aNum,
      surahArabic: sArabic,
      ayahDetails: ayahObj || {
        surah_number: sNum,
        ayah_number: aNum,
        surah_name: sName,
        arabic_text: sArabic,
        latin_text: ayahObj?.latin_text,
        translation_id: ayahObj?.translation_id
      }
    };

    if (onUpdateLastRead) {
      onUpdateLastRead(readData, true);
    } else {
      const updated = saveLastRead(sNum, sName, aNum, sArabic);
      if (updated) setInternalLastRead(updated);
    }
    showToast(`QS. ${sName} ayat ${aNum} ditandai sebagai posisi tilawah aktif`, "success");
  };

  // Audio Playback Engine
  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setAudioState({
      isPlaying: false,
      type: null,
      surahNumber: null,
      ayahNumber: null,
      qariId: selectedQari
    });
  };

  const playAyahAudio = (ayah, surahData = surahDetail) => {
    if (!ayah) return;
    const sNum = parseInt(surahData?.number || ayah.surah_number || ayah.surahNumber, 10);
    const aNum = parseInt(ayah.ayah_number || ayah.ayahNumber, 10);

    // Toggle pause if currently playing this exact ayah
    if (audioState.isPlaying && audioState.type === 'ayah' && audioState.surahNumber === sNum && audioState.ayahNumber === aNum) {
      stopAudio();
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audioUrl = getAyahAudioUrl(ayah, selectedQari);
    if (!audioUrl) {
      showToast("Audio untuk ayat ini belum tersedia", "error");
      return;
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;

    setAudioState({
      isPlaying: true,
      type: 'ayah',
      surahNumber: sNum,
      ayahNumber: aNum,
      qariId: selectedQari
    });

    audio.onended = () => {
      // Auto play next verse if enabled
      if (autoPlayNext && surahData?.ayahs) {
        const nextAyah = surahData.ayahs.find(a => a.ayah_number === aNum + 1);
        if (nextAyah) {
          playAyahAudio(nextAyah, surahData);
          // Highlight and scroll to next ayah
          const nextEl = document.getElementById(`ayah-${nextAyah.ayah_number}`);
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          return;
        }
      }
      stopAudio();
    };

    audio.onerror = () => {
      showToast("Gagal memutar audio ayat", "error");
      stopAudio();
    };

    audio.play().catch(e => {
      console.warn("Autoplay error:", e);
      stopAudio();
    });
  };

  const playFullSurahAudio = (surahData = surahDetail) => {
    if (!surahData) return;
    const sNum = surahData.number;

    // Toggle pause if currently playing this full surah
    if (audioState.isPlaying && audioState.type === 'surah' && audioState.surahNumber === sNum) {
      stopAudio();
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audioUrl = getSurahFullAudioUrl(surahData, selectedQari);
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;

    setAudioState({
      isPlaying: true,
      type: 'surah',
      surahNumber: sNum,
      ayahNumber: null,
      qariId: selectedQari
    });

    audio.onended = () => stopAudio();
    audio.onerror = () => {
      showToast("Audio surat lengkap belum dapat dimuat", "error");
      stopAudio();
    };

    audio.play().then(() => {
      showToast(`Memutar Tilawah QS. ${surahData.name || sNum}`, "info");
    }).catch(() => {
      stopAudio();
      showToast("Gagal memutar audio surat", "error");
    });
  };

  // Next / Prev Ayah Audio controls
  const handleNextAyahAudio = () => {
    if (!surahDetail || !audioState.ayahNumber) return;
    const nextAyah = surahDetail.ayahs.find(a => a.ayah_number === audioState.ayahNumber + 1);
    if (nextAyah) playAyahAudio(nextAyah);
  };

  const handlePrevAyahAudio = () => {
    if (!surahDetail || !audioState.ayahNumber || audioState.ayahNumber <= 1) return;
    const prevAyah = surahDetail.ayahs.find(a => a.ayah_number === audioState.ayahNumber - 1);
    if (prevAyah) playAyahAudio(prevAyah);
  };

  // Toggle Tafsir Accordion
  const toggleTafsir = (ayahNum) => {
    setOpenTafsirMap(prev => ({
      ...prev,
      [ayahNum]: !prev[ayahNum]
    }));
  };

  // Copy Ayah Text
  const handleCopyAyah = (ayah) => {
    const sName = surahDetail?.name || ayah.surah_name || ayah.surahName || `Surat ${ayah.surah_number || ayah.surahNumber}`;
    const aNum = ayah.ayah_number || ayah.ayahNumber;
    const textToCopy = `${ayah.arabic_text}\n\n${ayah.latin_text ? ayah.latin_text + '\n\n' : ''}"${ayah.translation_id || ''}"\n(QS. ${sName}: ${aNum})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(aNum);
    showToast(`Ayat ${aNum} berhasil disalin`, "success");
    setTimeout(() => setCopiedAyah(null), 2500);
  };

  // Copy Tafsir Text
  const handleCopyTafsir = (ayah, tafsirSource, tafsirText) => {
    if (!tafsirText) return;
    const textToCopy = `[Tafsir ${tafsirSource}]\nSurat ${surahDetail?.name || ayah.surah_name} Ayat ${ayah.ayah_number}\n\n${tafsirText}\n\nSumber: Al Munawwarah`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTafsirAyah(ayah.ayah_number);
    showToast(`Tafsir ${tafsirSource} Ayat ${ayah.ayah_number} disalin`, "success");
    setTimeout(() => setCopiedTafsirAyah(null), 2500);
  };

  // Bookmark check
  const isAyahBookmarked = (surahNum, ayahNum) => {
    const s = String(surahNum || '');
    const a = String(ayahNum || '');
    if (!s || !a) return false;
    return savedAyahs.some(item => 
      String(item.surah_number || item.surahNumber || '') === s && 
      String(item.ayah_number || item.ayahNumber || '') === a
    );
  };

  // Current Qari Info
  const currentQariObj = QARI_LIST.find(q => q.id === selectedQari) || QARI_LIST[0];

  return (
    <div className="relative mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-7 text-foreground pb-28">

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: READER MODE (APK AL-QUR'AN READING VIEW)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'reader' ? (
        <div className="space-y-6 animate-fade-up">

          {/* Sticky Reader App Bar */}
          <div className="sticky top-2 z-40 flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-background/90 p-2.5 shadow-md backdrop-blur-md">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setViewMode('list');
                stopAudio();
              }}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Daftar Surat</span>
            </button>

            {/* Surah Title in Header */}
            {surahDetail && (
              <div className="min-w-0 text-center flex-1 px-2">
                <h3 className="truncate font-display text-sm sm:text-base font-semibold text-foreground">
                  {surahDetail.name} <span className="arabic text-gold font-normal ml-1">({surahDetail.arabic})</span>
                </h3>
                <p className="text-[10px] text-muted-foreground truncate">
                  Surat ke-{surahDetail.number} · {surahDetail.numberOfAyahs} Ayat · {surahDetail.revelation}
                </p>
              </div>
            )}

            {/* Jump to Ayah & Settings Toolbar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Saved Ayahs in Surah Filter Button */}
              {(() => {
                const savedInThisSurah = surahDetail ? savedAyahs.filter(a =>
                  parseInt(a.surah_number || a.surahNumber, 10) === surahDetail.number
                ) : [];
                if (savedInThisSurah.length === 0) return null;
                return (
                  <button
                    onClick={() => setFilterSavedOnlyInReader(prev => !prev)}
                    className={`flex h-8 items-center gap-1 rounded-xl border px-2.5 text-[11px] font-semibold transition-all active:scale-95 ${
                      filterSavedOnlyInReader
                        ? 'border-gold bg-gold text-white shadow-xs'
                        : 'border-gold/40 bg-gold/10 text-gold hover:bg-gold/20'
                    }`}
                    title={filterSavedOnlyInReader ? "Tampilkan Semua Ayat" : "Saring Hanya Ayat Tersimpan di Surat Ini"}
                  >
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{savedInThisSurah.length} Tersimpan</span>
                    <span className="sm:hidden">{savedInThisSurah.length}</span>
                  </button>
                );
              })()}

              {surahDetail && surahDetail.ayahs && (
                <div className="relative">
                  <select
                    onChange={(e) => {
                      setFilterSavedOnlyInReader(false);
                      handleJumpToAyah(e.target.value);
                    }}
                    defaultValue=""
                    className="h-8 rounded-xl border border-border/80 bg-secondary/70 px-2 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="" disabled>Lompat Ayat</option>
                    {surahDetail.ayahs.map(a => (
                      <option key={a.ayah_number} value={a.ayah_number}>
                        Ayat {a.ayah_number} {isAyahBookmarked(surahDetail.number, a.ayah_number) ? '★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preferences / Settings Toggle Button */}
              <button
                onClick={() => setShowSettingsDrawer(prev => !prev)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  showSettingsDrawer
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
                title="Pengaturan Tampilan Al-Qur'an"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Reader Preferences Slide-Down Drawer */}
          {showSettingsDrawer && (
            <div className="rounded-3xl border border-gold/30 bg-card p-4 sm:p-5 shadow-xl space-y-4 animate-bloom">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-gold" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Pengaturan Bacaan Al-Qur'an
                  </h4>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                
                {/* Font Size Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Ukuran Teks Arab</span>
                    <span className="font-semibold text-gold">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">A-</span>
                    <input
                      type="range"
                      min="20"
                      max="44"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-foreground">A+</span>
                  </div>
                </div>

                {/* Qari Selector */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block">Qari Suara Tilawah</label>
                  <select
                    value={selectedQari}
                    onChange={(e) => {
                      setSelectedQari(e.target.value);
                      stopAudio();
                    }}
                    className="w-full rounded-xl border border-border/80 bg-secondary/60 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {QARI_LIST.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Tafsir Selector */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block">Pilihan Tafsir Utama</label>
                  <select
                    value={preferredTafsir}
                    onChange={(e) => setPreferredTafsir(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-secondary/60 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="ibnu_katsir">📖 Tafsir Ibnu Katsir (Lengkap)</option>
                    <option value="kemenag">🏛️ Tafsir Kemenag RI (Ringkas)</option>
                  </select>
                </div>

                {/* Toggles: Latin, Terjemahan, Auto Next */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Teks Latin (Transliterasi)</span>
                    <button
                      onClick={() => setShowLatin(!showLatin)}
                      className={`h-5 w-9 rounded-full transition-colors relative p-0.5 ${showLatin ? 'bg-gold' : 'bg-muted'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showLatin ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Terjemahan</span>
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`h-5 w-9 rounded-full transition-colors relative p-0.5 ${showTranslation ? 'bg-gold' : 'bg-muted'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lanjut Otomatis Ayat Berikutnya</span>
                    <button
                      onClick={() => setAutoPlayNext(!autoPlayNext)}
                      className={`h-5 w-9 rounded-full transition-colors relative p-0.5 ${autoPlayNext ? 'bg-gold' : 'bg-muted'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${autoPlayNext ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Translation Language Switcher */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <span className="text-muted-foreground text-[11px]">Bahasa Terjemahan:</span>
                <button
                  onClick={() => setTranslationLang('id')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    translationLang === 'id' ? 'bg-gold text-white shadow-xs' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  Bahasa Indonesia (Kemenag)
                </button>
                <button
                  onClick={() => setTranslationLang('en')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    translationLang === 'en' ? 'bg-gold text-white shadow-xs' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  English (Sahih Intl)
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingSurah && (
            <div className="noor-card flex flex-col items-center justify-center rounded-3xl py-24 space-y-4 text-center">
              <div className="relative">
                <span className="noor-bloom animate-halo" />
                <BookOpen className="h-12 w-12 text-gold animate-bounce" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Membuka Mushaf Surat...
              </h3>
              <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
                Memuat mushaf, transliterasi Latin, terjemahan, dan Tafsir Ibnu Katsir dari database lokal...
              </p>
            </div>
          )}

          {/* Error State */}
          {surahError && (
            <div className="noor-card rounded-3xl p-8 text-center space-y-4 border-red-500/30">
              <p className="text-sm text-red-500">{surahError}</p>
              <button
                onClick={() => openSurah(currentSurahNum)}
                className="px-5 py-2 rounded-xl bg-gold/15 text-gold text-xs font-semibold hover:bg-gold/25 transition-all"
              >
                Coba Muat Ulang
              </button>
            </div>
          )}

          {/* Surah Content */}
          {!isLoadingSurah && surahDetail && (
            <>
              {/* Surah Hero Header Card */}
              <div className="noor-card grain relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border-gold/40 shadow-lg">
                <span className="noor-bloom" />
                
                <div className="relative space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
                    <span>Surat ke-{surahDetail.number}</span>
                    <span>•</span>
                    <span>{surahDetail.revelation}</span>
                    <span>•</span>
                    <span>{surahDetail.numberOfAyahs} Ayat</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {surahDetail.name}
                  </h1>
                  
                  <p className="arabic text-3xl sm:text-4xl font-normal text-gold py-1">
                    {surahDetail.arabic}
                  </p>

                  <p className="text-sm font-medium text-muted-foreground">
                    Arti: &ldquo;{surahDetail.translation}&rdquo;
                  </p>

                  {/* Actions Header: Play Full Surah & Info toggle */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => playFullSurahAudio(surahDetail)}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                        audioState.isPlaying && audioState.type === 'surah' && audioState.surahNumber === surahDetail.number
                          ? 'bg-gold text-white animate-pulse'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {audioState.isPlaying && audioState.type === 'surah' && audioState.surahNumber === surahDetail.number ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>Jeda Tilawah Penuh</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Dengarkan Surat Penuh ({currentQariObj.label.split(' ')[0]})</span>
                        </>
                      )}
                    </button>

                    {surahDetail.description && (
                      <button
                        onClick={() => setShowSurahInfo(!showSurahInfo)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Info className="h-3.5 w-3.5 text-gold" />
                        <span>{showSurahInfo ? "Tutup Info" : "Latar Belakang Surat"}</span>
                      </button>
                    )}
                  </div>

                  {/* Collapsible Surah Info / Historical context */}
                  {showSurahInfo && surahDetail.description && (
                    <div className="mt-4 rounded-2xl bg-secondary/40 p-4 text-left text-xs sm:text-sm leading-relaxed text-muted-foreground border border-border/60 animate-fade-up">
                      <span className="font-semibold text-gold block mb-1 text-xs uppercase tracking-wider">
                        Tentang Surat {surahDetail.name}:
                      </span>
                      {surahDetail.description}
                    </div>
                  )}

                  {/* Surah Reading Progress bar & checkpoint */}
                  {(() => {
                    const markedInSurah = (lastRead && lastRead.surahNumber === surahDetail.number) 
                      ? lastRead.ayahNumber 
                      : null;
                    const savedInSurah = savedAyahs.filter(a => parseInt(a.surah_number || a.surahNumber, 10) === surahDetail.number);
                    const percent = markedInSurah 
                      ? Math.min(100, Math.round((markedInSurah / surahDetail.numberOfAyahs) * 100))
                      : (savedInSurah.length > 0 ? Math.min(100, Math.round((savedInSurah.length / surahDetail.numberOfAyahs) * 100)) : 0);

                    return (
                      <div className="mt-4 pt-3.5 border-t border-border/40 max-w-md mx-auto space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Pin className="h-3.5 w-3.5 text-gold" />
                            {markedInSurah ? (
                              <span className="text-foreground">Posisi Ditandai: <strong className="text-gold font-semibold">Ayat {markedInSurah}</strong></span>
                            ) : savedInSurah.length > 0 ? (
                              <span>{savedInSurah.length} ayat ditandai di surat ini</span>
                            ) : (
                              <span>Belum ada ayat ditandai di surat ini</span>
                            )}
                          </span>
                          <span className="text-gold font-bold">
                            {percent}% Selesai
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/80">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-gold to-emerald-500 transition-all duration-300"
                            style={{ width: `${Math.max(percent, markedInSurah ? 2 : 0)}%` }}
                          />
                        </div>
                        {markedInSurah && (
                          <div className="flex items-center justify-center pt-0.5">
                            <button
                              onClick={() => handleJumpToAyah(markedInSurah)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:underline transition-all"
                            >
                              <span>Lompat ke Posisi Tilawah (Ayat {markedInSurah})</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Interactive Jump to Saved Ayahs in this Surah */}
                        {savedInSurah.length > 0 && (
                          <div className="pt-2 border-t border-border/30 flex flex-wrap items-center justify-center gap-1.5">
                            <span className="text-[11px] font-semibold text-gold flex items-center gap-1 mr-1">
                              <BookmarkCheck className="h-3 w-3" />
                              Tersimpan ({savedInSurah.length}):
                            </span>
                            {savedInSurah.map((sa) => {
                              const aNum = parseInt(sa.ayah_number || sa.ayahNumber, 10);
                              return (
                                <button
                                  key={aNum}
                                  onClick={() => {
                                    setFilterSavedOnlyInReader(false);
                                    handleJumpToAyah(aNum);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-gold/40 bg-gold/10 text-[11px] font-bold text-gold hover:bg-gold hover:text-white transition-all active:scale-95"
                                  title={`Lompat ke Ayat ${aNum}`}
                                >
                                  Ayat {aNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setFilterSavedOnlyInReader(prev => !prev)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                                filterSavedOnlyInReader
                                  ? 'bg-gold text-white shadow-xs'
                                  : 'border border-border/80 bg-secondary/60 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {filterSavedOnlyInReader ? 'Tampilkan Semua Ayat' : 'Filter Tersimpan'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bismillah Header (Except Surah 9 At-Taubah) */}
              {surahDetail.number !== 9 && (
                <div className="my-6 text-center py-5 rounded-2xl bg-secondary/20 border border-gold/15">
                  <p className="arabic text-2xl sm:text-3xl text-gold font-normal tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
                  </p>
                </div>
              )}

              {/* Tafsir Ibnu Katsir Availability Banner */}
              {surahDetail.tafsirStats && surahDetail.tafsirStats.ibnuKatsirCount > 0 && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Tafsir Ibnu Katsir tersedia — {surahDetail.tafsirStats.ibnuKatsirCount}/{surahDetail.tafsirStats.totalAyahs} ayat
                    </p>
                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">
                      Dimuat dari database lokal · Kitab Tafsir Al-Qur&apos;an Al-Azhim · Al-Hafizh Ibnu Katsir (W. 774 H)
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Lokal
                  </span>
                </div>
              )}

              {/* Filter Active Alert Banner if filtering saved ayahs */}
              {filterSavedOnlyInReader && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-gold/10 p-3.5 text-xs text-gold shadow-xs animate-fade-up">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="h-4 w-4 shrink-0 text-gold" />
                    <span>
                      Menampilkan <strong className="font-bold text-foreground">{surahDetail.ayahs.filter(a => isAyahBookmarked(surahDetail.number, a.ayah_number)).length}</strong> ayat tersimpan di Surat {surahDetail.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setFilterSavedOnlyInReader(false)}
                    className="px-3 py-1 rounded-xl bg-gold text-white text-[11px] font-bold hover:bg-gold/90 transition-all shrink-0 shadow-xs"
                  >
                    Tampilkan Semua Ayat
                  </button>
                </div>
              )}

              {/* Ayahs Stream */}
              <div className="space-y-4">
                {filterSavedOnlyInReader && surahDetail.ayahs.filter(a => isAyahBookmarked(surahDetail.number, a.ayah_number)).length === 0 && (
                  <div className="noor-card rounded-3xl p-10 text-center space-y-3">
                    <Bookmark className="h-10 w-10 text-gold/50 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">Belum ada ayat yang ditandai di surat ini</p>
                    <p className="text-xs text-muted-foreground">Tekan ikon bookmark pada ayat untuk menyimpannya.</p>
                    <button
                      onClick={() => setFilterSavedOnlyInReader(false)}
                      className="px-4 py-2 rounded-xl bg-gold text-white text-xs font-semibold hover:bg-gold/90 transition-all"
                    >
                      Tampilkan Semua Ayat
                    </button>
                  </div>
                )}
                {(filterSavedOnlyInReader
                  ? surahDetail.ayahs.filter(a => isAyahBookmarked(surahDetail.number, a.ayah_number))
                  : surahDetail.ayahs
                ).map((ayah) => {
                  const isCurrentPlayingAyah = audioState.isPlaying && 
                    audioState.type === 'ayah' && 
                    audioState.surahNumber === surahDetail.number && 
                    audioState.ayahNumber === ayah.ayah_number;
                  
                  const isThisLastRead = lastRead && 
                    lastRead.surahNumber === surahDetail.number && 
                    lastRead.ayahNumber === ayah.ayah_number;

                  const isSaved = isAyahBookmarked(surahDetail.number, ayah.ayah_number);
                  const isTafsirOpen = !!openTafsirMap[ayah.ayah_number];

                  return (
                    <article
                      key={ayah.ayah_number}
                      id={`ayah-${ayah.ayah_number}`}
                      className={`noor-card transition-all rounded-3xl p-5 sm:p-7 space-y-4 ${
                        isCurrentPlayingAyah 
                          ? 'border-gold shadow-[0_0_25px_-5px_var(--gold-glow)] bg-gold/[0.04]' 
                          : 'border-border/60 hover:border-border'
                      }`}
                    >
                      {/* Top Verse Toolbar */}
                      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                        
                        {/* Ayah Badge */}
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-xs font-bold text-gold">
                            {ayah.ayah_number}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            QS. {surahDetail.name} : {ayah.ayah_number}
                          </span>
                          {isThisLastRead && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-gold animate-pulse">
                              <Pin className="h-3 w-3 fill-current" />
                              Posisi Tilawah Aktif
                            </span>
                          )}
                          {isSaved && !isThisLastRead && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                              <BookmarkCheck className="h-3 w-3" />
                              Tersimpan
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          
                          {/* Play Verse Audio Button */}
                          <button
                            onClick={() => playAyahAudio(ayah)}
                            className={`flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-all ${
                              isCurrentPlayingAyah
                                ? 'bg-gold text-white font-semibold shadow-xs'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                            title={isCurrentPlayingAyah ? "Jeda Tilawah" : "Putar Tilawah Ayat"}
                          >
                            {isCurrentPlayingAyah ? (
                              <>
                                <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                                <span className="hidden sm:inline">Berhenti</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Dengarkan</span>
                              </>
                            )}
                          </button>

                          {/* Mark as Last Read / Reading Checkpoint */}
                          <button
                            onClick={() => handleMarkLastRead(ayah)}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                              isThisLastRead
                                ? 'text-gold bg-gold/20 ring-1 ring-gold/40'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                            title="Tandai sebagai Posisi Tilawah Terakhir"
                          >
                            <Pin className={`h-3.5 w-3.5 ${isThisLastRead ? 'fill-current' : ''}`} />
                          </button>

                          {/* Bookmark Verse */}
                          <button
                            onClick={() => {
                              if (onToggleSaveAyah) {
                                onToggleSaveAyah({
                                  surah_number: surahDetail.number,
                                  surah_name: surahDetail.name,
                                  ayah_number: ayah.ayah_number,
                                  arabic_text: ayah.arabic_text,
                                  latin_text: ayah.latin_text,
                                  translation_id: ayah.translation_id,
                                  translation_en: ayah.translation_en,
                                  audio_url: ayah.audio_url,
                                  revelation: surahDetail.revelation,
                                  tafsir: ayah.tafsir
                                });
                              }
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                              isSaved
                                ? 'text-gold bg-gold/10'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                            title={isSaved ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Bookmark className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Tafsir Button */}
                          <button
                            onClick={() => toggleTafsir(ayah.ayah_number)}
                            className={`flex h-8 items-center gap-1 rounded-xl px-2 text-xs transition-all ${
                              isTafsirOpen
                                ? 'border border-gold/40 bg-gold/10 text-gold font-semibold'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                            title="Tafsir Ibnu Katsir & Kemenag"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Tafsir</span>
                          </button>

                          {/* Copy Verse */}
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                            title="Salin Teks Ayat"
                          >
                            {copiedAyah === ayah.ayah_number ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Export / Share Quote */}
                          {onExportQuote && (
                            <button
                              onClick={() => {
                                onExportQuote({
                                  arabic: ayah.arabic_text,
                                  latin: ayah.latin_text,
                                  translation: ayah.translation_id,
                                  reference: `QS. ${surahDetail.name}: ${ayah.ayah_number}`
                                });
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-gold transition-all"
                              title="Bagikan / Buat Gambar Kutipan"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                        </div>
                      </header>

                      {/* Arabic Text */}
                      <p 
                        className="arabic text-right leading-[2.4] font-normal text-foreground select-text py-2"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.arabic_text}
                        <span className="inline-block px-2 text-gold font-normal text-xl select-none">
                          ۝
                        </span>
                      </p>

                      {/* Latin Transliteration */}
                      {showLatin && ayah.latin_text && (
                        <p className="text-xs sm:text-sm italic text-muted-foreground/85 leading-relaxed font-sans">
                          {ayah.latin_text}
                        </p>
                      )}

                      {/* Translation */}
                      {showTranslation && (
                        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-sans pt-1 border-t border-border/30">
                          {translationLang === 'en' 
                            ? (ayah.translation_en || ayah.translation_id) 
                            : ayah.translation_id}
                        </p>
                      )}

                      {/* Tafsir Accordion (Ibnu Katsir & Kemenag RI) */}
                      {isTafsirOpen && (() => {
                        const currentTafsirTab = activeTafsirTabMap[ayah.ayah_number] || preferredTafsir;
                        const isIbnuKatsir = currentTafsirTab === 'ibnu_katsir';
                        const ibnuKatsirText = ayah.tafsir_ibnu_katsir || '';
                        const kemenagText = ayah.tafsir_kemenag || '';
                        const hasIbnuKatsir = ibnuKatsirText.length > 0;
                        const hasKemenag = kemenagText.length > 0;
                        const currentTafsirText = isIbnuKatsir 
                          ? (ibnuKatsirText || ayah.tafsir || '')
                          : (kemenagText || ayah.tafsir || '');

                        return (
                          <div className="mt-3 rounded-2xl bg-secondary/60 p-4 sm:p-5 border border-gold/30 space-y-3 animate-fade-up shadow-sm">
                            {/* Tafsir Header with Tabs & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                              {/* Source Switcher Tabs */}
                              <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-xl border border-border/60">
                                <button
                                  type="button"
                                  onClick={() => setActiveTafsirTabMap(prev => ({ ...prev, [ayah.ayah_number]: 'ibnu_katsir' }))}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    isIbnuKatsir
                                      ? 'bg-gold text-white shadow-xs font-semibold'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span>Tafsir Ibnu Katsir</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveTafsirTabMap(prev => ({ ...prev, [ayah.ayah_number]: 'kemenag' }))}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    !isIbnuKatsir
                                      ? 'bg-gold text-white shadow-xs font-semibold'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <span>Kemenag RI</span>
                                </button>
                              </div>

                              {/* Right Actions: Copy & Close */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyTafsir(ayah, isIbnuKatsir ? 'Ibnu Katsir' : 'Kemenag RI', currentTafsirText)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
                                  title="Salin Teks Tafsir"
                                >
                                  {copiedTafsirAyah === ayah.ayah_number ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald" />
                                      <span className="text-emerald font-medium">Tersalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleTafsir(ayah.ayah_number)}
                                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-background/60"
                                  title="Tutup Tafsir"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Author info pill & Source Badge */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1.5 text-gold/90 font-medium">
                                <Sparkles className="h-3 w-3 text-gold" />
                                {isIbnuKatsir 
                                  ? "Kitab Tafsir Al-Qur'an Al-'Azhim • Al-Hafizh Ibnu Katsir (W. 774 H)"
                                  : "Tafsir Ringkas Resmi Kementerian Agama RI"}
                              </span>
                              {isIbnuKatsir && hasIbnuKatsir && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                                  Database Lokal
                                </span>
                              )}
                              {!isIbnuKatsir && hasKemenag && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                                  API Kemenag
                                </span>
                              )}
                            </div>

                            {/* Tafsir Body Text */}
                            <div className="max-h-[500px] overflow-y-auto pr-1 text-xs sm:text-sm text-foreground/85 leading-relaxed font-sans space-y-2.5">
                              {currentTafsirText ? (
                                <>
                                  {currentTafsirText.split('\n\n').map((paragraph, pIdx) => {
                                    const trimmed = paragraph.trim();
                                    if (!trimmed) return null;
                                    return (
                                      <p key={pIdx} className="leading-relaxed">
                                        {trimmed}
                                      </p>
                                    );
                                  })}
                                  {currentTafsirText.length > 500 && (
                                    <p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-border/30 text-right">
                                      {currentTafsirText.length.toLocaleString()} karakter
                                    </p>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-2 py-4 text-center">
                                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                                  {isIbnuKatsir ? (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Tafsir Ibnu Katsir belum tersedia untuk ayat ini
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setActiveTafsirTabMap(prev => ({ ...prev, [ayah.ayah_number]: 'kemenag' }))}
                                        className="text-[11px] text-gold underline underline-offset-2 hover:opacity-80"
                                      >
                                        Tampilkan Tafsir Kemenag RI →
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-xs italic text-muted-foreground">
                                      Tafsir Kemenag RI untuk ayat ini belum berhasil dimuat.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                    </article>
                  );
                })}
              </div>

              {/* Bottom Pagination & Navigation */}
              <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                {surahDetail.number > 1 ? (
                  <button
                    onClick={() => openSurah(surahDetail.number - 1)}
                    className="flex items-center gap-2 rounded-2xl border border-border/80 bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:border-gold/50 hover:bg-gold/5 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Surat Sebelumnya: {SURAH_LIST[surahDetail.number - 2]?.name}</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-1.5 rounded-2xl border border-border/80 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>Kembali ke Atas</span>
                </button>

                {surahDetail.number < 114 ? (
                  <button
                    onClick={() => openSurah(surahDetail.number + 1)}
                    className="flex items-center gap-2 rounded-2xl border border-border/80 bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:border-gold/50 hover:bg-gold/5 transition-all"
                  >
                    <span>Surat Selanjutnya: {SURAH_LIST[surahDetail.number]?.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : <div />}
              </div>

            </>
          )}

        </div>
      ) : (

        /* ─────────────────────────────────────────────────────────────
            VIEW 2: MAIN LIST MODE (APK HOMEPAGE: SURAH, JUZ, BOOKMARK, TEMA)
        ───────────────────────────────────────────────────────────── */
        <div className="space-y-6">

          {/* Hero Banner with Last Read & Quick Stats */}
          <div className="noor-card grain relative overflow-hidden rounded-3xl p-6 sm:p-8 border-gold/30 shadow-lg">
            <span className="noor-bloom" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2 max-w-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-0.5 text-xs font-semibold text-gold">
                  <BookOpen className="h-3.5 w-3.5" />
                  Mushaf Al-Qur'an Lengkap
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Al-Qur'an Al-Karim
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  114 Surat, 30 Juz, dilengkapi teks Arab berharakat, transliterasi Latin, Terjemahan Kemenag RI, Tafsir Ibnu Katsir (database lokal), serta Murottal 6 Qari dunia.
                </p>
              </div>

              {/* Interactive Reading Progress & Last Read Card */}
              {quranProgress.hasProgress ? (
                <div 
                  onClick={() => openSurah(quranProgress.currentSurah.number, quranProgress.currentAyah)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-gold/50 bg-gold/[0.08] p-5 transition-all hover:bg-gold/15 hover:shadow-lg md:w-96 shrink-0"
                >
                  <div className="flex items-center justify-between text-xs text-gold font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Pin className="h-3.5 w-3.5 fill-current" />
                      Progres Tilawah (Ditandai)
                    </span>
                    <span className="arabic text-sm font-normal">{quranProgress.surahArabic}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                      QS. {quranProgress.surahName}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">Ayat ke-{quranProgress.currentAyah}</span>
                      <span>•</span>
                      <span>Juz {quranProgress.juzNumber}</span>
                      <span>•</span>
                      <span className="text-gold font-bold">{quranProgress.percentage}% Khatam</span>
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-gold via-gold-bright to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(1, quranProgress.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                      <span>{quranProgress.cumulativeAyahs.toLocaleString('id-ID')} / {quranProgress.totalAyahs.toLocaleString('id-ID')} Ayat</span>
                      {savedAyahs.length > 0 && (
                        <span className="text-gold font-semibold">{savedAyahs.length} ditandai</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/40 text-xs font-semibold text-gold">
                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Lanjutkan Membaca</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                    {savedAyahs.length > 0 && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('bookmark');
                        }}
                        className="text-[11px] underline underline-offset-2 text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1"
                      >
                        <BookmarkCheck className="h-3 w-3 text-gold" />
                        <span>Ayat Tersimpan ({savedAyahs.length})</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => openSurah(1, 1)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-secondary/40 p-5 transition-all hover:border-gold/50 md:w-96 shrink-0"
                >
                  <div className="flex items-center gap-2 text-xs text-gold font-semibold mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Mulai Tilawah & Tandai Ayat</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Al-Fatihah (Pembukaan)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tandai ayat yang kamu baca untuk memantau progres tilawah Al-Qur'an secara real-time.
                  </p>
                  <div className="mt-3 text-xs font-semibold text-gold flex items-center gap-1">
                    <span>Mulai Membaca →</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Tab Navigation: Surat, Juz, Bookmark, Tema */}
          <div className="space-y-4">
            
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/60 pb-2 scrollbar-none">
              
              <button
                onClick={() => setActiveTab('surat')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeTab === 'surat'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <span>Surat</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">114</span>
              </button>

              <button
                onClick={() => setActiveTab('juz')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeTab === 'juz'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <span>Juz</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">30</span>
              </button>

              <button
                onClick={() => setActiveTab('bookmark')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeTab === 'bookmark'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <BookmarkCheck className="h-3.5 w-3.5" />
                <span>Ayat Tersimpan</span>
                {savedAyahs.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === 'bookmark' ? 'bg-gold text-white' : 'bg-gold/25 text-gold'
                  }`}>
                    {savedAyahs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('tema')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeTab === 'tema'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tema Kehidupan</span>
              </button>

            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'surat'
                    ? "Cari nama surat (Arab/Latin) atau nomor... (misal: Al-Kahf, 18, Yasin)"
                    : activeTab === 'juz'
                    ? "Cari nomor juz (1 - 30) atau nama surat awal..."
                    : activeTab === 'bookmark'
                    ? "Cari ayat tersimpan (nama surat, terjemahan, nomor)..."
                    : "Cari topik / tema penyejuk kalbu..."
                }
                className="flex w-full border border-border/80 pl-10 pr-10 py-3 shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-2xl bg-secondary/50 text-xs sm:text-sm text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          {/* ── TAB 1: SURAT (114 Surahs Grid) ── */}
          {activeTab === 'surat' && (
            <div>
              {filteredSurahs.length === 0 ? (
                <div className="noor-card rounded-3xl p-12 text-center text-muted-foreground text-xs sm:text-sm">
                  Tidak ditemukan surat dengan kata kunci &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSurahs.map((surah) => {
                    const isAudioPlayingThis = audioState.isPlaying && audioState.type === 'surah' && audioState.surahNumber === surah.number;
                    const stats = surahStatsMap[surah.number] || { markedCount: 0, isCurrent: false, isPassed: false, currentAyah: null, progressPercent: 0 };
                    const firstSavedInSurah = savedAyahs.find(a => parseInt(a.surah_number || a.surahNumber, 10) === surah.number);
                    const targetAyahToOpen = stats.isCurrent 
                      ? stats.currentAyah 
                      : (firstSavedInSurah ? parseInt(firstSavedInSurah.ayah_number || firstSavedInSurah.ayahNumber, 10) : null);

                    return (
                      <div
                        key={surah.number}
                        onClick={() => openSurah(surah.number, targetAyahToOpen)}
                        className={`noor-card group relative flex flex-col justify-between p-4 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs hover:shadow-md ${
                          stats.isCurrent
                            ? 'border-gold shadow-[0_0_20px_-6px_var(--gold-glow)] bg-gold/[0.04] ring-1 ring-gold/40'
                            : stats.markedCount > 0
                            ? 'border-gold/50 bg-secondary/30 hover:border-gold'
                            : 'border-border/60 hover:border-gold/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          {/* Surah Number Emblem & Info */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                              stats.isCurrent 
                                ? 'border-gold bg-gold text-white shadow-xs' 
                                : 'border-gold/40 bg-gold/5 text-gold group-hover:bg-gold group-hover:text-white'
                            }`}>
                              {surah.number}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="truncate text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                                  {surah.name}
                                </h3>
                                <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary shrink-0">
                                  {surah.revelation === 'Makkiyyah' ? 'Mkk' : 'Mdn'}
                                </span>
                                {stats.isCurrent && (
                                  <span className="text-[10px] font-bold text-gold px-1.5 py-0.5 rounded-md bg-gold/15 flex items-center gap-1 shrink-0 animate-pulse">
                                    <Pin className="h-2.5 w-2.5 fill-current" />
                                    Ayat {stats.currentAyah}
                                  </span>
                                )}
                                {stats.markedCount > 0 && !stats.isCurrent && (
                                  <span className="text-[10px] font-semibold text-gold px-1.5 py-0.5 rounded-md bg-gold/10 flex items-center gap-1 shrink-0">
                                    <BookmarkCheck className="h-2.5 w-2.5" />
                                    {stats.markedCount} tersimpan
                                  </span>
                                )}
                                {stats.isPassed && !stats.isCurrent && (
                                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10 shrink-0">
                                    ✓ Selesai
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground mt-0.5">
                                {surah.translation} · {surah.numberOfAyahs} ayat
                              </p>
                            </div>
                          </div>

                          {/* Arabic Title & Play Audio Button */}
                          <div className="flex items-center gap-2 shrink-0 pl-2">
                            <span className="arabic text-xl font-normal text-gold select-none group-hover:scale-105 transition-transform">
                              {surah.arabic}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playFullSurahAudio(surah);
                              }}
                              className={`p-2 rounded-xl transition-colors ${
                                isAudioPlayingThis
                                  ? 'bg-gold text-white animate-pulse'
                                  : 'text-muted-foreground hover:text-gold hover:bg-gold/10'
                              }`}
                              title={isAudioPlayingThis ? "Hentikan Tilawah" : "Putar Tilawah Surat"}
                            >
                              {isAudioPlayingThis ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Surah Mini Reading Progress Bar */}
                        {(stats.isCurrent || stats.markedCount > 0 || stats.isPassed) && (
                          <div className="mt-3 pt-2 border-t border-border/40 w-full flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="h-1 flex-1 mr-2 overflow-hidden rounded-full bg-secondary/80">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  stats.isCurrent 
                                    ? 'bg-gold' 
                                    : stats.isPassed 
                                    ? 'bg-emerald-500' 
                                    : 'bg-gold/60'
                                }`}
                                style={{ width: `${Math.max(stats.progressPercent, 3)}%` }}
                              />
                            </div>
                            <span className="shrink-0 font-medium">
                              {stats.isCurrent 
                                ? `${stats.currentAyah}/${surah.numberOfAyahs} ayat (${stats.progressPercent}%)` 
                                : stats.isPassed 
                                ? '100% selesai' 
                                : `${stats.markedCount} ayat ditandai`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: JUZ (30 Juz List) ── */}
          {activeTab === 'juz' && (
            <div>
              {filteredJuz.length === 0 ? (
                <div className="noor-card rounded-3xl p-12 text-center text-muted-foreground text-xs sm:text-sm">
                  Tidak ditemukan juz dengan pencarian &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredJuz.map((juz) => {
                    const isCurrentJuz = quranProgress.hasProgress && juz.number === quranProgress.juzNumber;
                    return (
                      <div
                        key={juz.number}
                        onClick={() => openSurah(juz.start.surah, juz.start.ayah)}
                        className={`noor-card group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs hover:shadow-md ${
                          isCurrentJuz 
                            ? 'border-gold shadow-[0_0_20px_-6px_var(--gold-glow)] bg-gold/[0.04] ring-1 ring-gold/40' 
                            : 'border-border/60 hover:border-gold/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                            isCurrentJuz
                              ? 'border-gold bg-gold text-white shadow-xs'
                              : 'border-gold/40 bg-gold/5 text-gold group-hover:bg-gold group-hover:text-white'
                          }`}>
                            {juz.number}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="truncate text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                                Juz {juz.number}
                              </h3>
                              {isCurrentJuz && (
                                <span className="text-[10px] font-bold text-gold px-1.5 py-0.5 rounded-md bg-gold/15 flex items-center gap-1 shrink-0 animate-pulse">
                                  <Pin className="h-2.5 w-2.5 fill-current" />
                                  Juz Tilawah Aktif
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                              Mulai: {juz.start.surahName} : {juz.start.ayah}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground/75">
                              Akhir: {juz.end.surahName} : {juz.end.ayah}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="arabic text-lg font-normal text-gold block">
                            {juz.name}
                          </span>
                          <span className="text-[10px] text-gold font-medium flex items-center justify-end gap-1 mt-1 group-hover:translate-x-0.5 transition-transform">
                            Buka Juz <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: BOOKMARK / AYAT TERSIMPAN ── */}
          {activeTab === 'bookmark' && (
            <div className="space-y-4">
              {/* Header inside Ayat Tersimpan tab */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5 text-gold" />
                    Ayat Tersimpan ({savedAyahs.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Koleksi ayat yang kamu tandai — tersinkronisasi langsung dengan Jelajah Al-Qur'an.
                  </p>
                </div>
                {onGoToSaved && (
                  <button
                    onClick={onGoToSaved}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gold/40 bg-gold/10 text-gold text-xs font-semibold hover:bg-gold hover:text-white transition-all shadow-xs"
                    title="Buka Halaman Khusus Ayat Tersimpan"
                  >
                    <span>Buka Halaman Tersimpan</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {savedAyahs.length === 0 ? (
                <div className="noor-card flex flex-col items-center rounded-3xl px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold mb-4">
                    <Bookmark className="h-7 w-7" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Belum ada ayat yang disimpan
                  </h3>
                  <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Saat menjelajahi atau membaca Al-Qur'an, tekan tombol <strong className="text-gold font-semibold">Bookmark</strong> pada ayat mana pun untuk menyimpannya ke daftar ini.
                  </p>
                  <button
                    onClick={() => setActiveTab('surat')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Mulai Jelajah Surat</span>
                  </button>
                </div>
              ) : filteredSavedAyahs.length === 0 ? (
                <div className="noor-card rounded-3xl p-12 text-center text-muted-foreground text-xs sm:text-sm space-y-3">
                  <p>Tidak ditemukan ayat tersimpan dengan kata kunci &ldquo;{searchQuery}&rdquo;.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-1.5 rounded-xl bg-gold/15 text-gold text-xs font-semibold hover:bg-gold/25 transition-all"
                  >
                    Hapus Kata Kunci
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSavedAyahs.map((ay, idx) => {
                    const surahNum = parseInt(ay.surah_number || ay.surahNumber, 10);
                    const ayahNum = parseInt(ay.ayah_number || ay.ayahNumber, 10);
                    const surahName = ay.surah_name || ay.surahName || `Surat ${surahNum}`;
                    const isThisReadingAyah = lastRead && 
                      parseInt(lastRead.surahNumber, 10) === surahNum && 
                      parseInt(lastRead.ayahNumber, 10) === ayahNum;

                    const isAudioPlayingThis = audioState.isPlaying && 
                      audioState.type === 'ayah' && 
                      audioState.surahNumber === surahNum && 
                      audioState.ayahNumber === ayahNum;

                    return (
                      <article
                        key={`${surahNum}-${ayahNum}-${idx}`}
                        className={`noor-card rounded-3xl p-5 sm:p-6 transition-all space-y-3.5 shadow-xs ${
                          isThisReadingAyah 
                            ? 'border-gold shadow-[0_0_20px_-6px_var(--gold-glow)] bg-gold/[0.04] ring-1 ring-gold/40' 
                            : isAudioPlayingThis
                            ? 'border-gold bg-gold/[0.03]'
                            : 'border-border/60 hover:border-gold/40'
                        }`}
                      >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                              <BookmarkCheck className="h-3.5 w-3.5" />
                              QS. {surahName}: {ayahNum}
                            </span>
                            {isThisReadingAyah && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-gold animate-pulse">
                                <Pin className="h-3 w-3 fill-current" />
                                Posisi Tilawah Aktif
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Play Audio Button */}
                            <button
                              onClick={() => playAyahAudio(ay)}
                              className={`flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-all ${
                                isAudioPlayingThis
                                  ? 'bg-gold text-white font-semibold shadow-xs'
                                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              }`}
                              title={isAudioPlayingThis ? "Hentikan Tilawah" : "Putar Tilawah Ayat Ini"}
                            >
                              {isAudioPlayingThis ? (
                                <>
                                  <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                                  <span className="hidden sm:inline">Berhenti</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Dengarkan</span>
                                </>
                              )}
                            </button>

                            {/* Mark Reading Position */}
                            {!isThisReadingAyah && (
                              <button
                                onClick={() => handleMarkLastRead(ay)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-gold/15 hover:text-gold text-xs font-semibold text-muted-foreground transition-all"
                                title="Tandai sebagai Posisi Tilawah Aktif"
                              >
                                <Pin className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Tandai Posisi</span>
                              </button>
                            )}

                            {/* Open in Reader */}
                            <button
                              onClick={() => openSurah(surahNum, ayahNum)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                              title="Buka dan baca lengkap di dalam Surat"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>Buka di Surat</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>

                            {/* Copy Text */}
                            <button
                              onClick={() => handleCopyAyah(ay)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                              title="Salin Ayat"
                            >
                              {copiedAyah === ayahNum ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Export / Share */}
                            {onExportQuote && (
                              <button
                                onClick={() =>
                                  onExportQuote({
                                    arabic: ay.arabic_text,
                                    latin: ay.latin_text,
                                    translation: ay.translation_id,
                                    reference: `QS. ${surahName}: ${ayahNum}`
                                  })
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-gold transition-all"
                                title="Bagikan Kutipan"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Remove Bookmark */}
                            {onToggleSaveAyah && (
                              <button
                                onClick={() => onToggleSaveAyah(ay)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Hapus dari Ayat Tersimpan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Arabic Text */}
                        {ay.arabic_text && (
                          <p 
                            className="arabic text-right leading-[2.3] font-normal text-foreground select-text py-1"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {ay.arabic_text}
                            <span className="inline-block px-2 text-gold font-normal text-xl select-none">
                              ۝
                            </span>
                          </p>
                        )}

                        {/* Latin Transliteration */}
                        {showLatin && ay.latin_text && (
                          <p className="text-xs sm:text-sm italic text-muted-foreground/85 leading-relaxed">
                            {ay.latin_text}
                          </p>
                        )}

                        {/* Indonesian Translation */}
                        {ay.translation_id && (
                          <p className="text-sm text-foreground/85 leading-relaxed border-t border-border/30 pt-2 font-sans">
                            &ldquo;{ay.translation_id}&rdquo;
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: TEMA KEHIDUPAN (Thematic Ayahs) ── */}
          {activeTab === 'tema' && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {THEMES.map((th) => {
                  const isSelected = selectedTheme?.id === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setSelectedTheme(isSelected ? null : th)}
                      className={`noor-card p-5 rounded-3xl text-left transition-all hover:-translate-y-0.5 ${
                        isSelected ? 'border-gold shadow-[0_0_30px_-10px_var(--gold-glow)] ring-1 ring-gold/40' : ''
                      }`}
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/5 text-gold">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                        {th.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {th.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Verses for Selected Theme */}
              {selectedTheme && (
                <div className="mt-6 space-y-4 pt-4 border-t border-border/60 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        Ayat Terkait Tema
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {selectedTheme.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedTheme(null)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="space-y-4">
                    {POPULAR_AYAHS.filter(a => a.theme_tags.includes(selectedTheme.id) || selectedTheme.surahs.includes(a.surah_number)).map((ay, i) => (
                      <div key={i} className="noor-card grain rounded-3xl p-5 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                            QS. {ay.surah_name}: {ay.ayah_number}
                          </span>
                          <button
                            onClick={() => openSurah(ay.surah_number, parseInt(String(ay.ayah_number).split('-')[0], 10) || 1)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                          >
                            <span>Buka di Surat</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="arabic text-2xl text-right">{ay.arabic_text}</p>
                        <p className="text-xs italic text-muted-foreground">{ay.latin_text}</p>
                        <div className="hairline my-2" />
                        <p className="text-sm text-foreground/90 leading-relaxed">&ldquo;{ay.translation_id}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STICKY / FLOATING BOTTOM AUDIO PLAYER BAR (APK AUDIO BAR)
      ───────────────────────────────────────────────────────────── */}
      {audioState.isPlaying && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-fade-up">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-gold/50 bg-background/95 p-3.5 shadow-2xl backdrop-blur-xl">
            
            {/* Audio Info */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold text-white shadow-xs">
                <Volume2 className="h-5 w-5 animate-pulse" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">
                  {audioState.type === 'ayah' 
                    ? `QS. ${surahDetail?.name || audioState.surahNumber} : Ayat ${audioState.ayahNumber}`
                    : `Tilawah QS. ${surahDetail?.name || audioState.surahNumber}`
                  }
                </p>
                <p className="truncate text-[10px] text-gold font-medium">
                  {currentQariObj.name}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {audioState.type === 'ayah' && (
                <button
                  onClick={handlePrevAyahAudio}
                  disabled={!audioState.ayahNumber || audioState.ayahNumber <= 1}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Ayat Sebelumnya"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={stopAudio}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-white shadow-xs hover:bg-gold/90 transition-all active:scale-95"
                title="Hentikan Audio"
              >
                <Pause className="h-4 w-4 fill-current" />
              </button>

              {audioState.type === 'ayah' && (
                <button
                  onClick={handleNextAyahAudio}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="Ayat Selanjutnya"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={stopAudio}
                className="ml-1 p-1.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                title="Tutup Player"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

