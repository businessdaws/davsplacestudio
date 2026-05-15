import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function ClientMarquee() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const q = query(
          collection(db, 'client_logos'),
          where('is_active', '==', true),
          orderBy('sort_order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data && data.length > 0) {
          setClients(data);
        } else {
          // Fallback if empty
          setClients([
            { company_name: 'VIVO', logo_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&h=80&auto=format&fit=crop' },
            { company_name: 'SAMSUNG', logo_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&h=80&auto=format&fit=crop' },
            { company_name: 'REALME', logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=200&h=80&auto=format&fit=crop' },
          ]);
        }
      } catch (err) {
        console.error('Fetch logos error:', err);
      }
    };
    fetchLogos();
  }, []);

  return (
    <section className="bg-bg-secondary border-y border-border-subtle py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.3em]">Dipercaya oleh Brand & Partner Strategis</p>
        <div className="h-px flex-1 bg-border-subtle hidden md:block mx-8" />
      </div>

      <div className="relative flex overflow-hidden group">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          className="flex gap-20 items-center whitespace-nowrap min-w-full"
        >
          {/* Double up for seamless marquee */}
          {[...clients, ...clients, ...clients, ...clients].map((client, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
            >
              <div className="w-12 h-12 bg-bg-tertiary rounded-lg p-2 flex items-center justify-center">
                <img src={client.logo_url} alt={client.company_name} className="max-w-full max-h-full object-contain filter brightness-200 contrast-125" />
              </div>
              <span className="font-display font-black text-xl tracking-tighter text-white uppercase">{client.company_name}</span>
            </div>
          ))}
        </motion.div>

        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-bg-secondary to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-bg-secondary to-transparent z-10" />
      </div>
    </section>
  );
}
