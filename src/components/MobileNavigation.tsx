import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText,
  Briefcase,
  Info,
  Users,
  Sparkles,
  Search, 
  Moon, 
  Sun,
  User,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../stores/useAppStore';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function MobileTopbar({ onSearchClick }: { onSearchClick: () => void }) {
  const { theme, toggleTheme } = useAppStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Mobile login error:', err);
    }
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
      {/* Logo */}
      <div className="flex flex-col">
        <div className="text-accent-yellow font-black text-base tracking-wider leading-none">DAVSPLACE</div>
        <div className="text-text-secondary text-[9px] tracking-widest uppercase mt-0.5 font-bold">Studio</div>
      </div>
      
      {/* Right side: avatar/theme */}
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-1 text-text-secondary active:text-accent-yellow active:scale-90 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {user ? (
          <div className="w-8 h-8 rounded-lg bg-accent-yellow flex items-center justify-center text-bg-primary font-black text-xs">
            {user.email?.[0].toUpperCase()}
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-secondary active:border-accent-yellow"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function MobileBottomNavbar({ onSearchClick }: { onSearchClick: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'articles', path: '/artikel', icon: FileText, label: 'Artikel' },
    { id: 'ai', path: '/generator', icon: Sparkles, label: 'AI' },
    { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Saved' },
    { id: 'portfolio', path: '/portofolio', icon: Briefcase, label: 'Porto' },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    navigate(item.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-bg-primary/95 backdrop-blur-md border-t border-border-subtle pb-[env(safe-area-inset-bottom)] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[54px] py-1 rounded-xl transition-all relative active:scale-90',
              active ? 'text-accent-yellow' : 'text-text-secondary hover:text-white'
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              active ? "bg-accent-yellow/10" : ""
            )}>
              <item.icon className={cn("w-5 h-5", active ? "stroke-[2.5]" : "stroke-2")} />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tighter",
              active ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      {/* Search Button */}
      <button
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center gap-1 min-w-[54px] py-1 text-text-secondary active:text-accent-yellow active:scale-90 transition-all"
      >
        <div className="p-1.5">
          <Search className="w-5 h-5 stroke-2" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Cari</span>
      </button>
    </nav>
  );
}
