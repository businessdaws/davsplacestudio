import { motion } from 'motion/react';
import { ArrowUpRight, Video, Palette, Camera, LineChart } from 'lucide-react';
import { cn } from '../lib/utils';

const services = [
  {
    icon: Palette,
    id: 'design',
    title: 'Desain Grafis',
    description: 'Logo, branding, social media kit, hingga UI/UX design yang memukau.',
    features: ['Branding Identity', 'Social Media Kit', 'UI/UX Design'],
    color: 'border-blue-500/20'
  },
  {
    icon: Video,
    id: 'video',
    title: 'Editing Video',
    description: 'Cinematic editing, motion graphics, dan grading profesional untuk bisnis Anda.',
    features: ['Commercial Ads', 'Cinematic B-Roll', 'Motion Graphics'],
    color: 'border-purple-500/20'
  },
  {
    icon: Camera,
    id: 'photo',
    title: 'Dokumentasi',
    description: 'Fotografi dan videografi event dengan kualitas visual bercerita.',
    features: ['Event Coverage', 'Product Shoots', 'Live Streaming'],
    color: 'border-yellow-500/20'
  },
  {
    icon: LineChart,
    id: 'consult',
    title: 'Konsultasi Brand',
    description: 'Strategi pertumbuhan digital dan personal branding untuk jangka panjang.',
    features: ['Digital Strategy', 'Brand Audit', 'Social Media Management'],
    color: 'border-green-500/20'
  }
];

export default function ServicesSection() {
  return (
    <section className="py-24 md:py-32 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div className="max-w-2xl">
            <p className="text-accent-yellow font-medium uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 font-medium">Layanan Kami</p>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold leading-tight uppercase tracking-tighter">APA YANG BISA KAMI <span className="text-text-secondary">BANTU</span></h2>
          </div>
          <p className="text-text-secondary max-w-sm text-sm md:text-base font-sans">
            Kami menggabungkan seni desain dan strategi teknologi untuk menciptakan solusi digital yang berdampak nyata.
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
              className={cn(
                "group relative bg-bg-secondary border border-border-subtle p-8 rounded-2xl overflow-hidden hover:border-accent-yellow transition-all duration-500",
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
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-text-primary font-sans">
                      <div className="w-1 h-1 bg-accent-yellow rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center gap-2 text-sm font-medium text-accent-yellow group/btn mt-8 font-medium tracking-tight">
                  Lihat Paket
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
