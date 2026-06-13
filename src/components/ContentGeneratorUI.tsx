import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, 
  Wand2, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Hash, 
  Layers, 
  FileCheck, 
  Lock, 
  Zap, 
  ArrowRight,
  Eye, 
  RotateCw, 
  Sliders, 
  Download, 
  SlidersHorizontal,
  Plus, 
  Calendar, 
  TrendingUp, 
  Shuffle, 
  PenTool, 
  CheckCheck,
  ChevronDown,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkle,
  Scale,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../lib/utils';

// Definition of 10 Content Types
export const CONTENT_TYPES = [
  { id: 'carousel', name: '🎠 Carousel Post', desc: 'Multi-slide Instagram/LinkedIn series (3-10 slides)' },
  { id: 'threads', name: '🧵 Threads / Twitter Thread', desc: 'Serial post berantai saling terhubung (3-15 tweets)' },
  { id: 'article', name: '📝 Artikel / Blog Post', desc: 'Konten tulisan panjang terstruktur format Markdown SEO-friendly' },
  { id: 'video_script', name: '🎬 Video Short Script (Shorts/Reels)', desc: 'Naskah video durasi pendek lengkap visual, audio, voiceover' },
  { id: 'reels', name: '🎥 Instagram Reels Script', desc: 'Script komplit + storyboard & deskripsi visual Reels' },
  { id: 'tiktok', name: '🎵 TikTok Script', desc: 'Script naskah viral dengan overlay teks & trending audio' },
  { id: 'single_post', name: '📸 Single Post', desc: 'Satu gambar representatif + caption caption tajam berbobot' },
  { id: 'story', name: '⭕ Story Series', desc: 'Seri story interaktif 3-7 slide dengan poll & sticker ideas' },
  { id: 'newsletter', name: '📧 Email / Newsletter', desc: 'Salinan email promosi persuasif & newsletter asyik' },
  { id: 'caption_pack', name: '✍️ Caption Pack', desc: '3-5 variasi caption berbeda: Edukatif, Santai, Urgent dalam 1 topik' }
];

export const HOOK_FORMULAS = [
  { id: 'question', name: 'Question Hook', emoji: '❓', desc: 'Pertanyaan yang memancing rasa penasaran dan rasa relate', example: '"Kenapa konten kamu sepi viewers padahal upload tiap hari?"', template: 'Kenapa [masalah umum] padahal [asumsi yang dilakukan]?' },
  { id: 'shock_data', name: 'Shock / Data Hook', emoji: '📊', desc: 'Angka atau fakta mengejutkan yang hard to ignore', example: '"90% konten gagal karena kesalahan di 3 detik pertama."', template: '[Persentase/Angka] [target audiens] [fakta mengejutkan] — ini alasannya.' },
  { id: 'story', name: 'Story Hook', emoji: '📖', desc: 'Pembuka cerita personal yang langsung memancing empati', example: '"Tahun lalu saya rugi 50 juta. Ini yang saya pelajari."', template: '[Waktu lalu] saya [peristiwa dramatis]. Ini yang saya pelajari.' },
  { id: 'fear', name: 'Fear / Loss Hook', emoji: '😨', desc: 'Memanfaatkan rasa takut kehilangan (FOMO/loss aversion)', example: '"Kalau masih edit manual di 2025, kamu akan kalah dari kompetitor yang pakai AI."', template: 'Kalau masih [kebiasaan lama] di [tahun ini], kamu akan [konsekuensi negatif].' },
  { id: 'benefit', name: 'Benefit / Result Hook', emoji: '💎', desc: 'Langsung sebutkan manfaat nyata yang bisa didapat', example: '"Dengan template ini saya hemat 10 jam kerja per minggu."', template: 'Dengan [solusi/metode] ini, saya berhasil [hasil konkret + angka].' },
  { id: 'controversial', name: 'Controversial Hook', emoji: '🔥', desc: 'Pernyataan yang melawan opini umum, memancing diskusi', example: '"Followers banyak tidak menjamin penghasilan. Ini yang lebih penting."', template: '[Asumsi umum] ternyata salah. Yang benar adalah [counter-argument].' },
  { id: 'how_to', name: 'How-To Hook', emoji: '🛠️', desc: 'Menawarkan solusi langsung dan praktis sejak baris pertama', example: '"Cara bikin konten viral dalam 5 menit — tanpa kamera mahal."', template: 'Cara [hasil yang diinginkan] dalam [waktu singkat] — tanpa [hambatan umum].' },
  { id: 'mistake', name: 'Mistake Hook', emoji: '❌', desc: 'Menyebut kesalahan umum yang dilakukan target audiens', example: '"3 kesalahan yang bikin bisnis online kamu gak berkembang."', template: '[Angka] kesalahan yang bikin [target audiens] gagal mencapai [tujuan].' },
  { id: 'secret', name: 'Secret / Insider Hook', emoji: '🤫', desc: 'Memberikan kesan bahwa ada informasi eksklusif yang akan diungkap', example: '"Yang tidak diajarkan guru marketing tentang algoritma Instagram."', template: 'Yang tidak [otoritas/umum] ceritakan tentang [topik].' },
  { id: 'list', name: 'List / Number Hook', emoji: '📝', desc: 'Format listicle dengan angka yang memberi ekspektasi jelas', example: '"5 tools AI gratis yang bikin kontenmu terlihat dibuat profesional."', template: '[Angka] [jenis item] yang [manfaat/hasil] untuk [target audiens].' },
  { id: 'comparison', name: 'Comparison / VS Hook', emoji: '⚖️', desc: 'Membandingkan dua hal untuk memancing diskusi dan engagement', example: '"Canva vs Figma untuk UMKM — mana yang lebih worth it?"', template: '[Opsi A] vs [Opsi B] untuk [konteks] — mana yang lebih [kriteria]?' },
  { id: 'challenge', name: 'Challenge Hook', emoji: '🎯', desc: 'Menantang audiens untuk bertindak atau membuktikan sesuatu', example: '"Coba lakukan ini 7 hari dan lihat followers kamu naik."', template: 'Coba [tindakan spesifik] selama [durasi] dan lihat [hasil].' },
  { id: 'authority', name: 'Authority / Social Proof Hook', emoji: '👑', desc: 'Menampilkan kredibilitas atau hasil nyata sebagai bukti', example: '"Setelah bantu 300+ UMKM naik omzet, ini pola yang selalu berhasil."', template: 'Setelah [pencapaian/pengalaman], ini [insight/pola] yang selalu [hasil].' },
  { id: 'trend', name: 'Trend / Viral Hook', emoji: '🔮', desc: 'Menggunakan momen atau tren yang sedang ramai dibicarakan', example: '"Semua orang bicara soal AI tapi gak ada yang kasih tahu cara pakainya."', template: 'Semua orang bicara soal [tren] tapi tidak ada yang [insight yang hilang].' },
  { id: 'pov', name: 'POV / Perspective Hook', emoji: '👀', desc: 'Format POV yang populer di TikTok dan Reels, sangat relate', example: '"POV: Kamu baru tau tools ini dan ngerasa rugi gak tahu dari dulu."', template: 'POV: Kamu [situasi relatable] dan [reaksi/perasaan yang mengikutinya].' }
];

export const PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'Email', 'Website'];
export const TONES = [
  { id: 'professional', label: 'Professional & Kredibel' },
  { id: 'relaxed', label: 'Santai & Akrab (Humoris)' },
  { id: 'informative', label: 'Informatif (Edukasi Dalam)' },
  { id: 'persuasive', label: 'Persuasif (Dorongan Penjualan)' },
  { id: 'bold', label: 'Berani & Provokatif' },
  { id: 'storytelling', label: 'Storytelling Inspiratif' }
];
export const LANGUAGES = ['Bahasa Indonesia', 'English', 'Sunda', 'Jawa', 'Melayu'];

interface ContentGeneratorUIProps {
  user: any;
  profile: any;
  onIncrementTrial?: () => void;
  settings?: any;
}

export function assembleHook(topic: string, targetAudience: string, lengthStr: string): any[] {
  const shortTopic = topic || "Bisnis Digital";
  const shortTarget = targetAudience || "Pemula";
  return HOOK_FORMULAS.map((f) => {
    let hookText = "";
    if (f.id === 'question') {
      hookText = `Kenapa ${shortTopic} kamu terasa sepi padahal sudah mencoba segala tutorial cara jitu dari para suhu di internet?`;
    } else if (f.id === 'shock_data') {
      hookText = `Studi terbaru 2026: 73% ${shortTarget} gagal menguasai ${shortTopic} di 3 bulan pertama karena satu kesalahan fundamental ini!`;
    } else if (f.id === 'story') {
      hookText = `Dulu saya sempat pusing mengurusi ${shortTopic} dan hampir menyerah total. Tapi setelah merubah satu kebiasaan kecil ini, efeknya luar biasa nyata.`;
    } else if (f.id === 'fear') {
      hookText = `Jika kamu masih mengabaikan ${shortTopic} di pertengahan tahun 2026 ini, bersiaplah tertinggal jauh oleh kompetitor yang bergerak serba otomatis.`;
    } else if (f.id === 'benefit') {
      hookText = `Dengan panduan praktis ${shortTopic} ini, saya berhasil menghemat hingga 10 jam jam kerja operasional setiap minggunya! Ringkas dan tanpa ribet.`;
    } else if (f.id === 'controversial') {
      hookText = `Banyak yang bilang belajar ${shortTopic} harus punya modal puluhan juta rupiah. Padahal, modal utamanya cuma konsistensi dan pemahaman pola dasar.`;
    } else if (f.id === 'how_to') {
      hookText = `Cara jitu menguasai ${shortTopic} yang efektif hanya dalam waktu 5 menit setiap hari — tanpa perlu latar belakang coding atau teori berat.`;
    } else if (f.id === 'mistake') {
      hookText = `3 Kesalahan fatal ${shortTarget} saat merancang konsep ${shortTopic} yang bikin budget terkuras sia-sia tanpa hasil yang sebanding.`;
    } else if (f.id === 'secret') {
      hookText = `Ini satu rahasia dapur tentang ${shortTopic} yang jarang sekali disebarluaskan oleh para agensi besar ataupun kreator papan atas.`;
    } else if (f.id === 'list') {
      hookText = `5 Tools digital gratis berkekuatan tinggi yang akan melipatgandakan produktivitas ${shortTopic}-mu seketika hari ini.`;
    } else if (f.id === 'comparison') {
      hookText = `Fokus manual vs Menggunakan AI pintar untuk optimasi ${shortTopic} bagi ${shortTarget} — mana yang sebenarnya paling memberikan ROI nyata?`;
    } else if (f.id === 'challenge') {
      hookText = `Coba ubah strategi ${shortTopic}-mu dengan mempraktikkan metode 3-langkah ini secara konsisten selama 7 hari, dan rasakan peningkatan performanya.`;
    } else if (f.id === 'authority') {
      hookText = `Setelah membantu puluhan pelaku ${shortTarget} menata ulang sistem ${shortTopic} mereka, inilah satu pola kunci yang selalu terbukti berhasil.`;
    } else if (f.id === 'trend') {
      hookText = `Semua orang akhir-akhir ini sedang asyik memperbincangkan tren ${shortTopic} terbaru, namun sayang cuma sedikit yang membagikan langkah riil memulainya.`;
    } else if (f.id === 'pov') {
      hookText = `POV: Kamu baru menyadari ada metode sesederhana ini untuk mengatasi tantangan ${shortTopic}-mu dan langsung nyesel kenapa baru tahu sekarang.`;
    }

    if (lengthStr === 'pendek') {
      hookText = hookText.split('.')[0] + '!';
    } else if (lengthStr === 'panjang') {
      hookText = hookText + ` Jangan sampai Anda melewatkan poin penting ini ya!`;
    }

    return {
      formula: f.name,
      emoji: f.emoji,
      hook: hookText,
      why: `Memiliki sentuhan psikologis ${f.desc} yang sangat cocok untuk audiens "${shortTarget}".`,
      platform_fit: ["Instagram", "TikTok", "LinkedIn", "Twitter/X"],
      strength: 75 + Math.floor(Math.random() * 21)
    };
  });
}

export default function ContentGeneratorUI({ user, profile, onIncrementTrial, settings }: ContentGeneratorUIProps) {
  // Navigation tabs of Content Generator Hub
  const [generatorTab, setGeneratorTab] = useState<'content' | 'hooks'>('content');
  
  // Subscription Tier State
  const [simulatedPlan, setSimulatedPlan] = useState<'guest' | 'pro' | 'vip'>('vip');
  
  // Sync plans real license status
  useEffect(() => {
    if (profile) {
      if (profile.is_premium) {
        setSimulatedPlan(profile.role === 'vip' || profile.role === 'admin' ? 'vip' : 'pro');
      } else {
        setSimulatedPlan('guest');
      }
    }
  }, [profile]);

  // Main generator states
  const [contentType, setContentType] = useState('single_post');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [slidesCount, setSlidesCount] = useState(5);
  
  // Advanced variables
  const [brandVoice, setBrandVoice] = useState('');
  const [keywords, setKeywords] = useState('');
  const [negativeTopics, setNegativeTopics] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [selectedTrend, setSelectedTrend] = useState('');
  const trendingIdeas = [
    'AI adoption in Southeast Asian startups (#AIIndonesia)',
    'Micro-learning habits on Instagram Carousel (#LatihDiri)',
    'Eco-friendly work habits & digital minimalism (#ProductiveLiving)',
  ];

  // App engine system states
  const [activeEngine, setActiveEngine] = useState<'assembly' | 'gemini' | 'nvidia'>('gemini');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  // Output tabs
  const [outputTab, setOutputTab] = useState<'editor' | 'structure' | 'visuals'>('editor');
  
  // Revision / text utilities inside output
  const [editorText, setEditorText] = useState('');
  const [revisingText, setRevisingText] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [variationsList, setVariationsList] = useState<string[]>([]);
  const [generatingVariations, setGeneratingVariations] = useState(false);

  // Dari Sumber (From Source) States
  const [inputSourceTab, setInputSourceTab] = useState<'manual' | 'source'>('manual');
  const [sourceType, setSourceType] = useState<'file' | 'link'>('file');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFileBase64, setSourceFileBase64] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [analyzingSource, setAnalyzingSource] = useState<boolean>(false);
  const [sourceAnalysisResult, setSourceAnalysisResult] = useState<any>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  
  // Repurposing States
  const [repurposeTarget, setRepurposeTarget] = useState('LinkedIn');
  const [repurposedResult, setRepurposedResult] = useState<any>(null);
  const [generatingRepurpose, setGeneratingRepurpose] = useState(false);

  // A/B Testing
  const [abOptionA, setAbOptionA] = useState('');
  const [abOptionB, setAbOptionB] = useState('');
  const [generatingAB, setGeneratingAB] = useState(false);

  // Scheduler States
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [isScheduled, setIsScheduled] = useState(false);

  // ===================================
  // HOOK GENERATOR SPECIFIC STATES
  // ===================================
  const [hookTopic, setHookTopic] = useState('');
  const [hookAudience, setHookAudience] = useState('');
  const [hookPlatform, setHookPlatform] = useState('Instagram');
  const [hookFormula, setHookFormula] = useState('all');
  const [hookLength, setHookLength] = useState<'pendek' | 'sedang' | 'panjang'>('sedang');
  const [hookResults, setHookResults] = useState<any[]>([]);
  const [generatingHooks, setGeneratingHooks] = useState(false);

  // Filters & Sort states for Hook Generator results
  const [hookFilterPlatform, setHookFilterPlatform] = useState('all');
  const [hookFilterFormula, setHookFilterFormula] = useState('all');
  const [hookSortBy, setHookSortBy] = useState<'strength' | 'formula' | 'platform'>('strength');

  // Hook Combiner States
  const [combinerFormulaA, setCombinerFormulaA] = useState('Question Hook');
  const [combinerFormulaB, setCombinerFormulaB] = useState('Fear / Loss Hook');
  const [fusingHook, setFusingHook] = useState(false);
  const [combinedHookResult, setCombinedHookResult] = useState('');

  // A/B Hook Test States
  const [abTestHookA, setAbTestHookA] = useState('');
  const [abTestHookB, setAbTestHookB] = useState('');
  const [testingABHooks, setTestingABHooks] = useState(false);
  const [abTestReport, setAbTestReport] = useState<any>(null);

  // Save Hooks list local history
  const [savedHooks, setSavedHooks] = useState<any[]>([]);

  // Load pending topic checks
  useEffect(() => {
    try {
      const pendingTopic = localStorage.getItem('generator_quick_topic');
      if (pendingTopic) {
        setTopic(pendingTopic);
        setHookTopic(pendingTopic);
        localStorage.removeItem('generator_quick_topic');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // --- Dari Sumber Helper Functions ---
  const handleFileChange = (file: File) => {
    if (!file) return;
    setSourceFile(file);
    setSourceError(null);
    setSourceAnalysisResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setSourceError("Gagal membaca file. Silakan coba file lain.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleAnalyzeSource = async () => {
    setAnalyzingSource(true);
    setSourceError(null);
    setSourceAnalysisResult(null);

    try {
      let endpoint = '';
      let payload = {};

      if (sourceType === 'file') {
        if (!sourceFileBase64) {
          throw new Error('Silakan pilih berkas atau seret file Anda ke kotak unggah.');
        }
        endpoint = '/api/ai/analyze-source-file';
        payload = {
          fileData: sourceFileBase64,
          mimeType: sourceFile?.type || 'application/octet-stream',
          fileName: sourceFile?.name || 'document'
        };
      } else {
        if (!sourceUrl.trim()) {
          throw new Error('Silakan masukkan tautan web yang ingin dianalisis.');
        }
        endpoint = '/api/ai/analyze-source-link';
        payload = {
          url: sourceUrl.trim()
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menganalisis sumber.');
      }

      const data = await response.json();
      setSourceAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setSourceError(err.message || 'Koneksi terganggu. Gagal menganalisis sumber.');
    } finally {
      setAnalyzingSource(false);
    }
  };

  const handleUseSourceContent = () => {
    if (!sourceAnalysisResult) return;
    
    const constructedTopic = `Topik Utama: ${sourceAnalysisResult.topic}\n\nRingkasan Sumber:\n${sourceAnalysisResult.contentSummary}\n\nPoin Penting:\n${sourceAnalysisResult.keyPoints.map((p: string) => `• ${p}`).join('\n')}`;
    setTopic(constructedTopic);
    
    const lowerTone = (sourceAnalysisResult.detectedTone || '').toLowerCase();
    if (lowerTone.includes('santai') || lowerTone.includes('relaxed')) {
      setTone('relaxed');
    } else if (lowerTone.includes('persuasif') || lowerTone.includes('promo') || lowerTone.includes('jual')) {
      setTone('persuasive');
    } else if (lowerTone.includes('eduka') || lowerTone.includes('info')) {
      setTone('informative');
    } else if (lowerTone.includes('berani') || lowerTone.includes('provok')) {
      setTone('bold');
    } else if (lowerTone.includes('cerita') || lowerTone.includes('story')) {
      setTone('storytelling');
    } else {
      setTone('professional');
    }

    if (sourceAnalysisResult.detectedAudience) {
      setBrandVoice(`Target audiens: ${sourceAnalysisResult.detectedAudience}`);
    }

    setInputSourceTab('manual');
    
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-5 right-5 bg-accent-yellow text-bg-primary px-5 py-3 rounded-xl font-bold text-xs shadow-2xl z-50 animate-bounce';
    notification.innerText = '✨ Sumber berhasil diterapkan ke Form Parameters!';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isTypeRestricted = (typeId: string) => {
    if (simulatedPlan === 'guest') {
      return !['single_post', 'caption_pack'].includes(typeId);
    }
    return false;
  };

  const isEngineRestricted = (engineId: 'assembly' | 'gemini' | 'nvidia') => {
    if (simulatedPlan === 'guest') {
      return engineId === 'nvidia';
    }
    if (simulatedPlan === 'pro') {
      return engineId === 'nvidia';
    }
    return false;
  };

  // Assembly Mode Content Generator
  const generateAssemblyMode = () => {
    setGenerating(true);
    setIsSaved(false);
    setError(null);
    
    setTimeout(() => {
      const userCta = callToAction || 'Klik link di bio untuk info selengkapnya ya!';
      const displayTopic = topic.length > 60 ? topic.substring(0, 60) + '...' : topic;
      
      let mockHeadline = `PANDUAN LENGKAP: ${topic.toUpperCase()}`;
      let mockCaption = `Hai! Apakah kamu pernah terpikir tentang hal ini?\n\nKini saatnya membahas "${topic}" secara mendalam. Di dunia yang serba dinamis seperti hari ini, menguasai topik ini adalah jur kunci peningkatan efisiensi.\n\nBeberapa poin emas yang melatarinya:\n1. Mempercepat laju pemecahan masalah\n2. Memberikan perspektif modern teruji\n3. Memangkas rantai operasional berbelit\n\nYuk implementasikan sekarang juga dalam aktivitas harianmu!\n\n📣 CTA: ${userCta}`;
      let mockHashtags = ['DavsplaceStudio', 'MarketingAI', 'AIContent', 'DigitalStorytelling', platform.replace(/\s+/g, '')];
      let mockVisualPrompt = `A premium professional high-quality flat vector design representing ${topic}, in soft twilight dark gray background with rich yellow accents, clean margins, realistic modern style, highly eye-catching for ${platform} feed post, 4k.`;
      
      let extraData: any = {};

      if (contentType === 'carousel') {
        mockHeadline = `Bongkar Rahasia: ${displayTopic}`;
        extraData.carousel_slides = [
          { id: 1, title: 'Slide 1: Problem Utama', content: `Banyak yang bingung mencari pencerahan tentang "${topic}". Inilah mengapa kamu butuh terobosan baru.`, visual_prompt: 'Icon neon gear spinning inside twilight background ' },
          { id: 2, title: 'Slide 2: Solusi Cerdas', content: `Gunakan metode terstruktur 3-langkah Davsplace yang dioptimalisasi robotik AI modern.`, visual_prompt: 'Abstract neural network rendering bright bright orange dots' },
          { id: 3, title: 'Slide 3: Implementasi Nyata', content: `Mulai dengan skala kecil, asah konsistensi, lalu lepaskan ekspektasi berlebih. Semuanya butuh waktu.`, visual_prompt: 'A sleek minimal graph showcasing growth arrow pointing up' },
          { id: 4, title: 'Slide 4: Kesimpulan Emas', content: `Kombinasikan disiplin dengan alat canggih AI Davsplace untuk hasil lipat ganda.`, visual_prompt: 'A high-contrast banner showcasing success checkmark' },
          { id: 5, title: 'Slide 5: Call to Action!', content: `${userCta}. Jangan ditunda lagi!`, visual_prompt: 'Minimal cursor finger clicking on gorgeous button' },
        ];
      } else if (contentType === 'threads') {
        mockHeadline = `Thread: Mengulik Tangan Dingin ${displayTopic}`;
        extraData.thread_tweets = [
          { id: 1, text: `1/ Membongkar tuntas rahasia ${topic}! Benarkah sulit dikuasai? Berikut ringkasan taktik jitu yang wajib kamu pahami hari ini. 👇 a thread`, visual_description: 'Preview cover image with twilight theme' },
          { id: 2, text: `2/ Mengapa ini penting? Di era digital, kecepatan adalah mata uang baru. Memahami dasar-dasar topik ini memangkas waktu kerja berjam-jam secara revolusioner.`, visual_description: 'Clock icon vector' },
          { id: 3, text: `3/ Taktik pertama: Selalu bersandar pada data solid, bukan sekadar asumsi/opini liar. Buat benchmark rujukan akurat.`, visual_description: 'Charts representation minimal' },
          { id: 4, text: `4/ Taktik kedua: Integrasikan sistem otomatisasi AI Davsplace untuk mempercepat konten kreatif. Biarkan robot memikirkan urusan teknis berat.`, visual_description: 'A cute glowing robot logo rendering' },
          { id: 5, text: `5/ Terakhir: Teruslah berlatih secara konsisten. Ingin tahu trik rahasia lainnya? ${userCta}`, visual_description: 'Outro graphic logo' },
        ];
      } else if (contentType === 'video_script') {
        mockHeadline = `Video Script: Panduan 1 Menit ${displayTopic}`;
        extraData.video_timeline = [
          { time: '0:00 - 0:03', section: 'Hook', script: `(Berbicara tegas menghadap kamera) "Stop scroll! Tahukah kamu bahwa rahasia sukses dari ${topic} itu ternyata sangat simpel?"`, visual: 'Presenter tersenyum percaya diri, teks bold pop up di tengah', audio: 'Efek suara WOOSH keras, musik tempo cepat dimulai' },
          { time: '0:03 - 0:15', section: 'Problem', script: '"Kebanyakan orang salah jalur karena terlalu fokus pada detail rumit yang tidak menghasilkan konversi. Akibatnya capek sendiri."', visual: 'Transisi cepat ke layar laptop goyang atau ekspresi pusing', audio: 'Musik mulai melandai, suara ketikan cepat' },
          { time: '0:15 - 0:35', section: 'Solution', script: '"Ini solusinya: Terapkan metode minimalis dan gunakan AI Davsplace Creator. Otot kreativitasmu akan melejit!"', visual: 'Beralih ke rekaman visual antarmuka sistem Davsplace berpendar emas', audio: 'Suara lonceng manis, musik kembali menghentak' },
          { time: '0:35 - 0:45', section: 'CTA Outro', script: `"Tertarik mencobanya? ${userCta}"`, visual: 'Presenter melambai, teks CTA muncul besar dibarengi QR Code', audio: 'Musik berangsur pelan, efek berdentang manis' },
        ];
      } else if (contentType === 'caption_pack') {
        extraData.caption_alternatives = {
          informative: `[GAYA EDUKATIF]\nIngin tahu lebih mendalam seputar ${topic}? Berikut fakta ilmiah yang wajib Anda tahu:\n\nSecara teoritis, pilar utama hal ini bertumpu pada presisi data dan konsistensi pesan. Untuk detail risetnya, silakan baca artikel lengkap kami di link bio!`,
          playful: `[GAYA SANTAI (HUMOR)]\nSiapa di sini yang masih suka kelimpungan mikirin "${topic}"? Tenang, Anda tidak sendirian kok! 🤪\n\nDaripada malam-malam pusing sendiri kayak mikirin mantan, yuk mendingan cobain trik AI kami yang super duper instan ini! Cek link di bio ya, dijamin anti mumet! ✨`,
          urgent: `[GAYA URGENT (FOMO)]\n⚠️ PERINGATAN PENTING ⚠️\nKesempatan menguasai rahasia "${topic}" akan ditutup segera! Jangan sampai kompetitormu mencuri start lebih dulu.\n\nAmankan posisimu sekarang juga sebelum terlambat! Klik link di bio SEKARANG 🏃💨`
        };
      } else if (contentType === 'ads_copy') {
        extraData.headline_variants = [
          `Rahasia ${displayTopic} Terbongkar!`,
          `Pusing Memikirkan ${displayTopic}? Gunakan Solusi Ini.`
        ];
        extraData.primary_text_variants = [
          `Lelah membuang waktu percuma tanpa hasil nyata? Terapkan sistem Davsplace AI dan dominasi pasar Anda hari ini juga!`,
          `Dapatkan panduan terlengkap seputar ${topic} yang dirancang khusus oleh pakar industri terkemuka.`
        ];
        extraData.description_variants = [
          `Metode praktis siap pakai dalam 5 menit.`,
          `Telas dipercaya oleh 5000+ top creator.`
        ];
        extraData.cta_recommendations = ['Learn More / Pelajari', 'Sign Up / Daftar'];
      }

      setResult({
        headline: mockHeadline,
        caption: mockCaption,
        hashtags: mockHashtags,
        image_prompt: mockVisualPrompt,
        content: `## Analisis Emas: ${topic}\n\nPilar utama rujukan menguraikan sistem ini secara holistik untuk memberikan pemahaman teoritis dan praktis yang kokoh.\n\n### Mengapa Metode Minimalis Lebih Baik?\nDalam menyikapi "${topic}", kerangka minimalis Davsplace Studio membiarkan pesan esensial menembus noise audiens secara langsung:\n\n*   **Efisiensi Penyampaian**: Menghilangkan dekorasi tidak perlu.\n*   **Fokus Solusi**: Menjelaskan apa yang sesungguhnya bekerja.\n*   **Konversi Tinggi**: Memadukan data solid dengan copywriting yang menggugah emosi.\n\n### Cara Memulai Sekarang\n\n1.  **Analisis Audiens**: Tentukan siapa penerima manfaat utama.\n2.  **Susun Penawaran**: Pastikan penawaran Anda sulit ditolak.\n3.  **Gunakan AI**: Hemat waktu proses draf dasar menggunakan asisten cerdas.\n\n> "Inovasi tidak selalu tentang menambah sesuatu, melainkan memangkas kerumitan hingga tersisa intisari berharga."`,
        ...extraData
      });
      
      setEditorText(mockCaption);
      setGenerating(false);
    }, 800);
  };

  // Process Real Generation using API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (activeEngine === 'assembly') {
      generateAssemblyMode();
      return;
    }

    setGenerating(true);
    setIsSaved(false);
    setError(null);
    setResult(null);

    try {
      const keywordsArray = keywords ? keywords.split(',').map(item => item.trim()) : [];
      const negativeArray = negativeTopics ? negativeTopics.split(',').map(item => item.trim()) : [];

      const payload = {
        contentType,
        topic,
        platform,
        tone,
        language,
        brandVoice,
        keywords: keywordsArray,
        negativeTopics: negativeArray,
        callToAction,
        slidesCount,
        provider: activeEngine === 'nvidia' ? 'nvidia-nemotron' : 'gemini'
      };

      const response = await fetch('/api/ai/content-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate konten via AI.');
      }

      const data = await response.json();
      setResult(data);
      setEditorText(data.caption || data.content || '');
      
      if (onIncrementTrial) {
        onIncrementTrial();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Koneksi ke server terganggu. Menggunakan Fallback Assembly Mode.');
      generateAssemblyMode();
    } finally {
      setGenerating(false);
    }
  };

  // Save generated content to database
  const handleSaveToDatabase = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'saved_contents'), {
        user_id: user.uid,
        topic: topic,
        type: contentType,
        headline: result.headline || result.title_options?.[0] || 'Content Generator Output',
        caption: editorText || result.caption || result.content,
        hashtags: result.hashtags || [],
        sources: [],
        image_prompt: result.image_prompt || '',
        provider: activeEngine,
        writing_style: tone,
        created_at: serverTimestamp()
      });
      setIsSaved(true);
    } catch (err: any) {
      console.error('Gagal menyimpan ke database:', err);
      setError('Maaf, gagal menyimpan konten ke database cloud Anda.');
    } finally {
      setSaving(false);
    }
  };

  // Repurpose to other platform
  const handleRepurpose = () => {
    if (!result) return;
    setGeneratingRepurpose(true);
    
    setTimeout(() => {
      let crossPostText = '';

      if (repurposeTarget === 'LinkedIn') {
        crossPostText = `📌 STORYTELLING VERSION FOR LINKEDIN:\n\n${result.headline || 'Terobosan Baru!'}\n\nBelakangan ini saya banyak merenungkan seputar "${topic}". Ini adalah pelajaran luar biasa yang bisa kita terapkan bersama.\n\nBerikut 3 poin penting yang saya temukan:\n✍️ 1. Strategi cerdas memotong birokrasi\n✍️ 2. Efisiensi lewat kacamata minimalis\n✍️ 3. Pemanfaatan asisten AI modern\n\nBagaimana pandangan Anda mengenai hal ini? Mari diskusikan di kolom komentar! 👇 \n\n#ProfessionalNetwork #Innovation #DavsplaceStudio`;
      } else if (repurposeTarget === 'Twitter/X') {
        crossPostText = `🐦 SHORT TWITTER THREAD EXTRACT:\n\n1/ Pusing memikirkan "${topic}"? Tenang, kuncinya ada pada penyederhanaan langkah kerja. Berikut adalah benang merah berharga yang wajib dipahami. 👇\n\n2/ Pertama: hilangkan noise yang mengalihkan perhatian audiens. Fokus murni pada esensi masalah.\n\n3/ Kedua: Gunakan pilar generator Davsplace AI untuk mengeskalasi laju draf ide harian Anda secara cerdas.`;
      } else {
        crossPostText = `📬 NEWSLETTER EMAIL FORMAT:\n\nSubject: [PENTING] Menyederhanakan tantangan seputar ${topic}...\n\nHai di sana,\n\nSemoga hari Anda menyenangkan. Hari ini kami berbincang santai namun berbobot mengenai topik hangat yang sedang naik daun: ${topic}.\n\nKami merumuskan ringkasan berbobot yang bisa langsung Anda praktikkan sore ini juga.\n\nSalam kreatif,\nTim Davsplace`;
      }

      setRepurposedResult({
        title: `🎯 REPURPOSED TO ${repurposeTarget.toUpperCase()}`,
        text: crossPostText
      });
      setGeneratingRepurpose(false);
    }, 1000);
  };

  // Revision Formulator
  const handleRevisionSubmit = () => {
    if (!revisionPrompt.trim()) return;
    setRevisingText(true);
    
    setTimeout(() => {
      let lowerPrompt = revisionPrompt.toLowerCase();
      let modifiedText = editorText;

      if (lowerPrompt.includes('pendek') || lowerPrompt.includes('shorter') || lowerPrompt.includes('singkat')) {
        modifiedText = `📌 VERSI SINGKAT:\n\n"${result.headline}"\n\nYuk intip intisari ringkas seputar: "${topic}". Pembahasan penting ini mengajarkan kita pentingnya presisi bertindak, pemangkasan waktu operasional, dan integrasi digital AI.\n\nJangan tunda kemajuanmu!`;
      } else if (lowerPrompt.includes('emoji') || lowerPrompt.includes('emot')) {
        modifiedText = `🤩🔥 SELAMAT DATANG! 🔥🤩\n\nMari kita bedah habis seputar "${topic}"! 💡✨\n\nBerikut tips andalannya:\n1️⃣ Pelajari fundamentalnya dengan teliti! 📚\n2️⃣ Desain alurnya sesimpel mungkin! 🎯\n3️⃣ Eksekusi secepat kilat tanpa drama! ⚡️\n\nYuk cobain sekarang juga! 🚀`;
      } else {
        modifiedText = `📢 REVISI KONTEN (${revisionPrompt}):\n\n${editorText}\n\n*Revisi AI: Disesuaikan dengan arahan: "${revisionPrompt}"*`;
      }

      setEditorText(modifiedText);
      setRevisionPrompt('');
      setRevisingText(false);
    }, 900);
  };

  // A/B testing
  const handleABGenerate = () => {
    if (!result) return;
    setGeneratingAB(true);
    
    setTimeout(() => {
      setAbOptionA(`Opsi A (Direct/To-The-Point):\n👉 "Capek Mikirin ${result.headline || topic}? Inilah Solusi 3-Langkah Anti-Gagal!"\n\nVariasi caption yang menekankan waktu instan dan solusi segera.`);
      setAbOptionB(`Opsi B (Story/Empathy):\n👉 "Dulu saya sering overthinking tentang ini. Sampai saya menemukan cara simpel menguasai ${topic}..."\n\nVariasi caption yang menekankan empati, relasi sosial, dan penyelesaian masalah.`);
      setGeneratingAB(false);
    }, 800);
  };

  // Scheduler add-on
  const handleCalendarQuickAdd = () => {
    setIsScheduled(true);
    setTimeout(() => {
      setIsScheduled(false);
      alert(`Konten berhasil dijadwalkan! \nTanggal: ${scheduledDate || 'Besok'}\nWaktu: ${scheduledTime}\nStatus: Aktif dijadwalkan ke Platform ${platform}`);
    }, 800);
  };

  // Variation Creator
  const handleGenerateVariations = () => {
    if (!result) return;
    setGeneratingVariations(true);
    setTimeout(() => {
      setVariationsList([
        `🔥 "Jangan Lakukan Ini Lagi Saat Belajar ${topic}!"`,
        `💡 "Trik Rahasia 5 Menit yang Mengubah Pandanganmu tentang Hal Ini"`,
        `⚠️ "Awas, Jangan Sampai Kompetitormu Mengetahui Rahasia ini Lebih Dulu..."`
      ]);
      setGeneratingVariations(false);
    }, 900);
  };

  // Exporters
  const handleExportFile = (format: 'txt' | 'pdf') => {
    const contentToExport = `DAVSPLACE STUDIO - CONTENT GENERATOR EXPORT\n==========================================\nJenis Konten: ${contentType.toUpperCase()}\nTopik: ${topic}\nHasil Copywriting:\n\n${editorText}\n\n==========================================\nHashtags: ${result?.hashtags?.join(' ') || ''}\nImage Prompt untuk Render:\n"${result?.image_prompt || ''}"`;
    
    if (format === 'txt') {
      const element = document.createElement('a');
      const file = new Blob([contentToExport], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `davsplace_content_${contentType}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Export Content PDF</title>
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                h1 { color: #facc15; font-size: 24px; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-bottom: 20px; }
                .meta { background: #f4f4f5; padding: 15px; border-radius: 10px; margin-bottom: 30px; font-size: 13px; }
                .body-box { font-size: 15px; white-space: pre-wrap; background: #fff; border: 1px solid #eaeaea; padding: 25px; border-radius: 12px; }
                .tags { font-weight: bold; color: #4b5563; margin-top: 20px; }
              </style>
            </head>
            <body>
              <h1>DAVSPLACE STUDIO - AI COPYWRITING</h1>
              <div class="meta">
                <strong>Jenis Konten:</strong> ${contentType.toUpperCase()}<br/>
                <strong>Platform Utama:</strong> ${platform}<br/>
                <strong>Topik/Brief:</strong> "${topic}"
              </div>
              <div class="body-box">
                ${editorText.replace(/\n/g, '<br/>')}
              </div>
              <div class="tags">
                Tagar: ${result?.hashtags?.map((t: string) => '#' + t.replace('#', '')).join(' ') || ''}
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // ===================================
  // HOOK GENERATOR EVENT HANDLERS
  // ===================================
  const handleGenerateHooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hookTopic.trim()) return;

    setGeneratingHooks(true);
    setError(null);
    setHookResults([]);

    try {
      if (activeEngine === 'assembly') {
        setTimeout(() => {
          const arr = assembleHook(hookTopic, hookAudience, hookLength);
          const finalHooks = simulatedPlan === 'guest' ? arr.slice(0, 5) : arr;
          setHookResults(finalHooks);
          setGeneratingHooks(false);
        }, 800);
        return;
      }

      const payload = {
        topic: hookTopic,
        targetAudience: hookAudience,
        platform: hookPlatform,
        length: hookLength,
        provider: activeEngine === 'nvidia' ? 'nvidia-nemotron' : 'gemini'
      };

      const response = await fetch('/api/ai/hook-generator', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate hooks.');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const finalHooks = simulatedPlan === 'guest' ? data.slice(0, 5) : data;
        setHookResults(finalHooks);
      } else {
        throw new Error("Respon hooks bukan format Array valid.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Koneksi API Hook terputus. Menggunakan Assembly Mode sebagai cadangan.');
      const arr = assembleHook(hookTopic, hookAudience, hookLength);
      const finalHooks = simulatedPlan === 'guest' ? arr.slice(0, 5) : arr;
      setHookResults(finalHooks);
    } finally {
      setGeneratingHooks(false);
    }
  };

  // Hook Combiner Action
  const handleCombineHooks = () => {
    setFusingHook(true);
    setTimeout(() => {
      const fA = HOOK_FORMULAS.find(f => f.name === combinerFormulaA || f.id === combinerFormulaA);
      const fB = HOOK_FORMULAS.find(f => f.name === combinerFormulaB || f.id === combinerFormulaB);
      
      const topicStr = hookTopic || topic || "Bisnis Digital";
      const combText = `❓ ${fA?.name || 'Pertanyaan'} + 🔥 ${fB?.name || 'Kontroversial'}:\n"Mungkinkah ${topicStr} yang kamu pelajari selama ini ternyata salah sasaran? Awas, jangan sampai terjebak opini umum!"`;
      
      setCombinedHookResult(combText);
      setFusingHook(false);
    }, 1000);
  };

  // A/B Side-by-Side Hook Comparator
  const handleCompareABHooks = () => {
    if (!abTestHookA || !abTestHookB) {
      alert("Pilih terlebih dahulu Hook A dan Hook B yang ingin diuji!");
      return;
    }
    setTestingABHooks(true);
    setTimeout(() => {
      setAbTestReport({
        optionA: {
          score: 84,
          curiosity: 'Tinggi (88%)',
          relatability: 'Sedang (80%)',
          clickability: 'Bagus (84%)'
        },
        optionB: {
          score: 91,
          curiosity: 'Sangat Tinggi (95%)',
          relatability: 'Tinggi (90%)',
          clickability: 'Luar Biasa (92%)'
        },
        winner: 'OPSI B',
        reason: 'Opsi B memiliki dorongan psikologis rasa penasaran yang jauh lebih tinggi dan menggunakan teknik trigger kerugian (Fear) yang memaksa pembaca untuk membaca kelanjutannya secara impulsif.'
      });
      setTestingABHooks(false);
    }, 1000);
  };

  // Save specific Hook to local list & potentially firestore
  const handleSaveHook = async (hookItem: any) => {
    try {
      if (simulatedPlan !== 'guest' && user) {
        await addDoc(collection(db, 'saved_hooks'), {
          user_id: user.uid,
          topic: hookTopic || topic,
          hook_text: hookItem.hook,
          formula: hookItem.formula,
          strength: hookItem.strength,
          created_at: serverTimestamp()
        });
      }
      setSavedHooks((prev) => [hookItem, ...prev]);
      alert("Hook berhasil disimpan ke Library Anda!");
    } catch (e) {
      console.error(e);
      setSavedHooks((prev) => [hookItem, ...prev]);
      alert("Hook disimpan ke penyimpanan lokal Anda.");
    }
  };

  // Filter & Sort logic for Hooks
  const getFilteredAndSortedHooks = () => {
    let filtered = [...hookResults];
    
    if (hookFilterFormula !== 'all') {
      filtered = filtered.filter(h => h.formula.toLowerCase().includes(hookFilterFormula.toLowerCase()) || h.formula === hookFilterFormula);
    }
    
    // sorting logic
    if (hookSortBy === 'strength') {
      filtered.sort((a, b) => b.strength - a.strength);
    } else if (hookSortBy === 'formula') {
      filtered.sort((a, b) => a.formula.localeCompare(b.formula));
    }
    
    return filtered;
  };

  return (
    <div className="space-y-10" id="content-generator-main">
      {/* Upper banner with simulated level and tab choices */}
      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] pointer-events-none" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black rounded-lg uppercase tracking-[0.2em] mb-2 border border-accent-yellow/20">
            <Wand2 className="w-3.5 h-3.5 animate-pulse" />
            DAVSPLACE CONTENT CREATIVE HUB
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-tight">
            DAVSPLACE <span className="text-accent-yellow italic">CREATOR STUDIO</span>
          </h2>
          <p className="text-xs text-text-secondary max-w-lg leading-relaxed">
            Hasilkan konten terlengkap dari carousel, artikel panjang terstruktur, naskah video pendek, hingga formula hook magnetik penghenti scroll jempol.
          </p>
        </div>

        {/* Member Plan Selector simulated widget */}
        <div className="bg-bg-tertiary border border-border-subtle p-2 rounded-2xl flex items-center gap-1 shrink-0 self-stretch sm:self-center">
          <span className="text-[8px] font-black uppercase text-text-secondary px-2 select-none">MEMBER TIER:</span>
          {(['guest', 'pro', 'vip'] as const).map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => {
                setSimulatedPlan(plan);
                setResult(null);
                setEditorText('');
                setHookResults([]);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1",
                simulatedPlan === plan
                  ? plan === 'guest' 
                    ? "bg-text-secondary text-bg-primary font-bold"
                    : plan === 'pro' 
                      ? "bg-accent-yellow text-bg-primary"
                      : "bg-[#3b82f6] text-white"
                  : "text-text-secondary hover:text-white"
              )}
            >
              {plan === 'vip' && <Sparkle className="w-3 h-3 text-accent-yellow animate-spin" />}
              {plan === 'pro' && '💎 '}
              {plan.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-bg-secondary border border-border-subtle rounded-2xl max-w-lg">
        <button
          onClick={() => setGeneratorTab('content')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
            generatorTab === 'content' 
              ? "bg-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/10Scale" 
              : "text-text-secondary hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4" />
          All-In-One Content Studio
        </button>
        <button
          onClick={() => {
            setGeneratorTab('hooks');
            if (topic && !hookTopic) setHookTopic(topic);
          }}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
            generatorTab === 'hooks' 
              ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/15" 
              : "text-text-secondary hover:text-white"
          )}
        >
          <Zap className="w-4 h-4 text-accent-yellow animate-bounce" />
          Hook Scroll-Stopper
        </button>
      </div>

      <AnimatePresence mode="wait">
        {generatorTab === 'content' ? (
          /* ========================================================
             MAIN TAB 1: ALL-IN-ONE CONTENT GENERATOR
             ======================================================== */
          <motion.div
            key="content-generator-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start"
          >
            {/* Left Parameters form panel */}
            <form onSubmit={handleGenerate} className="bg-bg-secondary border border-border-subtle p-6 sm:p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-border-subtle pb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent-yellow" />
                CONTENT CONFIGURATION
              </h3>

              {/* Engine Selector */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center justify-between">
                  <span>PILIH MESIN AI</span>
                  {simulatedPlan === 'guest' && <span className="text-red-400 text-[8px] font-bold">NVIDIA Terkunci 🔒</span>}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-bg-tertiary border border-border-subtle p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveEngine('assembly')}
                    className={cn(
                      "py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                      activeEngine === 'assembly' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    ASSEMBLY
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEngine('gemini')}
                    className={cn(
                      "py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                      activeEngine === 'gemini' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    ⚡ GEMINI API
                  </button>
                  <button
                    type="button"
                    disabled={isEngineRestricted('nvidia')}
                    onClick={() => setActiveEngine('nvidia')}
                    className={cn(
                      "py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                      activeEngine === 'nvidia' 
                        ? "bg-bg-primary text-blue-400 border border-blue-500/30" 
                        : "text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                  >
                    NVIDIA NIM
                    {isEngineRestricted('nvidia') && <Lock className="w-2.5 h-2.5 shrink-0 text-red-500/70" />}
                  </button>
                </div>
              </div>

              {/* Content Type Selector */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">
                  JENIS CONTENT / CAMPAIGN
                </label>
                <div className="relative">
                  <select
                    value={contentType}
                    onChange={(e) => {
                      setContentType(e.target.value);
                      setResult(null);
                      setEditorText('');
                    }}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3.5 outline-none focus:border-accent-yellow transition-all text-xs font-sans appearance-none cursor-pointer text-white pr-10"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option 
                        key={type.id} 
                        value={type.id}
                        disabled={isTypeRestricted(type.id)}
                        className="bg-bg-secondary text-white"
                      >
                        {type.name} {isTypeRestricted(type.id) ? ' (PRO 🔒)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[8.5px] italic text-text-secondary leading-relaxed ml-1">
                  {CONTENT_TYPES.find(t => t.id === contentType)?.desc}
                </p>
              </div>

              {/* Slides count adjuster for Carousel */}
              {contentType === 'carousel' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-bg-tertiary border border-border-subtle rounded-2xl space-y-2"
                >
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-text-secondary">
                    <span>JUMLAH SLIDES:</span>
                    <span className="text-accent-yellow">{slidesCount} Slides</span>
                  </div>
                  <input 
                    type="range"
                    min="3"
                    max="10"
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(Number(e.target.value))}
                    className="w-full accent-accent-yellow cursor-pointer"
                  />
                </motion.div>
              )}

              {/* Source Mode Tabs */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">
                  SUMBER INPUT BRIEF
                </label>
                <div className="grid grid-cols-2 gap-1 bg-bg-tertiary border border-border-subtle p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInputSourceTab('manual')}
                    className={cn(
                      "py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      inputSourceTab === 'manual' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    <PenTool className="w-3.5 h-3.5 text-accent-yellow" />
                    Input Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputSourceTab('source')}
                    className={cn(
                      "py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      inputSourceTab === 'source' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                    Dari Sumber ✨
                  </button>
                </div>
              </div>

              {inputSourceTab === 'manual' ? (
                <>
                  {/* Brief Input topic field */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 flex justify-between">
                      <span>TOPIK / BRIEF UTAMA</span>
                      <span className="text-[8.5px] text-text-secondary lowercase">{topic.length} karakter</span>
                    </label>
                    <textarea
                      rows={4}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Tips and trik merapikan isi keuangan bisnis rumahan yang berantakan..."
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-xs font-sans resize-none text-white focus:ring-1 focus:ring-accent-yellow/20"
                    />
                  </div>

                  {/* Interactive Trend Suggestion (VIP only) */}
                  {simulatedPlan === 'vip' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-blue-400">
                        <TrendingUp className="w-3.5 h-3.5 text-accent-yellow animate-bounce" />
                        INTEGRASI TREN INDONESIA (VIP ⭐)
                      </div>
                      <div className="space-y-1.5">
                        {trendingIdeas.map((trend, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedTrend(trend);
                              setTopic(prev => prev ? prev + `\n(Integrasikan dengan tren: ${trend})` : `Topik tren: ${trend}`);
                            }}
                            className={cn(
                              "w-full text-left p-2 rounded-lg text-[8px] leading-relaxed transition-all",
                              selectedTrend === trend 
                                ? "bg-[#3b82f6]/10 text-white font-semibold border border-[#3b82f6]/30" 
                                : "bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-white"
                            )}
                          >
                            ⚡ {trend}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="space-y-4 border border-border-subtle bg-bg-tertiary/20 p-4 rounded-2xl">
                  {/* Selector for Link or File */}
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">
                    <span>JENIS SUMBER</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSourceType('file'); setSourceAnalysisResult(null); }}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] border transition-all",
                          sourceType === 'file' 
                            ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30 font-bold" 
                            : "bg-bg-tertiary text-text-secondary border-border-subtle"
                        )}
                      >
                        📄 FILE
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSourceType('link'); setSourceAnalysisResult(null); }}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] border transition-all",
                          sourceType === 'link' 
                            ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30 font-bold" 
                            : "bg-bg-tertiary text-text-secondary border-border-subtle"
                        )}
                      >
                        🔗 TAUTAN
                      </button>
                    </div>
                  </div>

                  {sourceType === 'file' ? (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer",
                        isDragActive 
                          ? "border-accent-yellow scale-[1.01] bg-accent-yellow/5" 
                          : "border-border-subtle bg-bg-tertiary/40 hover:border-text-secondary"
                      )}
                      onClick={() => document.getElementById('source-file-upload')?.click()}
                    >
                      <input 
                        type="file"
                        id="source-file-upload"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(file);
                        }}
                      />
                      <div className="flex flex-col items-center gap-2 text-text-secondary">
                        <FileText className="w-8 h-8 text-text-secondary/60" />
                        <div className="text-[10px] font-black tracking-wider text-white uppercase">
                          {sourceFile ? "BERKAS TERPILIH" : "UNGGAH FILE SUMBER"}
                        </div>
                        <p className="text-[8.5px] max-w-xs mx-auto leading-normal">
                          {sourceFile 
                            ? `${sourceFile.name} (${(sourceFile.size / 1024 / 1024).toFixed(2)} MB)`
                            : "Mendukung Gambar, PDF, Dokumen Teks, CSV"
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-black uppercase text-text-secondary">Tautan URL Artikel/Video/Post</label>
                      <input
                        type="text"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="e.g. https://youtube.com/watch?v=... atau https://..."
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-[10px] font-sans text-white placeholder-text-secondary/45"
                      />
                      <p className="text-[7.5px] italic text-text-secondary">Mendukung link artikel web, YouTube, & social post kompatitor.</p>
                    </div>
                  )}

                  {sourceError && (
                    <div className="p-2.5 bg-red-400/10 border border-red-500/20 rounded-xl text-red-400 text-[8.5px] leading-relaxed">
                      ⚠️ {sourceError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={analyzingSource}
                    onClick={handleAnalyzeSource}
                    className="w-full py-2.5 bg-bg-tertiary hover:bg-bg-primary text-white border border-border-subtle font-black rounded-lg text-[8.5px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:scale-100 disabled:opacity-40"
                  >
                    {analyzingSource ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-accent-yellow" />
                        AI SEDANG MENGEKSTRAK ISI SUMBER...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-accent-yellow" />
                        MULAI ANALISA SUMBER (AI EXTRACT)
                      </>
                    )}
                  </button>

                  {sourceAnalysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-bg-primary border border-border-subtle rounded-xl space-y-3 text-left"
                    >
                      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-green-400 flex items-center gap-1 font-display">
                          <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                          BERHASIL DIANALISIS
                        </span>
                        <span className="text-[7.5px] border border-border-subtle px-1.5 py-0.5 rounded text-text-secondary truncate max-w-[120px]">
                          {sourceAnalysisResult.sourceName}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[8px] font-black uppercase text-accent-yellow">TOPIK UTAMA DETEKSI</div>
                        <div className="text-[10px] font-bold text-white leading-relaxed">{sourceAnalysisResult.topic}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-bg-tertiary rounded-lg space-y-0.5">
                          <div className="text-[7.5px] font-black uppercase text-text-secondary">NADA (TONE)</div>
                          <div className="text-[9px] font-bold text-white">{sourceAnalysisResult.detectedTone}</div>
                        </div>
                        <div className="p-2 bg-bg-tertiary rounded-lg space-y-0.5">
                          <div className="text-[7.5px] font-black uppercase text-text-secondary">TARGET AUDIENS</div>
                          <div className="text-[9px] font-bold text-white truncate">{sourceAnalysisResult.detectedAudience || "Umum"}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[8px] font-black uppercase text-accent-yellow">POIN PENTING SUMBER</div>
                        <ul className="space-y-1 pl-1">
                          {sourceAnalysisResult.keyPoints?.map((p: string, i: number) => (
                            <li key={i} className="text-[9px] text-text-secondary leading-normal flex items-start gap-1">
                              <span className="text-accent-yellow shrink-0 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[8px] font-black uppercase text-accent-yellow">SUMMARY ANALISA</div>
                        <p className="text-[9px] text-text-secondary leading-relaxed font-sans">{sourceAnalysisResult.contentSummary}</p>
                      </div>

                      {sourceAnalysisResult.competitorAnalysis && (
                        <div className="p-2.5 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg space-y-1.5 text-left">
                          <div className="text-[8px] font-black uppercase text-red-400">ANALISA KOMPETITOR 🛡️</div>
                          <div className="space-y-1 text-[8.5px] text-text-secondary leading-relaxed">
                            <p><strong>Gaya Hook:</strong> {sourceAnalysisResult.competitorAnalysis.hookStyle}</p>
                            <p><strong>Pola Caption:</strong> {sourceAnalysisResult.competitorAnalysis.captionPattern}</p>
                            <p><strong>Celah Konten:</strong> {sourceAnalysisResult.competitorAnalysis.contentGap}</p>
                            <p><strong>Saran Taktis:</strong> {sourceAnalysisResult.competitorAnalysis.tacticalAdvice}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleUseSourceContent}
                        className="w-full py-2.5 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-lg text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-accent-yellow/5"
                      >
                        ⚡ GUNAKAN MATERI INI
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Configuration selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">
                    PLATFORM TARGET
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none focus:border-accent-yellow text-[10px] font-sans text-white pr-4 appearance-none cursor-pointer"
                  >
                    {PLATFORMS.map((item) => (
                      <option key={item} value={item} className="bg-bg-secondary text-white">{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">
                    NADA BICARA (TONE)
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none focus:border-accent-yellow text-[10px] font-sans text-white pr-4 appearance-none cursor-pointer"
                  >
                    {TONES.map((item) => (
                      <option key={item.id} value={item.id} className="bg-bg-secondary text-white">{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Collapsible Tuning Panel */}
              <div className="border border-border-subtle bg-bg-tertiary/20 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-[9.5px] font-black uppercase tracking-widest text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-accent-yellow" />
                    BRAND MODIFIERS
                  </span>
                  {simulatedPlan === 'guest' ? (
                    <span className="text-[7.5px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">PRO/VIP 🔒</span>
                  ) : (
                    <span className="text-[7.5px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-bold">AKTIF</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-secondary">Brand Voice Profile</label>
                    <input
                      type="text"
                      disabled={simulatedPlan === 'guest'}
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder={simulatedPlan === 'guest' ? "Upgrade Pro untuk buka modifier ini" : "e.g. edukatif, akrab, pakai frasa 'kawan usaha'"}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] font-sans text-white placeholder-text-secondary/45"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-secondary">Keywords Wajib</label>
                    <input
                      type="text"
                      disabled={simulatedPlan === 'guest'}
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder={simulatedPlan === 'guest' ? "Upgrade Pro untuk buka modifier ini" : "e.g. otomatisasi, hemat, instan, untung"}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] font-sans text-white placeholder-text-secondary/45"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-secondary">Hindari Kata/Topik</label>
                    <input
                      type="text"
                      value={negativeTopics}
                      onChange={(e) => setNegativeTopics(e.target.value)}
                      placeholder="e.g. politik, kontroversi, kasar"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] font-sans text-white placeholder-text-secondary/45"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-secondary">Custom Call-To-Action (CTA)</label>
                    <input
                      type="text"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      placeholder="e.g. Klik link di bio untuk unduh template excel gratis"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] font-sans text-white placeholder-text-secondary/45"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Trigger Button */}
              <button
                type="submit"
                disabled={generating || !topic.trim()}
                className="w-full py-4.5 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-accent-yellow/10 hover:scale-[1.01] active:scale-95 disabled:scale-100 disabled:opacity-40"
              >
                {generating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    PULUHAN PENULIS AI BEKERJA...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    GENERATE ALL-IN-ONE
                  </>
                )}
              </button>
            </form>

            {/* Right Output displays panel */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 p-5 rounded-2xl flex items-start gap-3.5 text-red-400">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider mb-1">PROSES PENYIMPANGAN</h4>
                    <p className="text-xs leading-relaxed opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {!result && !generating && (
                <div className="bg-bg-secondary border-2 border-dashed border-border-subtle rounded-[3rem] p-16 text-center space-y-6 h-full flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-bg-tertiary rounded-full border border-border-subtle flex items-center justify-center text-text-secondary opacity-40">
                    <Wand2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-display font-black uppercase text-text-primary tracking-wide opacity-50">SIAP MENERIMA BRIEF</h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed opacity-40">
                      Pilih parameter konten di panel kiri, lalu klik tombol generate untuk melihat sihir AI marketing melahirkan copy berkualitas tinggi.
                    </p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-16 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-accent-yellow/10 rounded-full animate-ping absolute inset-0" />
                    <div className="w-20 h-20 bg-accent-yellow/10 rounded-[2rem] border-2 border-accent-yellow/30 flex items-center justify-center text-accent-yellow relative">
                      <RotateCw className="w-8 h-8 animate-spin" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-accent-yellow tracking-widest animate-pulse">BERBINCANG DENGAN ENGINE AI ({activeEngine.toUpperCase()})...</p>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed mt-3">Sedang merancang struktur headline berkekuatan viral, caption kreatif berjarak, dan instruksi visual render terbaik.</p>
                </div>
              )}

              {result && !generating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Option controls header */}
                  <div className="bg-bg-secondary border border-border-subtle p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-text-secondary tracking-widest">
                        RIPPLE LIVE READY • ENGINE {activeEngine.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleExportFile('txt')}
                          className="px-3 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-white border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          .TXT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportFile('pdf')}
                          className="px-3 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-white border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          .PDF
                        </button>
                      </div>

                      {simulatedPlan !== 'guest' ? (
                        <button
                          disabled={saving || isSaved}
                          onClick={handleSaveToDatabase}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5",
                            isSaved 
                              ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                              : "bg-accent-yellow text-bg-primary hover:bg-white"
                          )}
                        >
                          {saving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : isSaved ? <CheckCheck className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                          {isSaved ? 'SAVED TO DB' : 'SAVE TO DB'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-text-secondary/10 border border-border-subtle text-text-secondary/50 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          SAVE DB (🔒)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab categories selections */}
                  <div className="flex bg-bg-secondary p-1 border border-border-subtle rounded-2xl">
                    <button
                      onClick={() => setOutputTab('editor')}
                      className={cn(
                        "flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                        outputTab === 'editor' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                      )}
                    >
                      <PenTool className="w-4 h-4" />
                      Inline Editor
                    </button>
                    <button
                      onClick={() => setOutputTab('structure')}
                      className={cn(
                        "flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                        outputTab === 'structure' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                      )}
                    >
                      <Layers className="w-4 h-4" />
                      Struktur Rinci
                    </button>
                    <button
                      onClick={() => setOutputTab('visuals')}
                      className={cn(
                        "flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                        outputTab === 'visuals' ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      Visual Prompts
                    </button>
                  </div>

                  {/* DISPLAY CONTENT TAB OUTPUT PANELS */}
                  <AnimatePresence mode="wait">
                    {outputTab === 'editor' && (
                      <motion.div
                        key="editor-pane"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Heading summary banner */}
                        <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-[40px]" />
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-[#94a3b8]">CAMPAIGN MASTER HEADLINE / HOOK INTENT</span>
                            <button
                              onClick={() => copyToClipboard(result.headline || result.headline_variants?.[0] || topic, 'copyheadline')}
                              className="p-2 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle rounded-lg text-text-secondary hover:text-white"
                            >
                              {copied === 'copyheadline' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <h4 className="text-xl sm:text-2xl font-display font-black uppercase text-white leading-tight">
                            {result.headline || result.headline_variants?.[0] || 'Hasil Copywriting'}
                          </h4>
                        </div>

                        {/* Editable main text workspace */}
                        <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-text-secondary">
                              ✍️ AREA WORKSPACE (BISA EDIT LANGSUNG)
                            </span>
                            <button
                              onClick={() => copyToClipboard(editorText, 'workspace_copy')}
                              className="px-3 py-1.5 bg-bg-primary hover:bg-bg-tertiary border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-wider text-text-secondary hover:text-white flex items-center gap-1"
                            >
                              {copied === 'workspace_copy' ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              COPY WORKSPACE
                            </button>
                          </div>

                          <textarea
                            rows={12}
                            value={editorText}
                            onChange={(e) => setEditorText(e.target.value)}
                            className="w-full bg-bg-tertiary rounded-2xl p-5 border border-border-subtle focus:border-accent-yellow outline-none text-xs sm:text-sm font-sans leading-relaxed text-white resize-y"
                          />

                          {/* Quick revision form */}
                          <div className="pt-4 border-t border-border-subtle/50 space-y-3">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1">
                              <Sliders className="w-3 h-3 text-accent-yellow" />
                              REVISI INSTAN AI / ADAPTER SPEED
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={revisionPrompt}
                                onChange={(e) => setRevisionPrompt(e.target.value)}
                                placeholder="e.g. 'buat lebih santai', 'tambahkan banyak emoji', 'buat versi singkat'"
                                className="flex-1 bg-bg-tertiary border border-border-subtle rounded-xl px-3 outline-none text-xs focus:border-accent-yellow text-white"
                              />
                              <button
                                type="button"
                                disabled={revisingText || !revisionPrompt.trim()}
                                onClick={handleRevisionSubmit}
                                className="px-4 py-2.5 bg-accent-yellow hover:bg-white text-bg-primary text-[9px] font-black uppercase rounded-xl transition-all"
                              >
                                {revisingText ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : 'REVISI'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setRevisionPrompt('buat versi singkat & padat')}
                                className="px-2.5 py-1 bg-bg-tertiary text-text-secondary hover:text-white border border-border-subtle rounded-md text-[8px] uppercase tracking-wider"
                              >
                                ⬇️ More Short
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevisionPrompt('sisipkan emoji ramah yang atraktif')}
                                className="px-2.5 py-1 bg-bg-tertiary text-text-secondary hover:text-white border border-border-subtle rounded-md text-[8px] uppercase tracking-wider"
                              >
                                😍 Add Emojis
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hashtag suggestions */}
                        {result.hashtags && result.hashtags.length > 0 && (
                          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-[#94a3b8] block">HASHTAG REKOMENDASI TERPOPULER</span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.hashtags.map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-bg-tertiary rounded-lg text-[10px] font-bold border border-border-subtle text-accent-yellow font-sans">
                                  {tag.startsWith('#') ? tag : '#' + tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {outputTab === 'structure' && (
                      <motion.div
                        key="structure-pane"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Carousel Slides Render */}
                        {contentType === 'carousel' && result.carousel_slides && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.carousel_slides.map((slide: any) => (
                              <div key={slide.id} className="bg-bg-secondary border border-border-subtle p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
                                <span className="absolute top-4 right-4 text-xs font-black font-mono text-border-subtle">#{slide.id}</span>
                                <div className="space-y-2">
                                  <h5 className="font-display font-black uppercase text-accent-yellow text-sm leading-tight pr-6 mb-1">{slide.title}</h5>
                                  <p className="text-text-secondary text-xs leading-relaxed font-semibold mb-4 whitespace-pre-line">{slide.content}</p>
                                </div>
                                <div className="bg-bg-tertiary/40 p-3 rounded-xl border border-border-subtle">
                                  <span className="text-[8px] font-black uppercase text-accent-yellow block mb-1">Visual Prompt Direction:</span>
                                  <span className="text-[9.5px] italic text-white/70 block">"{slide.visual_prompt}"</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Twitter Threads List */}
                        {contentType === 'threads' && result.thread_tweets && (
                          <div className="space-y-3">
                            {result.thread_tweets.map((tweet: any) => (
                              <div key={tweet.id} className="bg-bg-secondary border border-border-subtle p-5 rounded-[2rem] flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-mono font-black flex items-center justify-center shrink-0">{tweet.id}</div>
                                <div className="space-y-2 flex-1">
                                  <p className="text-sm font-sans font-semibold text-white leading-relaxed">{tweet.text}</p>
                                  {tweet.visual_description && <span className="text-[8px] uppercase tracking-wider text-text-secondary block">💡 Scene Idea: "{tweet.visual_description}"</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Shorts/Video Timeline */}
                        {contentType === 'video_script' && result.video_timeline && (
                          <div className="space-y-4">
                            {result.video_timeline.map((scene: any, idx: number) => (
                              <div key={idx} className="bg-bg-secondary border border-border-subtle rounded-[2rem] overflow-hidden">
                                <div className="bg-bg-tertiary p-4 flex justify-between border-b border-border-subtle px-6">
                                  <span className="text-xs font-black font-mono text-accent-yellow">{scene.time}</span>
                                  <span className="text-[9px] font-black uppercase text-[#94a3b8]">{scene.section}</span>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest block">SPOKEN DIALOGUE:</span>
                                    <p className="text-xs font-semibold text-white leading-relaxed italic">"{scene.script}"</p>
                                  </div>
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black text-[#3b82f6] uppercase tracking-widest block">VISUAL STORYBOARD:</span>
                                    <p className="text-xs text-text-secondary font-medium leading-relaxed mb-2">{scene.visual}</p>
                                    <span className="text-[8px] font-black text-[#a78bfa] uppercase tracking-widest block">AUDIO FX:</span>
                                    <p className="text-xs text-[#a78bfa] font-medium leading-relaxed">{scene.audio}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Caption pack flavors */}
                        {contentType === 'caption_pack' && result.caption_alternatives && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(result.caption_alternatives).map(([key, val]: [string, any]) => (
                              <div key={key} className="bg-bg-secondary border border-border-subtle p-5 rounded-3xl space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#3b82f6] block border-b border-border-subtle pb-1.5">🚀 STYLE {key.toUpperCase()}</span>
                                <p className="text-xs text-text-secondary leading-relaxed font-semibold whitespace-pre-wrap">{val}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Copy Ads Variations details */}
                        {contentType === 'ads_copy' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-bg-secondary border border-border-subtle p-5 rounded-3xl space-y-4">
                              <span className="text-[9px] font-black uppercase text-accent-yellow block">HEADLINE SPLITS</span>
                              {result.headline_variants?.map((h: string, idx: number) => (
                                <div key={idx} className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl text-xs font-bold text-white uppercase">{h}</div>
                              ))}
                            </div>
                            <div className="bg-bg-secondary border border-border-subtle p-5 rounded-3xl space-y-4">
                              <span className="text-[9px] font-black uppercase text-[#3b82f6] block">PRIMARY TEXT SPLITS</span>
                              {result.primary_text_variants?.map((p: string, idx: number) => (
                                <div key={idx} className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl text-xs text-text-secondary leading-relaxed font-semibold">{p}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Generic Markdown document display */}
                        {(!result.carousel_slides && !result.thread_tweets && !result.video_timeline && !result.caption_alternatives && !result.headline_variants) && (
                          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem]">
                            <p className="whitespace-pre-wrap text-xs sm:text-sm font-sans leading-relaxed text-text-secondary">{result.content || editorText}</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {outputTab === 'visuals' && (
                      <motion.div
                        key="visuals-pane"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="bg-bg-secondary border border-border-subtle p-6 sm:p-8 rounded-[2rem] space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-[40px]" />
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-[8.5px] font-black uppercase tracking-widest text-[#3b82f6]">CINEMATIC SDXL ART PROMPT</span>
                              <h4 className="text-lg font-display font-black text-white uppercase">RENDER GRAPHICS PROMPT COMMAND</h4>
                            </div>
                            <button
                              onClick={() => copyToClipboard(result.image_prompt, 'rendererprompt')}
                              className="px-3.5 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-[8.5px] font-black uppercase tracking-wider rounded-xl border border-border-subtle transition-all flex items-center gap-1 text-text-secondary hover:text-white"
                            >
                              {copied === 'rendererprompt' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              COPY COMMAND
                            </button>
                          </div>
                          <div className="bg-bg-tertiary p-4.5 rounded-xl border border-border-subtle">
                            <p className="text-xs font-mono leading-relaxed text-text-secondary italic">"{result.image_prompt || 'RENDER DIRECTION TEXT'}"</p>
                          </div>
                          
                          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[9px] text-text-secondary max-w-sm leading-relaxed">*Gunakan prompt teks di atas pada fitur **Visual Engine (SDXL)** kami untuk me-render gambar poster promosi berkualitas ultra sinematik.</p>
                            <button
                              onClick={() => {
                                localStorage.setItem('visual_engine_prompt', result.image_prompt);
                                window.location.search = '?tab=visual-engine';
                              }}
                              className="px-5 py-3 bg-accent-yellow text-bg-primary text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-white scale-100 transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5 font-bold" />
                              LAUNCH TO VISUAL ENGINE
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STUDIO COMPLEMENTARY ADDONS - TAB 1 BOTTOM GRID */}
                  <div className="border-t border-border-subtle/40 pt-8 space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#94a3b8] block ml-1 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-accent-yellow" />
                      ADDONS MARKETING UTILITIES
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Repurpose content option */}
                      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">
                          <span>Repurpose Copywriting</span>
                          {simulatedPlan === 'guest' ? <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[7.5px]">PRO 🔒</span> : <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[7.5px] font-bold">UNLOCKED</span>}
                        </div>

                        {simulatedPlan === 'guest' ? (
                          <div className="p-4 bg-bg-tertiary/20 rounded-xl border border-border-subtle text-center space-y-2">
                            <Lock className="w-5 h-5 mx-auto text-red-500/50" />
                            <p className="text-[10px] font-black uppercase text-text-secondary">Premium Locked</p>
                            <p className="text-[9px] text-text-secondary leading-normal opacity-80">Ubah draf tulisan ke platform LinkedIn, Thread, atau Email marketing secara instan.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <select
                                value={repurposeTarget}
                                onChange={(e) => setRepurposeTarget(e.target.value)}
                                className="bg-bg-tertiary p-2 rounded-xl border border-border-subtle text-[10px] text-white flex-1 outline-none focus:border-accent-yellow"
                              >
                                <option value="LinkedIn">LinkedIn Storytelling format</option>
                                <option value="Twitter/X">Twitter/X short Thread format</option>
                                <option value="Email">Email marketing Newsletter format</option>
                              </select>
                              <button
                                onClick={handleRepurpose}
                                disabled={generatingRepurpose}
                                className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-[9px] uppercase rounded-xl transition-all"
                              >
                                {generatingRepurpose ? 'REPACK...' : 'UBAH FORMAT'}
                              </button>
                            </div>
                            {repurposedResult && (
                              <div className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle space-y-2 relative">
                                <div className="flex justify-between items-center text-[8px] font-black text-[#3b82f6]">
                                  <span>{repurposedResult.title}</span>
                                  <button onClick={() => copyToClipboard(repurposedResult.text, 'copyrepurp')} className="text-text-secondary hover:text-white">
                                    {copied === 'copyrepurp' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-[10.5px] leading-relaxed text-text-secondary italic whitespace-pre-wrap opacity-90">{repurposedResult.text}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* A/B options modifier */}
                      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">
                          <span>A/B Copy Split Testing</span>
                          {simulatedPlan !== 'vip' ? <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[7.5px]">VIP 🔒</span> : <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[7.5px] font-bold">UNLOCKED</span>}
                        </div>

                        {simulatedPlan !== 'vip' ? (
                          <div className="p-4 bg-bg-tertiary/20 rounded-xl border border-border-subtle text-center space-y-2">
                            <Lock className="w-5 h-5 mx-auto text-red-500/50" />
                            <p className="text-[10px] font-black uppercase text-text-secondary">VIP Level Required</p>
                            <p className="text-[9px] text-text-secondary leading-normal opacity-80">Bandingkan sudut pandang direct response sales copy vs narrative storytelling secara berdampingan.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button
                              onClick={handleABGenerate}
                              disabled={generatingAB}
                              className="w-full py-2.5 bg-bg-tertiary hover:bg-[#3b82f6] border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white flex items-center justify-center gap-1 transition-all"
                            >
                              {generatingAB ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                              SOLVE A/B MARKETING VARIANTS
                            </button>
                            {(abOptionA || abOptionB) && (
                              <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-[10px] text-text-secondary leading-relaxed">
                                <div className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl max-h-[140px] overflow-y-auto">{abOptionA}</div>
                                <div className="p-3 bg-bg-tertiary border border-border-subtle rounded-xl max-h-[140px] overflow-y-auto">{abOptionB}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Scheduler calendar */}
                      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">
                          <span>Content Calendar Quick Schedular</span>
                          {simulatedPlan !== 'vip' ? <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[7.5px]">VIP 🔒</span> : <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[7.5px] font-bold">UNLOCKED</span>}
                        </div>

                        {simulatedPlan !== 'vip' ? (
                          <div className="p-4 bg-bg-tertiary/20 rounded-xl border border-border-subtle text-center space-y-2">
                            <Lock className="w-5 h-5 mx-auto text-red-500/50" />
                            <p className="text-[10px] font-black uppercase text-text-secondary">VIP Level Required</p>
                            <p className="text-[9px] text-text-secondary leading-normal opacity-80">Jadwalkan rilis postingan secara terjadwal otomatis di platform media sosial.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle" />
                              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle" />
                            </div>
                            <button
                              onClick={handleCalendarQuickAdd}
                              className="w-full py-2.5 bg-accent-yellow hover:bg-white text-bg-primary text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                              JADWALKAN POSTINGAN SEKARANG
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Perkuat Hook button redirect link */}
                      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] flex flex-col justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-accent-yellow flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-accent-yellow" />
                            STRENGTHEN HOOK
                          </span>
                          <h4 className="text-xs font-black uppercase text-white tracking-wide">PERKUAT DENGAN HOOK GENERATOR</h4>
                          <p className="text-[10px] text-text-secondary leading-relaxed">
                            Butuh kalimat hook yang jauh lebih menggelegar dan mengejutkan pembaca seketika? Pindahkan topik riset ini ke panel pencipta hook scroll-stopper digital kami sekarang juga.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setHookTopic(topic || "Bisnis Minimalis Digital");
                            setGeneratorTab('hooks');
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/25 hover:bg-[#3b82f6] hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          LAUNCH HOOK GENERATOR STUDIO →
                        </button>
                      </div>

                    </div>
                  </div>

                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             MAIN TAB 2: HOOK SCROLL-STOPPER GENERATOR (Bagian 12)
             ======================================================== */
          <motion.div
            key="hook-generator-engine"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start"
          >
            {/* Input Panel on Left */}
            <form onSubmit={handleGenerateHooks} className="bg-bg-secondary border border-border-subtle p-6 sm:p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-border-subtle pb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-yellow animate-bounce" />
                HOOK STIMULATOR brief
              </h3>

              {/* Engine selector */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">PILIH MESIN AI</label>
                <div className="grid grid-cols-3 gap-1 bg-bg-tertiary border border-border-subtle p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveEngine('assembly')}
                    className={cn(
                      "py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                      activeEngine === 'assembly' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    ASSEMBLY
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEngine('gemini')}
                    className={cn(
                      "py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                      activeEngine === 'gemini' ? "bg-bg-primary text-accent-yellow border border-accent-yellow/20" : "text-text-secondary hover:text-white"
                    )}
                  >
                    GEMINI
                  </button>
                  <button
                    type="button"
                    disabled={isEngineRestricted('nvidia')}
                    onClick={() => setActiveEngine('nvidia')}
                    className={cn(
                      "py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                      activeEngine === 'nvidia' ? "bg-bg-primary text-blue-400 border border-blue-500/30" : "text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                  >
                    NVIDIA
                    {isEngineRestricted('nvidia') && <Lock className="w-2.5 h-2.5 text-red-500/60" />}
                  </button>
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">TOPIK KONTEN</label>
                <textarea
                  rows={3}
                  value={hookTopic}
                  onChange={(e) => setHookTopic(e.target.value)}
                  placeholder="e.g. Tips diet sehat defisit kalori tanpa merusak ginjal..."
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3.5 outline-none focus:border-accent-yellow text-xs font-sans text-white resize-none"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">TARGET AUDIENS</label>
                <input
                  type="text"
                  value={hookAudience}
                  onChange={(e) => setHookAudience(e.target.value)}
                  placeholder="e.g. pekerja kantoran, ibu menyusui, mahasiswa"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none focus:border-accent-yellow text-xs font-sans text-white"
                />
              </div>

              {/* Platform and Length */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">PLATFORM</label>
                  <select
                    value={hookPlatform}
                    onChange={(e) => setHookPlatform(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] text-white appearance-none cursor-pointer pr-4"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p} className="bg-bg-secondary text-white">{p}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">PANJANG HOOK</label>
                  <select
                    value={hookLength}
                    onChange={(e) => setHookLength(e.target.value as any)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-2.5 outline-none text-[10px] text-white appearance-none cursor-pointer pr-4"
                  >
                    <option value="pendek" className="bg-bg-secondary text-white">Pendek (1 Kalimat)</option>
                    <option value="sedang" className="bg-bg-secondary text-white">Sedang (2 Kalimat)</option>
                    <option value="panjang" className="bg-bg-secondary text-white">Panjang (3 Kalimat)</option>
                  </select>
                </div>
              </div>

              {/* Triggers Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  disabled={generatingHooks || !hookTopic.trim()}
                  className="py-4 bg-[#3b82f6] hover:bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/10"
                >
                  {generatingHooks ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  GENERATE HOOKS
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const presetTopics = [
                      "Bikin agensi desain modal dengkul di kamar kosan",
                      "Cheat sheet kuasai Excel formula VLOOKUP kurang dari 60 detik",
                      "Bahaya menabung uang cash di bawah kasur di tengah inflasi 2026",
                      "Rahasia barista bikin es kopi karamel susu creamy di rumah tanpa alat espresso mahal"
                    ];
                    const randomPick = presetTopics[Math.floor(Math.random() * presetTopics.length)];
                    setHookTopic(randomPick);
                    setHookAudience("anak muda usia produktif, pekerja urban");
                  }}
                  className="py-4 bg-bg-tertiary border border-border-subtle hover:border-text-secondary text-text-secondary hover:text-white font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  RANDOM TOPIC
                </button>
              </div>

              {/* Bulk generate indicator if VIP level */}
              {simulatedPlan === 'vip' && (
                <div className="p-3.5 bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl flex items-start gap-2 pt-3">
                  <Lightbulb className="w-4 h-4 text-accent-yellow shrink-0 mt-0.5" />
                  <p className="text-[9px] text-text-secondary leading-relaxed">
                    <strong className="text-white uppercase">VIP UNLOCKED: bulk generator & custom formulas</strong><br/>
                    Masukkan beberapa topik yang dipisahkan baris baru untuk bulk-generating variasi hook sekaligus.
                  </p>
                </div>
              )}
            </form>

            {/* Right Display area of Hooks */}
            <div className="space-y-6">
              {/* Output control tab header */}
              <div className="bg-bg-secondary border border-border-subtle p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-text-secondary tracking-widest">
                    SCROLL-STOPPER ENGINE INDEX ({getFilteredAndSortedHooks().length} RENDERED)
                  </span>
                </div>

                {/* Filter and sorting widgets */}
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1 bg-bg-tertiary border border-border-subtle px-2 py-1 rounded-lg">
                    <span className="text-text-secondary text-[8px]">Sort by:</span>
                    <select
                      value={hookSortBy}
                      onChange={(e) => setHookSortBy(e.target.value as any)}
                      className="bg-transparent text-white outline-none cursor-pointer pr-1"
                    >
                      <option value="strength" className="bg-bg-secondary text-white">Kekuatan (strength) ↓</option>
                      <option value="formula" className="bg-bg-secondary text-white">Gaya Formula A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Standard status if empty */}
              {hookResults.length === 0 && !generatingHooks && (
                <div className="bg-bg-secondary border-2 border-dashed border-border-subtle rounded-[3rem] p-16 text-center space-y-6 flex flex-col justify-center items-center">
                  <Zap className="w-12 h-12 text-[#3b82f6] opacity-35" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase text-white tracking-widest opacity-60">BELUM ADA HOOKS TER-GENERATE</h4>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed opacity-45">
                      Silakan isi penjelasan ringkas topik tulisan Anda di panel kiri, lalu tekan Generate Hooks untuk melahirkan 15 formula hook pemicu rasa penasaran instan.
                    </p>
                  </div>
                </div>
              )}

              {generatingHooks && (
                <div className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-16 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
                  <RotateCw className="w-10 h-10 animate-spin text-[#3b82f6] mb-6" />
                  <p className="text-[10px] font-black uppercase text-[#3b82f6] tracking-widest animate-pulse">MEMBEDAH 15 FORMULA PSIKOLOGI MARKETING DI INDONESIA...</p>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed mt-2.5">
                    Meramu formula Question, Shock Data, Fear, hingga POV yang paling relatable untuk target audiens Anda.
                  </p>
                </div>
              )}

              {/* LIST RENDERED HOOKS */}
              {hookResults.length > 0 && !generatingHooks && (
                <div className="space-y-4">
                  {getFilteredAndSortedHooks().map((h, index) => {
                    const scoreColor = h.strength >= 90 ? 'text-green-400' : h.strength >= 80 ? 'text-accent-yellow' : 'text-blue-400';
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-bg-secondary border border-border-subtle p-5 sm:p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all"
                      >
                        {/* strength light backdrop */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b82f6]/5 blur-[40px] pointer-events-none" />

                        {/* Card metadata label row */}
                        <div className="flex justify-between items-start gap-4 mb-4 font-sans text-[9px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base">{h.emoji}</span>
                            <span className="text-white text-[10px]">{h.formula}</span>
                            <span className="text-text-secondary px-1.5 py-0.5 bg-bg-tertiary rounded font-normal text-[8px] tracking-normal border border-border-subtle">
                              Compat: {h.platform_fit?.join(', ')}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end shrink-0 select-none">
                            <span className="text-text-secondary text-[8px]">STRENGTH METER</span>
                            <span className={cn("text-[11px] font-black font-mono", scoreColor)}>{h.strength}/100</span>
                            {/* colored bar line preview */}
                            <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden mt-1 border border-border-subtle/50">
                              <div 
                                className={cn("h-full rounded-full", h.strength >= 90 ? "bg-green-400" : h.strength >= 80 ? "bg-accent-yellow" : "bg-blue-400")} 
                                style={{ width: `${h.strength}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* BIG HOOK WORD TEXT */}
                        <h4 className="text-base sm:text-lg font-sans font-black text-white leading-relaxed mb-3 pr-8">
                          "{h.hook}"
                        </h4>

                        {/* Explained copy justification */}
                        <p className="text-[10.5px] text-text-secondary bg-bg-tertiary p-3 rounded-2xl border border-border-subtle leading-relaxed flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[#3b82f6] shrink-0 mt-0.5" />
                          <span><strong>Analisis Daya Guncang:</strong> {h.why}</span>
                        </p>

                        {/* COPY PRESET OPTIONS AND INTEGRATIONS */}
                        <div className="mt-4 pt-3.5 border-t border-border-subtle/40 flex flex-wrap items-center justify-between gap-3.5">
                          {/* Copy utilities dropdown selection */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[8.5px]">
                            <button
                              onClick={() => copyToClipboard(h.hook, `hook_${index}`)}
                              className="px-2.5 py-1.5 bg-bg-tertiary rounded-lg text-text-secondary hover:text-white border border-border-subtle flex items-center gap-1"
                            >
                              {copied === `hook_${index}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              Copy Hook
                            </button>

                            <button
                              onClick={() => {
                                const igText = `"${h.hook}"\n\n.\n.\n🚀 [Tulis kelanjutan isi caption edukatif / promosi Anda di sini]`;
                                copyToClipboard(igText, `ig_${index}`);
                              }}
                              className="px-2.5 py-1.5 bg-bg-primary hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-white border border-border-subtle"
                            >
                              {copied === `ig_${index}` ? 'Copied IG' : '📸 For IG'}
                            </button>

                            <button
                              onClick={() => {
                                const ttText = `${h.hook.toUpperCase()} ⚡️👀 #shorts #viral #fyp`;
                                copyToClipboard(ttText, `tok_${index}`);
                              }}
                              className="px-2.5 py-1.5 bg-bg-primary hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-white border border-border-subtle"
                            >
                              {copied === `tok_${index}` ? 'Copied TikTok' : '🎵 For TikTok'}
                            </button>

                            <button
                              onClick={() => {
                                const lnText = `"${h.hook}"\n\n---\n🎯 Bagikan pandangan kawan-kawan di kolom komentar! #LinkedInStory`;
                                copyToClipboard(lnText, `lin_${index}`);
                              }}
                              className="px-2.5 py-1.5 bg-bg-primary hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-white border border-border-subtle"
                            >
                              {copied === `lin_${index}` ? 'Copied Link' : '💼 For Link'}
                            </button>
                          </div>

                          {/* Quick integration back to Content Generator */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveHook(h)}
                              className="px-3 py-1.5 bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-white border border-border-subtle rounded-lg text-[8.5px] uppercase font-black"
                            >
                              💾 Save Hook
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setTopic(h.hook + "\n\n" + topic);
                                setGeneratorTab('content');
                                alert("Sukses! Hook ini telah disisipkan sebagai pembuka brief utama di menu Content Generator.");
                              }}
                              className="px-4 py-1.5 bg-accent-yellow hover:bg-white text-bg-primary rounded-lg text-[8.5px] uppercase font-black tracking-wider transition-all flex items-center gap-1"
                            >
                              USE IN CREATOR STUDIO →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* INTEGRATED UTILITY TOOLS GRID - TAB 2 BOTTOM */}
              {hookResults.length > 0 && !generatingHooks && (
                <div className="border-t border-border-subtle/50 pt-8 space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#94a3b8] block ml-1">⚡ SCROLL-STOPPER EXPERIMENTAL LAB</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hook Combiner (⚡) */}
                    <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2.5rem] space-y-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-accent-yellow block">🧬 COMPONENT COMBINER</span>
                        <h4 className="text-xs font-black uppercase text-white">🔀 FUSE HYBRID COMBINED HOOK</h4>
                        <p className="text-[9.5px] text-text-secondary leading-relaxed">
                          Pilih 2 formula gaya hook yang berbeda, lalu campur mereka secara sinergis menjadi 1 hook hibrida berkekuatan ganda.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                        <select
                          value={combinerFormulaA}
                          onChange={(e) => setCombinerFormulaA(e.target.value)}
                          className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle"
                        >
                          {HOOK_FORMULAS.map(f => <option key={f.id} value={f.name}>{f.emoji} {f.name}</option>)}
                        </select>
                        <select
                          value={combinerFormulaB}
                          onChange={(e) => setCombinerFormulaB(e.target.value)}
                          className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle"
                        >
                          {HOOK_FORMULAS.filter(f => f.name !== combinerFormulaA).map(f => <option key={f.id} value={f.name}>{f.emoji} {f.name}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={handleCombineHooks}
                        disabled={fusingHook}
                        className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-[9px] uppercase font-black rounded-xl tracking-wider transition-all"
                      >
                        {fusingHook ? 'FUSING MOLECULES...' : '🔀 FUSE HYBRID HOOK'}
                      </button>

                      {combinedHookResult && (
                        <div className="p-4 bg-bg-tertiary rounded-2xl border border-border-subtle relative space-y-2">
                          <button onClick={() => copyToClipboard(combinedHookResult, 'copyfuse')} className="absolute right-3 top-3 text-text-secondary hover:text-white">
                            {copied === 'copyfuse' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-[7.5px] font-black uppercase text-accent-yellow tracking-widest block">HYBRID RESULT:</span>
                          <p className="text-[11px] leading-relaxed text-text-secondary italic font-sans whitespace-pre-line font-medium pr-8">
                            {combinedHookResult}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* A/B Slide Comparator */}
                    <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2.5rem] space-y-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-accent-yellow block">⚖️ TESTING HUB</span>
                        <h4 className="text-xs font-black uppercase text-white">⚖️ COMPETE HOOKS SIDE-BY-SIDE</h4>
                        <p className="text-[9.5px] text-text-secondary leading-relaxed">
                          Pilih 2 hook favorit Anda dan uji skor konversinya berdasarkan kriteria daya relasi, dorongan rasa penasaran, dan kemudahan klik.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                        <select
                          value={abTestHookA}
                          onChange={(e) => setAbTestHookA(e.target.value)}
                          className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle"
                        >
                          <option value="">-- Pilih Hook A --</option>
                          {hookResults.map((hr, idx) => <option key={idx} value={hr.hook}>{hr.emoji} {hr.formula}</option>)}
                        </select>
                        <select
                          value={abTestHookB}
                          onChange={(e) => setAbTestHookB(e.target.value)}
                          className="bg-bg-tertiary p-2 rounded-xl text-white outline-none border border-border-subtle"
                        >
                          <option value="">-- Pilih Hook B --</option>
                          {hookResults.filter(hr => hr.hook !== abTestHookA).map((hr, idx) => <option key={idx} value={hr.hook}>{hr.emoji} {hr.formula}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={handleCompareABHooks}
                        disabled={testingABHooks || !abTestHookA || !abTestHookB}
                        className="w-full py-2.5 bg-bg-tertiary text-text-secondary hover:text-white hover:bg-[#3b82f6] border border-border-subtle text-[9px] uppercase font-black rounded-xl tracking-wider transition-all"
                      >
                        {testingABHooks ? 'ANALYZING METRICS...' : '⚖️ RUN A/B COMPARATIVE TEST'}
                      </button>

                      {abTestReport && (
                        <div className="p-4 bg-bg-tertiary rounded-2xl border border border-border-subtle text-[10.5px] space-y-3 font-sans">
                          <div className="flex justify-between border-b border-border-subtle/50 pb-2 text-[8px] font-black uppercase">
                            <span className="text-[#3b82f6]">Opsi A: {abTestReport.optionA.score}/100</span>
                            <span className="text-accent-yellow">Opsi B: {abTestReport.optionB.score}/100</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[9px] text-text-secondary leading-relaxed">
                            <div className="space-y-0.5">
                              <span>Curiosity: <strong>{abTestReport.optionA.curiosity}</strong></span>
                              <br/>
                              <span>Clickability: <strong>{abTestReport.optionA.clickability}</strong></span>
                            </div>
                            <div className="space-y-0.5">
                              <span>Curiosity: <strong>{abTestReport.optionB.curiosity}</strong></span>
                              <br/>
                              <span>Clickability: <strong>{abTestReport.optionB.clickability}</strong></span>
                            </div>
                          </div>
                          <div className="border-t border-border-subtle/50 pt-2 text-[10px]">
                            <span className="text-green-400 font-bold uppercase block mb-1">👑 REKOMENDASI PEMENANG: {abTestReport.winner}</span>
                            <p className="text-text-secondary leading-relaxed italic">"{abTestReport.reason}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
