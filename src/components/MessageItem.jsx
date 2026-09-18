import React, { useState, useRef } from 'react';
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
  ChevronUp
} from 'lucide-react';
import { useToast } from './Toast';

export default function MessageItem({
  message,
  onOpenSurah,
  onExportQuote,
  isSaved = false,
  onToggleSave
}) {
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  const isUser = message.role === 'user';

  // If user message, render bubble
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div 
          className="max-w-[85%] rounded-3xl rounded-br-md border border-gold/20 bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground shadow-xs"
          data-testid="user-message"
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Parse assistant response data
  const data = typeof message.content === 'object' ? message.content : null;
  const ayahs = data?.ayahs || [];
  const opening = data?.opening || (typeof message.content === 'string' ? message.content : '');
  const explanation = data?.explanation || '';
  const practicalSteps = data?.practical_steps || [];
  const closing = data?.closing || '';

  // Audio Playback
  const handleToggleAudio = (audioUrl) => {
    if (!audioUrl) {
      showToast("Audio untuk ayat ini belum tersedia", "info");
      return;
    }

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          showToast("Gagal memuat lantunan audio", "error");
        };
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          showToast("Gagal memutar lantunan audio", "error");
        });
    }
  };

  // Copy Ayah
  const handleCopyAyah = (ayah) => {
    const textToCopy = `${ayah.arabic_text}\n\n"${ayah.translation_id}"\n\n— QS. ${ayah.surah_name}: ${ayah.ayah_number}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Ayat berhasil disalin ke papan klip", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Share quote card
  const handleShareQuote = (ayah) => {
    if (onExportQuote) {
      onExportQuote({
        quote: ayah.translation_id,
        author: `QS. ${ayah.surah_name}: ${ayah.ayah_number}`,
        arabic: ayah.arabic_text
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up text-foreground">
      
      {/* Opening Reflection */}
      {opening && (
        <div className="text-sm sm:text-base leading-relaxed text-foreground/90 font-sans">
          {opening}
        </div>
      )}

      {/* Ayah Cards */}
      {ayahs.map((ayah, idx) => (
        <div key={idx} className="relative animate-bloom" data-testid={`ayah-card-${ayah.surah_number}-${ayah.ayah_number}`}>
          <span className="noor-bloom animate-halo" />

          <article className="noor-card grain relative overflow-hidden rounded-3xl p-5 sm:p-7">
            
            {/* Header: Surah badge, revelation, and audio */}
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold">
                  QS. {ayah.surah_name}: {ayah.ayah_number}
                </span>
                {ayah.revelation && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    {ayah.revelation}
                  </span>
                )}
              </div>

              {/* Audio player button */}
              <button
                onClick={() => handleToggleAudio(ayah.audio_url)}
                aria-label="Putar bacaan"
                className="group flex items-center gap-2 rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold active:scale-95"
              >
                {isPlaying ? (
                  <VolumeX className="h-3.5 w-3.5 text-gold animate-pulse" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
                <span>{isPlaying ? "Berhenti" : "Dengarkan"}</span>
              </button>
            </header>

            {/* Arabic Uthmani Calligraphy */}
            <p className="arabic mt-6 text-2xl sm:text-3xl" data-testid="ayah-arabic">
              {ayah.arabic_text}
            </p>

            {/* Latin Transliteration */}
            {ayah.latin_text && (
              <p className="mt-3 text-xs italic text-muted-foreground">
                {ayah.latin_text}
              </p>
            )}

            <div className="hairline my-5" />

            {/* Indonesian Translation */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Terjemahan · Kemenag RI
              </span>
              <p className="mt-2 text-base leading-relaxed text-foreground" data-testid="ayah-translation">
                "{ayah.translation_id}"
              </p>
            </div>

            {/* Expandable Tafsir Kemenag RI */}
            {showTafsir && ayah.tafsir && (
              <div className="mt-5 rounded-2xl border border-gold/20 bg-secondary/50 p-4 animate-fade-up">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Tafsir · Kemenag RI
                </span>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {ayah.tafsir}
                </p>
              </div>
            )}

            {/* Action Toolbar */}
            <footer className="mt-6 flex flex-wrap gap-2">
              
              {/* Baca Surah */}
              <button
                onClick={() => onOpenSurah && onOpenSurah(ayah.surah_number)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-foreground transition-colors active:scale-95"
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald" />
                <span>Baca Surah</span>
              </button>

              {/* Tafsir Toggle */}
              <button
                onClick={() => setShowTafsir(!showTafsir)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-foreground transition-colors active:scale-95"
              >
                <FileText className="h-3.5 w-3.5 text-gold" />
                <span>{showTafsir ? "Tutup Tafsir" : "Tafsir"}</span>
              </button>

              {/* Simpan Ayat */}
              <button
                onClick={() => {
                  if (onToggleSave) onToggleSave(ayah);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors active:scale-95 ${
                  isSaved 
                    ? 'border-gold/60 text-gold bg-gold/5' 
                    : 'border-border/80 text-muted-foreground hover:border-gold/50 hover:text-foreground'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-3.5 w-3.5 text-gold fill-current" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
                <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
              </button>

              {/* Bagikan Kartu Mutiara */}
              <button
                onClick={() => handleShareQuote(ayah)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-foreground transition-colors active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5 text-gold" />
                <span>Bagikan</span>
              </button>

              {/* Salin Teks */}
              <button
                onClick={() => handleCopyAyah(ayah)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>

            </footer>

          </article>
        </div>
      ))}

      {/* Penjelasan Sederhana Al Munawwarah */}
      {explanation && (
        <div className="noor-card rounded-3xl p-5 sm:p-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Penjelasan Sederhana Al Munawwarah
          </span>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>

          {/* Practical Steps */}
          {practicalSteps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Langkah Nyata Hari Ini
              </span>
              <ul className="mt-2.5 space-y-2">
                {practicalSteps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Closing Soothing Words */}
      {closing && (
        <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
          {closing}
        </p>
      )}

      {/* Disclaimer footnote */}
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-2 border-t border-border/40">
        <Sparkles className="h-3 w-3 text-gold shrink-0" />
        <span>Al Munawwarah bukan pengganti ulama, fatwa resmi, atau konsultasi fiqih.</span>
      </p>

    </div>
  );
}
