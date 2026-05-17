import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { cn, formatDate } from '../lib/utils';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const navigate = useNavigate();

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-yellow/10 text-accent-yellow text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-6 border border-accent-yellow/20">
                <LayoutDashboard className="w-3 h-3" />
                Member Area
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                SAVED <span className="text-accent-yellow italic">CONTENT</span>
              </h1>
              <p className="text-text-secondary mt-4 font-sans max-w-lg">
                Kumpulan konten sosial media yang telah Anda buat. Kelola dan gunakan kembali kapan saja.
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black uppercase text-accent-yellow tracking-widest">{user?.displayName}</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-4 bg-bg-secondary border border-border-subtle text-red-500 rounded-2xl hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
            {contents.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedContent(item)}
                className="group bg-bg-secondary border border-border-subtle p-8 rounded-[2.5rem] hover:border-accent-yellow/50 transition-all cursor-pointer relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-[50px] group-hover:bg-accent-yellow/10 transition-all" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(item.created_at?.toDate?.() || item.created_at)}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-display font-black uppercase tracking-tight mb-4 line-clamp-2 min-h-[3.5rem] group-hover:text-accent-yellow transition-colors">
                  {item.headline}
                </h3>

                <p className="text-xs text-text-secondary line-clamp-3 font-sans leading-relaxed mb-8 flex-1 opacity-60">
                  {item.caption}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-border-subtle mt-auto">
                  <div className="flex gap-1.5">
                    {item.hashtags?.slice(0, 2).map((tag: string, idx: number) => (
                      <span key={idx} className="text-[9px] font-black uppercase text-accent-yellow opacity-50">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center group-hover:bg-accent-yellow group-hover:text-bg-primary transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}

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
                </div>
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
