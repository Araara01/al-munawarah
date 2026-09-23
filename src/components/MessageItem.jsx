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
  Sparkles
} from 'lucide-react';
import { useToast } from './Toast';
import { getTafsirIbnuKatsir } from '../services/quranService.js';

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
  const [tafsirSource, setTafsirSource] = useState('ibnu_katsir'); // 'ibnu_katsir' | 'kemenag'
  const [ibnuKatsirMap, setIbnuKatsirMap] = useState({});
  const [loadingIbnuKatsir, setLoadingIbnuKatsir] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const data = typeof message.content === 'object' ? message.content : null;
  const ayahs = data?.ayahs || [];
  const opening = data?.opening || (typeof message.content === 'string' ? message.content : '');
  const hadith = data?.hadith || '';
  const explanation = data?.explanation || '';
  const practicalSteps = data?.practical_steps || [];
  const closing = data?.closing || '';

  // Load Tafsir Ibnu Katsir on demand when Tafsir is opened
  useEffect(() => {
    if (!showTafsir || ayahs.length === 0) return;
    ayahs.forEach(a => {
      const sNum = a.surah_number;
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
    });
  }, [showTafsir, ayahs]);

  const handleToggleAudio = (audioUrl) => {
    if (!audioUrl) { showToast('Audio untuk ayat ini belum tersedia', 'info'); return; }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => { setIsPlaying(false); showToast('Gagal memuat lantunan audio', 'error'); };
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); showToast('Gagal memutar lantunan audio', 'error'); });
    }
  };

  const handleCopyAyah = (ayah) => {
    const text = `${ayah.arabic_text}\n\n"${ayah.translation_id}"\n\n— QS. ${ayah.surah_name}: ${ayah.ayah_number}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Ayat berhasil disalin ke papan klip', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareQuote = (ayah) => {
    onExportQuote?.({
      quote: ayah.translation_id,
      author: `QS. ${ayah.surah_name}: ${ayah.ayah_number}`,
      arabic: ayah.arabic_text
    });
  };

  return (
    <div className="space-y-5 animate-fade-up text-foreground">

      {/* Opening — italic serif, spacious */}
      {opening && (
        <p className="font-cormorant text-[17px] leading-[1.85] text-foreground/90 italic">
          {opening}
        </p>
      )}

      {/* Ayah Cards */}
      {ayahs.map((ayah, idx) => (
        <div key={idx} className="relative animate-bloom" data-testid={`ayah-card-${ayah.surah_number}-${ayah.ayah_number}`}>
          <span className="noor-bloom animate-halo" />

          <article className="da-card grain relative overflow-hidden rounded-3xl p-6 sm:p-8">

            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--gold))' }}>
                  QS. {ayah.surah_name}: {ayah.ayah_number}
                </span>
                {ayah.revelation && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    {ayah.revelation}
                  </span>
                )}
              </div>

              {/* Audio button */}
              <button
                onClick={() => handleToggleAudio(ayah.audio_url)}
                aria-label="Putar bacaan"
                className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-all active:scale-95"
              >
                {isPlaying
                  ? <VolumeX className="h-3.5 w-3.5 animate-pulse" style={{ color: 'hsl(var(--gold))' }} />
                  : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isPlaying ? 'Berhenti' : 'Dengarkan'}</span>
              </button>
            </header>

            {/* Arabic Calligraphy */}
            <p className="arabic mt-8" style={{ fontSize: '2rem', lineHeight: 2.4 }} data-testid="ayah-arabic">
              {ayah.arabic_text}
            </p>

            {/* Latin transliteration */}
            {ayah.latin_text && (
              <p className="mt-2 text-xs italic text-muted-foreground/70 text-right">
                {ayah.latin_text}
              </p>
            )}

            <div className="hairline my-6" />

            {/* Translation */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Terjemahan · Kemenag RI
              </span>
              <p className="mt-2.5 text-base leading-relaxed text-foreground" data-testid="ayah-translation">
                &ldquo;{ayah.translation_id}&rdquo;
              </p>
            </div>

            {/* Tafsir (expandable) */}
            {showTafsir && (() => {
              const isIbnuKatsir = tafsirSource === 'ibnu_katsir';
              const sNum = ayah.surah_number;
              const aNum = ayah.ayah_number;
              const loadedIbnuMap = ibnuKatsirMap[sNum] || {};
              const ibnuText = ayah.tafsir_ibnu_katsir || loadedIbnuMap[aNum] || loadedIbnuMap[String(aNum)] || "";
              const kemenagText = ayah.tafsir_kemenag || ayah.tafsir || "";
              const currentText = isIbnuKatsir ? ibnuText : kemenagText;

              return (
                <div
                  className="mt-5 rounded-2xl p-4 animate-fade-up space-y-3"
                  style={{
                    background: 'hsl(var(--secondary) / 0.6)',
                    border: '1px solid hsl(var(--gold) / 0.18)'
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
                      {isIbnuKatsir ? "Tafsir Al-Qur'an Al-'Azhim" : "Kemenag RI Ringkas"}
                    </span>
                  </div>

                  {/* Tafsir Body */}
                  <div className="max-h-72 overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed text-foreground/85 font-sans space-y-2">
                    {isIbnuKatsir && loadingIbnuKatsir && !ibnuText ? (
                      <p className="italic text-muted-foreground text-xs animate-pulse">
                        Memuat Tafsir Ibnu Katsir...
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
                          ? (kemenagText ? `Tafsir Ibnu Katsir tidak tersedia. Tafsir Kemenag: ${kemenagText}` : "Tafsir untuk ayat ini sedang dipersiapkan.") 
                          : "Tafsir Kemenag untuk ayat ini belum tersedia."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Action toolbar */}
            <footer className="mt-6 flex flex-wrap gap-2">
              {[
                {
                  icon: BookOpen,
                  label: 'Baca Surah',
                  color: 'text-emerald',
                  onClick: () => onOpenSurah?.(ayah.surah_number, ayah.ayah_number)
                },
                {
                  icon: FileText,
                  label: showTafsir ? 'Tutup Tafsir' : 'Tafsir',
                  color: 'text-gold',
                  onClick: () => setShowTafsir(!showTafsir)
                },
                {
                  icon: isSaved ? BookmarkCheck : Bookmark,
                  label: isSaved ? 'Tersimpan' : 'Simpan',
                  color: isSaved ? 'text-gold' : '',
                  active: isSaved,
                  onClick: () => onToggleSave?.(ayah)
                },
                {
                  icon: Share2,
                  label: 'Bagikan',
                  color: 'text-gold',
                  onClick: () => handleShareQuote(ayah)
                },
                {
                  icon: copied ? Check : Copy,
                  label: copied ? 'Tersalin' : 'Salin',
                  color: copied ? 'text-emerald' : '',
                  onClick: () => handleCopyAyah(ayah)
                }
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all active:scale-95 ${
                    btn.active
                      ? 'border-gold/50 bg-gold/8 text-gold'
                      : 'border-border/70 text-muted-foreground hover:border-gold/45 hover:text-foreground'
                  }`}
                  style={btn.active ? { background: 'hsl(var(--gold) / 0.08)' } : {}}
                >
                  <btn.icon className={`h-3.5 w-3.5 ${btn.active ? 'fill-current' : btn.color}`} />
                  <span>{btn.label}</span>
                </button>
              ))}
            </footer>

          </article>
        </div>
      ))}

      {/* Hadith section */}
      {hadith && (
        <div className="da-card grain rounded-3xl p-5 sm:p-6" style={{ border: '1px solid hsl(var(--gold) / 0.2)' }}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Hadits Nabi ﷺ
          </span>
          <p className="mt-2.5 text-sm leading-relaxed text-foreground/90 italic">
            &ldquo;{hadith}&rdquo;
          </p>
        </div>
      )}

      {/* Explanation — with gold left bar */}
      {explanation && (
        <div
          className="da-card rounded-3xl pl-6 pr-5 py-5 sm:pl-7 sm:py-6"
          style={{ borderLeft: '2px solid hsl(var(--gold))' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'hsl(var(--gold))' }}>
            Nasihat Kyai Al Munawwarah
          </span>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>

          {/* Practical steps with golden numbers */}
          {practicalSteps.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'hsl(var(--gold))' }}>
                Langkah Nyata Hari Ini
              </span>
              <ol className="mt-3 space-y-3">
                {practicalSteps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 font-cormorant font-semibold text-sm leading-5 w-6 text-right"
                      style={{ color: 'hsl(var(--gold))' }}
                    >
                      {String(sIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Closing */}
      {closing && (
        <p className="font-cormorant text-[15px] italic text-muted-foreground text-center leading-relaxed px-2">
          {closing}
        </p>
      )}

      {/* Disclaimer */}
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1 border-t border-border/30">
        <Sparkles className="h-3 w-3 flex-shrink-0" style={{ color: 'hsl(var(--gold))' }} />
        <span>Al Munawwarah bukan pengganti ulama, fatwa resmi, atau konsultasi fiqih.</span>
      </p>

    </div>
  );
}
