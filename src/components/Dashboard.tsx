import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  TrendingUp, 
  Zap, 
  BarChart2, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  Target,
  Hash,
  Crown,
  ShoppingBag
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { getWeeklyTrends } from '../services/geminiService';
import { Trend } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard({ onNavigate, onUseTrend }: { onNavigate: (tab: string) => void, onUseTrend: (topic: string) => void }) {
  const [user] = useAuthState(auth);
  const [trends, setTrends] = React.useState<Trend[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  React.useEffect(() => {
    async function loadTrends() {
      // 1. Check Cache
      const cached = localStorage.getItem('davs_trends_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 2 hours
        if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
          setTrends(data);
          setLoading(false);
          return;
        }
      }

      try {
        const data = await getWeeklyTrends();
        setTrends(data);
        // Save to cache
        localStorage.setItem('davs_trends_cache', JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        setError(null);
      } catch (err: any) {
        console.error(err);
        
        // If we have any cached data (even expired), use it as fallback
        if (cached) {
          const { data } = JSON.parse(cached);
          setTrends(data);
          setError(null);
        } else {
          // Absolute Fallback Data if everything fails
          const fallbackTrends = [
            { topic: "AI Automation 2024", reason: "Lonjakan minat pada efisiensi kerja menggunakan alat kecerdasan buatan.", category: "TECH" },
            { topic: "Minimalist Lifestyle", reason: "Tren gaya hidup sederhana dan sustainable terus menguat di kalangan milenial.", category: "LIFESTYLE" },
            { topic: "Content Creator Economy", reason: "Pertumbuhan platform monetisasi baru untuk kreator konten independen.", category: "BUSINESS" },
          ];
          setTrends(fallbackTrends as Trend[]);
          setError(`Menggunakan tren arsip: ${err.message || 'Batas kuota tercapai'}`);
        }
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, []);

  const stats = [
    { label: 'Konten Tersimpan', value: '12', icon: Clock },
    { label: 'Analisis Selesai', value: '4', icon: BarChart2 },
    { label: 'Tren Aktif', value: '8', icon: Zap },
  ];

  const quickTools = [
    { 
      id: 'generator', 
      label: 'Gen Konten Biasa', 
      desc: 'Buat postingan viral di berbagai platform media sosial.', 
      icon: Sparkles, 
      color: 'from-amber-400 to-orange-500', 
      textColor: 'text-amber-400',
      badge: null
    },
    { 
      id: 'hooks', 
      label: 'Hook Generator', 
      desc: 'Ciptakan kalimat pembuka yang bikin orang berhenti scrolling.', 
      icon: Zap, 
      color: 'from-blue-500 to-indigo-600', 
      textColor: 'text-blue-400',
      badge: null
    },
    { 
      id: 'trends', 
      label: 'Viral Radar', 
      desc: 'Monitor tren real-time & curi ide hook yang sedang meledak.', 
      icon: TrendingUp, 
      color: 'from-blue-500 to-indigo-600', 
      textColor: 'text-blue-400',
      badge: 'PRO'
    },
    { 
      id: 'niche', 
      label: 'Niche Viral', 
      desc: 'Optimasi konten E-commerce & Retail dengan psikologi penjualan.', 
      icon: ShoppingBag, 
      color: 'from-purple-500 to-pink-600', 
      textColor: 'text-purple-400',
      badge: 'VIP'
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight",
            theme === 'dark' ? "text-white" : "text-slate-900"
          )}>
            Halo, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500">
              {user?.displayName?.split(' ')[0]}
            </span>
          </h1>
          <p className={cn(
            "text-xs md:text-sm font-black tracking-[0.3em] uppercase opacity-70",
            theme === 'dark' ? "text-white/30" : "text-slate-400"
          )}>Studio Intelligence Is Ready</p>
        </div>
        <div className="grid grid-cols-3 md:flex gap-4 md:gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-white/5">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col md:items-end gap-1">
              <span className={cn(
                "text-xl md:text-2xl font-black tracking-tighter",
                theme === 'dark' ? "text-white/90" : "text-slate-950"
              )}>{stat.value}</span>
              <span className={cn(
                "text-[8px] md:text-[9px] uppercase tracking-widest font-black leading-none",
                theme === 'dark' ? "text-white/20" : "text-slate-400"
              )}>{stat.label.split(' ')[0]} <br className="hidden md:block" /> {stat.label.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Tools Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h2 className={cn("text-xs font-black uppercase tracking-[0.3em] opacity-40", theme === 'dark' ? "text-white" : "text-slate-900")}>Quick Actions</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(tool.id)}
                className={cn(
                  "relative group p-8 rounded-[32px] overflow-hidden text-left transition-all border flex flex-col h-full",
                  theme === 'dark' 
                    ? "bg-[#0A0A0A] border-white/5 shadow-2xl" 
                    : "bg-white border-slate-200 shadow-sm hover:shadow-xl"
                )}
              >
                {/* Background Glow */}
                <div className={cn("absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br", tool.color)} />
                
                {/* Premium Badge */}
                {tool.badge && (
                  <div className={cn(
                    "absolute top-6 right-6 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border flex items-center gap-1.5",
                    tool.badge === 'VIP' 
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  )}>
                    <Crown className="w-2.5 h-2.5" />
                    {tool.badge}
                  </div>
                )}

                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br shadow-2xl transition-transform duration-500 group-hover:rotate-6",
                  tool.color
                )}>
                  <Icon className="w-8 h-8 text-black" />
                </div>
                
                <h3 className={cn("text-xl font-black mb-3 tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{tool.label}</h3>
                <p className={cn("text-[13px] leading-relaxed font-medium opacity-50 mb-8 flex-1", theme === 'dark' ? "text-white" : "text-slate-600")}>
                  {tool.desc}
                </p>

                <div className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all",
                  theme === 'dark' ? "text-white/20 group-hover:text-yellow-400" : "text-slate-400 group-hover:text-yellow-600"
                )}>
                  Mulai Sekarang
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Weekly Trends Slider */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-xl",
              theme === 'dark' ? "bg-yellow-400/10" : "bg-yellow-500/5 border border-yellow-500/10"
            )}>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className={cn("text-2xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>Tren Konten Mingguan</h2>
          </div>
          <div className="flex items-center gap-2">
             <span className={cn(
               "text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border font-bold",
               theme === 'dark' ? "text-white/30 bg-white/5 border-white/5" : "text-slate-400 bg-slate-50 border-slate-200"
             )}>Auto-Update</span>
          </div>
        </div>

        <div className="relative group">
          <motion.div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide cursor-grab active:cursor-grabbing px-2 pt-2"
            drag="x"
            dragConstraints={{ right: 0, left: -1000 }}
          >
            {loading ? (
               [...Array(5)].map((_, i) => (
                <div key={i} className={cn(
                  "min-w-[300px] h-[340px] rounded-2xl animate-pulse",
                  theme === 'dark' ? "bg-white/5" : "bg-slate-200"
                )} />
              ))
            ) : error ? (
              <div className={cn(
                "w-full p-12 rounded-2xl border text-center flex flex-col items-center gap-4",
                theme === 'dark' ? "bg-[#0F0F0F] border-white/5" : "bg-slate-50 border-slate-200"
              )}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h4 className={cn("text-sm font-black uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>Waduh, Tren Macet!</h4>
                  <p className={cn("text-xs font-medium max-w-xs", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{error}</p>
                </div>
                <button 
                  onClick={() => { setLoading(true); window.location.reload(); }}
                  className="px-6 py-2 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              trends.map((trend, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    y: -6,
                    scale: 1.01,
                    boxShadow: theme === 'dark' 
                      ? "0 30px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(250,204,21,0.1)" 
                      : "0 30px 60px -15px rgba(0,0,0,0.06), 0 0 0 1px rgba(234,179,8,0.2)"
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: i * 0.1 
                  }}
                  className={cn(
                    "min-w-[300px] md:min-w-[340px] p-8 rounded-2xl border flex flex-col transition-colors",
                    theme === 'dark' 
                      ? "bg-[#0F0F0F] border-white/5 shadow-2xl" 
                      : "bg-white border-slate-200 shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className={cn(
                      "text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-[0.15em] border",
                      theme === 'dark' 
                        ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-500/20"
                    )}>
                      {trend.category}
                    </span>
                    <BarChart2 className={cn(
                      "w-4 h-4",
                      theme === 'dark' ? "text-white/10" : "text-slate-300"
                    )} />
                  </div>
                  <h4 className={cn("text-xl font-black mb-4 leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{trend.topic}</h4>
                  <p className={cn("text-sm font-medium leading-relaxed mb-8 flex-1", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{trend.reason}</p>
                  
                  <button 
                    onClick={() => onUseTrend(trend.topic)}
                    className={cn(
                      "w-full py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group/btn",
                      theme === 'dark' 
                        ? "bg-white/[0.03] hover:bg-yellow-400 text-white/40 hover:text-black" 
                        : "bg-slate-50 hover:bg-yellow-500 text-slate-400 hover:text-white"
                    )}
                  >
                    Gunakan Tren Ini
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
