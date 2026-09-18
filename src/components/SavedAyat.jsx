import React from 'react';
import MessageItem from './MessageItem';
import { BookmarkCheck, Trash2 } from 'lucide-react';
import { useToast } from './Toast';

export default function SavedAyat({
  savedAyahs = [],
  onRemoveAyah,
  onOpenSurah,
  onExportQuote
}) {
  const { showToast } = useToast();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 text-foreground">
      
      {/* Header */}
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
          Ayat Tersimpan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {savedAyahs.length > 0 
            ? `${savedAyahs.length} ayat telah kamu simpan di sini untuk dibaca atau diresapi kembali.`
            : "Simpan ayat-ayat Al-Qur'an yang berkesan di hati agar mudah dibaca kapan saja."
          }
        </p>
      </header>

      {/* Empty State */}
      {savedAyahs.length === 0 ? (
        <div 
          className="noor-card flex flex-col items-center rounded-3xl px-6 py-16 text-center"
          data-testid="saved-empty"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/5 text-gold mb-4">
            <BookmarkCheck className="h-7 w-7" />
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Belum ada ayat tersimpan
          </h3>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Saat membaca bimbingan atau menjelajahi Al-Qur'an, tekan tombol <strong className="text-gold font-semibold">Simpan</strong> pada kartu ayat untuk menambahkannya ke daftar ini.
          </p>
        </div>
      ) : (
        /* Saved Ayahs List */
        <div className="space-y-6">
          {savedAyahs.map((ayah, idx) => {
            const simulatedMsg = {
              id: `saved-${ayah.surah_number}-${ayah.ayah_number}`,
              role: 'assistant',
              content: {
                opening: '',
                ayahs: [ayah],
                explanation: '',
                closing: ''
              }
            };

            return (
              <div key={idx} className="relative group">
                <MessageItem
                  message={simulatedMsg}
                  onOpenSurah={onOpenSurah}
                  onExportQuote={onExportQuote}
                  isSaved={true}
                  onToggleSave={() => {
                    onRemoveAyah(ayah);
                    showToast("Ayat dihapus dari tersimpan", "info");
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
