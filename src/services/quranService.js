// Quran Database Service
// Connects to equran.id API v2 (official Kemenag standard) & alquran.cloud
import { SURAH_LIST } from '../data/quranData';

const surahCache = new Map();
const tafsirCache = new Map();

// Helper to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch complete Surah detail including all ayahs, Latin transliteration,
 * Indonesian translation, English translation, Tafsir Kemenag, and Qari audio URLs.
 */
export async function getSurahDetail(surahNumber) {
  const sNum = parseInt(surahNumber, 10);
  if (!sNum || sNum < 1 || sNum > 114) {
    throw new Error(`Surah number invalid: ${surahNumber}`);
  }

  // 1. Check in-memory cache
  if (surahCache.has(sNum)) {
    return surahCache.get(sNum);
  }

  // 2. Check sessionStorage
  try {
    const cachedSession = sessionStorage.getItem(`surah_detail_${sNum}`);
    if (cachedSession) {
      const parsed = JSON.parse(cachedSession);
      surahCache.set(sNum, parsed);
      return parsed;
    }
  } catch (e) {
    // ignore sessionStorage errors
  }

  try {
    // Concurrent fetch: Indonesian Surah + Kemenag Tafsir + English Translation
    const [resId, resTafsir, resEn] = await Promise.allSettled([
      fetchWithTimeout(`https://equran.id/api/v2/surat/${sNum}`),
      fetchWithTimeout(`https://equran.id/api/v2/tafsir/${sNum}`),
      fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${sNum}/en.sahih`, {}, 5000)
    ]);

    if (resId.status !== 'fulfilled' || !resId.value.ok) {
      throw new Error(`Gagal mengambil data Surat ${sNum} dari equran.id`);
    }

    const dataId = await resId.value.json();
    const surahData = dataId.data;

    // Process Tafsir
    let tafsirMap = {};
    if (resTafsir.status === 'fulfilled' && resTafsir.value.ok) {
      try {
        const dataTafsir = await resTafsir.value.json();
        const tafsirList = dataTafsir?.data?.tafsir || [];
        tafsirList.forEach(t => {
          tafsirMap[t.ayat] = t.teks;
        });
      } catch (e) {
        console.warn("Tafsir parsing failed:", e);
      }
    }

    // Process English
    let ayahsEn = [];
    if (resEn.status === 'fulfilled' && resEn.value.ok) {
      try {
        const dataEn = await resEn.value.json();
        ayahsEn = dataEn?.data?.ayahs || [];
      } catch (e) {
        console.warn("English parsing failed:", e);
      }
    }

    const ayahsId = surahData.ayat || [];
    const combinedAyahs = ayahsId.map((ayah, index) => {
      return {
        surah_number: surahData.nomor,
        surah_name: surahData.namaLatin,
        ayah_number: ayah.nomorAyat,
        arabic_text: ayah.teksArab,
        latin_text: ayah.teksLatin,
        translation_id: ayah.teksIndonesia,
        translation_en: ayahsEn[index]?.text || "",
        tafsir: tafsirMap[ayah.nomorAyat] || "",
        audio: ayah.audio || {}, // Map containing "01" through "06"
        audio_url: ayah.audio?.["05"] || Object.values(ayah.audio || {})[0] || ""
      };
    });

    const cleanDescription = (surahData.deskripsi || '')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const result = {
      number: surahData.nomor,
      name: surahData.namaLatin,
      arabic: surahData.nama,
      numberOfAyahs: surahData.jumlahAyat,
      revelation: surahData.tempatTurun === "Mekah" ? "MAKKIYYAH" : "MADANIYYAH",
      translation: surahData.arti,
      description: cleanDescription,
      rawDescription: surahData.deskripsi,
      audioFull: surahData.audioFull || {},
      suratSebelumnya: surahData.suratSebelumnya || null,
      suratSelanjutnya: surahData.suratSelanjutnya || null,
      ayahs: combinedAyahs
    };

    // Save to cache
    surahCache.set(sNum, result);
    try {
      sessionStorage.setItem(`surah_detail_${sNum}`, JSON.stringify(result));
    } catch (e) {
      // ignore quota exceed
    }

    return result;
  } catch (error) {
    console.error(`Error loading Surah ${surahNumber}:`, error);
    throw error;
  }
}

/**
 * Fetch Surah Tafsir directly
 */
export async function getSurahTafsir(surahNumber) {
  const sNum = parseInt(surahNumber, 10);
  if (tafsirCache.has(sNum)) {
    return tafsirCache.get(sNum);
  }

  try {
    const res = await fetchWithTimeout(`https://equran.id/api/v2/tafsir/${sNum}`);
    if (!res.ok) throw new Error("Gagal mengambil tafsir");
    const json = await res.json();
    const tafsirMap = {};
    (json?.data?.tafsir || []).forEach(t => {
      tafsirMap[t.ayat] = t.teks;
    });
    tafsirCache.set(sNum, tafsirMap);
    return tafsirMap;
  } catch (err) {
    console.error("Error fetching tafsir:", err);
    return {};
  }
}

/**
 * Save Last Read Surah & Ayah
 */
export function saveLastRead(surahNumber, surahName, ayahNumber, surahArabic = '') {
  try {
    const data = {
      surahNumber: parseInt(surahNumber, 10),
      surahName: surahName || `Surah ${surahNumber}`,
      surahArabic: surahArabic || '',
      ayahNumber: parseInt(ayahNumber, 10) || 1,
      timestamp: Date.now()
    };
    localStorage.setItem('munawwarah_last_read', JSON.stringify(data));
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Get Last Read
 */
export function getLastRead() {
  try {
    const saved = localStorage.getItem('munawwarah_last_read');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

/**
 * Get Audio URL for specific Qari
 */
export function getAyahAudioUrl(ayah, qariId = "05") {
  if (!ayah) return "";
  if (ayah.audio && ayah.audio[qariId]) {
    return ayah.audio[qariId];
  }
  if (ayah.audio && ayah.audio["05"]) {
    return ayah.audio["05"];
  }
  return ayah.audio_url || "";
}

/**
 * Get Full Surah Audio URL for specific Qari
 */
export function getSurahFullAudioUrl(surah, qariId = "05") {
  if (!surah) return "";
  if (surah.audioFull && surah.audioFull[qariId]) {
    return surah.audioFull[qariId];
  }
  if (surah.audioFull && surah.audioFull["05"]) {
    return surah.audioFull["05"];
  }
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number || surah}.mp3`;
}
