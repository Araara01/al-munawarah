import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import Logo from './Logo';
import { Send, Mic, MicOff, Sparkles, RefreshCw } from 'lucide-react';
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
    {
      emoji: "🌙",
      text: "Bagaimana cara menghadapi masalah ketika hidup terasa berat?"
    },
    {
      emoji: "🕊️",
      text: "Apa yang bisa menenangkan hati yang gelisah?"
    },
    {
      emoji: "💰",
      text: "Apakah rezeki sudah ditentukan atau harus diusahakan?"
    },
    {
      emoji: "👨‍👩‍👧",
      text: "Bagaimana seharusnya memperlakukan orang tua?"
    },
    {
      emoji: "🌱",
      text: "Saya sedang kehilangan harapan, apa nasihat Al-Qur'an?"
    },
    {
      emoji: "🤲",
      text: "Apakah doa saya pasti didengar?"
    }
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Voice speech recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Pengenalan suara belum didukung di browser ini", "info");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast("Mendengarkan suara...", "info");
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        showToast("Gagal mendeteksi suara", "error");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const isAyahSaved = (ayah) => {
    if (!ayah) return false;
    return savedAyahs.some(s => s.surah_number === ayah.surah_number && s.ayah_number === ayah.ayah_number);
  };

  return (
    <div className="flex flex-col bg-background text-foreground transition-colors" style={{ height: 'calc(100vh - 4rem - 48px)' }}>
      
      {/* Scrollable Messages Area */}
      <div className="min-h-0 flex-1 overflow-y-auto" data-testid="chat-scroll-area">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center py-8 text-center" data-testid="chat-empty-state">
              <Logo size="lg" className="justify-center" />
              
              <h2 className="mt-8 font-display text-2xl font-semibold sm:text-3xl text-foreground">
                Apa yang sedang kamu cari?
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                Tulis dengan bahasamu sendiri. Al Munawwarah akan mencari ayat yang paling relevan dan menjelaskannya dengan sederhana.
              </p>

              {/* 6 Suggestion Chips */}
              <div className="mt-9 grid w-full gap-2.5 sm:grid-cols-2">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(chip.text)}
                    data-testid={`suggestion-chip-${idx}`}
                    className="noor-card group flex items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-transform hover:-translate-y-0.5 cursor-pointer active:scale-98"
                  >
                    <span className="text-lg select-none">{chip.emoji}</span>
                    <span className="text-sm leading-snug text-foreground/85 font-medium">
                      {chip.text}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Messages List */
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

              {/* Loading thinking indicator */}
              {isLoading && (
                <div className="noor-card flex items-center gap-3.5 rounded-2xl p-4 animate-pulse">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="absolute inset-0 animate-spin rounded-full border border-dashed border-gold/60" />
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold/30" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gold">
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

      {/* Input Container */}
      <div className="glass border-t border-border/60 px-3 pb-3 pt-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          
          <div className="noor-card flex items-end gap-2 rounded-3xl px-3 py-2.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu kepada Al Munawwarah..."
              data-testid="chat-input"
              className="flex w-full rounded-md border-input placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 max-h-40 min-h-[40px] resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none text-foreground leading-relaxed"
            />

            {/* Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              type="button"
              data-testid="voice-input-btn"
              aria-label="Input suara"
              className={`mb-1 rounded-full p-2.5 transition-colors active:scale-95 ${
                isListening 
                  ? 'text-red-500 bg-red-500/10 animate-pulse' 
                  : 'text-muted-foreground hover:text-gold'
              }`}
              title={isListening ? "Mendengarkan..." : "Input Suara"}
            >
              {isListening ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              data-testid="send-btn"
              aria-label="Kirim pertanyaan"
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-gold shrink-0" />
            <span>Al Munawwarah bukan pengganti ulama atau fatwa resmi · Gemini 2.0 / Kemenag RI</span>
          </p>

        </div>
      </div>

    </div>
  );
}
