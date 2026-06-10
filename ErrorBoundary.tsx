import { motion } from 'motion/react';
import { Instagram, Youtube, Twitter, Mail, MapPin, Phone, Lock, AtSign, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border-subtle pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        {/* Info Col */}
        <div className="col-span-1 md:col-span-1">
          <a href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent-yellow rounded-md flex items-center justify-center font-display font-black text-bg-primary text-lg">
              D
            </div>
            <span className="font-display font-bold text-xl tracking-tighter">
              Davsplace<span className="text-accent-yellow">.Studio</span>
            </span>
          </a>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Transform Your Digital Vision. Platform bisnis digital untuk kreator & brand lokal Indonesia yang mengutamakan kreativitas dan teknologi.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/davsplace.studio" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-accent-yellow hover:bg-accent-yellow/10 transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://www.tiktok.com/@dvs.media?is_from_webapp=1&sender_device=pc" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-accent-yellow hover:bg-accent-yellow/10 transition-all"
            >
              <Video className="w-5 h-5" />
            </a>
            <a 
              href="https://youtube.com/@davsplacestudio?si=bgJZLa7VzaccCkON" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-accent-yellow hover:bg-accent-yellow/10 transition-all"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a 
              href="https://threads.net/@davsplace.studio" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-accent-yellow hover:bg-accent-yellow/10 transition-all"
            >
              <AtSign className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links 1 */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6 uppercase tracking-tight">Navigasi</h4>
          <ul className="space-y-4">
            {[
              { name: 'Beranda', path: '/' },
              { name: 'Artikel', path: '/artikel' },
              { name: 'Portofolio', path: '/portofolio' },
              { name: 'Kolaborasi', path: '/kolaborasi' },
              { name: 'Tentang', path: '/tentang' }
            ].map((link) => (
              <li key={link.name}>
                <a href={link.path} className="text-text-secondary hover:text-accent-yellow transition-colors text-sm">{link.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links 2 */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Layanan</h4>
          <ul className="space-y-4">
            {['Desain Grafis', 'Editing Video', 'Dokumentasi', 'Konsultasi Brand'].map((link) => (
              <li key={link}>
                <a href="#" className="text-text-secondary hover:text-accent-yellow transition-colors text-sm">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Kontak Kami</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent-yellow shrink-0" />
              <span className="text-text-secondary">Jakarta, Indonesia</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-accent-yellow shrink-0" />
              <a href="#" className="text-text-secondary hover:text-accent-yellow transition-colors">+62 822-XXXX-XXXX</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent-yellow shrink-0" />
              <a href="mailto:hello@davsplace.studio" className="text-text-secondary hover:text-accent-yellow transition-colors">hello@davsplace.studio</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary font-medium">
        <p>&copy; {currentYear} Davsplace Studio. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-accent-yellow transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-accent-yellow transition-colors">Kebijakan Privasi</a>
          <Link to="/admin/login" className="flex items-center justify-center p-2 text-text-secondary hover:text-accent-yellow transition-all opacity-20 hover:opacity-100">
            <Lock className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
