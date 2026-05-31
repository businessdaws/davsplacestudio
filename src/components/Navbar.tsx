import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Moon, Sun, ChevronRight, User, LogOut, Sparkles, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../stores/useAppStore';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { cn } from '../lib/utils';

const navLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Artikel', href: '/artikel' },
  { name: 'Event', href: '/event' },
  { name: 'Portofolio', href: '/portofolio' },
  { name: 'Watermark', href: '/watermark' },
  { name: 'Kolaborasi', href: '/kolaborasi' },
  { name: 'Tentang', href: '/tentang' },
];

export default function Navbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { isMenuOpen, setMenuOpen, theme, toggleTheme } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav
      className={cn(
        "hidden lg:block fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent-yellow rounded-md flex items-center justify-center font-display font-black text-bg-primary text-xl group-hover:scale-110 transition-transform">
            D
          </div>
          <span className="font-display font-bold text-xl tracking-tighter sm:block hidden">
            Davsplace<span className="text-accent-yellow">.Studio</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-xs font-medium transition-colors relative group font-medium uppercase tracking-tight",
                isActive(link.href) ? "text-accent-yellow" : "text-text-secondary hover:text-accent-yellow"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-accent-yellow transition-all",
                isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onSearchClick}
            className="p-2 text-text-secondary hover:text-accent-yellow transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-accent-yellow transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            {user ? (
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-3 bg-bg-secondary border border-border-subtle rounded-full hover:border-accent-yellow transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-tight text-text-secondary">
                  {user.displayName?.split(' ')[0]}
                </span>
                <img 
                  src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
                  className="w-7 h-7 rounded-full bg-accent-yellow/20"
                  alt="Avatar"
                />
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-accent-yellow text-bg-primary text-[10px] font-black uppercase rounded-lg hover:scale-105 transition-transform"
              >
                <User className="w-4 h-4" />
                Masuk
              </button>
            )}

            <AnimatePresence>
              {showUserMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-48 bg-bg-secondary border border-border-subtle rounded-xl shadow-xl p-2 z-[60]"
                >
                  <Link 
                    to="/dashboard?tab=generator" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-accent-yellow" />
                    AI Generator
                  </Link>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 p-3 text-xs font-bold text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-accent-yellow" />
                    Saved Content
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border-t border-border-subtle mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2 text-text-primary"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-bg-secondary border-b border-border-subtle p-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-2xl font-display font-bold flex items-center justify-between group",
                  isActive(link.href) ? "text-accent-yellow" : "text-text-primary"
                )}
              >
                {link.name}
                <ChevronRight className="w-6 h-6 text-accent-yellow group-hover:translate-x-2 transition-transform" />
              </Link>
            ))}
            <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-text-secondary">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
