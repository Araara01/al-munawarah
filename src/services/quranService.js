export async function getSurahDetail(surahNumber) {
  try {
    // Fetch Indonesian translation with Arabic & Latin
    const resId = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (!resId.ok) throw new Error("Failed to fetch equran.id API");
    const dataId = await resId.json();
    
    // Fetch English translation
    const resEn = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`);
    if (!resEn.ok) throw new Error("Failed to fetch alquran.cloud API");
    const dataEn = await resEn.json();

    const ayahsId = dataId.data.ayat || [];
    const ayahsEn = dataEn.data.ayahs || [];

    const combinedAyahs = ayahsId.map((ayah, index) => {
      return {
        surah_number: dataId.data.nomor,
        surah_name: dataId.data.namaLatin,
        ayah_number: ayah.nomorAyat,
        arabic_text: ayah.teksArab,
        latin_text: ayah.teksLatin,
        translation_id: ayah.teksIndonesia,
        translation_en: ayahsEn[index]?.text || "",
        audio_url: ayah.audio["05"] // Misyari Rasyid Al-Afasi
      };
    });

    return {
      number: dataId.data.nomor,
      name: dataId.data.namaLatin,
      arabic: dataId.data.nama,
      numberOfAyahs: dataId.data.jumlahAyat,
      revelation: dataId.data.tempatTurun === "Mekah" ? "MAKKIYYAH" : "MADANIYYAH",
      translation: dataId.data.arti,
      description: dataId.data.deskripsi,
      ayahs: combinedAyahs
    };
  } catch (error) {
    console.error("Error fetching Surah detail:", error);
    throw error;
  }
}
