import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where,
  getDocs, 
  setDoc, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase,
  Calendar, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Upload,
  X,
  MessageSquare,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Command,
  Sparkles,
  ArrowUpRight,
  MoreVertical,
  Bell,
  Menu,
  Mail,
  Image as ImageIcon,
  Key,
  Award,
  Check,
  Copy
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays } from 'date-fns';

import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../lib/utils';
import ImagePromptGenerator from '../../components/ImagePromptGenerator';
import AdminContentGeneratorUI from '../../components/AdminContentGeneratorUI';

type Tab = 'overview' | 'leads' | 'content_generator' | 'articles' | 'events' | 'communities' | 'portfolios' | 'links' | 'categories' | 'logos' | 'settings' | 'subscriptions';

// ✅ Matching list from Login.tsx
const ADMIN_EMAILS = [
  'davsplacestudio@gmail.com',
  'businessdaws@gmail.com',
  'buainessdaws@gmail.com',
  'admin@davs.studio',
  'fajarmuniri@gmail.com'
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user found in Dashboard, redirecting to login');
        navigate('/admin/login');
        return;
      }

      setCurrentUser(user);

      const normalizedEmail = user.email?.toLowerCase();
      const isAdminEmail = normalizedEmail && ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.data();

        // If DB says not admin but email is whitelisted, try to FIX it
        if (isAdminEmail && (!profile || profile.role !== 'admin')) {
          console.log('Admin email detected but DB role missing. Attempting auto-sync...');
          await setDoc(profileRef, {
            id: user.uid,
            role: 'admin',
            full_name: user.displayName || user.email?.split('@')[0] || 'Admin',
            updated_at: serverTimestamp()
          }, { merge: true });
          
          setLoading(false);
          return;
        }

        if (!isAdminEmail && (!profile || profile.role !== 'admin')) {
          const msg = `Akses Ditolak: Akun anda tidak terdaftar sebagai admin.`;
          setAccessDenied(msg);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('Check user error:', err);
        setAccessDenied(`Database Error: ${err.message}`);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkDb = async () => {
      try {
        // Test connection by trying to get count of profiles
        const coll = collection(db, 'profiles');
        await getCountFromServer(coll);
        setDbStatus('connected');
      } catch (err) {
        console.error('DB Connection error:', err);
        setDbStatus('error');
      }
    };
    checkDb();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const generateAIContent = async (prompt: string, context: string, provider: 'gemini' | 'nvidia-nemotron' = 'nvidia-nemotron') => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, context, provider }),
      });
      
      if (!response.ok) {
        let errMsg = `Status ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.text || '';
    } catch (err: any) {
      console.error('AI Error:', err);
      throw err;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <TrendingUp className="w-10 h-10 text-accent-yellow animate-bounce" />
    </div>
  );

  if (accessDenied) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md bg-bg-secondary p-10 rounded-2xl border border-border-subtle shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Akses Dibatasi</h2>
        <div className="p-4 bg-bg-tertiary rounded-xl border border-border-subtle text-sm text-text-secondary mb-8 leading-relaxed">
          {accessDenied}
          <div className="mt-4 pt-4 border-t border-border-subtle text-[10px] uppercase font-black text-accent-yellow">
            Saran: Pastikan email anda terdaftar di ADMIN_EMAILS dan RLS Policy di Supabase sudah benar.
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-bg-tertiary border border-border-subtle font-black rounded-xl hover:bg-bg-primary transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          LOGOUT & COBA LAGI
        </button>
      </motion.div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-yellow rounded-xl flex items-center justify-center rotate-6 shadow-lg shadow-accent-yellow/20">
              <span className="text-bg-primary font-black text-xl">D</span>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter leading-none">Davs <span className="text-accent-yellow italic">Studio</span></h2>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary mt-1">Control Center 2.5</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-text-secondary hover:text-white bg-bg-tertiary/50 rounded-lg border border-border-subtle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <p className="px-4 text-[9px] font-black uppercase text-accent-yellow/40 tracking-[0.3em] mb-4">Main Menu</p>
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'leads', icon: MessageSquare, label: 'Inbound Leads' },
          { id: 'content_generator', icon: Sparkles, label: 'Konten Generator' },
          { id: 'articles', icon: FileText, label: 'Content Articles' },
          { id: 'portfolios', icon: Briefcase, label: 'Project Showcase' },
          { id: 'events', icon: Calendar, label: 'Events & Programs' },
          { id: 'communities', icon: Users, label: 'Communities' },
          { id: 'links', icon: ExternalLink, label: 'Magic Links' },
          { id: 'categories', icon: Zap, label: 'Taxonomy' },
          { id: 'logos', icon: Users, label: 'Client Logos' },
          { id: 'settings', icon: Settings, label: 'System Settings' },
          { id: 'subscriptions', icon: Key, label: 'Subscriptions & Codes' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as Tab);
              setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all group active:scale-95 text-left relative",
              activeTab === item.id 
                ? 'bg-accent-yellow text-bg-primary shadow-xl shadow-accent-yellow/10' 
                : 'text-text-secondary hover:bg-bg-tertiary hover:text-white border border-transparent hover:border-border-subtle'
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-xs md:text-sm tracking-tight capitalize">{item.label.toLowerCase()}</span>
            {activeTab === item.id && (
              <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 rounded-full bg-bg-primary" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-6 border-t border-border-subtle mt-auto">
        <div className="bg-bg-tertiary/30 rounded-2xl p-4 border border-border-subtle mb-4 hidden xs:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-black text-text-secondary uppercase">All Systems Optimal</p>
          </div>
          <p className="text-[8px] text-text-secondary/50 font-bold uppercase tracking-widest">Update v2.5.42</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Logout Account
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex overflow-hidden">
      {/* (1) Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-bg-secondary border-r border-border-subtle flex-col h-screen sticky top-0 z-50 shrink-0">
        <SidebarContent />
      </aside>

      {/* (2) Mobile Drawer Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] preserve-3d">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-bg-secondary border-r border-border-subtle flex flex-col shadow-[20px_0_100px_rgba(0,0,0,0.8)]"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* (3) Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Modern Header */}
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle px-4 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-white bg-bg-secondary border border-border-subtle rounded-xl active:scale-90 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center bg-bg-tertiary/50 border border-border-subtle rounded-xl px-4 py-2 w-80 group focus-within:border-accent-yellow transition-all cursor-pointer" onClick={() => setIsCommandPaletteOpen(true)}>
              <Search className="w-4 h-4 text-text-secondary group-hover:text-accent-yellow transition-colors" />
              <span className="ml-3 text-xs text-text-secondary font-medium">Cari apa saja...</span>
              <kbd className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-subtle bg-bg-primary text-[10px] font-black text-text-secondary">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </div>
            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 text-text-secondary bg-bg-secondary border border-border-subtle rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden xs:flex flex-col items-end mr-1 md:mr-2">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-accent-yellow leading-none tracking-widest mb-1">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter text-text-secondary">{dbStatus === 'connected' ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-bg-tertiary border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
              )}
            </div>
            
            <div className="w-px h-6 bg-border-subtle mx-1 hidden sm:block" />

            <button className="p-2 text-text-secondary hover:text-accent-yellow transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-yellow rounded-full ring-2 ring-bg-primary" />
            </button>

            <a 
              href="/" 
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-yellow text-bg-primary text-xs font-black rounded-xl hover:bg-white transition-all shadow-lg shadow-accent-yellow/10"
            >
              <ExternalLink className="w-4 h-4" />
              LIHAT SITE
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 pb-32 md:pb-10 max-w-[100vw] overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'circOut' }}
            >
              <div className="mb-6 md:mb-10">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-[0.9] break-words">
                    {activeTab === 'overview' && (<>SYSTEM <span className="text-accent-yellow italic">OVERVIEW</span></>)}
                    {activeTab === 'leads' && (<>INBOUND <span className="text-accent-yellow italic">LEADS</span></>)}
                    {activeTab === 'content_generator' && (<>KONTEN <span className="text-accent-yellow italic">GENERATOR</span></>)}
                    {activeTab === 'articles' && (<>CONTENT <span className="text-accent-yellow italic">ARTICLES</span></>)}
                    {activeTab === 'portfolios' && (<>PROJECT <span className="text-accent-yellow italic">SHOWCASE</span></>)}
                    {activeTab === 'events' && (<>UPCOMING <span className="text-accent-yellow italic">EVENTS</span></>)}
                    {activeTab === 'communities' && (<>USER <span className="text-accent-yellow italic">COMMUNITIES</span></>)}
                    {activeTab === 'links' && (<>MAGIC <span className="text-accent-yellow italic">LINKS</span></>)}
                    {activeTab === 'categories' && (<>CONTENT <span className="text-accent-yellow italic">TAXONOMY</span></>)}
                    {activeTab === 'logos' && (<>CLIENT <span className="text-accent-yellow italic">LOGOS</span></>)}
                    {activeTab === 'settings' && (<>SYSTEM <span className="text-accent-yellow italic">SETTINGS</span></>)}
                    {activeTab === 'subscriptions' && (<>MANAGE <span className="text-accent-yellow italic">SUBSCRIPTIONS</span></>)}
                  </h1>
                  <p className="text-[10px] md:text-sm text-text-secondary font-sans tracking-widest uppercase font-bold text-accent-yellow/60">
                    {activeTab.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {activeTab === 'overview' && <OverviewGrid />}
              {activeTab === 'leads' && <LeadsManager />}
              {activeTab === 'content_generator' && <AdminContentGeneratorUI onGenerateAI={generateAIContent} />}
              {activeTab === 'articles' && <ContentManager type="articles" onGenerateAI={generateAIContent} />}
              {activeTab === 'portfolios' && <ContentManager type="portfolios" onGenerateAI={generateAIContent} />}
              {activeTab === 'events' && <ContentManager type="events" onGenerateAI={generateAIContent} />}
              {activeTab === 'communities' && <CommunityManager />}
              {activeTab === 'links' && <LinksManager />}
              {activeTab === 'categories' && <CategoriesManager />}
              {activeTab === 'logos' && <LogosManager />}
              {activeTab === 'settings' && <SettingsManager />}
              {activeTab === 'subscriptions' && <SubscriptionsManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

function LeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read'>('all');

  const fetchLeads = async () => {
    try {
      const q = query(collection(db, 'leads'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
    } catch (error) {
      console.error('Fetch leads error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Hapus lead ini?')) {
      try {
        await deleteDoc(doc(db, 'leads', id));
        fetchLeads();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
      }
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'leads', id), { is_read: !currentStatus });
      setLeads(leads.map(l => l.id === id ? { ...l, is_read: !currentStatus } : l));
    } catch (err) {
      console.error('Update read status error:', err);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filter === 'new') return !l.is_read;
    if (filter === 'read') return l.is_read;
    return true;
  });

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center">
      <RefreshCw className="w-10 h-10 text-accent-yellow animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">Syncing Leads...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* CRM Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-bg-secondary p-1 rounded-2xl border border-border-subtle w-full md:w-auto">
          {(['all', 'new', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-accent-yellow text-bg-primary" : "text-text-secondary hover:text-white"
              )}
            >
              {f === 'all' ? 'Semua' : f === 'new' ? 'Belum Dibaca' : 'Sudah Dibaca'}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-accent-yellow tracking-widest leading-none mb-1">Lead Health</p>
            <p className="text-[9px] font-bold text-text-secondary uppercase">Response Rate: 92%</p>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-accent-yellow border-t-transparent animate-[spin_3s_linear_infinity]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredLeads.map((lead, i) => (
            <motion.div 
              key={lead.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "relative bg-bg-secondary border p-6 md:p-8 rounded-[2rem] transition-all group overflow-hidden",
                lead.is_read ? "border-border-subtle opacity-70" : "border-accent-yellow/30 shadow-2xl shadow-accent-yellow/5"
              )}
            >
              {!lead.is_read && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/10 blur-[60px] pointer-events-none" />
              )}
              
              <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      lead.is_read ? "bg-bg-tertiary" : "bg-accent-yellow animate-pulse shadow-[0_0_10px_#FACC15]"
                    )} />
                    <span className="px-3 py-1 bg-bg-tertiary text-accent-yellow text-[10px] font-black uppercase rounded-lg border border-border-subtle tracking-widest">{lead.type || 'INQUIRY'}</span>
                    <h4 className="text-xl md:text-2xl font-display font-black tracking-tight">{lead.name}</h4>
                    <span className="text-xs text-text-secondary font-medium tracking-tight opacity-50">{lead.email}</span>
                  </div>
                  
                  <div className="relative group/msg">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/msg:h-full bg-accent-yellow transition-all duration-300 rounded-full" />
                    <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed bg-bg-primary/40 p-6 rounded-2xl border border-border-subtle/50 italic backdrop-blur-sm">
                      "{lead.message}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                    <div className="flex items-center gap-2.5 group/meta">
                      <Clock className="w-3.5 h-3.5 group-hover/meta:text-accent-yellow transition-colors" /> 
                      {formatDate(lead.created_at?.toDate?.() || lead.created_at)}
                    </div>
                    <div className="flex items-center gap-2.5 group/meta">
                      <Briefcase className="w-3.5 h-3.5 group-hover/meta:text-accent-yellow transition-colors" /> 
                      {lead.company || 'Private Party'}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => toggleReadStatus(lead.id, lead.is_read)}
                    className={cn(
                      "flex-1 lg:flex-none p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 group/btn",
                      lead.is_read ? "border-border-subtle text-text-secondary hover:text-white" : "border-accent-yellow/20 bg-accent-yellow/5 text-accent-yellow hover:bg-accent-yellow hover:text-bg-primary"
                    )}
                  >
                    <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                      {lead.is_read ? 'Mark as New' : 'Mark Read'}
                    </span>
                  </button>
                  
                  <a 
                    href={`mailto:${lead.email}`}
                    className="p-4 bg-bg-tertiary border border-border-subtle text-white rounded-2xl hover:border-accent-yellow transition-all flex items-center justify-center"
                    title="Reply via Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>

                  <button 
                    onClick={() => handleDelete(lead.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    title="Hapus Lead"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLeads.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center bg-bg-secondary border-2 border-dashed border-border-subtle rounded-[3rem]"
          >
            <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-8 border border-border-subtle">
              <MessageSquare className="w-8 h-8 text-text-secondary opacity-30" />
            </div>
            <p className="text-text-secondary font-display font-medium text-xl uppercase tracking-widest opacity-40 italic">Data leads kosong.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SettingsManager() {
  const [settings, setSettings] = useState<any>({
    whatsapp: '6289667736500',
    instagram: '',
    email: 'businessdaws@gmail.com',
    address: '',
    maintenance_mode: false,
    promo_text: '',
    running_text_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'site_settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Init default settings if not exists
        await setDoc(docRef, settings);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_settings', 'global'), {
        ...settings,
        updated_at: serverTimestamp()
      }, { merge: true });
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/global');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center uppercase font-black text-text-secondary tracking-widest animate-pulse">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
          <div className="px-8 py-5 bg-bg-tertiary/50 border-b border-border-subtle flex items-center gap-3">
            <Zap className="w-5 h-5 text-accent-yellow" />
            <h3 className="text-sm font-black uppercase tracking-widest">General Configuration</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                  placeholder="e.g. 628123456789"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Instagram URL</label>
                <input 
                  type="text" 
                  value={settings.instagram}
                  onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Business Email</label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Office Address</label>
                <input 
                  type="text" 
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
          <div className="px-8 py-5 bg-bg-tertiary/50 border-b border-border-subtle flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent-yellow" />
            <h3 className="text-sm font-black uppercase tracking-widest">Promotion & UI</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Promo / Running Text</label>
              <textarea 
                rows={3}
                value={settings.promo_text}
                onChange={(e) => setSettings({...settings, promo_text: e.target.value})}
                placeholder="Teks yang akan muncul di running bar..."
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="running-enabled"
                  checked={settings.running_text_enabled}
                  onChange={(e) => setSettings({...settings, running_text_enabled: e.target.checked})}
                />
                <label htmlFor="running-enabled" className="text-xs font-bold uppercase tracking-widest">Enable Running Text</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="maintenance"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                />
                <label htmlFor="maintenance" className="text-xs font-bold uppercase tracking-widest text-red-500">Maintenance Mode</label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-12 py-4 bg-accent-yellow text-bg-primary font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-accent-yellow/20"
          >
            {saving ? 'Saving...' : 'SIMPAN SEMUA PERUBAHAN'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubscriptionsManager() {
  const [settings, setSettings] = useState<any>({
    subscription_price: '0',
    whatsapp: '6289667736500'
  });
  const [profileList, setProfileList] = useState<any[]>([]);
  const [codesList, setCodesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      // 1. Fetch site settings for subscription price
      const settingsSnap = await getDoc(doc(db, 'site_settings', 'global'));
      if (settingsSnap.exists()) {
        const d = settingsSnap.data();
        setSettings({
          subscription_price: d.subscription_price !== undefined ? String(d.subscription_price) : '0',
          whatsapp: d.whatsapp || '6289667736500'
        });
      }

      // 2. Fetch all user profiles
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const profiles = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfileList(profiles);

      // 3. Fetch all activation codes sorted by creation date
      const codesSnapshot = await getDocs(collection(db, 'activation_codes'));
      const codes = codesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      // Sort client side since we don't have secondary indices configured on used fields sometimes
      codes.sort((a,b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setCodesList(codes);
    } catch (err) {
      console.error("Gagal memuat data langganan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'site_settings', 'global'), {
        subscription_price: Number(settings.subscription_price) || 0,
        whatsapp: settings.whatsapp,
        updated_at: serverTimestamp()
      }, { merge: true });
      alert('Harga langganan & nomor WA sukses disimpan!');
    } catch (err) {
      console.error("Gagal simpan setting:", err);
      alert('Gagal simpan setting: ' + (err as any).message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      // Generate unique random code format: DK-AI-XXXX-XXXX
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let part1 = '';
      let part2 = '';
      for (let i = 0; i < 4; i++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const newCode = `DK-AI-${part1}-${part2}`;

      const codeDocRef = doc(db, 'activation_codes', newCode);
      await setDoc(codeDocRef, {
        id: newCode,
        code: newCode,
        is_used: false,
        used_by: null,
        used_by_email: null,
        created_at: new Date().toISOString()
      });

      // Refresh data
      await fetchAllData();
      alert(`Kode aktivasi sukses dibuat: ${newCode}`);
    } catch (err: any) {
      console.error("Gagal generate kode:", err);
      alert('Gagal membuat kode: ' + err.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleTogglePremium = async (userId: string, currentPremium: boolean) => {
    try {
      const userRef = doc(db, 'profiles', userId);
      await updateDoc(userRef, {
        is_premium: !currentPremium,
        premium_code: !currentPremium ? 'MANUAL-ADMIN' : null,
        updated_at: new Date().toISOString()
      });
      await fetchAllData();
    } catch (err: any) {
      console.error("Gagal ubah status premium:", err);
      alert("Gagal mengupdate: " + err.message);
    }
  };

  const handleResetTrials = async (userId: string) => {
    try {
      const userRef = doc(db, 'profiles', userId);
      await updateDoc(userRef, {
        trial_count: 0,
        updated_at: new Date().toISOString()
      });
      await fetchAllData();
      alert("Sisa uji coba sukses di-reset ke 0!");
    } catch (err: any) {
      console.error("Gagal reset uji coba:", err);
      alert("Gagal reset: " + err.message);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("Hapus kode aktivasi ini?")) return;
    try {
      await deleteDoc(doc(db, 'activation_codes', codeId));
      await fetchAllData();
    } catch (err: any) {
      console.error("Gagal hapus kode:", err);
      alert("Gagal hapus kode: " + err.message);
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center uppercase font-black text-text-secondary tracking-widest animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-accent-yellow" />
        Memuat Data Langganan...
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* 1. Kelola Harga Langganan */}
      <div className="bg-bg-secondary border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
        <div className="px-8 py-5 bg-bg-tertiary/50 border-b border-border-subtle flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent-yellow animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Kelola Harga Langganan & Kontak</h3>
        </div>
        <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Harga Langganan (IDR)</label>
              <input 
                type="number" 
                value={settings.subscription_price}
                onChange={(e) => setSettings({...settings, subscription_price: e.target.value})}
                placeholder="e.g. 150000 (0 untuk Free)"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3.5 px-4 outline-none focus:border-accent-yellow text-xs font-sans text-white"
              />
              <p className="text-[9px] text-text-secondary font-bold uppercase mt-1">Gunakan "0" jika masih masa uji coba gratis</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-secondary ml-1">No WhatsApp Admin</label>
              <input 
                type="text" 
                value={settings.whatsapp}
                onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                placeholder="e.g. 6289667736500"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3.5 px-4 outline-none focus:border-accent-yellow text-xs font-sans text-white"
              />
              <p className="text-[9px] text-text-secondary font-bold uppercase mt-1">Format wajib kode negara, contoh: 6289667736500 (bukan 089)</p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={savingSettings}
              className="px-8 py-3 bg-accent-yellow text-bg-primary text-[10px] font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {savingSettings ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* 2. Kelola User Premium (7 Cols) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-bg-secondary border border-border-subtle rounded-3xl overflow-hidden shadow-xl flex flex-col h-[520px]">
          <div className="px-8 py-5 bg-bg-tertiary/50 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-accent-yellow" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Kelola User Premium</h3>
            </div>
            <span className="text-[9px] font-black bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow px-2 py-0.5 rounded-full uppercase">
              {profileList.length} Total
            </span>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {profileList.length === 0 ? (
              <div className="text-center py-10 text-text-secondary text-xs font-bold uppercase">Belum ada user terdaftar.</div>
            ) : (
              profileList.map((p) => {
                const isUserPremium = p.is_premium === true;
                return (
                  <div key={p.id} className="p-4 bg-bg-tertiary/40 border border-border-subtle rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-bg-tertiary/80">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} className="w-10 h-10 rounded-xl object-cover border border-border-subtle/40 bg-bg-secondary shrink-0" alt="" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow font-black text-sm flex items-center justify-center shrink-0">
                          {p.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black uppercase text-white truncate">{p.full_name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                            isUserPremium 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-neutral-800 border-border-subtle text-text-secondary"
                          )}>
                            {isUserPremium ? 'PRO ACCESS' : 'TRIAL USER'}
                          </span>
                          <span className="text-[10px] text-text-secondary font-mono">
                            Trials: <span className="text-white font-bold">{p.trial_count || 0}/3</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleResetTrials(p.id)}
                        className="p-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 border border-border-subtle rounded-lg text-text-secondary hover:text-white transition text-[9px] font-black uppercase tracking-wider"
                      >
                        Reset trial
                      </button>
                      
                      <button 
                        onClick={() => handleTogglePremium(p.id, isUserPremium)}
                        className={cn(
                          "p-1 px-2.5 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all",
                          isUserPremium 
                            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20" 
                            : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20"
                        )}
                      >
                        {isUserPremium ? 'Cabut Pro' : 'Beri Pro'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Kelola Kode Aktivasi (5 Cols) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-bg-secondary border border-border-subtle rounded-3xl overflow-hidden shadow-xl flex flex-col h-[520px]">
          <div className="px-8 py-5 bg-bg-tertiary/50 border-b border-border-subtle flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-accent-yellow" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Generate Kode</h3>
            </div>
            
            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="px-4 py-2 bg-accent-yellow hover:scale-[1.02] active:scale-95 text-bg-primary text-[8px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shrink-0"
            >
              {generatingCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
              GENERATE KODE
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {codesList.length === 0 ? (
              <div className="text-center py-20 text-text-secondary text-xs font-bold uppercase">
                <p>Belum ada kode dibuat.</p>
                <p className="text-[10px] lowercase normal-case mt-1 max-w-xs mx-auto">Klik tombol 'GENERATE KODE' di atas untuk memicu kode token baru.</p>
              </div>
            ) : (
              codesList.map((c) => {
                return (
                  <div key={c.id} className="p-3.5 bg-bg-tertiary/40 border border-border-subtle rounded-2xl flex items-center justify-between gap-3 transition">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tracking-tight uppercase select-all">
                          {c.code}
                        </span>
                        <button 
                          onClick={() => copyCodeToClipboard(c.code)}
                          className="hover:text-accent-yellow text-text-secondary transition"
                        >
                          {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      
                      {c.is_used ? (
                        <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1 truncate">
                          Digunakan: {c.used_by_email || 'User'}
                        </p>
                      ) : (
                        <p className="text-[9px] text-text-secondary uppercase mt-1 flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" />
                          Tersedia
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDeleteCode(c.id)}
                      className="p-1.5 bg-neutral-800 hover:bg-red-500/20 rounded-xl border border-border-subtle text-text-secondary hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', url: '', icon: 'ArrowRight', sort_order: 0, is_active: true });

  const fetchLinks = async () => {
    try {
      const q = query(collection(db, 'useful_links'), orderBy('sort_order', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLinks(data || []);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'useful_links');
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'useful_links', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'useful_links'), {
          ...formData,
          sort_order: links.length,
          created_at: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'useful_links');
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', url: '', icon: 'ArrowRight', sort_order: links.length, is_active: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ 
      title: item.title || item.name || '', 
      url: item.url, 
      icon: item.icon || item.icon_name || 'ArrowRight',
      sort_order: item.sort_order || 0,
      is_active: item.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus link ini?')) {
      try {
        await deleteDoc(doc(db, 'useful_links', id));
        fetchLinks();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `useful_links/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-bg-secondary p-6 border border-border-subtle rounded-xl">
        <div className="text-sm font-bold">{links.length} Total Links</div>
        <button 
          onClick={openAdd}
          className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          TAMBAH LINK
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-bg-tertiary/50 border-b border-border-subtle">
            <tr>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Nama</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">URL</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-bg-tertiary/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{link.title || link.name}</span>
                    {!link.is_active && <span className="px-1.5 py-0.5 rounded bg-bg-tertiary text-[8px] font-black uppercase text-text-secondary border border-border-subtle">Hidden</span>}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-text-secondary max-w-[200px] truncate">{link.url}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(link)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(link.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-display font-black mb-8 uppercase">{editingItem ? 'Edit' : 'Tambah'} Link</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Judul Link</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">URL (Hyperlink)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Urutan</label>
                  <input 
                    type="number" 
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="link-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <label htmlFor="link-active" className="text-[10px] font-black uppercase text-text-secondary">Aktif</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="font-bold text-text-secondary">Batal</button>
                <button type="submit" className="px-8 py-2 bg-accent-yellow text-bg-primary font-black rounded-lg">SIMPAN</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const collections = ['leads', 'articles', 'portfolios'];
      const counts = await Promise.all(collections.map(c => getCountFromServer(collection(db, c))));
      
      const response = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: { 
            leads: counts[0].data().count, 
            articles: counts[1].data().count, 
            portfolios: counts[2].data().count 
          } 
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setInsight(data.text);
    } catch (err: any) {
      console.error('Insight Err:', err);
      setError(err.message || 'Gagal memuat insight AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-3xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden group shadow-2xl shadow-accent-yellow/5"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/10 blur-[100px] group-hover:bg-accent-yellow/20 transition-all duration-1000" />
      <div className="p-4 bg-accent-yellow rounded-2xl shrink-0 shadow-lg shadow-accent-yellow/20 animate-pulse-slow">
        <Sparkles className="w-8 h-8 text-bg-primary" />
      </div>
      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-yellow opacity-80">AI Business Intelligence</h4>
          {!loading && (
            <button 
              onClick={fetchInsight}
              className="text-[10px] font-black uppercase text-accent-yellow/40 hover:text-accent-yellow transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-yellow/40 animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-yellow/40 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-yellow/40 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-sm font-bold text-accent-yellow/40 uppercase tracking-widest animate-pulse">Menganalisa Data...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-500 uppercase tracking-tight mb-1">AI Service Error</p>
              <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
              <button 
                onClick={fetchInsight}
                className="mt-3 px-4 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-white hover:text-red-500 transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <p className="text-base md:text-xl font-display font-medium leading-relaxed text-white group-hover:text-accent-yellow transition-colors duration-500">
            "{insight || 'Terus update konten terbaru untuk meningkatkan engagement pengunjung.'}"
          </p>
        )}
      </div>
    </motion.div>
  );
}

function OverviewGrid() {
  const [counts, setCounts] = useState({ articles: 0, events: 0, portfolios: 0, links: 0, categories: 0, logos: 0, leads: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collectionsList = ['articles', 'events', 'portfolios', 'useful_links', 'categories', 'client_logos', 'leads'];
        const results = await Promise.allSettled(
          collectionsList.map(name => getCountFromServer(collection(db, name)))
        );

        const newCounts = { ...counts };
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const name = collectionsList[index];
            (newCounts as any)[name === 'useful_links' ? 'links' : name === 'client_logos' ? 'logos' : name] = result.value.data().count;
          }
        });
        setCounts(newCounts);
      } catch (err) {
        console.error('Fetch counts error:', err);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: 'Total Artikel', value: counts.articles, icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: '+12%' },
    { label: 'Event Aktif', value: counts.events, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'Stable' },
    { label: 'Project Showcase', value: counts.portfolios, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+5%' },
    { label: 'Inbound Leads', value: counts.leads, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+28%' },
  ];

  const chartData = [
    { name: 'Mon', articles: 4, portfolios: 5, active: 30 },
    { name: 'Tue', articles: 7, portfolios: 8, active: 45 },
    { name: 'Wed', articles: 5, portfolios: 12, active: 62 },
    { name: 'Thu', articles: 9, portfolios: 7, active: 58 },
    { name: 'Fri', articles: 12, portfolios: 15, active: 85 },
    { name: 'Sat', articles: 8, portfolios: 10, active: 90 },
    { name: 'Sun', articles: 11, portfolios: 14, active: 110 },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <DashboardInsight />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:border-accent-yellow/50 transition-all shadow-xl shadow-black/20 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-bg-tertiary ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-[8px] md:text-[10px] font-black flex items-center gap-1 uppercase tracking-widest whitespace-nowrap",
                  stat.trend.includes('+') ? "text-green-500" : "text-text-secondary"
                )}>
                  {stat.trend.includes('+') && <ArrowUpRight className="w-3 h-3" />} {stat.trend}
                </span>
                <span className="text-[8px] md:text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em] mt-1">Growth</span>
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 md:mb-2 opacity-50">{stat.label}</p>
              <h3 className="text-3xl md:text-5xl font-display font-black tracking-tighter group-hover:text-accent-yellow transition-colors">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-secondary border border-border-subtle rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight">Growth <span className="text-accent-yellow italic">Analytics</span></h3>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary mt-2 opacity-50">Laporan performa konten mingguan</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-bg-tertiary/50 border border-border-subtle rounded-xl">
                <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                <span className="text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest">Articles</span>
              </div>
              <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-bg-tertiary/50 border border-border-subtle rounded-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest">Projects</span>
              </div>
            </div>
          </div>
          
          <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D2D2D" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '20px', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="articles" stroke="#FACC15" strokeWidth={4} fillOpacity={1} fill="url(#colorArt)" />
                <Area type="monotone" dataKey="portfolios" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorProj)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-black uppercase tracking-tight">System <span className="text-accent-yellow italic">Status</span></h3>
            <div className="w-8 h-8 rounded-xl bg-accent-yellow/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-yellow" />
            </div>
          </div>
          
          <div className="flex-1 space-y-8">
            {[
              { label: 'Database Sync', value: 'Live', score: 100, color: 'bg-green-500' },
              { label: 'API Utilization', value: '42%', score: 42, color: 'bg-accent-yellow' },
              { label: 'AI Readiness', value: 'Optimal', score: 100, color: 'bg-blue-500' },
              { label: 'System Cache', value: '184 MB', score: 75, color: 'bg-purple-500' },
            ].map((metric, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">{metric.label}</span>
                  <span className="text-xs font-black text-white">{metric.value}</span>
                </div>
                <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ duration: 1.5, delay: i * 0.2, ease: 'circOut' }}
                    className={`h-full ${metric.color} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t border-border-subtle">
            <button className="w-full py-5 bg-bg-tertiary/50 border border-border-subtle rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:border-accent-yellow hover:bg-bg-tertiary transition-all group">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-1000" />
              Recalibrate Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', type: 'artikel', description: '', icon: '', color: '#FACC15' });

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'categories');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'categories', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'categories'), { ...formData, created_at: serverTimestamp() });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', slug: '', type: 'artikel', description: '', icon: '', color: '#FACC15' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, slug: item.slug, type: item.type, description: item.description || '', icon: item.icon || '', color: item.color || '#FACC15' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus kategori ini?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchData();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-bg-secondary p-6 border border-border-subtle rounded-xl">
        <div className="text-sm font-bold">{categories.length} Total Kategori</div>
        <button onClick={openAdd} className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center gap-2 transition-transform hover:scale-105">
          <Plus className="w-5 h-5" /> TAMBAH KATEGORI
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-bg-tertiary/50 border-b border-border-subtle">
            <tr>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Nama</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Tipe</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-bg-tertiary/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold">{cat.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm uppercase font-black text-text-secondary">{cat.type}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-display font-black mb-8 uppercase">{editingItem ? 'Edit' : 'Tambah'} Kategori</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary">Nama</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary">Slug</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Tipe Konten</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow">
                  <option value="artikel">Artikel</option>
                  <option value="layanan">Layanan</option>
                  <option value="portofolio">Portofolio</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Warna</label>
                <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full h-10 bg-bg-tertiary border border-border-subtle rounded-lg p-1 outline-none" />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="font-bold text-text-secondary">Batal</button>
                <button type="submit" className="px-8 py-2 bg-accent-yellow text-bg-primary font-black rounded-lg">SIMPAN</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LogosManager() {
  const [logos, setLogos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ company_name: '', logo_url: '', website_url: '', sort_order: 0, is_active: true });
  
  const [partnerTitle, setPartnerTitle] = useState('PROJECT AND COLLABORATION');
  const [savingTitle, setSavingTitle] = useState(false);

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'client_logos'), orderBy('sort_order', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogos(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'client_logos');
    }
  };

  const fetchTitle = async () => {
    try {
      const docRef = doc(db, 'site_settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.partner_title) {
          setPartnerTitle(data.partner_title);
        }
      }
    } catch (err) {
      console.error('Error fetching partner title:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTitle();
  }, []);

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTitle(true);
    try {
      const docRef = doc(db, 'site_settings', 'global');
      await setDoc(docRef, { partner_title: partnerTitle }, { merge: true });
      alert('Teks Heading Marquee berhasil diperbarui!');
    } catch (err) {
      console.error('Error saving partner title:', err);
      alert('Gagal memperbarui teks heading.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleLogoUploadInManager = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB Limit
      alert('Ukuran file terlalu besar! Maksimal 1MB untuk performa terbaik.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'client_logos', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'client_logos'), { ...formData, created_at: serverTimestamp() });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'client_logos');
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ company_name: '', logo_url: '', website_url: '', sort_order: logos.length, is_active: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ company_name: item.company_name, logo_url: item.logo_url, website_url: item.website_url || '', sort_order: item.sort_order || 0, is_active: item.is_active ?? true });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus logo ini?')) {
      try {
        await deleteDoc(doc(db, 'client_logos', id));
        fetchData();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `client_logos/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Configure Heading */}
      <div className="bg-bg-secondary border border-border-subtle p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-accent-yellow" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Headline Banner Marquee</h3>
        </div>
        <form onSubmit={handleSaveTitle} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black uppercase text-text-secondary">Text Headline Partner & Brand</label>
            <input 
              type="text" 
              value={partnerTitle} 
              onChange={(e) => setPartnerTitle(e.target.value)} 
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-sm text-white" 
              placeholder="e.g. PROJECT AND COLLABORATION"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={savingTitle} 
            className="w-full sm:w-auto px-6 py-3.5 bg-accent-yellow text-bg-primary font-black rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {savingTitle ? 'Menyimpan...' : 'Perbarui Teks'}
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center bg-bg-secondary p-6 border border-border-subtle rounded-xl">
        <div className="text-sm font-bold">{logos.length} Total Logo</div>
        <button onClick={openAdd} className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center gap-2 transition-transform hover:scale-105">
          <Plus className="w-5 h-5" /> TAMBAH LOGO
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {logos.map((logo) => (
          <div key={logo.id} className="bg-bg-secondary border border-border-subtle p-4 rounded-xl relative group">
            <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center p-4 mb-3">
              <img src={logo.logo_url} alt={logo.company_name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider truncate mb-2">{logo.company_name}</div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(logo)} className="flex-1 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">Edit</button>
              <button onClick={() => handleDelete(logo.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {logos.length === 0 && <div className="col-span-full py-20 text-center italic text-text-secondary">Belum ada logo klien.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-display font-black mb-6 uppercase">{editingItem ? 'Edit' : 'Tambah'} Logo</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Nama Perusahaan / Brand</label>
                <input type="text" required value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" placeholder="e.g. Realme" />
              </div>

              {/* Logo Upload & URL Options */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-text-secondary">Logo Brand (PNG/JPG)</label>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-text-secondary uppercase">Opsi 1: Upload PNG / JPG</p>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUploadInManager}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-bg-tertiary border-2 border-dashed border-border-subtle rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-2 group-hover:border-accent-yellow transition-all">
                        <Upload className="w-5 h-5 text-text-secondary group-hover:text-accent-yellow" />
                        <span className="text-[11px] font-bold text-text-secondary">Pilih File Logo PNG</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-text-secondary uppercase">Opsi 2: Link URL Gambar</p>
                    <input 
                      type="text" 
                      value={formData.logo_url} 
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})} 
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow text-xs" 
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                {formData.logo_url && (
                  <div className="p-4 bg-bg-tertiary border border-border-subtle rounded-xl flex flex-col items-center gap-2">
                    <p className="text-[9px] font-bold text-text-secondary uppercase">Preview Logo:</p>
                    <div className="w-24 h-24 bg-white/5 p-2 rounded-lg flex items-center justify-center">
                      <img src={formData.logo_url} className="max-w-full max-h-full object-contain" alt="Preview logo" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary">Urutan</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="logo-active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <label htmlFor="logo-active" className="text-[10px] font-black uppercase">Aktif</label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="font-bold text-text-secondary">Batal</button>
                <button type="submit" className="px-8 py-2 bg-accent-yellow text-bg-primary font-black rounded-lg">SIMPAN</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityManager() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', url: '', platform: 'WhatsApp', member_count: '', 
    description: '', image_url: '', is_active: true 
  });

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'communities'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunities(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'communities');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'communities', editingItem.id), {
          ...formData,
          updated_at: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'communities'), {
          ...formData,
          created_at: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'communities');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', url: '', platform: 'WhatsApp', member_count: '', description: '', image_url: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, 
      url: item.url, 
      platform: item.platform || 'WhatsApp',
      member_count: item.member_count || '',
      description: item.description || '',
      image_url: item.image_url || '',
      is_active: item.is_active ?? true 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus komunitas ini?')) {
      try {
        await deleteDoc(doc(db, 'communities', id));
        fetchData();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `communities/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-bg-secondary p-6 border border-border-subtle rounded-xl">
        <div className="text-sm font-bold">{communities.length} Total Komunitas</div>
        <button onClick={openAdd} className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> TAMBAH KOMUNITAS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((item) => (
          <div key={item.id} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 hover:border-accent-yellow transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-bg-tertiary rounded-xl border border-border-subtle overflow-hidden">
                <img src={item.image_url || `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-accent-yellow transition-colors">{item.name}</h4>
                <p className="text-[10px] text-accent-yellow font-black uppercase tracking-wider">{item.platform}</p>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-wider">{item.member_count || 'Private'} Members</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary line-clamp-2 mb-6 h-8">{item.description || 'No description available.'}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(item)} className="flex-1 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {communities.length === 0 && <div className="col-span-full py-20 text-center italic text-text-secondary border border-dashed border-border-subtle rounded-2xl">Belum ada komunitas terdaftar.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-display font-black mb-8 uppercase">{editingItem ? 'Edit' : 'Tambah'} Komunitas</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Nama Komunitas</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary">Platform</label>
                  <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow">
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Discord">Discord</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary">Jumlah Member</label>
                  <input type="text" placeholder="e.g. 500+" value={formData.member_count} onChange={(e) => setFormData({...formData, member_count: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">URL Join</label>
                <input type="text" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Image URL</label>
                <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Deskripsi Singkat</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="comm-active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                <label htmlFor="comm-active" className="text-[10px] font-black uppercase">Aktif</label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="font-bold text-text-secondary">Batal</button>
                <button type="submit" disabled={loading} className="px-8 py-2 bg-accent-yellow text-bg-primary font-black rounded-lg uppercase text-xs">
                  {loading ? 'Simpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentManager({ type, onGenerateAI }: { type: 'articles' | 'events' | 'portfolios', onGenerateAI?: (p: string, c: string) => Promise<string> }) {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pub' | 'draft'>('all');
  
  const getInitialFormData = () => {
    switch (type) {
      case 'articles':
        return { 
          title: '', slug: '', content: '', is_published: false,
          category_id: '', cover_image: '', author: 'Admin Davs', excerpt: '', tags: []
        };
      case 'events':
        return { 
          title: '', date: '', location: '', type: 'online', 
          price: 'Free', image_url: '', is_published: true, content: '',
          description: '', category: '', link: ''
        };
      case 'portfolios':
        return { 
          title: '', category: '', image_url: '', video_url: '',
          type: 'photo', is_published: true, description: '', client_name: '' 
        };
      default:
        return {};
    }
  };

  const getYouTubeID = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB Limit
      alert('Ukuran file terlalu besar! Maksimal 1MB untuk performa terbaik.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [field]: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const [formData, setFormData] = useState<any>(getInitialFormData());

  const fetchData = async () => {
    try {
      // Fetch Items
      const q = query(collection(db, type), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        created_at: (doc.data() as any).created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      setItems(data || []);

      // Fetch Categories for dropdowns
      const cq = query(collection(db, 'categories'), where('type', '==', type === 'articles' ? 'artikel' : 'portofolio'));
      const cSnapshot = await getDocs(cq);
      setCategories(cSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, type);
    }
  };

  useEffect(() => {
    fetchData();
    setFormData(getInitialFormData());
  }, [type]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Default payload
    const payload = { ...formData };
    
    // Enrich with Category Name if ID exists (for easier frontend filtering)
    if (type === 'articles' && formData.category_id) {
      const cat = categories.find(c => c.id === formData.category_id);
      if (cat) payload.category = cat.name;
    }

    if (type === 'events') {
      const desc = formData.content || formData.description || '';
      payload.description = desc;
      payload.content = desc;
    }
    
    try {
      if (editingItem) {
        await updateDoc(doc(db, type, editingItem.id), {
          ...payload,
          updated_at: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, type), {
          ...payload,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(getInitialFormData());
      await fetchData();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, type);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pub' && item.is_published) || 
                         (statusFilter === 'draft' && !item.is_published);
    return matchesSearch && matchesStatus;
  });

  const openAdd = () => {
    setEditingItem(null);
    setFormData(getInitialFormData());
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const initial = getInitialFormData();
    const data: any = {};
    Object.keys(initial).forEach(key => {
      data[key] = item[key] ?? (initial as any)[key];
    });
    if (type === 'events') {
      const desc = item.description || item.content || '';
      data.description = desc;
      data.content = desc;
    }
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus konten ini?')) {
      try {
        await deleteDoc(doc(db, type, id));
        fetchData();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${type}/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-bg-secondary p-6 border border-border-subtle rounded-xl items-center">
        <div className="md:col-span-5 relative">
          <input 
            type="text"
            placeholder="Cari judul atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-accent-yellow text-sm"
          />
          <LayoutDashboard className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="md:col-span-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2.5 px-4 outline-none focus:border-accent-yellow text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pub">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button 
            onClick={openAdd}
            className="w-full md:w-auto px-6 py-2.5 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform text-sm"
          >
            <Plus className="w-5 h-5" />
            TAMBAH {type.toUpperCase().slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-bg-tertiary/50 border-b border-border-subtle">
              <tr>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary w-16">Preview</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Judul / Nama</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Tanggal</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-bg-tertiary/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-12 h-12 rounded-lg bg-bg-tertiary border border-border-subtle overflow-hidden">
                      <img 
                        src={item.image_url || item.cover_image || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-white group-hover:text-accent-yellow transition-colors">{item.title}</div>
                    {item.slug && <div className="text-xs text-text-secondary mt-1">/{item.slug}</div>}
                    {item.category && <div className="text-[10px] text-accent-yellow mt-1 uppercase font-black">{item.category}</div>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      item.is_published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {item.is_published ? 'Pub' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-text-secondary font-medium">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(item)}
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border-subtle">
           {filteredItems.map((item) => (
             <div key={item.id} className="p-4 flex gap-4 items-start active:bg-bg-tertiary/20">
               <div className="w-20 h-20 shrink-0 rounded-xl bg-bg-tertiary border border-border-subtle overflow-hidden">
                  <img 
                    src={item.image_url || item.cover_image || 'https://via.placeholder.com/150'} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                  />
               </div>
               <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded bg-bg-tertiary text-[8px] font-black uppercase ${item.is_published ? 'text-green-500' : 'text-yellow-500'}`}>
                      {item.is_published ? 'Pub' : 'Draft'}
                    </span>
                    <span className="text-[8px] font-black uppercase text-text-secondary">{formatDate(item.created_at)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate mb-1">{item.title}</h4>
                  {item.category && <p className="text-[10px] text-accent-yellow font-black uppercase mb-3">{item.category}</p>}
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEdit(item)}
                      className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
             </div>
           ))}
        </div>

        {items.length === 0 && (
          <div className="px-8 py-20 text-center text-text-secondary font-medium italic">
            Belum ada data tersedia.
          </div>
        )}
      </div>

      {/* Flexible Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-display font-black mb-8 uppercase">
              {editingItem ? 'Edit' : 'Tambah'} {type === 'articles' ? 'Artikel' : type === 'events' ? 'Event' : 'Portofolio'}
            </h3>
            <form onSubmit={handleSave} className="space-y-6 relative">
              {isGenerating && (
                <div className="absolute inset-0 z-50 bg-bg-secondary/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-yellow animate-pulse">AI is Thinking...</p>
                </div>
              )}
              {/* Common Field: Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Judul / Nama Proyek</label>
                  {onGenerateAI && (
                    <button 
                      type="button"
                      onClick={async () => {
                        setIsGenerating(true);
                        const res = await onGenerateAI('Buatkan judul yang menarik dan SEO friendly untuk konten ini', formData.content || formData.description || 'Belum ada konten');
                        setFormData({ ...formData, title: res.replace(/"/g, '') });
                        setIsGenerating(false);
                      }}
                      className="text-[10px] flex items-center gap-1 font-black text-accent-yellow hover:text-white transition-colors uppercase"
                    >
                      <Sparkles className="w-3 h-3" /> Auto Judul
                    </button>
                  )}
                </div>
                <input 
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                />
              </div>

              {type === 'articles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Kategori</label>
                    <select 
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Tags (Pisahkan koma)</label>
                    <input 
                      type="text" 
                      placeholder="Desain, Tech, Tips" 
                      value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                      onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map((t: string) => t.trim())})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                </div>
              )}

              {type === 'articles' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Slug</label>
                    <input 
                      type="text" required value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Penulis</label>
                    <input 
                      type="text" required value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                </div>
              )}

              {type === 'articles' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Ringkasan (Excerpt)</label>
                    {onGenerateAI && (
                      <button 
                        type="button"
                        onClick={async () => {
                          setIsGenerating(true);
                          const res = await onGenerateAI('Buatkan ringkasan singkat (maks 150 karakter) dari konten ini', formData.content || 'Belum ada konten');
                          setFormData({ ...formData, excerpt: res });
                          setIsGenerating(false);
                        }}
                        className="text-[10px] flex items-center gap-1 font-black text-accent-yellow hover:text-white transition-colors uppercase"
                      >
                        <Sparkles className="w-3 h-3" /> Auto Ringkasan
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={3} value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Tulis ringkasan artikel..."
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all text-sm"
                  />
                </div>
              )}
              {type === 'events' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Tanggal Event</label>
                    <input 
                      type="text" required placeholder="12 Juli 2024" value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Tipe</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Lokasi</label>
                    <input 
                      type="text" required placeholder="Jakarta / Zoom" value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Harga</label>
                    <input 
                      type="text" required placeholder="Free / Rp 100.000" value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Kategori Event</label>
                    <input 
                      type="text" required placeholder="e.g. AI & Tech / Design / Web Dev" value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Link Pendaftaran (RSVP Link)</label>
                    <input 
                      type="text" placeholder="e.g. https://..." value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                </div>
              )}

              {type === 'portfolios' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Media Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    >
                      <option value="photo">Photo / Project</option>
                      <option value="video">Video Reel</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Nama Klien</label>
                    <input 
                      type="text" placeholder="Optional" value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                </div>
              )}

              {type === 'portfolios' && formData.type === 'video' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Video URL (YouTube/Vimeo)</label>
                    <input 
                      type="text" placeholder="https://youtube.com/watch?v=..." value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    />
                    <p className="text-[10px] text-text-secondary italic ml-1">Masukkan link video YouTube atau Vimeo untuk ditampilkan di portofolio.</p>
                  </div>
                  
                  {getYouTubeID(formData.video_url) && (
                    <div className="bg-bg-tertiary border border-border-subtle rounded-xl overflow-hidden aspect-video">
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeID(formData.video_url)}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">
                  {type === 'articles' ? 'Gambar Cover' : type === 'events' ? 'Banner Event' : 'Thumbnail / Gambar'}
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase ml-1">Opsi 1: Upload File</p>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, type === 'articles' ? 'cover_image' : 'image_url')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-bg-tertiary border-2 border-dashed border-border-subtle rounded-xl py-8 px-4 flex flex-col items-center justify-center gap-2 group-hover:border-accent-yellow transition-all">
                        <Upload className="w-6 h-6 text-text-secondary group-hover:text-accent-yellow" />
                        <span className="text-xs font-bold text-text-secondary">Pilih Gambar</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase ml-1">Opsi 2: Link URL</p>
                    <input 
                      type="text" placeholder="https://..." value={type === 'articles' ? formData.cover_image : formData.image_url}
                      onChange={(e) => setFormData({...formData, [type === 'articles' ? 'cover_image' : 'image_url']: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 h-[94px] outline-none focus:border-accent-yellow transition-all"
                    />
                  </div>
                </div>

                {(type === 'articles' ? formData.cover_image : formData.image_url) && (
                  <div className="relative group w-full aspect-video md:aspect-[3/1] bg-bg-tertiary border border-border-subtle rounded-2xl overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                      <TrendingUp className="w-12 h-12" />
                    </div>
                    <img 
                      src={type === 'articles' ? formData.cover_image : formData.image_url} 
                      className="relative z-10 w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                    />
                    <button 
                      onClick={() => setFormData({...formData, [type === 'articles' ? 'cover_image' : 'image_url']: ''})}
                      className="absolute top-4 right-4 z-20 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {type === 'articles' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-secondary ml-1">Excerpt</label>
                  <textarea 
                    rows={2} required value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                  />
                </div>
              )}

              {(type === 'articles' || type === 'events' || type === 'portfolios') && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-secondary ml-1">
                    {type === 'articles' ? 'Konten Artikel' : type === 'events' ? 'Deskripsi Event' : 'Deskripsi Proyek'}
                  </label>
                  {type === 'portfolios' ? (
                    <textarea 
                      rows={6} value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all font-sans text-sm"
                    />
                  ) : (
                    <textarea 
                      rows={6} required value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all font-sans text-sm"
                    />
                  )}
                  <p className="text-[10px] text-text-secondary italic ml-1">Gunakan bahasa yang menarik untuk menjelaskan detail konten ini.</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" id="pub" checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                />
                <label htmlFor="pub" className="text-sm font-bold uppercase tracking-widest">Publish</label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-text-secondary">Batal</button>
                <button type="submit" className="px-10 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg">SIMPAN</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CommandPalette({ isOpen, onClose, setActiveTab }: { isOpen: boolean, onClose: () => void, setActiveTab: (t: any) => void }) {
  const [search, setSearch] = useState('');
  
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', category: 'General' },
    { id: 'leads', icon: MessageSquare, label: 'Inbound Leads', category: 'CRM' },
    { id: 'content_generator', icon: Sparkles, label: 'Konten Generator', category: 'Engagement' },
    { id: 'articles', icon: FileText, label: 'Articles & Content', category: 'CMS' },
    { id: 'portfolios', icon: Briefcase, label: 'Portfolios', category: 'CMS' },
    { id: 'events', icon: Calendar, label: 'Events & Programs', category: 'CMS' },
    { id: 'communities', icon: Users, label: 'Communities', category: 'Engagement' },
    { id: 'settings', icon: Settings, label: 'System Settings', category: 'Admin' },
  ];

  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-bg-secondary border border-border-subtle rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] z-10"
      >
        <div className="flex items-center px-5 py-5 md:px-6 md:py-6 bg-bg-tertiary/50 border-b border-border-subtle">
          <Search className="w-5 h-5 md:w-6 md:h-6 text-accent-yellow mr-3 md:mr-4" />
          <input 
            autoFocus
            type="text" 
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-medium text-white placeholder:text-text-secondary/30 font-display"
          />
          <button onClick={onClose} className="p-2 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-[10px] font-black text-text-secondary hover:text-white transition-colors">ESC</button>
        </div>

        <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto overflow-x-hidden">
          {filtered.length > 0 ? (
            <div className="p-3 space-y-4 md:space-y-6">
              {['General', 'CRM', 'CMS', 'Engagement', 'Admin'].map(category => {
                const catItems = filtered.filter(f => f.category === category);
                if (catItems.length === 0) return null;
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="px-4 text-[9px] md:text-[10px] font-black uppercase text-accent-yellow/40 tracking-[0.2em]">{category}</h4>
                    <div className="space-y-1">
                      {catItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            onClose();
                          }}
                          className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl hover:bg-bg-tertiary text-text-secondary hover:text-white transition-all group text-left"
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-bg-primary border border-border-subtle group-hover:border-accent-yellow/30 transition-all">
                            <item.icon className="w-4 h-4 md:w-5 md:h-5 group-hover:text-accent-yellow transition-colors" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-xs md:text-sm leading-none mb-1 md:mb-1.5">{item.label}</p>
                            <p className="text-[9px] md:text-[10px] uppercase font-bold opacity-30 truncate">Navigasi ke dashboard {item.id}</p>
                          </div>
                          <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 md:py-24 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6 border border-border-subtle">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-accent-yellow/30" />
              </div>
              <p className="text-text-secondary text-sm font-medium italic mb-2">Tidak ada hasil ditemukan.</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary/40">Coba kata kunci lain</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 md:px-8 md:py-5 bg-bg-tertiary/80 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 text-[10px] font-black uppercase text-text-secondary/60">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-bg-primary border border-border-subtle rounded leading-none flex items-center gap-1">
                <Command className="w-2 h-2" /> K
              </span>
              <span>Tutup</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="p-1 px-1.5 bg-bg-primary border border-border-subtle rounded leading-none">ENTER</span>
              <span>Pilih</span>
            </div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-accent-yellow/40">Davs Control v2.5</div>
        </div>
      </motion.div>
    </div>
  );
}
