import { motion } from 'motion/react';
import { Calendar, ArrowRight, User } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: '5 Trend Desain Grafis yang Akan Mendominasi di 2024',
    excerpt: 'Dunia desain terus berkembang dengan cepat. Pelajari bagaimana AI dan minimalisme mengubah cara kita berkreasi...',
    category: 'Desain',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&h=400&auto=format&fit=crop',
    date: '12 Mei 2024',
    author: 'Admin Davs'
  },
  {
    id: 2,
    title: 'Cara Meningkatkan Engagement Video YouTube Anda',
    excerpt: 'Engagement bukan hanya soal angka view. Fokuslah pada storytelling dan visual hook yang menarik audiens...',
    category: 'Video',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&h=400&auto=format&fit=crop',
    date: '10 Mei 2024',
    author: 'Admin Davs'
  },
  {
    id: 3,
    title: 'Pentingnya Konsistensi Visual Brand untuk Pertumbuhan Bisnis',
    excerpt: 'Brand yang kuat adalah brand yang konsisten. Temukan rahasia membangun identitas visual yang melekat di hati customer...',
    category: 'Branding',
    image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=600&h=400&auto=format&fit=crop',
    date: '8 Mei 2024',
    author: 'Admin Davs'
  }
];

export default function FeaturedArticles() {
  return (
    <section id="artikel" className="py-32 px-6 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Wawasan & Inspirasi</p>
            <h2 className="text-4xl md:text-5xl font-display font-black">ARTIKEL TERBARU</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 font-bold text-accent-yellow group">
            Lihat Semua Artikel
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden mb-6 bg-bg-tertiary">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-accent-yellow text-bg-primary text-xs font-black rounded-lg uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center gap-4 text-xs text-text-secondary font-bold mb-4 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent-yellow" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent-yellow" />
                    {article.author}
                  </span>
                </div>
                
                <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-accent-yellow transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>

                <div className="pt-6 border-t border-border-subtle flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="text-xs font-black text-accent-yellow">BUTUH JASA DESAIN? MULAI DI SINI</span>
                  <ArrowRight className="w-4 h-4 text-accent-yellow" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <button className="w-full md:hidden py-4 bg-bg-tertiary text-text-primary border border-border-subtle font-bold rounded-xl">
          Lihat Semua Artikel
        </button>
      </div>
    </section>
  );
}
