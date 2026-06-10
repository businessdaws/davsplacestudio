import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, saveContentToFirestore } from '../lib/firebase';
import { 
  FileSearch, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  Send,
  Sparkles,
  ListChecks,
  Lightbulb,
  Info
} from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult } from '../types';
import OutputCard from './OutputCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useTheme } from '../context/ThemeContext';

import { useSubscription } from '../hooks/useSubscription';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ContentAnalyzer({ onQuotaExceeded }: { onQuotaExceeded?: (reason?: string) => void }) {
  const [content, setContent] = React.useState('');
  const [contentType, setContentType] = React.useState<'text' | 'link' | 'image' | 'doc'>('text');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const { theme } = useTheme();
  const { trackUsage, plan } = useSubscription();
  const isPremium = plan === 'pro' || plan === 'vip';
  const [saving, setSaving] = React.useState(false);

  const handleSaveAction = async (title: string, data: any, type: string) => {
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
        typeof data === 'string' ? data : JSON.stringify(data),
        type,
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const allowed = await trackUsage();
      if (!allowed) {
        onQuotaExceeded?.('QUOTA');
        return;
      }
      const data = await analyzeContent(content, contentType);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.status === 429) {
        onQuotaExceeded?.('GEMINI_QUOTA');
      }
      setError(err.message || 'Terjadi kesalahan saat menganalisis konten.');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'text', label: 'Teks/Ide', icon: FileText },
    { id: 'link', label: 'URL/Tautan', icon: LinkIcon },
    { id: 'image', label: 'Deskripsi Gambar', icon: ImageIcon },
    { id: 'doc', label: 'Ringkasan Dok', icon: FileSearch },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <section className="text-center space-y-4">
        <div className={cn(
          "inline-flex p-4 rounded-2xl mb-2",
          theme === 'dark' ? "bg-yellow-400/10 text-yellow-400" : "bg-yellow-500/10 text-yellow-600"
        )}>
          <FileSearch className="w-8 h-8" />
        </div>
        <h1 className={cn(
          "text-4xl md:text-5xl font-black tracking-tighter uppercase",
          theme === 'dark' ? "text-white" : "text-slate-900"
        )}>Analisis Konten</h1>
        <p className={cn(
          "max-w-xl mx-auto font-medium",
          theme === 'dark' ? "text-white/40" : "text-slate-500"
        )}>Bedah konten atau tautan apa pun dan ekstrak pola media sosial yang viral.</p>
      </section>

      <div className={cn(
        "p-8 rounded-2xl border space-y-8 transition-all",
        theme === 'dark' 
          ? "bg-[#0F0F0F] border-white/5 shadow-2xl" 
          : "bg-white border-slate-200/60 shadow-sm"
      )}>
        <div className="flex flex-wrap gap-2">
          {types.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setContentType(t.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all border uppercase tracking-tighter",
                  contentType === t.id 
                    ? "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/10" 
                    : (theme === 'dark' ? "bg-white/5 text-white/40 border-white/5 hover:border-white/10" : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300")
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleAnalyze} className="space-y-8">
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={contentType === 'link' ? "Tempel URL di sini..." : "Tempel konten atau deskripsi di sini..."}
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
            disabled={loading || !content}
            className="w-full h-14 bg-yellow-400 text-black rounded-lg font-black flex items-center justify-center gap-3 hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-yellow-500/5 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Analisis Konten <Send className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <OutputCard 
              title="Ringkasan Analisis" 
              metadata="Gambaran Umum"
              content={result.summary} 
              isPremium={isPremium}
              onSave={() => handleSaveAction(`Summary Analysis`, result.summary, 'analysis')}
              icon={<Sparkles className="w-5 h-5 text-yellow-500" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <OutputCard 
                title="Poin Utama" 
                metadata="Poin Strategis"
                content={result.keyPoints} 
                type="list"
                isPremium={isPremium}
                onSave={() => handleSaveAction(`Key Points Analysis`, result.keyPoints, 'analysis')}
                icon={<ListChecks className="w-5 h-5 text-yellow-500" />}
              />
              <OutputCard 
                title="Sudut Pandang Sosial" 
                metadata="Ide Penggunaan Kembali"
                content={result.socialAngles} 
                type="list"
                isPremium={isPremium}
                onSave={() => handleSaveAction(`Social Angles Analysis`, result.socialAngles, 'analysis')}
                icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
