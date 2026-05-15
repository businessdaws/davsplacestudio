import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary mb-12">
            <Link to="/" className="hover:text-accent-yellow transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/artikel" className="hover:text-accent-yellow transition-colors">Artikel</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-accent-yellow truncate">{article.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-12">
              <span className="px-4 py-1.5 bg-bg-tertiary text-accent-yellow text-[10px] font-black rounded-lg uppercase tracking-[0.2em] mb-6 inline-block border border-border-subtle">
                {article.category || 'Creative'}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold leading-none tracking-tighter uppercase mb-8">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary font-bold uppercase tracking-widest pt-8 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <User className="w-4 h-4" />
                  </div>
                  <span>{article.author || 'Admin Davs'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-yellow" />
                  <span>{new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-yellow" />
                  <span>5 Min Read</span>
                </div>
                <button 
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-subtle rounded-xl hover:border-accent-yellow transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  <span className="text-[10px] uppercase font-black tracking-widest">{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 border border-border-subtle bg-bg-tertiary">
              <img 
                src={article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop'} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-12">
              <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-sans prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black">
                <ReactMarkdown>
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
            <div className="mt-24 p-12 bg-bg-tertiary border border-border-subtle rounded-[3rem] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[100px]" />
              <h2 className="text-3xl md:text-5xl font-display font-black mb-6 uppercase tracking-tighter">SUKA ARTIKEL <span className="text-accent-yellow italic">INI?</span></h2>
              <p className="text-text-secondary mb-10 max-w-xl mx-auto font-sans leading-relaxed">
                Kami membuat konten berkualitas seperti ini setiap minggu. Bergabunglah dengan 2,000+ subscriber lainnya untuk mendapatkan update eksklusif.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Link 
                  to="/artikel" 
                  className="w-full sm:w-auto px-10 py-5 bg-white text-bg-primary font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-accent-yellow transition-all"
                >
                  BACA LAGI
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
