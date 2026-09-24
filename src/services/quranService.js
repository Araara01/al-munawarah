// Quran Database Service
// Connects to local static Tafsir Ibnu Katsir database, equran.id API v2 & alquran.cloud
import { SURAH_LIST, JUZ_LIST, POPULAR_AYAHS } from '../data/quranData.js';

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
  if (ayah.audio_url) {
    return ayah.audio_url;
  }
  const sNum = parseInt(ayah.surah_number || ayah.surahNumber, 10);
  const aNum = parseInt(ayah.ayah_number || ayah.ayahNumber, 10);
  if (sNum && aNum) {
    const sStr = String(sNum).padStart(3, '0');
    const aStr = String(aNum).padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
  }
  return '';
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

/**
 * Total Ayahs in the complete 114 Surahs of the Al-Qur'an (Hafs 'an 'Asim standard)
 */
export const TOTAL_QURAN_AYAHS = 6236;

/**
 * Determine which Juz (1-30) an ayah belongs to
 */
export function getJuzForAyah(surahNumber, ayahNumber) {
  const sNum = parseInt(surahNumber, 10);
  const aNum = parseInt(ayahNumber, 10) || 1;
  if (!sNum) return 1;

  for (const juz of JUZ_LIST) {
    const isAfterStart = sNum > juz.start.surah || (sNum === juz.start.surah && aNum >= juz.start.ayah);
    const isBeforeEnd = sNum < juz.end.surah || (sNum === juz.end.surah && aNum <= juz.end.ayah);
    if (isAfterStart && isBeforeEnd) {
      return juz.number;
    }
  }
  return 1;
}

/**
 * Calculate complete Quran reading progress based on marked last read & saved ayahs
 */
export function calculateQuranProgress(lastRead, savedAyahs = []) {
  let activeSurah = null;
  let activeAyah = 1;
  let surahArabic = '';
  let surahName = '';
  let source = 'none';

  if (lastRead && lastRead.surahNumber) {
    activeSurah = parseInt(lastRead.surahNumber, 10);
    activeAyah = parseInt(lastRead.ayahNumber, 10) || 1;
    surahArabic = lastRead.surahArabic || '';
    surahName = lastRead.surahName || '';
    source = 'last_read';
  } else if (savedAyahs && savedAyahs.length > 0) {
    const latest = savedAyahs[0];
    activeSurah = parseInt(latest.surah_number || latest.surahNumber, 10);
    activeAyah = parseInt(latest.ayah_number || latest.ayahNumber, 10) || 1;
    surahArabic = latest.arabic_text || '';
    surahName = latest.surah_name || latest.surahName || '';
    source = 'saved_ayahs';
  }

  if (!activeSurah) {
    return {
      hasProgress: false,
      percentage: 0,
      cumulativeAyahs: 0,
      totalAyahs: TOTAL_QURAN_AYAHS,
      currentSurah: null,
      currentAyah: 1,
      juzNumber: 1,
      surahPercentage: 0,
      savedCount: savedAyahs.length,
      surahName: '',
      surahArabic: '',
      source: 'none'
    };
  }

  const surahObj = SURAH_LIST.find(s => s.number === activeSurah);
  const resolvedSurahName = surahObj ? surahObj.name : (surahName || `Surah ${activeSurah}`);
  const resolvedSurahArabic = surahObj ? surahObj.arabic : surahArabic;
  const surahAyahs = surahObj ? surahObj.numberOfAyahs : 1;

  let cumulative = 0;
  for (let i = 0; i < SURAH_LIST.length; i++) {
    const s = SURAH_LIST[i];
    if (s.number < activeSurah) {
      cumulative += s.numberOfAyahs;
    } else if (s.number === activeSurah) {
      cumulative += Math.min(activeAyah, s.numberOfAyahs);
      break;
    }
  }

  const surahPercentage = Math.min(100, Math.round((activeAyah / surahAyahs) * 100));
  const overallPercentage = ((cumulative / TOTAL_QURAN_AYAHS) * 100).toFixed(1);
  const currentJuz = getJuzForAyah(activeSurah, activeAyah);

  return {
    hasProgress: true,
    percentage: parseFloat(overallPercentage),
    cumulativeAyahs: cumulative,
    totalAyahs: TOTAL_QURAN_AYAHS,
    currentSurah: surahObj || { 
      number: activeSurah, 
      name: resolvedSurahName, 
      arabic: resolvedSurahArabic, 
      numberOfAyahs: surahAyahs 
    },
    currentAyah: activeAyah,
    surahName: resolvedSurahName,
    surahArabic: resolvedSurahArabic,
    juzNumber: currentJuz,
    surahPercentage,
    savedCount: savedAyahs.length,
    source
  };
}

/**
 * Generate a fast lookup map for all 114 surahs to show progress and marked count
 */
export function getSurahStatsMap(savedAyahs = [], lastRead = null) {
  const map = {};
  const activeSurahNum = lastRead?.surahNumber ? parseInt(lastRead.surahNumber, 10) : null;
  const activeAyahNum = lastRead?.ayahNumber ? parseInt(lastRead.ayahNumber, 10) : 1;

  // Pre-aggregate saved count per surah
  const savedCountBySurah = {};
  for (const a of savedAyahs) {
    const s = parseInt(a.surah_number || a.surahNumber, 10);
    if (s) {
      savedCountBySurah[s] = (savedCountBySurah[s] || 0) + 1;
    }
  }

  for (const s of SURAH_LIST) {
    const sNum = s.number;
    const markedCount = savedCountBySurah[sNum] || 0;
    const isCurrent = activeSurahNum === sNum;
    const isPassed = activeSurahNum ? sNum < activeSurahNum : false;

    let progressPercent = 0;
    if (isCurrent) {
      progressPercent = Math.min(100, Math.round((activeAyahNum / s.numberOfAyahs) * 100));
    } else if (isPassed) {
      progressPercent = 100;
    } else if (markedCount > 0) {
      progressPercent = Math.min(100, Math.round((markedCount / s.numberOfAyahs) * 100));
    }

    map[sNum] = {
      markedCount,
      isCurrent,
      isPassed,
      currentAyah: isCurrent ? activeAyahNum : null,
      progressPercent
    };
  }
  return map;
}

/**
 * Get Surah Metadata by number or name
 */
export function getSurahMeta(surahNumberOrName) {
  if (!surahNumberOrName) return null;
  const num = parseInt(surahNumberOrName, 10);
  if (num && num >= 1 && num <= 114) {
    return SURAH_LIST.find(s => s.number === num) || null;
  }
  const clean = String(surahNumberOrName).toLowerCase().replace(/^qs\.?\s*/i, '').replace(/^surat\s*/i, '').replace(/^surah\s*/i, '').trim();
  return SURAH_LIST.find(s => 
    s.name.toLowerCase() === clean || 
    s.name.toLowerCase().replace(/[^a-z]/g, '') === clean.replace(/[^a-z]/g, '') ||
    s.translation.toLowerCase().includes(clean)
  ) || null;
}

/**
 * Retrieve verified Ayah data from the Quran Database.
 * First checks curated POPULAR_AYAHS for instant lookup,
 * then queries getSurahDetail() to load authentic Arabic, Latin,
 * official Kemenag Indonesian translation, and Ibnu Katsir Tafsir from local static JSON.
 */
export async function getAyahFromDatabase(surahNumber, ayahNumber) {
  const sNum = parseInt(surahNumber, 10);
  if (!sNum || sNum < 1 || sNum > 114) return null;

  const aNumStr = String(ayahNumber || '1').trim();

  // 1. Try finding in curated POPULAR_AYAHS first (instant retrieval)
  const popular = POPULAR_AYAHS.find(a => 
    a.surah_number === sNum && 
    (String(a.ayah_number) === aNumStr || aNumStr.includes(String(a.ayah_number)) || String(a.ayah_number).includes(aNumStr))
  );

  // 2. Fetch full authentic data from database / cache
  try {
    const surah = await getSurahDetail(sNum);
    if (surah && surah.ayahs && surah.ayahs.length > 0) {
      const parsedANum = parseInt(aNumStr, 10) || 1;
      const foundAyah = surah.ayahs.find(a => a.ayah_number === parsedANum) || surah.ayahs[0];

      let combinedArabic = foundAyah.arabic_text;
      let combinedTranslation = foundAyah.translation_id;
      let combinedLatin = foundAyah.latin_text;
      let combinedTafsir = foundAyah.tafsir;
      let combinedIbnuKatsir = foundAyah.tafsir_ibnu_katsir;
      let combinedKemenag = foundAyah.tafsir_kemenag;

      if (aNumStr.includes('-')) {
        const parts = aNumStr.split('-').map(p => parseInt(p.trim(), 10)).filter(Boolean);
        if (parts.length === 2 && parts[1] >= parts[0] && parts[1] - parts[0] <= 5) {
          const rangeAyahs = surah.ayahs.filter(a => a.ayah_number >= parts[0] && a.ayah_number <= parts[1]);
          if (rangeAyahs.length > 0) {
            combinedArabic = rangeAyahs.map(a => a.arabic_text).join(' • ');
            combinedTranslation = rangeAyahs.map(a => a.translation_id).join(' ');
            combinedLatin = rangeAyahs.map(a => a.latin_text).join(' ');
            combinedTafsir = rangeAyahs.map(a => a.tafsir).filter(Boolean).join('\n\n');
            combinedIbnuKatsir = rangeAyahs.map(a => a.tafsir_ibnu_katsir).filter(Boolean).join('\n\n');
            combinedKemenag = rangeAyahs.map(a => a.tafsir_kemenag).filter(Boolean).join('\n\n');
          }
        }
      }

      return {
        surah_number: surah.number,
        surah_name: surah.name,
        surah_arabic: surah.arabic,
        surah_translation: surah.translation,
        revelation: surah.revelation,
        total_ayahs: surah.numberOfAyahs,
        ayah_number: aNumStr,
        arabic_text: combinedArabic || popular?.arabic_text || '',
        latin_text: combinedLatin || popular?.latin_text || '',
        translation_id: combinedTranslation || popular?.translation_id || '',
        translation_en: foundAyah.translation_en || '',
        tafsir: combinedTafsir || popular?.tafsir || '',
        tafsir_ibnu_katsir: combinedIbnuKatsir || popular?.tafsir || '',
        tafsir_kemenag: combinedKemenag || '',
        tafsir_source: foundAyah.tafsir_source || 'ibnu_katsir_local',
        audio_url: foundAyah.audio_url || popular?.audio_url || getAyahAudioUrl(foundAyah),
        fromDatabase: true,
        databaseSource: 'Kemenag RI & Tafsir Ibnu Katsir'
      };
    }
  } catch (err) {
    console.warn(`[getAyahFromDatabase] Detail fetch failed for Surah ${sNum}, using fallback:`, err.message);
  }

  // 3. Fallback to POPULAR_AYAHS if available
  if (popular) {
    const surahMeta = SURAH_LIST.find(s => s.number === sNum);
    return {
      ...popular,
      surah_arabic: surahMeta?.arabic || '',
      surah_translation: surahMeta?.translation || '',
      total_ayahs: surahMeta?.numberOfAyahs || 1,
      fromDatabase: true,
      databaseSource: 'Kemenag RI & Tafsir Ibnu Katsir'
    };
  }

  // 4. Last fallback to SURAH_LIST meta
  const surahMeta = SURAH_LIST.find(s => s.number === sNum);
  if (surahMeta) {
    return {
      surah_number: sNum,
      surah_name: surahMeta.name,
      surah_arabic: surahMeta.arabic,
      surah_translation: surahMeta.translation,
      revelation: surahMeta.revelation,
      total_ayahs: surahMeta.numberOfAyahs,
      ayah_number: aNumStr,
      arabic_text: '',
      latin_text: surahMeta.name,
      translation_id: `Surah ${surahMeta.name} (${surahMeta.translation})`,
      tafsir: '',
      tafsir_ibnu_katsir: '',
      fromDatabase: true,
      databaseSource: 'Kemenag RI'
    };
  }

  return null;
}

/**
 * Match user problem/query to the most appropriate Surah and Ayah in the Quran database.
 */
export function findQuranReferenceForProblem(query = '') {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    return POPULAR_AYAHS[0]; // QS. Asy-Syarh: 5-6
  }

  // 1. Direct name match (e.g. user mentions specific Surah name)
  const nameMatch = POPULAR_AYAHS.find(item => q.includes(item.surah_name.toLowerCase()));
  if (nameMatch) return nameMatch;

  // 2. High-priority keyword cluster heuristics
  if (q.includes("rezeki") || q.includes("uang") || q.includes("kerja") || q.includes("karir") || q.includes("bisnis") || q.includes("finansial") || q.includes("miskin") || q.includes("utang") || q.includes("nafkah")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "At-Talaq") || POPULAR_AYAHS[3];
  }
  if (q.includes("tenang") || q.includes("gelisah") || q.includes("cemas") || q.includes("overthinking") || q.includes("takut") || q.includes("panik") || q.includes("khawatir") || q.includes("gundah") || q.includes("waswas")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Ar-Ra'd") || POPULAR_AYAHS[2];
  }
  if (q.includes("dosa") || q.includes("salah") || q.includes("sesal") || q.includes("taubat") || q.includes("maksiat") || q.includes("ampun") || q.includes("hina") || q.includes("bersalah")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Az-Zumar") || POPULAR_AYAHS[5];
  }
  if (q.includes("orang tua") || q.includes("ibu") || q.includes("ayah") || q.includes("keluarga") || q.includes("bapak") || q.includes("anak") || q.includes("berbakti")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Al-Isra'") || POPULAR_AYAHS[6];
  }
  if (q.includes("doa") || q.includes("berdoa") || q.includes("minta") || q.includes("hajat") || q.includes("kabul") || q.includes("dengar")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Al-Baqarah" && String(a.ayah_number) === "186") || POPULAR_AYAHS[7];
  }
  if (q.includes("syukur") || q.includes("nikmat") || q.includes("terima kasih") || q.includes("bahagia") || q.includes("berkah")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Ibrahim") || POPULAR_AYAHS[8];
  }
  if (q.includes("sendiri") || q.includes("kesepian") || q.includes("ditinggal") || q.includes("hampa") || q.includes("patah hati") || q.includes("ditinggalkan")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Ad-Duha") || POPULAR_AYAHS[4];
  }
  if (q.includes("jodoh") || q.includes("nikah") || q.includes("pasangan") || q.includes("suami") || q.includes("istri") || q.includes("cinta") || q.includes("rumah tangga")) {
    const jodohAyah = POPULAR_AYAHS.find(a => a.surah_name === "Ar-Rum");
    if (jodohAyah) return jodohAyah;
  }
  if (q.includes("sakit") || q.includes("kesembuhan") || q.includes("penyakit") || q.includes("sembuh") || q.includes("sehat") || q.includes("obat")) {
    const sakitAyah = POPULAR_AYAHS.find(a => a.surah_name === "Asy-Syu'ara'");
    if (sakitAyah) return sakitAyah;
  }
  if (q.includes("ujian") || q.includes("musibah") || q.includes("meninggal") || q.includes("kehilangan") || q.includes("wafat") || q.includes("kematian") || q.includes("duka")) {
    const musibahAyah = POPULAR_AYAHS.find(a => a.surah_name === "Al-Baqarah" && String(a.ayah_number).includes("155"));
    if (musibahAyah) return musibahAyah;
  }
  if (q.includes("lemah") || q.includes("gagal") || q.includes("minder") || q.includes("bangkit") || q.includes("kalah") || q.includes("kecewa")) {
    const bangkitAyah = POPULAR_AYAHS.find(a => a.surah_name === "Ali 'Imran" && String(a.ayah_number) === "139");
    if (bangkitAyah) return bangkitAyah;
  }
  if (q.includes("terjebak") || q.includes("buntu") || q.includes("sesak") || q.includes("himpitan") || q.includes("kepepet") || q.includes("yunus")) {
    const yunusAyah = POPULAR_AYAHS.find(a => a.surah_name === "Al-Anbiya'");
    if (yunusAyah) return yunusAyah;
  }
  if (q.includes("beban") || q.includes("tidak sanggup") || q.includes("tak sanggup") || q.includes("lelah") || q.includes("berat")) {
    return POPULAR_AYAHS.find(a => a.surah_name === "Al-Baqarah" && String(a.ayah_number) === "286") || POPULAR_AYAHS[1];
  }

  // 3. Fallback direct match with remaining POPULAR_AYAHS theme_tags or translations
  const directMatch = POPULAR_AYAHS.find(item => {
    return (item.theme_tags || []).some(tag => q.includes(tag.toLowerCase())) ||
      q.includes(item.translation_id.toLowerCase());
  });
  if (directMatch) return directMatch;

  // 4. Default fallback: QS. Asy-Syarh (5-6)
  return POPULAR_AYAHS[0];
}

