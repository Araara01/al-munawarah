import React, { useState } from 'react';
import Logo from './Logo';
import { ArrowRight, Check } from 'lucide-react';

export default function OnboardingModal({ isOpen, onComplete, currentMode = 'muslim' }) {
  const [selectedMode, setSelectedMode] = useState(currentMode);

  if (!isOpen) return null;

  const OPTIONS = [
    {
      id: "muslim",
      emoji: "🕌",
      title: "Muslim",
      body: "Gunakan Al-Qur'an sebagai referensi utama dalam menjawab pertanyaan.",
      testId: "onboarding-option-muslim"
    },
    {
      id: "wawasan",
      emoji: "🌍",
      title: "Non-Muslim / Lainnya",
      body: "Jelajahi Al-Qur'an sebagai sumber pengetahuan dan wawasan.",
      testId: "onboarding-option-other"
    }
  ];

  const handleContinue = () => {
    onComplete(selectedMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 backdrop-blur-xl px-4 py-12">
      {/* Background Glow */}
      <div 
        className="pointer-events-none absolute left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 animate-halo rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold-glow), transparent 68%)" }}
      />

      <div className="relative w-full max-w-2xl text-foreground">
        
        {/* Header Branding */}
        <div className="text-center">
          <Logo size="lg" className="justify-center" />
          <p className="mt-10 text-xs uppercase tracking-[0.24em] text-gold font-medium">
            Sebelum kita mulai...
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
            Apa yang ingin kamu pilih?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            Pilihan ini hanya menyesuaikan cara penyampaian jawaban. Kamu bisa menggantinya kapan saja di Pengaturan.
          </p>
        </div>

        {/* Mode Option Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {OPTIONS.map(opt => {
            const isSelected = selectedMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedMode(opt.id)}
                data-testid={opt.testId}
                aria-pressed={isSelected}
                className={`noor-card relative overflow-hidden rounded-3xl p-6 text-left transition-all hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'border-gold/70 shadow-[0_0_38px_-12px_var(--gold-glow)] ring-1 ring-gold/40' 
                    : 'border-border/60 hover:border-gold/30'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-background">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                )}
                <span className="text-3xl select-none">{opt.emoji}</span>
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {opt.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {opt.body}
                </p>
              </button>
            );
          })}
        </div>

        {/* Continue CTA */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            data-testid="onboarding-continue-btn"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm bg-primary text-primary-foreground shadow hover:bg-primary/90 px-8 h-[3.25rem] w-full max-w-xs rounded-full font-semibold sm:w-auto sm:px-10 transition-transform active:scale-95"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <p className="max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
            Al Munawwarah menghormati semua pengguna. Kami tidak menilai, tidak memaksa, dan tidak meminta informasi pribadi yang tidak diperlukan.
          </p>
        </div>

      </div>
    </div>
  );
}
