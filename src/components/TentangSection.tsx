import { motion } from 'motion/react';
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

export default function TentangSection() {
  return (
    <section id="tentang" className="py-32 px-6 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Tentang Kami</p>
            <h2 className="text-5xl md:text-7xl font-display font-black leading-tight mb-8">
              KAMI ADALAH <br />
              <span className="text-accent-yellow">CREATIVE HUB</span> <br />
              MASA DEPAN
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl">
              Davsplace Studio bukan sekadar agensi kreatif. Kami adalah mitra strategis bagi brand dan kreator yang ingin mendobrak batasan digital melalui estetika futuristik dan teknologi terkini.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 bg-bg-secondary border border-border-subtle rounded-xl">
                <span className="text-accent-yellow font-black block text-2xl">2020</span>
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Tahun Berdiri</span>
              </div>
              <div className="px-6 py-3 bg-bg-secondary border border-border-subtle rounded-xl">
                <span className="text-accent-yellow font-black block text-2xl">500+</span>
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Asset Kreatif</span>
              </div>
            </div>
          </motion.div>

          {/* Social Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                className={`group relative bg-bg-secondary border border-border-subtle rounded-2xl p-8 overflow-hidden transition-all duration-500 ${social.bg} hover:border-accent-yellow shadow-xl`}
              >
                {/* Background Preview Image */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <img src={social.preview} alt="" className="w-full h-full object-cover grayscale" />
                </div>

                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-bg-tertiary rounded-xl flex items-center justify-center mb-6 border border-border-subtle transition-all duration-300 ${social.color} group-hover:scale-110 shadow-lg`}>
                    <social.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-display font-bold mb-1">{social.name}</h4>
                  <p className="text-xs text-text-secondary font-medium mb-6">{social.handle}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-yellow">
                    Kunjungi <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Global Connection CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-tertiary border border-border-subtle rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-accent-yellow transition-all duration-500"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center shrink-0">
              <Github className="w-8 h-8 text-bg-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold">Open for Collaboration</h3>
              <p className="text-text-secondary text-sm">Lihat kode kami atau berkolaborasi di proyek open-source.</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-white text-bg-primary font-black rounded-xl flex items-center gap-3 hover:bg-accent-yellow transition-colors w-full md:w-auto justify-center">
            FOLLOW US ON GITHUB
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
