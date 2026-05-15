import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Video, Palette, Camera, LineChart, X, CheckCircle2, MessageSquare, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const services = [
  {
    icon: Palette,
    id: 'design',
    title: 'Desain Grafis',
    description: 'Logo, branding, social media kit, hingga UI/UX design yang memukau.',
    detailedDescription: 'Kami menciptakan identitas visual yang tidak hanya cantik, tapi juga strategis. Desain kami membantu brand Anda berkomunikasi dengan jelas dan membangun kepercayaan di mata audiens.',
    features: ['Branding Identity', 'Social Media Kit', 'UI/UX Design', 'Logo Design', 'Print Media'],
    benefits: [
      'Identitas brand yang unik dan berkarakter',
      'Desain responsif untuk berbagai platform',
      'Filosofi warna dan tipografi yang tepat',
      'Revisi hingga hasil maksimal'
    ]
  },
  {
    icon: Video,
    id: 'video',
    title: 'Editing Video',
    description: 'Cinematic editing, motion graphics, dan grading profesional untuk bisnis Anda.',
    detailedDescription: 'Ubah rekaman mentah Anda menjadi cerita yang menarik. Dengan teknik cinematic editing dan motion graphics terkini, kami memastikan pesan Anda tersampaikan dengan emosi yang tepat.',
    features: ['Commercial Ads', 'Cinematic B-Roll', 'Motion Graphics', 'Color Grading', 'Subtitle & Transcription'],
    benefits: [
      'Kualitas visual 4K / High Definition',
      'Sound design yang mendalam',
      'Transmisi pesan yang efektif',
      'Optimasi format untuk media sosial'
    ]
  },
  {
    icon: Camera,
    id: 'photo',
    title: 'Dokumentasi',
    description: 'Fotografi dan videografi event dengan kualitas visual bercerita.',
    detailedDescription: 'Setiap momen memiliki cerita unik. Kami hadir untuk menangkap esensi dari setiap acara, produk, atau momen penting Anda dengan sudut pandang yang artistik dan profesional.',
    features: ['Event Coverage', 'Product Shoots', 'Live Streaming', 'Company Profile', 'Wedding & Prewedding'],
    benefits: [
      'Peralatan standar profesional',
      'Tim kreatif berpengalaman',
      'Hasil edit yang clean dan tajam',
      'Penyimpanan cloud yang aman'
    ]
  },
  {
    icon: LineChart,
    id: 'consult',
    title: 'Konsultasi Brand',
    description: 'Strategi pertumbuhan digital dan personal branding untuk jangka panjang.',
    detailedDescription: 'Bukan sekadar desain, kami membantu Anda memetakan arah brand. Dari analisis kompetitor hingga strategi konten, kami pastikan brand Anda relevan di tengah persaingan digital.',
    features: ['Digital Strategy', 'Brand Audit', 'Social Media Management', 'Content Planning', 'SEO Analytics'],
    benefits: [
      'Analisis pasar yang mendalam',
      'Growth hacking strategy',
      'Optimasi channel distribusi',
      'Laporan performa bulanan'
    ]
  }
];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  return (
    <section className="py-24 md:py-32 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div className="max-w-2xl">
            <p className="text-accent-yellow font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4">Layanan Kami</p>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold leading-tight uppercase tracking-tighter">APA YANG BISA KAMI <span className="text-text-secondary">BANTU</span></h2>
          </div>
          <p className="text-text-secondary max-w-sm text-sm md:text-base font-sans">
            Kami menggabungkan seni desain dan strategi teknologi untuk menciptakan solusi digital yang berdampak nyata bagi bisnis Anda.
          </p>
        </div>

        {/* Desktop Grid and Mobile Scroll */}
        <div className="flex overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedService(service)}
              className={cn(
                "group relative bg-bg-secondary border border-border-subtle p-8 rounded-2xl overflow-hidden hover:border-accent-yellow transition-all duration-500 cursor-pointer",
                "hover:-translate-y-2",
                "min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center mr-4 md:mr-0 aspect-[4/5] md:aspect-auto flex flex-col font-sans"
              )}
            >
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 rounded-full blur-3xl group-hover:bg-accent-yellow/10 transition-colors" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-bg-tertiary rounded-xl flex items-center justify-center mb-6 md:mb-8 border border-border-subtle group-hover:bg-accent-yellow group-hover:text-bg-primary transition-all duration-300">
                  <service.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-display font-bold mb-4">{service.title}</h3>
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed mb-6 md:mb-8 font-sans">
                  {service.description}
                </p>

                <ul className="space-y-2 md:space-y-3 mb-auto">
                  {service.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-text-primary font-sans">
                      <div className="w-1 h-1 bg-accent-yellow rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-accent-yellow group/btn mt-8">
                  Detail Layanan
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-secondary border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 z-20 p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border-subtle overflow-y-auto custom-scrollbar">
                {/* Info Panel */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 space-y-8">
                  <div className="w-16 h-16 bg-accent-yellow rounded-2xl flex items-center justify-center text-bg-primary mb-8 shadow-lg shadow-accent-yellow/20">
                    <selectedService.icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4">{selectedService.title}</h3>
                    <p className="text-text-primary text-base md:text-lg leading-relaxed font-sans mb-8">
                      {selectedService.detailedDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-8">
                    <div className="p-4 bg-bg-tertiary rounded-2xl border border-border-subtle">
                      <Zap className="w-5 h-5 text-accent-yellow mb-2" />
                      <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Waktu Pengerjaan</p>
                      <p className="font-bold text-sm">3 - 10 Hari Kerja</p>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-2xl border border-border-subtle">
                      <MessageSquare className="w-5 h-5 text-accent-yellow mb-2" />
                      <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Konsultasi</p>
                      <p className="font-bold text-sm">Gratis 24/7</p>
                    </div>
                  </div>

                  <a 
                    href={`https://wa.me/6285156434442?text=Halo Davsplace Studio, saya tertarik dengan layanan ${selectedService.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 w-full py-4 bg-accent-yellow text-bg-primary font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform text-center uppercase tracking-widest text-sm"
                  >
                    Konsultasi Sekarang
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>

                {/* Features & Benefits Panel */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 bg-bg-tertiary/30 space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-yellow">Fitur & Layanan</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.features.map((feature) => (
                        <span 
                          key={feature}
                          className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-xl text-xs font-bold text-text-primary"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-yellow">Keuntungan Untuk Anda</h4>
                    <ul className="space-y-4">
                      {selectedService.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-sm font-bold text-text-primary font-sans leading-relaxed">
                          <CheckCircle2 className="w-5 h-5 text-accent-yellow shrink-0 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-bg-primary/50 rounded-2xl border border-dashed border-border-subtle flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg-secondary rounded-xl flex items-center justify-center border border-border-subtle shrink-0">
                      <Clock className="w-6 h-6 text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Mulai Hari Ini</p>
                      <p className="text-xs font-medium text-text-primary">Amankan slot pengerjaan Anda sekarang sebelum penuh.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
