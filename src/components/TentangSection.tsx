import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Github, 
  MessageCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const socials = [
  { 
    name: 'Instagram', 
    icon: Instagram, 
    handle: '@davsplace.studio', 
    color: 'hover:text-[#E4405F]', 
    bg: 'hover:bg-[#E4405F]/10',
    url: 'https://instagram.com/davsplace.studio', 
    preview: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    handle: 'Davsplace Studio', 
    color: 'hover:text-[#FF0000]', 
    bg: 'hover:bg-[#FF0000]/10',
    url: 'https://youtube.com/davsplace', 
    preview: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    name: 'TikTok', 
    icon: MessageCircle, 
    handle: '@davsplace', 
    color: 'hover:text-white', 
    bg: 'hover:bg-white/10',
    url: 'https://tiktok.com/@davsplace', 
    preview: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    name: 'LinkedIn', 
    icon: Linkedin, 
    handle: 'davsplace-studio', 
    color: 'hover:text-[#0A66C2]', 
    bg: 'hover:bg-[#0A66C2]/10',
    url: 'https://linkedin.com/company/davsplace-studio', 
    preview: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=300&h=200&auto=format&fit=crop'
  }
];

import { useSettings } from '../context/SettingsContext';

export default function TentangSection() {
  const [usefulLinks, setUsefulLinks] = useState<any[]>([]);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const q = query(collection(db, 'useful_links'), orderBy('created_at', 'asc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data && data.length > 0) {
          setUsefulLinks(data);
        } else {
          setUsefulLinks([
            { name: 'Portfolio Overview', url: '/portofolio' },
            { name: 'Price List & Services', url: '/kolaborasi' },
            { name: 'Our Blog / Articles', url: '/artikel' },
            { name: 'Business Inquiry', url: 'mailto:hello@davsplace.studio' }
          ]);
        }
      } catch (e) {
        console.error('Fetch links error:', e);
        setUsefulLinks([
          { name: 'Portfolio Overview', url: '/portofolio' },
          { name: 'Price List & Services', url: '/kolaborasi' },
          { name: 'Our Blog / Articles', url: '/artikel' },
          { name: 'Business Inquiry', url: 'mailto:hello@davsplace.studio' }
        ]);
      }
    };
    fetchLinks();
  }, []);

  return (
    <section id="tentang" className="py-16 sm:py-32 px-4 xs:px-6 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 items-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3 sm:mb-4">Tentang Kami</p>
            <h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-display font-black leading-[0.9] mb-6 sm:mb-10 uppercase tracking-tighter">
              WE ARE <br />
              <span className="text-accent-yellow">CREATIVE</span> <br />
              ENGINE.
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-xl font-sans font-medium text-text-secondary">
              Davsplace Studio adalah creative engine yang berfokus pada transformasi digital. Kami membantu brand dan kreator lokal naik kelas melalui desain futuristik, produksi konten premium, dan strategi pemasaran digital yang berdampak nyata. 
            </p>
            
            {/* Quick Link Hub */}
            <div className="mb-10 sm:mb-16">
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-accent-yellow mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-6 sm:w-8 h-px bg-accent-yellow" />
                Useful Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {usefulLinks.map((link, idx) => {
                  const isExternal = link.url.startsWith('https') || link.url.startsWith('mailto:');
                  return isExternal ? (
                    <a 
                      key={idx}
                      href={link.url}
                      target={link.url.startsWith('https') ? "_blank" : undefined}
                      rel={link.url.startsWith('https') ? "noreferrer" : undefined}
                      className="group flex items-center justify-between p-4 sm:p-5 bg-bg-secondary border border-border-subtle rounded-xl sm:rounded-2xl hover:border-accent-yellow transition-all active:scale-[0.98] shadow-sm hover:shadow-accent-yellow/5"
                    >
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{link.title || link.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent-yellow group-hover:translate-x-1 transition-all" />
                    </a>
                  ) : (
                    <Link 
                      key={idx}
                      to={link.url}
                      className="group flex items-center justify-between p-4 sm:p-5 bg-bg-secondary border border-border-subtle rounded-xl sm:rounded-2xl hover:border-accent-yellow transition-all active:scale-[0.98] shadow-sm hover:shadow-accent-yellow/5"
                    >
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{link.title || link.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent-yellow group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-bg-secondary border border-border-subtle rounded-xl">
                <span className="text-accent-yellow font-display font-bold block text-xl sm:text-2xl">2020</span>
                <span className="text-[9px] sm:text-[10px] text-text-secondary uppercase font-bold tracking-widest">Tahun Berdiri</span>
              </div>
              <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-bg-secondary border border-border-subtle rounded-xl">
                <span className="text-accent-yellow font-display font-bold block text-xl sm:text-2xl">500+</span>
                <span className="text-[9px] sm:text-[10px] text-text-secondary uppercase font-bold tracking-widest">Asset Kreatif</span>
              </div>
            </div>
          </motion.div>

          {/* Social Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
            {socials.map((social, i) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative bg-bg-secondary border border-border-subtle rounded-xl sm:rounded-2xl p-5 sm:p-8 overflow-hidden transition-all duration-500 ${social.bg} hover:border-accent-yellow shadow-xl`}
              >
                {/* Background Preview Image */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <img src={social.preview} alt="" className="w-full h-full object-cover grayscale" />
                </div>

                <div className="relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-bg-tertiary rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-border-subtle transition-all duration-300 ${social.color} group-hover:scale-110 shadow-lg`}>
                    <social.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-display font-bold mb-1">{social.name}</h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary font-medium mb-4 sm:mb-6">{social.handle}</p>
                  
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent-yellow">
                    Kunjungi <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Business Collaboration CTA */}
        <motion.div
          id="kolaborasi"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-tertiary border border-border-subtle rounded-2xl sm:rounded-3xl p-6 xs:p-8 sm:p-12 md:p-16 flex flex-col items-center text-center gap-6 sm:gap-8 group hover:border-accent-yellow transition-all duration-500 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-3xl relative z-10">
            <p className="text-accent-yellow font-bold uppercase tracking-[0.4em] text-[9px] sm:text-[10px] mb-4 sm:mb-6">Partnership & Inquiry</p>
            <h3 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-display font-extrabold mb-4 sm:mb-8 tracking-tighter uppercase leading-[1.1] sm:leading-[0.9]">
              LET'S <span className="italic">COLLABORATE</span> ON SOMETHING BIG
            </h3>
            <p className="text-text-secondary text-sm sm:text-lg mb-8 sm:mb-12 leading-relaxed">
              Kami membuka peluang kolaborasi untuk event kreatif, kampanye brand, peluncuran produk inovatif, hingga pembuatan company profile perusahaan yang berkelas dan futuristik. 
              Jadikan brand Anda sebagai pemain utama di industri digital.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <a 
                href={`https://wa.me/${settings.whatsapp}`}
                className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white text-bg-primary font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 hover:bg-accent-yellow transition-all transform active:scale-95"
              >
                MULAI KOLABORASI
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <div className="text-left sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary text-center sm:text-left">Email Response</p>
                <p className="text-xs sm:text-sm font-medium text-center sm:text-left">{settings.email}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
