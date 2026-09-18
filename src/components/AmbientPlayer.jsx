import React, { useState } from "react";
import { ambientSound } from "../services/ambientAudio";
import { CloudRain, Moon, Sparkles, VolumeX, X, Music2 } from "lucide-react";

export default function AmbientPlayer({ isOpen, onClose, onStateChange }) {
  const [activeSound, setActiveSound] = useState(null);

  if (!isOpen) return null;

  const SOUNDS = [
    {
      id: "rain",
      name: "Rintik Hujan Damai",
      desc: "Menenangkan pikiran yang bising & detak jantung yang cepat",
      icon: CloudRain,
      color: "text-cyan-500"
    },
    {
      id: "night",
      name: "Malam Hening Lembah",
      desc: "Frekuensi 174Hz untuk ketenangan saraf & peredam stres",
      icon: Moon,
      color: "text-indigo-400"
    },
    {
      id: "meditation",
      name: "Harmoni Kontemplatif",
      desc: "Resonansi meditatif untuk refleksi diri mendalam",
      icon: Sparkles,
      color: "text-gold"
    }
  ];

  const handleToggle = (soundId) => {
    if (activeSound === soundId) {
      ambientSound.stop();
      setActiveSound(null);
      if (onStateChange) onStateChange(false);
    } else {
      ambientSound.play(soundId);
      setActiveSound(soundId);
      if (onStateChange) onStateChange(true);
    }
  };

  const handleStopAll = () => {
    ambientSound.stop();
    setActiveSound(null);
    if (onStateChange) onStateChange(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 animate-fade-up">
      <div className="noor-card grain rounded-3xl p-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-gold/40 bg-gold/10">
              <Music2 className="h-3.5 w-3.5 text-gold" />
            </span>
            <h3 className="text-xs font-bold tracking-wide uppercase text-foreground">
              Suasana Penenang Jiwa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Tutup ambient player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sound Options */}
        <div className="space-y-2">
          {SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isPlaying = activeSound === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleToggle(sound.id)}
                className={`group w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] ${
                  isPlaying
                    ? "border-gold/50 bg-gold/5 shadow-xs"
                    : "border-border/60 hover:border-gold/30 hover:bg-secondary/50"
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isPlaying ? "border-gold/40 bg-gold/10" : "border-border/60 bg-secondary/50"
                }`}>
                  <Icon className={`h-4 w-4 ${isPlaying ? sound.color : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-snug ${isPlaying ? "text-foreground" : "text-foreground/80"}`}>
                    {sound.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sound.desc}</p>
                </div>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 shrink-0">
                    <span className="w-1 h-3 bg-gold rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-gold rounded-full animate-pulse [animation-delay:0.15s]" />
                    <span className="w-1 h-2 bg-gold rounded-full animate-pulse [animation-delay:0.3s]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stop All */}
        {activeSound && (
          <button
            onClick={handleStopAll}
            className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-2xl border border-destructive/30 bg-destructive/10 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>Hentikan Seluruh Suara</span>
          </button>
        )}

        <p className="mt-3 text-center text-[10px] text-muted-foreground italic">
          ✦ Disintesis murni via Web Audio · Tanpa unduhan eksternal
        </p>
      </div>
    </div>
  );
}
