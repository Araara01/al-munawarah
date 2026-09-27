// Script untuk membangun indeks pencarian ringkas Shahih Bukhari
// Menghasilkan public/data/hadits/bukhari/search_index.json
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'data', 'hadits', 'bukhari');
const booksDir = path.join(targetDir, 'books');
const outputPath = path.join(targetDir, 'search_index.json');

console.log("Membangun search_index.json dari 97 kitab...");

const searchItems = [];

for (let bookId = 1; bookId <= 97; bookId++) {
  const filePath = path.join(booksDir, `${bookId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File kitab ${filePath} tidak ditemukan.`);
  }

  const bookData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const h of bookData.hadiths) {
    // Bersihkan karakter bracket [perawi] untuk mempercepat pencarian teks dan memperkecil ukuran
    const cleanText = (h.id || '')
      .replace(/\[|\]/g, '')
      .trim();

    searchItems.push({
      n: h.number,
      b: bookId,
      t: cleanText
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(searchItems), 'utf-8');

const sizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
console.log(`✓ Selesai! Indeks pencarian tersimpan di: ${outputPath}`);
console.log(`✓ Total Hadits Terindeks: ${searchItems.length}`);
console.log(`✓ Ukuran File: ${sizeMb} MB`);
