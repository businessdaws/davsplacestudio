import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import { useState } from 'react';
import SearchModal from '../components/SearchModal';
import { ArrowRight, Users, Zap, Briefcase, Calendar } from 'lucide-react';

export default function CollabPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const collabTypes = [
    {
      title: 'Kolaborasi Event',
      desc: 'Partnering untuk penyelenggaraan event kreatif, workshop, atau seminar digital.',
      icon: Calendar
    },
    {
      title: 'Kampanye Brand',
      desc: 'Membangun kampanye digital yang futuristik dan berdampak luas untuk brand Anda.',
      icon: Zap
    },
    {
      title: 'Kolaborasi Produk',
      desc: 'Pengembangan produk digital bersama (Joint venture) atau integrasi layanan.',
      icon: Users
    },
    {
      title: 'Company Profile',
      desc: 'Pembuatan profil perusahaan eksklusif dengan standar desain kelas dunia.',
      icon: Briefcase
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="pt-24 pb-20 lg:pb-0">
        <div className="px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tighter uppercase mb-6 leading-none">
              WORK <span className="text-accent-yellow italic">TOGETHER</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl font-sans">
              Kami membuka pintu seluas-luasnya untuk berbagai bentuk kerjasama strategis.
            </p>
          </motion.div>

          {/* Collab Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {collabTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-bg-secondary border border-border-subtle rounded-3xl hover:border-accent-yellow transition-all group"
              >
                <div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center mb-6">
                  <type.icon className="w-6 h-6 text-accent-yellow" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 uppercase">{type.title}</h3>
                <p className="text-text-secondary font-sans leading-relaxed mb-6">{type.desc}</p>
                <button className="flex items-center gap-2 text-accent-yellow font-bold group-hover:gap-4 transition-all">
                  Tanya Kerjasama <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Form Placeholder or Direct Link */}
          <div className="bg-bg-tertiary border border-border-subtle rounded-3xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-4">PUNYA IDE LAIN?</h2>
            <p className="text-text-secondary mb-8 font-sans">Sampaikan visi Anda, kami akan bantu mewujudkannya.</p>
            <a 
              href="https://wa.me/6282215805567" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-accent-yellow text-bg-primary font-black rounded-2xl hover:scale-105 transition-transform"
            >
              HUBUNGI TIM KREATIF
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
