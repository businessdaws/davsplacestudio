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
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../stores/useAppStore';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function MobileTopbar({ onSearchClick }: { onSearchClick: () => void }) {
  const { theme, toggleTheme } = useAppStore();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await auth.signOut();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 h-14 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
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
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg bg-accent-yellow flex items-center justify-center text-bg-primary font-black text-xs overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.email?.[0].toUpperCase()
              )}
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMenu(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-bg-secondary border border-border-subtle rounded-2xl shadow-xl p-2"
                  >
                    <div className="px-3 py-2 border-b border-border-subtle mb-1">
                      <p className="text-[10px] font-black uppercase text-accent-yellow truncate">{user.displayName || 'User'}</p>
                      <p className="text-[8px] font-bold text-text-secondary truncate">{user.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => { navigate('/generator'); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 text-[10px] font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-colors uppercase tracking-wider"
                    >
                      <Sparkles className="w-4 h-4 text-accent-yellow" />
                      AI Generator
                    </button>

                    <button 
                      onClick={() => { navigate('/dashboard'); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 text-[10px] font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-colors uppercase tracking-wider"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent-yellow" />
                      Saved Content
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border-t border-border-subtle mt-1 uppercase tracking-wider"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
    { id: 'collab', path: '/kolaborasi', icon: Users, label: 'Collab' },
    { id: 'about', path: '/tentang', icon: Info, label: 'About' },
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
