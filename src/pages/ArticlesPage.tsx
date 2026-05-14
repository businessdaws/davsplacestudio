import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CATEGORIES } from '../components/FeaturedArticles';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ClipboardCheck,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ArticlesPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const ARTICLES_PER_PAGE = 4;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const featuredArticle = articles[0] || null;
  const otherArticles = articles.length > 0 ? articles : [];

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    return otherArticles.filter(article => {
      const matchCategory = selectedCategory === 'All' || article.category === selectedCategory;
      return matchCategory;
    });
  }, [otherArticles, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/artikel/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="pt-24 pb-20 lg:pb-0">
        <div className="px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tighter uppercase mb-6 leading-none">
              LATEST <span className="text-accent-yellow">ARTICLES</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl font-sans">
              Wawasan, tutorial, dan berita terbaru dari dunia industri kreatif digital.
            </p>
          </motion.div>

          {/* Featured Article Section */}
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-20"
            >
              <div className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 bg-bg-secondary rounded-[2rem] overflow-hidden border border-border-subtle hover:border-accent-yellow transition-all duration-500">
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-bg-tertiary">
                  <img 
                    src={featuredArticle.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop'} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-5 py-2 bg-accent-yellow text-bg-primary text-xs font-black rounded-xl uppercase tracking-widest">
                      Featured Article
                    </span>
                  </div>
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-6 text-xs text-text-secondary font-bold mb-6 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-yellow" />
                      {new Date(featuredArticle.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent-yellow" />
                      {featuredArticle.author || 'Admin Davs'}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-6 leading-tight group-hover:text-accent-yellow transition-colors">
                    <Link to={`/artikel/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
                  </h2>
                  
                  <p className="text-text-secondary text-lg leading-relaxed mb-8 font-sans">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-border-subtle">
                    <Link to={`/artikel/${featuredArticle.slug}`} className="flex items-center gap-2 text-accent-yellow font-black uppercase text-sm tracking-widest cursor-pointer group/link">
                      Baca Selengkapnya
                      <ArrowRight className="w-5 h-5 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                    <button 
                      onClick={() => handleShare(featuredArticle.slug)}
                      className="p-3 bg-bg-tertiary text-text-secondary rounded-xl hover:bg-accent-yellow hover:text-bg-primary transition-all active:scale-95 flex items-center gap-2"
                    >
                      {copiedId === featuredArticle.slug ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filtering Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-12 border-b border-border-subtle pb-8">
            <span className="text-xs font-black uppercase tracking-widest text-text-secondary mr-4">Filter by:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-bold transition-all border",
                  selectedCategory === cat 
                    ? "bg-accent-yellow text-bg-primary border-accent-yellow" 
                    : "bg-bg-secondary text-text-secondary border-border-subtle hover:border-accent-yellow"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 min-h-[400px]">
            <AnimatePresence mode="wait">
              {paginatedArticles.length > 0 ? paginatedArticles.map((article, i) => (
                <motion.article
                  key={`${article.id}-${selectedCategory}-${currentPage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group bg-bg-secondary border border-border-subtle rounded-3xl overflow-hidden hover:border-accent-yellow transition-all"
                >
                  <Link to={`/artikel/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={article.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop'} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-bg-primary/80 backdrop-blur-md text-accent-yellow text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {article.category || 'Creative'}
                      </span>
                    </div>
                  </Link>

                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-accent-yellow" />
                          {new Date(article.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span className="w-1 h-1 bg-border-subtle rounded-full" />
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-accent-yellow" />
                          {article.author || 'Admin Davs'}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleShare(article.slug);
                        }}
                        className="p-2 transition-colors hover:text-accent-yellow"
                      >
                        {copiedId === article.slug ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <h3 className="text-xl md:text-2xl font-display font-bold mb-4 line-clamp-2 leading-snug group-hover:text-accent-yellow transition-colors">
                      <Link to={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h3>
                    
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-6 opacity-70">
                      {article.excerpt}
                    </p>

                    <Link to={`/artikel/${article.slug}`} className="flex items-center justify-between pt-6 border-t border-border-subtle">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow">Read Article</span>
                      <ArrowRight className="w-4 h-4 text-accent-yellow group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-secondary">
                  <p className="text-xl font-display font-bold uppercase tracking-widest">Belum ada artikel dalam kategori ini.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-24">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 border border-border-subtle rounded-xl text-text-secondary disabled:opacity-30 hover:border-accent-yellow transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                      currentPage === i + 1 
                        ? "bg-accent-yellow text-bg-primary" 
                        : "bg-bg-secondary border border-border-subtle text-text-secondary hover:border-accent-yellow"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 border border-border-subtle rounded-xl text-text-secondary disabled:opacity-30 hover:border-accent-yellow transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 bg-bg-tertiary rounded-[3rem] border border-border-subtle text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-yellow/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
              <p className="text-accent-yellow font-bold uppercase tracking-[0.4em] text-[10px] mb-6">Stay Inspired</p>
              <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-8 tracking-tighter uppercase leading-none">
                INGIN WAWASAN EKSKLUSIF <br className="hidden md:block" />
                <span className="text-accent-yellow italic">DI EMAIL ANDA?</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10 font-sans">
                Berlangganan newsletter kami untuk mendapatkan tips desain, update tren pasar, dan penawaran khusus langsung di inbox Anda.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Alamat email Anda..."
                  className="w-full bg-bg-primary border border-border-subtle rounded-2xl py-4 px-6 outline-none focus:border-accent-yellow transition-all"
                />
                <button className="w-full sm:w-auto px-8 py-4 bg-accent-yellow text-bg-primary font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all">
                  GABUNG
                  <ClipboardCheck className="w-5 h-5" />
                </button>
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
