import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Filter, 
  BarChart3, 
  Key, 
  Activity, 
  Users,
  ShieldCheck,
  TrendingUp,
  Download,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

const ADMIN_UID = 'XZootTsQ4CMBvhIM5PDrVkNyz112';

interface LicenseKey {
  id: string;
  key: string;
  plan: 'pro' | 'vip';
  status: string;
  createdAt: any;
  usedBy?: string;
  usedAt?: any;
}

export default function AdminKeyGenerator() {
  const [user] = useAuthState(auth);
  const { theme } = useTheme();
  const [keys, setKeys] = React.useState<LicenseKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [plan, setPlan] = React.useState<'pro' | 'vip'>('pro');
  const [count, setCount] = React.useState(1);
  const [generating, setGenerating] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  const [stats, setStats] = React.useState({
    total: 0,
    used: 0,
    available: 0
  });

  const isAdmin = user?.uid === ADMIN_UID;

  React.useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'license_keys'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedKeys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LicenseKey[];
      setKeys(fetchedKeys);
      
      const usedCount = fetchedKeys.filter(k => k.status === 'used').length;
      setStats({
        total: fetchedKeys.length,
        used: usedCount,
        available: fetchedKeys.length - usedCount
      });
      
      setLoading(false);
    });
    return unsubscribe;
  }, [isAdmin]);

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      for (let i = 0; i < count; i++) {
        const key = `DAVS-${plan.toUpperCase()}-${generateRandomCode()}-${generateRandomCode()}`;
        await setDoc(doc(db, 'license_keys', key), {
          key,
          plan,
          status: 'available',
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid
        });
      }
      setCount(1);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus license key ini?')) {
      await deleteDoc(doc(db, 'license_keys', id));
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Akses Ditolak</h2>
        <p className="text-slate-500 mt-2">Halaman ini hanya untuk administrator.</p>
      </div>
    );
  }

  const filteredKeys = keys.filter(k => 
    k.key.toLowerCase().includes(search.toLowerCase()) ||
    k.plan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 px-4 md:px-0 pb-24">
      {/* Header Admin */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 md:pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <ShieldCheck className="text-black w-6 h-6" />
            </div>
            <h1 className={cn("text-3xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Admin <span className="text-yellow-400">Console</span>
            </h1>
          </div>
          <p className={cn("text-sm opacity-50 font-medium", theme === 'dark' ? "text-white" : "text-slate-600")}>
            Manajemen License Key & Akses Pengguna Premium
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className={cn(
             "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
             theme === 'dark' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
           )}>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Sistem Online
           </div>
        </div>
      </section>

      {/* Statistik Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Keys', value: stats.total, icon: Key, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Used Keys', value: stats.used, icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Available Keys', value: stats.available, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-6 md:p-8 rounded-[32px] border group hover:border-white/10 transition-colors",
              theme === 'dark' ? "bg-[#0F0F0F] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  {stat.label}
                </p>
                <h3 className={cn("text-4xl md:text-5xl font-black tabular-nums", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  {stat.value}
                </h3>
              </div>
              <div className={cn("p-3 md:p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6 md:w-7 md:h-7", stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Generate */}
        <section className="lg:col-span-4 h-full">
          <div className={cn(
            "p-6 md:p-8 rounded-[40px] border lg:sticky lg:top-8 space-y-8",
            theme === 'dark' ? "bg-[#0F0F0F] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="space-y-1">
              <h2 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Generate Key</h2>
              <p className={cn("text-[11px] opacity-40 font-medium", theme === 'dark' ? "text-white" : "text-slate-600")}>Tambahkan batch lisensi baru ke sistem.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">License Category</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/5">
                  {(['pro', 'vip'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      className={cn(
                        "py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        plan === p 
                          ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10" 
                          : "text-white/40 hover:text-white/60 hover:bg-white/5"
                      )}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Key Quantity</label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border text-base font-black focus:outline-none transition-all",
                    theme === 'dark' ? "bg-black/40 border-white/5 text-white focus:border-yellow-400/50" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
              </div>

              <button 
                disabled={generating}
                className={cn(
                  "w-full h-16 rounded-2xl text-black text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                  generating ? "bg-yellow-400/50" : "bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-yellow-400/20"
                )}
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Execute Batch</>}
              </button>
            </form>
          </div>
        </section>

        {/* Tabel Data */}
        <section className="lg:col-span-8">
          <div className={cn(
            "rounded-[32px] md:rounded-[40px] border overflow-hidden",
            theme === 'dark' ? "bg-[#0F0F0F] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className={cn("text-lg font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>License Database</h2>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input 
                  type="text"
                  placeholder="Seach keys..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "pl-10 pr-4 py-2.5 rounded-xl border text-[11px] font-bold focus:outline-none w-full md:w-64",
                    theme === 'dark' ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-30", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    <th className="px-8 py-6">Kode Key</th>
                    <th className="px-8 py-6">Tier</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Dibuat Pada</th>
                    <th className="px-8 py-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredKeys.map((k) => (
                      <motion.tr 
                        key={k.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "group transition-colors",
                          theme === 'dark' ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                        )}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <code className={cn("px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider", theme === 'dark' ? "bg-white/5 text-white/90 shadow-inner" : "bg-slate-100 text-slate-700")}>
                              {k.key}
                            </code>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border",
                            k.plan === 'vip' 
                              ? "bg-yellow-400/10 text-yellow-500 border-yellow-400/20" 
                              : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                          )}>
                            {k.plan}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {k.status === 'used' ? (
                            <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                              Used
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[11px] opacity-40 font-bold">
                            {k.createdAt?.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleCopy(k.key)}
                            className="p-2.5 rounded-xl hover:bg-yellow-400/10 text-yellow-500 transition-all active:scale-90"
                            title="Copy Key"
                          >
                            {copiedKey === k.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(k.id)}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            title="Delete Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredKeys.length === 0 && (
                <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <Search className="w-12 h-12" />
                  <p className="text-sm font-bold uppercase tracking-widest">Tidak ada data ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
