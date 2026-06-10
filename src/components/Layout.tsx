import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PenTool, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Hash, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  History,
  Sparkles,
  Zap,
  Sun,
  Moon,
  LogIn,
  Key,
  User as UserIcon,
  Crown,
  Home
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, logout, signInWithGoogle } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import UpgradeModal from './UpgradeModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

const ADMIN_UID = 'XZootTsQ4CMBvhIM5PDrVkNyz112';

export default function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { plan, remaining } = useSubscription();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Gen Konten', icon: PenTool },
    { id: 'hooks', label: 'Hook Viral', icon: Zap },
    { id: 'analyzer', label: 'Analiser', icon: BarChart3 },
    { id: 'trends', label: 'Tren', icon: TrendingUp },
    { id: 'niche', label: 'Niche Viral', icon: Target },
    { id: 'threads', label: 'Threads', icon: Hash },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'upgrade', label: 'Upgrade', icon: Crown },
  ];

  const isAdmin = user?.uid === ADMIN_UID;
  if (isAdmin && !menuItems.find(i => i.id === 'admin-keys')) {
    menuItems.push({ id: 'admin-keys', label: 'Admin Keys', icon: Key });
  }

  const planStyle = {
    guest: "text-slate-400 bg-slate-400/10",
    basic: "text-blue-400 bg-blue-400/10",
    pro: "text-yellow-500 bg-yellow-500/10",
    vip: "text-purple-500 bg-purple-500/10"
  };

    const handleSignOut = async () => {
      if (user) {
        await auth.signOut();
      }
      if (onLogout) {
        onLogout();
      }
      navigate('/');
    };

    return (
      <div className={cn(
      "min-h-screen font-sans selection:bg-yellow-500/30 transition-colors duration-300",
      theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#F8F9FA] text-slate-900"
    )}>
      {/* Mobile Header */}
      <div className={cn(
        "lg:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-50 backdrop-blur-xl",
        theme === 'dark' 
          ? "border-b border-white/5 bg-[#050505]/60" 
          : "border-b border-slate-200/40 bg-white/60 shadow-sm shadow-slate-200/5"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase">DAVSPLACE</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
             onClick={() => setIsUpgradeOpen(true)}
             className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 mr-1"
          >
            <Crown className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
              theme === 'dark' ? "text-yellow-400 active:bg-white/5" : "text-slate-500 active:bg-slate-100"
            )}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
              theme === 'dark' ? "text-yellow-500 active:bg-white/5" : "text-yellow-600 active:bg-slate-100"
            )}
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-[280px] sm:w-72 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 overflow-y-auto",
        theme === 'dark' ? "bg-[#0A0A0A] border-r border-white/5" : "bg-white border-r border-slate-200/60",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tighter text-xl leading-none uppercase">DAVSPLACE</span>
                <span className={cn(
                  "text-[9px] uppercase tracking-[0.3em] font-bold mt-1",
                  theme === 'dark' ? "text-yellow-400/60" : "text-yellow-600"
                )}>Studio Engine</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className={cn(
                "lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                theme === 'dark' ? "bg-white/5 text-white/50" : "bg-slate-50 text-slate-400"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'upgrade') {
                      setIsUpgradeOpen(true);
                    } else {
                      setActiveTab(item.id);
                    }
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group text-sm font-bold relative overflow-hidden",
                    isActive 
                      ? (theme === 'dark' ? "bg-white/5 text-white border border-white/5" : "bg-yellow-50/50 text-slate-900 border border-yellow-500/20") 
                      : (theme === 'dark' ? "text-white/30 hover:text-yellow-400 hover:bg-yellow-400/5 px-2" : "text-slate-500 hover:text-yellow-600 hover:bg-slate-50 px-2")
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0",
                    isActive 
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 scale-105" 
                      : (theme === 'dark' ? "bg-white/5 text-white/20 group-hover:text-yellow-400 group-hover:bg-yellow-400/10" : "bg-slate-100 text-slate-400 group-hover:text-yellow-600 group-hover:bg-yellow-500/10")
                  )}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeBall" className="ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={cn(
            "mt-auto pt-6 border-t font-sans space-y-4",
            theme === 'dark' ? "border-white/5" : "border-slate-100"
          )}>
            {/* Quota & Plan Card */}
            <div className={cn(
              "p-4 rounded-2xl border space-y-3",
              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Plan</span>
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", planStyle[plan])}>{plan}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Usage</span>
                  <span className="text-[10px] font-black text-yellow-500">{remaining === Infinity ? 'Unlimited' : `${remaining} Left`}</span>
                </div>
                {remaining !== Infinity && (
                  <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-1000" 
                      style={{ width: `${(remaining / 3) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              {plan !== 'vip' && (
                <button 
                  onClick={() => setIsUpgradeOpen(true)}
                  className="w-full h-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade
                </button>
              )}
            </div>

            {user ? (
               <div className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50/50 border-slate-200/40"
              )}>
                <div className="relative shrink-0">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="User" className={cn(
                    "w-9 h-9 rounded-lg border-2 p-0.5",
                    theme === 'dark' ? "border-yellow-400/20" : "border-yellow-500/10"
                  )} />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className={cn("text-xs font-black truncate uppercase tracking-tight", theme === 'dark' ? "text-white/90" : "text-slate-900")}>{user.displayName}</span>
                  <span className={cn("text-[8px] font-bold truncate uppercase tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400 focus-visible:not-sr-only")}>{user.email}</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-3">
                 <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Mode Guest</p>
                 <p className="text-[8px] font-medium opacity-40 uppercase">Login untuk simpan riwayat</p>
              </div>
            )}
            
            <button 
              onClick={user ? handleSignOut : signInWithGoogle}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold border border-transparent",
                user 
                  ? (theme === 'dark' ? "text-white/20 hover:text-red-400 hover:bg-red-400/5" : "text-slate-400 hover:text-red-500 hover:bg-red-50")
                  : (theme === 'dark' ? "text-white/20 hover:text-yellow-400 hover:bg-yellow-400/5" : "text-slate-400 hover:text-yellow-600 hover:bg-yellow-50")
              )}
            >
              <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0", theme === 'dark' ? "bg-white/5" : "bg-slate-100")}>
                {user ? <LogOut className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              </div>
              {user ? 'Keluar' : 'Masuk dengan Google'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <header className={cn(
          "hidden lg:flex h-16 items-center justify-end px-10 border-b sticky top-0 z-40 backdrop-blur-xl",
          theme === 'dark' ? "border-white/5 bg-[#050505]/50" : "border-slate-200/60 bg-white/50"
        )}>
           <div className="flex items-center gap-4">
              {plan !== 'vip' && (
                <button 
                  onClick={() => setIsUpgradeOpen(true)}
                  className="flex items-center gap-2 px-4 h-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/10"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Ke Pro
                </button>
              )}
              
              <div className={cn(
                "flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-lg border",
                theme === 'dark' ? "text-white/20 bg-white/5 border-white/5" : "text-slate-400 bg-slate-50 border-slate-200"
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Plan: {plan}
              </div>
              
              <button 
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-lg border transition-all hover:scale-105 active:scale-95",
                  theme === 'dark' ? "bg-white/5 border-white/5 text-yellow-400" : "bg-white border-slate-200 text-slate-500 shadow-sm"
                )}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
           </div>
        </header>
        <div className="max-w-6xl mx-auto p-6 lg:p-12">
          {children}
        </div>
      </main>

      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </div>
  );
}
