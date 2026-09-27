// Script untuk mengunduh dan menyusun Database Lengkap Shahih Bukhari (~7.589 Hadis, 97 Kitab)
// Menggabungkan teks Arab Utsmani dan Terjemahan Bahasa Indonesia resmi
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'data', 'hadits', 'bukhari');
const booksDir = path.join(targetDir, 'books');

if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// Terjemahan nama kitab dalam Bahasa Indonesia (97 Kitab Shahih Bukhari)
const KITAB_NAMES_ID = {
  1: "Permulaan Wahyu (Bad'ul Wahyi)",
  2: "Iman (Al-Iman)",
  3: "Ilmu (Al-'Ilm)",
  4: "Wudhu (Al-Wudhu')",
  5: "Mandi Junub (Al-Ghusl)",
  6: "Haid (Al-Haid)",
  7: "Tayammum (At-Tayammum)",
  8: "Salat (Ash-Shalah)",
  9: "Waktu-Waktu Salat (Mawaqit Ash-Shalah)",
  10: "Adzan (Al-Adzan)",
  11: "Salat Jumat (Al-Jumu'ah)",
  12: "Salat Khauf (Shalatul Khauf)",
  13: "Dua Hari Raya (Al-'Idain)",
  14: "Salat Witir (Al-Witr)",
  15: "Istisqa' / Minta Hujan (Al-Istisqa')",
  16: "Gerhana (Al-Kusuf)",
  17: "Sujud Al-Qur'an (Sujudul Qur'an)",
  18: "Meringkas Salat (Taqshir Ash-Shalah)",
  19: "Tahajjud & Salat Malam (At-Tahajjud)",
  20: "Keutamaan Salat di Masjid Mekah & Madinah",
  21: "Perbuatan dalam Salat (Al-'Amal fish-Shalah)",
  22: "Sujud Sahwi (As-Sahw)",
  23: "Jenazah (Al-Jana'iz)",
  24: "Zakat (Az-Zakat)",
  25: "Haji (Al-Hajj)",
  26: "Umrah (Al-'Umrah)",
  27: "Orang yang Terhalang Haji (Al-Muhshar)",
  28: "Denda Berburu saat Ihram (Jaza'ush Shaid)",
  29: "Keutamaan Kota Madinah (Fadhail Al-Madinah)",
  30: "Puasa (Ash-Shaum)",
  31: "Salat Tarawih (Shalatut Tarawih)",
  32: "Keutamaan Lailatul Qadar",
  33: "I'tikaf (Al-I'tikaf)",
  34: "Jual Beli (Al-Buyu')",
  35: "Jual Beli Salam (As-Salam)",
  36: "Hak Memilih dalam Jual Beli (Asy-Syuf'ah)",
  37: "Sewa-Menyewa (Al-Ijarah)",
  38: "Pengalihan Utang (Al-Hawalat)",
  39: "Tanggungan / Jaminan (Al-Kafalah)",
  40: "Perwakilan (Al-Wakalah)",
  41: "Bercocok Tanam (Al-Muzara'ah)",
  42: "Pengairan (Al-Musaqat)",
  43: "Pinjam-Meminjam & Utang Piutang (Al-Istiqradh)",
  44: "Gugatan & Permusuhan (Al-Khushumat)",
  45: "Barang Temuan (Al-Luqathah)",
  46: "Kezaliman & Rampasan (Al-Mazhalim)",
  47: "Serikat / Kongsi (Asy-Syarikah)",
  48: "Gadai (Ar-Rahn)",
  49: "Memerdekakan Budak (Al-'Itq)",
  50: "Perbudakan Mukatab (Al-Mukatab)",
  51: "Hibah & Hadiah (Al-Hibah)",
  52: "Persaksian (Asy-Syahadat)",
  53: "Perdamaian (Ash-Shulh)",
  54: "Syarat-Syarat (Asy-Syuruth)",
  55: "Wasiat (Al-Washaya)",
  56: "Jihad & Ekspedisi (Al-Jihad)",
  57: "Seperlima Harta Rampasan (Fardhul Khumus)",
  58: "Upeti & Perdamaian Musuh (Al-Jizyah)",
  59: "Awal Mula Penciptaan (Bad'ul Khalq)",
  60: "Kisah Para Nabi (Ahaditsul Anbiya')",
  61: "Keutamaan Sahabat & Kabilah (Al-Manaqib)",
  62: "Keutamaan Sahabat Nabi (Fadhail Ashhabin Nabi)",
  63: "Keutamaan Kaum Anshar (Manaqibul Anshar)",
  64: "Peperangan Nabi / Maghazi (Al-Maghazi)",
  65: "Tafsir Al-Qur'an (Tafsirul Qur'an)",
  66: "Keutamaan Al-Qur'an (Fadhailul Qur'an)",
  67: "Pernikahan (An-Nikah)",
  68: "Perceraian / Talak (Ath-Thalaq)",
  69: "Nafkah Keluarga (An-Nafaqat)",
  70: "Makanan (Al-Ath'imah)",
  71: "Aqiqah (Al-'Aqiqah)",
  72: "Sembelihan & Berburu (Adz-Dzaba'ih)",
  73: "Kurban (Al-Adhahi)",
  74: "Minuman (Al-Asyribah)",
  75: "Orang Sakit (Al-Mardha)",
  76: "Pengobatan (Ath-Thibb)",
  77: "Pakaian & Perhiasan (Al-Libas)",
  78: "Adab & Akhlak Mulia (Al-Adab)",
  79: "Meminta Izin (Al-Isti'dzan)",
  80: "Doa-Doa (Ad-Da'awat)",
  81: "Pelebut Hati / Zuhud (Ar-Riqaq)",
  82: "Takdir Ilahi (Al-Qadar)",
  83: "Sumpah & Nazar (Al-Aiman wan Nudzur)",
  84: "Kifarat Sumpah (Kaffaratul Aiman)",
  85: "Hukum Waris / Faraidh (Al-Fara'idh)",
  86: "Hukum Had / Pidana Islam (Al-Hudud)",
  87: "Qishash / Tebusan Darah (Ad-Diyat)",
  88: "Orang yang Murtad (Istitabatul Murtaddin)",
  89: "Pemaksaan / Ikrah (Al-Ikrah)",
  90: "Trik / Tipu Muslihat (Al-Hiyal)",
  91: "Takwil Mimpi (Ta'birur Ru'ya)",
  92: "Fitnah & Ujian Akhir Zaman (Al-Fitan)",
  93: "Hukum & Kepemimpinan (Al-Ahkam)",
  94: "Harapan & Cita-Cita (At-Tamanni)",
  95: "Berpegang pada Hadis Ahad (Akhbarul Ahad)",
  96: "Berpegang pada Al-Qur'an & Sunnah (Al-I'tisham)",
  97: "Keesaan Allah / Tauhid (At-Tauhid)"
};

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
      console.warn(`[Retry ${attempt}/${maxRetries}] Gagal mengunduh: ${err.message}. Mencoba lagi dalam ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function main() {
  console.log("=================================================");
  console.log("Mengunduh & Membangun Database Lengkap Shahih Bukhari");
  console.log("=================================================");

  console.log("1. Mengunduh data edisi Bahasa Indonesia...");
  const dataInd = await fetchWithRetry('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ind-bukhari.json');
  console.log(`✓ Data Indonesia berhasil diunduh: ${dataInd.hadiths.length} hadits.`);

  console.log("2. Mengunduh data edisi Teks Arab Utsmani...");
  const dataAra = await fetchWithRetry('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json');
  console.log(`✓ Data Arab berhasil diunduh: ${dataAra.hadiths.length} hadits.`);

  // Map teks Arab berdasarkan hadithnumber
  const arabMap = new Map();
  for (const h of dataAra.hadiths) {
    arabMap.set(h.hadithnumber, h.text);
  }

  // Siapkan metadata 97 kitab dengan boundary mapping presisi
  const sections = dataInd.metadata.sections || {};
  const sectionDetails = dataInd.metadata.section_details || {};
  const booksConfig = [];

  for (let i = 1; i <= 97; i++) {
    const sec = sectionDetails[String(i)] || {};
    const nextSec = sectionDetails[String(i + 1)];
    const firstNum = sec.hadithnumber_first || 1;
    const nextFirst = nextSec ? nextSec.hadithnumber_first : Infinity;
    booksConfig.push({
      bookNumber: i,
      first: firstNum,
      nextFirst: nextFirst,
      canonicalLast: sec.hadithnumber_last || firstNum
    });
  }

  // Kelompokkan hadis per book (1 - 97) berdasarkan nomor hadis
  const booksHadiths = new Map();
  for (let i = 1; i <= 97; i++) {
    booksHadiths.set(i, []);
  }

  for (const h of dataInd.hadiths) {
    const num = h.hadithnumber;
    const bookConf = booksConfig.find(b => num >= b.first && num < b.nextFirst) || booksConfig[booksConfig.length - 1];
    const bookNum = bookConf.bookNumber;

    const arabText = arabMap.get(num) || '';
    booksHadiths.get(bookNum).push({
      number: num,
      arabicNumber: h.arabicnumber,
      bookNumber: bookNum,
      hadithInBook: booksHadiths.get(bookNum).length + 1,
      arab: arabText,
      id: h.text,
      grades: h.grades || []
    });
  }

  console.log("3. Menulis file per kitab ke public/data/hadits/bukhari/books/...");
  let totalHadithsProcessed = 0;
  const booksMeta = [];

  for (let bookId = 1; bookId <= 97; bookId++) {
    const hadithsInBook = booksHadiths.get(bookId) || [];
    const secDetail = sectionDetails[String(bookId)] || {};
    const nameEn = sections[String(bookId)] || `Book ${bookId}`;
    const nameId = KITAB_NAMES_ID[bookId] || nameEn;

    const firstHadithNumber = hadithsInBook.length > 0 ? hadithsInBook[0].number : (secDetail.hadithnumber_first || 0);
    const lastHadithNumber = hadithsInBook.length > 0 ? hadithsInBook[hadithsInBook.length - 1].number : (secDetail.hadithnumber_last || 0);

    const bookObj = {
      bookNumber: bookId,
      nameId: nameId,
      nameEn: nameEn,
      firstHadithNumber: firstHadithNumber,
      lastHadithNumber: lastHadithNumber,
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
      totalHadiths: hadithsInBook.length,
      sizeKb: Math.round(fs.statSync(filePath).size / 1024)
    });

    if (bookId % 10 === 0 || bookId === 97) {
      console.log(`[Kitab ${bookId}/97] ${nameId} — ${hadithsInBook.length} hadits disimpan (${firstHadithNumber} - ${lastHadithNumber}).`);
    }
  }

  // Tulis meta.json
  const metaPath = path.join(targetDir, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    source: "Shahih Al-Bukhari (Al-Jami' Al-Musnad As-Shahih)",
    author: "Imam Abu Abdullah Muhammad ibn Ismail Al-Bukhari (194–256 H)",
    totalBooks: booksMeta.length,
    totalHadiths: totalHadithsProcessed,
    range: `${booksMeta[0].firstHadithNumber} - ${booksMeta[booksMeta.length - 1].lastHadithNumber}`,
    updatedAt: new Date().toISOString(),
    books: booksMeta
  }, null, 2), 'utf-8');

  const totalSizeKb = booksMeta.reduce((acc, curr) => acc + curr.sizeKb, 0);

  console.log("\n=================================================");
  console.log("SELESAI! Database Shahih Bukhari Berhasil Dibangun:");
  console.log(`- Total Kitab: ${booksMeta.length} Kitab (Lengkap 1 - 97)`);
  console.log(`- Total Hadits: ${totalHadithsProcessed.toLocaleString('id-ID')} Hadits`);
  console.log(`- Ukuran Total: ${(totalSizeKb / 1024).toFixed(2)} MB`);
  console.log(`- Lokasi Data: ${targetDir}`);
  console.log(`- Meta Index: ${metaPath}`);
  console.log("=================================================\n");
}

main().catch(err => {
  console.error("Gagal membangun database Shahih Bukhari:", err);
  process.exit(1);
});
