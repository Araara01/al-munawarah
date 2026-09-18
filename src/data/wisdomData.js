// Database Mutiara Cahaya Hidup, Krisis Cepat, dan Mode Kebijaksanaan

export const DAILY_WISDOMS = [
  {
    id: 1,
    sourceType: 'islamic',
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Maka sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan.",
    reference: "QS. Al-Insyirah [94]: 5-6",
    reflection: "Kesulitan tidak pernah datang sendirian. Di dalam inti badai yang paling pekat, pintu-pintu keringanan sudah disiapkan Tuhan berdampingan dengan ujian itu.",
    category: "Harapan & Ujian"
  },
  {
    id: 2,
    sourceType: 'universal',
    quote: "Kita menderita lebih sering dalam imajinasi kita daripada dalam kenyataan yang sebenarnya.",
    author: "Seneca (Filsuf Stoikisme)",
    reflection: "Kecemasan sering kali melipatgandakan beban hidup. Kendalikan pikiranmu: bedakan apa yang nyata terjadi hari ini dengan skenario buruk yang hanya hidup di kepalamu.",
    category: "Ketenangan Pikiran"
  },
  {
    id: 3,
    sourceType: 'islamic',
    arabic: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ",
    translation: "Dan bertawakallah kepada Allah Yang Hidup, Yang tidak mati, dan bertasbihlah dengan memuji-Nya.",
    reference: "QS. Al-Furqan [25]: 58",
    reflection: "Ketika menyandarkan harapan pada manusia atau materi, kekecewaan adalah keniscayaan. Namun saat bersandar pada Dzat Yang Maha Abadi, hati menemukan jangkar yang kokoh.",
    category: "Penyandaran Diri"
  },
  {
    id: 4,
    sourceType: 'universal',
    quote: "Dia yang memiliki 'alasan' untuk hidup, dapat menanggung hampir semua 'bagaimana' cara hidupnya.",
    author: "Viktor Frankl (Psikiater & Korban Holocaust, Penemu Logoterapi)",
    reflection: "Penderitaan manusia menjadi tak tertahankan saat kehilangan makna. Temukan makna di balik setiap luka, maka engkau akan memiliki daya lentur (resilience) yang tak terbatas.",
    category: "Makna Hidup"
  },
  {
    id: 5,
    sourceType: 'islamic',
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.",
    reference: "QS. Al-Baqarah [2]: 286",
    reflection: "Jika saat ini pundakmu terasa begitu berat, itu adalah tanda bahwa kapasitas batinmu dipercaya cukup kuat untuk melewatinya. Engkau lebih tangguh dari yang kau sangka.",
    category: "Kekuatan Batin"
  },
  {
    id: 6,
    sourceType: 'universal',
    quote: "Bukan hal-hal di luar diri kita yang mengganggu kita, melainkan cara pandang kita terhadap hal-hal tersebut.",
    author: "Epictetus (Filsuf Yunani)",
    reflection: "Ketenangan batin bukan tentang dunia luar yang selalu ramah, melainkan tentang kedaulatan batinmu untuk tidak membiarkan hal di luar kendali merusak kedamaianmu.",
    category: "Pengendalian Emosi"
  },
  {
    id: 7,
    sourceType: 'islamic',
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
    reference: "QS. Ar-Ra'd [13]: 28",
    reflection: "Ketika dunia riuh dan pikiran berkecamuk, kembali bersujud dan mengingat keagungan-Nya adalah oase paling murni untuk jiwa yang lelah.",
    category: "Ketenteraman Jiwa"
  }
];

export const CRISIS_TOPICS = [
  {
    id: 'anxiety',
    icon: 'Brain',
    title: 'Cemas & Overthinking',
    subtitle: 'Menenangkan pikiran yang bising dan ketakutan akan masa depan',
    prompt: 'Saya sedang merasa sangat cemas dan overthinking tentang masa depan hidup saya. Rasanya kepala penuh dan sulit bernapas lega. Mohon berikan saya bimbingan mendalam, dari sisi ketenangan hati spiritual dan nalar psikologis praktis.'
  },
  {
    id: 'lost_direction',
    icon: 'Compass',
    title: 'Kehilangan Arah Hidup',
    subtitle: 'Menemukan kembali tujuan, gairah, dan makna eksistensi',
    prompt: 'Saya merasa tersesat, hampa, dan tidak tahu apa tujuan hidup saya sebenarnya saat ini. Semua terasa monoton dan tak berarti. Tolong beri saya cahaya hidup untuk menemukan kembali jangkar eksistensi saya.'
  },
  {
    id: 'grief_heartbreak',
    icon: 'HeartCrack',
    title: 'Patah Hati & Duka Luka',
    subtitle: 'Menyembuhkan kepedihan kehilangan dan pengkhianatan',
    prompt: 'Hati saya sedang hancur karena kehilangan orang yang sangat saya sayangi dan pengkhianatan yang menyakitkan. Bagaimana cara menyembuhkan luka batin ini baik menurut kearifan Islam maupun hikmah universal?'
  },
  {
    id: 'career_failure',
    icon: 'TrendingDown',
    title: 'Gagal Karir & Finansial',
    subtitle: 'Bangkit dari kejatuhan rezeki, hutang, dan rasa minder',
    prompt: 'Saya baru saja mengalami kegagalan besar dalam karir dan usaha, keuangan terpuruk dan saya merasa seperti orang gagal yang memalukan. Bagaimana cara merestrukturisasi mental, tawakal, dan langkah aksi untuk bangkit?'
  },
  {
    id: 'guilt_regret',
    icon: 'ShieldAlert',
    title: 'Penyesalan & Rasa Bersalah',
    subtitle: 'Berdamai dengan masa lalu kelam dan mencari pengampunan',
    prompt: 'Saya dihantui rasa bersalah yang teramat besar atas kesalahan dan dosa masa lalu saya. Rasanya saya tidak layak bahagia atau diampuni. Bagaimana cara saya bertaubat, memaafkan diri sendiri, dan melangkah maju?'
  },
  {
    id: 'exhausted_soul',
    icon: 'Sparkles',
    title: 'Jiwa Lelah (Burnout)',
    subtitle: 'Memulihkan energi batin dan melepaskan beban ekspektasi',
    prompt: 'Saya merasa lelah secara fisik, mental, dan emosional (burnout total). Tuntutan dari mana-mana terasa mencekik. Bagaimana cara melepaskan beban berlebih ini dan menemukan jeda yang memulihkan sukma?'
  }
];

export const LIFE_MODES = [
  {
    id: 'harmony',
    name: 'Harmoni Universal & Islami',
    badge: 'Rekomendasi Utama',
    desc: 'Memadukan keindahan dalil Al-Qur\'an & Sunnah dengan filosofi kebijaksanaan universal, sains psikologi, dan solusi nyata.',
    systemPromptKey: 'harmony'
  },
  {
    id: 'islamic',
    name: 'Cahaya Hikmah Islami',
    badge: 'Tazkiyatun Nafs',
    desc: 'Fokus pada Al-Qur\'an, Hadits Shahih, fiqih prioritas kehidupan, teladan Nabi SAW, dan doa penyejuk kalbu.',
    systemPromptKey: 'islamic'
  },
  {
    id: 'universal',
    name: 'Filosofis & Humanistik',
    badge: 'Universal Ethics',
    desc: 'Pendekatan netral, universal untuk seluruh manusia: Stoikisme, Etika Kebajikan, Psikologi Kognitif, dan Nalar Logika.',
    systemPromptKey: 'universal'
  },
  {
    id: 'healing',
    name: 'Pelipur Jiwa & Empati',
    badge: 'Safe Space',
    desc: 'Fokus pada penerimaan emosi, validasi perasaan, kehangatan kata, dan pelepasan beban batin tanpa menghakimi.',
    systemPromptKey: 'healing'
  },
  {
    id: 'strategic',
    name: 'Solusi Taktis & Karir',
    badge: 'Action Plan',
    desc: 'Langkah taktis, terstruktur poin per poin, pemecahan masalah karir, finansial, dan efektivitas hidup sehari-hari.',
    systemPromptKey: 'strategic'
  }
];
