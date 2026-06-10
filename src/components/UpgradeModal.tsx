import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, MessageCircle, Key, Loader2, Sparkles, ShieldCheck, Crown, Rocket } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { doc, getDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'QUOTA' | 'UPGRADE' | 'SAVE' | 'GEMINI_QUOTA' | 'NONE';
}

export default function UpgradeModal({ isOpen, onClose, reason = 'NONE' }: UpgradeModalProps) {
  const { theme } = useTheme();
  const { user, profile } = useSubscription();
  const [licenseKey, setLicenseKey] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Success Confetti Effect
  React.useEffect(() => {
    if (success) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [success]);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Gratis',
      features: ['Gen Konten (3x/hari)', 'Data disimpan di Cloud'],
      icon: Zap,
      color: 'text-slate-400'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rp 49rb/bln',
      features: ['Gen Konten (Unlimited)', 'Hook Viral', 'Tren Konten Mingguan', 'Direct Support'],
      icon: Crown,
      color: 'text-yellow-500'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 'Rp 99rb/bln',
      features: ['Semua Fitur Pro', 'Pencari Niche Viral', 'Threads Generator', 'Content Analyzer', 'Early Access'],
      icon: Sparkles,
      color: 'text-purple-500'
    }
  ];

  const handleActivate = async () => {
    if (!licenseKey.trim() || !user) {
      setError('Masukkan License Key yang valid.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const keyRef = doc(db, 'license_keys', licenseKey.trim());
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        setLoading(false);
        setError('License key tidak ditemukan. Tolong periksa kembali kode Anda.');
        return;
      }

      const keyData = keySnap.data();
      if (keyData.status === 'used') {
        setLoading(false);
        setError('License key sudah pernah digunakan oleh pengguna lain.');
        return;
      }

      // 3. Optimalkan Update User: Gunakan batch untuk atomicity atau updateDoc langsung
      const batch = writeBatch(db);
      
      // Update Key Status
      batch.update(keyRef, {
        status: 'used',
        usedBy: user.uid,
        usedAt: serverTimestamp()
      });

      // Update User Plan
      batch.update(doc(db, 'users', user.uid), {
        plan: keyData.plan,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      
      // Success Confetti & State Update
      setSuccess(true);
      setLoading(false);
      
      // Optional: Auto-reload after a delay or let user click
      // setTimeout(() => window.location.reload(), 2000); 
    } catch (err: any) {
      console.error("Activation Error:", err);
      // Ensure loading is false on error
      setLoading(false);
      setError(err?.message || 'Terjadi kesalahan sistem. Silakan coba lagi nanti.');
    } finally {
      // Small safety check
      setLoading(false);
    }
  };

  const handleFinishActivation = () => {
    window.location.reload();
  };

  const waLink = "https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20beli%20License%20Key%20Davsplace%20Pro/VIP";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!success ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border shadow-2xl flex flex-col md:flex-row",
              theme === 'dark' ? "bg-[#0A0A0A] border-white/10" : "bg-white border-slate-200"
            )}
          >
            {success ? (
              /* REAL SUCCESS VIEW */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-gradient-to-b from-yellow-400/5 to-transparent min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)]"
                >
                  <ShieldCheck className="w-12 h-12 text-black" />
                </motion.div>
                
                <div className="space-y-4">
                  <h2 className={cn("text-3xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    Aktivasi Berhasil!
                  </h2>
                  <p className={cn("text-lg font-medium max-w-md mx-auto", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
                    Selamat menggunakan Fitur Unggulan dari <span className="text-yellow-500 font-bold">Davsplace AI Studio Engine</span>. Akun Anda kini telah ditingkatkan.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinishActivation}
                  className="px-8 h-14 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 shadow-xl"
                >
                  <Rocket className="w-5 h-5" />
                  Mulai Eksplorasi
                </motion.button>
              </div>
            ) : (
              /* UPGRADE FORM VIEW */
              <>
                {/* Left: Pricing & Benefits */}
                <div className={cn(
                  "flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar",
                  theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50/50"
                )}>
                  <div className="space-y-8">
                    <div>
                      <h2 className={cn("text-3xl font-black tracking-tight mb-2 uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
                        {reason === 'QUOTA' ? 'Kuota Harian Habis' : 
                         reason === 'GEMINI_QUOTA' ? 'Server AI Sedang Sibuk' :
                         reason === 'SAVE' ? 'Fitur Simpan Konten' : 'Upgrade Ke Level Pro'}
                      </h2>
                      <p className={cn("text-sm font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                        {reason === 'GEMINI_QUOTA' 
                          ? 'Akun gratis berbagi kuota dengan user lain. Tunggu sebentar atau upgrade ke Pro untuk prioritas akses tanpa batas.' 
                          : reason === 'SAVE' ? 'Fitur Simpan Konten hanya untuk pengguna Pro/VIP' : 'Buka potensi penuh AI untuk konten Anda.'}
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                          <div 
                            key={plan.id}
                            className={cn(
                              "p-5 rounded-2xl border transition-all relative group",
                              profile?.plan === plan.id 
                                ? (theme === 'dark' ? "bg-yellow-400/10 border-yellow-400/30" : "bg-yellow-50 border-yellow-200")
                                : (theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-100")
                            )}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme === 'dark' ? "bg-white/5" : "bg-slate-100")}>
                                  <Icon className={cn("w-5 h-5", plan.color)} />
                                </div>
                                <div>
                                  <h3 className={cn("font-black tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{plan.price}</p>
                                </div>
                              </div>
                              {profile?.plan === plan.id && (
                                <span className="text-[9px] font-black uppercase text-yellow-600 bg-yellow-400/20 px-2 py-1 rounded">Aktif</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  <span className={cn("text-[11px] font-medium opacity-70", theme === 'dark' ? "text-white" : "text-slate-600")}>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & License */}
                <div className="w-full md:w-[380px] p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className={cn("text-lg font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Mulai Sekarang</h3>
                      <a 
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-500/20"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Beli Key via WhatsApp
                      </a>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className={cn("w-full border-t", theme === 'dark' ? "border-white/5" : "border-slate-100")}></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                        <span className={cn("px-4", theme === 'dark' ? "bg-[#0A0A0A] text-white/20" : "bg-white text-slate-400")}>Atau</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={cn("text-xs font-black uppercase tracking-widest opacity-50 px-1", theme === 'dark' ? "text-white" : "text-slate-900")}>
                          Aktivasi License Key
                        </label>
                        <div className="relative">
                          <Key className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", theme === 'dark' ? "text-white/20" : "text-slate-400")} />
                          <input 
                            type="text" 
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                            placeholder="DAVS-XXXX-XXXX"
                            className={cn(
                              "w-full h-14 pl-12 pr-4 rounded-2xl border text-sm font-black tracking-widest focus:outline-none focus:ring-2 ring-yellow-400/20 transition-all uppercase",
                              theme === 'dark' ? "bg-white/5 border-white/5 text-white placeholder:text-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
                            )}
                          />
                        </div>
                      </div>

                      {error && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="text-[10px] font-bold text-red-500 px-1"
                        >
                          {error}
                        </motion.p>
                      )}

                      <button 
                        onClick={handleActivate}
                        disabled={loading || !licenseKey || !user}
                        className={cn(
                          "w-full h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                          theme === 'dark' ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800",
                          (loading || !licenseKey || !user) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aktifkan Akun'}
                      </button>
                      
                      {!user && (
                        <p className="text-[10px] font-medium text-center text-red-500/70">
                          Silakan Login dengan Google untuk melakukan aktivasi.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className={cn(
                    "absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                    theme === 'dark' ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
