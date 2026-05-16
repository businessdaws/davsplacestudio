import { motion } from 'motion/react';
import { MessageSquare, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function CTASection() {
  const { settings } = useSettings();
  
  return (
    <section className="py-24 md:py-32 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative bg-bg-tertiary/50 border border-border-subtle rounded-[2.5rem] p-8 md:p-20 overflow-hidden group">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-yellow/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-accent-yellow/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-16 h-16 bg-accent-yellow rounded-2xl flex items-center justify-center text-bg-primary mb-10 shadow-xl shadow-accent-yellow/20"
            >
              <Target className="w-8 h-8" />
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-display font-black leading-tight uppercase tracking-tighter mb-8 max-w-4xl">
              SIAP MEMBAWA BRAND ANDA KE <span className="text-accent-yellow underline underline-offset-8">LEVEL</span> BERIKUTNYA?
            </h2>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 font-sans leading-relaxed">
              Konsultasikan ide brilian Anda dengan tim ahli kami dan mari kita ciptakan sesuatu yang luar biasa bersama-sama.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a 
                href={`https://wa.me/${settings.whatsapp}?text=Halo Davsplace Studio, saya ingin konsultasi mengenai project saya.`} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-accent-yellow text-bg-primary font-black uppercase rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-105 transition-all text-sm tracking-widest shadow-lg shadow-accent-yellow/20"
              >
                MULAI KONSULTASI
                <MessageSquare className="w-5 h-5" />
              </a>
              
              <a 
                href="mailto:davsplaceindustries@gmail.com?subject=Proposal Proyek - Davsplace Studio"
                className="w-full sm:w-auto px-10 py-5 bg-bg-secondary border border-border-subtle text-text-primary font-black uppercase rounded-2xl flex items-center justify-center gap-3 hover:border-accent-yellow hover:bg-bg-tertiary transition-all text-sm tracking-widest"
              >
                PROPOSAL PROYEK
                <Zap className="w-5 h-5 text-accent-yellow" />
              </a>
            </div>
          </div>

          <div className="absolute bottom-4 right-8 opacity-5 flex items-center gap-2 pointer-events-none">
            <p className="text-[12rem] font-display font-black leading-none">DVS</p>
          </div>
        </div>
      </div>
    </section>
  );
}
