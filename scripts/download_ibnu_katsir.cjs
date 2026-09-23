const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'data', 'tafsir', 'ibnu-katsir');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function fetchWithRetry(url, maxRetries = 3, timeoutMs = 15000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      if (attempt === maxRetries) throw err;
      const delay = attempt * 1000;
      console.warn(`[Retry ${attempt}/${maxRetries}] Failed ${url}: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function downloadSurah(sNum) {
  const url = `https://raw.githubusercontent.com/renpwn/alquran.js/master/alquran/Alquran_${sNum}.json`;
  const d = await fetchWithRetry(url);
  const ayahsMap = {};
  let totalWithTafsir = 0;

  d.ayahs.forEach((a, idx) => {
    const num = idx + 1;
    const text = (a.ibnu_katsir || '').trim();
    ayahsMap[num] = text;
    if (text.length > 0) totalWithTafsir++;
  });

  const out = {
    surah: sNum,
    name: d.name || '',
    englishName: d.englishName || '',
    totalAyahs: d.ayahs.length,
    totalWithTafsir,
    source: "Tafsir Ibnu Katsir (Bahasa Indonesia)",
    author: "Al-Hafizh Imaduddin Ismail bin Umar bin Katsir",
    ayahs: ayahsMap
  };

  const filePath = path.join(targetDir, `${sNum}.json`);
  fs.writeFileSync(filePath, JSON.stringify(out), 'utf-8');
  return {
    surah: sNum,
    name: d.englishName,
    totalAyahs: d.ayahs.length,
    totalWithTafsir,
    sizeKb: Math.round(fs.statSync(filePath).size / 1024)
  };
}

async function main() {
  console.log(`Starting download of Tafsir Ibnu Katsir for 114 Surahs...`);
  const meta = [];
  const concurrency = 4;
  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);

  for (let i = 0; i < surahs.length; i += concurrency) {
    const batch = surahs.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(sNum => downloadSurah(sNum)));
    results.forEach(res => {
      meta.push(res);
      console.log(`[Surah ${res.surah}/114] ${res.name} - ${res.totalWithTafsir}/${res.totalAyahs} ayat ber-tafsir (${res.sizeKb} KB)`);
    });
  }

  const metaPath = path.join(targetDir, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    source: "Tafsir Ibnu Katsir (Bahasa Indonesia)",
    author: "Al-Hafizh Imaduddin Ismail bin Umar bin Katsir",
    totalSurahs: meta.length,
    updatedAt: new Date().toISOString(),
    surahs: meta
  }, null, 2), 'utf-8');

  const totalSizeKb = meta.reduce((acc, curr) => acc + curr.sizeKb, 0);
  console.log(`\n========================================`);
  console.log(`Tafsir Ibnu Katsir successfully built!`);
  console.log(`Total Surahs: ${meta.length}/114`);
  console.log(`Total Storage: ${(totalSizeKb / 1024).toFixed(2)} MB`);
  console.log(`Meta index written to: ${metaPath}`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("FATAL ERROR downloading Tafsir Ibnu Katsir:", err);
  process.exit(1);
});
