import React, { useState, useMemo } from 'react';
import { 
  HADITH_BUKHARI, 
  HADITH_THEMES, 
  getHadithById, 
  getHadithsByTheme 
} from '../data/hadithData';
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
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { useToast } from './Toast';

export default function HadithBrowser({ onExportQuote }) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Kategori Tema
  const THEME_OPTIONS = [
    { id: 'all', label: 'Semua Hadits', count: HADITH_BUKHARI.length },
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

  // Filter Data
  const filteredHadiths = useMemo(() => {
    let list = HADITH_BUKHARI;

    // Filter berdasarkan tema
    if (selectedTheme !== 'all') {
      const ids = HADITH_THEMES[selectedTheme] || [];
      list = ids.map(id => getHadithById(id)).filter(Boolean);
    }

    // Filter berdasarkan pencarian
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(h => 
        h.terjemahan.toLowerCase().includes(q) ||
        h.nomor.toLowerCase().includes(q) ||
        h.kitab.toLowerCase().includes(q) ||
        (h.bab && h.bab.toLowerCase().includes(q)) ||
        h.perawi.toLowerCase().includes(q) ||
        h.faedah.toLowerCase().includes(q) ||
        (h.tema_tags || []).some(t => t.toLowerCase().includes(q)) ||
        (h.latin && h.latin.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedTheme, searchQuery]);

  // Handler Salin
  const handleCopy = (hadith) => {
    const text = `${hadith.arabic}\n\n"${hadith.terjemahan}"\n\n— ${hadith.nomor} (${hadith.perawi})\nKitab: ${hadith.kitab}\n\nFaedah: ${hadith.faedah}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    showToast(`${hadith.nomor} berhasil disalin ke papan klip`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler Bagikan / Export Quote
  const handleShareQuote = (hadith) => {
    if (!onExportQuote) return;
    onExportQuote({
      quote: hadith.terjemahan,
      author: `${hadith.nomor} (${hadith.perawi})`,
      arabic: hadith.arabic
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 text-foreground space-y-6 animate-fade-up">
      
      {/* ── Header Halaman ────────────────────────────────────────── */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald/15 text-emerald border border-emerald/30 shadow-xs">
              <BookMarked className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground flex items-center gap-2">
                <span>Hadits Riwayat Bukhari</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/25 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Shahih
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Koleksi hadis pilihan dari Kitab Shahih Al-Bukhari (Jami' Al-Shahih) lengkap dengan teks Arab, terjemahan, dan faedah bimbingan hidup.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-gold/10 text-gold border border-gold/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{HADITH_BUKHARI.length} Hadits Shahih</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Search Bar & Filter ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hadis berdasarkan topik, kata kunci, perawi, nomor (contoh: sabar, rezeki, No. 1)..."
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-secondary/60 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Tema Pills Filter ─────────────────────────────────── */}
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

      {/* ── Counter & Info Bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
        <span>Menampilkan <strong className="text-foreground">{filteredHadiths.length}</strong> hadits</span>
        {selectedTheme !== 'all' && (
          <button 
            onClick={() => setSelectedTheme('all')}
            className="text-gold hover:underline font-medium"
          >
            Reset filter tema
          </button>
        )}
      </div>

      {/* ── Hadith List ─────────────────────────────────────────── */}
      {filteredHadiths.length === 0 ? (
        <div className="noor-card rounded-3xl p-8 text-center space-y-3">
          <BookMarked className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-semibold text-base text-foreground">Tidak Ada Hadits Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Tidak ditemukan hadits riwayat Bukhari yang cocok dengan kata kunci "{searchQuery}". Coba gunakan kata kunci lain seperti "sabar", "rezeki", "hati", atau "doa".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTheme('all'); }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-white hover:bg-gold/90 transition-all"
          >
            Lihat Seluruh Hadits
          </button>
        </div>
      ) : (
        <div className="space-y-4.5">
          {filteredHadiths.map((hadith) => {
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
                        onClick={() => setSearchQuery(tag)}
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

      {/* ── Footer Penjelasan Database ───────────────────────────── */}
      <footer className="noor-card rounded-2xl p-4 border border-border/50 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald" />
          <span>Tentang Database Shahih Al-Bukhari Al Munawwarah</span>
        </p>
        <p className="leading-relaxed text-[11px]">
          Hadis-hadis dalam database ini mengacu pada kitab <em>Al-Jami' Al-Musnad As-Shahih Al-Mukhtashar</em> karya Imam Al-Bukhari (194–256 H) dengan standar penomoran Fath Al-Bari. Seluruh riwayat berderajat Shahih Muttafaq 'Alaih yang menjadi rujukan otoritatif umat Islam sedunia.
        </p>
      </footer>

    </div>
  );
}
