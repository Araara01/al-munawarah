import React, { useState } from 'react';
import { X, Key, Cpu, ExternalLink, Moon, Sun, Check, Sparkles, Sliders } from 'lucide-react';
import { useToast } from './Toast';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  currentMode,
  setCurrentMode,
  showLatin = true,
  setShowLatin,
  isDark,
  toggleDark
}) {
  const { showToast } = useToast();
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    localStorage.setItem('munawwarah_api_key', tempKey);
    localStorage.setItem('munawwarah_model', selectedModel);
    showToast("Pengaturan berhasil disimpan", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="noor-card w-full max-w-lg rounded-3xl p-6 shadow-2xl text-foreground space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Pengaturan
            </h3>
            <p className="text-xs text-muted-foreground">
              Sesuaikan cara Al Munawwarah menemani kamu membaca dan bertanya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Akun */}
        <section className="p-4 rounded-2xl bg-secondary/40 space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Akun
          </span>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm font-bold text-gold">
              T
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Mode Tamu</p>
              <p className="text-xs text-muted-foreground">
                Riwayat dan ayat tersimpan diamankan di peramban lokal perangkatmu.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Mode Pengguna */}
        <section className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Mode Penyampaian Jawaban
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setCurrentMode('muslim')}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                currentMode === 'muslim'
                  ? 'border-gold bg-gold/10 text-gold font-semibold shadow-xs'
                  : 'border-border/80 text-muted-foreground hover:border-gold/30 hover:text-foreground'
              }`}
            >
              <span className="text-base block mb-1">🕌</span>
              <span>Mode Muslim</span>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Rujukan utama Al-Qur'an & doa
              </p>
            </button>

            <button
              onClick={() => setCurrentMode('wawasan')}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                currentMode === 'wawasan'
                  ? 'border-gold bg-gold/10 text-gold font-semibold shadow-xs'
                  : 'border-border/80 text-muted-foreground hover:border-gold/30 hover:text-foreground'
              }`}
            >
              <span className="text-base block mb-1">🌍</span>
              <span>Mode Wawasan</span>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Wawasan universal & etika
              </p>
            </button>
          </div>
        </section>

        {/* Section 3: Model AI */}
        <section className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-gold" />
            Model AI Utama (Flagship Tertinggi)
          </label>

          {(() => {
            const model = selectedModel || 'gemini-2.5-pro';
            const isOpenAI = model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4');
            const isAnthropic = model.startsWith('claude');
            const isQwen = model.startsWith('qwen');
            const providerLabel = isOpenAI
              ? 'OpenAI API Key'
              : isAnthropic
              ? 'Anthropic API Key'
              : isQwen
              ? 'Qwen / DashScope API Key'
              : 'Google Gemini API Key (Opsional)';
            const providerLink = isOpenAI
              ? 'https://platform.openai.com/api-keys'
              : isAnthropic
              ? 'https://console.anthropic.com/settings/keys'
              : isQwen
              ? 'https://dashscope.console.aliyun.com/'
              : 'https://aistudio.google.com/app/apikey';
            const providerLinkLabel = isOpenAI
              ? 'Dapatkan Key OpenAI'
              : isAnthropic
              ? 'Dapatkan Key Anthropic'
              : isQwen
              ? 'Dapatkan Key DashScope'
              : 'Dapatkan Kunci Gratis';
            const placeholder = isOpenAI
              ? 'sk-... (OpenAI API Key)'
              : isAnthropic
              ? 'sk-ant-... (Anthropic API Key)'
              : isQwen
              ? 'sk-... (DashScope / OpenRouter API Key)'
              : 'AIzaSy... (kosongkan jika memakai database bawaan)';

            return (
              <div className="space-y-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/50 border border-border/80 focus:outline-none focus:border-gold text-foreground font-medium"
                >
                  <option value="gemini-2.5-pro">🔵 Google Gemini — Gemini 2.5 Pro (Flagship Tertinggi)</option>
                  <option value="gpt-4o">🟢 OpenAI — GPT-4o (Flagship Tertinggi)</option>
                  <option value="claude-3-7-sonnet">🟠 Anthropic — Claude 3.7 Sonnet (Flagship Tertinggi)</option>
                  <option value="qwen-max">🟣 Alibaba Cloud — Qwen-Max (Flagship Tertinggi)</option>
                </select>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Key className="h-3 w-3 text-gold" />
                      {providerLabel}
                    </span>
                    <a
                      href={providerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-gold hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {providerLinkLabel} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-2 pr-20 rounded-xl text-xs bg-secondary/50 border border-border/80 focus:outline-none focus:border-gold text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2 text-[11px] text-gold hover:text-gold/80 font-medium cursor-pointer"
                    >
                      {showKey ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                    ✦ <strong>Zero-Setup:</strong> Tanpa API key, Al Munawwarah tetap dapat menjawab ribuan persoalan hidup secara instan dengan basis data Al-Qur'an &amp; Kemenag RI bawaan.
                  </p>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Section 4: Tampilan & Teks Latin */}
        <section className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground font-medium">Tema Tampilan</span>
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-semibold hover:border-gold/50"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-gold" /> : <Moon className="h-3.5 w-3.5 text-emerald-800" />}
              <span>{isDark ? "Mode Gelap" : "Mode Terang"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground font-medium">Tampilkan Transliterasi Latin</p>
              <p className="text-[11px] text-muted-foreground">Teks bacaan latin di bawah ayat Arab</p>
            </div>
            <button
              onClick={() => setShowLatin && setShowLatin(!showLatin)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showLatin ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showLatin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Save Footer */}
        <div className="pt-3 border-t border-border/60 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 transition-transform active:scale-95"
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}
