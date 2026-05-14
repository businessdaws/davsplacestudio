import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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

type Tab = 'overview' | 'articles' | 'events' | 'portfolios' | 'links';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }

      // Re-verify role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        console.error('Permission denied. Profile:', profile, 'Error:', error);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <TrendingUp className="w-10 h-10 text-accent-yellow animate-bounce" />
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
              </h1>
              <p className="hidden md:block text-text-secondary text-sm font-medium">Selamat datang kembali, Admin Davsplace.</p>
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
      </main>
    </div>
  );
}

function LinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', url: '', icon_name: 'ArrowRight' });

  const fetchLinks = async () => {
    const { data } = await supabase.from('useful_links').select('*').order('created_at', { ascending: true });
    setLinks(data || []);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await supabase.from('useful_links').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('useful_links').insert([formData]);
    }
    setIsModalOpen(false);
    fetchLinks();
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', url: '', icon_name: 'ArrowRight' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, url: item.url, icon_name: item.icon_name || 'ArrowRight' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus link ini?')) {
      await supabase.from('useful_links').delete().eq('id', id);
      fetchLinks();
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
                <td className="px-8 py-6 font-bold">{link.name}</td>
                <td className="px-8 py-6 text-sm text-text-secondary">{link.url}</td>
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
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">Nama Link</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">URL (Hyperlink)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-text-secondary">Batal</button>
                <button type="submit" className="px-10 py-3 bg-accent-yellow text-bg-primary font-black rounded-lg">SIMPAN LINK</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewGrid() {
  const [counts, setCounts] = useState({ articles: 0, events: 0, portfolios: 0, links: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [{ count: articles }, { count: events }, { count: portfolios }, { count: links }] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('portfolios').select('*', { count: 'exact', head: true }),
        supabase.from('useful_links').select('*', { count: 'exact', head: true }),
      ]);
      setCounts({
        articles: articles || 0,
        events: events || 0,
        portfolios: portfolios || 0,
        links: links || 0
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: 'Total Artikel', value: counts.articles.toString(), icon: FileText, color: 'text-yellow-500' },
    { label: 'Event Aktif', value: counts.events.toString(), icon: Calendar, color: 'text-purple-500' },
    { label: 'Portofolio', value: counts.portfolios.toString(), icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Useful Links', value: counts.links.toString(), icon: ExternalLink, color: 'text-green-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

function ContentManager({ type }: { type: 'articles' | 'events' | 'portfolios' }) {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const getInitialFormData = () => {
    switch (type) {
      case 'articles':
        return { 
          title: '', slug: '', content: '', is_published: false,
          category: 'Desain', image_url: '', author: 'Admin Davs', excerpt: ''
        };
      case 'events':
        return { 
          title: '', date: '', location: '', type: 'online', 
          price: 'Free', image_url: '', is_published: true, content: ''
        };
      case 'portfolios':
        return { 
          title: '', category: 'Desain', image_url: '', 
          type: 'photo', is_published: true 
        };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState<any>(getInitialFormData());

  const fetchData = async () => {
    const { data } = await supabase.from(type).select('*').order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    fetchData();
    setFormData(getInitialFormData());
  }, [type]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, updated_at: new Date().toISOString() };
    
    if (editingItem) {
      const { error } = await supabase.from(type).update(payload).eq('id', editingItem.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from(type).insert([payload]);
      if (error) alert(error.message);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(getInitialFormData());
    fetchData();
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
      await supabase.from(type).delete().eq('id', id);
      fetchData();
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

              {(type === 'articles' || type === 'portfolios') && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-secondary ml-1">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                    >
                      {['Desain', 'Video', 'Branding', 'Marketing', 'Tech', 'Creative', 'Dokumentasi', 'Konsultasi'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {type === 'portfolios' && (
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
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-secondary ml-1">Image URL</label>
                <input 
                  type="text" required placeholder="https://..." value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow transition-all"
                />
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

              {(type === 'articles' || type === 'events') && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-secondary ml-1">Deskripsi / Konten</label>
                  <textarea 
                    rows={6} required value={formData.content}
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
