/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Davsplace Studio
 * Principal: Senior Full-stack Engineer & UI/UX Designer
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import ScrollToBottomButton from './components/ScrollToBottomButton';
import { MobileTopbar, MobileBottomNavbar } from './components/MobileNavigation';
import { cn } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy load sections for performance
const HeroSection = lazy(() => import('./components/HeroSection'));
const ClientMarquee = lazy(() => import('./components/ClientMarquee'));
const ServicesSection = lazy(() => import('./components/ServicesSection'));
const FeaturedPortfolio = lazy(() => import('./components/FeaturedPortfolio'));
const FeaturedEvents = lazy(() => import('./components/FeaturedEvents'));
const FeaturedArticles = lazy(() => import('./components/FeaturedArticles'));
const TentangSection = lazy(() => import('./components/TentangSection'));
const CTASection = lazy(() => import('./components/CTASection'));
const CryptoTracker = lazy(() => import('./components/CryptoTracker'));

// Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const CollabPage = lazy(() => import('./pages/CollabPage'));
const SocialMediaGenerator = lazy(() => import('./pages/SocialMediaGenerator'));
const EventPage = lazy(() => import('./pages/EventPage'));
const WatermarkEditor = lazy(() => import('./pages/WatermarkEditor'));

import { SettingsProvider } from './context/SettingsContext';

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-accent-yellow animate-spin" />
    </div>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof (window as any).gtag === 'function') {
      const measurementId = (import.meta as any).env.VITE_GA_MEASUREMENT_ID || 'G-PR4X8QKBGT';
      (window as any).gtag('config', measurementId, {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title || 'Davsplace Studio'
      });
    }
  }, [location]);

  return null;
}

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <Router>
          <AnalyticsTracker />
          <div className="min-h-screen bg-bg-primary selection:bg-accent-yellow/30 selection:text-accent-yellow overflow-x-hidden">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            } />
            
            <Route path="/dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <UserDashboard />
              </Suspense>
            } />

            {/* New Page Routes */}
            <Route path="/tentang" element={
              <Suspense fallback={<PageLoader />}>
                <AboutPage />
              </Suspense>
            } />
            <Route path="/artikel" element={
              <Suspense fallback={<PageLoader />}>
                <ArticlesPage />
              </Suspense>
            } />
            <Route path="/artikel/:slug" element={
              <Suspense fallback={<PageLoader />}>
                <ArticleDetailPage />
              </Suspense>
            } />
            <Route path="/portofolio" element={
              <Suspense fallback={<PageLoader />}>
                <PortfolioPage />
              </Suspense>
            } />
            <Route path="/kolaborasi" element={
              <Suspense fallback={<PageLoader />}>
                <CollabPage />
              </Suspense>
            } />
            <Route path="/generator" element={
              <Suspense fallback={<PageLoader />}>
                <SocialMediaGenerator />
              </Suspense>
            } />
            <Route path="/event" element={
              <Suspense fallback={<PageLoader />}>
                <EventPage />
              </Suspense>
            } />
            <Route path="/watermark" element={
              <Suspense fallback={<PageLoader />}>
                <WatermarkEditor />
              </Suspense>
            } />

            {/* Public Route (Home) */}
            <Route path="/" element={
              <>
                <Navbar onSearchClick={() => setIsSearchOpen(true)} />
                <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />
                
                <main className={cn(
                  "flex-1",
                  "pt-0 lg:pt-0", // Adjusted for fixed headers
                  "pb-20 lg:pb-0" // Bottom navbar space on mobile
                )}>
                  <div className="pt-14 lg:pt-0"> {/* Mobile topbar offset */}
                    <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
                      <HeroSection />
                    </Suspense>

                  <Suspense fallback={<div className="h-32 bg-bg-secondary" />}>
                    <ClientMarquee />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-primary" />}>
                    <ServicesSection />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-primary" />}>
                    <FeaturedPortfolio />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-secondary" />}>
                    <FeaturedEvents />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-secondary" />}>
                    <FeaturedArticles />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-primary" />}>
                    <TentangSection />
                  </Suspense>

                  <Suspense fallback={<div className="py-20 bg-bg-primary" />}>
                    <CTASection />
                  </Suspense>
                </div>
              </main>
              
              <Suspense fallback={<div className="h-10 bg-black animate-pulse" />}>
                <CryptoTracker variant="ticker" />
              </Suspense>

              <Footer />
                <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
                <ScrollToBottomButton />
              </>
            } />
          </Routes>

          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
        </Router>
      </SettingsProvider>
    </ErrorBoundary>
  );
}




