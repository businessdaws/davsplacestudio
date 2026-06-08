import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Hash, 
  FileText, 
  Link as LinkIcon, 
  Loader2,
  AlertCircle,
  Zap,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  HelpCircle,
  X,
  Lock,
  MessageCircle,
  Key,
  Award
} from 'lucide-react';
import { generateSocialMediaContent, generateArticleContent } from '../lib/gemini';
import { cn } from '../lib/utils';

interface AIGeneratorUIProps {
  user: any;
  profile?: any;
  loadingProfile?: boolean;
  onIncrementTrial?: () => Promise<void>;
  settings?: any;
}

export default function AIGeneratorUI({ 
  user, 
  profile: propProfile, 
  loadingProfile: propLoadingProfile, 
  onIncrementTrial, 
  settings: propSettings 
}: AIGeneratorUIProps) {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [topic, setTopic] = useState('');
  const [generatorType, setGeneratorType] = useState<'social-media' | 'article'>('social-media');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [result, setResult] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'nvidia-nemotron'>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Subscription states
  const [localProfile, setLocalProfile] = useState<any>(null);
  const profile = propProfile || localProfile;
  
  const [localLoadingProfile, setLocalLoadingProfile] = useState(true);
  const loadingProfile = propLoadingProfile !== undefined ? propLoadingProfile : localLoadingProfile;

  const [localSettings, setLocalSettings] = useState<any>(null);
  const settings = propSettings || localSettings;
  
  // Activation code form states
  const [isActivating, setIsActivating] = useState(false);
  const [codeToActivate, setCodeToActivate] = useState('');
  const [activatingCode, setActivatingCode] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Subscribe snap profile
  useEffect(() => {
    if (!user || propProfile) {
      if (propProfile) {
        setLocalLoadingProfile(false);
      }
      return;
    }
    setLocalLoadingProfile(true);
    const profileRef = doc(db, 'profiles', user.uid);
    const unsubscribe = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        setLocalProfile(snap.data());
      } else {
        // Lazily create profile if missing
        const defaultProfile = {
          id: user.uid,
          full_name: user.displayName || user.email?.split('@')[0] || 'User',
          avatar_url: user.photoURL || '',
          role: 'user',
          is_premium: false,
          trial_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        try {
          await setDoc(profileRef, defaultProfile);
          setLocalProfile(defaultProfile);
        } catch (err) {
          console.error("Gagal buat profil baru:", err);
        }
      }
      setLocalLoadingProfile(false);
    }, (err) => {
      console.error("Gagal load profil:", err);
      setLocalLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user, propProfile]);

  // Read site settings once
  useEffect(() => {
    if (propSettings) return;
    const settingsRef = doc(db, 'site_settings', 'global');
    getDoc(settingsRef).then((snap) => {
      if (snap.exists()) {
        setLocalSettings(snap.data());
      }
    }).catch(err => {
      console.error("Gagal load setting global:", err);
    });
  }, [propSettings]);

  useEffect(() => {
    try {
      const pendingSocialPrompt = localStorage.getItem('analyzer_social_prompt');
      if (pendingSocialPrompt) {
        setTopic(`Buat caption sosial media menarik berdasarkan ringkasan riset berikut:\n\n${pendingSocialPrompt}`);
        localStorage.removeItem('analyzer_social_prompt');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Premium Check and Limit trials
    const isPremium = profile?.is_premium === true;
    const currentTrials = profile?.trial_count || 0;
    if (!isPremium && currentTrials >= 3) {
      setError('Batas uji coba gratis tercapai. Silakan masukkan kode langganan Pro Anda atau hubungi admin.');
      return;
    }

    setGenerating(true);
    setIsSaved(false);
    setError(null);
    try {
      let data;
      if (generatorType === 'article') {
        data = await generateArticleContent(topic, writingStyle, selectedProvider);
      } else {
        data = await generateSocialMediaContent(topic, selectedProvider);
      }
      setResult(data);

      // Successfully generated, increment trial if NOT premium
      if (!isPremium) {
        if (onIncrementTrial) {
          await onIncrementTrial();
        } else {
          const nextTrials = currentTrials + 1;
          const profileRef = doc(db, 'profiles', user.uid);
          await updateDoc(profileRef, {
            trial_count: nextTrials,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Maaf, ada masalah saat memproses AI. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    
    setSaving(true);
    try {
      await addDoc(collection(db, 'saved_contents'), {
        user_id: user.uid,
        topic: topic,
        type: generatorType,
        headline: result.headline || result.title_options?.[0],
        caption: result.caption || result.content,
        hashtags: result.hashtags || [],
        sources: result.sources || [],
        image_prompt: result.image_prompt || '',
        provider: selectedProvider,
        writing_style: writingStyle,
        created_at: serverTimestamp()
      });
      setIsSaved(true);
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      setError("Gagal menyimpan konten. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeToActivate.trim()) return;
    setActivatingCode(true);
    setActivationError(null);
    try {
      const trimmedCode = codeToActivate.trim();
      const codeRef = doc(db, 'activation_codes', trimmedCode);
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists()) {
        setActivationError('Kode aktivasi tidak terdaftar atau tidak valid. Silakan hubungi admin.');
        setActivatingCode(false);
        return;
      }
      
      const codeData = codeSnap.data();
      if (codeData.is_used) {
        setActivationError('Kode aktivasi ini sudah digunakan oleh pengguna lain.');
        setActivatingCode(false);
        return;
      }
      
      // Update activation code as used in Firestore
      await updateDoc(codeRef, {
        is_used: true,
        used_by: user.uid,
        used_by_email: user.email || 'unknown@user.com',
        used_at: new Date().toISOString()
      });
      
      // Update user's profile to is_premium
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        is_premium: true,
        premium_code: trimmedCode,
        updated_at: new Date().toISOString()
      });
      
      setCodeToActivate('');
      setIsActivating(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setActivationError('Gagal memproses kode aktivasi: ' + err.message);
    } finally {
      setActivatingCode(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro Header Card - perfectly inline with dynamic studio branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-tertiary border border-border-subtle p-8 md:p-12 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-yellow/5 blur-[120px] pointer-events-none" />
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-accent-yellow/20 to-accent-yellow/5 rounded-[2rem] flex items-center justify-center shrink-0 border border-accent-yellow/25 shadow-lg shadow-accent-yellow/10">
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-accent-yellow" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 text-accent-yellow text-[9px] font-black tracking-widest rounded-full border border-accent-yellow/20 uppercase">
            <Zap className="w-3 h-3 animate-pulse" /> Davsplace Studio Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">AI CONTENT GENERATOR</h2>
          <p className="text-text-secondary text-xs sm:text-sm font-sans max-w-xl opacity-80 leading-relaxed">
            Asisten cerdas pembuat konten premium. Kembangkan ide tulisan, buat caption interaktif sosial media, atau rancang naskah artikel berstruktur SEO unggulan dalam sekejap.
          </p>
        </div>
      </motion.div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Column (Inputs & Models) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Subscription / Trial Status Widget */}
          {loadingProfile ? (
            <div className="bg-bg-secondary border border-border-subtle p-5 rounded-[1.8rem] text-center text-[10px] font-black uppercase text-text-secondary tracking-widest animate-pulse">
              Memuat data lisensi...
            </div>
          ) : profile?.is_premium ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary border border-emerald-500/20 p-5 rounded-[1.8rem] shadow-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 select-none">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest leading-none mb-1">Status Lisensi</p>
                  <h4 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                    Jalur VIP Premium <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase">PRO</span>
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black uppercase text-text-secondary">Akses Pembuatan</div>
                <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">UNLIMITED</div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary border border-border-subtle p-5 rounded-[1.8rem] shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center text-accent-yellow shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-text-secondary tracking-widest leading-none mb-1">Status Akun</p>
                    <h4 className="text-xs font-black uppercase tracking-tight text-white">
                      Uji Coba Biasa
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black uppercase text-text-secondary">Percobaan Gratis</div>
                  <div className="text-[10px] font-black text-accent-yellow">{profile?.trial_count || 0} / 3 Digunakan</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden border border-border-subtle/50">
                <div 
                  className="h-full bg-accent-yellow transition-all duration-500"
                  style={{ width: `${Math.min(((profile?.trial_count || 0) / 3) * 100, 100)}%` }}
                />
              </div>

              {/* Action trigger links */}
              <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider">
                <button 
                  onClick={() => {
                    setIsActivating(!isActivating);
                    setActivationError(null);
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-1.5",
                    isActivating 
                      ? "bg-bg-tertiary border-accent-yellow text-accent-yellow" 
                      : "bg-bg-tertiary border-border-subtle hover:bg-neutral-800 text-white"
                  )}
                >
                  <Key className="w-3.5 h-3.5" />
                  Gunakan Kode
                </button>

                <a 
                  href={`https://wa.me/${settings?.whatsapp || '6289667736500'}?text=${encodeURIComponent("Halo Admin Davsplace, saya ingin membeli lisensi Pro AI Content Generator.")}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="flex-1 py-3 bg-accent-yellow hover:bg-white text-bg-primary rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-bg-primary text-bg-primary" />
                  Upgrade Pro
                </a>
              </div>

              {/* Activation Code input field form */}
              <AnimatePresence>
                {isActivating && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleActivateCode}
                    className="overflow-hidden space-y-2 border-t border-border-subtle/30 pt-3"
                  >
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1">
                      KODE AKTIVASI DARI ADMIN
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={codeToActivate}
                        onChange={(e) => setCodeToActivate(e.target.value)}
                        placeholder="e.g. DK-AI-XXXX-XXXX"
                        className="flex-1 bg-bg-tertiary border border-border-subtle rounded-xl px-3 py-2 outline-none focus:border-accent-yellow text-xs font-mono uppercase text-white"
                      />
                      <button 
                        type="submit"
                        disabled={activatingCode || !codeToActivate.trim()}
                        className="px-4 bg-accent-yellow text-bg-primary text-[9px] font-black uppercase rounded-xl hover:bg-accent-yellow/90 disabled:opacity-50 flex items-center justify-center"
                      >
                        {activatingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'AKTIFKAN'}
                      </button>
                    </div>
                    {activationError && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {activationError}
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Setup Form or Lockout Paywall Lock */}
          {(!profile?.is_premium && (profile?.trial_count || 0) >= 3) ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary border border-red-500/20 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 animate-pulse" />
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-red-400 tracking-widest">Akses Dihentikan</p>
                <h3 className="text-xl font-display font-black tracking-tight uppercase text-white">BATAS TRIAL TERCAPAI</h3>
                <p className="text-text-secondary text-xs sm:text-xs leading-relaxed max-w-sm mx-auto">
                  Uji coba gratis Anda telah habis (3/3 kali generate). Untuk terus memicu model kecerdasan buatan menyusun draf premium Tanpa Batas, silakan tebus kode langganan Pro Anda.
                </p>
              </div>

              {/* Direct Input form in paywall */}
              <div className="space-y-2 border border-border-subtle/50 p-5 rounded-2xl bg-bg-tertiary/40 text-left">
                <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1">
                  Masukkan Kode Langganan Pro
                </label>
                <form onSubmit={handleActivateCode} className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={codeToActivate}
                      onChange={(e) => setCodeToActivate(e.target.value)}
                      placeholder="e.g. DK-AI-XXXX-XXXX"
                      className="flex-1 bg-bg-tertiary border border-border-subtle rounded-xl px-3 py-2.5 outline-none focus:border-accent-yellow text-xs font-mono uppercase text-white"
                    />
                    <button 
                      type="submit"
                      disabled={activatingCode || !codeToActivate.trim()}
                      className="px-4 bg-accent-yellow text-bg-primary text-[10px] font-black uppercase rounded-xl hover:bg-accent-yellow/90 disabled:opacity-50 flex items-center justify-center"
                    >
                      {activatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'AKTIFKAN'}
                    </button>
                  </div>
                  {activationError && (
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {activationError}
                    </p>
                  )}
                </form>
              </div>

              <div className="flex flex-col gap-2">
                <a 
                  href={`https://wa.me/${settings?.whatsapp || '6289667736500'}?text=${encodeURIComponent("Halo Admin Davsplace, saya ingin membeli lisensi Pro AI Content Generator.")}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full py-4 bg-accent-yellow hover:scale-[1.01] active:scale-95 text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-yellow/10"
                >
                  <MessageCircle className="w-4 h-4 fill-bg-primary text-bg-primary animate-bounce" />
                  Beli Manual Lewat Admin
                </a>
                <p className="text-[8px] text-text-secondary font-bold uppercase tracking-wide opacity-80">
                  Uji coba khusus: Harga FREE terbatas untuk 10 orang terdaftar pertama!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] shadow-xl space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-text-secondary border-b border-border-subtle/30 pb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-yellow" />
                1. Setup Parameter AI
              </h3>

              {/* Type Selection Tabs */}
              <div className="flex p-1 bg-bg-tertiary border border-border-subtle rounded-xl text-[9px] font-black uppercase">
                <button
                  onClick={() => {
                    setGeneratorType('social-media');
                    setResult(null);
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg transition-all",
                    generatorType === 'social-media' 
                      ? "bg-accent-yellow text-bg-primary shadow-md" 
                      : "text-text-secondary hover:text-white"
                  )}
                >
                  Social Media
                </button>
                <button
                  onClick={() => {
                    setGeneratorType('article');
                    setResult(null);
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg transition-all relative flex items-center justify-center gap-1.5",
                    generatorType === 'article' 
                      ? "bg-accent-yellow text-bg-primary shadow-md" 
                      : "text-text-secondary hover:text-white"
                  )}
                >
                  Artikel Generator
                  <span className="px-1 py-0.5 bg-bg-primary text-accent-yellow text-[7px] rounded uppercase font-black tracking-tighter">BETA</span>
                </button>
              </div>

              {/* Content Field Form */}
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    Apa topik yang ingin kamu jadikan konten?
                  </label>
                  <textarea 
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={generatorType === 'article' ? "Panduan lengkap mulai investasi kripto aman..." : "Manfaat desain minimalis untuk branding startup modern..."}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white resize-none leading-relaxed"
                  />
                </div>

                {generatorType === 'article' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                      Gaya Penulisan
                    </label>
                    <select
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-3.5 outline-none focus:border-accent-yellow transition-all text-xs font-sans text-white cursor-pointer"
                    >
                      <option value="professional">🎯 Professional & Kredibel</option>
                      <option value="formal">👔 Formal & Serius</option>
                      <option value="relaxed">☕ Santai & Dekat</option>
                      <option value="informative">📚 Informatif & Edukatif</option>
                      <option value="persuasive">🔥 Persuasif & Menyakinkan</option>
                    </select>
                  </div>
                )}

                {/* Engine Model Provider Selection */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    Pilih Engine AI Power
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('gemini')}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                        selectedProvider === 'gemini' 
                          ? "bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/5" 
                          : "bg-bg-tertiary border-border-subtle text-text-secondary opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304dfad33318282.svg" className="w-4 h-4" alt="Gemini" />
                      <span className="text-[9px] font-black uppercase tracking-tight">Google Gemini</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('nvidia-nemotron')}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                        selectedProvider === 'nvidia-nemotron' 
                          ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg" 
                          : "bg-bg-tertiary border-border-subtle text-text-secondary opacity-60 hover:opacity-100"
                      )}
                    >
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-[9px] font-black uppercase tracking-tight">Nemotron-70B</span>
                    </button>
                  </div>
                </div>

                {/* Action trigger button */}
                <button 
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="w-full py-4 bg-accent-yellow text-bg-primary font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-[10px] uppercase tracking-widest"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-bg-primary" />
                      Memproses Formula...
                    </>
                  ) : (
                    <>
                      Generate Konten AI
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between">
                <span className="text-[8px] font-bold text-text-secondary uppercase">Powered by API Gateway</span>
                <button
                  onClick={() => setIsTipsOpen(true)}
                  className="text-[9px] flex items-center gap-1 p-0.5 text-accent-yellow hover:underline font-bold uppercase transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Panduan Prompting
                </button>
              </div>
            </div>
          )}

          {/* Beta Notice Alert */}
          {generatorType === 'article' && (
            <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl flex items-start gap-3 text-accent-yellow">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold text-accent-yellow uppercase tracking-wide leading-relaxed">
                Artikel Generator masih dalam fase uji coba. Anda dapat mendesain draf naskah panjang dengan struktur heading modular secara gratis.
              </p>
            </div>
          )}
        </div>

        {/* Right Output Column */}
        <div id="design-editor-workspace" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Save status action bar */}
                <div className="bg-bg-secondary border border-border-subtle p-4 rounded-[2rem] shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                      Formula Terbentuk : Selesai
                    </span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || isSaved}
                    className={cn(
                      "flex items-center gap-1.5 px-4 h-9 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all",
                      isSaved 
                        ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                        : "bg-accent-yellow text-bg-primary hover:scale-105 active:scale-95 shadow-lg shadow-accent-yellow/5"
                    )}
                  >
                    {saving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    {isSaved ? 'TERPERSISTENSI' : 'SIMPAN KE DASHBOARD'}
                  </button>
                </div>

                {/* Headline Block */}
                <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 blur-[40px]" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent-yellow" />
                      {generatorType === 'social-media' ? 'Headline Terkurasi' : 'Rekomendasi Judul Editorial'}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatorType === 'social-media' ? result.headline : result.title_options?.join('\n'), 'headline')}
                      className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                    >
                      {copied === 'headline' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {generatorType === 'social-media' ? (
                    <h3 className="text-xl md:text-2xl font-display font-black leading-snug uppercase text-white">
                      {result.headline}
                    </h3>
                  ) : (
                    <div className="space-y-2">
                      {result.title_options?.map((title: string, i: number) => (
                        <div key={i} className="p-3 bg-bg-tertiary/60 rounded-xl border border-border-subtle text-xs font-semibold text-white">
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Content Body */}
                <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent-yellow" />
                      {generatorType === 'social-media' ? 'Caption Output' : 'Naskah Artikel Utama'}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(generatorType === 'social-media' ? result.caption : result.content, 'caption')}
                      className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                    >
                      {copied === 'caption' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-text-secondary font-sans leading-relaxed text-xs sm:text-sm whitespace-pre-wrap max-h-[380px] overflow-y-auto custom-scrollbar p-1">
                    {generatorType === 'social-media' ? result.caption : result.content}
                  </div>
                </div>

                {/* Hashtags Card */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-accent-yellow" />
                        Sosial Hashtags
                      </span>
                      <button 
                        onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')}
                        className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                      >
                        {copied === 'hashtags' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-bg-tertiary border border-border-subtle rounded-md text-[10px] font-black text-accent-yellow uppercase tracking-wider">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image prompt generation thumbnail */}
                {result.image_prompt && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-accent-yellow" />
                        AI Image Prompt
                      </span>
                      <button 
                        onClick={() => copyToClipboard(result.image_prompt, 'image_prompt')}
                        className="p-2 bg-bg-tertiary rounded-lg hover:text-accent-yellow hover:bg-neutral-800 transition"
                      >
                        {copied === 'image_prompt' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="p-4 bg-bg-tertiary border border-border-subtle rounded-xl text-xs text-text-secondary font-mono italic leading-relaxed">
                      "{result.image_prompt}"
                    </div>
                  </div>
                )}

                {/* Sources list if any */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-bg-secondary border border-border-subtle p-6 rounded-[2rem] space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-accent-yellow" />
                      Referensi Kredibel Peneliti
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {result.sources.map((src: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 px-3 bg-bg-tertiary rounded-lg border border-border-subtle text-[10px] truncate select-all">
                          <LinkIcon className="w-3 h-3 text-accent-yellow shrink-0" />
                          <span className="truncate opacity-75 italic text-white">{src}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-12 text-center py-20 flex flex-col items-center justify-center space-y-4 shadow-xl"
              >
                <div className="w-16 h-16 bg-bg-tertiary border border-border-subtle rounded-2xl flex items-center justify-center text-accent-yellow shadow-inner">
                  <Sparkles className="w-8 h-8 opacity-40 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black uppercase tracking-widest text-white">Generator Workspace Empty</h3>
                  <p className="text-[10px] text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed opacity-70">
                    Sistem siap menerima topik. Masukkan tema draf Anda di kolom formulir sebelah kiri untuk menyusun konten cerdas.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Guide Prompt Modal overlay */}
      {isTipsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-bg-secondary border border-border-subtle p-8 rounded-[3rem] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-yellow flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                PANDUAN PROMPTING MAKSIMAL
              </span>
              <button 
                onClick={() => setIsTipsOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-text-secondary leading-normal text-left">
              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">💡 Berikan Detail Konteks</p>
                <p>Daripada menulis "Kopi enak", cobalah "Rekomendasi 5 racikan kopi cold brew lokal untuk kalangan milenial pekerja kantoran produktif." Konteks melahirkan presisi tinggi.</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">🏷️ Integrasi Hashtags Cerdas</p>
                <p>Sistem akan memformulasikan tagar yang sedang naik daun dan merekomendasikan penulisan caption terstruktur dengan baris spasi yang rapi untuk meningkatkan interaksi akun.</p>
              </div>

              <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle space-y-1">
                <p className="font-bold text-white uppercase text-[9px] tracking-wide">🔗 Buka Dari Analyzer</p>
                <p>Anda dapat mengklik opsi "Generate Social Post" dari tab Content Analyzer untuk merangkum berkas riset Anda ke dalam kolom topik di form ini secara otomatis!</p>
              </div>
            </div>

            <button
              onClick={() => setIsTipsOpen(false)}
              className="w-full py-3 bg-accent-yellow hover:bg-white text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
            >
              Baik, Saya Paham
            </button>
          </div>
        </div>
      )}

      {/* Subscription Code Activation Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-bg-secondary border-2 border-emerald-500/30 p-8 rounded-[3rem] shadow-2xl text-center space-y-6 overflow-hidden"
          >
            {/* Ambient emerald lights */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] pointer-events-none" />

            {/* Premium Icon Ring */}
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/5 select-none relative">
              <Award className="w-10 h-10 animate-bounce" />
              <div className="absolute -top-1 -right-1 bg-accent-yellow text-bg-primary font-black rounded-full p-1 text-[9px]">👑</div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.25em]">AKTIVASI BERHASIL</span>
              <h3 className="text-2xl font-display font-black leading-tight uppercase text-white">SELAMAT DATANG DI PRO</h3>
              <p className="text-text-secondary font-semibold text-sm sm:text-xs leading-relaxed max-w-xs mx-auto text-center px-2">
                "Selamat berlangganan jalur VIP penggunakan AI Generator sudah bisa digunakan! Nikmati fiturnya"
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.01] text-bg-primary font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10"
            >
              Mulai Eksplorasi Tanpa Batas
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
