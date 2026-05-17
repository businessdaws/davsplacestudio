import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
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
  LogOut,
  Zap,
  Bookmark,
  BookmarkCheck,
  LayoutDashboard
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { generateSocialMediaContent, generateArticleContent } from '../lib/gemini';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { cn } from '../lib/utils';

export default function SocialMediaGenerator() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError('Gagal login: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setResult(null);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-16 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-yellow/10 text-accent-yellow text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-6 border border-accent-yellow/20">
                <Sparkles className="w-3 h-3" />
                AI-Powered Creativity
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase mb-6 leading-none">
                AI CONTENT <span className="text-accent-yellow">GENERATOR</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-2xl font-sans">
                Buat konten sosial media dan artikel profesional dalam hitungan detik langsung dari AI Davsplace.
              </p>
            </motion.div>
          </div>

          {!user ? (
            /* Login State */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary border border-border-subtle p-12 rounded-[2rem] text-center"
            >
              <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-8">
                <Zap className="w-10 h-10 text-accent-yellow" />
              </div>
              <h2 className="text-3xl font-display font-black mb-4 uppercase">Akses Eksklusif</h2>
              <p className="text-text-secondary mb-10 max-w-md mx-auto">
                Fitur ini hanya tersedia untuk member Davsplace. Silakan login untuk mulai membuat konten.
              </p>
              <button 
                onClick={handleLogin}
                className="px-10 py-5 bg-accent-yellow text-bg-primary font-black rounded-2xl flex items-center justify-center gap-3 mx-auto hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-yellow/20"
              >
                Login dengan Google
              </button>
            </motion.div>
          ) : (
            /* Tool State */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-8">
                {/* Type Selection Tabs */}
                <div className="flex p-1.5 bg-bg-secondary border border-border-subtle rounded-2xl">
                  <button
                    onClick={() => {
                      setGeneratorType('social-media');
                      setResult(null);
                    }}
                    className={cn(
                      "flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      generatorType === 'social-media' 
                        ? "bg-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/20" 
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
                      "flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                      generatorType === 'article' 
                        ? "bg-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/20" 
                        : "text-text-secondary hover:text-white"
                    )}
                  >
                    Artikel Generator
                    <span className="px-1.5 py-0.5 bg-bg-primary text-accent-yellow text-[8px] rounded uppercase">Beta</span>
                  </button>
                </div>

                {/* Trial Notice */}
                <AnimatePresence>
                  {generatorType === 'article' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl flex items-center gap-3 text-accent-yellow overflow-hidden"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        Info: Fitur Artikel Generator masih dalam tahap uji coba selama sebulan.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2rem]">
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                        Apa topik yang ingin kamu jadikan konten?
                      </label>
                      <textarea 
                        rows={3}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={generatorType === 'article' ? "Contoh: Panduan lengkap memulai investasi kripto untuk pemula..." : "Contoh: Manfaat desain minimalis untuk branding startup..."}
                        className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl p-6 outline-none focus:border-accent-yellow transition-all text-lg font-sans resize-none"
                      />
                    </div>

                    {generatorType === 'article' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                          Gaya Penulisan
                        </label>
                        <select
                          value={writingStyle}
                          onChange={(e) => setWritingStyle(e.target.value)}
                          className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl p-4 outline-none focus:border-accent-yellow transition-all text-sm font-sans appearance-none cursor-pointer"
                        >
                          <option value="professional">Professional & Kredibel</option>
                          <option value="formal">Formal & Serius</option>
                          <option value="relaxed">Santai & Dekat</option>
                          <option value="informative">Informatif & Edukatif</option>
                          <option value="persuasive">Persuasif & Menyakinkan</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                        Pilih Model AI
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('gemini')}
                          className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            selectedProvider === 'gemini' 
                              ? "bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/5" 
                              : "bg-bg-tertiary border-border-subtle text-text-secondary grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304dfad33318282.svg" className="w-5 h-5" alt="Gemini" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Google Gemini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('nvidia-nemotron')}
                          className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            selectedProvider === 'nvidia-nemotron' 
                              ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/5" 
                              : "bg-bg-tertiary border-border-subtle text-text-secondary grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Zap className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">NVIDIA Nemotron</span>
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={generating || !topic.trim()}
                      className="w-full py-5 bg-accent-yellow text-bg-primary font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          MEMPROSES...
                        </>
                      ) : (
                        <>
                          GENERATE CONTENT
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Result Area */}
                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Action Bar */}
                      <div className="flex items-center justify-between bg-bg-secondary border border-border-subtle p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            selectedProvider === 'gemini' ? "bg-accent-yellow" : "bg-blue-500"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                            Generated by {selectedProvider === 'gemini' ? 'Gemini' : 'Nemotron'}
                          </span>
                        </div>
                        
                        <button
                          onClick={handleSave}
                          disabled={saving || isSaved}
                          className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            isSaved 
                              ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                              : "bg-accent-yellow text-bg-primary hover:scale-105 active:scale-95"
                          )}
                        >
                          {saving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isSaved ? (
                            <BookmarkCheck className="w-3 h-3" />
                          ) : (
                            <Bookmark className="w-3 h-3" />
                          )}
                          {isSaved ? 'TERSIPAN' : 'SIMPAN KONTEN'}
                        </button>
                      </div>

                       {/* Headline/Title Card */}
                      <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2rem] group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                              <Zap className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                              {generatorType === 'social-media' ? 'Headline' : 'Rekomendasi Judul'}
                            </span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(generatorType === 'social-media' ? result.headline : result.title_options?.join('\n'), 'headline')}
                            className="p-3 bg-bg-tertiary rounded-xl hover:text-accent-yellow transition-all"
                          >
                            {copied === 'headline' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        {generatorType === 'social-media' ? (
                          <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight uppercase">
                            {result.headline}
                          </h3>
                        ) : (
                          <div className="space-y-4">
                            {result.title_options?.map((title: string, i: number) => (
                              <div key={i} className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
                                <p className="font-display font-bold text-lg uppercase leading-tight">{title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Caption/Content Card */}
                      <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2rem]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                              {generatorType === 'social-media' ? 'Caption' : 'Konten Artikel'}
                            </span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(generatorType === 'social-media' ? result.caption : result.content, 'caption')}
                            className="p-3 bg-bg-tertiary rounded-xl hover:text-accent-yellow transition-all"
                          >
                            {copied === 'caption' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className={cn(
                          "text-text-secondary font-sans leading-relaxed whitespace-pre-wrap",
                          generatorType === 'article' && "prose prose-invert max-w-none text-lg"
                        )}>
                          {generatorType === 'social-media' ? result.caption : result.content}
                        </div>
                      </div>

                      {/* Hashtags Card */}
                      <div className="bg-bg-secondary border border-border-subtle p-8 rounded-[2rem]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                              <Hash className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Hashtags</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')}
                            className="p-3 bg-bg-tertiary rounded-xl hover:text-accent-yellow transition-all"
                          >
                            {copied === 'hashtags' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-bg-tertiary border border-border-subtle rounded-lg text-xs font-bold text-accent-yellow">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-red-500">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <p className="font-bold mb-1 uppercase text-xs">Generation Error</p>
                      <p className="text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-bg-tertiary border border-border-subtle p-8 rounded-[2rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <img 
                      src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} 
                      className="w-12 h-12 rounded-full border border-accent-yellow/50"
                      alt={user.displayName}
                    />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Active User</p>
                      <p className="font-display font-bold truncate">{user.displayName}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-border-subtle">
                    <Link 
                      to="/dashboard"
                      className="w-full py-4 bg-accent-yellow text-bg-primary font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Saved Content
                    </Link>

                    <div>
                      <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-4">Credible Sources</p>
                      <div className="space-y-3">
                        {result?.sources ? result.sources.map((src: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl border border-border-subtle text-xs truncate">
                            <LinkIcon className="w-4 h-4 text-accent-yellow shrink-0" />
                            <span className="truncate opacity-70 italic">{src}</span>
                          </div>
                        )) : (
                          <p className="text-xs text-text-secondary opacity-50 italic">Generate content to see sources here.</p>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 bg-bg-primary border border-border-subtle text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-accent-yellow rounded-[2rem] text-bg-primary">
                  <h4 className="text-lg font-display font-black mb-4 uppercase leading-none">Pro Tip!</h4>
                  <p className="text-sm font-sans font-medium leading-relaxed opacity-90">
                    Berikan detail seperti target audience atau nada bicara (formal/santai) pada input topik untuk hasil yang lebih presisi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
