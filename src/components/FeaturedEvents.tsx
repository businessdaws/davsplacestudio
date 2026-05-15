import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, ArrowRight, Video, Wifi, X, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function FeaturedEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data) setEvents(data);
      } catch (err) {
        console.error('Fetch events error:', err);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) return null;

  return (
    <section id="event" className="py-32 px-6 bg-bg-secondary border-y border-border-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Event Mendatang</p>
            <h2 className="text-4xl md:text-5xl font-display font-black leading-tight tracking-tighter">HADIRI & BELAJAR <br /> <span className="text-accent-yellow">BERSAMA KAMI</span></h2>
          </div>
          <button className="px-8 py-3 bg-bg-tertiary border border-border-subtle rounded-xl font-bold flex items-center gap-2 hover:bg-border-subtle transition-all">
            Lihat Kalender Event
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 min-h-[400px]">
          {events.length > 0 ? events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedEvent(event)}
              className="group bg-bg-primary border border-border-subtle rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl hover:border-accent-yellow transition-all duration-500 cursor-pointer"
            >
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-bg-tertiary">
                <img src={event.image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&h=400&auto=format&fit=crop'} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white font-bold flex items-center gap-2 text-xs">
                    {event.type === 'online' ? <Video className="w-4 h-4 text-accent-yellow" /> : <Wifi className="w-4 h-4 text-accent-yellow" />}
                    {event.type.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col justify-between relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <CalendarIcon className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl font-display font-black mb-8 group-hover:text-accent-yellow transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-4 text-text-secondary">
                      <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-yellow">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-text-secondary">
                      <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-yellow">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-8 border-t border-border-subtle group-hover:border-accent-yellow transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Ticket</span>
                    <span className="text-2xl font-display font-black text-white">{event.price}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent-yellow flex items-center justify-center text-bg-primary group-hover:bg-white transition-all group-hover:scale-110 shadow-lg shadow-accent-yellow/10">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-text-secondary italic">
              Belum ada event mendatang yang dijadwalkan.
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-bg-secondary rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-bg-primary/50 hover:bg-bg-primary text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col lg:flex-row h-full overflow-y-auto">
                {/* Media Section */}
                <div className="w-full lg:w-1/2 bg-black aspect-video lg:aspect-auto">
                  <img 
                    src={selectedEvent.image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&h=600&auto=format&fit=crop'} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Section */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 space-y-8 bg-bg-secondary">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-accent-yellow text-bg-primary text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {selectedEvent.type}
                      </span>
                      {selectedEvent.category && (
                        <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-[10px] font-black rounded-lg uppercase tracking-widest border border-border-subtle">
                          {selectedEvent.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-black uppercase leading-tight">
                      {selectedEvent.title}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-2xl border border-border-subtle">
                        <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Waktu</p>
                          <p className="font-bold">{selectedEvent.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-2xl border border-border-subtle">
                        <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Lokasi</p>
                          <p className="font-bold">{selectedEvent.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                      <p className="text-text-secondary leading-relaxed font-sans mb-8">
                        {selectedEvent.description || 'Belum ada deskripsi untuk event ini.'}
                      </p>

                      <div className="flex items-center justify-between gap-6">
                        <div>
                          <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Tiket / Biaya</p>
                          <p className="text-2xl font-display font-black text-white">{selectedEvent.price}</p>
                        </div>
                        <a 
                          href={selectedEvent.link || '#'} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-4 bg-accent-yellow text-bg-primary font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform text-center"
                        >
                          DAFTAR SEKARANG
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
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
