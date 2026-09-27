import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  HADITH_BUKHARI, 
  HADITH_THEMES, 
  getHadithById, 
  getHadithsByTheme 
} from '../data/hadithData';
import {
  getBukhariMeta,
  getBukhariBook,
  searchBukhariGlobal,
  findBookForHadithNumber,
  getHadithByGlobalNumber
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
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  X,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Library,
  Zap,
  Bookmark,
  Layers
} from 'lucide-react';
import { useToast } from './Toast';

export default function HadithBrowser({ onExportQuote }) {
  const { showToast } = useToast();

  // Mode Navigasi Utama: 'tematik' | 'kitab' | 'cari'
  const [activeTab, setActiveTab] = useState('tematik');

  // State Hadits Tematik
  const [thematicQuery, setThematicQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');

  // State 97 Kitab Bukhari
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

  // Kategori Tema Hadits Pilihan
  const THEME_OPTIONS = [
    { id: 'all', label: 'Semua Mutiara', count: HADITH_BUKHARI.length },
    { id: 'sabar_ujian', label: 'Sabar & Ujian', count: HADITH_THEMES.sabar_ujian?.length || 0 },
    { id: 'rezeki_tawakal', label: 'Rezeki & Tawakal', count: HADITH_THEMES.rezeki_tawakal?.length || 0 },
    { id: 'ketenangan_dzikir', label: 'Ketenangan & Dzikir', count: HADITH_THEMES.ketenangan_dzikir?.length || 0 },
    { id: 'taubat_ampunan', label: 'Taubat & Ampunan', count: HADITH_THEMES.taubat_ampunan?.length || 0 },
    { id: 'keluarga_sosial', label: 'Keluarga & Sosial', count: HADITH_THEMES.keluarga_sosial?.length || 0 },
    { id: 'akhlak_ilmu', label: 'Akhlak & Ilmu', count: HADITH_THEMES.akhlak_ilmu?.length || 0 },
    { id: 'syukur_nikmat', label: 'Syukur & Qana\'ah', count: HADITH_THEMES.syukur_nikmat?.length || 0 },
    { id: 'sakit_sehat', label: 'Sakit & Obat', count: HADITH_THEMES.sakit_sehat?.length || 0 },
    { id: 'niat_ikhlas', label: 'Niat & Amal', count: HADITH_THEMES.niat_ikhlas?.length || 0 },
    { id: 'ibadah_salat', label: 'Salat & Ibadah', count: HADITH_THEMES.ibadah_salat?.length || 0 },
    { id: 'akhirat_dunia', label: 'Akhirat & Kematian', count: HADITH_THEMES.akhirat_dunia?.length || 0 },
  ];

  // Muat metadata 97 kitab saat komponen dimuat atau tab kitab dibuka
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      if (booksMeta.length > 0) return;
      setIsLoadingMeta(true);
      const meta = await getBukhariMeta();
      if (isMounted && meta && meta.books) {
        setBooksMeta(meta.books);
      }
      if (isMounted) setIsLoadingMeta(false);
    }
    loadMeta();
    return () => { isMounted = false; };
  }, [booksMeta.length]);

  // Muat isi kitab saat activeBookId berubah
  useEffect(() => {
    let isMounted = true;
    async function loadBook() {
      if (!activeBookId) {
        setActiveBookData(null);
        return;
      }
      setIsLoadingBook(true);
      setDisplayCount(25);
      const data = await getBukhariBook(activeBookId);
      if (isMounted && data) {
        setActiveBookData(data);
      }
      if (isMounted) setIsLoadingBook(false);
    }
    loadBook();
    return () => { isMounted = false; };
  }, [activeBookId]);

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
    if (isNaN(target) || target < 1 || target > 7563) {
      showToast('Masukkan nomor hadits antara 1 hingga 7563', 'warning');
      return;
    }

    let metaList = booksMeta;
    if (!metaList || !metaList.length) {
      const meta = await getBukhariMeta();
      metaList = meta?.books || [];
      setBooksMeta(metaList);
    }

    const book = findBookForHadithNumber(target, metaList);
    if (book) {
      handleOpenBook(book.bookNumber, target);
      showToast(`Membuka Hadits No. ${target} di Kitab ${book.nameId}`, 'success');
    } else {
      showToast(`Hadits nomor ${target} tidak ditemukan`, 'error');
    }
  };

  // Eksekusi Pencarian Global
  const handleExecuteGlobalSearch = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : globalQuery).trim();
    if (!q) return;

    setIsSearchingGlobal(true);
    setHasSearchedGlobal(true);
    try {
      const results = await searchBukhariGlobal(q, 60);
      setGlobalSearchResults(results);
      if (results.length === 0) {
        showToast(`Tidak ada hadits yang cocok dengan "${q}"`, 'info');
      } else {
        showToast(`Ditemukan ${results.length} hadits Shahih Bukhari`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menjalankan pencarian global', 'error');
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  // Handler Salin Teks Hadits
  const handleCopy = (hadith, bookName = '') => {
    const arab = hadith.arabic || hadith.arab || '';
    const indo = hadith.terjemahan || hadith.id || hadith.text || '';
    const no = hadith.number || hadith.nomor || '';
    const perawi = hadith.perawi ? `(${hadith.perawi})` : '';
    const bName = bookName || hadith.kitab || (activeBookData ? activeBookData.nameId : 'Shahih Bukhari');
    const faedah = hadith.faedah ? `\n\nFaedah: ${hadith.faedah}` : '';

    const text = `${arab}\n\n"${indo}"\n\n— HR. Bukhari No. ${no} ${perawi}\nKitab: ${bName}${faedah}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id || hadith.number || no);
    showToast(`Hadits No. ${no} berhasil disalin ke clipboard`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler Bagikan / Export Quote
  const handleShareQuote = (hadith, bookName = '') => {
    if (!onExportQuote) return;
    const indo = hadith.terjemahan || hadith.id || hadith.text || '';
    const no = hadith.number || hadith.nomor || '';
    const perawi = hadith.perawi ? `(${hadith.perawi})` : '';
    const bName = bookName || hadith.kitab || (activeBookData ? activeBookData.nameId : 'Shahih Bukhari');

    onExportQuote({
      quote: indo,
      author: `HR. Bukhari No. ${no} ${perawi} • ${bName}`,
      arabic: hadith.arabic || hadith.arab || ''
    });
  };

  // Filter Hadits Tematik
  const filteredThematicHadiths = useMemo(() => {
    let list = HADITH_BUKHARI;

    if (selectedTheme !== 'all') {
      const ids = HADITH_THEMES[selectedTheme] || [];
      list = ids.map(id => getHadithById(id)).filter(Boolean);
    }

    const q = thematicQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(h => 
        h.terjemahan.toLowerCase().includes(q) ||
        h.nomor.toLowerCase().includes(q) ||
        h.kitab.toLowerCase().includes(q) ||
        (h.bab && h.bab.toLowerCase().includes(q)) ||
        h.perawi.toLowerCase().includes(q) ||
        h.faedah.toLowerCase().includes(q) ||
        (h.tema_tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedTheme, thematicQuery]);

  // Filter Daftar 97 Kitab
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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 text-foreground space-y-6 animate-fade-up">
      
      {/* ── Header Halaman ────────────────────────────────────────── */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald/15 text-emerald border border-emerald/30 shadow-xs">
              <BookMarked className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground flex items-center gap-2">
                <span>Hadits Riwayat Bukhari</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/25 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Shahih Muttafaq 'Alaih
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Koleksi Lengkap 97 Kitab Shahih Al-Bukhari (~7.589 Hadits) & Mutiara Tematik Bimbingan Hidup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-gold/10 text-gold border border-gold/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>97 Kitab • 7.589 Hadits</span>
            </span>
          </div>
        </div>

        {/* ── Tab Mode Selector ────────────────────────────────────── */}
        <div className="flex items-center p-1 rounded-2xl bg-secondary/70 border border-border/70 text-xs font-medium gap-1">
          <button
            onClick={() => { setActiveTab('tematik'); setActiveBookId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tematik'
                ? 'bg-gold text-white font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hadits Tematik (30)</span>
          </button>

          <button
            onClick={() => setActiveTab('kitab')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'kitab'
                ? 'bg-gold text-white font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Library className="h-3.5 w-3.5" />
            <span>97 Kitab Bukhari</span>
            {booksMeta.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full hidden sm:inline-block ${
                activeTab === 'kitab' ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
              }`}>
                7.589
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('cari'); setActiveBookId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cari'
                ? 'bg-gold text-white font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Pencarian Global</span>
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* 1. TAB: HADITS TEMATIK & MUTIARA HIKMAH                       */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'tematik' && (
        <div className="space-y-5">
          {/* Search Bar Tematik */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={thematicQuery}
                onChange={(e) => setThematicQuery(e.target.value)}
                placeholder="Cari hadits tematik (contoh: sabar, rezeki, niat, nomor hadits)..."
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-secondary/60 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all"
              />
              {thematicQuery && (
                <button
                  onClick={() => setThematicQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Saran Cepat Lompat Nomor jika user mengetik angka */}
            {detectedNumberInThematic && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gold/10 border border-gold/30 text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold flex-shrink-0" />
                  <span>
                    Mencari nomor hadits <strong>No. {detectedNumberInThematic}</strong> di seluruh 7.589 hadits Bukhari?
                  </span>
                </div>
                <button
                  onClick={() => handleJumpToHadithNumber(detectedNumberInThematic)}
                  className="px-3 py-1.5 rounded-xl bg-gold text-white font-semibold hover:bg-gold/90 transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <span>Buka Hadits No. {detectedNumberInThematic}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Tema Pills Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              {THEME_OPTIONS.map((theme) => {
                const isActive = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gold text-white font-semibold shadow-xs'
                        : 'bg-secondary/60 border border-border/60 text-muted-foreground hover:text-foreground hover:border-gold/30'
                    }`}
                  >
                    <span>{theme.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-background/80 text-muted-foreground'
                    }`}>
                      {theme.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Counter */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
            <span>Menampilkan <strong className="text-foreground">{filteredThematicHadiths.length}</strong> hadits mutiara tematik</span>
            {selectedTheme !== 'all' && (
              <button 
                onClick={() => setSelectedTheme('all')}
                className="text-gold hover:underline font-medium cursor-pointer"
              >
                Reset filter tema
              </button>
            )}
          </div>

          {/* List Hadits Tematik */}
          {filteredThematicHadiths.length === 0 ? (
            <div className="noor-card rounded-3xl p-8 text-center space-y-3">
              <BookMarked className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-semibold text-base text-foreground">Tidak Ada Hadits Tematik Ditemukan</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Tidak ditemukan hadits pilihan yang cocok dengan kata kunci "{thematicQuery}". Ingin mencari di seluruh 7.589 hadits Shahih Bukhari?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setGlobalQuery(thematicQuery);
                    setActiveTab('cari');
                    handleExecuteGlobalSearch(thematicQuery);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-white hover:bg-gold/90 transition-all flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Cari di Seluruh 7.589 Hadits</span>
                </button>
                <button
                  onClick={() => { setThematicQuery(''); setSelectedTheme('all'); }}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border/70 text-foreground hover:bg-secondary transition-all"
                >
                  Reset Pencarian
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4.5">
              {filteredThematicHadiths.map((hadith) => {
                const isCopied = copiedId === hadith.id;
                return (
                  <article
                    key={hadith.id}
                    className="da-card grain relative overflow-hidden rounded-3xl p-5 sm:p-6 border transition-all hover:border-gold/40 shadow-xs space-y-4"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.5))',
                      borderColor: 'hsl(var(--gold) / 0.22)'
                    }}
                  >
                    {/* Header Kartu Hadis */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold tracking-wide"
                          style={{
                            background: 'hsl(var(--gold) / 0.12)',
                            color: 'hsl(var(--gold))',
                            border: '1px solid hsl(var(--gold) / 0.3)'
                          }}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span>{hadith.nomor}</span>
                        </span>

                        <span className="text-xs text-muted-foreground font-medium">
                          Dari {hadith.perawi}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                        <span>Kitab: <strong className="text-foreground/90 font-medium">{hadith.kitab}</strong></span>
                        {hadith.bab && <span>• {hadith.bab}</span>}
                      </div>
                    </div>

                    {/* Teks Arab Matan Hadis */}
                    <p
                      className="arabic text-right my-3 text-foreground"
                      style={{ fontSize: '1.65rem', lineHeight: 2.3 }}
                      dir="rtl"
                    >
                      {hadith.arabic}
                    </p>

                    {/* Transliterasi Latin */}
                    {hadith.latin && (
                      <p className="text-xs sm:text-[13px] italic text-muted-foreground/80 text-right leading-relaxed">
                        {hadith.latin}
                      </p>
                    )}

                    <div className="hairline my-2" />

                    {/* Terjemahan Bahasa Indonesia */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                        Terjemahan Matan Hadits
                      </span>
                      <p className="text-sm sm:text-[15px] leading-relaxed text-foreground font-normal">
                        &ldquo;{hadith.terjemahan}&rdquo;
                      </p>
                    </div>

                    {/* Kotak Faedah & Hikmah Hadis */}
                    {hadith.faedah && (
                      <div
                        className="rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-1"
                        style={{
                          background: 'hsl(var(--secondary) / 0.7)',
                          borderLeft: '4px solid hsl(var(--gold))'
                        }}
                      >
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider block"
                          style={{ color: 'hsl(var(--gold))' }}
                        >
                          Faedah & Bimbingan Hikmah:
                        </span>
                        <p className="text-foreground/85 leading-relaxed">
                          {hadith.faedah}
                        </p>
                      </div>
                    )}

                    {/* Tema Tags & Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(hadith.tema_tags || []).slice(0, 4).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            onClick={() => setThematicQuery(tag)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {onExportQuote && (
                          <button
                            type="button"
                            onClick={() => handleShareQuote(hadith)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-all active:scale-95 cursor-pointer"
                            title="Bagikan kartu mutiara hadis"
                          >
                            <Share2 className="h-3.5 w-3.5 text-gold" />
                            <span>Bagikan</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(hadith)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                            isCopied
                              ? 'border-emerald/50 bg-emerald/10 text-emerald'
                              : 'border-border/70 text-muted-foreground hover:border-gold/50 hover:text-foreground'
                          }`}
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{isCopied ? 'Tersalin' : 'Salin Hadits'}</span>
                        </button>
                      </div>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* 2. TAB: 97 KITAB BUKHARI (DAFTAR & READER VIEW)               */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'kitab' && (
        <div className="space-y-5">
          {/* A. TAMPILAN READER JIKA SEBUAH KITAB SEDANG DIBUKA */}
          {activeBookId ? (
            <div className="space-y-4" ref={readerTopRef}>
              {/* Reader Top Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/70 border border-border/70">
                <button
                  onClick={() => { setActiveBookId(null); setTargetHadithNumber(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-gold/40 hover:bg-secondary transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Daftar 97 Kitab</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Prev Book Button */}
                  <button
                    disabled={activeBookId <= 1}
                    onClick={() => handleOpenBook(activeBookId - 1)}
                    className="p-1.5 rounded-xl border border-border/70 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Kitab Sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-bold text-gold px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20">
                    Kitab {activeBookId} / 97
                  </span>

                  {/* Next Book Button */}
                  <button
                    disabled={activeBookId >= 97}
                    onClick={() => handleOpenBook(activeBookId + 1)}
                    className="p-1.5 rounded-xl border border-border/70 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Kitab Berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Book Header Card */}
              {activeBookData && (
                <div
                  className="rounded-3xl p-5 sm:p-6 border space-y-2 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--gold) / 0.08))',
                    borderColor: 'hsl(var(--gold) / 0.3)'
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Shahih Bukhari • Kitab {activeBookData.bookNumber}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {activeBookData.nameId}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border/60">
                      {activeBookData.nameEn}
                    </span>
                    <span>•</span>
                    <span>Rentang: Hadits No. <strong>{activeBookData.firstHadithNumber}</strong> s/d <strong>{activeBookData.lastHadithNumber}</strong></span>
                    <span>•</span>
                    <span className="text-emerald font-medium">{activeBookData.totalHadiths} Hadits Tersedia</span>
                  </div>
                </div>
              )}

              {/* In-Book Search Filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={inBookSearchQuery}
                  onChange={(e) => setInBookSearchQuery(e.target.value)}
                  placeholder={`Cari teks atau nomor di dalam Kitab ${activeBookId}...`}
                  className="w-full h-10 pl-10 pr-10 rounded-2xl bg-secondary/60 border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all"
                />
                {inBookSearchQuery && (
                  <button
                    onClick={() => setInBookSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Loading State Kitab */}
              {isLoadingBook && (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Memuat hadits Kitab {activeBookId}...</p>
                </div>
              )}

              {/* List Hadits di dalam Kitab */}
              {!isLoadingBook && activeBookData && (
                <div className="space-y-4">
                  {filteredInBookHadiths.slice(0, displayCount).map((hadith) => {
                    const isTarget = targetHadithNumber === hadith.number;
                    const isCopied = copiedId === hadith.number;

                    return (
                      <article
                        id={`hadith-num-${hadith.number}`}
                        key={hadith.number}
                        className={`da-card grain relative overflow-hidden rounded-3xl p-5 sm:p-6 border transition-all shadow-xs space-y-4 ${
                          isTarget ? 'ring-2 ring-gold border-gold' : 'hover:border-gold/40'
                        }`}
                        style={{
                          background: isTarget
                            ? 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--gold) / 0.12))'
                            : 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.4))',
                          borderColor: isTarget ? 'hsl(var(--gold))' : 'hsl(var(--gold) / 0.22)'
                        }}
                      >
                        {/* Header Hadits */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/40">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold tracking-wide"
                              style={{
                                background: 'hsl(var(--gold) / 0.12)',
                                color: 'hsl(var(--gold))',
                                border: '1px solid hsl(var(--gold) / 0.3)'
                              }}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>HR. Bukhari No. {hadith.number}</span>
                            </span>

                            {hadith.hadithInBook && (
                              <span className="text-[11px] text-muted-foreground">
                                Hadits #{hadith.hadithInBook} di kitab ini
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-muted-foreground">
                            Kitab {activeBookData.bookNumber}: {activeBookData.nameId}
                          </div>
                        </div>

                        {/* Matan Arab */}
                        <p
                          className="arabic text-right my-3 text-foreground"
                          style={{ fontSize: '1.65rem', lineHeight: 2.3 }}
                          dir="rtl"
                        >
                          {hadith.arab}
                        </p>

                        <div className="hairline my-2" />

                        {/* Terjemahan Bahasa Indonesia */}
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            Terjemahan Bahasa Indonesia
                          </span>
                          <p className="text-sm sm:text-[15px] leading-relaxed text-foreground font-normal">
                            &ldquo;{hadith.id}&rdquo;
                          </p>
                        </div>

                        {/* Footer Tombol Aksi */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/40">
                          {onExportQuote && (
                            <button
                              type="button"
                              onClick={() => handleShareQuote(hadith, activeBookData.nameId)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-all active:scale-95 cursor-pointer"
                              title="Bagikan kutipan hadits"
                            >
                              <Share2 className="h-3.5 w-3.5 text-gold" />
                              <span>Bagikan</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopy(hadith, activeBookData.nameId)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                              isCopied
                                ? 'border-emerald/50 bg-emerald/10 text-emerald'
                                : 'border-border/70 text-muted-foreground hover:border-gold/50 hover:text-foreground'
                            }`}
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin Hadits'}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {/* Tombol Muat Lebih Banyak (Chunking Pagination) */}
                  {displayCount < filteredInBookHadiths.length && (
                    <div className="text-center pt-4 pb-2">
                      <button
                        onClick={() => setDisplayCount(prev => prev + 25)}
                        className="px-6 py-2.5 rounded-2xl bg-secondary/80 border border-border/80 text-xs font-semibold text-foreground hover:bg-gold hover:text-white hover:border-gold transition-all shadow-xs cursor-pointer"
                      >
                        Muat 25 Hadits Berikutnya (Tersisa {filteredInBookHadiths.length - displayCount})
                      </button>
                    </div>
                  )}

                  {filteredInBookHadiths.length === 0 && (
                    <div className="noor-card rounded-2xl p-6 text-center text-xs text-muted-foreground">
                      Tidak ada hadits di dalam kitab ini yang cocok dengan "{inBookSearchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* B. TAMPILAN DAFTAR 97 KITAB (GRID / CARDS) */
            <div className="space-y-4">
              {/* Search Bar Kitab */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={bookFilterQuery}
                  onChange={(e) => setBookFilterQuery(e.target.value)}
                  placeholder="Cari kitab Shahih Bukhari (misal: shalat, puasa, zakat, nikah, tauhid, no. 1)..."
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-secondary/60 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all"
                />
                {bookFilterQuery && (
                  <button
                    onClick={() => setBookFilterQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Pemuatan Meta */}
              {isLoadingMeta && booksMeta.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="h-7 w-7 text-gold animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Memuat indeks 97 Kitab Shahih Bukhari...</p>
                </div>
              )}

              {/* Grid 97 Kitab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredBooks.map((book) => (
                  <div
                    key={book.bookNumber}
                    onClick={() => handleOpenBook(book.bookNumber)}
                    className="da-card grain group relative rounded-2xl p-4 border border-border/60 hover:border-gold/50 hover:bg-secondary/40 transition-all cursor-pointer space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-7 px-2.5 items-center justify-center rounded-lg text-xs font-bold bg-gold/10 text-gold border border-gold/25">
                        Kitab {book.bookNumber}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                        {book.totalHadiths} Hadits
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-gold transition-colors">
                        {book.nameId}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {book.nameEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span>No. {book.firstHadithNumber} – {book.lastHadithNumber}</span>
                      <span className="inline-flex items-center gap-1 text-gold font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>Buka Kitab</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBooks.length === 0 && !isLoadingMeta && (
                <div className="noor-card rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  Tidak ada kitab yang cocok dengan kata kunci "{bookFilterQuery}".
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* 3. TAB: PENCARIAN GLOBAL & LOMPAT NOMOR (7.589 HADITS)         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'cari' && (
        <div className="space-y-5">
          {/* Box Form Pencarian Global */}
          <div className="noor-card rounded-3xl p-5 sm:p-6 border border-border/60 space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-gold" />
                <span>Pencarian Lengkap Shahih Bukhari</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Cari kata kunci teks hadits atau lompat langsung ke nomor hadits tertentu (1 s/d 7563).
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteGlobalSearch();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Ketik kata kunci (misal: tetangga, sedekah, senyum) atau nomor (misal: 299)..."
                  className="w-full h-11 pl-10 pr-24 rounded-2xl bg-secondary/80 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearchingGlobal || !globalQuery.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gold text-white text-xs font-semibold hover:bg-gold/90 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSearchingGlobal ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <span>Cari</span>
                  )}
                </button>
              </div>

              {/* Quick Keyword Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[11px] text-muted-foreground mr-1">Rekomendasi:</span>
                {['Niat', 'Sabar', 'Shalat', 'Sedekah', 'Tetangga', 'Senyum', 'Wudhu', 'Kiamat', '299', '1'].map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      setGlobalQuery(word);
                      handleExecuteGlobalSearch(word);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground hover:text-gold hover:bg-gold/10 border border-border/50 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Status Hasil Pencarian */}
          {hasSearchedGlobal && (
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
              <span>
                Hasil pencarian untuk "<strong className="text-foreground">{globalQuery}</strong>": Ditemukan <strong className="text-foreground">{globalSearchResults.length}</strong> hadits
              </span>
              {globalSearchResults.length > 0 && (
                <span className="text-[11px] text-emerald font-medium">Shahih Bukhari</span>
              )}
            </div>
          )}

          {/* List Hasil Pencarian Global */}
          {globalSearchResults.length > 0 ? (
            <div className="space-y-4">
              {globalSearchResults.map((res) => {
                const isCopied = copiedId === res.number;

                return (
                  <article
                    key={res.number}
                    className="da-card grain relative overflow-hidden rounded-3xl p-5 border border-border/70 hover:border-gold/50 transition-all space-y-3.5 shadow-xs"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.4))'
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold bg-gold/10 text-gold border border-gold/30">
                          <ShieldCheck className="h-3 w-3" />
                          <span>HR. Bukhari No. {res.number}</span>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {res.bookName}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenBook(res.bookNumber, res.number)}
                        className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-semibold cursor-pointer"
                      >
                        <span>Buka di Kitab</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Jika hasil pencarian memuat Arab (misal pencarian nomor) */}
                    {res.arab && (
                      <p
                        className="arabic text-right my-2 text-foreground"
                        style={{ fontSize: '1.5rem', lineHeight: 2.2 }}
                        dir="rtl"
                      >
                        {res.arab}
                      </p>
                    )}

                    <p className="text-sm leading-relaxed text-foreground font-normal">
                      &ldquo;{res.text}&rdquo;
                    </p>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/40">
                      {onExportQuote && (
                        <button
                          type="button"
                          onClick={() => handleShareQuote({
                            terjemahan: res.text,
                            number: res.number,
                            arabic: res.arab || ''
                          }, res.bookName)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-all active:scale-95 cursor-pointer"
                          title="Bagikan kutipan hadits"
                        >
                          <Share2 className="h-3.5 w-3.5 text-gold" />
                          <span>Bagikan</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy({
                          id: res.text,
                          number: res.number,
                          arab: res.arab || ''
                        }, res.bookName)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                          isCopied
                            ? 'border-emerald/50 bg-emerald/10 text-emerald'
                            : 'border-border/70 text-muted-foreground hover:border-gold/50 hover:text-foreground'
                        }`}
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{isCopied ? 'Tersalin' : 'Salin Hadits'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : hasSearchedGlobal && !isSearchingGlobal && (
            <div className="noor-card rounded-2xl p-8 text-center space-y-2">
              <BookMarked className="h-9 w-9 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Tidak Ada Hadits yang Cocok</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Coba gunakan kata kunci lain seperti "sabar", "sedekah", "salat", atau masukkan nomor hadits langsung.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer Penjelasan Database ───────────────────────────── */}
      <footer className="noor-card rounded-2xl p-4 border border-border/50 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald" />
          <span>Tentang Database Shahih Al-Bukhari Al Munawwarah</span>
        </p>
        <p className="leading-relaxed text-[11px]">
          Hadis-hadis dalam database ini mengacu pada kitab <em>Al-Jami' Al-Musnad As-Shahih Al-Mukhtashar</em> karya Imam Al-Bukhari (194–256 H) dengan standar penomoran Fath Al-Bari. Terdiri dari 97 kitab dan 7.589 hadits berderajat Shahih Muttafaq 'Alaih yang menjadi rujukan otoritatif umat Islam sedunia.
        </p>
      </footer>

    </div>
  );
}
