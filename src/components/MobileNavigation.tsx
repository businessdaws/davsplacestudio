import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  Briefcase, 
  Search, 
  Menu, 
  X, 
  Moon, 
  Sun,
  LayoutDashboard,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../stores/useAppStore';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function MobileTopbar({ onSearchClick }: { onSearchClick: () => void }) {
  const { theme, toggleTheme } = useAppStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
      {/* Logo */}
      <div className="flex flex-col">
        <div className="text-accent-yellow font-black text-base tracking-wider leading-none">DAVSPLACE</div>
        <div className="text-text-secondary text-[9px] tracking-widest uppercase mt-0.5 font-bold">Studio</div>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={onSearchClick}
          className="p-2 text-text-secondary active:text-accent-yellow active:scale-90 transition-all"
        >
          <Search className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 text-text-secondary active:text-accent-yellow active:scale-90 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {user ? (
          <div className="w-8 h-8 rounded-lg bg-accent-yellow flex items-center justify-center text-bg-primary font-black text-xs ml-1">
            {user.email?.[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-secondary ml-1">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileBottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'articles', path: '#artikel', icon: FileText, label: 'Artikel' },
    { id: 'events', path: '#event', icon: Calendar, label: 'Event' },
    { id: 'portfolio', path: '#portofolio', icon: Briefcase, label: 'Porto' },
    { id: 'admin', path: '/admin/login', icon: LayoutDashboard, label: 'Admin' },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    if (item.path.startsWith('#')) {
      if (currentPath !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          document.getElementById(item.path.substring(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(item.path.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' && !location.hash;
    if (path.startsWith('#')) return location.hash === path;
    return currentPath.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-bg-primary/90 backdrop-blur-md border-t border-border-subtle pb-[env(safe-area-inset-bottom)] px-2">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all relative active:scale-95',
              active ? 'text-accent-yellow' : 'text-text-secondary active:text-text-primary'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            {active && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent-yellow" 
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
