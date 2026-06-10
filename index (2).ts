import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CryptoTracker from '../components/CryptoTracker';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Share2, 
  Check, 
  Clock,
  ChevronRight
} from 'lucide-react';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'articles'),
          where('slug', '==', slug),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setArticle({ 
            id: doc.id, 
            ...doc.data(),
            created_at: (doc.data() as any).created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Fetch article error:', err);
      }
      setLoading(false);
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-display font-black mb-6">ARTIKEL TIDAK DITEMUKAN</h1>
        <Link to="/artikel" className="flex items-center gap-2 text-accent-yellow font-bold uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Artikel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />

      <main className="pt-20 sm:pt-28 md:pt-32 pb-24 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 xs:px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-secondary mb-6 sm:mb-12 overflow-hidden whitespace-nowrap">
            <Link to="/" className="hover:text-accent-yellow transition-colors shrink-0">Home</Link>
            <ChevronRight className="w-2.5 h-2.5 shrink-0" />
            <Link to="/artikel" className="hover:text-accent-yellow transition-colors shrink-0">Artikel</Link>
            <ChevronRight className="w-2.5 h-2.5 shrink-0" />
            <span className="text-accent-yellow truncate">{article.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8 sm:mb-12">
              <span className="px-3 py-1 bg-bg-tertiary text-accent-yellow text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-4 sm:mb-6 inline-block border border-border-subtle">
                {article.category || 'Creative'}
              </span>
              <h1 className="text-2xl xs:text-3xl sm:text-4.5xl md:text-6xl font-display font-extrabold leading-tight tracking-tighter uppercase mb-6 sm:mb-8">
                {article.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] sm:text-xs text-text-secondary font-bold uppercase tracking-widest pt-6 sm:pt-8 border-t border-border-subtle">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span>{article.author || 'Admin Davs'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-yellow" />
                    <span>{new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-yellow" />
                    <span>5 Min Read</span>
                  </div>
                </div>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-subtle rounded-xl hover:border-accent-yellow transition-all active:scale-95 w-max"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/10] sm:aspect-[21/9] rounded-2xl sm:rounded-[2rem] overflow-hidden mb-10 sm:mb-16 border border-border-subtle bg-bg-tertiary">
              <img 
                src={article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop'} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-8 lg:gap-12">
              <div className="prose prose-invert prose-sm sm:prose-base md:prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-sans prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black prose-li:font-sans prose-li:text-text-secondary">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {article.content}
                </ReactMarkdown>
              </div>

              {/* Sticky Sidebar (Desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-32 space-y-8">
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary rotate-90 origin-left translate-x-4 mb-12">Social Connect</p>
                    <button className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center hover:border-accent-yellow text-text-secondary hover:text-accent-yellow transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-16 sm:mt-24 p-6 sm:p-12 bg-bg-tertiary border border-border-subtle rounded-2xl sm:rounded-[3rem] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[100px]" />
              <h2 className="text-xl sm:text-3xl md:text-5xl font-display font-black mb-4 sm:mb-6 uppercase tracking-tighter">SUKA ARTIKEL <span className="text-accent-yellow italic">INI?</span></h2>
              <p className="text-text-secondary text-sm sm:text-base mb-8 sm:mb-10 max-w-xl mx-auto font-sans leading-relaxed">
                Kami membuat konten berkualitas seperti ini setiap minggu. Bergabunglah dengan 2,000+ subscriber lainnya untuk mendapatkan update eksklusif.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Link 
                  to="/artikel" 
                  className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-5 bg-white text-bg-primary text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 hover:bg-accent-yellow transition-all"
                >
                  BACA LAGI
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Realtime CoinGecko Multi-Asset Tracker Section */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-16 border-t border-border-subtle/30">
          <CryptoTracker variant="detailed" />
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
