import React, { useState, useRef, useEffect } from 'react';
import {
  BookmarkCheck,
  Trash2,
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  Share2,
  X,
  Bookmark,
  Pin,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from './Toast';
import { calculateQuranProgress, getAyahAudioUrl } from '../services/quranService';

export default function SavedAyat({
  savedAyahs = [],
  lastRead = null,
  onSetLastRead = null,
  onRemoveAyah,
  onOpenSurah,
  onExportQuote,
  onGoToQuran
}) {
  const { showToast } = useToast();
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAyahKey, setPlayingAyahKey] = useState(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const playAyahAudio = (ay) => {
    const sNum = parseInt(ay.surah_number || ay.surahNumber, 10);
    const aNum = parseInt(ay.ayah_number || ay.ayahNumber, 10);
    const key = `${sNum}:${aNum}`;

    if (playingAyahKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingAyahKey(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audioUrl = getAyahAudioUrl(ay, '05');
    if (!audioUrl) {
      showToast("Audio untuk ayat ini belum tersedia", "error");
      return;
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingAyahKey(key);

    audio.onended = () => {
      setPlayingAyahKey(null);
      audioPlayerRef.current = null;
    };

    audio.onerror = () => {
      showToast("Gagal memutar audio ayat", "error");
      setPlayingAyahKey(null);
      audioPlayerRef.current = null;
    };

    audio.play().catch(() => {
      setPlayingAyahKey(null);
    });
  };

  // Filter saved ayahs based on search
  const filtered = savedAyahs.filter((ay) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const surahName = (ay.surah_name || ay.surahName || '').toLowerCase();
    const translation = (ay.translation_id || '').toLowerCase();
    const arabic = (ay.arabic_text || '').toLowerCase();
    const ayahNum = String(ay.ayah_number || ay.ayahNumber || '');
    return (
      surahName.includes(q) ||
      translation.includes(q) ||
      arabic.includes(q) ||
      ayahNum === q
    );
  });

  const handleCopy = (ay, idx) => {
    const surahName = ay.surah_name || ay.surahName || '';
    const ayahNum = ay.ayah_number || ay.ayahNumber || '';
    const text = [
      ay.arabic_text,
      ay.latin_text ? `\n${ay.latin_text}` : '',
      ay.translation_id ? `\n"${ay.translation_id}"` : '',
      `\n(QS. ${surahName}: ${ayahNum})`
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showToast(`Ayat QS. ${surahName}: ${ayahNum} disalin`, 'success');
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const quranProgress = calculateQuranProgress(lastRead, savedAyahs);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 text-foreground">

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
            <BookmarkCheck className="h-5 w-5" />
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
            Ayat Tersimpan
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {savedAyahs.length > 0
            ? `${savedAyahs.length} ayat telah kamu tandai — tersinkronisasi dengan progres Jelajah Al-Qur'an.`
            : "Simpan ayat-ayat Al-Qur'an yang berkesan agar mudah dibaca kapan saja."}
        </p>

        {/* Quick action: Go to QuranBrowser */}
        {onGoToQuran && (
          <button
            onClick={onGoToQuran}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold text-gold hover:bg-gold/15 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Jelajah Al-Qur'an Lengkap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      {/* Reading Progress Card connected to Jelajah Al-Qur'an */}
      {quranProgress.hasProgress && (
        <div className="noor-card group relative overflow-hidden rounded-3xl border border-gold/40 bg-gold/[0.05] p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Pin className="h-4 w-4 fill-current" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gold">
                  Posisi Tilawah Al-Qur'an Aktif
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                QS. {quranProgress.surahName} : Ayat {quranProgress.currentAyah}
              </h3>
              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Juz {quranProgress.juzNumber}</span>
                <span>•</span>
                <span>{quranProgress.percentage}% Khatam ({quranProgress.cumulativeAyahs.toLocaleString('id-ID')} dari {quranProgress.totalAyahs.toLocaleString('id-ID')} Ayat)</span>
                <span>•</span>
                <span className="text-gold font-medium">{savedAyahs.length} ayat ditandai</span>
              </p>
            </div>

            {onOpenSurah && quranProgress.currentSurah && (
              <button
                onClick={() => onOpenSurah(quranProgress.currentSurah.number, quranProgress.currentAyah)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs shrink-0 self-start sm:self-center"
              >
                <BookOpen className="h-4 w-4" />
                <span>Lanjutkan di Jelajah</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
              <span>Progres Khatam Al-Qur'an (Sesuai yang Ditandai)</span>
              <span className="text-gold font-bold">{quranProgress.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold via-gold-bright to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.max(1, quranProgress.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedAyahs.length === 0 ? (
        <div
          className="noor-card flex flex-col items-center rounded-3xl px-6 py-16 text-center"
          data-testid="saved-empty"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/5 text-gold mb-4">
            <Bookmark className="h-7 w-7" />
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Belum ada ayat tersimpan
          </h3>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Saat membaca atau menjelajahi Al-Qur'an, tekan tombol{' '}
            <strong className="text-gold font-semibold">Bookmark</strong> pada kartu ayat
            untuk menyimpannya ke daftar ini.
          </p>
          {onGoToQuran && (
            <button
              onClick={onGoToQuran}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Mulai Jelajah Al-Qur'an
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          {savedAyahs.length > 2 && (
            <div className="relative mb-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ayat tersimpan (nama surat, terjemahan, nomor)..."
                className="w-full rounded-2xl border border-border/80 bg-secondary/50 py-2.5 pl-4 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              Tidak ada ayat yang cocok dengan pencarian "{searchQuery}".
            </p>
          )}

          {/* Saved Ayah Cards */}
          {filtered.map((ayah, idx) => {
            const surahName = ayah.surah_name || ayah.surahName || 'Unknown';
            const ayahNum = ayah.ayah_number || ayah.ayahNumber;
            const surahNum = ayah.surah_number || ayah.surahNumber;
            const isCurrentReading = lastRead && 
              String(lastRead.surahNumber) === String(surahNum) && 
              String(lastRead.ayahNumber) === String(ayahNum);

            return (
              <div
                key={`${surahNum}-${ayahNum}-${idx}`}
                className={`noor-card group relative rounded-3xl p-5 sm:p-6 space-y-3 transition-all shadow-xs ${
                  isCurrentReading 
                    ? 'border-gold shadow-[0_0_25px_-5px_var(--gold-glow)] bg-gold/[0.04] ring-1 ring-gold/40' 
                    : 'border-border/60 hover:border-gold/40'
                }`}
              >
                {/* Top Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold shrink-0">
                      <BookmarkCheck className="h-3 w-3" />
                      QS. {surahName}: {ayahNum}
                    </span>

                    {isCurrentReading && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-gold shrink-0 animate-pulse">
                        <Pin className="h-3 w-3 fill-current" />
                        Posisi Tilawah Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Play Audio Button */}
                    <button
                      onClick={() => playAyahAudio(ayah)}
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        playingAyahKey === `${surahNum}:${ayahNum}`
                          ? 'bg-gold text-white font-semibold shadow-xs'
                          : 'bg-secondary/80 text-muted-foreground hover:bg-gold/15 hover:text-gold'
                      }`}
                      title={playingAyahKey === `${surahNum}:${ayahNum}` ? "Hentikan Audio" : "Putar Tilawah Ayat"}
                    >
                      {playingAyahKey === `${surahNum}:${ayahNum}` ? (
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

                    {/* Mark as Reading Position / Terakhir Dibaca */}
                    {!isCurrentReading && onSetLastRead && (
                      <button
                        onClick={() => onSetLastRead(ayah)}
                        className="inline-flex items-center gap-1 rounded-xl bg-secondary/80 hover:bg-gold/15 hover:text-gold px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all"
                        title="Tandai sebagai Posisi Bacaan Terakhir Jelajah Al-Qur'an"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Tandai Posisi Baca</span>
                      </button>
                    )}

                    {/* Open in QuranBrowser */}
                    {onOpenSurah && surahNum && (
                      <button
                        onClick={() => onOpenSurah(surahNum, ayahNum)}
                        className="inline-flex items-center gap-1 rounded-xl bg-secondary/80 hover:bg-gold/10 hover:text-gold px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all"
                        title="Buka di Jelajah Al-Qur'an"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Buka Surat</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(ayah, idx)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                      title="Salin Ayat"
                    >
                      {copiedIdx === idx ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Export / Share */}
                    {onExportQuote && ayah.arabic_text && (
                      <button
                        onClick={() =>
                          onExportQuote({
                            arabic: ayah.arabic_text,
                            latin: ayah.latin_text,
                            translation: ayah.translation_id,
                            reference: `QS. ${surahName}: ${ayahNum}`
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-gold transition-all"
                        title="Bagikan Kutipan"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Remove */}
                    {onRemoveAyah && (
                      <button
                        onClick={() => {
                          onRemoveAyah(ayah);
                          showToast('Ayat dihapus dari tersimpan', 'info');
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title="Hapus dari Tersimpan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Arabic Text */}
                {ayah.arabic_text && (
                  <p className="arabic text-right text-xl sm:text-2xl leading-[2.2] text-foreground select-text py-1">
                    {ayah.arabic_text}
                    <span className="inline-block px-2 text-gold text-xl select-none">۝</span>
                  </p>
                )}

                {/* Latin Transliteration */}
                {ayah.latin_text && (
                  <p className="text-xs italic text-muted-foreground/85 leading-relaxed">
                    {ayah.latin_text}
                  </p>
                )}

                {/* Translation */}
                {ayah.translation_id && (
                  <p className="text-sm text-foreground/85 leading-relaxed border-t border-border/30 pt-2">
                    &ldquo;{ayah.translation_id}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
