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
  Calendar, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'overview' | 'articles' | 'events' | 'portfolios' | 'links' | 'categories' | 'logos';

// ✅ Matching list from Login.tsx
const ADMIN_EMAILS = [
  'davsplacestudio@gmail.com',
  'businessdaws@gmail.com',
  'admin@davs.studio',
  'fajarmuniri@gmail.com'
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user found in Dashboard, redirecting to login');
        navigate('/admin/login');
        return;
      }

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
    <>
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center font-display font-black text-bg-primary">D</div>
        <span className="font-display font-bold text-lg">Admin<span className="text-accent-yellow">.Studio</span></span>
      </div>

      <nav className="flex-1 space-y-2">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'articles', icon: FileText, label: 'Artikel' },
          { id: 'portfolios', icon: TrendingUp, label: 'Portofolio' },
          { id: 'events', icon: Calendar, label: 'Event' },
          { id: 'links', icon: ExternalLink, label: 'Useful Links' },
          { id: 'categories', icon: Settings, label: 'Kategori' },
          { id: 'logos', icon: Users, label: 'Client Logos' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as Tab);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all active:scale-95 ${
              activeTab === item.id 
                ? 'bg-accent-yellow text-bg-primary' 
                : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-border-subtle space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-text-secondary hover:text-white transition-all active:scale-95">
          <Settings className="w-5 h-5" />
          Pengaturan
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* (1) Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-bg-secondary border-r border-border-subtle flex-col p-6 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* (2) Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-72 bg-bg-secondary border-r border-border-subtle flex flex-col p-6 overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* (3) Main Content */}
      <main className="flex-1 min-h-screen p-4 md:p-10 overflow-y-auto pb-24 md:pb-10">
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-bg-secondary border border-border-subtle rounded-lg active:scale-90 transition-all"
            >
              <LayoutDashboard className="w-6 h-6 text-accent-yellow" />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'articles' && 'Artikel'}
                {activeTab === 'portfolios' && 'Portofolio'}
                {activeTab === 'events' && 'Event'}
                {activeTab === 'links' && 'Useful Links'}
                {activeTab === 'categories' && 'Kategori'}
                {activeTab === 'logos' && 'Client Logos'}
              </h1>
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    dbStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    dbStatus === 'error' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-yellow-500'
                  }`} />
                  <p className="text-text-secondary text-[10px] uppercase font-black tracking-widest">
                    {dbStatus === 'connected' ? 'DB Connected' : 
                     dbStatus === 'error' ? 'DB Connection Error' : 'Checking...'}
                  </p>
                </div>
                {dbStatus === 'error' && (
                  <p className="text-[9px] text-red-500 font-bold mt-1 uppercase leading-tight max-w-[150px]">
                    Cek Supabase / SQL Policy (initial_schema.sql)
                  </p>
                )}
              </div>
            </div>
          </div>
          <button className="p-3 md:px-6 md:py-3 bg-bg-tertiary border border-border-subtle rounded-xl font-bold flex items-center gap-2 hover:border-accent-yellow transition-all active:scale-95">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden md:block">Lihat Site</span>
          </button>
        </header>

        {activeTab === 'overview' && <OverviewGrid />}
        {activeTab === 'articles' && <ContentManager type="articles" />}
        {activeTab === 'portfolios' && <ContentManager type="portfolios" />}
        {activeTab === 'events' && <ContentManager type="events" />}
        {activeTab === 'links' && <LinksManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'logos' && <LogosManager />}
      </main>
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

function OverviewGrid() {
  const [counts, setCounts] = useState({ articles: 0, events: 0, portfolios: 0, links: 0, categories: 0, logos: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collectionsList = ['articles', 'events', 'portfolios', 'useful_links', 'categories', 'client_logos'];
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
    { label: 'Total Artikel', value: counts.articles.toString(), icon: FileText, color: 'text-yellow-500' },
    { label: 'Event Aktif', value: counts.events.toString(), icon: Calendar, color: 'text-purple-500' },
    { label: 'Portofolio', value: counts.portfolios.toString(), icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Useful Links', value: counts.links.toString(), icon: ExternalLink, color: 'text-green-500' },
    { label: 'Kategori', value: counts.categories.toString(), icon: Settings, color: 'text-orange-500' },
    { label: 'Client Logos', value: counts.logos.toString(), icon: Users, color: 'text-pink-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-bg-secondary border border-border-subtle p-6 md:p-8 rounded-2xl hover:border-accent-yellow/50 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 md:p-3 rounded-xl bg-bg-tertiary ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-text-secondary text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 truncate">{stat.label}</p>
          <h3 className="text-xl md:text-3xl font-display font-black">{stat.value}</h3>
        </motion.div>
      ))}
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

  useEffect(() => { fetchData(); }, []);

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
    <div className="space-y-6">
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
          <div className="w-full max-w-md bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-display font-black mb-8 uppercase">{editingItem ? 'Edit' : 'Tambah'} Logo</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Nama Perusahaan</label>
                <input type="text" required value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Logo URL</label>
                <input type="text" required value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 outline-none focus:border-accent-yellow" />
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

function ContentManager({ type }: { type: 'articles' | 'events' | 'portfolios' }) {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
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
          price: 'Free', image_url: '', is_published: true, content: ''
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

  const openAdd = () => {
    setEditingItem(null);
    setFormData(getInitialFormData());
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const data: any = {};
    Object.keys(getInitialFormData()).forEach(key => {
      data[key] = item[key] ?? (getInitialFormData() as any)[key];
    });
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
      <div className="flex justify-between items-center bg-bg-secondary p-6 border border-border-subtle rounded-xl">
        <div className="text-sm font-bold">
          {items.length} Total {type === 'articles' ? 'Artikel' : type === 'events' ? 'Event' : 'Portofolio'}
        </div>
        <button 
          onClick={openAdd}
          className="px-6 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          TAMBAH {type.toUpperCase().slice(0, -1)}
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead className="bg-bg-tertiary/50 border-b border-border-subtle">
              <tr>
                <th className="px-4 md:px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary w-16">Preview</th>
                <th className="px-4 md:px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Judul / Nama</th>
                <th className="px-4 md:px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Status</th>
                <th className="hidden md:table-cell px-4 md:px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary">Tanggal</th>
                <th className="px-4 md:px-8 py-5 text-xs font-black uppercase tracking-widest text-text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-bg-tertiary/30 transition-colors group">
                  <td className="px-4 md:px-8 py-6">
                    <div className="w-12 h-12 rounded-lg bg-bg-tertiary border border-border-subtle overflow-hidden">
                      <img 
                        src={item.image_url || item.cover_image || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                      />
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="font-bold text-white group-hover:text-accent-yellow transition-colors truncate max-w-[200px] md:max-w-none">{item.title}</div>
                    {item.slug && <div className="text-xs text-text-secondary mt-1">/{item.slug}</div>}
                    {item.category && <div className="text-[10px] text-accent-yellow mt-1 uppercase font-black">{item.category}</div>}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className={`px-2 md:px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      item.is_published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {item.is_published ? 'Pub' : 'Draft'}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 md:px-8 py-6 text-sm text-text-secondary font-medium">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 md:px-8 py-6">
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
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-text-secondary font-medium italic">
                    Belum ada data tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
            <form onSubmit={handleSave} className="space-y-6">
              {/* Common Field: Title */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">Judul / Nama Proyek</label>
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
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-secondary ml-1">Video URL (YouTube/Vimeo)</label>
                  <input 
                    type="text" placeholder="https://youtube.com/watch?v=..." value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">Image URL {type === 'portfolios' && '(Thumbnail)'}</label>
                <div className="flex gap-4">
                  <input 
                    type="text" required placeholder="https://..." value={type === 'articles' ? formData.cover_image : formData.image_url}
                    onChange={(e) => setFormData({...formData, [type === 'articles' ? 'cover_image' : 'image_url']: e.target.value})}
                    className="flex-1 bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                  />
                  {(type === 'articles' ? formData.cover_image : formData.image_url) && (
                    <div className="w-12 h-12 rounded-lg border border-border-subtle overflow-hidden bg-white/5">
                      <img src={type === 'articles' ? formData.cover_image : formData.image_url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
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
                  <label className="text-xs font-black uppercase text-text-secondary ml-1">Deskripsi / Konten</label>
                  <textarea 
                    rows={6} required={type !== 'portfolios'} value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all font-mono text-sm"
                  />
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
