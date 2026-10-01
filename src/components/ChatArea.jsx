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
  onToggleSaveAyah,
  onFinishTyping
}) {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollAnimRef = useRef(null);
  const isAutoScrollingRef = useRef(false);
  const prevMessagesLengthRef = useRef(messages.length);

  const SUGGESTION_CHIPS = [
    { emoji: '🌙', text: 'Bagaimana cara menghadapi masalah ketika hidup terasa berat?' },
    { emoji: '🕊️', text: 'Apa yang bisa menenangkan hati yang gelisah?' },
    { emoji: '💰', text: 'Apakah rezeki sudah ditentukan atau harus diusahakan?' },
    { emoji: '👨👩👧', text: 'Bagaimana seharusnya memperlakukan orang tua?' },
    { emoji: '🌱', text: 'Saya sedang kehilangan harapan, apa nasihat Al-Qur\'an?' },
    { emoji: '🤲', text: 'Apakah doa saya pasti didengar?' }
  ];

  // Smooth, gradual scroll animation with easing
  const slowScrollTo = (container, targetY, duration = 800) => {
    if (!container) return;
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    const startY = container.scrollTop;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;

    const startTime = performance.now();
    isAutoScrollingRef.current = true;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Gentle cubic ease in-out curve
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      container.scrollTop = startY + diff * ease;

      if (progress < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
        isAutoScrollingRef.current = false;
      }
    }

    scrollAnimRef.current = requestAnimationFrame(step);
  };

  // Position viewport gently so the TOP of the newly arrived answer is in view
  // (Prevents suddenly jumping to the bottom/end of the answer)
  const positionNewMessageInView = () => {
    const container = scrollContainerRef.current;
    const targetEl = latestMessageRef.current;
    if (!container || !targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const relativeTop = targetRect.top - containerRect.top;

    // If top of AI message is not comfortably positioned near the top of the container:
    if (relativeTop > 140 || relativeTop < 10) {
      const desiredScrollTop = container.scrollTop + relativeTop - 50;
      slowScrollTo(container, Math.max(0, desiredScrollTop), 550);
    }
  };

  // Progressive scroll handler triggered as the answer generates and reveals parts
  const handleProgressScroll = (stageType) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (stageType === 'typing') {
      const targetEl = latestMessageRef.current;
      if (!targetEl) return;
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const bottomDistance = containerRect.bottom - targetRect.bottom;

      // As text types and card expands downwards, gently nudge scroll if close to viewport bottom
      if (bottomDistance < 50) {
        const nudge = 50 - bottomDistance;
        slowScrollTo(container, container.scrollTop + nudge, 280);
      }
    } else if (stageType === 'middle-card') {
      // Middle section appears: smooth gentle scroll
      setTimeout(() => {
        const targetEl = latestMessageRef.current;
        if (!targetEl) return;
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const bottomDistance = containerRect.bottom - targetRect.bottom;
        if (bottomDistance < 70) {
          const distanceToScroll = 70 - bottomDistance;
          slowScrollTo(container, container.scrollTop + distanceToScroll, 700);
        }
      }, 50);
    } else if (stageType === 'bottom-card') {
      // Al-Qur'an Yang Cocok & Footer appear: slowly and smoothly scroll to the bottom
      setTimeout(() => {
        const maxScroll = container.scrollHeight - container.clientHeight;
        slowScrollTo(container, maxScroll, 1000);
      }, 70);
    } else if (stageType === 'instant-bottom') {
      const maxScroll = container.scrollHeight - container.clientHeight;
      slowScrollTo(container, maxScroll, 400);
    }
  };

  // If user scrolls manually with mouse wheel or touch, stop programmatic scroll animation
  const handleUserInteraction = () => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
      isAutoScrollingRef.current = false;
    }
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
      }
    };
  }, []);

  // Orchestrated scroll effect on message changes & loading states
  useEffect(() => {
    const prevLen = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    // When loading starts (user sent question), scroll to show question & loader
    if (isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    // When a new message arrives
    if (messages.length > prevLen) {
      const lastMsg = messages[messages.length - 1];

      // If it's a NEW AI message: position at TOP of answer (do NOT auto-jump to end!)
      if (lastMsg?.role === 'assistant' && lastMsg?.isNew) {
        setTimeout(() => {
          positionNewMessageInView();
        }, 60);
        return;
      }

      // If user message was added
      if (lastMsg?.role === 'user') {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        return;
      }
    }

    // If conversation history was loaded from empty
    if (prevLen === 0 && messages.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    }
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
      <div
        ref={scrollContainerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        onPointerDown={handleUserInteraction}
        className="min-h-0 flex-1 overflow-y-auto"
        data-testid="chat-scroll-area"
      >
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
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                return (
                  <div
                    key={msg.id || idx}
                    ref={isLast ? latestMessageRef : null}
                  >
                    <MessageItem
                      message={msg}
                      isLatest={isLast}
                      onOpenSurah={onOpenSurah}
                      onExportQuote={onExportQuote}
                      isSaved={isAyahSaved(msg.content?.ayahs?.[0])}
                      onToggleSave={onToggleSaveAyah}
                      onProgressScroll={handleProgressScroll}
                      onFinishTyping={onFinishTyping}
                    />
                  </div>
                );
              })}

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
                      Menghubungkan ke database Al-Qur'an, terjemahan resmi Kemenag RI, dan Tafsir Ibnu Katsir.
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
