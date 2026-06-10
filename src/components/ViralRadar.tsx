import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Zap, 
  Lock, 
  ArrowRight, 
  BarChart3, 
  Flame, 
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface ViralRadarProps {
  userPlan: string;
  onNavigateToGen: (topic: string) => void;
}

const hotTopics = [
  { id: 1, topic: "AI Video Transformation", growth: "+450%", category: "TECH", description: "Penggunaan AI untuk mengubah video amatir menjadi sinematik." },
  { id: 2, topic: "Sustainable Fashion Tech", growth: "+210%", category: "LIFESTYLE", description: "Inovasi tekstil ramah lingkungan yang dipadukan dengan wearable tech." },
  { id: 3, topic: "Digital Detox Escapes", growth: "+180%", category: "WELLNESS", description: "Tren liburan tanpa gadget yang mulai populer di kalangan Gen Z." },
  { id: 4, topic: "Micro-SaaS Solopreneur", growth: "+120%", category: "BUSINESS", description: "Membangun aplikasi kecil spesifik dengan target pasar niche." },
  { id: 5, topic: "Psychology-Based Marketing", growth: "+95%", category: "MARKETING", description: "Teknik penjualan yang fokus pada perilaku bawah sadar konsumen." },
];

const viralHooks = [
  { id: 1, text: "Berhenti melakukan [X] jika kamu ingin [Y] di tahun 2024...", type: "CONTROVERSIAL" },
  { id: 2, text: "Saya mencoba [Strategi] selama 30 hari, dan hasilnya mengejutkan...", type: "STORYTELLING" },
  { id: 3, text: "3 Alat AI gratis yang terasa ilegal untuk diketahui...", type: "VALUE-DRIVEN" },
  { id: 4, text: "Rahasia besar di balik kesuksesan [Brand] yang tidak mereka beritahu...", type: "CURIOSITY" },
  { id: 5, text: "Kenapa 90% orang gagal saat mencoba [X], dan cara mengatasinya...", type: "EDUCATIONAL" },
];

export default function ViralRadar({ userPlan, onNavigateToGen }: ViralRadarProps) {
  const { theme } = useTheme();
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const isLocked = userPlan === 'basic';

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-8",
            theme === 'dark' ? "bg-white/5 text-yellow-500" : "bg-slate-100 text-yellow-600"
          )}
        >
          <Lock className="w-10 h-10" />
        </motion.div>
        <h2 className={cn("text-3xl font-black mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>Fitur Premium Terdeteksi</h2>
        <p className={cn("text-lg mb-8 max-w-md opacity-50", theme === 'dark' ? "text-white" : "text-slate-600")}>
          Viral Radar menggunakan algoritma real-time untuk memantau tren yang sedang meledak. Fitur ini hanya tersedia untuk member 
          <span className="text-yellow-500 font-bold"> PRO</span> atau <span className="text-purple-500 font-bold">VIP</span>.
        </p>
        <button 
          className="px-8 py-4 bg-yellow-400 text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-transform"
          onClick={() => {/* Mock upgrade trigger */}}
        >
          Dapatkan Akses Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" />
          Live Trend Monitor
        </div>
        <h1 className={cn("text-4xl md:text-5xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
          Viral <span className="text-yellow-400">Radar</span>
        </h1>
        <p className={cn("max-w-xl mx-auto opacity-50", theme === 'dark' ? "text-white" : "text-slate-600")}>
          Amati pergerakan pasar secara real-time dan curi perhatian audiens dengan topik yang sedang hangat.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Column 1: Hot Topics */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className={cn("text-sm font-black uppercase tracking-[0.2em]", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
              Topik Hangat (24 Jam Terakhir)
            </h2>
            <BarChart3 className="w-4 h-4 opacity-30" />
          </div>

          <div className="space-y-4">
            {hotTopics.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-6 rounded-[28px] border group transition-all",
                  theme === 'dark' ? "bg-[#0A0A0A] border-white/5 hover:border-emerald-500/30" : "bg-white border-slate-200/60 shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 tracking-widest">{item.category}</span>
                    <h3 className={cn("text-xl font-bold mt-1", theme === 'dark' ? "text-white" : "text-slate-900")}>{item.topic}</h3>
                  </div>
                  <div className="text-emerald-400 font-black text-sm flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {item.growth}
                    <TrendingUp className="w-3 h-3" />
                  </div>
                </div>
                <p className={cn("text-sm mb-6 opacity-50 leading-relaxed", theme === 'dark' ? "text-white" : "text-slate-600")}>{item.description}</p>
                <button 
                  onClick={() => onNavigateToGen(item.topic)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:gap-3 transition-all"
                >
                  Gunakan Tren Ini
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Column 2: Viral Hooks */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className={cn("text-sm font-black uppercase tracking-[0.2em]", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
              Inspirasi Hook Viral
            </h2>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>

          <div className="space-y-4">
            {viralHooks.map((hook, idx) => (
              <motion.div
                key={hook.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-6 rounded-[28px] border transition-all relative overflow-hidden",
                  theme === 'dark' ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200/60 shadow-sm"
                )}
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className={cn(
                    "text-[8px] font-black px-2 py-1 rounded border",
                    hook.type === 'CONTROVERSIAL' ? "text-orange-500 border-orange-500/20 bg-orange-500/5" : "text-blue-500 border-blue-500/20 bg-blue-500/5"
                  )}>
                    {hook.type}
                  </span>
                </div>
                <div className="flex items-start gap-4 pr-12">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className={cn("text-[15px] font-medium leading-relaxed italic", theme === 'dark' ? "text-white" : "text-slate-700")}>
                    "{hook.text}"
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleCopy(hook.text, hook.id)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 transition-colors"
                  >
                    {copiedId === hook.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copiedId === hook.id ? 'Tersalin' : 'Salin Hook'}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Smart Tip */}
            <div className={cn(
              "p-8 rounded-[32px] border border-dashed flex items-center gap-6",
              theme === 'dark' ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50 border-purple-200"
            )}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Sparkles className="text-black w-6 h-6" />
              </div>
              <div>
                <h4 className={cn("text-xs font-black uppercase tracking-widest mb-1", theme === 'dark' ? "text-purple-400" : "text-purple-600")}>Smart Tip</h4>
                <p className={cn("text-[13px] font-medium leading-relaxed opacity-60", theme === 'dark' ? "text-white" : "text-slate-600")}>
                  Gunakan hook bertipe "Controversial" untuk konten pagi hari guna memicu perdebatan di kolom komentar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
