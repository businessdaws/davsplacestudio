import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink, PlayCircle, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function FeaturedPortfolio() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      if (autoplay) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`;
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'portfolios'),
          where('is_published', '==', true),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data) setPortfolios(data);
      } catch (err) {
        console.error('Fetch portfolio error:', err);
      }
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
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-bg-tertiary cursor-pointer"
              onClick={() => setSelectedItem(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {item.type === 'video' && hoveredId === item.id ? (
                <div className="w-full h-full pointer-events-none">
                  <iframe 
                    src={getEmbedUrl(item.video_url, true)}
                    className="w-full h-full scale-[1.5]"
                    allow="autoplay"
                  />
                </div>
              ) : (
                <img 
                  src={item.image_url || item.cover_image || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&h=600&auto=format&fit=crop'} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}

              {item.type === 'video' && hoveredId !== item.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-125 transition-transform duration-500">
                    <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="px-3 py-1 bg-accent-yellow text-bg-primary text-[10px] font-accent rounded-lg mb-4 inline-block tracking-widest uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white mb-6 font-display font-medium">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow">
                    {item.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    {item.type === 'video' ? 'Play Video' : 'View Detail'}
                  </div>
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

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-bg-secondary rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-full overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 md:p-3 bg-bg-primary/50 hover:bg-bg-primary text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Media Section */}
              <div className="w-full lg:w-3/5 bg-black flex items-center justify-center min-h-[250px] md:min-h-[400px]">
                {selectedItem.type === 'video' ? (
                  <iframe 
                    src={getEmbedUrl(selectedItem.video_url)}
                    className="w-full h-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                ) : (
                  <img 
                    src={selectedItem.image_url || selectedItem.cover_image || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&h=600&auto=format&fit=crop'} 
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-2/5 p-6 md:p-12 flex flex-col justify-center bg-bg-secondary">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <span className="px-2 md:px-3 py-1 bg-accent-yellow/10 text-accent-yellow text-[8px] md:text-[10px] font-black rounded-lg mb-2 md:mb-4 inline-block tracking-widest uppercase border border-accent-yellow/20">
                      {selectedItem.category}
                    </span>
                    <h3 className="text-2xl md:text-4xl font-display font-black uppercase leading-tight">
                      {selectedItem.title}
                    </h3>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <p className="text-xs md:text-base text-text-secondary leading-relaxed font-sans">
                      {selectedItem.description || 'Tidak ada deskripsi tersedia untuk proyek ini.'}
                    </p>
                    
                    {selectedItem.client_name && (
                      <div className="pt-4 md:pt-6 border-t border-border-subtle">
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">CLIENT</p>
                        <p className="font-display font-bold text-sm md:text-base uppercase">{selectedItem.client_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
