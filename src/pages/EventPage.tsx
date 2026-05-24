import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  ArrowRight, 
  Video, 
  Wifi, 
  X, 
  ExternalLink, 
  Search, 
  Filter,
  Sparkles,
  Ticket,
  Clock,
  Layers,
  Heart
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CryptoTracker from '../components/CryptoTracker';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import SearchModal from '../components/SearchModal';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  type: 'online' | 'offline';
  category?: string;
  image_url?: string;
  description?: string;
  link?: string;
}

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: "fallback-ev-1",
    title: "AI Studio Masters: Building Agents & Full Stack Applications",
    date: "28 May 2026",
    location: "Online (Google Meet)",
    price: "IDR 150,000",
    type: "online",
    category: "AI & Tech",
    image_url: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=800&auto=format&fit=crop",
    description: "Pelajari cara membangun AI Agent interaktif skala produksi menggunakan Google Gemini API dan React 19. Membedah arsitektur state local d3 / recharts, real-time database, dan UI/UX modern kelas dunia.",
    link: "https://ai.google"
  },
  {
    id: "fallback-ev-2",
    title: "Premium UI/UX Workshop: High Contrast Design & Spatial layouts",
    date: "05 June 2026",
    location: "Davsplace Studio, Jakarta",
    price: "IDR 450,000",
    type: "offline",
    category: "Design",
    image_url: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop",
    description: "Eksklusif bootcamp tatap muka d Davsplace Studio. Fokus pada tipografi tingkat lanjut, whitespace, layout bento grid, serta prinsip-prinsip desain high-contrast yang memikat mata pengguna global.",
    link: "https://davsplace.studio"
  },
  {
    id: "fallback-ev-3",
    title: "Solana & Multi-Asset Defi Integration Summit 2026",
    date: "14 June 2026",
    location: "Davsplace Studio, Bali Hub",
    price: "FREE (RSVP Required)",
    type: "offline",
    category: "Crypto Dev",
    image_url: "https://images.unsplash.com/photo-1516245834210-c4c142787335?q=80&w=800&auto=format&fit=crop",
    description: "Pertemuan komunitas web3 skala besar di Bali. Diskusi panel tentang desentralisasi likuiditas, integrasi real-time APIs CoinGecko, dan implementasi smart contracts dengan performa super kilat.",
    link: "https://coingecko.com"
  },
  {
    id: "fallback-ev-4",
    title: "React 19 & Next-Gen Server Components Deep Dive",
    date: "22 June 2026",
    location: "Online (Discord Live)",
    price: "FREE (RSVP Required)",
    type: "online",
    category: "Web Dev",
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    description: "Bedah tuntas fitur-fitur baru di React 19, support Typescript mutakhir, transisi compiler baru, dan integrasi library animasi high-performance motion/react tanpa flicker.",
    link: "https://react.dev"
  }
];

export default function EventPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  
  // Filtering & searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'events'),
          where('is_published', '==', true),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fbData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as unknown as EventItem[];
        
        if (fbData && fbData.length > 0) {
          setEvents(fbData);
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      } catch (err) {
        console.warn('DB Fetch events error, utilizing beautiful fallback preset:', err);
        setEvents(FALLBACK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = ['all', ...Array.from(new Set(events.map(ev => ev.category || 'Lainnya')))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || (event.category || 'Lainnya') === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-bg-primary text-white">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />

      <main className="pt-24 pb-20 lg:pb-0">
        
        {/* Decorative Grid Mesh Background */}
        <div className="absolute inset-0 top-0 h-[600px] bg-[radial-gradient(#fcd34d_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none select-none z-0" />
        <div className="absolute top-20 right-1/4 w-[350px] h-[350px] bg-accent-yellow/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="px-6 py-12 max-w-7xl mx-auto relative z-10">
          
          {/* Header Block Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 border-b border-border-subtle/30 pb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-accent-yellow text-[9px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3 text-accent-yellow" />
              Aktivitas Eksklusif Davsplace
            </div>
            
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tight uppercase leading-none mb-6">
              HADIRI <span className="text-accent-yellow">EVENTS</span>
            </h1>
            
            <p className="text-sm md:text-base text-text-secondary max-w-2xl font-sans leading-relaxed">
              Bergabunglah bersama ratusan developer, kreator, dan antusias blockchain global di webinar daring maupun workshop tatap muka yang dipandu oleh praktisi handal kami.
            </p>
          </motion.div>

          {/* Fully Interactive Search & Filter Deck */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 bg-bg-secondary p-5 border border-border-subtle rounded-[2.5rem] shadow-xl">
            {/* Search Input Box */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Cari kata kunci event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle focus:border-accent-yellow/40 rounded-2xl pl-11 pr-4 py-3 text-xs outline-none transition text-white font-sans"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex bg-bg-tertiary/60 border border-border-subtle p-1 rounded-2xl md:col-span-3 items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <button
                onClick={() => setSelectedType('all')}
                className={`flex-1 py-2 rounded-xl transition text-center ${selectedType === 'all' ? 'bg-accent-yellow text-bg-primary font-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedType('online')}
                className={`flex-1 py-2 rounded-xl transition text-center ${selectedType === 'online' ? 'bg-accent-yellow text-bg-primary font-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Online
              </button>
              <button
                onClick={() => setSelectedType('offline')}
                className={`flex-1 py-2 rounded-xl transition text-center ${selectedType === 'offline' ? 'bg-accent-yellow text-bg-primary font-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Offline
              </button>
            </div>

            {/* Category selection */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-yellow shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle focus:border-accent-yellow/40 rounded-2xl px-4 py-3 text-xs outline-none text-text-secondary cursor-pointer hover:text-white transition uppercase font-black tracking-widest text-[9px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'KATEGORI: SEMUA' : `KATEGORI: ${cat.toUpperCase()}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main event dynamic cards list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg-secondary border border-border-subtle rounded-3xl h-[280px] p-6 animate-pulse space-y-4">
                  <div className="w-1/3 h-5 bg-neutral-800 rounded" />
                  <div className="w-full h-10 bg-neutral-800 rounded" />
                  <div className="w-2/3 h-6 bg-neutral-800 rounded" />
                  <div className="w-full h-16 bg-neutral-800 rounded pt-4" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-bg-secondary border border-border-subtle rounded-[2.5rem] flex flex-col items-center space-y-4"
            >
              <CalendarIcon className="w-16 h-16 text-text-secondary/40" />
              <h3 className="text-lg font-display font-black uppercase tracking-wider text-white">Event Tidak Ditemukan</h3>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                Kata kunci atau kombinasi kriteria filter yang Anda tentukan belum tersedia untuk saat ini. Mohon ganti kategori atau cari judul lain.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedCategory('all'); }}
                className="px-6 py-2.5 bg-accent-yellow text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
              >
                RESET FILTER
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => setSelectedEvent(event)}
                  className="group bg-bg-secondary border border-border-subtle rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-xl hover:border-accent-yellow/40 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  {/* Thumbnail Cover */}
                  <div className="relative w-full sm:w-2/5 min-h-[220px] bg-bg-tertiary">
                    <img 
                      src={event.image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&h=400&auto=format&fit=crop'} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 text-white font-black flex items-center gap-2 text-[8px] uppercase tracking-wider shadow-md">
                        {event.type === 'online' ? <Video className="w-3.5 h-3.5 text-accent-yellow" /> : <Wifi className="w-3.5 h-3.5 text-accent-yellow" />}
                        {event.type}
                      </div>
                    </div>
                  </div>

                  {/* Informational Panel */}
                  <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-between relative">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[8px] font-black uppercase text-accent-yellow tracking-widest bg-accent-yellow/10 px-2 py-0.5 rounded border border-accent-yellow/20">
                          {event.category || 'Event'}
                        </span>
                        <div className="flex items-center gap-1 text-[8px] font-black text-text-secondary tracking-widest">
                          <Clock className="w-3 h-3 text-accent-yellow" />
                          UPCOMING
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-display font-black text-white group-hover:text-accent-yellow leading-tight uppercase line-clamp-2 transition-colors mb-4">
                        {event.title}
                      </h3>

                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-6">
                        {event.description || 'Hadiri event bergengsi kami untuk memperluas koneksi serta belajar langsung.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border-subtle/35 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] text-text-secondary font-bold uppercase">
                          <CalendarIcon className="w-3 h-3 text-accent-yellow" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-text-secondary font-bold uppercase truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-accent-yellow" />
                          {event.location}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[8px] font-black text-text-secondary uppercase block mb-0.5">HTM</span>
                        <span className="text-sm font-display font-black text-accent-yellow">{event.price}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>

        {/* Realtime CoinGecko Multi-Asset Tracker Section - Di paling bawah (the bottom) */}
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-16 border-t border-border-subtle/30 relative z-10">
          <CryptoTracker variant="detailed" />
        </div>

      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Detail Action Modal Overlay popup */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-bg-secondary rounded-[3rem] overflow-hidden border border-border-subtle shadow-2xl flex flex-col h-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-bg-primary/50 hover:bg-bg-primary text-white rounded-full border border-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="overflow-y-auto">
                <div className="aspect-video relative w-full bg-black">
                  <img 
                    src={selectedEvent.image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop'} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent" />
                </div>

                <div className="p-8 md:p-10 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-accent-yellow text-bg-primary text-[9px] font-black rounded-lg uppercase tracking-widest">
                        {selectedEvent.type}
                      </span>
                      {selectedEvent.category && (
                        <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-[9px] font-black rounded-lg uppercase tracking-widest border border-border-subtle">
                          {selectedEvent.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black uppercase leading-tight text-white">
                      {selectedEvent.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-bg-tertiary/70 border border-border-subtle rounded-2xl">
                      <CalendarIcon className="w-5 h-5 text-accent-yellow shrink-0" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-text-secondary block">Waktu Acara</span>
                        <span className="text-xs font-bold font-mono text-white mt-0.5 block">{selectedEvent.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-bg-tertiary/70 border border-border-subtle rounded-2xl">
                      <MapPin className="w-5 h-5 text-accent-yellow shrink-0" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-text-secondary block">Lokasi</span>
                        <span className="text-xs font-bold text-white mt-0.5 block truncate max-w-[200px]">{selectedEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border-subtle/30">
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">
                      {selectedEvent.description || 'Belum ada deskripsi untuk event eksklusif ini.'}
                    </p>

                    <div className="flex items-center justify-between gap-6 pt-4 border-t border-border-subtle/30">
                      <div>
                        <span className="text-[9px] font-black uppercase text-text-secondary tracking-widest block mb-0.5">Biaya Pendaftaran</span>
                        <span className="text-xl font-display font-black text-accent-yellow">{selectedEvent.price}</span>
                      </div>
                      <a 
                        href={selectedEvent.link || '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center text-xs uppercase"
                      >
                        DAFTAR PESERTA
                        <ExternalLink className="w-4.5 h-4.5" />
                      </a>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
