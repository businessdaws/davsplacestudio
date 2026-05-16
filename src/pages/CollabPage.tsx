import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MobileTopbar, MobileBottomNavbar } from '../components/MobileNavigation';
import { useState, useEffect } from 'react';
import SearchModal from '../components/SearchModal';
import { ArrowRight, Users, Zap, Briefcase, Calendar, CheckCircle, Send, Loader2, ArrowUpRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function CollabPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    type: 'Kampanye Brand',
    message: ''
  });

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const q = query(collection(db, 'communities'), where('is_active', '==', true), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        setCommunities(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Fetch communities error:', err);
      } finally {
        setCommunitiesLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        created_at: serverTimestamp(),
        status: 'new'
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
      alert('Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const collabTypes = [
    {
      title: 'Kolaborasi Event',
      desc: 'Partnering untuk penyelenggaraan event kreatif, workshop, atau seminar digital.',
      icon: Calendar
    },
    {
      title: 'Kampanye Brand',
      desc: 'Membangun kampanye digital yang futuristik dan berdampak luas untuk brand Anda.',
      icon: Zap
    },
    {
      title: 'Kolaborasi Produk',
      desc: 'Pengembangan produk digital bersama (Joint venture) atau integrasi layanan.',
      icon: Users
    },
    {
      title: 'Company Profile',
      desc: 'Pembuatan profil perusahaan eksklusif dengan standar desain kelas dunia.',
      icon: Briefcase
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <MobileTopbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="pt-24 pb-20 lg:pb-0">
        <div className="px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tighter uppercase mb-6 leading-none">
              WORK <span className="text-accent-yellow italic">TOGETHER</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl font-sans">
              Kami membuka pintu seluas-luasnya untuk berbagai bentuk kerjasama strategis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Left: Info */}
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {collabTypes.map((type, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-bg-secondary border border-border-subtle rounded-3xl hover:border-accent-yellow transition-all group"
                  >
                    <div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center mb-6">
                      <type.icon className="w-6 h-6 text-accent-yellow" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3 uppercase tracking-tight">{type.title}</h3>
                    <p className="text-sm text-text-secondary font-sans leading-relaxed">{type.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border border-border-subtle rounded-[2rem] bg-bg-tertiary/30">
                <h4 className="text-lg font-display font-bold mb-4 uppercase">Keuntungan Kolaborasi</h4>
                <ul className="space-y-4">
                  {[
                    'Akses ke ekosistem kreatif Davsplace',
                    'Eksekusi teknis dengan standar industri premium',
                    'Strategi pemasaran berbasis data dan tren lokal',
                    'Jaringan distributor dan komunitas yang luas'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                      <CheckCircle className="w-4 h-4 text-accent-yellow shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                  >
                    {/* Background decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                      <h3 className="text-3xl font-display font-black mb-2 uppercase tracking-tighter">AJUKAN PROPOSAL</h3>
                      <p className="text-text-secondary text-sm mb-10 font-sans">Isi formulir di bawah dan tim kami akan segera menghubungi Anda.</p>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Nama Lengkap</label>
                            <input 
                              type="text" required value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl py-4 px-5 outline-none focus:border-accent-yellow transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Email Bisnis</label>
                            <input 
                              type="email" required value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl py-4 px-5 outline-none focus:border-accent-yellow transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Perusahaan / Brand</label>
                            <input 
                              type="text" value={formData.company}
                              onChange={(e) => setFormData({...formData, company: e.target.value})}
                              className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl py-4 px-5 outline-none focus:border-accent-yellow transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Jenis Kolaborasi</label>
                            <select 
                              value={formData.type}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                              className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl py-4 px-5 outline-none focus:border-accent-yellow transition-all appearance-none"
                            >
                              {collabTypes.map(t => <option key={t.title} value={t.title}>{t.title}</option>)}
                              <option value="Lainnya">Lainnya</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Pesan / Visi Kolaborasi</label>
                          <textarea 
                            rows={5} required value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-2xl py-4 px-5 outline-none focus:border-accent-yellow transition-all resize-none"
                            placeholder="Jelaskan sedikit tentang rencana hebat Anda..."
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full py-5 bg-accent-yellow text-bg-primary font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-accent-yellow/20 group"
                        >
                          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                              Kirim Proposal
                              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-bg-secondary border border-border-subtle rounded-[2.5rem] p-12 text-center shadow-2xl h-full flex flex-col items-center justify-center min-h-[500px]"
                  >
                    <div className="w-24 h-24 bg-accent-yellow rounded-full flex items-center justify-center text-bg-primary mb-8 shadow-2xl shadow-accent-yellow/20">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-4xl font-display font-black mb-4 uppercase tracking-tight">Proposal Terkirim!</h3>
                    <p className="text-text-secondary mb-10 font-sans leading-relaxed max-w-sm">Terima kasih atas minat Anda. Tim kami akan meninjau proposal Anda dan menghubungi Anda paling lambat dalam 24 jam.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="px-10 py-4 border border-border-subtle text-text-primary font-bold rounded-2xl hover:border-accent-yellow transition-all"
                    >
                      Kirim Pesan Lain
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* New Community Section */}
          <section className="mt-32">
            <div className="text-center mb-16">
              <p className="text-accent-yellow font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4">Ekosistem Kami</p>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4">JOIN OUR <span className="text-accent-yellow italic underline underline-offset-8">COMMUNITY</span></h2>
              <p className="text-text-secondary max-w-2xl mx-auto font-sans leading-relaxed">Bergabunglah dengan para kreator dan entrepreneur dalam ekosistem kreatif kami untuk bertumbuh bersama.</p>
            </div>

            {communitiesLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-accent-yellow animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {communities.map((community, idx) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-bg-secondary border border-border-subtle rounded-[2rem] overflow-hidden hover:border-accent-yellow transition-all group p-8 flex flex-col h-full"
                  >
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden bg-bg-tertiary shrink-0 border border-border-subtle shadow-xl shadow-black/20">
                        <img 
                          src={community.image_url || `https://ui-avatars.com/api/?name=${community.name}&background=random`} 
                          alt={community.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight leading-tight mb-2 group-hover:text-accent-yellow transition-colors">{community.name}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-accent-yellow bg-accent-yellow/10 px-2.5 py-1 rounded-lg border border-accent-yellow/20">{community.platform}</span>
                          <span className="text-[9px] font-black uppercase text-text-secondary bg-bg-tertiary px-2.5 py-1 rounded-lg">{community.member_count} Members</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 border-t border-dashed border-border-subtle pt-6 mb-8">
                      <p className="text-sm md:text-base text-text-secondary font-sans leading-relaxed line-clamp-3">
                        {community.description || 'Mari berkolaborasi, berbagi insight, dan tumbuh bersama di jaringan kreatif Davsplace Studio.'}
                      </p>
                    </div>

                    <a 
                      href={community.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-accent-yellow text-bg-primary rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:scale-[1.02] active:scale-95 transition-all group/btn shadow-lg shadow-accent-yellow/10"
                    >
                      BERGABUNG SEKARANG
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
            
            {!communitiesLoading && communities.length === 0 && (
              <div className="text-center py-20 bg-bg-secondary/50 rounded-3xl border border-dashed border-border-subtle">
                <Users className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-20" />
                <p className="text-text-secondary font-sans italic">Belum ada komunitas yang tersedia saat ini.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNavbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
