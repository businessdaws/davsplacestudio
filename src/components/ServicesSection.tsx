import { motion } from 'motion/react';
import { ArrowUpRight, Video, Palette, Camera, LineChart } from 'lucide-react';

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
    <section className="py-32 px-6 bg-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <p className="text-accent-yellow font-bold uppercase tracking-[0.3em] text-xs mb-4">Layanan Kami</p>
            <h2 className="text-5xl md:text-6xl font-display font-black leading-tight">APA YANG BISA KAMI <span className="text-text-secondary italic">BANTU</span></h2>
          </div>
          <p className="text-text-secondary max-w-sm">
            Kami menggabungkan seni desain dan strategi teknologi untuk menciptakan solusi digital yang berdampak nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group relative bg-bg-secondary border border-border-subtle p-8 rounded-2xl overflow-hidden hover:border-accent-yellow transition-all duration-500",
                "hover:-translate-y-2"
              )}
            >
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 rounded-full blur-3xl group-hover:bg-accent-yellow/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-bg-tertiary rounded-xl flex items-center justify-center mb-8 border border-border-subtle group-hover:bg-accent-yellow group-hover:text-bg-primary transition-all duration-300">
                  <service.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-display font-bold mb-4">{service.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-10">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs font-medium text-text-primary">
                      <div className="w-1 h-1 bg-accent-yellow rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center gap-2 text-sm font-bold text-accent-yellow group/btn">
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

import { cn } from '../lib/utils';
