import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  HADITH_BUKHARI, 
  HADITH_THEMES, 
  getHadithById
} from '../data/hadithData';
import {
  HADITH_MUSLIM,
  HADITH_MUSLIM_THEMES,
  getMuslimHadithById
} from '../data/hadithMuslimData';
import {
  getHadithCollectionMeta,
  getHadithCollectionBook,
  searchHadithCollectionGlobal,
  findBookForHadithNumber
} from '../services/hadithService';
import { 
  Search, 
  BookMarked, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  ChevronLeft,
  X,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Library,
  Zap,
  Book
} from 'lucide-react';
import { useToast } from './Toast';

export default function HadithBrowser({ onExportQuote }) {
  const { showToast } = useToast();

  // Koleksi Hadits yang Dipilih: 'bukhari' | 'muslim'
  const [selectedCollection, setSelectedCollection] = useState('bukhari');

  // Mode Navigasi Utama: 'tematik' | 'kitab' | 'cari'
  const [activeTab, setActiveTab] = useState('tematik');

  // State Hadits Tematik
  const [thematicQuery, setThematicQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');

  // State Daftar Kitab
  const [booksMeta, setBooksMeta] = useState([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [bookFilterQuery, setBookFilterQuery] = useState('');

  // State Reader Kitab Aktif
  const [activeBookId, setActiveBookId] = useState(null);
  const [activeBookData, setActiveBookData] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [inBookSearchQuery, setInBookSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(25);
  const [targetHadithNumber, setTargetHadithNumber] = useState(null);

  // State Pencarian Global
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [hasSearchedGlobal, setHasSearchedGlobal] = useState(false);

  // State Salin & UI
  const [copiedId, setCopiedId] = useState(null);
  const readerTopRef = useRef(null);

  // Konfigurasi Koleksi
  const COLLECTIONS = {
    bukhari: {
      id: 'bukhari',
      name: 'Shahih Al-Bukhari',
      shortName: 'Bukhari',
      imam: 'Imam Al-Bukhari (194–256 H)',
      totalBooks: 97,
      totalHadiths: 7589,
      subtitle: '97 Kitab • 7.589 Hadits Shahih'
    },
    muslim: {
      id: 'muslim',
      name: 'Shahih Muslim',
      shortName: 'Muslim',
      imam: 'Imam Muslim ibn al-Hajjaj (204–261 H)',
      totalBooks: 57,
      totalHadiths: 7563,
      coreHadiths: 3033,
      subtitle: '57 Kitab • 7.563 Hadits Sanad (~3.033 Inti Fuad Baqi)'
    }
  };

  const currentCol = COLLECTIONS[selectedCollection] || COLLECTIONS.bukhari;

  const currentThematicRaw = selectedCollection === 'muslim' ? HADITH_MUSLIM : HADITH_BUKHARI;
  const currentThemesRaw = selectedCollection === 'muslim' ? HADITH_MUSLIM_THEMES : HADITH_THEMES;

  // Kategori Tema Hadits Pilihan (Responsif Bukhari / Muslim)
  const THEME_OPTIONS = useMemo(() => [
    { id: 'all', label: 'Semua', count: currentThematicRaw.length },
    { id: 'sabar_ujian', label: 'Sabar', count: currentThemesRaw.sabar_ujian?.length || 0 },
    { id: 'rezeki_tawakal', label: 'Rezeki', count: currentThemesRaw.rezeki_tawakal?.length || 0 },
    { id: 'ketenangan_dzikir', label: 'Dzikir', count: currentThemesRaw.ketenangan_dzikir?.length || 0 },
    { id: 'taubat_ampunan', label: 'Taubat', count: currentThemesRaw.taubat_ampunan?.length || 0 },
    { id: 'keluarga_sosial', label: 'Keluarga', count: currentThemesRaw.keluarga_sosial?.length || 0 },
    { id: 'akhlak_ilmu', label: 'Akhlak', count: currentThemesRaw.akhlak_ilmu?.length || 0 },
    { id: 'syukur_nikmat', label: 'Syukur', count: currentThemesRaw.syukur_nikmat?.length || 0 },
    { id: 'sakit_sehat', label: 'Kesehatan', count: currentThemesRaw.sakit_sehat?.length || 0 },
    { id: 'niat_ikhlas', label: 'Niat', count: currentThemesRaw.niat_ikhlas?.length || 0 },
    { id: 'ibadah_salat', label: 'Salat', count: currentThemesRaw.ibadah_salat?.length || 0 },
    { id: 'akhirat_dunia', label: 'Akhirat', count: currentThemesRaw.akhirat_dunia?.length || 0 },
  ], [selectedCollection, currentThematicRaw, currentThemesRaw]);

  // Muat metadata saat koleksi berubah
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      setIsLoadingMeta(true);
      const meta = await getHadithCollectionMeta(selectedCollection);
      if (isMounted && meta && meta.books) {
        setBooksMeta(meta.books);
      }
      if (isMounted) setIsLoadingMeta(false);
    }
    loadMeta();
    return () => { isMounted = false; };
  }, [selectedCollection]);

  // Muat isi kitab saat activeBookId atau selectedCollection berubah
  useEffect(() => {
    let isMounted = true;
    async function loadBook() {
      if (activeBookId === null || activeBookId === undefined) {
        setActiveBookData(null);
        return;
      }
      setIsLoadingBook(true);
      setDisplayCount(25);
      const data = await getHadithCollectionBook(selectedCollection, activeBookId);
      if (isMounted && data) {
        setActiveBookData(data);
      }
      if (isMounted) setIsLoadingBook(false);
    }
    loadBook();
    return () => { isMounted = false; };
  }, [activeBookId, selectedCollection]);

  // Scroll otomatis ke hadits target jika ada
  useEffect(() => {
    if (targetHadithNumber && activeBookData && !isLoadingBook) {
      setTimeout(() => {
        const el = document.getElementById(`hadith-num-${targetHadithNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [targetHadithNumber, activeBookData, isLoadingBook]);

  // Handler Ganti Koleksi (Bukhari <-> Muslim)
  const handleSelectCollection = (colId) => {
    if (colId === selectedCollection) return;
    setSelectedCollection(colId);
    setActiveBookId(null);
    setActiveBookData(null);
    setTargetHadithNumber(null);
    setHasSearchedGlobal(false);
    setGlobalSearchResults([]);
  };

  // Handler Buka Kitab Tertentu
  const handleOpenBook = (bookNumber, targetNum = null) => {
    setActiveBookId(bookNumber);
    setTargetHadithNumber(targetNum);
    setInBookSearchQuery('');
    setActiveTab('kitab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Lompat ke Nomor Hadits Global
  const handleJumpToHadithNumber = async (num) => {
    const target = parseFloat(num);
    const maxHadith = selectedCollection === 'muslim' ? 7563 : 7563;
    if (isNaN(target) || target < 1 || target > maxHadith) {
      showToast(`Masukkan nomor hadits antara 1 hingga ${maxHadith}`, 'warning');
      return;
    }

    let metaList = booksMeta;
    if (!metaList || !metaList.length) {
      const meta = await getHadithCollectionMeta(selectedCollection);
      metaList = meta?.books || [];
      setBooksMeta(metaList);
    }

    const book = findBookForHadithNumber(target, metaList);
    if (book) {
      handleOpenBook(book.bookNumber, target);
      showToast(`Membuka Hadits No. ${target} di Kitab ${book.nameId}`, 'success');
    } else {
      showToast(`Hadits nomor ${target} tidak ditemukan di Shahih ${currentCol.shortName}`, 'error');
    }
  };

  // Eksekusi Pencarian Global
  const handleExecuteGlobalSearch = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : globalQuery).trim();
    if (!q) return;

    setIsSearchingGlobal(true);
    setHasSearchedGlobal(true);
    try {
      const results = await searchHadithCollectionGlobal(selectedCollection, q, 60);
      setGlobalSearchResults(results);
      if (results.length === 0) {
        showToast(`Tidak ada hadits ${currentCol.shortName} yang cocok dengan "${q}"`, 'info');
      } else {
        showToast(`Ditemukan ${results.length} hadits Shahih ${currentCol.shortName}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menjalankan pencarian', 'error');
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  // Handler Salin Teks Hadits
  const handleCopy = (hadith, bookName = '') => {
    const arab = hadith.arabic || hadith.arab || '';
    const indo = hadith.terjemahan || hadith.id || hadith.text || '';
    const colName = hadith.collection 
      ? (hadith.collection === 'muslim' ? 'Muslim' : 'Bukhari')
      : (hadith.nomor ? (hadith.nomor.includes('Muslim') ? 'Muslim' : 'Bukhari') : (selectedCollection === 'muslim' ? 'Muslim' : 'Bukhari'));
    const no = hadith.number ? `No. ${hadith.number}` : (hadith.nomor || '');
    const perawi = hadith.perawi ? `(${hadith.perawi})` : '';
    const bName = bookName || hadith.kitab || (activeBookData ? activeBookData.nameId : `Shahih ${colName}`);
    const faedah = hadith.faedah ? `\n\nFaedah: ${hadith.faedah}` : '';
    const fuadBaqi = hadith.arabicNumber ? ` [No. Inti: #${hadith.arabicNumber}]` : '';
    const sourceHeader = hadith.nomor ? hadith.nomor : `HR. ${colName} ${no}`;

    const text = `${arab}\n\n"${indo}"\n\n— ${sourceHeader}${fuadBaqi} ${perawi}\nKitab: ${bName}${faedah}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id || hadith.number || no);
    showToast(`Hadits ${hadith.nomor || no} berhasil disalin ke clipboard`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler Bagikan / Export Quote
  const handleShareQuote = (hadith, bookName = '') => {
    if (!onExportQuote) return;
    const indo = hadith.terjemahan || hadith.id || hadith.text || '';
    const colName = hadith.collection 
      ? (hadith.collection === 'muslim' ? 'Muslim' : 'Bukhari')
      : (hadith.nomor ? (hadith.nomor.includes('Muslim') ? 'Muslim' : 'Bukhari') : (selectedCollection === 'muslim' ? 'Muslim' : 'Bukhari'));
    const no = hadith.number ? `No. ${hadith.number}` : (hadith.nomor || '');
    const perawi = hadith.perawi ? `(${hadith.perawi})` : '';
    const bName = bookName || hadith.kitab || (activeBookData ? activeBookData.nameId : `Shahih ${colName}`);
    const sourceHeader = hadith.nomor ? hadith.nomor : `HR. ${colName} ${no}`;

    onExportQuote({
      quote: indo,
      author: `${sourceHeader} ${perawi} • ${bName}`,
      arabic: hadith.arabic || hadith.arab || ''
    });
  };

  // Filter Hadits Tematik
  const filteredThematicHadiths = useMemo(() => {
    let list = selectedCollection === 'muslim' ? HADITH_MUSLIM : HADITH_BUKHARI;
    const themes = selectedCollection === 'muslim' ? HADITH_MUSLIM_THEMES : HADITH_THEMES;
    const getById = selectedCollection === 'muslim' ? getMuslimHadithById : getHadithById;

    if (selectedTheme !== 'all') {
      const ids = themes[selectedTheme] || [];
      list = ids.map(id => getById(id)).filter(Boolean);
    }

    const q = thematicQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(h => 
        (h.terjemahan && h.terjemahan.toLowerCase().includes(q)) ||
        (h.nomor && h.nomor.toLowerCase().includes(q)) ||
        (h.kitab && h.kitab.toLowerCase().includes(q)) ||
        (h.bab && h.bab.toLowerCase().includes(q)) ||
        (h.perawi && h.perawi.toLowerCase().includes(q)) ||
        (h.faedah && h.faedah.toLowerCase().includes(q)) ||
        (h.tema_tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCollection, selectedTheme, thematicQuery]);

  // Filter Daftar Kitab
  const filteredBooks = useMemo(() => {
    if (!booksMeta) return [];
    const q = bookFilterQuery.toLowerCase().trim();
    if (!q) return booksMeta;

    return booksMeta.filter(b => 
      b.nameId.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      String(b.bookNumber).includes(q) ||
      (q.startsWith('no') && String(b.bookNumber) === q.replace(/\D/g, ''))
    );
  }, [booksMeta, bookFilterQuery]);

  // Filter Hadits di dalam Kitab Aktif (Reader View)
  const filteredInBookHadiths = useMemo(() => {
    if (!activeBookData || !activeBookData.hadiths) return [];
    const q = inBookSearchQuery.toLowerCase().trim();
    if (!q) return activeBookData.hadiths;

    return activeBookData.hadiths.filter(h => 
      h.id.toLowerCase().includes(q) ||
      String(h.number).includes(q) ||
      (h.arabicNumber && String(h.arabicNumber).includes(q)) ||
      (h.arab && h.arab.includes(q))
    );
  }, [activeBookData, inBookSearchQuery]);

  // Deteksi apakah input berupa nomor hadits untuk saran cepat
  const detectedNumberInThematic = useMemo(() => {
    const q = thematicQuery.trim();
    const parsed = parseInt(q.replace(/[^0-9]/g, ''), 10);
    if (parsed >= 1 && parsed <= 7563 && q.length > 0 && !isNaN(parsed)) {
      return parsed;
    }
    return null;
  }, [thematicQuery]);

  // Warna aksen berdasarkan koleksi
  const accent = selectedCollection === 'muslim' ? 'emerald' : 'gold';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 text-foreground space-y-5 animate-fade-up">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="space-y-4">

        {/* Judul */}
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accent}/10 text-${accent}`}>
            <BookMarked className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Ensiklopedia Hadits
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Shahih Al-Bukhari &amp; Shahih Muslim — Teks Arab &amp; Terjemahan
            </p>
          </div>
        </div>

        {/* ── Switcher Koleksi ──────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectCollection('bukhari')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              selectedCollection === 'bukhari'
                ? 'bg-gold/10 text-gold border-gold/30'
                : 'text-muted-foreground border-border/50 hover:border-border hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Bukhari</span>
            <span className="hidden sm:inline text-[10px] opacity-60">97K · 7.589H</span>
          </button>

          <button
            onClick={() => handleSelectCollection('muslim')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              selectedCollection === 'muslim'
                ? 'bg-emerald/10 text-emerald border-emerald/30'
                : 'text-muted-foreground border-border/50 hover:border-border hover:text-foreground'
            }`}
          >
            <Book className="h-3.5 w-3.5" />
            <span>Muslim</span>
            <span className="hidden sm:inline text-[10px] opacity-60">57K · 7.563H</span>
          </button>
        </div>

        {/* ── Tab Navigasi ──────────────────────────────────────── */}
        <div className="flex border-b border-border/50">
          {[
            { id: 'tematik', icon: Sparkles, label: 'Tematik' },
            { id: 'kitab',   icon: Library,  label: `${currentCol.totalBooks} Kitab` },
            { id: 'cari',    icon: Search,   label: 'Cari' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id !== 'kitab') setActiveBookId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === id
                  ? `border-${accent} text-${accent}`
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. TAB: HADITS TEMATIK                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'tematik' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={thematicQuery}
              onChange={(e) => setThematicQuery(e.target.value)}
              placeholder="Cari kata kunci atau nomor hadits..."
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
            />
            {thematicQuery && (
              <button
                onClick={() => setThematicQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Saran Cepat Lompat Nomor */}
          {detectedNumberInThematic && (
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/40 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                Langsung ke hadits <strong className="text-foreground">No. {detectedNumberInThematic}</strong>?
              </span>
              <button
                onClick={() => handleJumpToHadithNumber(detectedNumberInThematic)}
                className={`ml-2 px-3 py-1 rounded-lg text-white text-[11px] font-semibold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer bg-${accent} hover:opacity-90`}
              >
                Buka <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Filter Tema Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {THEME_OPTIONS.map((theme) => {
              const isActive = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? `bg-${accent} text-white`
                      : 'bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {theme.label}
                  <span className="ml-1 opacity-60 text-[10px]">{theme.count}</span>
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span><strong className="text-foreground">{filteredThematicHadiths.length}</strong> hadits</span>
            {selectedTheme !== 'all' && (
              <button
                onClick={() => setSelectedTheme('all')}
                className="text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* List Hadits Tematik */}
          {filteredThematicHadiths.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BookMarked className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Tidak ada hadits ditemukan</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setGlobalQuery(thematicQuery);
                    setActiveTab('cari');
                    handleExecuteGlobalSearch(thematicQuery);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-gold text-white hover:bg-gold/90 transition-all cursor-pointer"
                >
                  Cari di Seluruh Koleksi
                </button>
                <button
                  onClick={() => { setThematicQuery(''); setSelectedTheme('all'); }}
                  className="px-4 py-2 rounded-xl text-xs border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredThematicHadiths.map((hadith) => {
                const isCopied = copiedId === hadith.id;
                return (
                  <article
                    key={hadith.id}
                    className="rounded-2xl border border-border/50 bg-card hover:border-border transition-all overflow-hidden"
                  >
                    {/* Stripe aksen atas */}
                    <div className={`h-0.5 bg-${accent}/40`} />

                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Meta baris atas */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-${accent}`}>
                          <ShieldCheck className="h-3 w-3" />
                          {hadith.nomor}
                        </span>
                        <span className="text-[11px] text-muted-foreground">· {hadith.perawi}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{hadith.kitab}</span>
                      </div>

                      {/* Teks Arab */}
                      <p
                        className="arabic text-right text-foreground leading-loose"
                        style={{ fontSize: '1.5rem', lineHeight: 2.2 }}
                        dir="rtl"
                      >
                        {hadith.arabic}
                      </p>

                      {/* Transliterasi */}
                      {hadith.latin && (
                        <p className="text-[12px] italic text-muted-foreground/70 text-right leading-relaxed">
                          {hadith.latin}
                        </p>
                      )}

                      {/* Terjemahan */}
                      <p className="text-sm leading-relaxed text-foreground/90 border-t border-border/40 pt-3">
                        &ldquo;{hadith.terjemahan}&rdquo;
                      </p>

                      {/* Faedah */}
                      {hadith.faedah && (
                        <div className={`text-xs leading-relaxed text-foreground/80 pl-3 border-l-2 border-${accent}/40`}>
                          <span className="font-semibold text-muted-foreground block mb-0.5">Faedah:</span>
                          {hadith.faedah}
                        </div>
                      )}

                      {/* Footer: tags + aksi */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1">
                          {(hadith.tema_tags || []).slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              onClick={() => setThematicQuery(tag)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onExportQuote && (
                            <button
                              type="button"
                              onClick={() => handleShareQuote(hadith)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all cursor-pointer"
                            >
                              <Share2 className="h-3 w-3" />
                              Bagikan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(hadith)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer ${
                              isCopied
                                ? 'border-emerald/40 bg-emerald/5 text-emerald'
                                : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                          >
                            {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {isCopied ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. TAB: JELAJAH KITAB                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'kitab' && (
        <div className="space-y-4">
          {/* A. READER KITAB */}
          {activeBookId !== null && activeBookId !== undefined ? (
            <div className="space-y-4" ref={readerTopRef}>
              {/* Navigasi Reader */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => { setActiveBookId(null); setTargetHadithNumber(null); }}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Daftar Kitab
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activeBookId <= (selectedCollection === 'muslim' ? 0 : 1)}
                    onClick={() => handleOpenBook(activeBookId - 1)}
                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-muted-foreground px-1">
                    {activeBookId} / {selectedCollection === 'muslim' ? 56 : 97}
                  </span>
                  <button
                    disabled={activeBookId >= (selectedCollection === 'muslim' ? 56 : 97)}
                    onClick={() => handleOpenBook(activeBookId + 1)}
                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Header Kitab */}
              {activeBookData && (
                <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-1.5">
                  <p className={`text-[11px] font-semibold text-${accent} flex items-center gap-1`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Shahih {currentCol.shortName} · Kitab {activeBookData.bookNumber}
                  </p>
                  <h3 className="text-lg font-bold text-foreground">{activeBookData.nameId}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {activeBookData.nameEn} &nbsp;·&nbsp;
                    No. {activeBookData.firstHadithNumber}–{activeBookData.lastHadithNumber} &nbsp;·&nbsp;
                    <span className="text-foreground font-medium">{activeBookData.totalHadiths} Hadits</span>
                    {activeBookData.firstArabicNumber && (
                      <> &nbsp;·&nbsp; Fuad Baqi #{activeBookData.firstArabicNumber}–#{activeBookData.lastArabicNumber}</>
                    )}
                  </p>
                </div>
              )}

              {/* Search dalam kitab */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={inBookSearchQuery}
                  onChange={(e) => setInBookSearchQuery(e.target.value)}
                  placeholder={`Cari di dalam Kitab ${activeBookId}...`}
                  className="w-full h-9 pl-9 pr-9 rounded-xl bg-secondary/50 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
                {inBookSearchQuery && (
                  <button
                    onClick={() => setInBookSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Loading */}
              {isLoadingBook && (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Memuat hadits...</p>
                </div>
              )}

              {/* List Hadits dalam Kitab */}
              {!isLoadingBook && activeBookData && (
                <div className="space-y-3">
                  {filteredInBookHadiths.slice(0, displayCount).map((hadith) => {
                    const isTarget = targetHadithNumber === hadith.number;
                    const isCopied = copiedId === hadith.number;

                    return (
                      <article
                        id={`hadith-num-${hadith.number}`}
                        key={hadith.number}
                        className={`rounded-2xl border bg-card overflow-hidden transition-all ${
                          isTarget ? 'border-gold/50 ring-1 ring-gold/30' : 'border-border/50 hover:border-border'
                        }`}
                      >
                        <div className={`h-0.5 ${isTarget ? 'bg-gold' : `bg-${accent}/30`}`} />
                        <div className="p-4 sm:p-5 space-y-3.5">
                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-semibold text-${accent} flex items-center gap-1`}>
                              <ShieldCheck className="h-3 w-3" />
                              HR. {currentCol.shortName} No. {hadith.number}
                            </span>
                            {hadith.arabicNumber && (
                              <span className="text-[10px] text-emerald">
                                Baqi #{hadith.arabicNumber}
                              </span>
                            )}
                            {hadith.hadithInBook && (
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                #{hadith.hadithInBook} di kitab ini
                              </span>
                            )}
                          </div>

                          {/* Teks Arab */}
                          {hadith.arab && (
                            <p
                              className="arabic text-right text-foreground"
                              style={{ fontSize: '1.5rem', lineHeight: 2.2 }}
                              dir="rtl"
                            >
                              {hadith.arab}
                            </p>
                          )}

                          {/* Terjemahan */}
                          <p className="text-sm leading-relaxed text-foreground/90 border-t border-border/40 pt-3">
                            &ldquo;{hadith.id}&rdquo;
                          </p>

                          {/* Aksi */}
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            {onExportQuote && (
                              <button
                                type="button"
                                onClick={() => handleShareQuote(hadith, activeBookData.nameId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
                              >
                                <Share2 className="h-3 w-3" />
                                Bagikan
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(hadith, activeBookData.nameId)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer ${
                                isCopied
                                  ? 'border-emerald/40 bg-emerald/5 text-emerald'
                                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                              }`}
                            >
                              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {isCopied ? 'Tersalin' : 'Salin'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Muat lebih banyak */}
                  {displayCount < filteredInBookHadiths.length && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setDisplayCount(prev => prev + 25)}
                        className="px-5 py-2 rounded-xl border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
                      >
                        Muat 25 Lagi &nbsp;·&nbsp; Tersisa {filteredInBookHadiths.length - displayCount}
                      </button>
                    </div>
                  )}

                  {filteredInBookHadiths.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Tidak ada hadits yang cocok dengan &ldquo;{inBookSearchQuery}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* B. DAFTAR KITAB */
            <div className="space-y-4">
              {/* Search Kitab */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={bookFilterQuery}
                  onChange={(e) => setBookFilterQuery(e.target.value)}
                  placeholder={`Cari nama kitab ${currentCol.shortName}...`}
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
                {bookFilterQuery && (
                  <button
                    onClick={() => setBookFilterQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Loading meta */}
              {isLoadingMeta && booksMeta.length === 0 && (
                <div className="py-10 text-center space-y-2">
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Memuat daftar kitab...</p>
                </div>
              )}

              {/* Grid Kitab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredBooks.map((book) => (
                  <div
                    key={book.bookNumber}
                    onClick={() => handleOpenBook(book.bookNumber)}
                    className="group rounded-xl border border-border/50 bg-card hover:border-border p-3.5 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold text-${accent}`}>
                        Kitab {book.bookNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{book.totalHadiths} hadits</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-1">
                        {book.nameId}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{book.nameEn}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>No. {book.firstHadithNumber}–{book.lastHadithNumber}</span>
                      <span className="flex items-center gap-0.5 text-gold group-hover:translate-x-0.5 transition-transform">
                        Buka <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBooks.length === 0 && !isLoadingMeta && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Tidak ada kitab yang cocok dengan &ldquo;{bookFilterQuery}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. TAB: PENCARIAN GLOBAL                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'cari' && (
        <div className="space-y-4">
          {/* Form Pencarian */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleExecuteGlobalSearch(); }}
            className="space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder={`Cari kata kunci atau nomor hadits ${currentCol.shortName}...`}
                className="w-full h-10 pl-10 pr-20 rounded-xl bg-secondary/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
              />
              <button
                type="submit"
                disabled={isSearchingGlobal || !globalQuery.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gold text-white text-[11px] font-semibold hover:bg-gold/90 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSearchingGlobal ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Cari</span>
                )}
              </button>
            </div>

            {/* Keyword chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground">Contoh:</span>
              {['Niat', 'Sabar', 'Shalat', 'Sedekah', 'Tetangga', 'Senyum', 'Wudhu', '1', '93'].map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => { setGlobalQuery(word); handleExecuteGlobalSearch(word); }}
                  className="px-2.5 py-1 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/50 text-[11px] transition-colors cursor-pointer"
                >
                  {word}
                </button>
              ))}
            </div>
          </form>

          {/* Hasil */}
          {hasSearchedGlobal && (
            <p className="text-[11px] text-muted-foreground border-b border-border/40 pb-2">
              &ldquo;<strong className="text-foreground">{globalQuery}</strong>&rdquo; — {globalSearchResults.length} hadits ditemukan
            </p>
          )}

          {globalSearchResults.length > 0 ? (
            <div className="space-y-3">
              {globalSearchResults.map((res) => {
                const isCopied = copiedId === res.number;
                return (
                  <article
                    key={res.number}
                    className="rounded-2xl border border-border/50 bg-card hover:border-border overflow-hidden transition-all"
                  >
                    <div className={`h-0.5 bg-${accent}/30`} />
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-semibold text-${accent} flex items-center gap-1`}>
                          <ShieldCheck className="h-3 w-3" />
                          HR. {res.collection === 'muslim' ? 'Muslim' : 'Bukhari'} No. {res.number}
                        </span>
                        {res.arabicNumber && (
                          <span className="text-[10px] text-emerald">Baqi #{res.arabicNumber}</span>
                        )}
                        <span className="text-[11px] text-muted-foreground">{res.bookName}</span>
                        <button
                          onClick={() => handleOpenBook(res.bookNumber, res.number)}
                          className="ml-auto inline-flex items-center gap-1 text-[11px] text-gold hover:underline cursor-pointer"
                        >
                          Buka di Kitab <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      {res.arab && (
                        <p
                          className="arabic text-right text-foreground"
                          style={{ fontSize: '1.5rem', lineHeight: 2.2 }}
                          dir="rtl"
                        >
                          {res.arab}
                        </p>
                      )}

                      <p className="text-sm leading-relaxed text-foreground/90 border-t border-border/40 pt-3">
                        &ldquo;{res.text}&rdquo;
                      </p>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        {onExportQuote && (
                          <button
                            type="button"
                            onClick={() => handleShareQuote({ terjemahan: res.text, number: res.number, arabic: res.arab || '' }, res.bookName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
                          >
                            <Share2 className="h-3 w-3" />
                            Bagikan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy({ id: res.text, number: res.number, arab: res.arab || '', arabicNumber: res.arabicNumber }, res.bookName)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer ${
                            isCopied
                              ? 'border-emerald/40 bg-emerald/5 text-emerald'
                              : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {isCopied ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : hasSearchedGlobal && !isSearchingGlobal && (
            <div className="py-12 text-center space-y-2">
              <BookMarked className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Tidak ada hadits yang cocok</p>
              <p className="text-xs text-muted-foreground/70">Coba kata kunci lain seperti "sabar", "sedekah", atau nomor hadits</p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 pt-4 text-[11px] text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
          Tentang Database
        </p>
        <p className="leading-relaxed">
          Shahih Al-Bukhari (~7.589 hadits, 97 kitab) &amp; Shahih Muslim (~7.563 hadits sanad, 57 kitab).
          Teks Arab Utsmani &amp; terjemahan Bahasa Indonesia.
        </p>
      </footer>

    </div>
  );
}
