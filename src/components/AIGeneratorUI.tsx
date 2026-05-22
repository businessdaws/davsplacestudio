import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Hash, 
  FileText, 
  Link as LinkIcon, 
  Loader2,
  AlertCircle,
  Zap,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  HelpCircle,
  X
} from 'lucide-react';
import { generateSocialMediaContent, generateArticleContent } from '../lib/gemini';
import { cn } from '../lib/utils';

interface AIGeneratorUIProps {
  user: any;
}

export default function AIGeneratorUI({ user }: AIGeneratorUIProps) {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [topic, setTopic] = useState('');
  const [generatorType, setGeneratorType] = useState<'social-media' | 'article'>('social-media');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [result, setResult] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'nvidia-nemotron'>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  useEffect(() => {
    try {
      const pendingSocialPrompt = localStorage.getItem('analyzer_social_prompt');
      if (pendingSocialPrompt) {
        setTopic(`Buat caption sosial media menarik berdasarkan ringkasan riset berikut:\n\n${pendingSocialPrompt}`);
        localStorage.removeItem('analyzer_social_prompt');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setIsSaved(false);
    setError(null);
    try {
      let data;
      if (generatorType === 'article') {
        data = await generateArticleContent(topic, writingStyle, selectedProvider);
      } else {
        data = await generateSocialMediaContent(topic, selectedProvider);
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Maaf, ada masalah saat memproses AI. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    
    setSaving(true);
    try {
      await addDoc(collection(db, 'saved_contents'), {
        user_id: user.uid,
        topic: topic,
        type: generatorType,
        headline: result.headline || result.title_options?.[0],
        caption: result.caption || result.content,
        hashtags: result.hashtags || [],
        sources: result.sources || [],
        image_prompt: result.image_prompt || '',
        provider: selectedProvider,
        writing_style: writingStyle,
        created_at: serverTimestamp()
      });
      setIsSaved(true);
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      setError("Gagal menyimpan konten. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Intro Header Card - perfectly inline with dynamic studio branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-tertiary border border-border-subtle p-8 md:p-12 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-yellow/5 blur-[120px] pointer-events-none" />
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-accent-yellow/20 to-accent-yellow/5 rounded-[2rem] flex items-center justify-center shrink-0 border border-accent-yellow/25 shadow-lg shadow-accent-yellow/10">
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-accent-yellow" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black tracking-widest rounded-full border border-accent-yellow/20 uppercase">
            <Zap className="w-3 h-3 animate-pulse" /> Davsplace Studio Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">AI CONTENT GENERATOR</h2>
          <p className="text-text-secondary text-xs sm:text-sm font-sans max-w-xl opacity-80 leading-relaxed">
            Asisten cerdas pembuat konten premium. Kembangkan ide tulisan, buat caption interaktif sosial media, atau rancang naskah artikel berstruktur SEO unggulan dalam sekejap.
          </p>
        </div>
      </motion.div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Column (Inputs & Models) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-text-secondary border-b border-border-subtle/30 pb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-yellow" />
              1. Setup Parameter AI
            </h3>

            {/* Type Selection Tabs */}
            <div className="flex p-1 bg-bg-tertiary border border-border-subtle rounded-xl text-[9px] font-black uppercase">
              <button
                onClick={() => {
                  setGeneratorType('social-media');
                  setResult(null);
                }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg transition-all",
                  generatorType === 'social-media' 
                    ? "bg-accent-yellow text-bg-primary shadow-md" 
                    : "text-text-secondary hover:text-white"
                )}
              >
                Social Media
              </button>
              <button
                onClick={() => {
                  setGeneratorType('article');
                  setResult(null);
                }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg transition-all relative flex items-center justify-center gap-1.5",
                  generatorType === 'article' 
                    ? "bg-accent-yellow text-bg-primary shadow-md" 
                    : "text-text-secondary hover:text-white"
                )}
              >
                Artikel Generator
                <span className="px-1 py-0.5 bg-bg-primary text-accent-yellow text-[7px] rounded uppercase font-black tracking-tighter">BETA</span>
              </button>
            </div>

            {/* Content Field Form */}
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                  Apa topik yang ingin kamu jadikan konten?
                </label>
                <textarea 
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={generatorType === 'article' ? "Panduan lengkap mulai investasi kripto aman..." : "Manfaat desain minimalis untuk branding startup modern..."}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white resize-none leading-relaxed"
                />
              </div>

              {generatorType === 'article' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    Gaya Penulisan
                  </label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3.5 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer"
                  >
                    <option value="professional">🎯 Professional & Kredibel</option>
                    <option value="formal">👔 Formal & Serius</option>
                    <option value="relaxed">☕ Santai & Dekat</option>
                    <option value="informative">📚 Informatif & Edukatif</option>
                    <option value="persuasive">🔥 Persuasif & Menyakinkan</option>
                  </select>
                </div>
              )}

              {/* Engine Model Provider Selection */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                  Pilih Engine AI Power
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('gemini')}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                      selectedProvider === 'gemini' 
                        ? "bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/5" 
                        : "bg-bg-tertiary border-border-subtle text-text-secondary opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304dfad33318282.svg" className="w-4 h-4" alt="Gemini" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Google Gemini</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('nvidia-nemotron')}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                      selectedProvider === 'nvidia-nemotron' 
                        ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg" 
                        : "bg-bg-tertiary border-border-subtle text-text-secondary opacity-60 hover:opacity-100"
                    )}
                  >
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Nemotron-70B</span>
                  </button>
                </div>
              </div>

              {/* Action trigger button */}
              <button 
                type="submit"
                disabled={generating || !topic.trim()}
                className="w-full py-4 bg-accent-yellow text-bg-primary font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-[10px] uppercase tracking-widest"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-bg-primary" />
                    Memproses Formula...
                  </>
                ) : (
                  <>
                    Generate Konten AI
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between">
              <span className="text-[8px] font-bold text-text-secondary uppercase">Powered by API Gateway</span>
              <button
                onClick={() => setIsTipsOpen(true)}
                className="text-[9px] flex items-center gap-1 p-0.5 text-accent-yellow hover:underline font-bold uppercase transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Panduan Prompting
              </button>
            </div>
          </div>

          {/* Beta Notice Alert */}
          {generatorType === 'article' && (
            <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl flex items-start gap-3 text-accent-yellow">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold text-accent-yellow uppercase tracking-wide leading-relaxed">
                Artikel Generator masih dalam fase uji coba. Anda dapat mendesain draf naskah panjang dengan struktur heading modular secara gratis.
              </p>
            </div>
          )}
        </div>

        {/* Right Output Column */}
        <div id="design-editor-workspace" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Save status action bar */}
                <div className="bg-bg-secondary border border-border-subtle p-4 rounded-[2rem] shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                      Formula Terbentuk : Selesai
                    </span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || isSaved}
                    className={cn(
                      "flex items-center gap-1.5 px-4 h-9 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all",
                      isSaved 
                        ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                        : "bg-accent-yellow text-bg-primary hover:scale-105 active:scale-95 shadow-lg shadow-accent-yellow/5"
                    )}
                  >
                    {saving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    {isSaved ? 'TERPERSISTENSI' : 'SIMPAN KE DASHBOARD'}
                  </button>
                </div>

                {/* Headline Block */}
                <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-[40px]" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent-yellow" />
                      {generatorType === 'social-media' ? 'Headline Terkurasi' : 'Rekomendasi Judul Editorial'}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatorType === 'social-media' ? result.headline : result.title_options?.join('\n'), 'headline')}
                      className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                    >
                      {copied === 'headline' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {generatorType === 'social-media' ? (
                    <h3 className="text-xl md:text-2xl font-display font-black leading-snug uppercase text-white">
                      {result.headline}
                    </h3>
                  ) : (
                    <div className="space-y-2">
                      {result.title_options?.map((title: string, i: number) => (
                        <div key={i} className="p-3 bg-bg-tertiary/60 rounded-xl border border-border-subtle text-xs font-semibold text-white">
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Content Body */}
                <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent-yellow" />
                      {generatorType === 'social-media' ? 'Caption Output' : 'Naskah Artikel Utama'}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatorType === 'social-media' ? result.caption : result.content, 'caption')}
                      className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                    >
                      {copied === 'caption' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-text-secondary font-sans leading-relaxed text-xs sm:text-sm whitespace-pre-wrap max-h-[380px] overflow-y-auto custom-scrollbar p-1">
                    {generatorType === 'social-media' ? result.caption : result.content}
                  </div>
                </div>

                {/* Hashtags Card */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-accent-yellow" />
                        Sosial Hashtags
                      </span>
                      <button 
                        onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')}
                        className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                      >
                        {copied === 'hashtags' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-bg-tertiary border border-border-subtle rounded-md text-[10px] font-black text-accent-yellow uppercase tracking-wider">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image prompt generation thumbnail */}
                {result.image_prompt && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-accent-yellow" />
                        AI Image Prompt
                      </span>
                      <button 
                        onClick={() => copyToClipboard(result.image_prompt, 'image_prompt')}
                        className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                      >
                        {copied === 'image_prompt' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="p-4 bg-bg-tertiary border border-border-subtle rounded-xl text-xs text-text-secondary font-mono italic leading-relaxed">
                      "{result.image_prompt}"
                    </div>
                  </div>
                )}

                {/* Sources list if any */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-accent-yellow" />
                      Referensi Kredibel Peneliti
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {result.sources.map((src: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 px-3 bg-bg-tertiary rounded-lg border border-border-subtle text-[10px] truncate select-all">
                          <LinkIcon className="w-3 h-3 text-accent-yellow shrink-0" />
                          <span className="truncate opacity-75 italic text-white">{src}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-12 text-center py-20 flex flex-col items-center justify-center space-y-4 shadow-xl"
              >
                <div className="w-16 h-16 bg-bg-tertiary border border-border-subtle rounded-2xl flex items-center justify-center text-accent-yellow shadow-inner">
                  <Sparkles className="w-8 h-8 opacity-40 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black uppercase tracking-widest text-white">Generator Workspace Empty</h3>
                  <p className="text-[10px] text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed opacity-70">
                    Sistem siap menerima topik. Masukkan tema draf Anda di kolom formulir sebelah kiri untuk menyusun konten cerdas.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Guide Prompt Modal overlay */}
      {isTipsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-bg-secondary border border-border-subtle p-8 rounded-[3rem] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                PANDUAN PROMPTING MAKSIMAL
              </span>
              <button 
                onClick={() => setIsTipsOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-text-secondary leading-normal">
              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">💡 Berikan Detail Konteks</p>
                <p>Daripada menulis "Kopi enak", cobalah "Rekomendasi 5 racikan kopi cold brew lokal untuk kalangan milenial pekerja kantoran produktif." Konteks melahirkan presisi tinggi.</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">🏷️ Integrasi Hashtags Cerdas</p>
                <p>Sistem akan memformulasikan tagar yang sedang naik daun dan merekomendasikan penulisan caption terstruktur dengan baris spasi yang rapi untuk meningkatkan interaksi akun.</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">🔗 Buka Dari Analyzer</p>
                <p>Anda dapat mengklik opsi "Generate Social Post" dari tab Content Analyzer untuk merangkum berkas riset Anda ke dalam kolom topik di form ini secara otomatis!</p>
              </div>
            </div>

            <button
              onClick={() => setIsTipsOpen(false)}
              className="w-full py-3 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
            >
              Baik, Saya Paham
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
