import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import Logo from './Logo';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { useToast } from './Toast';

export default function ChatArea({
  messages,
  onSendMessage,
  isLoading,
  currentMode = 'muslim',
  onOpenSurah,
  onExportQuote,
  savedAyahs = [],
  onToggleSaveAyah
}) {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const SUGGESTION_CHIPS = [
    { emoji: '🌙', text: 'Bagaimana cara menghadapi masalah ketika hidup terasa berat?' },
    { emoji: '🕊️', text: 'Apa yang bisa menenangkan hati yang gelisah?' },
    { emoji: '💰', text: 'Apakah rezeki sudah ditentukan atau harus diusahakan?' },
    { emoji: '👨👩👧', text: 'Bagaimana seharusnya memperlakukan orang tua?' },
    { emoji: '🌱', text: 'Saya sedang kehilangan harapan, apa nasihat Al-Qur\'an?' },
    { emoji: '🤲', text: 'Apakah doa saya pasti didengar?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Pengenalan suara belum didukung di browser ini', 'info');
      return;
    }
    if (isListening) { setIsListening(false); return; }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.onstart = () => { setIsListening(true); showToast('Mendengarkan suara...', 'info'); };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => { setIsListening(false); showToast('Gagal mendeteksi suara', 'error'); };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.start();
    } catch { setIsListening(false); }
  };

  const isAyahSaved = (ayah) => {
    if (!ayah) return false;
    const sTarget = String(ayah.surah_number || ayah.surahNumber || '');
    const aTarget = String(ayah.ayah_number || ayah.ayahNumber || '');
    if (!sTarget || !aTarget) return false;
    return savedAyahs.some(s => 
      String(s.surah_number || s.surahNumber || '') === sTarget && 
      String(s.ayah_number || s.ayahNumber || '') === aTarget
    );
  };

  return (
    <div className="flex flex-col bg-background text-foreground transition-colors" style={{ height: 'calc(100vh - 55px - 48px)' }}>

      {/* Scrollable Messages Area */}
      <div className="min-h-0 flex-1 overflow-y-auto" data-testid="chat-scroll-area">
        <div className="mx-auto w-full px-4 py-8 sm:px-6" style={{ maxWidth: 680 }}>

          {messages.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center py-12 text-center" data-testid="chat-empty-state">
              <div className="breathing">
                <Logo size="lg" className="justify-center" />
              </div>

              <h2 className="mt-10 font-cormorant text-4xl font-light italic text-foreground" style={{ lineHeight: 1.25 }}>
                Apa yang sedang kamu cari?
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed" style={{ maxWidth: 400 }}>
                Tulis dengan bahasamu sendiri. Al Munawwarah akan mencari ayat yang paling relevan dan menjelaskannya dengan sederhana.
              </p>

              {/* 6 Suggestion Chips — 2 column golden grid */}
              <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(chip.text)}
                    data-testid={`suggestion-chip-${idx}`}
                    className="da-chip flex items-start gap-3 rounded-2xl px-4 py-4 text-left cursor-pointer"
                  >
                    {/* Emoji in golden circle */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center rounded-full text-base"
                      style={{
                        width: 34,
                        height: 34,
                        background: 'hsl(var(--gold) / 0.10)',
                        border: '1px solid hsl(var(--gold) / 0.22)'
                      }}
                    >
                      {chip.emoji}
                    </span>
                    <span className="text-sm leading-snug text-foreground/85 font-medium pt-0.5">
                      {chip.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages List ── */
            <div className="space-y-8">
              {messages.map((msg, idx) => (
                <MessageItem
                  key={msg.id || idx}
                  message={msg}
                  onOpenSurah={onOpenSurah}
                  onExportQuote={onExportQuote}
                  isSaved={isAyahSaved(msg.content?.ayahs?.[0])}
                  onToggleSave={onToggleSaveAyah}
                />
              ))}

              {/* Vitruvian loading indicator */}
              {isLoading && (
                <div className="da-card flex items-center gap-4 rounded-3xl p-5 animate-pulse">
                  <div className="vitruvian-loader flex-shrink-0">
                    <span className="absolute h-2 w-2 rounded-full bg-gold" style={{ background: 'hsl(var(--gold))' }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold" style={{ color: 'hsl(var(--gold))' }}>
                      Al Munawwarah sedang mencari hikmah Al-Qur'an...
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Menghubungkan ke teks Arab, terjemahan resmi Kemenag RI, dan tafsir.
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="glass border-t border-border/40 px-4 pb-4 pt-3 sm:px-6">
        <div className="mx-auto w-full" style={{ maxWidth: 680 }}>

          <div className="da-input flex items-end gap-2 rounded-3xl px-4 py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu kepada Al Munawwarah..."
              data-testid="chat-input"
              className="flex-1 min-h-[36px] max-h-40 resize-none bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 leading-relaxed py-1"
            />

            {/* Voice button */}
            <button
              onClick={handleVoiceInput}
              type="button"
              data-testid="voice-input-btn"
              aria-label="Input suara"
              className={`mb-0.5 flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                isListening
                  ? 'text-red-400 bg-red-500/10 animate-pulse'
                  : 'text-muted-foreground hover:text-gold hover:bg-gold/10'
              }`}
              title={isListening ? 'Mendengarkan...' : 'Input Suara'}
            >
              {isListening ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
            </button>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              data-testid="send-btn"
              aria-label="Kirim pertanyaan"
              className="da-btn-primary mb-0.5 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-primary-foreground disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              <Send style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Disclaimer */}
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/70">
            <Sparkles className="h-3 w-3 flex-shrink-0" style={{ color: 'hsl(var(--gold))' }} />
            <span>Al Munawwarah bukan pengganti ulama atau fatwa resmi</span>
          </p>

        </div>
      </div>

    </div>
  );
}
