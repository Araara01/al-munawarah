// Hadith Service — Al Munawwarah
// Pencarian Hadis Riwayat Bukhari yang relevan berdasarkan query/topik
import { HADITH_BUKHARI, HADITH_THEMES, getHadithById, getHadithsByTheme } from '../data/hadithData.js';

/**
 * Cari hadis Bukhari yang paling relevan berdasarkan query pengguna.
 * Mengembalikan satu hadis terpilih beserta relevansinya.
 */
export function findRelevantHadith(query = '') {
  const q = (query || '').toLowerCase().trim();
  if (!q) return HADITH_BUKHARI[6]; // Default: hadis tentang mukmin (sabar & syukur)

  // ─── 1. Keyword Cluster Matching ────────────────────────────────
  if (matchesAny(q, ["sakit", "penyakit", "sembuh", "sehat", "obat", "berobat", "dokter", "lemas", "demam"])) {
    return pickRandom(getHadithsByTheme('sakit_sehat'));
  }
  if (matchesAny(q, ["rezeki", "uang", "kerja", "karir", "bisnis", "finansial", "miskin", "utang", "nafkah", "penghasilan", "gaji", "modal"])) {
    return pickRandom(getHadithsByTheme('rezeki_tawakal'));
  }
  if (matchesAny(q, ["tawakal", "pasrah", "berserah", "percaya", "yakin", "harapan", "optimis", "berprasangka"])) {
    const pool = [getHadithById(9), getHadithById(21)].filter(Boolean);
    return pickRandom(pool);
  }
  if (matchesAny(q, ["sabar", "ujian", "cobaan", "musibah", "bencana", "sedih", "susah", "derita", "penderitaan", "kesulitan", "berat", "terpuruk"])) {
    return pickRandom(getHadithsByTheme('sabar_ujian'));
  }
  if (matchesAny(q, ["dosa", "taubat", "salah", "sesal", "menyesal", "ampun", "istighfar", "kembali", "berubah", "berdosa", "maksiat"])) {
    return pickRandom(getHadithsByTheme('taubat_ampunan'));
  }
  if (matchesAny(q, ["tenang", "gelisah", "cemas", "overthinking", "khawatir", "gundah", "panik", "stress", "waswas", "galau"])) {
    return pickRandom(getHadithsByTheme('ketenangan_dzikir'));
  }
  if (matchesAny(q, ["marah", "amarah", "emosi", "jengkel", "kesal", "frustrasi"])) {
    return getHadithById(12); // Hadis tentang mengendalikan amarah
  }
  if (matchesAny(q, ["orang tua", "ibu", "bapak", "ayah", "mama", "papa", "berbakti", "birrul walidain"])) {
    return getHadithById(15); // Ridha Allah dalam ridha orang tua
  }
  if (matchesAny(q, ["keluarga", "silaturahmi", "kerabat", "saudara kandung", "hubungan keluarga"])) {
    return getHadithById(16); // Silaturahmi memperlancar rezeki
  }
  if (matchesAny(q, ["teman", "persahabatan", "sahabat", "konflik", "bertengkar", "pertemanan", "bermusuhan", "berselisih"])) {
    return getHadithById(28); // Larangan hasad dan memutus persaudaraan
  }
  if (matchesAny(q, ["iri", "dengki", "hasad", "cemburu", "membanding"])) {
    return getHadithById(28); // Larangan hasad
  }
  if (matchesAny(q, ["syukur", "nikmat", "bersyukur", "terima kasih", "berkah", "karunia"])) {
    return getHadithById(24); // Lihat ke bawah untuk bersyukur
  }
  if (matchesAny(q, ["kaya", "harta", "cukup", "qana'ah", "zuhud", "sederhana", "puas"])) {
    return getHadithById(22); // Kekayaan sejati adalah kaya hati
  }
  if (matchesAny(q, ["sedekah", "infak", "berbagi", "dermawan", "amal", "zakat"])) {
    return pickRandom([getHadithById(29), getHadithById(30)].filter(Boolean));
  }
  if (matchesAny(q, ["salat", "shalat", "sembahyang", "ibadah", "sholat"])) {
    return getHadithById(4); // Salat tiang agama
  }
  if (matchesAny(q, ["doa", "berdoa", "memohon", "munajat", "hajat"])) {
    return getHadithById(5); // Sujud adalah posisi terdekat
  }
  if (matchesAny(q, ["mati", "kematian", "meninggal", "wafat", "ajal", "akhirat", "dunia", "kehidupan setelah mati"])) {
    return pickRandom(getHadithsByTheme('akhirat_dunia'));
  }
  if (matchesAny(q, ["jujur", "bohong", "berbohong", "kejujuran", "amanah", "kepercayaan", "integritas"])) {
    return getHadithById(23); // Kejujuran ke surga
  }
  if (matchesAny(q, ["ilmu", "belajar", "sekolah", "kuliah", "pendidikan", "pengetahuan", "menuntut ilmu"])) {
    return getHadithById(18); // Allah memahamkan agama
  }
  if (matchesAny(q, ["akhlak", "sopan", "adab", "karakter", "perilaku", "sikap", "budi pekerti"])) {
    return getHadithById(20); // Diutus untuk menyempurnakan akhlak
  }
  if (matchesAny(q, ["niat", "ikhlas", "tulus", "motivasi", "tujuan"])) {
    return getHadithById(1); // Amal bergantung niat
  }
  if (matchesAny(q, ["lisan", "mulut", "perkataan", "kata-kata", "ucapan", "berbicara", "gossip", "ghibah"])) {
    return getHadithById(19); // Berkata baik atau diam
  }
  if (matchesAny(q, ["lemah", "gagal", "minder", "bangkit", "kalah", "kecewa", "putus asa"])) {
    return getHadithById(7); // Urusan mukmin selalu baik
  }
  if (matchesAny(q, ["dzikir", "tasbih", "zikir", "subhanallah", "alhamdulillah", "mengingat allah"])) {
    return getHadithById(11); // Dua kalimat tasbih
  }

  // ─── 2. Direct tema_tags matching ───────────────────────────────
  const tagMatch = HADITH_BUKHARI.find(h =>
    (h.tema_tags || []).some(tag => q.includes(tag.toLowerCase()))
  );
  if (tagMatch) return tagMatch;

  // ─── 3. Terjemahan / faedah substring matching ──────────────────
  const textMatch = HADITH_BUKHARI.find(h =>
    h.terjemahan.toLowerCase().includes(q) ||
    h.faedah.toLowerCase().includes(q)
  );
  if (textMatch) return textMatch;

  // ─── 4. Default Fallback ─────────────────────────────────────────
  return getHadithById(7); // Urusan seorang mukmin selalu baik
}

/**
 * Format hadis Bukhari menjadi string siap tampil di UI (untuk bagian Hadits)
 */
export function formatHadithForDisplay(hadith) {
  if (!hadith) return '';
  return `Rasulullah ﷺ bersabda: "${hadith.terjemahan}" (${hadith.nomor}, dari ${hadith.perawi})`;
}

/**
 * Format hadis lengkap dengan teks Arab dan Latin untuk kartu khusus hadis
 */
export function formatHadithFull(hadith) {
  if (!hadith) return null;
  return {
    id: hadith.id,
    nomor: hadith.nomor,
    kitab: hadith.kitab,
    bab: hadith.bab,
    arabic: hadith.arabic,
    latin: hadith.latin,
    terjemahan: hadith.terjemahan,
    perawi: hadith.perawi,
    faedah: hadith.faedah,
    display: formatHadithForDisplay(hadith),
    sumber: `Shahih Al-Bukhari — ${hadith.kitab}`,
  };
}

/**
 * Ambil beberapa hadis acak dari tema tertentu (untuk fitur daily wisdom dsb)
 * @param {string} themeKey - kunci tema dari HADITH_THEMES
 * @param {number} count - jumlah hadis yang diambil
 */
export function getRandomHadithsByTheme(themeKey, count = 1) {
  const hadiths = getHadithsByTheme(themeKey);
  if (!hadiths.length) return [];
  const shuffled = [...hadiths].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Cari hadis berdasarkan nomor Bukhari (format: "HR. Bukhari No. X")
 */
export function findHadithByNumber(nomorBukhari) {
  const q = String(nomorBukhari || '').trim().toLowerCase();
  return HADITH_BUKHARI.find(h => h.nomor.toLowerCase().includes(q)) || null;
}

/**
 * Ambil semua hadis dengan tema yang relevan berdasarkan beberapa kata kunci
 */
export function searchHadiths(query = '', limit = 5) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return HADITH_BUKHARI.slice(0, limit);

  const results = HADITH_BUKHARI.filter(h => {
    return (
      h.terjemahan.toLowerCase().includes(q) ||
      h.faedah.toLowerCase().includes(q) ||
      h.relevansi.toLowerCase().includes(q) ||
      (h.tema_tags || []).some(tag => q.includes(tag.toLowerCase()) || tag.toLowerCase().includes(q))
    );
  });

  return results.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────
function matchesAny(query, keywords) {
  return keywords.some(kw => query.includes(kw));
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return HADITH_BUKHARI[6];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Re-export dari hadithData untuk kemudahan
export { HADITH_BUKHARI, HADITH_THEMES, getHadithById, getHadithsByTheme };
