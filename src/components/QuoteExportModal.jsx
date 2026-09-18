import React, { useState } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import Logo from './Logo';

export default function QuoteExportModal({ isOpen, onClose, quoteData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !quoteData) return null;

  const handleCopyText = () => {
    const fullText = `${quoteData.arabic ? quoteData.arabic + '\n\n' : ''}"${quoteData.quote}"\n\n— ${quoteData.author || "Al Munawwarah"}\n\n#AlMunawwarah #CahayaAlQuran #Hikmah`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="noor-card w-full max-w-lg rounded-3xl p-6 shadow-2xl text-foreground space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Kartu Mutiara Al-Qur'an</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aesthetic Card */}
        <div className="relative p-7 sm:p-9 rounded-3xl bg-secondary/40 border border-gold/30 shadow-2xl overflow-hidden text-center">
          <span className="noor-bloom animate-halo" />

          {quoteData.arabic && (
            <p className="arabic text-2xl sm:text-3xl text-gold mb-4 leading-loose">
              {quoteData.arabic}
            </p>
          )}

          <blockquote className="font-display text-base sm:text-lg text-foreground leading-relaxed italic mb-4 font-medium">
            "{quoteData.quote}"
          </blockquote>

          <div className="hairline my-4 w-32 mx-auto" />

          <p className="text-xs font-semibold tracking-widest text-gold uppercase">
            {quoteData.author || "Al Munawwarah — Cahaya Al-Qur'an"}
          </p>

          <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Al Munawwarah</span>
            <span>Menerangi Pertanyaan dengan Cahaya Al-Qur'an</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:bg-secondary/60 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground transition-all shadow hover:bg-primary/90 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kutipan Berhasil Disalin!" : "Salin Kartu"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
