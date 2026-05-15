import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText,
  Briefcase,
  Info,
  Users,
  Search, 
  Moon, 
  Sun,
  User
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
    { id: 'portfolio', path: '/portofolio', icon: Briefcase, label: 'Porto' },
    { id: 'about', path: '/tentang', icon: Info, label: 'About' },
    { id: 'collab', path: '/kolaborasi', icon: Users, label: 'Collab' },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-bg-primary/95 backdrop-blur-md border-t border-border-subtle pb-[env(safe-area-inset-bottom)] px-1">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[60px] py-1 rounded-xl transition-all relative active:scale-95',
              active ? 'text-accent-yellow' : 'text-text-secondary'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            {active && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent-yellow" 
              />
            )}
          </button>
        );
      })}
      
      {/* Search Button */}
      <button
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center gap-1 min-w-[60px] py-1 text-text-secondary active:text-accent-yellow active:scale-95 transition-all"
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-bold tracking-tight">Cari</span>
      </button>
    </nav>
  );
}
