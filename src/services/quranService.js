// Quran Database Service
// Connects to local static Tafsir Ibnu Katsir database, equran.id API v2 & alquran.cloud
import { SURAH_LIST } from '../data/quranData.js';

// Cache version — bump this to invalidate stale sessionStorage caches
const CACHE_VERSION = 'v3_ibk';

const surahCache = new Map();
const tafsirCache = new Map();
const ibnuKatsirCache = new Map();

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
 * Validate that a tafsir map is non-empty and has real content
 */
function isValidTafsirMap(map) {
  if (!map || typeof map !== 'object') return false;
  const keys = Object.keys(map);
  if (keys.length === 0) return false;
  // At least some entries must have meaningful content (> 10 chars)
  return keys.some(k => (map[k] || '').length > 10);
}

/**
 * Fetch Tafsir Ibnu Katsir directly for a specific Surah.
 * Serves from local static database /data/tafsir/ibnu-katsir/${surahNumber}.json
 * with fallback to open CDN.
 */
export async function getTafsirIbnuKatsir(surahNumber) {
  const sNum = parseInt(surahNumber, 10);
  if (!sNum || sNum < 1 || sNum > 114) {
    return {};
  }

  // 1. Check in-memory cache (fastest, always valid)
  if (ibnuKatsirCache.has(sNum)) {
    return ibnuKatsirCache.get(sNum);
  }

  // 2. Check sessionStorage with version guard
  const sessionKey = `tafsir_ibnu_katsir_${CACHE_VERSION}_${sNum}`;
  try {
    const cached = sessionStorage.getItem(sessionKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isValidTafsirMap(parsed)) {
        ibnuKatsirCache.set(sNum, parsed);
        return parsed;
      }
      // Invalid/stale cache — remove it
      sessionStorage.removeItem(sessionKey);
    }
  } catch (e) {}

  // 3. Load from local static database (Fastest, offline-capable, primary source)
  try {
    const res = await fetchWithTimeout(`/data/tafsir/ibnu-katsir/${sNum}.json`, {}, 6000);
    if (res.ok) {
      const data = await res.json();
      const map = data.ayahs || {};
      if (isValidTafsirMap(map)) {
        ibnuKatsirCache.set(sNum, map);
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(map));
        } catch (e) {}
        console.log(`[Tafsir IK] Surah ${sNum} loaded from local DB (${Object.keys(map).length} ayahs)`);
        return map;
      }
    }
  } catch (err) {
    console.warn(`[Tafsir IK] Local fetch failed for surah ${sNum}:`, err.message);
  }

  // 4. Fallback to GitHub Raw CDN
  try {
    const res = await fetchWithTimeout(
      `https://raw.githubusercontent.com/renpwn/alquran.js/master/alquran/Alquran_${sNum}.json`,
      {},
      10000
    );
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.ayahs || []).forEach((a, idx) => {
        const text = (a.ibnu_katsir || '').trim();
        if (text) map[idx + 1] = text;
      });
      if (isValidTafsirMap(map)) {
        ibnuKatsirCache.set(sNum, map);
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(map));
        } catch (e) {}
        console.log(`[Tafsir IK] Surah ${sNum} loaded from GitHub CDN fallback`);
        return map;
      }
    }
  } catch (err) {
    console.error(`[Tafsir IK] All sources failed for surah ${sNum}:`, err.message);
  }

  return {};
}

/**
 * Fetch complete Surah detail including all ayahs, Latin transliteration,
 * Indonesian translation, English translation, Tafsir Ibnu Katsir, Tafsir Kemenag, and Qari audio URLs.
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

  // 2. Check sessionStorage with version guard
  const sessionSurahKey = `surah_detail_${CACHE_VERSION}_${sNum}`;
  try {
    const cachedSession = sessionStorage.getItem(sessionSurahKey);
    if (cachedSession) {
      const parsed = JSON.parse(cachedSession);
      // Validate the cached data has tafsir
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        surahCache.set(sNum, parsed);
        return parsed;
      }
      sessionStorage.removeItem(sessionSurahKey);
    }
  } catch (e) {
    // ignore sessionStorage errors
  }

  try {
    // Concurrent fetch: Indonesian Surah + Kemenag Tafsir + English Translation + Tafsir Ibnu Katsir
    // Tafsir Ibnu Katsir from local DB is always attempted first
    const [resId, resTafsirKemenag, resEn, resIbnuKatsir] = await Promise.allSettled([
      fetchWithTimeout(`https://equran.id/api/v2/surat/${sNum}`),
      fetchWithTimeout(`https://equran.id/api/v2/tafsir/${sNum}`),
      fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${sNum}/en.sahih`, {}, 5000),
      getTafsirIbnuKatsir(sNum) // Always resolves, even if empty
    ]);

    if (resId.status !== 'fulfilled' || !resId.value.ok) {
      throw new Error(`Gagal mengambil data Surat ${sNum} dari equran.id`);
    }

    const dataId = await resId.value.json();
    const surahData = dataId.data;

    // Process Tafsir Kemenag
    let tafsirKemenagMap = {};
    if (resTafsirKemenag.status === 'fulfilled' && resTafsirKemenag.value.ok) {
      try {
        const dataTafsir = await resTafsirKemenag.value.json();
        const tafsirList = dataTafsir?.data?.tafsir || [];
        tafsirList.forEach(t => {
          tafsirKemenagMap[t.ayat] = t.teks;
        });
      } catch (e) {
        console.warn('[Tafsir Kemenag] Parsing failed:', e);
      }
    }

    // Process Tafsir Ibnu Katsir from local DB
    let tafsirIbnuKatsirMap = {};
    if (resIbnuKatsir.status === 'fulfilled' && resIbnuKatsir.value) {
      tafsirIbnuKatsirMap = resIbnuKatsir.value;
    }
    // Validate and log
    const ibnuKatsirCount = Object.keys(tafsirIbnuKatsirMap).length;
    if (ibnuKatsirCount > 0) {
      console.log(`[Surah ${sNum}] Tafsir Ibnu Katsir loaded: ${ibnuKatsirCount} ayahs`);
    } else {
      console.warn(`[Surah ${sNum}] Tafsir Ibnu Katsir not available, using Kemenag fallback`);
    }

    // Process English
    let ayahsEn = [];
    if (resEn.status === 'fulfilled' && resEn.value.ok) {
      try {
        const dataEn = await resEn.value.json();
        ayahsEn = dataEn?.data?.ayahs || [];
      } catch (e) {
        console.warn('[Translation EN] Parsing failed:', e);
      }
    }

    const ayahsId = surahData.ayat || [];
    const combinedAyahs = ayahsId.map((ayah, index) => {
      const ayahNum = ayah.nomorAyat;
      // Support both numeric and string keys (JSON keys are always strings)
      const kemenagText = tafsirKemenagMap[ayahNum] || tafsirKemenagMap[String(ayahNum)] || '';
      const ibnuKatsirText = tafsirIbnuKatsirMap[ayahNum] || tafsirIbnuKatsirMap[String(ayahNum)] || '';

      return {
        surah_number: surahData.nomor,
        surah_name: surahData.namaLatin,
        ayah_number: ayahNum,
        arabic_text: ayah.teksArab,
        latin_text: ayah.teksLatin,
        translation_id: ayah.teksIndonesia,
        translation_en: ayahsEn[index]?.text || '',
        // Default tafsir: Ibnu Katsir first, then Kemenag as fallback
        tafsir: ibnuKatsirText || kemenagText || '',
        tafsir_ibnu_katsir: ibnuKatsirText,
        tafsir_kemenag: kemenagText,
        // Mark tafsir source for UI
        tafsir_source: ibnuKatsirText
          ? 'ibnu_katsir_local'
          : kemenagText
            ? 'kemenag_api'
            : 'none',
        audio: ayah.audio || {}, // Map containing "01" through "06"
        audio_url: ayah.audio?.['05'] || Object.values(ayah.audio || {})[0] || ''
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
      revelation: surahData.tempatTurun === 'Mekah' ? 'MAKKIYYAH' : 'MADANIYYAH',
      translation: surahData.arti,
      description: cleanDescription,
      rawDescription: surahData.deskripsi,
      audioFull: surahData.audioFull || {},
      suratSebelumnya: surahData.suratSebelumnya || null,
      suratSelanjutnya: surahData.suratSelanjutnya || null,
      // Summary stats
      tafsirStats: {
        ibnuKatsirCount: combinedAyahs.filter(a => a.tafsir_ibnu_katsir).length,
        kemenagCount: combinedAyahs.filter(a => a.tafsir_kemenag).length,
        totalAyahs: combinedAyahs.length
      },
      ayahs: combinedAyahs
    };

    // Save to cache
    surahCache.set(sNum, result);
    try {
      sessionStorage.setItem(sessionSurahKey, JSON.stringify(result));
    } catch (e) {
      // ignore quota exceed
    }

    return result;
  } catch (error) {
    console.error(`[Surah ${surahNumber}] Error loading:`, error);
    throw error;
  }
}

/**
 * Fetch Surah Tafsir (Ibnu Katsir or Kemenag) directly
 */
export async function getSurahTafsir(surahNumber, type = 'ibnu_katsir') {
  const sNum = parseInt(surahNumber, 10);
  if (!sNum) return {};

  if (type === 'ibnu_katsir') {
    return getTafsirIbnuKatsir(sNum);
  }

  if (tafsirCache.has(sNum)) {
    return tafsirCache.get(sNum);
  }

  try {
    const res = await fetchWithTimeout(`https://equran.id/api/v2/tafsir/${sNum}`);
    if (!res.ok) throw new Error('Gagal mengambil tafsir Kemenag');
    const json = await res.json();
    const tafsirMap = {};
    (json?.data?.tafsir || []).forEach(t => {
      tafsirMap[t.ayat] = t.teks;
    });
    tafsirCache.set(sNum, tafsirMap);
    return tafsirMap;
  } catch (err) {
    console.error('[Tafsir Kemenag] Error fetching:', err);
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
export function getAyahAudioUrl(ayah, qariId = '05') {
  if (!ayah) return '';
  if (ayah.audio && ayah.audio[qariId]) {
    return ayah.audio[qariId];
  }
  if (ayah.audio && ayah.audio['05']) {
    return ayah.audio['05'];
  }
  return ayah.audio_url || '';
}

/**
 * Get Full Surah Audio URL for specific Qari
 */
export function getSurahFullAudioUrl(surah, qariId = '05') {
  if (!surah) return '';
  if (surah.audioFull && surah.audioFull[qariId]) {
    return surah.audioFull[qariId];
  }
  if (surah.audioFull && surah.audioFull['05']) {
    return surah.audioFull['05'];
  }
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number || surah}.mp3`;
}
