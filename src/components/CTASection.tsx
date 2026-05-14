import { motion } from 'motion/react';
import { Briefcase } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-accent-yellow rounded-2xl p-12 md:p-24 overflow-hidden text-center md:text-left">
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-display font-extrabold text-bg-primary leading-[1.1] mb-6 uppercase tracking-tighter">
                SIAP TRANSFORMASI <br />
                BRAND DIGITALMU?
              </h2>
              <p className="text-bg-primary/70 text-lg md:text-xl font-medium">
                Konsultasi gratis, tanpa komitmen. Tim kami siap membantu mewujudkan visi kreatif Anda menjadi nyata.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
              <a 
                href="https://wa.me/6282200000000" 
                target="_blank"
                rel="noreferrer"
                className="px-8 py-5 bg-bg-primary text-white font-black rounded-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-2xl"
              >
                <div className="w-8 h-8 bg-accent-yellow rounded-lg flex items-center justify-center text-bg-primary">
                  <Briefcase className="w-5 h-5 fill-current" />
                </div>
                HUBUNGI VIA WHATSAPP
              </a>
              <p className="text-center text-bg-primary/50 text-[10px] font-bold uppercase tracking-widest italic">
                Biasanya membalas dalam kurang dari 1 jam
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
