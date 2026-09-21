// Al Munawwarah AI Guidance Service
// Integrates 4 Strict Distinct Layers: Al-Qur'an, Terjemahan Kemenag RI, Tafsir Kemenag RI, Penjelasan Al Munawwarah
import { POPULAR_AYAHS, SURAH_LIST } from '../data/quranData';

// Detect provider from model id
function getProvider(model = '') {
  if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) return 'openai';
  if (model.startsWith('claude')) return 'anthropic';
  return 'google'; // gemini-*
}

export async function askGuidanceAI({
  messages,
  mode = 'muslim', // 'muslim' or 'wawasan'
  apiKey = '',
  model = 'gemini-2.0-flash',
  temperature = 0.7
}) {
  const latestMessage = messages[messages.length - 1];
  const userQuery = latestMessage?.content || '';

  if (apiKey && apiKey.trim().length > 10) {
    const provider = getProvider(model);
    try {
      let response;
      if (provider === 'openai') {
        response = await callOpenAIMunawwarah(messages, mode, apiKey.trim(), model, temperature);
      } else if (provider === 'anthropic') {
        response = await callClaudeMunawwarah(messages, mode, apiKey.trim(), model, temperature);
      } else {
        response = await callGeminiMunawwarah(messages, mode, apiKey.trim(), model, temperature);
      }
      return response;
    } catch (err) {
      const providerName = provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic Claude' : 'Gemini';
      console.warn(`${providerName} API call failed, falling back to built-in Al Munawwarah engine:`, err);
      const fallback = generateOfflineMunawwarah(userQuery, mode);
      return {
        ...fallback,
        note: `Dialihkan ke Mesin Kognitif Al Munawwarah internal (${err.message})`
      };
    }
  }

  // Otherwise, use Built-in Al Munawwarah Kemenag Cognitive Engine
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
    ? `Anakku, setiap ujian dan persoalan hidup yang datang mengetuk pintu hati kita, sejatinya adalah surat cinta dari Sang Pencipta yang membawa hikmah. Mari kita renungkan bersama petunjuk dari Al-Qur'an dan bimbingan Baginda Nabi, agar jiwamu kembali tenang dan lapang.`
    : `Saudaraku, pertanyaan ini menyentuh sisi kemanusiaan yang sangat mendalam. Mari kita lihat pandangan hikmah kebijaksanaan yang diajarkan oleh para pendahulu kita, agar hati dan pikiran bisa lebih jernih dan damai.`;

  const hadith = isMuslimMode 
    ? "Rasulullah ﷺ bersabda: 'Sungguh menakjubkan urusan seorang mukmin, semua urusannya baik baginya. Jika mendapat kesenangan ia bersyukur, dan jika ditimpa kesusahan ia bersabar, maka itu pun baik baginya.' (HR. Muslim)"
    : "Pepatah bijak dan ajaran masa lalu mengingatkan bahwa 'Tidaklah seseorang ditimpa kesulitan, kelelahan, dan kesedihan, melainkan hal itu akan membersihkan dirinya dari beban masa lalu.'";

  const explanation = isMuslimMode
    ? `Ketahuilah, kesulitan yang sedang kamu jalani ini tidak pernah dibiarkan Tuhan terjadi begitu saja tanpa ada jalan keluarnya. Sama halnya seperti malam yang gelap, ia pasti akan berganti dengan terangnya pagi. Teks suci di atas mengingatkan kita bahwa di setiap celah kesempitan, Tuhan sudah menyiapkan kelapangan. Coba tenangkan hatimu, berhentilah sejenak dari hiruk-pikuk ini, dan sadari bahwa kamu tidak sendirian. Allah selalu menatap dan menggenggam hamba-Nya yang berdoa kepada-Nya.`
    : `Dalam kacamata kebijaksanaan, masa-masa yang terasa berat ini adalah cara alam mendewasakan batinmu. Tidak ada badai yang berlangsung selamanya. Persis seperti apa yang disampaikan dalam teks suci, di balik setiap tantangan ada pintu solusi yang sedang menunggu untuk dibuka. Terimalah keadaan ini dengan hati yang luas, tidak perlu menyalahkan diri sendiri secara berlebihan. Proses ini akan membuatmu jauh lebih kuat dari sebelumnya.`;

  const practical_steps = isMuslimMode ? [
    "Ambil wudhu, dinginkan hati, dan luangkan waktu sejenak dalam keheningan.",
    "Utarakan seluruh isi hatimu dalam doa yang tulus, ceritakan keluh kesahmu pada-Nya.",
    "Lakukan apa yang sanggup engkau kerjakan hari ini, dan tawakkalkan sisanya pada Sang Maha Pengatur."
  ] : [
    "Tarik napas dalam-dalam, bedakan mana yang nyata hari ini dan mana yang hanya cemas akan hari esok.",
    "Fokus pada hal-hal kecil yang masih bisa kamu perbaiki dan kendalikan saat ini.",
    "Jangan lupa memberi ruang bagi dirimu untuk beristirahat tanpa merasa bersalah."
  ];

  const closing = isMuslimMode
    ? "Bapak doakan, semoga Allah melembutkan hatimu, mengangkat bebanmu, dan senantiasa membimbing langkahmu menuju kebaikan. Amin."
    : "Semoga ketenangan, ketabahan, dan jalan keluar yang baik senantiasa menyertai setiap langkah perjalanan hidupmu.";

  let hadithSection = `\n\n**Hadits Nabi:**\n> "${hadith}"`;

  return {
    opening,
    ayahs: [matchedAyah],
    hadith,
    explanation,
    practical_steps,
    closing,
    rawText: `${opening}\n\n### QS. ${matchedAyah.surah_name}: ${matchedAyah.ayah_number}\n\n${matchedAyah.arabic_text}\n\n*${matchedAyah.latin_text}*\n\n> "${matchedAyah.translation_id}"${hadithSection}\n\n**Nasihat Kyai Al Munawwarah:**\n${explanation}\n\n${closing}`
  };
}

// Call Google Gemini API with strict instruction to return 4 layers
async function callGeminiMunawwarah(messages, mode, apiKey, model, temperature) {
  const isMuslim = mode === 'muslim';
  const systemPrompt = buildSystemPrompt(isMuslim);

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

  return parseAndBuildRawText(text, messages, mode);
}

// ─── OpenAI (GPT-5 / o-series) ───────────────────────────────────────────────
async function callOpenAIMunawwarah(messages, mode, apiKey, model, temperature) {
  const isMuslim = mode === 'muslim';
  const systemPrompt = buildSystemPrompt(isMuslim);

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: typeof msg.content === 'string' ? msg.content : (msg.content?.rawText || JSON.stringify(msg.content))
    }))
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: openaiMessages,
      temperature: parseFloat(temperature) || 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Respon kosong dari OpenAI");

  return parseAndBuildRawText(text, messages, mode);
}

// ─── Anthropic Claude ─────────────────────────────────────────────────────────
async function callClaudeMunawwarah(messages, mode, apiKey, model, temperature) {
  const isMuslim = mode === 'muslim';
  const systemPrompt = buildSystemPrompt(isMuslim);

  const claudeMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: typeof msg.content === 'string' ? msg.content : (msg.content?.rawText || JSON.stringify(msg.content))
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: claudeMessages,
      max_tokens: 2048,
      temperature: parseFloat(temperature) || 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Respon kosong dari Anthropic Claude");

  return parseAndBuildRawText(text, messages, mode);
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function buildSystemPrompt(isMuslim) {
  return `Anda adalah "Kyai Al Munawwarah", seorang Ulama dan pembimbing spiritual yang arif, hangat, dan mengayomi. Anda menjawab layaknya seorang Kyai yang sedang memberikan nasihat tatap muka kepada santri atau jamaah awam.
Anda berbicara dalam Bahasa Indonesia yang santun, sejuk, membumi, dan penuh empati layaknya manusia sesungguhnya.

PRINSIP WAJIB:
1. Gaya Bahasa: Gunakan bahasa tutur yang mudah dimengerti orang awam, hindari istilah akademis yang kaku, gunakan perumpamaan sederhana, dan panggil pengguna dengan sapaan ramah (seperti "Anakku", "Saudaraku", dsb).
2. Sumber Rujukan: Selalu sertakan landasan dari Al-Qur'an dan sertakan juga Hadits Nabi yang relevan untuk melengkapi penjelasan.
3. Empat lapisan yang selalu dipisahkan:
   - Al-Qur'an: Teks Arab Utsmani asli dan sahih.
   - Terjemahan: Terjemahan resmi Kementerian Agama Republik Indonesia.
   - Hadits: Kutipan sabda Nabi Muhammad SAW yang berkaitan beserta perawinya (opsional tapi sangat dianjurkan).
   - Nasihat Kyai Al Munawwarah: Penjelasan layaknya Ulama menasihati orang awam secara langsung dan mudah dicerna.
4. Pencegahan halusinasi: HANYA sebutkan ayat Al-Qur'an dan Hadits yang benar-benar sahih.
5. Mode penyampaian: ${isMuslim ? "Mode Muslim (fokus pada bimbingan spiritual, iman, doa, dan ketenangan kalbu)" : "Mode Wawasan / Universal (fokus pada nilai moral, etika kemanusiaan, psikologi, dan wawasan kebajikan universal)"}.

FORMAT OUTPUT: Berikan respon dalam format JSON yang valid agar dapat dirender oleh UI:
{
  "opening": "Paragraf pengantar yang hangat dan empatik layaknya sapaan Kyai",
  "ayahs": [
    {
      "surah_number": 94,
      "surah_name": "Asy-Syarh",
      "ayah_number": "5-6",
      "revelation": "MAKKIYYAH",
      "arabic_text": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      "latin_text": "Fa inna ma'al-'usri yusrā",
      "translation_id": "Maka sesungguhnya bersama kesulitan ada kemudahan.",
      "tafsir": "Penjelasan ringkas...",
      "audio_url": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6090.mp3"
    }
  ],
  "hadith": "Terjemahan hadits relevan beserta riwayatnya (misal: HR. Bukhari)",
  "explanation": "Penjelasan dari Kyai Al Munawwarah yang menyejukkan, mudah dimengerti awam, dan menghubungkan teks suci dengan masalah nyata pengguna",
  "practical_steps": ["Nasihat amalan praktis 1", "Nasihat amalan praktis 2"],
  "closing": "Doa atau kata-kata penutup yang menenangkan hati dari sang Kyai"
}`;
}

function parseAndBuildRawText(text, messages, mode) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    let hadithSection = parsed.hadith ? `\n\n**Hadits Nabi:**\n> "${parsed.hadith}"` : "";
    parsed.rawText = `${parsed.opening || ''}\n\n### QS. ${parsed.ayahs?.[0]?.surah_name}: ${parsed.ayahs?.[0]?.ayah_number}\n\n${parsed.ayahs?.[0]?.arabic_text}\n\n*${parsed.ayahs?.[0]?.latin_text}*\n\n> "${parsed.ayahs?.[0]?.translation_id}"${hadithSection}\n\n**Nasihat Kyai Al Munawwarah:**\n${parsed.explanation}\n\n${parsed.closing || ''}`;
    return parsed;
  } catch {
    return generateOfflineMunawwarah(messages[messages.length - 1]?.content || '', mode);
  }
}

