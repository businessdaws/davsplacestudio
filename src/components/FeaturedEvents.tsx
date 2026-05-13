import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Video, Wifi } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Content Creator Masterclass 2024',
    date: '25 Juni 2024',
    location: 'Online Workshop',
    type: 'online',
    price: 'Rp 149.000',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&h=400&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Creative Networking Night Jakarta',
    date: '12 Juli 2024',
    location: 'Davsplace Space, Jakarta',
    type: 'offline',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1540575861501-7c0011e74de5?q=80&w=600&h=400&auto=format&fit=crop'
  }
];

export default function FeaturedEvents() {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-bg-primary border border-border-subtle rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl hover:border-accent-yellow transition-all duration-500"
            >
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white font-bold flex items-center gap-2 text-xs">
                    {event.type === 'online' ? <Video className="w-4 h-4 text-accent-yellow" /> : <Wifi className="w-4 h-4 text-accent-yellow" />}
                    {event.type.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold mb-6 group-hover:text-accent-yellow transition-colors leading-tight">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Calendar className="w-5 h-5 text-accent-yellow" />
                      <span className="text-sm font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      <MapPin className="w-5 h-5 text-accent-yellow" />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border-subtle">
                  <span className="text-xl font-display font-black text-white">{event.price}</span>
                  <button className="px-6 py-2.5 bg-accent-yellow text-bg-primary font-black rounded-lg text-xs uppercase tracking-wider hover:bg-accent-yellow-bright transition-all">
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
