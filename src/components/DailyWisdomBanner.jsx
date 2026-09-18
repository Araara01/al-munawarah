import React, { useState } from "react";
import { DAILY_WISDOMS } from "../data/wisdomData";
import { ChevronDown, ChevronUp, RefreshCw, Share2, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

export default function DailyWisdomBanner({ onExportQuote }) {
  const { showToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Seed from date so wisdom changes daily
    const day = new Date().getDate();
    return day % DAILY_WISDOMS.length;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const wisdom = DAILY_WISDOMS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_WISDOMS.length);
    setIsExpanded(false);
  };

  const handleExport = () => {
    if (onExportQuote) {
      onExportQuote({
        quote: wisdom.sourceType === "islamic" ? wisdom.translation : wisdom.quote,
        author: wisdom.sourceType === "islamic" ? wisdom.reference : wisdom.author,
        arabic: wisdom.arabic || ""
      });
    }
  };

  return (
    <div className="relative border-b border-gold/20 bg-gold/5 transition-all">
      {/* Gold shimmer top bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] hairline" />

      <div className="mx-auto max-w-3xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          
          {/* Wisdom Preview */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/10">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
            </span>
            <div className="truncate text-xs">
              <span className="font-bold text-gold mr-2">Hikmah Hari Ini:</span>
              <span className="text-foreground/80 italic">
                {wisdom.sourceType === "islamic"
                  ? wisdom.translation
                  : `"${wisdom.quote}"`}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Ganti Mutiara Hikmah"
              aria-label="Ganti hikmah"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border/80 bg-background hover:border-gold/50 hover:text-gold transition-all text-muted-foreground"
            >
              <span>{isExpanded ? "Tutup" : "Tadabbur"}</span>
              {isExpanded
                ? <ChevronUp className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3 text-gold" />}
            </button>
          </div>
        </div>

        {/* Expanded Tadabbur Content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gold/20 animate-fade-up space-y-3">
            {wisdom.sourceType === "islamic" && wisdom.arabic && (
              <p className="arabic text-xl sm:text-2xl text-right px-2 text-gold">
                {wisdom.arabic}
              </p>
            )}

            <p className="text-sm font-semibold text-foreground leading-relaxed px-1">
              {wisdom.sourceType === "islamic" ? wisdom.translation : wisdom.quote}
            </p>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span className="font-bold text-gold">
                {wisdom.sourceType === "islamic" ? wisdom.reference : wisdom.author}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-gold/30 bg-gold/10 text-gold font-medium">
                {wisdom.category}
              </span>
            </div>

            {/* Reflection Card */}
            <div className="noor-card rounded-2xl p-3.5 text-sm text-muted-foreground leading-relaxed">
              💡 <strong className="text-gold">Renungan Jiwa:</strong> {wisdom.reflection}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-all active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Ekspor Kartu Mutiara</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
