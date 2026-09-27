// Hadith Service — Al Munawwarah
// Pencarian Hadis Riwayat Bukhari & Muslim yang relevan berdasarkan query/topik
import { HADITH_BUKHARI, HADITH_THEMES, getHadithById, getHadithsByTheme } from '../data/hadithData.js';
import { HADITH_MUSLIM, HADITH_MUSLIM_THEMES, getMuslimHadithById, getMuslimHadithsByTheme } from '../data/hadithMuslimData.js';

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

// Re-export dari hadithData & hadithMuslimData untuk kemudahan
export { 
  HADITH_BUKHARI, HADITH_THEMES, getHadithById, getHadithsByTheme,
  HADITH_MUSLIM, HADITH_MUSLIM_THEMES, getMuslimHadithById, getMuslimHadithsByTheme 
};

/**
 * Mendapatkan koleksi hadis tematik berdasarkan nama perawi ('bukhari' | 'muslim')
 */
export function getThematicHadiths(collection = 'bukhari') {
  return collection === 'muslim' ? HADITH_MUSLIM : HADITH_BUKHARI;
}

/**
 * Mendapatkan indeks tema berdasarkan nama perawi ('bukhari' | 'muslim')
 */
export function getThematicThemes(collection = 'bukhari') {
  return collection === 'muslim' ? HADITH_MUSLIM_THEMES : HADITH_THEMES;
}

/**
 * Mendapatkan hadits tematik berdasarkan ID dan perawi
 */
export function getThematicHadithById(collection = 'bukhari', id) {
  return collection === 'muslim' ? getMuslimHadithById(id) : getHadithById(id);
}

/**
 * Mendapatkan hadits tematik berdasarkan tema dan perawi
 */
export function getThematicHadithsByTheme(collection = 'bukhari', themeKey) {
  return collection === 'muslim' ? getMuslimHadithsByTheme(themeKey) : getHadithsByTheme(themeKey);
}

// ─────────────────────────────────────────────────────────────────
// Hadith Complete Database (Shahih Bukhari & Shahih Muslim)
// ─────────────────────────────────────────────────────────────────

const bookCache = {
  bukhari: new Map(),
  muslim: new Map()
};

const metaCache = {
  bukhari: null,
  muslim: null
};

const searchIndexCache = {
  bukhari: null,
  muslim: null
};

const searchIndexLoading = {
  bukhari: false,
  muslim: false
};

/**
 * Mengambil metadata koleksi hadits ('bukhari' | 'muslim')
 */
export async function getHadithCollectionMeta(collection = 'bukhari') {
  const col = collection === 'muslim' ? 'muslim' : 'bukhari';
  if (metaCache[col]) return metaCache[col];
  try {
    const res = await fetch(`/data/hadits/${col}/meta.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    metaCache[col] = data;
    return data;
  } catch (err) {
    console.error(`Gagal memuat meta ${col}:`, err);
    return null;
  }
}

/**
 * Mengambil isi satu kitab hadits ('bukhari' | 'muslim')
 */
export async function getHadithCollectionBook(collection = 'bukhari', bookNumber) {
  const col = collection === 'muslim' ? 'muslim' : 'bukhari';
  const bNum = parseInt(bookNumber, 10);
  if (isNaN(bNum)) return null;

  if (bookCache[col].has(bNum)) {
    return bookCache[col].get(bNum);
  }

  try {
    const res = await fetch(`/data/hadits/${col}/books/${bNum}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    bookCache[col].set(bNum, data);
    return data;
  } catch (err) {
    console.error(`Gagal memuat Kitab ${bNum} (${col}):`, err);
    return null;
  }
}

/**
 * Menemukan kitab yang memuat hadits nomor tertentu
 */
export function findBookForHadithNumber(num, booksMetaList) {
  const target = parseFloat(num);
  if (isNaN(target)) return null;
  if (!booksMetaList || !booksMetaList.length) return null;

  for (let i = 0; i < booksMetaList.length; i++) {
    const curr = booksMetaList[i];
    const next = booksMetaList[i + 1];
    const nextFirst = next ? next.firstHadithNumber : Infinity;
    if (target >= curr.firstHadithNumber && target < nextFirst) {
      return curr;
    }
  }
  return null;
}

/**
 * Mengambil hadits tunggal berdasarkan nomor hadits global
 */
export async function getHadithByGlobalNumber(collection = 'bukhari', num) {
  const col = collection === 'muslim' ? 'muslim' : 'bukhari';
  const meta = await getHadithCollectionMeta(col);
  if (!meta || !meta.books) return null;

  const bookInfo = findBookForHadithNumber(num, meta.books);
  if (!bookInfo) return null;

  const bookData = await getHadithCollectionBook(col, bookInfo.bookNumber);
  if (!bookData || !bookData.hadiths) return null;

  const target = parseFloat(num);
  const hadith = bookData.hadiths.find(h => h.number === target);
  if (!hadith) return null;

  return {
    ...hadith,
    collection: col,
    bookInfo: {
      bookNumber: bookData.bookNumber,
      nameId: bookData.nameId,
      nameEn: bookData.nameEn,
      totalHadiths: bookData.totalHadiths
    }
  };
}

/**
 * Memuat indeks pencarian global secara lazy-load
 */
export async function loadHadithSearchIndex(collection = 'bukhari') {
  const col = collection === 'muslim' ? 'muslim' : 'bukhari';
  if (searchIndexCache[col]) return searchIndexCache[col];
  if (searchIndexLoading[col]) {
    while (searchIndexLoading[col]) {
      await new Promise(r => setTimeout(r, 100));
    }
    return searchIndexCache[col];
  }

  searchIndexLoading[col] = true;
  try {
    const res = await fetch(`/data/hadits/${col}/search_index.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    searchIndexCache[col] = data;
    return data;
  } catch (err) {
    console.error(`Gagal memuat search_index.json (${col}):`, err);
    return null;
  } finally {
    searchIndexLoading[col] = false;
  }
}

/**
 * Pencarian global ke seluruh hadits dalam satu koleksi
 */
export async function searchHadithCollectionGlobal(collection = 'bukhari', query = '', limit = 50) {
  const col = collection === 'muslim' ? 'muslim' : 'bukhari';
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];

  const maxHadithNum = col === 'muslim' ? 7563 : 7563;

  // Jika query adalah angka, prioritaskan lompat ke nomor hadits
  const asNumber = parseFloat(q);
  if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= maxHadithNum) {
    const exactHadith = await getHadithByGlobalNumber(col, asNumber);
    if (exactHadith) {
      return [{
        number: exactHadith.number,
        arabicNumber: exactHadith.arabicNumber,
        bookNumber: exactHadith.bookNumber,
        bookName: exactHadith.bookInfo.nameId,
        collection: col,
        text: exactHadith.id,
        arab: exactHadith.arab,
        isExactNumber: true
      }];
    }
  }

  const index = await loadHadithSearchIndex(col);
  if (!index) return [];

  const meta = await getHadithCollectionMeta(col);
  const booksMap = new Map();
  if (meta && meta.books) {
    meta.books.forEach(b => booksMap.set(b.bookNumber, b.nameId));
  }

  const tokens = q.split(/\s+/).filter(t => t.length > 1);

  const matched = [];
  for (const item of index) {
    const textLower = item.t.toLowerCase();
    const isMatch = tokens.length > 0 
      ? tokens.every(tok => textLower.includes(tok))
      : textLower.includes(q);

    if (isMatch) {
      matched.push({
        number: item.n,
        arabicNumber: item.an,
        bookNumber: item.b,
        bookName: booksMap.get(item.b) || `Kitab ${item.b}`,
        collection: col,
        text: item.t
      });
      if (matched.length >= limit) break;
    }
  }

  return matched;
}

// Aliases for Bukhari (Backward compatibility)
export const getBukhariMeta = () => getHadithCollectionMeta('bukhari');
export const getBukhariBook = (bookNumber) => getHadithCollectionBook('bukhari', bookNumber);
export const searchBukhariGlobal = (query, limit) => searchHadithCollectionGlobal('bukhari', query, limit);

// Aliases for Muslim
export const getMuslimMeta = () => getHadithCollectionMeta('muslim');
export const getMuslimBook = (bookNumber) => getHadithCollectionBook('muslim', bookNumber);
export const searchMuslimGlobal = (query, limit) => searchHadithCollectionGlobal('muslim', query, limit);
