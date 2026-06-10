import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedPortfolio from '../components/FeaturedPortfolio';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import { useState } from 'react';
import SearchModal from '../components/SearchModal';
import CTASection from '../components/CTASection';

export default function PortfolioPage() {
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
              OUR <span className="text-accent-yellow italic">PORTFOLIO</span>
            </h1>
            <p className="text-base sm:text-xl text-text-secondary max-w-2xl font-sans">
              Eksplorasi karya-karya digital kami yang menggabungkan teknologi dan seni.
            </p>
          </motion.div>
        </div>

        <FeaturedPortfolio />
        
        <div className="mt-12 sm:mt-20">
          <CTASection />
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
