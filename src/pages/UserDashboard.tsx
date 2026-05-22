import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import VisualEngineUI from '../components/VisualEngineUI';
import ContentAnalyzerUI from '../components/ContentAnalyzerUI';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Bookmark, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  LayoutDashboard,
  LogOut,
  Zap,
  Clock,
  Hash,
  FileText,
  ChevronRight,
  ArrowLeft,
  X,
  Image as ImageIcon,
  Film,
  Video,
  Camera,
  Download,
  Info,
  Eye
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import UserDashboardNav from '../components/UserDashboardNav';
import { cn, formatDate } from '../lib/utils';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'saved';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate('/generator');
        return;
      }
      setUser(u);
      fetchSavedContents(u.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchSavedContents = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'saved_contents'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContents(data);
    } catch (err) {
      console.error("Gagal memuat konten:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Hapus konten yang disimpan ini?')) return;
    
    try {
      await deleteDoc(doc(db, 'saved_contents', id));
      setContents(contents.filter(c => c.id !== id));
      if (selectedContent?.id === id) setSelectedContent(null);
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = (content: any) => {
    const fullText = `HEADLINE: ${content.headline}\n\nCAPTION:\n${content.caption}\n\nHASHTAGS: ${content.hashtags?.join(' ')}`;
    copyToClipboard(fullText, 'copyall');
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
        <div className="max-w-7xl mx-auto px-6 py-12">
          <UserDashboardNav user={user} />
          
          {activeTab === 'visual-engine' ? (
            <VisualEngineUI user={user} />
          ) : activeTab === 'analyzer' ? (
            <ContentAnalyzerUI user={user} />
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 border border-accent-yellow/20">
                    <LayoutDashboard className="w-3 h-3" />
                    Member Area
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] md:leading-none">
                    SAVED <span className="text-accent-yellow italic">CONTENT</span>
                  </h1>
                  <p className="text-sm md:text-text-secondary mt-4 font-sans max-w-lg opacity-70">
                    Kumpulan konten sosial media yang telah Anda buat. Kelola dan gunakan kembali kapan saja.
                  </p>
                </motion.div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  Total Konten: {contents.length}
                </div>
                <button 
                  onClick={() => navigate('/generator')}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Generate Baru
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((item, i) => {
                  const isVisualEngine = item.type === 'visual_engine';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedContent(item)}
                      className={cn(
                        "group bg-bg-secondary border p-8 rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[320px]",
                        isVisualEngine 
                          ? "border-accent-yellow/25 hover:border-accent-yellow/60" 
                          : "border-border-subtle hover:border-accent-yellow/50"
                      )}
                    >
                      {isVisualEngine && item.generated_image_url && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300" style={{ backgroundImage: `url(${item.generated_image_url})` }} />
                      )}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] group-hover:bg-accent-yellow/10 transition-all pointer-events-none" />
                      
                      <div className="relative z-10 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(item.created_at?.toDate?.() || item.created_at)}
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isVisualEngine ? (
                            <span className="px-2 py-0.5 bg-accent-yellow/15 border border-accent-yellow/25 text-accent-yellow text-[8px] font-black uppercase tracking-wider rounded">
                              CINEMATIC
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-bg-tertiary border border-border-subtle text-text-secondary text-[8px] font-black uppercase tracking-wider rounded">
                              SOCIAL
                            </span>
                          )}
                          <button 
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1 px-1.5 text-text-secondary hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="relative z-10 text-xl font-display font-black uppercase tracking-tight mb-4 line-clamp-2 min-h-[3.5rem] group-hover:text-accent-yellow transition-colors leading-snug">
                        {item.headline || item.topic}
                      </h3>

                      <p className="relative z-10 text-xs text-text-secondary line-clamp-3 font-sans leading-relaxed mb-8 flex-1 opacity-60 italic">
                        "{item.caption || item.image_prompt}"
                      </p>

                      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-border-subtle mt-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {isVisualEngine ? (
                            <>
                              {item.metadata?.genre && (
                                <span className="px-2 py-0.5 bg-bg-tertiary border border-border-subtle rounded-md text-[8px] font-black uppercase text-accent-yellow">
                                  {item.metadata.genre}
                                </span>
                              )}
                              {item.metadata?.style && (
                                <span className="px-2 py-0.5 bg-bg-tertiary border border-border-subtle rounded-md text-[8px] font-black uppercase text-text-secondary">
                                  {item.metadata.style}
                                </span>
                              )}
                            </>
                          ) : (
                            item.hashtags?.slice(0, 2).map((tag: string, idx: number) => (
                              <span key={idx} className="text-[9px] font-black uppercase text-accent-yellow opacity-50">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center group-hover:bg-accent-yellow group-hover:text-bg-primary transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {contents.length === 0 && (
                  <div className="col-span-full py-40 bg-bg-secondary/50 border-2 border-dashed border-border-subtle rounded-[3rem] text-center">
                    <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bookmark className="w-10 h-10 text-text-secondary opacity-30" />
                    </div>
                    <h3 className="text-xl font-display font-black uppercase tracking-widest opacity-40">Belum ada konten</h3>
                    <p className="text-sm text-text-secondary mt-4 max-w-xs mx-auto opacity-40">
                      Konten yang Anda simpan di Social Media Generator akan muncul di sini.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContent(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-secondary border border-border-subtle rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Modal Header */}
                <div className="sticky top-0 z-20 bg-bg-secondary/80 backdrop-blur-md border-b border-border-subtle p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="p-3 bg-bg-tertiary rounded-2xl hover:text-accent-yellow transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-yellow">Detail Konten</h4>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        {formatDate(selectedContent.created_at?.toDate?.() || selectedContent.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => copyAll(selectedContent)}
                      className="flex items-center gap-2 px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      {copied === 'copyall' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'copyall' ? 'TERSALIN' : 'COPY SEMUA'}
                    </button>
                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="p-3 bg-bg-tertiary rounded-2xl hover:text-red-500 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                {selectedContent.type === 'visual_engine' ? (
                  <div className="p-8 md:p-12 space-y-10">
                    {/* Header Details with visual badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#93c5fd] bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                          CINEMATIC VISUAL ENGINE
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-display font-black leading-tight uppercase text-accent-yellow mt-4">
                          {selectedContent.headline || selectedContent.topic}
                        </h3>
                      </div>
                    </div>

                    {/* Metadata specs */}
                    {selectedContent.metadata && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(selectedContent.metadata).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-bg-tertiary/60 border border-border-subtle p-3.5 rounded-2xl flex flex-col justify-between">
                            <span className="text-[8px] font-black uppercase text-text-secondary tracking-widest opacity-60">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-white mt-1 capitalize tracking-wide truncate">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Generated AI Image if we have one */}
                    {selectedContent.generated_image_url ? (
                      <div className="bg-bg-tertiary border border-border-subtle rounded-[2rem] p-6 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-accent-yellow" />
                          Generated Cinematic Image Thumbnail
                        </span>
                        <div className="relative aspect-square max-w-[400px] mx-auto rounded-2xl overflow-hidden border border-border-subtle group/img">
                          <img
                            src={selectedContent.generated_image_url}
                            alt={selectedContent.headline || selectedContent.topic}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <a
                              href={selectedContent.generated_image_url}
                              download={`${(selectedContent.headline || 'cinematic').toLowerCase().replace(/\s+/g, '_')}.png`}
                              className="px-4 py-2.5 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest transition-all inline-flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              DOWNLOAD IMAGE
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-amber-550/5 border border-amber-500/10 text-amber-500 text-xs rounded-2xl flex items-start gap-2 max-w-xl">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Anda belum men-generate gambar untuk prompt ini. Buka tab <strong>Visual Engine</strong> untuk men-render gambar sinematik dari prompt ini menggunakan NVIDIA Stable Diffusion XL.</span>
                      </div>
                    )}

                    {/* Image Prompt Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                          <Camera className="w-4 h-4 text-accent-yellow" />
                          1. Image Prompt (Midjourney / DALL-E)
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedContent.caption || selectedContent.image_prompt, 'img_prompt_modal')}
                          className="p-2 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl text-text-secondary hover:text-white transition-all text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider"
                        >
                          {copied === 'img_prompt_modal' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className={cn("text-[9px] font-black", copied === 'img_prompt_modal' && "text-green-400")}>
                            {copied === 'img_prompt_modal' ? 'TERSALIN' : 'COPY'}
                          </span>
                        </button>
                      </div>
                      <div className="bg-bg-tertiary border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <p className="text-xs sm:text-sm font-sans text-text-secondary leading-relaxed font-semibold italic">
                          "{selectedContent.caption || selectedContent.image_prompt}"
                        </p>
                      </div>
                    </div>

                    {/* Cinema Motion Prompt Section */}
                    {selectedContent.motion_prompt && (
                      <div className="space-y-4 pt-4 border-t border-border-subtle">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                            <Video className="w-4 h-4 text-accent-yellow" />
                            2. Cinema Motion Prompt (Runway / Sora / Luma)
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedContent.motion_prompt, 'mot_prompt_modal')}
                            className="p-2 bg-bg-tertiary hover:bg-bg-primary border border-border-subtle hover:border-accent-yellow/20 rounded-xl text-text-secondary hover:text-white transition-all text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider"
                          >
                            {copied === 'mot_prompt_modal' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className={cn("text-[9px] font-black", copied === 'mot_prompt_modal' && "text-green-400")}>
                              {copied === 'mot_prompt_modal' ? 'TERSALIN' : 'COPY'}
                            </span>
                          </button>
                        </div>
                        <div className="bg-bg-tertiary border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                          <p className="text-xs sm:text-sm font-sans text-text-secondary leading-relaxed font-semibold italic">
                            "{selectedContent.motion_prompt}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Negative Prompt */}
                    {selectedContent.negative_prompt && (
                      <div className="space-y-4 pt-4 border-t border-border-subtle">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#f87171] flex items-center gap-2">
                          <Eye className="w-4 h-4 text-red-500" />
                          Negative Prompt (Intelligent Avoidance List)
                        </span>
                        <div className="bg-bg-tertiary/40 border border-border-subtle rounded-2xl p-4">
                          <p className="text-xs font-mono text-text-secondary opacity-75 whitespace-pre-line leading-relaxed">
                            {selectedContent.negative_prompt}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 md:p-12 space-y-10">
                    {/* Topic Section */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50 block mb-3">Topic</span>
                      <p className="text-lg font-sans font-medium text-white/70 italic">"{selectedContent.topic}"</p>
                    </div>

                    {/* Headline Card */}
                    <div className="bg-bg-tertiary border border-border-subtle p-8 rounded-[2rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-[40px]" />
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                            <Zap className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Headline</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(selectedContent.headline, 'headline')}
                          className="p-3 bg-bg-secondary rounded-xl hover:text-accent-yellow transition-all"
                        >
                          {copied === 'headline' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-display font-black leading-tight uppercase text-white">
                        {selectedContent.headline}
                      </h3>
                    </div>

                    {/* Caption Card */}
                    <div className="bg-bg-tertiary border border-border-subtle p-8 rounded-[2rem]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Caption</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(selectedContent.caption, 'caption')}
                          className="p-3 bg-bg-secondary rounded-xl hover:text-accent-yellow transition-all"
                        >
                          {copied === 'caption' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-text-secondary font-sans text-lg leading-relaxed whitespace-pre-wrap">
                        {selectedContent.caption}
                      </p>
                    </div>

                    {/* Hashtags Card */}
                    <div className="bg-bg-tertiary border border-border-subtle p-8 rounded-[2rem]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                            <Hash className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Hashtags</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(selectedContent.hashtags?.join(' '), 'hashtags')}
                          className="p-3 bg-bg-secondary rounded-xl hover:text-accent-yellow transition-all"
                        >
                          {copied === 'hashtags' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedContent.hashtags?.map((tag: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-xl text-xs font-black text-accent-yellow uppercase tracking-widest">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Image Prompt Card */}
                    {selectedContent.image_prompt && (
                      <div className="bg-bg-tertiary border border-border-subtle p-8 rounded-[2rem]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">AI Image Prompt</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(selectedContent.image_prompt, 'image_prompt')}
                            className="p-3 bg-bg-secondary rounded-xl hover:text-accent-yellow transition-all"
                          >
                            {copied === 'image_prompt' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="p-6 bg-bg-secondary border border-border-subtle rounded-2xl">
                          <p className="text-sm text-text-secondary font-mono leading-relaxed italic">
                            "{selectedContent.image_prompt}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
