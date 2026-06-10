import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap, Crown, ShieldCheck, Check, MessageSquare, Target, Hash } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStartGuest: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStartGuest, onLogin }: LandingPageProps) {
  const { theme } = useTheme();

  const pricing = [
    {
      name: 'Basic',
      price: 'Gratis',
      desc: 'Cocok untuk pemula',
      features: ['3x Generate Konten / hari', 'Data disimpan di Cloud', 'Support Komunitas'],
      cta: 'Coba Gratis',
      action: onStartGuest,
      popular: false,
      color: 'text-slate-400'
    },
    {
      name: 'Pro',
      price: '49rb',
      desc: 'Untuk Content Creator serius',
      features: ['Generate Konten Unlimited', 'Akses Hook Viral', 'Tren Mingguan', 'Direct Support'],
      cta: 'Upgrade ke Pro',
      action: onLogin,
      popular: true,
      color: 'text-yellow-500'
    },
    {
      name: 'VIP',
      price: '99rb',
      desc: 'Full Suite Studio Engine',
      features: ['Semua Fitur Pro', 'Niche Viral Finder', 'Threads Generator', 'Content Analyzer', 'Custom AI Tone'],
      cta: 'Dapatkan VIP',
      action: onLogin,
      popular: false,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className={cn(
      "min-h-screen font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black",
      theme === 'dark' ? "bg-[#050505] text-white" : "bg-white text-slate-900"
    )}>
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase">DAVSPLACE</span>
        </div>
        <button 
          onClick={onLogin}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            theme === 'dark' ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-black/10"
          )}
        >
          Masuk
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 container mx-auto flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-yellow-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-amber-600/20 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-4xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3" />
            AI Content Studio Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase">
            Ubah Ide Menjadi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600">Konten Viral</span>
          </h1>
          <p className={cn(
            "text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-70",
            theme === 'dark' ? "text-white/60" : "text-slate-600"
          )}>
            Asisten AI cerdas untuk creator media sosial. Generate konten, cari niche, dan analisis tren dalam satu dashboard yang elegan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={onLogin}
              className="group relative h-16 px-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.2)]"
            >
              Mulai Sekarang Gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onStartGuest}
              className={cn(
                "h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border",
                theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              Coba Sebagai Guest
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Pilih Rencana Anda</h2>
          <p className={cn("text-lg font-medium opacity-60", theme === 'dark' ? "text-white/60" : "text-slate-500")}>Investasi kecil untuk pertumbuhan konten yang besar.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricing.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-10 rounded-[32px] border flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-500",
                plan.popular 
                  ? (theme === 'dark' ? "bg-white/[0.03] border-yellow-400/30 ring-1 ring-yellow-400/20" : "bg-white border-yellow-200 shadow-2xl shadow-yellow-500/10")
                  : (theme === 'dark' ? "bg-white/[0.01] border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-200/20")
              )}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase rounded-full">POPULER</div>
              )}

              <div className="mb-10">
                <h3 className={cn("text-xl font-black uppercase tracking-tight mb-2", plan.color)}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  {plan.price !== 'Gratis' && <span className="text-xs font-bold opacity-40 uppercase tracking-widest">/bulan</span>}
                </div>
                <p className={cn("text-xs font-bold opacity-40 mt-2 uppercase tracking-widest")}>{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-medium opacity-80">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={plan.action}
                className={cn(
                  "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                  plan.popular 
                    ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                    : (theme === 'dark' ? "bg-white/5 text-white hover:bg-white/10 border border-white/5" : "bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100")
                )}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <span className="font-black tracking-tighter text-xl uppercase">DAVSPLACE</span>
        </div>
        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.4em]">© 2026 DAVSPLACE STUDIO. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
