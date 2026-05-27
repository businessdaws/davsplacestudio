import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Film, FileText, Palette, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserDashboardNav({ user }: { user: any }) {
  const location = useLocation();
  const path = location.pathname;
  
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'saved';

  const navItems = [
    { name: 'AI Generator', href: '/dashboard?tab=generator', icon: Sparkles, tab: 'generator' },
    { name: 'Saved Content', href: '/dashboard', icon: LayoutDashboard, tab: 'saved' },
    { name: 'Content Analyzer', href: '/dashboard?tab=analyzer', icon: FileText, tab: 'analyzer' },
    { name: 'Visual Engine', href: '/dashboard?tab=visual-engine', icon: Film, tab: 'visual-engine' },
    { name: 'Creative Editor', href: '/dashboard?tab=editor', icon: Palette, tab: 'editor' },
    { name: 'Virtual Studio', href: '/dashboard?tab=virtual-studio', icon: Camera, tab: 'virtual-studio' },
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
                "flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                isActive
                  ? "bg-accent-yellow border-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/20"
                  : "bg-bg-secondary border-border-subtle text-text-secondary hover:text-white hover:border-accent-yellow/30"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
