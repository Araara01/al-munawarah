// Al Munawwarah AI Guidance Service
// Integrates 4 Strict Distinct Layers: Al-Qur'an, Terjemahan Kemenag RI, Tafsir Kemenag RI, Penjelasan Al Munawwarah
import { POPULAR_AYAHS, SURAH_LIST } from '../data/quranData';

export async function askGuidanceAI({
  messages,
  mode = 'muslim', // 'muslim' or 'wawasan'
  apiKey = '',
  model = 'gemini-1.5-flash',
  temperature = 0.7
}) {
  const latestMessage = messages[messages.length - 1];
  const userQuery = latestMessage?.content || '';

  // 1. If Gemini API key is configured, call Gemini API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const response = await callGeminiMunawwarah(messages, mode, apiKey.trim(), model, temperature);
      return response;
    } catch (err) {
      console.warn("Gemini API call failed, falling back to built-in Al Munawwarah engine:", err);
      const fallback = generateOfflineMunawwarah(userQuery, mode);
      return {
        ...fallback,
        note: `Dialihkan ke Mesin Kognitif Al Munawwarah internal (${err.message})`
      };
    }
  }

  // 2. Otherwise, use Built-in Al Munawwarah Kemenag Cognitive Engine
  return generateOfflineMunawwarah(userQuery, mode);
}

// Generate structured response for Al Munawwarah UI
export function generateOfflineMunawwarah(query, mode = 'muslim') {
  const q = query.toLowerCase();

  // Find best matching Ayah from verified database
  let matchedAyah = POPULAR_AYAHS.find(ayah => {
    return ayah.theme_tags.some(tag => q.includes(tag)) ||
      q.includes(ayah.surah_name.toLowerCase()) ||
      q.includes(ayah.translation_id.toLowerCase());
  });

  // Default fallback if no direct keyword match
  if (!matchedAyah) {
    if (q.includes("rezeki") || q.includes("uang") || q.includes("kerja") || q.includes("karir") || q.includes("gagal")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "At-Talaq") || POPULAR_AYAHS[3];
    } else if (q.includes("tenang") || q.includes("gelisah") || q.includes("cemas") || q.includes("overthinking") || q.includes("takut")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "Ar-Ra'd") || POPULAR_AYAHS[2];
    } else if (q.includes("dosa") || q.includes("salah") || q.includes("sesal") || q.includes("taubat")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "Az-Zumar") || POPULAR_AYAHS[5];
    } else if (q.includes("orang tua") || q.includes("ibu") || q.includes("ayah") || q.includes("keluarga")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "Al-Isra'") || POPULAR_AYAHS[6];
    } else if (q.includes("doa") || q.includes("berdoa") || q.includes("minta")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "Al-Baqarah" && a.ayah_number === "186") || POPULAR_AYAHS[7];
    } else if (q.includes("syukur") || q.includes("nikmat")) {
      matchedAyah = POPULAR_AYAHS.find(a => a.surah_name === "Ibrahim") || POPULAR_AYAHS[8];
    } else {
      matchedAyah = POPULAR_AYAHS[0]; // QS. Asy-Syarh: 5-6
    }
  }

  const isMuslimMode = mode === 'muslim';

  const opening = isMuslimMode
    ? `Setiap persoalan hidup yang hadir mengetuk pintu kalbumu sesungguhnya membawa hikmah yang mendalam. Al-Qur'an memberikan petunjuk yang terang dan menenangkan jiwa dalam menghadapi keadaan ini.`
    : `Pertanyaan ini menyentuh sisi kemanusiaan yang sangat mendalam dan universal. Al-Qur'an sebagai salah satu sumber kearifan peradaban menawarkan sudut pandang etis dan reflektif bagi siapa saja yang sedang mencari ketenangan nalar dan batin.`;

  const explanation = isMuslimMode
    ? `Kesulitan hidup tidak pernah berdiri sendiri. Ayat ini mengingatkan kita bahwa di dalam setiap lorong sempit yang sedang engkau lalui, selalu ada celah kelapangan dan jalan keluar yang telah disiapkan. Ketika batin terasa sesak, berhentilah sejenak, tenangkan napas, dan sadarilah bahwa engkau tidak pernah ditinggalkan sendirian.`
    : `Dalam sudut pandang kemanusiaan dan kebijaksanaan universal, masa-masa penuh ujian adalah proses alami pendewasaan jiwa. Seperti halnya malam pekat yang selalu melahirkan fajar, kesulitan bukanlah akhir, melainkan jembatan menuju ketangguhan batin yang lebih matang.`;

  const practical_steps = isMuslimMode ? [
    "Ambil wudhu dan luangkan waktu sejenak dalam keheningan tanpa distraksi gawai.",
    "Utarakan seluruh isi hati dalam doa tulus dengan bahasa apa adanya di atas sajadah.",
    "Pilah masalah menjadi apa yang sanggup engkau ikhtiarkan hari ini, dan pasrahkan apa yang di luar kendalimu."
  ] : [
    "Tarik napas dalam-dalam dan bedakan antara fakta yang terjadi hari ini dengan asumsi ketakutan masa depan.",
    "Fokuskan energi batin pada lingkaran pengaruh dan tindakan nyata yang dapat kamu kendalikan saat ini.",
    "Beri ruang bagi diri untuk beristirahat tanpa menyalahkan diri sendiri secara berlebihan."
  ];

  const closing = isMuslimMode
    ? "Semoga Allah menganugerahkan ketetapan hati, kelapangan dada, dan membimbing setiap langkahmu menuju kemudahan dan keberkahan."
    : "Semoga ketenangan, ketabahan, dan kejernihan pikiran senantiasa menyertai setiap langkah perjalanan hidupmu.";

  return {
    opening,
    ayahs: [matchedAyah],
    explanation,
    practical_steps,
    closing,
    rawText: `${opening}\n\n### QS. ${matchedAyah.surah_name}: ${matchedAyah.ayah_number}\n\n${matchedAyah.arabic_text}\n\n*${matchedAyah.latin_text}*\n\n> "${matchedAyah.translation_id}"\n\n**Penjelasan Sederhana Al Munawwarah:**\n${explanation}\n\n${closing}`
  };
}

// Call Google Gemini API with strict instruction to return 4 layers
async function callGeminiMunawwarah(messages, mode, apiKey, model, temperature) {
  const isMuslim = mode === 'muslim';
  const systemPrompt = `Anda adalah "Al Munawwarah", AI penuntun dan penerang pertanyaan kehidupan manusia berbasis Al-Qur'an dan kearifan universal.
Anda berbicara dalam Bahasa Indonesia yang santun, sejuk, ramah, dan empatik.

PRINSIP WAJIB:
1. Empat lapisan yang selalu dipisahkan:
   - Al-Qur'an: Teks Arab Utsmani asli dan sahih.
   - Terjemahan: Terjemahan resmi Kementerian Agama Republik Indonesia (Kemenag RI).
   - Tafsir: Tafsir ringkas Kemenag RI.
   - Penjelasan Sederhana Al Munawwarah: Penjelasan yang menghubungkan ayat dengan pertanyaan manusia sehari-hari.
2. Pencegahan halusinasi: HANYA sebutkan ayat Al-Qur'an yang benar-benar ada di dalam Al-Qur'an beserta surat dan nomor ayat yang tepat.
3. Mode penyampaian: ${isMuslim ? "Mode Muslim (fokus pada bimbingan spiritual, iman, doa, dan ketenangan kalbu)" : "Mode Wawasan / Universal (fokus pada nilai moral, etika kemanusiaan, psikologi, dan wawasan kebajikan universal)"}.

FORMAT OUTPUT: Berikan respon dalam format JSON yang valid agar dapat dirender oleh UI Al Munawwarah:
{
  "opening": "Paragraf pengantar yang hangat dan empatik",
  "ayahs": [
    {
      "surah_number": 94,
      "surah_name": "Asy-Syarh",
      "ayah_number": "5-6",
      "revelation": "MAKKIYYAH",
      "arabic_text": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      "latin_text": "Fa inna ma'al-'usri yusrā",
      "translation_id": "Maka sesungguhnya bersama kesulitan ada kemudahan.",
      "tafsir": "Penjelasan tafsir resmi Kemenag RI...",
      "audio_url": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6090.mp3"
    }
  ],
  "explanation": "Penjelasan sederhana Al Munawwarah dalam bahasa sehari-hari yang mudah dipahami",
  "practical_steps": ["Langkah praktis 1", "Langkah praktis 2", "Langkah praktis 3"],
  "closing": "Kata-kata penutup yang menenangkan hati"
}`;

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.content?.rawText || JSON.stringify(msg.content)) }]
  }));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: parseFloat(temperature) || 0.7,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respon kosong dari Gemini AI");

  try {
    const parsed = JSON.parse(text);
    parsed.rawText = `${parsed.opening || ''}\n\n### QS. ${parsed.ayahs?.[0]?.surah_name}: ${parsed.ayahs?.[0]?.ayah_number}\n\n${parsed.ayahs?.[0]?.arabic_text}\n\n*${parsed.ayahs?.[0]?.latin_text}*\n\n> "${parsed.ayahs?.[0]?.translation_id}"\n\n**Penjelasan:**\n${parsed.explanation}\n\n${parsed.closing || ''}`;
    return parsed;
  } catch {
    // If not JSON, generate structured wrapper
    return generateOfflineMunawwarah(messages[messages.length - 1]?.content || '', mode);
  }
}
