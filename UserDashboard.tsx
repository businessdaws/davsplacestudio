import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TentangSection from '../components/TentangSection';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import { useState } from 'react';
import SearchModal from '../components/SearchModal';

export default function AboutPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="pt-20 sm:pt-24 pb-24 lg:pb-0">
        <div className="px-4 xs:px-6 py-6 sm:py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-tighter uppercase mb-4 sm:mb-6 leading-none">
              KNOW <span className="text-accent-yellow">ABOUT US</span>
            </h1>
            <p className="text-base sm:text-xl text-text-secondary max-w-2xl font-sans">
              Kami adalah tim kreatif yang berfokus pada inovasi digital dan estetika futuristik.
            </p>
          </motion.div>
        </div>

        <TentangSection />
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
