import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Film, FileText, Palette, Camera, BarChart3, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserDashboardNav({ user }: { user: any }) {
  const location = useLocation();
  const path = location.pathname;
  
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'saved';

  const navItems = [
    { name: 'AI Generator', href: '/dashboard?tab=generator', icon: Sparkles, tab: 'generator' },
    { name: 'Content Generator', href: '/dashboard?tab=content-generator', icon: Wand2, tab: 'content-generator' },
    { name: 'Content Analyzer', href: '/dashboard?tab=analyzer', icon: FileText, tab: 'analyzer' },
    { name: 'Visual Engine', href: '/dashboard?tab=visual-engine', icon: Film, tab: 'visual-engine' },
    { name: 'Creative Editor', href: '/dashboard?tab=editor', icon: Palette, tab: 'editor', isBeta: true },
    { name: 'Virtual Studio', href: '/dashboard?tab=virtual-studio', icon: Camera, tab: 'virtual-studio', isBeta: true },
    { name: 'Watermarking', href: '/dashboard?tab=watermarking', icon: Camera, tab: 'watermarking' },
    { name: 'Data Visualizer', href: '/dashboard?tab=visualizer', icon: BarChart3, tab: 'visualizer' },
    { name: 'Saved Content', href: '/dashboard', icon: LayoutDashboard, tab: 'saved' },
  ];


  return (
    <div className="w-full mb-12">
      <div className="flex flex-wrap gap-2 md:gap-4 justify-start items-center">
        {navItems.map((item) => {
          const isActive = path === '/dashboard' && currentTab === item.tab;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest relative overflow-visible",
                isActive
                  ? "bg-accent-yellow border-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/20"
                  : "bg-bg-secondary border-border-subtle text-text-secondary hover:text-white hover:border-accent-yellow/30"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
              {item.isBeta && (
                <span className="text-[7.5px] bg-[#3b82f6]/25 text-[#60a5fa] border border-[#60a5fa]/20 font-black px-1 py-0.2 rounded uppercase tracking-normal">
                  BETA
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
