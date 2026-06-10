import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, saveContentToFirestore } from '../lib/firebase';
import { 
  ShoppingBag, 
  Video, 
  Tag, 
  Zap, 
  Loader2, 
  Sparkles, 
  Clipboard, 
  Check, 
  Info,
  Lock,
  ArrowRight,
  Target
} from 'lucide-react';
import { generateEcommerceContent } from '../services/geminiService';
import OutputCard from './OutputCard';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import { cn } from '../lib/utils';

type Category = 'script' | 'copy' | 'hook';

export default function ViralNiche({ onQuotaExceeded }: { onQuotaExceeded?: (reason?: string) => void }) {
  const [topic, setTopic] = React.useState('');
  const [category, setCategory] = React.useState<Category>('script');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { theme } = useTheme();
  const { trackUsage, plan } = useSubscription();

  const isVIP = plan === 'vip';
  const isPremium = plan === 'pro' || plan === 'vip';

  const handleSaveAction = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await saveContentToFirestore(
        auth.currentUser.uid,
        JSON.stringify(result),
        'NICHE',
        `E-comm: ${topic.substring(0, 20)}`,
        result
      );
      alert('Berhasil disimpan!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVIP) {
      onQuotaExceeded?.('UPGRADE');
      return;
    }
    if (!topic) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const allowed = await trackUsage();
      if (!allowed) {
        onQuotaExceeded?.('QUOTA');
        return;
      }

      const data = await generateEcommerceContent(topic, category);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.status === 429) {
        onQuotaExceeded?.('GEMINI_QUOTA');
      }
      setError(err.message || 'Gagal generate konten.');
    } finally {
      setLoading(false);
    }
  };

  if (!isVIP && !loading && !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "w-24 h-24 rounded-[32px] flex items-center justify-center mb-8",
            theme === 'dark' ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"
          )}
        >
          <Lock className="w-10 h-10" />
        </motion.div>
        <h2 className={cn("text-3xl font-black mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>Fitur Eksklusif VIP</h2>
        <p className={cn("text-lg mb-8 max-w-md opacity-50", theme === 'dark' ? "text-white" : "text-slate-600")}>
          Niche Viral (E-commerce Engine) menggunakan AI psikologi penjualan untuk mendongkrak konversi. Fitur ini HANYA untuk member 
          <span className="text-purple-500 font-bold underline ml-1">VIP</span>.
        </p>
        <button 
          className="px-10 py-4 bg-purple-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-purple-500/20"
          onClick={() => onQuotaExceeded?.('UPGRADE')}
        >
          Upgrade ke VIP Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
          <ShoppingBag className="w-3.5 h-3.5" />
          E-commerce Sales Engine
        </div>
        <h1 className={cn("text-4xl md:text-6xl font-black tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
          Niche <span className="text-purple-500">Viral</span>
        </h1>
        <p className={cn("max-w-xl mx-auto opacity-50 font-medium", theme === 'dark' ? "text-white" : "text-slate-600")}>
          Ubah deskripsi produk menjadi mesin uang dengan copywriting kelas dunia yang dioptimalkan AI.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-4">
          <div className={cn(
            "p-3 rounded-[32px] border flex flex-col gap-2",
            theme === 'dark' ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200/60 shadow-sm"
          )}>
            {[
              { id: 'script', label: 'Skrip Video Pendek', icon: Video, desc: 'TikTok, Reels, Shorts' },
              { id: 'copy', label: 'Copywriting Etalase', icon: Clipboard, desc: 'Deskripsi Produk & Landing' },
              { id: 'hook', label: 'Hook Keranjang Kuning', icon: Zap, desc: 'Pemicu Klik & Beli' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id as Category)}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group",
                  category === tab.id 
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                    : (theme === 'dark' ? "hover:bg-white/5 text-white/40" : "hover:bg-slate-50 text-slate-500")
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  category === tab.id ? "bg-white/20" : (theme === 'dark' ? "bg-white/5" : "bg-slate-100")
                )}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">{tab.label}</p>
                  <p className={cn("text-[10px] font-medium opacity-60", category === tab.id ? "text-white" : "")}>{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className={cn(
            "p-6 rounded-[28px] border border-dashed",
            theme === 'dark' ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50 border-purple-200"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Copy Tip</span>
            </div>
            <p className={cn("text-[11px] font-medium leading-relaxed opacity-60 italic", theme === 'dark' ? "text-white" : "text-slate-600")}>
              "Gunakan formula PAS jika produk Anda menyelesaikan masalah spesifik audiens."
            </p>
          </div>
        </div>

        {/* Input & Output Area */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleGenerate} className={cn(
            "p-8 rounded-[32px] border space-y-6 transition-all",
            theme === 'dark' ? "bg-[#0A0A0A] border-white/5 shadow-2xl" : "bg-white border-slate-200/60 shadow-xl shadow-slate-200/10"
          )}>
            <div className="space-y-4">
              <label className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 px-2", theme === 'dark' ? "text-white" : "text-slate-900")}>
                Detail Produk / Jasa
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masukkan nama produk, kelebihan, atau masalah yang diselesaikan..."
                className={cn(
                  "w-full h-32 p-6 rounded-2xl outline-none transition-all resize-none font-medium border",
                  theme === 'dark' 
                    ? "bg-black/40 border-white/5 text-white placeholder:text-white/10 focus:border-purple-500/50" 
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-purple-400"
                )}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                <Info className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              disabled={loading || !topic}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                loading 
                  ? "bg-purple-500/50 text-white cursor-not-allowed" 
                  : "bg-purple-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-500/20"
              )}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>AI Magic Generator <Sparkles className="w-5 h-5 text-yellow-300" /></>
              )}
            </button>
          </form>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={cn(
                    "p-8 rounded-[32px] border space-y-4",
                    theme === 'dark' ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200/60"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Hook & Headline</h3>
                       <Target className="w-4 h-4 opacity-20" />
                    </div>
                    <p className={cn("text-xl font-black leading-tight italic", theme === 'dark' ? "text-white" : "text-slate-900")}>
                      "{result.hook}"
                    </p>
                  </div>

                  <div className={cn(
                    "p-8 rounded-[32px] border space-y-4",
                    theme === 'dark' ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200/60"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Call to Action</h3>
                       <Tag className="w-4 h-4 opacity-20" />
                    </div>
                    <p className={cn("text-lg font-bold leading-tight", theme === 'dark' ? "text-white" : "text-slate-700")}>
                      {result.cta}
                    </p>
                  </div>
                </div>

                <div className={cn(
                   "p-8 rounded-[32px] border relative overflow-hidden",
                   theme === 'dark' ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200/60 shadow-lg shadow-slate-200/20"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Konten Utama</h3>
                    <button 
                      onClick={handleSaveAction}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      {saving ? 'Saving...' : 'Simpan Konten'}
                    </button>
                  </div>
                  <div className={cn(
                    "prose prose-invert max-w-none font-medium leading-relaxed",
                    theme === 'dark' ? "text-white/60" : "text-slate-600 prose-slate"
                  )}>
                    {result.body.split('\n').map((line: string, i: number) => (
                      <p key={i} className="mb-4">{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
