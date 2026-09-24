import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  FileText,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  Database,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useToast } from './Toast';
import { getTafsirIbnuKatsir, getSurahMeta } from '../services/quranService.js';

export default function MessageItem({
  message,
  onOpenSurah,
  onExportQuote,
  isSaved = false,
  onToggleSave
}) {
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAyahDropdown, setShowAyahDropdown] = useState(false);
  const [showDetailDropdown, setShowDetailDropdown] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirSource, setTafsirSource] = useState('ibnu_katsir'); // 'ibnu_katsir' | 'kemenag'
  const [ibnuKatsirMap, setIbnuKatsirMap] = useState({});
  const [loadingIbnuKatsir, setLoadingIbnuKatsir] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const audioRef = useRef(null);

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div
          className="max-w-[82%] rounded-3xl rounded-br-lg px-5 py-3.5 text-sm leading-relaxed text-foreground shadow-sm"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--elevated)))',
            border: '1px solid hsl(var(--gold) / 0.15)'
          }}
          data-testid="user-message"
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message data decomposition
  const data = typeof message.content === 'object' ? message.content : null;
  const ayahs = data?.ayahs || [];
  const primaryAyah = ayahs[0] || null;

  // 1. Jawaban Singkat On Point
  const shortAnswer = (
    data?.short_answer ||
    data?.opening ||
    (typeof message.content === 'string' ? message.content : '')
  ).trim();

  // 2. Al-Qur'an Yang Cocok (Surah metadata)
  const rawSurahInfo = data?.surah_info || null;
  const fallbackMeta = primaryAyah ? getSurahMeta(primaryAyah.surah_number) : null;

  const resolvedSurahInfo = rawSurahInfo || (primaryAyah ? {
    number: primaryAyah.surah_number,
    name: primaryAyah.surah_name || fallbackMeta?.name || `Surah ${primaryAyah.surah_number}`,
    arabic: primaryAyah.surah_arabic || fallbackMeta?.arabic || '',
    translation: primaryAyah.surah_translation || fallbackMeta?.translation || '',
    revelation: primaryAyah.revelation || fallbackMeta?.revelation || 'MAKKIYYAH',
    numberOfAyahs: primaryAyah.total_ayahs || fallbackMeta?.numberOfAyahs || '',
    ayah_number: String(primaryAyah.ayah_number || '1'),
    relevance: primaryAyah.tafsir
      ? `Rujukan kalamullah terpercaya yang menenteramkan dan menuntun jalan keluar atas permasalahan ini.`
      : `Surah pilihan dari Al-Qur'an yang relevan dengan pertanyaan Anda.`
  } : null);

  // 3. Jawaban Detail & Bimbingan Lengkap
  const detailedAnswer = (data?.detailed_answer || data?.explanation || '').trim();
  const hadith = (data?.hadith || '').trim();
  const practicalSteps = data?.practical_steps || [];
  const closing = (data?.closing || '').trim();
  const isDatabaseConnected = data?.isDatabaseConnected || !!primaryAyah?.fromDatabase;

  // Load Tafsir Ibnu Katsir on demand when Tafsir is opened inside Ayah dropdown
  useEffect(() => {
    if (!showTafsir || !primaryAyah) return;
    const sNum = primaryAyah.surah_number;
    if (sNum && !ibnuKatsirMap[sNum]) {
      setLoadingIbnuKatsir(true);
      getTafsirIbnuKatsir(sNum)
        .then(map => {
          setIbnuKatsirMap(prev => ({ ...prev, [sNum]: map }));
        })
        .catch(err => {
          console.error("Gagal memuat Tafsir Ibnu Katsir:", err);
        })
        .finally(() => {
          setLoadingIbnuKatsir(false);
        });
    }
  }, [showTafsir, primaryAyah, ibnuKatsirMap]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = (audioUrl) => {
    if (!audioUrl) {
      showToast('Audio untuk ayat ini belum tersedia', 'info');
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          showToast('Gagal memuat lantunan audio', 'error');
        };
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          showToast('Gagal memutar lantunan audio', 'error');
        });
    }
  };

  const handleCopyAyah = (ayah) => {
    if (!ayah) return;
    const text = `${ayah.arabic_text}\n\n"${ayah.translation_id}"\n\n— QS. ${ayah.surah_name}: ${ayah.ayah_number}`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(true);
    showToast('Ayat berhasil disalin ke papan klip', 'success');
    setTimeout(() => setCopiedAyah(false), 2000);
  };

  const handleCopyShortAnswer = () => {
    if (!shortAnswer) return;
    navigator.clipboard.writeText(shortAnswer);
    setCopiedShort(true);
    showToast('Jawaban singkat berhasil disalin', 'success');
    setTimeout(() => setCopiedShort(false), 2000);
  };

  const handleShareQuote = (ayah) => {
    if (!ayah) return;
    onExportQuote?.({
      quote: ayah.translation_id,
      author: `QS. ${ayah.surah_name}: ${ayah.ayah_number}`,
      arabic: ayah.arabic_text
    });
  };

  return (
    <div className="space-y-4 animate-fade-up text-foreground">

      {/* ─────────────────────────────────────────────────────────────
          1. JAWABAN SINGKAT ON POINT
          ───────────────────────────────────────────────────────────── */}
      {shortAnswer && (
        <div
          className="da-card grain relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all shadow-xs"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.55))',
            border: '1px solid hsl(var(--gold) / 0.28)'
          }}
          data-testid="short-answer-card"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
              style={{
                borderColor: 'hsl(var(--gold) / 0.4)',
                background: 'hsl(var(--gold) / 0.1)',
                color: 'hsl(var(--gold))'
              }}
            >
              <Sparkles className="h-3 w-3" />
              <span>Jawaban Singkat · On Point</span>
            </div>

            <button
              type="button"
              onClick={handleCopyShortAnswer}
              title="Salin jawaban singkat"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            >
              {copiedShort ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">{copiedShort ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/95 font-medium">
            {shortAnswer}
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. AL-QUR'AN YANG COCOK DENGAN PERMASALAHAN
             - Tampilkan Suratnya Saja terlebih dahulu
             - Disertai button dropdown untuk melihat ayat tersebut
             - Tersambung dengan database Al-Qur'an
          ───────────────────────────────────────────────────────────── */}
      {resolvedSurahInfo && (
        <div
          className="da-card grain relative overflow-hidden rounded-2xl border transition-all shadow-xs"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.7), hsl(var(--card)))',
            borderColor: showAyahDropdown ? 'hsl(var(--gold) / 0.45)' : 'hsl(var(--gold) / 0.22)'
          }}
          data-testid="surah-matching-card"
        >
          {/* Header Card: Menampilkan Surahnya Saja */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
                  style={{
                    borderColor: 'hsl(var(--gold) / 0.35)',
                    background: 'hsl(var(--gold) / 0.12)',
                    color: 'hsl(var(--gold))'
                  }}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Al-Qur'an Terkait Permasalahan</span>
                </span>

                {isDatabaseConnected && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: 'hsl(var(--emerald) / 0.1)',
                      color: 'hsl(var(--emerald))',
                      border: '1px solid hsl(var(--emerald) / 0.25)'
                    }}
                    title="Terhubung ke Database Al-Qur'an (Tafsir Ibnu Katsir & Kemenag RI)"
                  >
                    <Database className="h-2.5 w-2.5" />
                    <span>Database Terhubung</span>
                  </span>
                )}
              </div>

              {resolvedSurahInfo.revelation && (
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  {resolvedSurahInfo.revelation} {resolvedSurahInfo.numberOfAyahs ? `• ${resolvedSurahInfo.numberOfAyahs} Ayat` : ''}
                </span>
              )}
            </div>

            {/* Nama Surah & Kaligrafi Arab */}
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <span>QS. {resolvedSurahInfo.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gold/10 text-gold border border-gold/20">
                    Ayat {resolvedSurahInfo.ayah_number}
                  </span>
                </h3>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>Surat ke-{resolvedSurahInfo.number}</span>
                  {resolvedSurahInfo.translation && (
                    <>
                      <span>•</span>
                      <span>Arti: &ldquo;{resolvedSurahInfo.translation}&rdquo;</span>
                    </>
                  )}
                </div>
              </div>

              {resolvedSurahInfo.arabic && (
                <span className="arabic text-2xl text-gold font-normal leading-none select-none" dir="rtl">
                  {resolvedSurahInfo.arabic}
                </span>
              )}
            </div>

            {/* Keterangan Relevansi / Kenapa Surah ini Cocok */}
            {resolvedSurahInfo.relevance && (
              <div className="mt-3 rounded-xl p-3 border border-gold/15 bg-gold/5 text-xs sm:text-[13px] text-foreground/85 leading-relaxed">
                <span className="font-semibold text-gold block mb-0.5 text-[11px] uppercase tracking-wider">
                  Hikmah Kecocokan Surah:
                </span>
                <p>&ldquo;{resolvedSurahInfo.relevance}&rdquo;</p>
              </div>
            )}

            {/* Button Dropdown untuk memunculkan teks ayat Al-Qur'an */}
            <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAyahDropdown(!showAyahDropdown)}
                className={`flex-1 flex items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  showAyahDropdown
                    ? 'bg-gold text-white shadow-xs font-semibold'
                    : 'border border-gold/35 bg-gold/10 text-foreground hover:bg-gold/20 active:scale-[0.99]'
                }`}
                data-testid="toggle-ayah-dropdown-btn"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>
                    {showAyahDropdown
                      ? `Tutup Teks Ayat (${resolvedSurahInfo.name}: ${resolvedSurahInfo.ayah_number})`
                      : `Lihat Teks & Terjemahan Ayat (${resolvedSurahInfo.name}: ${resolvedSurahInfo.ayah_number})`}
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${showAyahDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {primaryAyah && onOpenSurah && (
                <button
                  type="button"
                  onClick={() => onOpenSurah(resolvedSurahInfo.number, parseInt(resolvedSurahInfo.ayah_number, 10) || 1)}
                  title="Buka seluruh surat di Jelajah Al-Qur'an"
                  className="flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-all active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Jelajah Surah</span>
                </button>
              )}
            </div>
          </div>

          {/* Konten Dropdown Ayat (Ketika dibuka / expanded) */}
          {showAyahDropdown && primaryAyah && (
            <div
              className="border-t border-border/40 p-4 sm:p-6 bg-card/90 animate-fade-down space-y-4"
              data-testid={`ayah-card-${primaryAyah.surah_number}-${primaryAyah.ayah_number}`}
            >
              {/* Header Ayat di dalam dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    QS. {resolvedSurahInfo.name} : Ayat {resolvedSurahInfo.ayah_number}
                  </span>
                  <span className="text-[10px] text-muted-foreground">· Kemenag RI</span>
                </div>

                {/* Audio button */}
                {primaryAyah.audio_url && (
                  <button
                    type="button"
                    onClick={() => handleToggleAudio(primaryAyah.audio_url)}
                    aria-label="Putar lantunan ayat"
                    className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold hover:bg-gold/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? (
                      <VolumeX className="h-3.5 w-3.5 animate-pulse text-gold" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                    <span>{isPlaying ? 'Berhenti' : 'Putar Murottal'}</span>
                  </button>
                )}
              </div>

              {/* Teks Arab Utsmani */}
              <p
                className="arabic text-right my-4"
                style={{ fontSize: '1.9rem', lineHeight: 2.3 }}
                data-testid="ayah-arabic"
              >
                {primaryAyah.arabic_text}
              </p>

              {/* Transliterasi Latin */}
              {primaryAyah.latin_text && (
                <p className="text-xs sm:text-[13px] italic text-muted-foreground/80 text-right leading-relaxed" data-testid="ayah-latin">
                  {primaryAyah.latin_text}
                </p>
              )}

              <div className="hairline my-3" />

              {/* Terjemahan Resmi Kemenag RI */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Terjemahan Resmi Kementerian Agama RI
                </span>
                <p
                  className="mt-1.5 text-sm sm:text-base leading-relaxed text-foreground font-normal"
                  data-testid="ayah-translation"
                >
                  &ldquo;{primaryAyah.translation_id}&rdquo;
                </p>
              </div>

              {/* Tafsir (expandable inside Ayah card) */}
              {showTafsir && (() => {
                const isIbnuKatsir = tafsirSource === 'ibnu_katsir';
                const sNum = primaryAyah.surah_number;
                const aNum = primaryAyah.ayah_number;
                const loadedIbnuMap = ibnuKatsirMap[sNum] || {};
                const ibnuText =
                  primaryAyah.tafsir_ibnu_katsir ||
                  loadedIbnuMap[aNum] ||
                  loadedIbnuMap[String(aNum)] ||
                  loadedIbnuMap[parseInt(aNum, 10)] ||
                  "";
                const kemenagText = primaryAyah.tafsir_kemenag || primaryAyah.tafsir || "";
                const currentText = isIbnuKatsir ? ibnuText : kemenagText;

                return (
                  <div
                    className="mt-4 rounded-2xl p-4 animate-fade-up space-y-3"
                    style={{
                      background: 'hsl(var(--secondary) / 0.65)',
                      border: '1px solid hsl(var(--gold) / 0.2)'
                    }}
                  >
                    {/* Source Switcher */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2">
                      <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-xl border border-border/50 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTafsirSource('ibnu_katsir')}
                          className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                            isIbnuKatsir
                              ? 'bg-gold text-white shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Ibnu Katsir
                        </button>
                        <button
                          type="button"
                          onClick={() => setTafsirSource('kemenag')}
                          className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                            !isIbnuKatsir
                              ? 'bg-gold text-white shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Kemenag RI
                        </button>
                      </div>

                      <span className="text-[10px] text-gold/80 font-medium tracking-wider uppercase">
                        {isIbnuKatsir ? "Tafsir Ibnu Katsir (Lokal)" : "Tafsir Ringkas Kemenag"}
                      </span>
                    </div>

                    {/* Tafsir Body */}
                    <div className="max-h-72 overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed text-foreground/85 space-y-2">
                      {isIbnuKatsir && loadingIbnuKatsir && !ibnuText ? (
                        <p className="italic text-muted-foreground text-xs animate-pulse">
                          Memuat Tafsir Ibnu Katsir dari database lokal...
                        </p>
                      ) : currentText ? (
                        currentText.split('\n\n').map((para, pIdx) => {
                          const trimmed = para.trim();
                          if (!trimmed) return null;
                          return <p key={pIdx}>{trimmed}</p>;
                        })
                      ) : (
                        <p className="text-muted-foreground text-xs italic">
                          {isIbnuKatsir
                            ? (kemenagText
                                ? `Tafsir Ibnu Katsir tidak tersedia. Rujukan Kemenag: ${kemenagText}`
                                : "Tafsir untuk ayat ini sedang dipersiapkan.")
                            : "Tafsir Kemenag untuk ayat ini belum tersedia."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action Toolbar di dalam dropdown ayat */}
              <div className="mt-4 pt-3 flex flex-wrap gap-2 border-t border-border/30">
                {[
                  {
                    icon: BookOpen,
                    label: 'Buka di Al-Qur\'an',
                    color: 'text-emerald',
                    onClick: () =>
                      onOpenSurah?.(
                        primaryAyah.surah_number,
                        parseInt(primaryAyah.ayah_number, 10) || 1
                      )
                  },
                  {
                    icon: FileText,
                    label: showTafsir ? 'Tutup Tafsir' : 'Buka Tafsir',
                    color: 'text-gold',
                    onClick: () => setShowTafsir(!showTafsir)
                  },
                  {
                    icon: isSaved ? BookmarkCheck : Bookmark,
                    label: isSaved ? 'Tersimpan' : 'Simpan Ayat',
                    color: isSaved ? 'text-gold' : '',
                    active: isSaved,
                    onClick: () => onToggleSave?.(primaryAyah)
                  },
                  {
                    icon: Share2,
                    label: 'Bagikan',
                    color: 'text-gold',
                    onClick: () => handleShareQuote(primaryAyah)
                  },
                  {
                    icon: copiedAyah ? Check : Copy,
                    label: copiedAyah ? 'Tersalin' : 'Salin Ayat',
                    color: copiedAyah ? 'text-emerald' : '',
                    onClick: () => handleCopyAyah(primaryAyah)
                  }
                ].map((btn, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={btn.onClick}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all active:scale-95 cursor-pointer ${
                      btn.active
                        ? 'border-gold/50 bg-gold/10 text-gold font-medium'
                        : 'border-border/70 text-muted-foreground hover:border-gold/45 hover:text-foreground'
                    }`}
                  >
                    <btn.icon className={`h-3.5 w-3.5 ${btn.active ? 'fill-current' : btn.color}`} />
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. JAWABAN DETAIL & BIMBINGAN LENGKAP
             - Opsi di bawah jawaban pertama disertai button dropdown
             - Berisi penjelasan mendalam, Hadits Nabi ﷺ, langkah praktis, dan doa
          ───────────────────────────────────────────────────────────── */}
      {(detailedAnswer || hadith || practicalSteps.length > 0) && (
        <div
          className="da-card grain relative overflow-hidden rounded-2xl border transition-all shadow-xs"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.45))',
            borderColor: showDetailDropdown ? 'hsl(var(--gold) / 0.45)' : 'hsl(var(--border) / 0.7)'
          }}
          data-testid="detailed-answer-card"
        >
          {/* Button Dropdown: Toggle Jawaban Detail */}
          <button
            type="button"
            onClick={() => setShowDetailDropdown(!showDetailDropdown)}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gold/5 cursor-pointer"
            data-testid="toggle-detail-dropdown-btn"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'hsl(var(--gold) / 0.12)',
                  border: '1px solid hsl(var(--gold) / 0.3)',
                  color: 'hsl(var(--gold))'
                }}
              >
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {showDetailDropdown ? 'Tutup Bimbingan & Nasihat Lengkap' : 'Lihat Bimbingan & Nasihat Lengkap'}
                  </span>
                  <span
                    className="text-[10px] rounded-md px-1.5 py-0.5 font-medium"
                    style={{
                      background: 'hsl(var(--gold) / 0.15)',
                      color: 'hsl(var(--gold))'
                    }}
                  >
                    Opsi Detail
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uraian hikmah mendalam Kyai, landasan hadits Nabi ﷺ & amalan praktis
                </p>
              </div>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                showDetailDropdown ? 'rotate-180 text-gold' : ''
              }`}
            />
          </button>

          {/* Konten Dropdown Jawaban Detail (Ketika dibuka / expanded) */}
          {showDetailDropdown && (
            <div className="border-t border-border/40 p-4 sm:p-6 space-y-5 bg-secondary/35 animate-fade-down">

              {/* Nasihat & Penjelasan Mendalam */}
              {detailedAnswer && (
                <div
                  className="pl-4 sm:pl-5 border-l-2 space-y-2"
                  style={{ borderLeftColor: 'hsl(var(--gold))' }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'hsl(var(--gold))' }}
                  >
                    Nasihat Mendalam Kyai Al Munawwarah
                  </span>
                  <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-2.5">
                    {detailedAnswer.split('\n\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;
                      return <p key={pIdx}>{trimmed}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* Hadits Pendukung */}
              {hadith && (
                <div
                  className="da-card rounded-xl p-4 border bg-background/70 space-y-1.5"
                  style={{ borderColor: 'hsl(var(--gold) / 0.25)' }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
                    Hadits Nabi ﷺ
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 italic">
                    &ldquo;{hadith}&rdquo;
                  </p>
                </div>
              )}

              {/* Langkah Amalan Nyata */}
              {practicalSteps.length > 0 && (
                <div className="pt-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-2.5"
                    style={{ color: 'hsl(var(--gold))' }}
                  >
                    Langkah Nyata Hari Ini
                  </span>
                  <ol className="space-y-2.5">
                    {practicalSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 font-cormorant font-semibold text-sm w-5 text-right"
                          style={{ color: 'hsl(var(--gold))' }}
                        >
                          {String(sIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Doa Penutup */}
              {closing && (
                <p className="font-cormorant text-[15px] italic text-muted-foreground text-center leading-relaxed pt-3 border-t border-border/30">
                  {closing}
                </p>
              )}

            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER DISCLAIMER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-1 border-t border-border/25">
        <p className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 flex-shrink-0" style={{ color: 'hsl(var(--gold))' }} />
          <span>Al Munawwarah bukan pengganti ulama resmi, fatwa syariah, atau konsultasi fiqih.</span>
        </p>
      </div>

    </div>
  );
}
