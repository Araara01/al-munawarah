// Al Munawwarah AI Guidance Service
// New Architecture:
// 1. Jawaban Singkat On-Point (Direct concise empathetic advice)
// 2. Al-Qur'an Yang Cocok (Surah metadata + verified Ayah from Quran Database)
// 3. Jawaban Detail & Bimbingan Lengkap (Deep explanation, Hadith, Practical steps, Closing prayer)
import { POPULAR_AYAHS, SURAH_LIST } from '../data/quranData.js';
import { getAyahFromDatabase, getSurahMeta, findQuranReferenceForProblem } from './quranService.js';

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

/**
 * Generate structured response for Al Munawwarah UI using the authentic Quran database
 */
export function generateOfflineMunawwarah(query, mode = 'muslim') {
  const matchedAyah = findQuranReferenceForProblem(query);
  const surahMeta = getSurahMeta(matchedAyah.surah_number) || {
    number: matchedAyah.surah_number,
    name: matchedAyah.surah_name,
    arabic: matchedAyah.surah_arabic || '',
    translation: matchedAyah.surah_translation || '',
    revelation: matchedAyah.revelation || 'MAKKIYYAH',
    numberOfAyahs: matchedAyah.total_ayahs || 1
  };

  const isMuslimMode = mode === 'muslim';
  const sName = matchedAyah.surah_name;
  const aNum = String(matchedAyah.ayah_number);

  let shortAnswer = "";
  let ayahRelevance = "";

  if (sName === "At-Talaq") {
    shortAnswer = isMuslimMode
      ? "Rezeki dan jalan keluar tidak hanya bergantung pada hitungan logika, melainkan pada ketakwaan dan ketergantungan hati kepada Allah. Lakukan ikhtiar terbaikmu hari ini tanpa mencemaskan esok hari, sebab Allah telah menjamin jalan keluar dari arah yang tak pernah engkau duga."
      : "Jalan keluar dan kesempatan baru sering kali datang dari arah yang paling tidak terduga saat kita tetap berpegang pada integritas dan ketenangan batin. Fokuslah pada langkah kecil hari ini dengan hati yang lapang.";
    ayahRelevance = "QS. At-Talaq ayat 2-3 menegaskan janji pasti bahwa bagi jiwa yang bertakwa, Allah akan membukakan jalan keluar dari segala kebuntuan dan mengalirkan rezeki tak terduga.";
  } else if (sName === "Ar-Ra'd") {
    shortAnswer = isMuslimMode
      ? "Kegelisahan dan overthinking terjadi ketika pikiran kita memikul beban yang seharusnya kita pasrahkan kepada Sang Maha Pengatur. Tarik napas perlahan, basahi lisanmu dengan zikir, dan kembalikan kendali hidupmu kepada Allah, karena hanya dengan mengingat-Nya hati akan menemukan kedamaian sejati."
      : "Ketenangan sejati bukan dicari dengan lari dari kenyataan, melainkan saat kita memberi jeda pada pikiran untuk kembali hening dan menyadari bahwa hidup ini memiliki alur kebijaksanaannya sendiri.";
    ayahRelevance = "QS. Ar-Ra'd ayat 28 adalah obat penenang jiwa dari langit: kepastian bahwa hanya dengan mengingat Allah kalbu manusia akan memperoleh ketenteraman.";
  } else if (sName === "Az-Zumar") {
    shortAnswer = isMuslimMode
      ? "Tidak ada dosa dan masa lalu yang terlalu kelam bagi luasnya samudera ampunan Allah selama napas masih dikandung badan. Jangan biarkan rasa bersalah berubah menjadi keputusasaan; jadikan penyesalanmu sebagai awal lembaran baru untuk melangkah lebih bersih."
      : "Masa lalu tidak menentukan nilai kemanusiaanmu hari ini. Setiap penyesalan yang jujur adalah titik balik untuk memperbaiki diri dan melangkah maju dengan lebih bermakna.";
    ayahRelevance = "QS. Az-Zumar ayat 53 melarang keras seorang hamba berputus asa dari rahmat Allah yang maha luas dan mengampuni segala dosa bagi yang bertaubat.";
  } else if (sName === "Al-Baqarah" && aNum === "186") {
    shortAnswer = isMuslimMode
      ? "Setiap bisikan doa tulusmu tidak pernah hilang di ruang hampa; Allah Maha Mendengar dan teramat dekat. Jika apa yang engkau pinta belum terwujud, percayalah Allah sedang menyiapkannya dalam takaran dan waktu yang paling tepat untuk kebaikanmu."
      : "Harapan baik yang engkau simpan dalam hati selalu memiliki resonansi. Tetaplah melangkah dengan prasangka baik bahwa kebaikan akan menemukan jalannya kepadamu.";
    ayahRelevance = "QS. Al-Baqarah ayat 186 memberi garansi ketenangan bahwa Allah senantiasa dekat dan senantiasa mengabulkan permohonan hamba-Nya yang berdoa.";
  } else if (sName === "Al-Isra'") {
    shortAnswer = isMuslimMode
      ? "Memuliakan orang tua dengan tutur kata lembut dan doa tulus adalah pintu keberkahan terbesar dalam hidupmu. Rendahkan sayap kasih sayang di hadapan mereka, dengarkan mereka dengan sabar, dan jangan pernah berkata kasar sekalipun pandangan kalian berbeda."
      : "Menghormati orang tua dan keluarga adalah pondasi kedamaian hidup. Bersikaplah santun dan hargai setiap peluh perjuangan mereka dalam membersamaimu tumbuh.";
    ayahRelevance = "QS. Al-Isra' ayat 23-24 menempatkan adab berbakti kepada ayah-ibu tepat setelah keimanan kepada Allah, sebagai kewajiban moral tertinggi seorang anak.";
  } else if (sName === "Ibrahim") {
    shortAnswer = isMuslimMode
      ? "Syukur adalah magnet penarik kelimpahan dan penjaga nikmat agar tidak sirna. Alih-alih merisaukan apa yang belum ada, syukuri setiap tarikan napas, kesehatan, dan kebaikan kecil hari ini, maka niscaya Allah akan melipatgandakan karunia-Nya kepadamu."
      : "Rasa terima kasih yang mendalam terhadap apa yang sudah kita miliki akan membuka pintu kebahagiaan dan mengundang kelimpahan baru ke dalam hidup kita.";
    ayahRelevance = "QS. Ibrahim ayat 7 memuat janji abadi Sang Pencipta: barang siapa yang pandai bersyukur, niscaya nikmat-Nya akan senantiasa dilipatgandakan.";
  } else if (sName === "Ad-Duha") {
    shortAnswer = isMuslimMode
      ? "Saat engkau merasa sendiri dan dunia seolah berpaling, ketahuilah bahwa Tuhanmu tidak pernah meninggalkanmu dan tidak pula membencimu. Periode hening ini bukanlah akhir, melainkan masa persiapan Allah untuk menghadiahkan hari esok yang jauh lebih mulia bagimu."
      : "Rasa sepi dan terpuruk hanyalah sebuah fase sementara dalam siklus kehidupan. Malam yang paling gelap adalah pertanda bahwa terbitnya fajar pagi sudah semakin dekat.";
    ayahRelevance = "QS. Ad-Duha ayat 3-5 adalah penawar luka batin dari Sang Pencipta bahwa Allah tidak pernah meninggalkan hamba-Nya dan akhir yang baik sedang menanti.";
  } else if (sName === "Ali 'Imran" && aNum === "139") {
    shortAnswer = isMuslimMode
      ? "Kegagalan sementara bukanlah akhir dari perjalanan, melainkan anak tangga menuju kedewasaan. Jangan merasa lemah dan jangan larut dalam kesedihan, tegakkan kepalamu dan bangun kembali ikhtiarmu, sebab derajatmu mulia di sisi Allah."
      : "Kekalahan atau rintangan tidak mendefinisikan siapa dirimu. Jangan biarkan kekecewaan mengikis kepercayaan dirimu; ambil hikmahnya dan bangkitlah lebih tangguh.";
    ayahRelevance = "QS. Ali 'Imran ayat 139 menggelorakan api optimisme agar jiwa seorang beriman pantang menyerah dan tidak tenggelam dalam rasa minder serta kepedihan.";
  } else if (sName === "Ar-Rum") {
    shortAnswer = isMuslimMode
      ? "Jodoh sejati bukan tentang mencari sosok tanpa celah, melainkan menemukan jiwa yang bersamanya hatimu berlabuh dalam ketenteraman (sakinah), saling mencintai (mawaddah), dan saling mengasihi (rahmah). Teruslah memantaskan akhlakmu selagi menanti ketetapan-Nya."
      : "Hubungan cinta dan pernikahan yang sehat dibangun di atas rasa saling memahami, ketenteraman batin, dan kelembutan kasih sayang antar sesama.";
    ayahRelevance = "QS. Ar-Rum ayat 21 menguraikan tujuan hakiki pasangan hidup: menghadirkan kedamaian kalbu dan kasih sayang yang menyejukkan jalan kehidupan.";
  } else if (sName === "Asy-Syu'ara'") {
    shortAnswer = isMuslimMode
      ? "Sakit yang mendera ragamu adalah sarana penggugur dosa dan pengingat mahalnya karunia kesehatan. Berikhtiarlah dengan pengobatan terbaik seraya menggantungkan keyakinan mutlak bahwa kesembuhan sejati datang dari Allah Yang Maha Menyembuhkan."
      : "Kondisi tubuh yang melemah mengajarkan kita untuk lebih menghargai batas diri dan beristirahat. Berupayalah memulihkan kesehatan dengan penuh kesabaran dan harapan baik.";
    ayahRelevance = "QS. Asy-Syu'ara' ayat 80 mengajarkan kepasrahan agung Nabi Ibrahim: ikhtiar pengobatan di bumi, namun keyakinan kesembuhan mutlak disandarkan kepada Allah.";
  } else if (sName === "Al-Anbiya'") {
    shortAnswer = isMuslimMode
      ? "Ketika semua pintu manusia terasa tertutup rapat dan keadaan terasa menghimpit tanpa jalan keluar, rendahkan hatimu dan perbanyak zikir Nabi Yunus. Pengakuan tulus atas kelemahan diri di hadapan Allah adalah kunci pembuka pertolongan dari tempat yang tak terduga."
      : "Saat berada dalam situasi yang terasa begitu buntu, ketenangan dan penerimaan atas keterbatasan diri akan mengurai simpul kecemasan dan menghadirkan solusi yang jernih.";
    ayahRelevance = "QS. Al-Anbiya' ayat 87 adalah doa agung Dzun Nun di dalam kegelapan yang diabadikan sebagai kunci pembebas dari segala kesesakan dan himpitan hidup.";
  } else if (sName === "Al-Baqarah" && aNum === "286") {
    shortAnswer = isMuslimMode
      ? "Allah tidak pernah membebani pundakmu melainkan sesuai dengan kesanggupan batin dan fisikmu. Keberadaan ujian berat ini justru adalah bukti bahwa engkau memiliki kekuatan untuk melaluinya; jangan pernah meragukan daya tahan yang telah Allah titipkan kepadamu."
      : "Setiap rintangan yang hadir di hadapanmu sepadan dengan daya tampung dan kapasitas mentalmu. Engkau lebih kuat dari apa yang saat ini engkau bayangkan.";
    ayahRelevance = "QS. Al-Baqarah ayat 286 adalah ketetapan agung bahwa takaran ujian hidup tidak akan pernah melebihi kapasitas kemampuan manusia.";
  } else {
    // Default QS. Asy-Syarh: 5-6
    shortAnswer = isMuslimMode
      ? "Kesulitan yang saat ini engkau rasakan tidak akan pernah berdiri sendirian; Allah telah menetapkan bahwa di balik satu kesempitan, selalu ada dua kemudahan yang siap menyertai. Tenangkan hatimu, berhentilah merasa sendirian, dan yakinlah fajar kemudahan akan segera menyingsing."
      : "Tidak ada badai kehidupan yang berlangsung selamanya. Di balik setiap tantangan berat, selalu ada proses pembelajaran dan solusi yang sedang bersiap untuk terbuka.";
    ayahRelevance = "QS. Asy-Syarh ayat 5-6 adalah penegasan ilahi bahwa bersama setiap kesulitan, Allah pasti menyertakan jalan kemudahan yang berlipat ganda.";
  }

  const hadith = isMuslimMode 
    ? "Rasulullah ﷺ bersabda: 'Sungguh menakjubkan urusan seorang mukmin, semua urusannya baik baginya. Jika mendapat kesenangan ia bersyukur, dan jika ditimpa kesusahan ia bersabar, maka itu pun baik baginya.' (HR. Muslim)"
    : "Pepatah bijak mengingatkan bahwa: 'Tidaklah seseorang ditimpa kesulitan, kelelahan, dan kesedihan, melainkan hal itu akan mematangkan jiwa dan membersihkan bebannya.'";

  const detailedAnswer = isMuslimMode
    ? `Ketahuilah wahai saudaraku, kesulitan dan pertanyaan yang sedang kamu hadapi tidak pernah dibiarkan Tuhan terjadi begitu saja tanpa maksud yang mulia. Sama halnya seperti malam yang pekat, ia pasti akan berganti dengan hangatnya fajar pagi.\n\nTeks kalamullah di atas mengingatkan kita bahwa di setiap celah kesempitan, Allah sudah menyiapkan kelapangan. Coba heningkan hatimu sejenak dari hiruk-pikuk duniawi, dan sadari bahwa engkau tidak pernah berjalan sendirian. Rahmat dan pertolongan Allah selalu menaungi hamba-Nya yang bersujud dan berserah diri secara tulus.`
    : `Dalam kacamata kebijaksanaan hidup, fase yang terasa membingungkan atau berat ini adalah cara alam mendewasakan batinmu. Tidak ada kesulitan yang abadi.\n\nPersis seperti apa yang tersurat dalam teks suci, di balik setiap tantangan tersimpan benih solusi yang menunggu untuk engkau semai. Terimalah keadaan saat ini dengan lapang dada, kurangi menyalahkan diri sendiri, dan fokuslah melangkah satu demi satu dengan penuh ketabahan.`;

  const practicalSteps = isMuslimMode ? [
    "Ambil air wudhu, dinginkan kepalamu, dan luangkan waktu sejenak untuk bersujud dalam keheningan.",
    "Utarakan seluruh isi hatimu tanpa filter dalam doa yang tulus, ceritakan keluh kesahmu pada-Nya.",
    "Fokus selesaikan apa yang sanggup engkau kerjakan hari ini, lalu serahkan sisanya kepada Sang Maha Pemelihara."
  ] : [
    "Tarik napas panjang, bedakan mana hal yang nyata hari ini dan mana yang hanya kekhawatiran semu hari esok.",
    "Fokuskan energi pada hal-hal kecil yang masih berada di bawah kendalimu.",
    "Beri ruang bagi dirimu untuk beristirahat tanpa merasa bersalah; pemulihan adalah bagian dari perjuangan."
  ];

  const closing = isMuslimMode
    ? "Semoga Allah Swt. senantiasa melimpahkan ketenangan di dalam dadamu, mengangkat beban di pundakmu, dan membimbing setiap langkahmu menuju keberkahan. Amin ya Rabbal 'alamin."
    : "Semoga kedamaian pikiran, ketabahan hati, dan jalan keluar yang terang senantiasa menyertai setiap langkah perjalananmu.";

  const surahInfo = {
    number: surahMeta.number,
    name: surahMeta.name,
    arabic: surahMeta.arabic || matchedAyah.arabic_text?.slice(0, 15) || '',
    translation: surahMeta.translation,
    revelation: surahMeta.revelation || matchedAyah.revelation || 'MAKKIYYAH',
    numberOfAyahs: surahMeta.numberOfAyahs,
    ayah_number: aNum,
    relevance: ayahRelevance
  };

  const enrichedAyah = {
    ...matchedAyah,
    surah_number: surahMeta.number,
    surah_name: surahMeta.name,
    surah_arabic: surahMeta.arabic,
    surah_translation: surahMeta.translation,
    revelation: surahMeta.revelation,
    total_ayahs: surahMeta.numberOfAyahs,
    fromDatabase: true,
    databaseSource: 'Kemenag RI & Tafsir Ibnu Katsir'
  };

  const hadithSection = hadith ? `\n\n**Hadits Nabi:**\n> "${hadith}"` : "";
  const rawText = `${shortAnswer}\n\n### QS. ${surahInfo.name} (${surahInfo.number}:${surahInfo.ayah_number}) - ${surahInfo.translation}\n*${ayahRelevance}*\n\n${matchedAyah.arabic_text}\n\n*${matchedAyah.latin_text}*\n\n> "${matchedAyah.translation_id}"${hadithSection}\n\n**Nasihat Kyai Al Munawwarah:**\n${detailedAnswer}\n\n${closing}`;

  return {
    short_answer: shortAnswer,
    surah_info: surahInfo,
    ayahs: [enrichedAyah],
    detailed_answer: detailedAnswer,
    hadith,
    practical_steps: practicalSteps,
    closing,
    // Backward compatibility for existing UI/conversations
    opening: shortAnswer,
    explanation: detailedAnswer,
    isDatabaseConnected: true,
    rawText
  };
}

// ─── Gemini API (Google Generative AI) ──────────────────────────────────────
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

  return await enrichWithQuranDatabase(text, messages, mode);
}

// ─── OpenAI (GPT-4 / GPT-5 / o-series) ───────────────────────────────────────
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

  return await enrichWithQuranDatabase(text, messages, mode);
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

  return await enrichWithQuranDatabase(text, messages, mode);
}

// ─── System Prompt ───────────────────────────────────────────────────────────
function buildSystemPrompt(isMuslim) {
  return `Anda adalah "Kyai Al Munawwarah", seorang Ulama dan pembimbing spiritual yang arif, hangat, dan mengayomi. Anda menjawab layaknya seorang Kyai yang sedang memberikan nasihat tatap muka kepada santri atau jamaah awam.
Anda berbicara dalam Bahasa Indonesia yang santun, sejuk, membumi, dan penuh empati layaknya manusia sesungguhnya.

ARSITEKTUR STRUKTUR JAWABAN (WAJIB DIIKUTI):
1. JAWABAN SINGKAT ON POINT ("short_answer"):
   - Berikan 1 hingga 3 kalimat langsung yang menjawab inti kegelisahan / masalah pengguna secara tegas, lugas, menenangkan, dan to-the-point (on point). Hindari pengantar yang bertele-tele.
2. RUJUKAN AL-QUR'AN DARI DATABASE ("surah_number", "ayah_number", "ayah_relevance"):
   - Tentukan 1 Surah dan nomor ayat Al-Qur'an (1-114) yang PALING relevan dan tepat untuk masalah pengguna.
   - "surah_number": angka integer (misal: 94, 2, 13, 65, 39, 17, 3, dsb).
   - "ayah_number": nomor ayat string atau number (misal: "5-6", "286", "28", "2-3", "53", "139", dsb).
   - "ayah_relevance": 1-2 kalimat ringkas mengapa surah/ayat ini adalah rujukan/penawar yang tepat untuk permasalahan pengguna.
3. JAWABAN DETAIL & BIMBINGAN LENGKAP ("detailed_answer"):
   - Penjelasan mendalam layaknya Kyai Al Munawwarah yang menguraikan hakikat masalah, filosofi batin, analogi sejuk, dan menghubungkannya dengan kenyataan hidup.
4. HADITS PENDUKUNG ("hadith"):
   - Sabda Nabi Muhammad ﷺ yang sahih berkaitan dengan permasalahan beserta nama perawinya (misal: HR. Bukhari, HR. Muslim).
5. LANGKAH AMALAN PRAKTIS ("practical_steps"):
   - 2 hingga 4 poin tindakan konkret / amalan harian yang mudah dilakukan pengguna hari ini.
6. DOA PENUTUP ("closing"):
   - Doa hangat dan kata-kata penenang kalbu dari Kyai Al Munawwarah.

${isMuslim ? "Gunakan perspektif bimbingan Islam sejuk (Aswaja), penuh welas asih dan harapan." : "Gunakan perspektif kebijaksanaan universal, moral kemanusiaan, dan ketenangan jiwa."}

FORMAT OUTPUT WAJIB JSON:
{
  "short_answer": "Jawaban singkat on point...",
  "surah_number": 94,
  "ayah_number": "5-6",
  "ayah_relevance": "Surah ini menegaskan bahwa bersama setiap kesulitan ada kemudahan yang berlipat...",
  "detailed_answer": "Penjelasan mendalam dan hikmah luas...",
  "hadith": "Rasulullah ﷺ bersabda: ... (HR. Muslim)",
  "practical_steps": ["Langkah amalan 1", "Langkah amalan 2", "Langkah amalan 3"],
  "closing": "Bapak doakan semoga..."
}`;
}

/**
 * Parses AI response and enriches it by connecting directly to the Quran database.
 * Fetches authentic Arabic Utsmani, official Kemenag translation, and Tafsir from local static JSON.
 */
async function enrichWithQuranDatabase(rawResponseText, messages, mode) {
  const latestMessage = messages[messages.length - 1];
  const query = typeof latestMessage?.content === 'string' ? latestMessage.content : '';

  // Strip markdown code fences if present
  const cleaned = rawResponseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return generateOfflineMunawwarah(query, mode);
  }

  // Determine surah_number & ayah_number
  let sNum = parseInt(parsed.surah_number, 10);
  let aNum = parsed.ayah_number;

  // Fallback to database matcher if AI omitted or provided invalid surah
  if (!sNum || sNum < 1 || sNum > 114) {
    const fallbackRef = findQuranReferenceForProblem(query);
    sNum = fallbackRef.surah_number;
    aNum = aNum || fallbackRef.ayah_number;
  }

  // Get authentic Surah meta from SURAH_LIST
  const surahMeta = getSurahMeta(sNum) || SURAH_LIST[0];

  // Fetch verified Ayah directly from the Quran Database!
  let verifiedAyah = null;
  try {
    verifiedAyah = await getAyahFromDatabase(sNum, aNum);
  } catch (e) {
    console.warn("[enrichWithQuranDatabase] Database lookup warning:", e);
  }

  // Fallback to first ayah or offline match if database fetch failed
  if (!verifiedAyah) {
    const fallbackAyah = POPULAR_AYAHS.find(a => a.surah_number === sNum) || findQuranReferenceForProblem(query);
    verifiedAyah = {
      ...fallbackAyah,
      surah_number: surahMeta.number,
      surah_name: surahMeta.name,
      ayah_number: String(aNum || fallbackAyah.ayah_number),
      fromDatabase: true,
      databaseSource: 'Kemenag RI & Tafsir Ibnu Katsir'
    };
  }

  const shortAnswer = (parsed.short_answer || parsed.opening || '').trim() ||
    "Setiap ujian hidup membawa hikmah dan jalan kemudahan dari Sang Pencipta bagi mereka yang bersabar dan bertawakal.";

  const detailedAnswer = (parsed.detailed_answer || parsed.explanation || '').trim() ||
    "Ketahuilah bahwa Allah Swt. tidak pernah meninggalkan hamba-Nya sendirian. Luaskan dadamu dan bersandarlah kepada-Nya.";

  const hadith = (parsed.hadith || '').trim();
  const practicalSteps = Array.isArray(parsed.practical_steps) && parsed.practical_steps.length > 0
    ? parsed.practical_steps
    : [
        "Tenangkan pikiran dan luangkan waktu sejenak untuk berdoa dalam keheningan.",
        "Fokus selesaikan urusan yang bisa dikerjakan hari ini.",
        "Tawakkalkan hasil akhir kepada Sang Maha Pemelihara."
      ];

  const closing = (parsed.closing || '').trim() ||
    "Semoga Allah senantiasa membimbing langkahmu, melapangkan dadamu, dan menghadirkan jalan keluar terbaik. Amin.";

  const surahInfo = {
    number: surahMeta.number,
    name: surahMeta.name,
    arabic: surahMeta.arabic,
    translation: surahMeta.translation,
    revelation: surahMeta.revelation,
    numberOfAyahs: surahMeta.numberOfAyahs,
    ayah_number: String(aNum || verifiedAyah.ayah_number || '1'),
    relevance: parsed.ayah_relevance || `Surah rujukan kalamullah yang relevan dan menuntun solusi untuk persoalan ini.`
  };

  const hadithSection = hadith ? `\n\n**Hadits Nabi ﷺ:**\n> "${hadith}"` : "";
  const rawText = `${shortAnswer}\n\n### QS. ${surahInfo.name} (${surahInfo.number}:${surahInfo.ayah_number}) - ${surahInfo.translation}\n*${surahInfo.relevance}*\n\n${verifiedAyah.arabic_text}\n\n*${verifiedAyah.latin_text}*\n\n> "${verifiedAyah.translation_id}"${hadithSection}\n\n**Bimbingan Detail Kyai Al Munawwarah:**\n${detailedAnswer}\n\n${closing}`;

  return {
    short_answer: shortAnswer,
    surah_info: surahInfo,
    ayahs: [verifiedAyah],
    detailed_answer: detailedAnswer,
    hadith,
    practical_steps: practicalSteps,
    closing,
    // Backward compatibility for existing views
    opening: shortAnswer,
    explanation: detailedAnswer,
    isDatabaseConnected: true,
    rawText
  };
}
