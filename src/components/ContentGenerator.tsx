import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  PenTool, 
  Hash, 
  Type as TypeIcon, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Info,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { generateSocialMediaContent } from '../services/geminiService';
import { ContentGenerationResult } from '../types';
import OutputCard from './OutputCard';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, saveContentToFirestore } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSubscription } from '../hooks/useSubscription';

import { useTheme } from '../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ContentGenerator({ 
  initialTopic = '', 
  onQuotaExceeded 
}: { 
  initialTopic?: string; 
  onQuotaExceeded?: (reason?: string) => void 
}) {
  const [topic, setTopic] = React.useState(initialTopic);
  const [platform, setPlatform] = React.useState('Instagram');
  const [tone, setTone] = React.useState('Santai');
  const [goal, setGoal] = React.useState('Engagement');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ContentGenerationResult | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { theme } = useTheme();
  const { trackUsage, plan } = useSubscription();
  const isPremium = plan === 'pro' || plan === 'vip';

  React.useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

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

      const data = await generateSocialMediaContent(topic, platform, tone, goal);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.status === 429) {
        onQuotaExceeded?.('GEMINI_QUOTA');
      }
      setError(err.message || 'Terjadi kesalahan saat membuat konten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAction = async (title: string, data: any, contentType: string) => {
    if (!isPremium) {
      onQuotaExceeded?.();
      return;
    }

    if (!auth.currentUser) {
      alert('Silakan login terlebih dahulu untuk menyimpan konten.');
      return;
    }

    setSaving(true);
    try {
      const contentText = typeof data === 'string' ? data : JSON.stringify(data);
      await saveContentToFirestore(
        auth.currentUser.uid,
        contentText,
        contentType,
        title,
        data
      );
      alert('Konten berhasil disimpan ke riwayat!');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const platforms = ['Instagram', 'LinkedIn', 'YouTube', 'Threads', 'Twitter', 'TikTok'];
  const tones = ['Santai', 'Profesional', 'Humoris', 'Edukatif'];
  const goals = ['Engagement', 'Penjualan', 'Edukasi', 'Viral/Share'];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <section className="text-center space-y-4">
        <div className={cn(
          "inline-flex p-4 rounded-2xl mb-2",
          theme === 'dark' ? "bg-yellow-400/10 text-yellow-400" : "bg-yellow-500/10 text-yellow-600"
        )}>
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className={cn(
          "text-4xl md:text-5xl font-black tracking-tighter uppercase",
          theme === 'dark' ? "text-white" : "text-slate-900"
        )}>Social Media Engine</h1>
        <p className={cn(
          "max-w-xl mx-auto font-medium",
          theme === 'dark' ? "text-white/40" : "text-slate-500"
        )}>Ubah ide sederhana menjadi postingan media sosial profesional dalam hitungan detik.</p>
      </section>

      <form onSubmit={handleGenerate} className={cn(
        "p-8 rounded-2xl border space-y-8 transition-all",
        theme === 'dark' 
          ? "bg-[#0F0F0F] border-white/5 shadow-2xl" 
          : "bg-white border-slate-200/60 shadow-sm"
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-black",
              theme === 'dark' ? "text-white/30" : "text-slate-400"
            )}>Apa topik atau pesan utamanya?</label>
            <span className={cn("text-[9px] px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 font-black border border-yellow-400/10 transition-opacity uppercase tracking-tighter", topic ? "opacity-100" : "opacity-0")}>Ready to Generate</span>
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Peluncuran lini fashion berkelanjutan baru menggunakan plastik laut daur ulang..."
            className={cn(
              "w-full rounded-xl p-6 outline-none transition-all resize-none h-40 text-[15px] font-medium border leading-relaxed",
              theme === 'dark' 
                ? "bg-black/40 border-white/5 text-white placeholder:text-white/10 focus:border-yellow-400/50" 
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-yellow-500/50"
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className={cn(
               "text-[10px] uppercase tracking-[0.2em] font-black",
               theme === 'dark' ? "text-white/30" : "text-slate-400"
            )}>Tone Bahasa</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[11px] font-black transition-all border uppercase tracking-tighter",
                    tone === t 
                      ? "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/10" 
                      : (theme === 'dark' ? "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white" : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600")
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className={cn(
               "text-[10px] uppercase tracking-[0.2em] font-black",
               theme === 'dark' ? "text-white/30" : "text-slate-400"
            )}>Tujuan Konten</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[11px] font-black transition-all border uppercase tracking-tighter text-center",
                    goal === g 
                      ? "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/10" 
                      : (theme === 'dark' ? "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white" : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600")
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <label className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-black",
              theme === 'dark' ? "text-white/30" : "text-slate-400"
            )}>Platform Target</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-black transition-all border uppercase tracking-tighter",
                    platform === p 
                      ? "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/10" 
                      : (theme === 'dark' ? "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white" : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600")
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end gap-4">
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
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-yellow-500/10 uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Buat Postingan
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <OutputCard 
              title="Paket Konten Media Sosial" 
              metadata={platform}
              data={result}
              type="package"
              isPremium={isPremium}
              onSave={() => handleSaveAction(`${platform}: ${topic.substring(0, 30)}...`, result, 'post')}
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
