import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, saveContentToFirestore } from '../lib/firebase';
import { Zap, Send, Loader2, Sparkles, Copy, Check, Info } from 'lucide-react';
import { generateHook } from '../services/geminiService';
import OutputCard from './OutputCard';

import { useTheme } from '../context/ThemeContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSubscription } from '../hooks/useSubscription';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HookGenerator({ onQuotaExceeded }: { onQuotaExceeded?: (reason?: string) => void }) {
  const [topic, setTopic] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<string[] | null>(null);
  const { theme } = useTheme();
  const { trackUsage, plan } = useSubscription();
  const isPremium = plan === 'pro' || plan === 'vip';
  const [saving, setSaving] = React.useState(false);

  const handleSaveAction = async (title: string, data: any) => {
    if (!isPremium) {
      onQuotaExceeded?.('SAVE');
      return;
    }

    if (!auth.currentUser) {
      alert('Silakan login terlebih dahulu untuk menyimpan konten.');
      return;
    }

    setSaving(true);
    try {
      await saveContentToFirestore(
        auth.currentUser.uid,
        data,
        'hook',
        title,
        { hook: data }
      );
      alert('Konten berhasil disimpan ke riwayat!');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const allowed = await trackUsage();
      if (!allowed) {
        onQuotaExceeded?.('QUOTA');
        return;
      }
      const data = await generateHook(topic);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.status === 429) {
        onQuotaExceeded?.('GEMINI_QUOTA');
      }
      setError(err.message || 'Terjadi kesalahan saat membuat hook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <section className="text-center space-y-4">
        <div className={cn(
          "inline-flex p-4 rounded-2xl mb-2",
          theme === 'dark' ? "bg-yellow-400/10 text-yellow-400" : "bg-yellow-500/10 text-yellow-600"
        )}>
          <Zap className="w-8 h-8" />
        </div>
        <h1 className={cn(
          "text-4xl md:text-5xl font-black tracking-tighter uppercase",
          theme === 'dark' ? "text-white" : "text-slate-900"
        )}>Generator Hook Viral</h1>
        <p className={cn(
          "max-w-xl mx-auto font-medium",
          theme === 'dark' ? "text-white/40" : "text-slate-500"
        )}>Hentikan scroll dengan kalimat pembuka berdampak tinggi yang dirancang untuk memicu rasa ingin tahu.</p>
      </section>

      <form onSubmit={handleGenerate} className={cn(
        "p-8 rounded-2xl border space-y-8 transition-all",
        theme === 'dark' 
          ? "bg-[#0F0F0F] border-white/5 shadow-2xl" 
          : "bg-white border-slate-200/60 shadow-sm"
      )}>
        <div className="space-y-4">
          <label className={cn(
            "text-[10px] uppercase tracking-[0.2em] font-black",
            theme === 'dark' ? "text-white/30" : "text-slate-400"
          )}>Tentang apa konten Anda?</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Tutorial cara memasak steak yang sempurna setiap saat..."
            className={cn(
              "w-full rounded-xl p-6 outline-none transition-all resize-none h-40 text-[15px] font-medium border",
              theme === 'dark' 
                ? "bg-black/40 border-white/5 text-white placeholder:text-white/10 focus:border-yellow-400/50" 
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-yellow-500/50"
            )}
          />
        </div>
        {error && (
          <div className={cn(
            "p-4 rounded-xl text-xs font-bold border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
            theme === 'dark' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"
          )}>
            <Info className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <button
          disabled={loading || !topic}
          className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/5 uppercase tracking-widest"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Buat Hook <Sparkles className="w-4 h-4" /></>}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <div className="space-y-6">
            <h3 className={cn(
              "text-xs font-black uppercase tracking-[0.3em] px-2",
              theme === 'dark' ? "text-white/30" : "text-slate-400"
            )}>Hook Viral Terbaik</h3>
            <div className="grid grid-cols-1 gap-4">
              {result.map((hook, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <OutputCard 
                    title={`Opsi Hook 0${i + 1}`} 
                    content={hook} 
                    metadata="Siap digunakan"
                    isPremium={isPremium}
                    onSave={() => handleSaveAction(`Hook ${i + 1}: ${topic.substring(0, 20)}`, hook)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
