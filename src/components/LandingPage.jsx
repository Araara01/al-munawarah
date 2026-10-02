import React from 'react';
import Logo from './Logo';
import { CRISIS_TOPICS } from '../data/wisdomData';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  BookmarkCheck, 
  BookMarked,
  Moon, 
  Sun, 
  MessageSquare, 
  CheckCircle, 
  Layers, 
  Compass,
  Brain,
  TrendingDown,
  HeartCrack,
  ShieldAlert
} from 'lucide-react';

export default function LandingPage({
  onStartChat,
  onStartChatWithPrompt,
  onOpenQuran,
  onOpenSaved,
  onOpenHadith,
  onOpenAbout,
  onOpenSettings,
  onOpenAdmin,
  isDark,
  toggleDark
}) {
  const STATS = [
    { value: "6.236", label: "Ayat lengkap" },
    { value: "114", label: "Surat" },
    { value: "Kemenag RI", label: "Terjemahan & tafsir" },
    { value: "2 Mode", label: "Muslim & Wawasan" }
  ];

  const FEATURES = [
    {
      icon: MessageSquare,
      title: "Pertanyaan sehari-hari",
      body: "Tulis dengan bahasamu sendiri. Al Munawwarah memahami maksudnya, lalu mencari ayat yang paling dekat dengan keadaanmu.",
      span: "sm:col-span-2"
    },
    {
      icon: CheckCircle,
      title: "Tidak mengarang ayat",
      body: "Setiap ayat diambil langsung dari database Al-Qur'an. Bila tidak ada yang cukup relevan, kami mengatakannya dengan jujur.",
      span: ""
    },
    {
      icon: Layers,
      title: "Empat lapisan yang dipisah",
      body: "Teks Arab, terjemahan, tafsir, dan penjelasan AI ditandai jelas — kamu selalu tahu mana yang mana.",
      span: ""
    },
    {
      icon: Compass,
      title: "Jelajahi per surat & tema",
      body: "Pilih surat, pilih ayat, atau telusuri tema seperti kesabaran, rezeki, dan keluarga.",
      span: "sm:col-span-2"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-gold/30 selection:text-gold-bright">
      
      {/* Top Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50 transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="sm" showSubtitle={false} />

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              data-testid="landing-theme-toggle"
              aria-label="Ganti tema"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gold" />
              ) : (
                <Moon className="h-5 w-5 text-gold" />
              )}
            </button>

            {/* Nav to Quran */}
            <button
              onClick={onOpenQuran}
              className="hidden rounded-full text-xs font-semibold px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-secondary/60 sm:inline-flex transition-colors"
              data-testid="landing-nav-quran"
            >
              Jelajahi Al-Qur'an
            </button>

            {/* Nav to Hadith */}
            <button
              onClick={onOpenHadith}
              className="hidden rounded-full text-xs font-semibold px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-secondary/60 md:inline-flex transition-colors"
              data-testid="landing-nav-hadith"
            >
              Hadits Bukhari
            </button>

            {/* CTA button */}
            <button
              onClick={onStartChat}
              className="ripple rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-transform active:scale-95"
              data-testid="landing-header-cta"
            >
              Mulai Bertanya
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-[-10%] h-[550px] w-[550px] -translate-x-1/2 animate-halo rounded-full blur-3xl"
               style={{ background: "radial-gradient(circle, var(--gold-glow), transparent 68%)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold font-medium">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Modern Islamic AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Tanyakan Apa Saja.<br />
              <span className="gold-text">Temukan Cahaya dari Al-Qur'an.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Al Munawwarah membantu memahami pertanyaan kehidupan melalui ayat Al-Qur'an dan penjelasan yang lembut, santun, dan mudah dipahami.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center">
              <button
                onClick={onStartChat}
                data-testid="hero-cta-primary"
                className="group flex items-center justify-center gap-2 h-13 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-12px_var(--gold-glow)] hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>Mulai Bertanya</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenQuran}
                data-testid="hero-cta-secondary"
                className="flex items-center justify-center gap-2 h-13 rounded-full border border-gold/35 px-8 text-sm font-medium text-foreground hover:bg-gold/5 transition-all active:scale-95"
              >
                <BookOpen className="h-4 w-4 text-gold" />
                <span>Jelajahi Al-Qur'an</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              Bisa langsung dipakai tanpa daftar · Mode Muslim & Non-Muslim
            </p>

          </div>

          {/* 4 Stats Cards */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-20 sm:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div key={idx} className="noor-card rounded-2xl px-4 py-5 text-center">
                <p className="font-display text-xl font-semibold text-gold sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Preview Card (Asy-Syarh 5-6) */}
          <div className="relative mt-16 max-w-2xl mx-auto">
            <span className="noor-bloom animate-halo" />
            <div className="noor-card grain relative rounded-3xl p-6 sm:p-8">
              <p className="text-xs text-muted-foreground">Kamu bertanya</p>
              <p className="mt-1.5 text-sm font-medium text-foreground">
                “Bagaimana cara menghadapi masalah ketika hidup terasa berat?”
              </p>

              <div className="hairline my-5" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Ayat yang relevan
              </span>
              <p className="mt-1 text-sm font-semibold text-foreground">
                QS. Asy-Syarh: 5–6
              </p>

              <p className="arabic mt-4 text-2xl sm:text-3xl text-right">
                فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground/90 italic">
                “Maka sesungguhnya beserta kesulitan ada kemudahan.”
              </p>

              <div className="hairline my-5" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Penjelasan sederhana Al Munawwarah
              </span>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Kesulitan tidak berdiri sendiri. Ayat ini mengingatkan bahwa selalu ada jalan menuju kemudahan, sehingga kita tidak kehilangan harapan saat menghadapi masalah.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 4 Feature Highlights Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className={`noor-card rounded-3xl p-6 ${feat.span}`}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/5">
                  <Icon className="h-5 w-5 text-gold" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feat.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crisis Topics – Quick Access Pre-filled Prompts */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Mulai dari sini
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
              Apa yang sedang kamu rasakan?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Pilih topik yang paling dekat dengan kondisimu — percakapan akan langsung dimulai dengan pertanyaan yang tepat.
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-3 py-1.5 rounded-full bg-secondary/60 border border-border/60">
            <span className="text-gold font-bold">{CRISIS_TOPICS.length}</span> topik tersedia
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {CRISIS_TOPICS.map((topic, idx) => {
            const iconMap = {
              Brain, TrendingDown, HeartCrack, ShieldAlert, Compass, Sparkles
            };
            const Icon = iconMap[topic.icon] || Sparkles;

            // Elegant gold accent matching brand theme
            const acc = {
              ring: 'group-hover:border-gold/60',
              glow: 'group-hover:shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.25)]',
              iconBg: 'bg-gold/10 group-hover:bg-gold/20 border-gold/25 group-hover:border-gold/50',
              iconColor: 'text-gold'
            };

            return (
              <button
                key={topic.id}
                onClick={() => onStartChatWithPrompt ? onStartChatWithPrompt(topic.prompt) : onStartChat()}
                className={`noor-card group relative flex flex-col gap-4 rounded-3xl p-5 sm:p-6 text-left transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer border border-border/60 ${acc.ring} ${acc.glow} overflow-hidden`}
              >
                {/* Subtle gradient shimmer on hover */}
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(ellipse at 20% 20%, hsl(var(--gold)/0.04), transparent 60%)' }} />

                {/* Top row: icon + arrow */}
                <div className="flex items-start justify-between">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${acc.iconBg}`}>
                    <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${acc.iconColor}`} />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Text content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors duration-200 leading-snug">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {topic.subtitle}
                  </p>
                </div>

                {/* Footer hint */}
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60 group-hover:text-gold/70 transition-colors duration-200">
                  <span className="h-px flex-1 bg-border/60 group-hover:bg-gold/20 transition-colors duration-200" />
                  Tanya sekarang
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Callout */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="noor-card grain relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12">
          <span className="noor-bloom animate-halo" />
          <div className="relative">
            <Logo size="lg" showSubtitle={true} className="justify-center" />
            <h2 className="mx-auto mt-8 max-w-xl font-display text-2xl font-semibold sm:text-3xl text-foreground">
              Menerangi Pertanyaan dengan Cahaya Al-Qur'an
            </h2>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onStartChat}
                data-testid="footer-cta-primary"
                className="ripple h-[3.25rem] rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-transform active:scale-95"
              >
                Tanyakan kepada Al Munawwarah
              </button>
              <button
                onClick={onOpenSaved}
                data-testid="footer-cta-saved"
                className="flex items-center justify-center gap-2 h-[3.25rem] rounded-full border border-gold/35 px-8 text-sm font-medium text-foreground hover:bg-gold/5 transition-transform active:scale-95"
              >
                <BookmarkCheck className="h-4 w-4 text-gold" />
                <span>Dalil Tersimpan</span>
              </button>
              <button
                onClick={onOpenHadith}
                data-testid="footer-cta-hadith"
                className="flex items-center justify-center gap-2 h-[3.25rem] rounded-full border border-gold/35 px-8 text-sm font-medium text-foreground hover:bg-gold/5 transition-transform active:scale-95"
              >
                <BookMarked className="h-4 w-4 text-gold" />
                <span>Hadits Bukhari</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 px-4 py-10 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Al Munawwarah adalah AI untuk membantu memahami dan menemukan referensi ayat Al-Qur'an dan Hadis Nabi ﷺ. Jawaban AI bukan pengganti ulama, ustaz, ahli tafsir, atau fatwa resmi. Untuk keputusan hukum/fatwa, sebaiknya konsultasikan kepada ulama atau ahli yang terpercaya.
          </p>
          <p className="text-xs text-muted-foreground">
            Sumber data: Teks Arab Utsmani, Terjemahan & Tafsir Ringkas Kemenag RI, Database Lengkap Kitab Tafsir Ibnu Katsir (114 Surat, 30 Juz), serta Database Shahih Al-Bukhari.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-medium pt-2">
            <button
              onClick={onOpenAbout}
              className="text-gold hover:underline"
              data-testid="footer-about"
            >
              Tentang
            </button>
            <button
              onClick={onOpenSettings}
              className="text-gold hover:underline"
              data-testid="footer-settings"
            >
              Pengaturan
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-gold hover:underline"
              data-testid="footer-admin"
            >
              Admin & Statistik
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
