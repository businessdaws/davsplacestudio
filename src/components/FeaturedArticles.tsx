import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatDate } from '../lib/utils';

// Keeping CATEGORIES as export for ArticlesPage
export const CATEGORIES = ['All', 'Desain', 'Video', 'Branding', 'Marketing', 'Tech', 'Creative'];

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, 'articles'),
          where('is_published', '==', true),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data) setArticles(data);
      } catch (err) {
        console.error('Fetch articles error:', err);
      }
    };
    fetchArticles();
  }, []);

  return (
    <section id="artikel" className="py-32 px-6 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Wawasan & Inspirasi</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">ARTIKEL TERBARU</h2>
          </div>
          <Link to="/artikel" className="hidden md:flex items-center gap-2 font-bold text-accent-yellow group">
            Lihat Semua Artikel
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-16 min-h-[400px]">
          {articles.length > 0 ? articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col h-full"
            >
              <Link to={`/artikel/${article.slug}`} className="flex flex-col h-full">
                <div className="relative aspect-[16/10] max-h-56 rounded-[1.5rem] overflow-hidden mb-6 bg-bg-tertiary shadow-xl border border-border-subtle group-hover:border-accent-yellow transition-all duration-500">
                  <img 
                    src={article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&h=400&auto=format&fit=crop'} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-accent-yellow text-bg-primary text-[9px] font-black rounded-lg uppercase tracking-widest shadow-md">
                      {article.category || 'Insight'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-1">
                  <div className="flex items-center gap-4 text-[9px] text-text-secondary font-black mb-4 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-yellow" />
                      {formatDate(article.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-accent-yellow" />
                      {article.author || 'Admin'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-display font-black mb-4 group-hover:text-accent-yellow transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                    {article.title}
                  </h3>
                  
                  <p className="text-text-secondary text-xs md:text-sm leading-relaxed line-clamp-2 mb-6 font-sans font-medium">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between group-hover:border-accent-yellow transition-colors">
                    <span className="text-[9px] font-black text-accent-yellow uppercase tracking-[0.3em]">READ ARTICLE</span>
                    <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center group-hover:bg-accent-yellow group-hover:text-bg-primary transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          )) : (
            <div className="col-span-full py-20 text-center text-text-secondary italic">
              Sepertinya belum ada artikel yang dipublish.
            </div>
          )}
        </div>

        <Link to="/artikel" className="w-full md:hidden py-4 bg-bg-tertiary text-text-primary border border-border-subtle font-bold rounded-xl flex items-center justify-center">
          Lihat Semua Artikel
        </Link>
      </div>
    </section>
  );
}
