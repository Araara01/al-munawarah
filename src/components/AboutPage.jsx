import React from 'react';
import Logo from './Logo';
import { Layers, ShieldCheck, Database } from 'lucide-react';

export default function AboutPage() {
  const FOUR_LAYERS = [
    {
      label: "Al-Qur'an",
      body: "Teks Arab Utsmani, ditampilkan apa adanya dari database resmi tanpa perubahan satu huruf pun."
    },
    {
      label: "Terjemahan",
      body: "Terjemahan resmi Kementerian Agama Republik Indonesia (Kemenag RI)."
    },
    {
      label: "Tafsir",
      body: "Database Tafsir Ibnu Katsir (Al-Qur'an Al-'Azhim) lengkap 30 Juz & Tafsir Kemenag RI yang telah diverifikasi."
    },
    {
      label: "Penjelasan AI",
      body: "Penjelasan sederhana Al Munawwarah — menghubungkan ayat dengan pertanyaan sehari-hari, bukan tafsir resmi."
    }
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10 text-foreground">
      <Logo size="lg" showSubtitle={true} />

      <h2 className="mt-8 font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
        Tentang Al Munawwarah
      </h2>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Al Munawwarah adalah aplikasi AI yang dirancang untuk membantu pengguna menemukan dan memahami referensi Al-Qur'an dengan cara yang sederhana, modern, dan mudah diakses. Pertanyaan ditulis dengan bahasa sehari-hari, lalu sistem mencari ayat yang paling relevan dari database Al-Qur'an dan menjelaskannya dengan bahasa yang lembut dan tidak menghakimi.
      </p>

      {/* 4 Layers Card */}
      <div className="noor-card mt-8 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Empat lapisan yang selalu dipisahkan
          </span>
        </div>

        <ul className="space-y-3 pt-1">
          {FOUR_LAYERS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <div>
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Hallucination Prevention */}
      <div className="noor-card mt-4 rounded-3xl p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Pencegahan halusinasi
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          Model AI hanya diperbolehkan merujuk ayat dari database kandidat hasil penelusuran referensi terverifikasi, guna menjamin keaslian ayat suci dan mencegah segala bentuk kekeliruan kutipan.
        </p>
      </div>

      {/* Data Source */}
      <div className="noor-card mt-4 rounded-3xl p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Sumber Data
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          Teks Arab Utsmani, Terjemahan & Tafsir Ringkas Kemenag RI melalui EQuran.id, serta Database Lengkap Kitab Tafsir Ibnu Katsir (114 Surah, 30 Juz) dalam Bahasa Indonesia.
        </p>
      </div>

    </div>
  );
}
