/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Davsplace Studio
 * Principal: Senior Full-stack Engineer & UI/UX Designer
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import { MobileTopbar, MobileBottomNavbar } from './components/MobileNavigation';
import { cn } from './lib/utils';

// Lazy load sections for performance
const HeroSection = lazy(() => import('./components/HeroSection'));
const ClientMarquee = lazy(() => import('./components/ClientMarquee'));
const ServicesSection = lazy(() => import('./components/ServicesSection'));
const FeaturedPortfolio = lazy(() => import('./components/FeaturedPortfolio'));
const FeaturedEvents = lazy(() => import('./components/FeaturedEvents'));
const FeaturedArticles = lazy(() => import('./components/FeaturedArticles'));
const TentangSection = lazy(() => import('./components/TentangSection'));
const CTASection = lazy(() => import('./components/CTASection'));

// Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const CollabPage = lazy(() => import('./pages/CollabPage'));
const SocialMediaGenerator = lazy(() => import('./pages/SocialMediaGenerator'));

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-bg-primary selection:bg-accent-yellow/30 selection:text-accent-yellow overflow-x-hidden">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <AdminLogin />
            </Suspense>
          } />
          <Route path="/admin/dashboard" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <AdminDashboard />
            </Suspense>
          } />

          {/* New Page Routes */}
          <Route path="/tentang" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <AboutPage />
            </Suspense>
          } />
          <Route path="/artikel" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <ArticlesPage />
            </Suspense>
          } />
          <Route path="/artikel/:slug" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <ArticleDetailPage />
            </Suspense>
          } />
          <Route path="/portofolio" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <PortfolioPage />
            </Suspense>
          } />
          <Route path="/kolaborasi" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <CollabPage />
            </Suspense>
          } />
          <Route path="/generator" element={
            <Suspense fallback={<div className="h-screen bg-bg-primary" />}>
              <SocialMediaGenerator />
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

              <Footer />
              <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
            </>
          } />
        </Routes>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </Router>
  );
}




