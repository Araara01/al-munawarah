import React, { useState, useRef } from 'react';
import { SURAH_LIST, THEMES, POPULAR_AYAHS } from '../data/quranData';
import { Search, BookOpen, Volume2, VolumeX, Sparkles, X, ChevronRight } from 'lucide-react';
import { useToast } from './Toast';

export default function QuranBrowser({ initialSurahNumber = null, onOpenSurahDetail }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('surat'); // 'surat' or 'tema'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [activeAudioSurah, setActiveAudioSurah] = useState(null);
  const [selectedSurahModal, setSelectedSurahModal] = useState(null);
  const audioRef = useRef(null);

  // Filter surahs
  const filteredSurahs = SURAH_LIST.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      s.translation.toLowerCase().includes(q) ||
      String(s.number) === q;
  });

  // Handle Play/Stop Surah Audio
  const handleToggleSurahAudio = (e, surahNumber) => {
    e.stopPropagation();
    if (activeAudioSurah === surahNumber) {
      if (audioRef.current) audioRef.current.pause();
      setActiveAudioSurah(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const padded = String(surahNumber).padStart(3, '0');
      const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setActiveAudioSurah(null);
      audioRef.current.onerror = () => {
        setActiveAudioSurah(null);
        showToast("Audio surat belum dapat dimuat", "error");
      };
      audioRef.current.play()
        .then(() => {
          setActiveAudioSurah(surahNumber);
          showToast(`Memutar Surat ke-${surahNumber}`, "info");
        })
        .catch(() => {
          setActiveAudioSurah(null);
          showToast("Gagal memutar audio surat", "error");
        });
    }
  };

  const openSurahDetail = (surah) => {
    // Find ayahs in popular list or synthesize surah view
    const relatedAyahs = POPULAR_AYAHS.filter(a => a.surah_number === surah.number);
    setSelectedSurahModal({
      ...surah,
      ayahs: relatedAyahs.length > 0 ? relatedAyahs : [
        {
          surah_number: surah.number,
          surah_name: surah.name,
          ayah_number: "1",
          revelation: surah.revelation.toUpperCase(),
          arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          latin_text: "Bismillāhir-raḥmānir-raḥīm",
          translation_id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
          tafsir: "Kalimat pembuka yang penuh berkah, mengingatkan bahwa setiap perbuatan mulia hendaknya dimulai dengan kesadaran akan kasih sayang Tuhan.",
          audio_url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3`
        }
      ]
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 text-foreground">
      
      {/* Header */}
      <header className="mb-6 space-y-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
          Jelajahi Al-Qur'an
        </h2>
        <p className="text-sm text-muted-foreground">
          Telusuri 114 Surat Al-Qur'an, dengarkan lantunan tilawah merdu, atau pelajari ayat per tema kehidupan.
        </p>
      </header>

      {/* Tab Switcher & Search Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <button
            onClick={() => setActiveTab('surat')}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
              activeTab === 'surat'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            Per Surat (114)
          </button>
          <button
            onClick={() => setActiveTab('tema')}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
              activeTab === 'tema'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            Per Tema Kehidupan
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'surat' ? "Cari nomor atau nama surat (misal: Al-Baqarah, Yasin)..." : "Cari tema kehidupan..."}
            className="flex w-full border border-border/80 pl-10 pr-4 py-2.5 shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-2xl bg-secondary/50 text-xs sm:text-sm text-foreground"
          />
        </div>
      </div>

      {/* Tab Content: Surat */}
      {activeTab === 'surat' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredSurahs.map((surah) => {
            const isPlayingThis = activeAudioSurah === surah.number;
            return (
              <div
                key={surah.number}
                onClick={() => openSurahDetail(surah)}
                className="noor-card group flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/5 text-xs font-semibold text-gold">
                    {surah.number}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                        {surah.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary">
                        {surah.revelation === 'Makkiyyah' ? 'Mkk' : 'Mdn'}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {surah.translation} · {surah.numberOfAyahs} ayat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <span className="arabic text-lg sm:text-xl font-normal text-gold select-none">
                    {surah.arabic}
                  </span>
                  <button
                    onClick={(e) => handleToggleSurahAudio(e, surah.number)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                    title={isPlayingThis ? "Hentikan Tilawah" : "Putar Tilawah Surat"}
                  >
                    {isPlayingThis ? (
                      <VolumeX className="h-4 w-4 text-gold animate-pulse" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Tema */}
      {activeTab === 'tema' && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((th) => {
              const isSelected = selectedTheme?.id === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th)}
                  className={`noor-card p-5 rounded-3xl text-left transition-all hover:-translate-y-0.5 ${
                    isSelected ? 'border-gold/70 shadow-[0_0_30px_-10px_var(--gold-glow)] ring-1 ring-gold/40' : ''
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
            <div className="mt-8 space-y-4 pt-6 border-t border-border/60 animate-fade-up">
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
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        {ay.revelation}
                      </span>
                    </div>
                    <p className="arabic text-2xl text-right">{ay.arabic_text}</p>
                    <p className="text-xs italic text-muted-foreground">{ay.latin_text}</p>
                    <div className="hairline my-2" />
                    <p className="text-sm text-foreground/90 leading-relaxed">"{ay.translation_id}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Surah Detail Modal */}
      {selectedSurahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="noor-card max-h-[85vh] w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col p-6 shadow-2xl animate-fade-up">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 font-bold text-gold">
                  {selectedSurahModal.number}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    {selectedSurahModal.name}
                    <span className="arabic text-lg text-gold font-normal">{selectedSurahModal.arabic}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedSurahModal.translation} · {selectedSurahModal.numberOfAyahs} Ayat ({selectedSurahModal.revelation})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSurahModal(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body with Ayahs */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {selectedSurahModal.ayahs.map((ay, idx) => (
                <div key={idx} className="space-y-3 pb-5 border-b border-border/40 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-xs font-semibold text-gold">
                      Ayat {ay.ayah_number}
                    </span>
                  </div>
                  <p className="arabic text-2xl text-right leading-loose">{ay.arabic_text}</p>
                  <p className="text-xs italic text-muted-foreground">{ay.latin_text}</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">"{ay.translation_id}"</p>
                  {ay.tafsir && (
                    <div className="p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-gold block mb-1">Tafsir Kemenag RI:</span>
                      {ay.tafsir}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setSelectedSurahModal(null)}
                className="px-5 py-2 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
