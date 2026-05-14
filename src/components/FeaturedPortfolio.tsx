import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink, PlayCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FeaturedPortfolio() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('portfolios')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (data) setPortfolios(data);
      setLoading(false);
    };
    fetchPortfolio();
  }, []);

  if (loading) return null;

  return (
    <section id="portofolio" className="py-32 px-6 bg-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Karya Pilihan</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">PORTOFOLIO TERBARU</h2>
          </div>
          <p className="text-text-secondary max-w-sm">
            Kumpulan proyek yang telah kami selesaikan dengan penuh dedikasi dan inovasi untuk klien kami.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 min-h-[400px]">
          {portfolios.length > 0 ? portfolios.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-bg-tertiary"
            >
              <img 
                src={item.image_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&h=600&auto=format&fit=crop'} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="px-3 py-1 bg-accent-yellow text-bg-primary text-[10px] font-accent rounded-lg mb-4 inline-block tracking-widest uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white mb-6 font-display font-medium">
                    {item.title}
                  </h3>
                  
                  <button className="flex items-center gap-2 text-sm font-bold text-accent-yellow">
                    {item.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                    LIHAT DETAIL
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-text-secondary italic">
              Sepertinya belum ada portofolio yang dipublikasikan.
            </div>
          )}
        </div>

        <div className="mt-16 flex justify-center">
          <Link to="/portofolio" className="px-10 py-4 border border-border-subtle rounded-xl font-bold hover:bg-white hover:text-bg-primary transition-all duration-300">
            Lihat Semua Portofolio
          </Link>
        </div>
      </div>
    </section>
  );
}
