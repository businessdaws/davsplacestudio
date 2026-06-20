import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Linkedin, 
  Instagram, 
  Mail, 
  TrendingUp, 
  X, 
  Check, 
  Loader2, 
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Globe,
  PlusCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Prospect {
  id: string;
  prospect_name: string;
  category: string;
  pain_points: string;
  opportunity_rate: string;
  action_plan: string;
  channel_link: string;
  created_at?: any;
}

const INITIAL_PROSPECTS = [
  {
    "prospect_name": "Founder Kripto Lokal & Proyek DeFi/NFT",
    "category": "Eksekutif & Web3",
    "pain_points": "Landing page berjalan lambat, butuh antarmuka UI futuristik yang elegan, dan infrastruktur web yang sangat aman untuk presale.",
    "opportunity_rate": "TINGGI",
    "action_plan": "Mencari posisi 'Project Lead' atau 'Community Manager' di LinkedIn dan Discord komunitas kripto. Tawarkan perombakan mockup web.",
    "channel_link": "https://www.linkedin.com/"
  },
  {
    "prospect_name": "Penyelenggara Masterclass B2B & Konsultan C-Level",
    "category": "Eksekutif & Web3",
    "pain_points": "Membutuhkan landing page penjualan tiket eksklusif yang berwibawa dan sistem manajemen data prospek (leads) yang rapi.",
    "opportunity_rate": "TINGGI",
    "action_plan": "Kurasi iklan workshop berbayar mahal di LinkedIn. Tawarkan perombakan High-Conversion Web Architecture jika web mereka kaku.",
    "channel_link": "https://www.linkedin.com/"
  },
  {
    "prospect_name": "Lembaga Kebudayaan Asing (Goethe-Institut, British Council)",
    "category": "Institusi Asing",
    "pain_points": "Membutuhkan manajemen visual strategis dan dokumentasi premium untuk acara pameran, bukan sekadar liputan foto biasa.",
    "opportunity_rate": "MENENGAH - TINGGI",
    "action_plan": "Kirim proposal 'Strategic Event Documentation' ke email resmi divisi Public Relations atau Press mereka.",
    "channel_link": "https://www.instagram.com/"
  },
  {
    "prospect_name": "Kedutaan Besar (Singapura, Australia, dll)",
    "category": "Institusi Asing",
    "pain_points": "Butuh publikasi visual untuk laporan tahunan, video profil program hibah, atau web inisiatif acara diplomatik.",
    "opportunity_rate": "MENENGAH - TINGGI",
    "action_plan": "Terkoneksi dan kirim pesan ke 'Cultural Attaché' atau 'Public Affairs Officer' melalui LinkedIn.",
    "channel_link": "https://www.linkedin.com/"
  },
  {
    "prospect_name": "Biro Arsitektur Menengah-Atas (Jaksel/Bintaro)",
    "category": "Properti & Arsitektur",
    "pain_points": "Kekurangan video portofolio sinematik dan website galeri elegan untuk menarik calon klien kelas atas/sultan.",
    "opportunity_rate": "MENENGAH",
    "action_plan": "Hubungi Principal Architect via LinkedIn atau DM Instagram. Tunjukkan portofolio tata kota dan arsitektur berkarakter.",
    "channel_link": "https://www.instagram.com/"
  },
  {
    "prospect_name": "Developer Properti Mewah & Boutique Cluster",
    "category": "Properti & Arsitektur",
    "pain_points": "Landing page peluncuran cluster sering lambat, butuh video teaser dramatis dan form pendataan leads yang mulus.",
    "opportunity_rate": "MENENGAH",
    "action_plan": "Pantau iklan Instagram untuk peluncuran properti baru di area ekspansi. Tawarkan pembuatan ekosistem penjualan digital premium.",
    "channel_link": "https://www.instagram.com/"
  },
  {
    "prospect_name": "Peneliti Utama & Pusat Studi Universitas",
    "category": "Akademis",
    "pain_points": "Kesulitan membuat visualisasi data elegan untuk jurnal internasional dan butuh portal web untuk hasil riset lapangan.",
    "opportunity_rate": "MENENGAH",
    "action_plan": "Tawarkan layanan 'Academic Data Visualization' melalui relasi dosen atau langsung kirim penawaran ke email koordinator pusat studi.",
    "channel_link": "https://mail.google.com/"
  }
];

export default function ProspectsManager() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');
  
  // Crud state variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailProspect, setShowDetailProspect] = useState<Prospect | null>(null);

  // Form values
  const [formData, setFormData] = useState({
    prospect_name: '',
    category: '',
    pain_points: '',
    opportunity_rate: 'MENENGAH',
    action_plan: '',
    channel_link: ''
  });

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'prospects');
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Prospect[];

      // Sort client-side so latest is first
      list.sort((a, b) => {
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        return timeB - timeA;
      });

      setProspects(list);

      // Trigger automatic seeding of the database if it is empty on initial load
      if (list.length === 0 && !seeding) {
        await seedDefaultData();
      }
    } catch (err) {
      console.error('Fetch prospects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultData = async () => {
    setSeeding(true);
    try {
      const colRef = collection(db, 'prospects');
      const batch = writeBatch(db);

      INITIAL_PROSPECTS.forEach((item) => {
        // Create random ID matching isValidId constraint
        const randomId = 'prospect_' + Math.random().toString(36).substring(2, 11);
        const docRef = doc(colRef, randomId);
        batch.set(docRef, {
          ...item,
          created_at: new Date()
        });
      });

      await batch.commit();
      
      // Fetch again
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Prospect[];
      
      list.sort((a, b) => {
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        return timeB - timeA;
      });
      
      setProspects(list);
      
      if (typeof window !== 'undefined' && (window as any).showAdminToast) {
        (window as any).showAdminToast('Berhasil menginisialisasi 7 data prospek awal!');
      }
    } catch (err) {
      console.error('Seeding prospects error:', err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedProspect(null);
    setFormData({
      prospect_name: '',
      category: '',
      pain_points: '',
      opportunity_rate: 'MENENGAH',
      action_plan: '',
      channel_link: 'https://'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prospect: Prospect, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProspect(prospect);
    setFormData({
      prospect_name: prospect.prospect_name || '',
      category: prospect.category || '',
      pain_points: prospect.pain_points || '',
      opportunity_rate: prospect.opportunity_rate || 'MENENGAH',
      action_plan: prospect.action_plan || '',
      channel_link: prospect.channel_link || 'https://'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus data prospek ini?')) return;
    
    try {
      const docRef = doc(db, 'prospects', id);
      await deleteDoc(docRef);
      setProspects(prev => prev.filter(p => p.id !== id));
      if (typeof window !== 'undefined' && (window as any).showAdminToast) {
        (window as any).showAdminToast('Prospek berhasil dihapus');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `prospects/${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prospect_name.trim() || !formData.category.trim()) {
      alert('Nama Prospek dan Kategori harus diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const colRef = collection(db, 'prospects');
      
      if (selectedProspect) {
        // Edit flow
        const docRef = doc(db, 'prospects', selectedProspect.id);
        const updateData = {
          prospect_name: formData.prospect_name.trim(),
          category: formData.category.trim(),
          pain_points: formData.pain_points.trim(),
          opportunity_rate: formData.opportunity_rate,
          action_plan: formData.action_plan.trim(),
          channel_link: formData.channel_link.trim()
        };
        await updateDoc(docRef, updateData);
        
        setProspects(prev => prev.map(p => p.id === selectedProspect.id ? { ...p, ...updateData } : p));
        if (typeof window !== 'undefined' && (window as any).showAdminToast) {
          (window as any).showAdminToast('Data prospek berhasil diperbarui');
        }
      } else {
        // Add flow
        const randomId = 'prospect_' + Math.random().toString(36).substring(2, 11);
        const docRef = doc(colRef, randomId);
        const newData = {
          id: randomId,
          prospect_name: formData.prospect_name.trim(),
          category: formData.category.trim(),
          pain_points: formData.pain_points.trim(),
          opportunity_rate: formData.opportunity_rate,
          action_plan: formData.action_plan.trim(),
          channel_link: formData.channel_link.trim(),
          created_at: new Date()
        };
        await addDoc(colRef, newData);
        
        // Refresh full lists to include accurate server timetamps or state
        await fetchProspects();
        
        if (typeof window !== 'undefined' && (window as any).showAdminToast) {
          (window as any).showAdminToast('Prospek baru berhasil ditambahkan');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      const op = selectedProspect ? OperationType.UPDATE : OperationType.CREATE;
      const path = selectedProspect ? `prospects/${selectedProspect.id}` : 'prospects';
      handleFirestoreError(err, op, path);
    } finally {
      setSubmitting(false);
    }
  };

  // Channel link icon selector
  const getChannelIconAndColors = (url: string) => {
    const rawUrl = url?.toLowerCase() || '';
    if (rawUrl.includes('linkedin.com')) {
      return {
        icon: Linkedin,
        bg: 'bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20 hover:bg-[#0077b5] hover:text-white',
        title: 'LinkedIn Network'
      };
    }
    if (rawUrl.includes('instagram.com')) {
      return {
        icon: Instagram,
        bg: 'bg-[#e1306c]/10 text-[#e1306c] border-[#e1306c]/20 hover:bg-[#e1306c] hover:text-white',
        title: 'Instagram Handle'
      };
    }
    if (rawUrl.includes('mail.google.com') || rawUrl.includes('mailto:') || rawUrl.includes('mail')) {
      return {
        icon: Mail,
        bg: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white',
        title: 'Gmail / Email Direct'
      };
    }
    return {
      icon: Globe,
      bg: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow hover:text-bg-primary',
      title: 'Website / External Link'
    };
  };

  // Get Tiers for Opportunity rate
  const getTierInfo = (rate: string) => {
    switch (rate?.toUpperCase()) {
      case 'TINGGI':
        return {
          tier: 'S Tier',
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          badge: 'bg-red-500/20 text-red-400',
          dot: 'bg-red-500'
        };
      case 'MENENGAH - TINGGI':
        return {
          tier: 'A Tier',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400',
          dot: 'bg-amber-500'
        };
      case 'MENENGAH':
        return {
          tier: 'B Tier',
          bg: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
          badge: 'bg-yellow-400/20 text-yellow-400',
          dot: 'bg-yellow-400'
        };
      default:
        return {
          tier: 'C Tier',
          bg: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
          badge: 'bg-blue-400/20 text-blue-400',
          dot: 'bg-blue-400'
        };
    }
  };

  // List of existing categories and rates for dropdown filters
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    prospects.forEach(p => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [prospects]);

  // Filtering + searching logic
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = 
        p.prospect_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.pain_points?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.action_plan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesRate = rateFilter === 'All' || p.opportunity_rate === rateFilter;

      return matchesSearch && matchesCategory && matchesRate;
    });
  }, [prospects, searchQuery, categoryFilter, rateFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = prospects.length;
    const high = prospects.filter(p => p.opportunity_rate === 'TINGGI').length;
    const midHigh = prospects.filter(p => p.opportunity_rate === 'MENENGAH - TINGGI').length;
    const mid = prospects.filter(p => p.opportunity_rate === 'MENENGAH').length;

    return { total, high, midHigh, mid };
  }, [prospects]);

  if (loading && prospects.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-yellow animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-text-secondary">Sinkronisasi Database Prospek...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Dashboard Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-bg-secondary p-5 sm:p-6 rounded-3xl border border-border-subtle relative overflow-hidden group hover:border-accent-yellow/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/5 rounded-full blur-2xl group-hover:bg-accent-yellow/10 transition-colors" />
          <p className="text-[10px] font-black uppercase text-text-secondary tracking-wider mb-2">Total Prospects</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-display font-black text-white">{stats.total}</span>
            <span className="text-[10px] font-black text-accent-yellow uppercase">Leads</span>
          </div>
        </div>

        <div className="bg-bg-secondary p-5 sm:p-6 rounded-3xl border border-border-subtle relative overflow-hidden group hover:border-[#ef4444]/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
          <p className="text-[10px] font-black uppercase text-text-secondary tracking-wider mb-2">S-Tier (Tinggi)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-display font-black text-red-500">{stats.high}</span>
            <span className="text-[10px] font-black text-red-400 uppercase">Critical</span>
          </div>
        </div>

        <div className="bg-bg-secondary p-5 sm:p-6 rounded-3xl border border-border-subtle relative overflow-hidden group hover:border-[#f59e0b]/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <p className="text-[10px] font-black uppercase text-text-secondary tracking-wider mb-2">A-Tier (Menengah-Tinggi)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-display font-black text-amber-500">{stats.midHigh}</span>
            <span className="text-[10px] font-black text-amber-400 uppercase">High</span>
          </div>
        </div>

        <div className="bg-bg-secondary p-5 sm:p-6 rounded-3xl border border-border-subtle relative overflow-hidden group hover:border-yellow-400/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl group-hover:bg-yellow-400/10 transition-colors" />
          <p className="text-[10px] font-black uppercase text-text-secondary tracking-wider mb-2">B-Tier (Menengah)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-display font-black text-yellow-400">{stats.mid}</span>
            <span className="text-[10px] font-black text-yellow-300 uppercase">Medium</span>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter, and Action Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch justify-between bg-bg-secondary/40 p-4 rounded-3xl border border-border-subtle/60">
        
        {/* Search */}
        <div className="flex-1 min-w-0 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Cari prospek, pain points, action plan, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-secondary hover:bg-bg-tertiary/40 focus:bg-bg-secondary border border-border-subtle hover:border-border-subtle/80 focus:border-accent-yellow rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm transition-all placeholder:text-text-secondary/70 "
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          
          <div className="flex items-center bg-bg-secondary border border-border-subtle rounded-2xl px-3 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-accent-yellow/60 tracking-wider">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none outline-none py-3.5 px-2 text-xs font-bold text-white max-w-[150px]"
            >
              <option value="All" className="bg-bg-primary text-white">Semua</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat} className="bg-bg-primary text-white">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-bg-secondary border border-border-subtle rounded-2xl px-3 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-accent-yellow/60 tracking-wider">Tier:</span>
            <select
              value={rateFilter}
              onChange={(e) => setRateFilter(e.target.value)}
              className="bg-transparent border-none outline-none py-3.5 px-2 text-xs font-bold text-white select-none"
            >
              <option value="All" className="bg-bg-primary text-white">Semua</option>
              <option value="TINGGI" className="bg-bg-primary text-white">S Tier (Tinggi)</option>
              <option value="MENENGAH - TINGGI" className="bg-bg-primary text-white">A Tier (Menengah-Tinggi)</option>
              <option value="MENENGAH" className="bg-bg-primary text-white">B Tier (Menengah)</option>
              <option value="RENDAH" className="bg-bg-primary text-white">C Tier (Rendah)</option>
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-5 py-3.5 bg-accent-yellow hover:bg-white text-bg-primary text-xs font-black uppercase rounded-2xl tracking-wider transition-all shadow-lg shadow-accent-yellow/10 shrink-0 flex items-center justify-center gap-2 "
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            PROSPEK BARU
          </button>

        </div>
      </div>

      {seeding && (
        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl p-4 flex items-center gap-3 animate-pulse text-xs text-accent-yellow font-black uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" />
          Sedang menyiapkan data dummy default...
        </div>
      )}

      {/* 3. Responsive Data Table & Card view */}
      {filteredProspects.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden xl:block bg-bg-secondary border border-border-subtle rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-tertiary/20">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary w-[20%]">PROSPECT NAME</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary w-[15%]">TIER / OPPORTUNITY</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary w-[24%]">PAIN POINTS</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary w-[24%]">ACTION PLAN</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary text-center w-[8%]">CHANNEL</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary text-right w-[10%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg-secondary/20">
                  {filteredProspects.map((prospect) => {
                    const tierInfo = getTierInfo(prospect.opportunity_rate);
                    const channelInfo = getChannelIconAndColors(prospect.channel_link);
                    const ChannelIcon = channelInfo.icon;
                    
                    return (
                      <tr 
                        key={prospect.id} 
                        className="hover:bg-bg-tertiary/30 transition-all group cursor-pointer"
                        onClick={() => setShowDetailProspect(prospect)}
                      >
                        {/* Name and Group Category */}
                        <td className="p-6 align-top">
                          <div className="space-y-2">
                            <h4 className="text-white font-display font-bold text-sm tracking-tight leading-snug group-hover:text-accent-yellow transition-colors">{prospect.prospect_name}</h4>
                            <span className="inline-block px-2 py-0.5 bg-bg-tertiary border border-border-subtle text-[9px] uppercase font-black text-text-secondary rounded-md">{prospect.category}</span>
                          </div>
                        </td>

                        {/* Opportunity rate / Tier badge */}
                        <td className="p-6 align-top">
                          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border", tierInfo.bg)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", tierInfo.dot)} />
                            <span>{tierInfo.tier}</span>
                            <span className="text-[8px] opacity-70">({prospect.opportunity_rate})</span>
                          </div>
                        </td>

                        {/* Pain Points */}
                        <td className="p-6 align-top">
                          <p className="text-text-secondary text-xs font-medium leading-relaxed line-clamp-3">
                            {prospect.pain_points || '-'}
                          </p>
                        </td>

                        {/* Action Plan */}
                        <td className="p-6 align-top">
                          <p className="text-text-secondary text-xs font-semibold leading-relaxed line-clamp-3 bg-bg-tertiary/10 p-3 rounded-xl border border-border-subtle/50">
                            {prospect.action_plan || '-'}
                          </p>
                        </td>

                        {/* Channel Icon Clickable to New Tab */}
                        <td className="p-6 align-top text-center" onClick={(e) => e.stopPropagation()}>
                          {prospect.channel_link ? (
                            <a 
                              href={prospect.channel_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              title={channelInfo.title}
                              className={cn("inline-flex w-9 h-9 items-center justify-center rounded-xl border transition-all duration-300", channelInfo.bg)}
                            >
                              <ChannelIcon className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-text-secondary text-xs">-</span>
                          )}
                        </td>

                        {/* CRUD action buttons */}
                        <td className="p-6 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleOpenEditModal(prospect, e)}
                              className="p-2 text-text-secondary hover:text-accent-yellow bg-bg-tertiary hover:bg-bg-tertiary/85 rounded-xl border border-border-subtle transition-all"
                              title="Edit Prospek"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(prospect.id, e)}
                              className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/5 hover:bg-red-500/15 rounded-xl border border-red-500/10 transition-all"
                              title="Hapus Prospek"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card List View */}
          <div className="grid xl:hidden grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProspects.map((prospect) => {
              const tierInfo = getTierInfo(prospect.opportunity_rate);
              const channelInfo = getChannelIconAndColors(prospect.channel_link);
              const ChannelIcon = channelInfo.icon;

              return (
                <div 
                  key={prospect.id}
                  onClick={() => setShowDetailProspect(prospect)}
                  className="bg-bg-secondary p-6 rounded-[2rem] border border-border-subtle flex flex-col justify-between hover:border-accent-yellow transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header: Tier & Channel */}
                    <div className="flex items-center justify-between gap-2 border-b border-border-subtle/50 pb-3">
                      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border", tierInfo.bg)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", tierInfo.dot)} />
                        <span>{tierInfo.tier}</span>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {prospect.channel_link && (
                          <a 
                            href={prospect.channel_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300", channelInfo.bg)}
                            title={channelInfo.title}
                          >
                            <ChannelIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Prospect Name & Category */}
                    <div>
                      <h4 className="text-white font-display font-bold text-base leading-snug group-hover:text-accent-yellow transition-colors mb-1.5">{prospect.prospect_name}</h4>
                      <span className="inline-block px-2.5 py-0.5 bg-bg-tertiary border border-border-subtle text-[8px] uppercase font-black text-text-secondary tracking-widest rounded-md">{prospect.category}</span>
                    </div>

                    {/* Pain Points */}
                    <div className="space-y-1.5">
                      <h5 className="text-[9px] font-black uppercase text-accent-yellow/40 tracking-wider">PAIN POINTS</h5>
                      <p className="text-text-secondary text-xs leading-relaxed line-clamp-3 bg-bg-tertiary/20 p-3 rounded-xl border border-border-subtle/40">
                        {prospect.pain_points || '-'}
                      </p>
                    </div>

                    {/* Action Plan */}
                    <div className="space-y-1.5">
                      <h5 className="text-[9px] font-black uppercase text-accent-yellow/40 tracking-wider">ACTION PLAN</h5>
                      <p className="text-text-secondary text-xs leading-relaxed line-clamp-3 border-l-2 border-accent-yellow pl-3 italic">
                        {prospect.action_plan || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[8px] font-black text-text-secondary uppercase">Click Card for Full Detail</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenEditModal(prospect, e)}
                        className="p-2 text-text-secondary hover:text-accent-yellow bg-bg-tertiary rounded-xl border border-border-subtle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(prospect.id, e)}
                        className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-24 text-center bg-bg-secondary border-2 border-dashed border-border-subtle rounded-[2rem] flex flex-col items-center justify-center">
          <HelpCircle className="w-12 h-12 text-text-secondary opacity-30 mb-4 animate-bounce" />
          <h4 className="text-lg font-display font-medium text-text-secondary uppercase tracking-widest opacity-50 italic">Tidak ada prospek ditemukan</h4>
          <p className="text-xs text-text-secondary/60 mt-1 max-w-sm px-6">Sesuaikan query pencarian atau tambahkan prospek baru melalui tombol di kanan atas.</p>
          <button 
            onClick={seedDefaultData}
            className="mt-6 px-4 py-2 bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-white border border-border-subtle hover:border-accent-yellow transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Inisialisasi 7 Data Default
          </button>
        </div>
      )}

      {/* 4. CRUD Slide-Over Overlay Modal (Add & Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-secondary border border-border-subtle rounded-[2rem] w-full max-w-2xl relative overflow-hidden shadow-2xl z-10 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow border border-accent-yellow/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">
                      {selectedProspect ? 'SUNTING PROSPEK' : 'TAMBAH PROSPEK BARU'}
                    </h3>
                    <p className="text-[9px] font-black uppercase text-accent-yellow tracking-widest leading-none mt-1">Prospect Management Tier List</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-text-secondary hover:text-white bg-bg-tertiary rounded-xl border border-border-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Prospect Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.prospect_name}
                    onChange={(e) => setFormData({ ...formData, prospect_name: e.target.value })}
                    placeholder="e.g. Founder Kripto Lokal / Perusahaan Properti Mewah"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Group / Category <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Eksekutif & Web3, Institusi Asing, Akademis"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Tier / Opportunity Rate <span className="text-red-500">*</span></label>
                    <select
                      value={formData.opportunity_rate}
                      onChange={(e) => setFormData({ ...formData, opportunity_rate: e.target.value })}
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm"
                    >
                      <option value="TINGGI" className="bg-bg-primary text-white">S Tier (Tinggi)</option>
                      <option value="MENENGAH - TINGGI" className="bg-bg-primary text-white">A Tier (Menengah-Tinggi)</option>
                      <option value="MENENGAH" className="bg-bg-primary text-white">B Tier (Menengah)</option>
                      <option value="RENDAH" className="bg-bg-primary text-white">C Tier (Rendah)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Channel Link (URL) <span className="text-text-secondary/50 font-normal">(LinkedIn / Instagram / Email)</span></label>
                  <input 
                    type="url" 
                    value={formData.channel_link}
                    onChange={(e) => setFormData({ ...formData, channel_link: e.target.value })}
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Pain Points <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={3}
                    required
                    value={formData.pain_points}
                    onChange={(e) => setFormData({ ...formData, pain_points: e.target.value })}
                    placeholder="Apa kesulitan, hambatan atau masalah utama digital yang dialami prospek ini?"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-wider">Action Plan <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={3}
                    required
                    value={formData.action_plan}
                    onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                    placeholder="Langkah taktis yang harus diambil untuk mengonversi atau menawarkan value?"
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 outline-none focus:border-accent-yellow text-white text-sm resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-bg-tertiary border border-border-subtle hover:border-text-secondary text-text-secondary hover:text-white transition-all rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    BATAL
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-3 bg-accent-yellow hover:bg-white text-bg-primary transition-all rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent-yellow/10"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {selectedProspect ? 'SIMPAN PERUBAHAN' : 'TAMBAH PROSPEK'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Detailed Read-Only Display Modal */}
      <AnimatePresence>
        {showDetailProspect && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailProspect(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-secondary border border-border-subtle rounded-[2rem] w-full max-w-xl relative overflow-hidden shadow-2xl z-10 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl border", getTierInfo(showDetailProspect.opportunity_rate).bg)}>
                    {getTierInfo(showDetailProspect.opportunity_rate).tier}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary/70">Prospect Profile Detail</span>
                </div>
                <button 
                  onClick={() => setShowDetailProspect(null)}
                  className="p-2 text-text-secondary hover:text-white bg-bg-tertiary rounded-xl border border-border-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">{showDetailProspect.prospect_name}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-bg-tertiary border border-border-subtle text-[10px] uppercase font-black text-accent-yellow tracking-widest rounded-lg">{showDetailProspect.category}</span>
                </div>

                <div className="space-y-2 p-5 bg-bg-tertiary/20 rounded-2xl border border-border-subtle/50">
                  <h4 className="text-[10px] font-black uppercase text-accent-yellow tracking-widest">Pain Points (Masalah Utama)</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">{showDetailProspect.pain_points}</p>
                </div>

                <div className="space-y-2 p-5 bg-bg-tertiary/20 rounded-2xl border border-border-subtle/50">
                  <h4 className="text-[10px] font-black uppercase text-accent-yellow tracking-widest">Action Plan (Tindakan Taktis)</h4>
                  <p className="text-white text-sm leading-relaxed font-semibold">{showDetailProspect.action_plan}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary font-medium uppercase">Koneksi Channel:</span>
                    {showDetailProspect.channel_link ? (
                      <a 
                        href={showDetailProspect.channel_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn("px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border flex items-center gap-2", getChannelIconAndColors(showDetailProspect.channel_link).bg)}
                      >
                        {(() => {
                          const Icon = getChannelIconAndColors(showDetailProspect.channel_link).icon;
                          return <Icon className="w-3.5 h-3.5" />;
                        })()}
                        Buka Link
                      </a>
                    ) : (
                      <span className="text-text-secondary text-xs font-bold font-italic">No channel link</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        setShowDetailProspect(null);
                        handleOpenEditModal(showDetailProspect, e);
                      }}
                      className="px-4 py-2 text-xs font-black uppercase text-white bg-bg-tertiary hover:bg-bg-primary rounded-xl border border-border-subtle transition-all"
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
