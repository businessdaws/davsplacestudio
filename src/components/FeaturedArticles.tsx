import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 min-h-[400px]">
          {articles.length > 0 ? articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Link to={`/artikel/${article.slug}`}>
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden mb-6 bg-bg-tertiary">
                  <img 
                    src={article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&h=400&auto=format&fit=crop'} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-accent-yellow text-bg-primary text-xs font-black rounded-lg uppercase tracking-wider">
                      {article.category || 'Creative'}
                    </span>
                  </div>
                </div>

                <div className="px-2">
                  <div className="flex items-center gap-4 text-xs text-text-secondary font-bold mb-4 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-yellow" />
                      {new Date(article.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-accent-yellow" />
                      {article.author || 'Admin Davs'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-accent-yellow transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-6 opacity-70">
                    {article.excerpt}
                  </p>

                  <div className="pt-6 border-t border-border-subtle flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-xs font-black text-accent-yellow uppercase tracking-widest">Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 text-accent-yellow" />
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
