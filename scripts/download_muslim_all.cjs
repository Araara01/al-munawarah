// Script untuk mengunduh dan menyusun Database Lengkap Shahih Muslim (7.563 Hadis, 56 Kitab + Muqaddimah)
// Menggabungkan teks Arab Utsmani dan Terjemahan Bahasa Indonesia resmi
// Penomoran Jalur Sanad (1 - 7.563) & Penomoran Inti Fuad Abdul Baqi (1 - 3.033)
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'data', 'hadits', 'muslim');
const booksDir = path.join(targetDir, 'books');

if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// 57 Bagian Shahih Muslim (0 Muqaddimah + 56 Kitab)
const MUSLIM_KITAB_NAMES_ID = {
  0: "Pendahuluan & Kaidah Ilmu Hadits (Al-Muqaddimah)",
  1: "Iman (Al-Iman)",
  2: "Bersuci (Ath-Thaharah)",
  3: "Haid (Al-Haidh)",
  4: "Salat (Ash-Shalah)",
  5: "Masjid & Tempat Salat (Al-Masajid)",
  6: "Salat Orang Musafir & Qashar (Shalatul Musafirin)",
  7: "Salat Jumat (Al-Jumu'ah)",
  8: "Salat Dua Hari Raya (Shalatul 'Idain)",
  9: "Salat Istisqa' / Minta Hujan (Al-Istisqa')",
  10: "Gerhana Matahari & Bulan (Al-Kusuf)",
  11: "Jenazah (Al-Jana'iz)",
  12: "Zakat & Sedekah (Az-Zakat)",
  13: "Puasa (Ash-Shiyam)",
  14: "I'tikaf (Al-I'tikaf)",
  15: "Haji & Umrah (Al-Hajj)",
  16: "Pernikahan (An-Nikah)",
  17: "Persusuan (Ar-Radha')",
  18: "Perceraian / Talak (Ath-Thalaq)",
  19: "Li'an / Sumpah Tuduhan (Al-Li'an)",
  20: "Memerdekakan Budak (Al-'Itq)",
  21: "Jual Beli (Al-Buyu')",
  22: "Musaqah, Pinjaman & Bagi Hasil (Al-Musaqah)",
  23: "Hukum Waris (Al-Fara'idh)",
  24: "Hibah & Pemberian (Al-Hibah)",
  25: "Wasiat (Al-Washiyyah)",
  26: "Nazar (An-Nadzar)",
  27: "Sumpah (Al-Aiman)",
  28: "Qashamah, Qisas & Diyat (Al-Qasamah wad-Diyat)",
  29: "Hukum Had / Pidana Islam (Al-Hudud)",
  30: "Peradilan & Keputusan Hukum (Al-Aqdhiyah)",
  31: "Barang Temuan (Al-Luqathah)",
  32: "Jihad & Ekspedisi (Al-Jihad was-Siyar)",
  33: "Kepemimpinan & Pemerintahan (Al-Imarah)",
  34: "Berburu, Sembelihan & Makanan Halal (Ash-Shaid wadz-Dzaba'ih)",
  35: "Kurban (Al-Adhahi)",
  36: "Minuman (Al-Asyribah)",
  37: "Pakaian & Perhiasan (Al-Libas waz-Zinah)",
  38: "Adab & Kesopanan (Al-Adab)",
  39: "Salam & Meminta Izin (As-Salam)",
  40: "Ungkapan & Tutur Kata yang Baik (Al-Alfazh)",
  41: "Syair & Sastra (Asy-Syi'r)",
  42: "Takwil Mimpi (Ar-Ru'ya)",
  43: "Keutamaan Nabi & Mukjizat (Al-Fadhail)",
  44: "Keutamaan Para Sahabat Nabi (Fadhailush Shahabah)",
  45: "Kebajikan, Silaturahmi & Adab Sosial (Al-Birr wash-Shilah)",
  46: "Takdir Ilahi (Al-Qadar)",
  47: "Ilmu Agama (Al-'Ilm)",
  48: "Zikir, Doa, Taubat & Istighfar (Adz-Dzikr wad-Du'a')",
  49: "Pelebut Hati / Zuhud (Ar-Riqaq)",
  50: "Taubat & Ampunan Allah (At-Taubah)",
  51: "Sifat & Ciri Kaum Munafik (Shifatul Munafiqin)",
  52: "Hari Kiamat, Surga & Neraka (Shifatul Qiyamah wal-Jannah wan-Nar)",
  53: "Surga, Kenikmatan & Penghuninya (Al-Jannah wa Na'imuha)",
  54: "Fitnah & Tanda Kiamat Akhir Zaman (Al-Fitan wa Asyrathus Sa'ah)",
  55: "Zuhud & Kesederhanaan Hidup (Az-Zuhd war-Raqa'iq)",
  56: "Tafsir Al-Qur'an (At-Tafsir)"
};

const MUSLIM_BOOKS_CONFIG = [
  { id: 0, first: 1, last: 92, nameEn: "Introduction" },
  { id: 1, first: 93, last: 533, nameEn: "The Book of Faith" },
  { id: 2, first: 534, last: 678, nameEn: "The Book of Purification" },
  { id: 3, first: 679, last: 836, nameEn: "The Book of Menstruation" },
  { id: 4, first: 837, last: 1160, nameEn: "The Book of Prayers" },
  { id: 5, first: 1161, last: 1569, nameEn: "The Book of Mosques and Places of Prayer" },
  { id: 6, first: 1570, last: 1950, nameEn: "The Book of Prayer - Travellers" },
  { id: 7, first: 1951, last: 2043, nameEn: "The Book of Prayer - Friday" },
  { id: 8, first: 2044, last: 2069, nameEn: "The Book of Prayer - Two Eids" },
  { id: 9, first: 2070, last: 2088, nameEn: "The Book of Prayer - Rain" },
  { id: 10, first: 2089, last: 2122, nameEn: "The Book of Prayer - Eclipses" },
  { id: 11, first: 2123, last: 2262, nameEn: "The Book of Prayer - Funerals" },
  { id: 12, first: 2263, last: 2494, nameEn: "The Book of Zakat" },
  { id: 13, first: 2495, last: 2779, nameEn: "The Book of Fasting" },
  { id: 14, first: 2780, last: 2790, nameEn: "The Book of I'tikaf" },
  { id: 15, first: 2791, last: 3397, nameEn: "The Book of Pilgrimage" },
  { id: 16, first: 3398, last: 3567, nameEn: "The Book of Marriage" },
  { id: 17, first: 3568, last: 3651, nameEn: "The Book of Suckling" },
  { id: 18, first: 3652, last: 3742, nameEn: "The Book of Divorce" },
  { id: 19, first: 3743, last: 3769, nameEn: "The Book of Invoking Curses" },
  { id: 20, first: 3770, last: 3800, nameEn: "The Book of Emancipating Slaves" },
  { id: 21, first: 3801, last: 3961, nameEn: "The Book of Transactions" },
  { id: 22, first: 3962, last: 4139, nameEn: "The Book of Musaqah" },
  { id: 23, first: 4140, last: 4162, nameEn: "The Book of the Rules of Inheritance" },
  { id: 24, first: 4163, last: 4203, nameEn: "The Book of Gifts" },
  { id: 25, first: 4204, last: 4234, nameEn: "The Book of Wills" },
  { id: 26, first: 4235, last: 4253, nameEn: "The Book of Vows" },
  { id: 27, first: 4254, last: 4341, nameEn: "The Book of Oaths" },
  { id: 28, first: 4342, last: 4397, nameEn: "The Book of Qasas and Diyat" },
  { id: 29, first: 4398, last: 4469, nameEn: "The Book of Legal Punishments" },
  { id: 30, first: 4470, last: 4497, nameEn: "The Book of Judicial Decisions" },
  { id: 31, first: 4498, last: 4518, nameEn: "The Book of Lost Property" },
  { id: 32, first: 4519, last: 4700, nameEn: "The Book of Jihad and Expeditions" },
  { id: 33, first: 4701, last: 4967, nameEn: "The Book on Government" },
  { id: 34, first: 4968, last: 5063, nameEn: "The Book of Hunting and Slaughter" },
  { id: 35, first: 5064, last: 5126, nameEn: "The Book of Sacrifices" },
  { id: 36, first: 5127, last: 5384, nameEn: "The Book of Drinks" },
  { id: 37, first: 5385, last: 5585, nameEn: "The Book of Clothes and Adornment" },
  { id: 38, first: 5586, last: 5645, nameEn: "The Book of Manners and Etiquette" },
  { id: 39, first: 5646, last: 5861, nameEn: "The Book of Greetings" },
  { id: 40, first: 5862, last: 5884, nameEn: "The Book Concerning the Use of Correct Words" },
  { id: 41, first: 5885, last: 5896, nameEn: "The Book of Poetry" },
  { id: 42, first: 5897, last: 5937, nameEn: "The Book of Dreams" },
  { id: 43, first: 5938, last: 6168, nameEn: "The Book of Virtues" },
  { id: 44, first: 6169, last: 6499, nameEn: "The Book of the Merits of the Companions" },
  { id: 45, first: 6500, last: 6722, nameEn: "The Book of Virtue, Enjoining Good Manners" },
  { id: 46, first: 6723, last: 6774, nameEn: "The Book of Destiny" },
  { id: 47, first: 6775, last: 6804, nameEn: "The Book of Knowledge" },
  { id: 48, first: 6805, last: 6936, nameEn: "The Book of Remembrance of Allah, Supplication, Repentance" },
  { id: 49, first: 6937, last: 6951, nameEn: "The Book of Heart-Melting Traditions" },
  { id: 50, first: 6952, last: 7023, nameEn: "The Book of Repentance" },
  { id: 51, first: 7024, last: 7044, nameEn: "Characteristics of The Hypocrites" },
  { id: 52, first: 7045, last: 7129, nameEn: "Characteristics of the Day of Judgment, Paradise, and Hell" },
  { id: 53, first: 7130, last: 7234, nameEn: "The Book of Paradise, its Description, its Bounties" },
  { id: 54, first: 7235, last: 7416, nameEn: "The Book of Tribulations and Portents of the Last Hour" },
  { id: 55, first: 7417, last: 7522, nameEn: "The Book of Zuhd and Softening of Hearts" },
  { id: 56, first: 7523, last: 7563, nameEn: "The Book of Commentary on the Qur'an" }
];

async function fetchWithRetry(url, maxRetries = 3, timeoutMs = 60000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      console.log(`Mengunduh: ${url} (percobaan ${attempt}/${maxRetries})...`);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      if (attempt === maxRetries) throw err;
      const delay = attempt * 2000;
      console.warn(`[Retry ${attempt}/${maxRetries}] Gagal: ${err.message}. Mencoba lagi dalam ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function main() {
  console.log("=================================================");
  console.log("Mengunduh & Membangun Database Lengkap Shahih Muslim");
  console.log("=================================================");

  console.log("1. Mengunduh data edisi Bahasa Indonesia (ind-muslim)...");
  const dataInd = await fetchWithRetry('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ind-muslim.json');
  console.log(`✓ Data Indonesia berhasil diunduh: ${dataInd.hadiths.length} hadits.`);

  console.log("2. Mengunduh data edisi Teks Arab (ara-muslim)...");
  const dataAra = await fetchWithRetry('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim.json');
  console.log(`✓ Data Arab berhasil diunduh: ${dataAra.hadiths.length} hadits.`);

  // Map teks Arab berdasarkan hadithnumber
  const arabMap = new Map();
  for (const h of dataAra.hadiths) {
    arabMap.set(h.hadithnumber, h.text || '');
  }

  // Kelompokkan hadis ke dalam 57 bagian (0 s/d 56)
  const booksHadiths = new Map();
  for (const b of MUSLIM_BOOKS_CONFIG) {
    booksHadiths.set(b.id, []);
  }

  for (const h of dataInd.hadiths) {
    const num = h.hadithnumber;
    const bookConf = MUSLIM_BOOKS_CONFIG.find(b => num >= b.first && num <= b.last) || MUSLIM_BOOKS_CONFIG[0];
    const bookId = bookConf.id;

    const arabText = arabMap.get(num) || '';
    booksHadiths.get(bookId).push({
      number: num,
      arabicNumber: h.arabicnumber, // Penomoran Fuad Abdul Baqi
      bookNumber: bookId,
      hadithInBook: booksHadiths.get(bookId).length + 1,
      arab: arabText,
      id: h.text,
      grades: h.grades || []
    });
  }

  console.log("3. Menulis file per kitab ke public/data/hadits/muslim/books/...");
  let totalHadithsProcessed = 0;
  const booksMeta = [];

  for (const b of MUSLIM_BOOKS_CONFIG) {
    const bookId = b.id;
    const hadithsInBook = booksHadiths.get(bookId) || [];
    const nameEn = b.nameEn;
    const nameId = MUSLIM_KITAB_NAMES_ID[bookId] || nameEn;

    const firstHadithNumber = hadithsInBook.length > 0 ? hadithsInBook[0].number : b.first;
    const lastHadithNumber = hadithsInBook.length > 0 ? hadithsInBook[hadithsInBook.length - 1].number : b.last;

    const bookObj = {
      bookNumber: bookId,
      nameId: nameId,
      nameEn: nameEn,
      firstHadithNumber: firstHadithNumber,
      lastHadithNumber: lastHadithNumber,
      firstArabicNumber: hadithsInBook[0]?.arabicNumber,
      lastArabicNumber: hadithsInBook[hadithsInBook.length - 1]?.arabicNumber,
      totalHadiths: hadithsInBook.length,
      hadiths: hadithsInBook
    };

    const filePath = path.join(booksDir, `${bookId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(bookObj), 'utf-8');

    totalHadithsProcessed += hadithsInBook.length;

    booksMeta.push({
      bookNumber: bookId,
      nameId: nameId,
      nameEn: nameEn,
      firstHadithNumber: bookObj.firstHadithNumber,
      lastHadithNumber: bookObj.lastHadithNumber,
      firstArabicNumber: bookObj.firstArabicNumber,
      lastArabicNumber: bookObj.lastArabicNumber,
      totalHadiths: hadithsInBook.length,
      sizeKb: Math.round(fs.statSync(filePath).size / 1024)
    });

    if (bookId % 10 === 0 || bookId === 56) {
      console.log(`[Kitab ${bookId}/56] ${nameId} — ${hadithsInBook.length} hadits disimpan (${firstHadithNumber} - ${lastHadithNumber}).`);
    }
  }

  // Tulis meta.json
  const metaPath = path.join(targetDir, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    source: "Shahih Muslim (Al-Musnad As-Shahih)",
    author: "Imam Abul Husain Muslim ibn al-Hajjaj al-Qusyairi an-Naisaburi (204–261 H)",
    totalBooks: booksMeta.length,
    totalHadiths: totalHadithsProcessed,
    range: `${booksMeta[0].firstHadithNumber} - ${booksMeta[booksMeta.length - 1].lastHadithNumber}`,
    coreRange: "1 - 3033 (Penomoran Fuad Abdul Baqi tanpa pengulangan)",
    updatedAt: new Date().toISOString(),
    books: booksMeta
  }, null, 2), 'utf-8');

  // 4. Membangun search_index.json untuk Muslim
  console.log("4. Membangun search_index.json untuk Shahih Muslim...");
  const searchItems = [];
  for (const b of booksMeta) {
    const d = JSON.parse(fs.readFileSync(path.join(booksDir, `${b.bookNumber}.json`), 'utf-8'));
    for (const h of d.hadiths) {
      const cleanText = (h.id || '').replace(/\[|\]/g, '').trim();
      searchItems.push({
        n: h.number,
        an: h.arabicNumber,
        b: b.bookNumber,
        t: cleanText
      });
    }
  }

  const searchIndexPath = path.join(targetDir, 'search_index.json');
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchItems), 'utf-8');

  const totalSizeKb = booksMeta.reduce((acc, curr) => acc + curr.sizeKb, 0);

  console.log("\n=================================================");
  console.log("SELESAI! Database Shahih Muslim Berhasil Dibangun:");
  console.log(`- Total Bagian: ${booksMeta.length} (Muqaddimah + 56 Kitab)`);
  console.log(`- Total Hadits (Mukarrar): ${totalHadithsProcessed.toLocaleString('id-ID')} Hadits`);
  console.log(`- Penomoran Inti Tanpa Pengulangan: ~3.033 Hadits`);
  console.log(`- Ukuran Total: ${(totalSizeKb / 1024).toFixed(2)} MB`);
  console.log(`- Lokasi Data: ${targetDir}`);
  console.log(`- Meta Index: ${metaPath}`);
  console.log(`- Search Index: ${searchIndexPath}`);
  console.log("=================================================\n");
}

main().catch(err => {
  console.error("Gagal membangun database Shahih Muslim:", err);
  process.exit(1);
});
