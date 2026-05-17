import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function UserDashboardNav({ user }: { user: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'AI Generator', href: '/generator', icon: Sparkles },
    { name: 'Saved Content', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="w-full mb-12">
      {/* Profile summary for mobile */}
      <div className="flex lg:hidden items-center gap-4 mb-6 p-4 bg-bg-secondary border border-border-subtle rounded-2xl">
        <img 
          src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
          className="w-12 h-12 rounded-full border border-accent-yellow/50"
          alt="Profile"
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-black uppercase text-accent-yellow tracking-widest leading-none mb-1">Signed in as</p>
          <p className="text-sm font-display font-bold uppercase truncate">{user?.displayName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest",
              path === item.href
                ? "bg-accent-yellow border-accent-yellow text-bg-primary shadow-lg shadow-accent-yellow/20"
                : "bg-bg-secondary border-border-subtle text-text-secondary hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
        
        {/* Profile (Desktop) / Info */}
        <div className="hidden md:flex items-center gap-3 px-6 py-4 bg-bg-secondary border border-border-subtle rounded-2xl ml-auto">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-accent-yellow tracking-widest leading-none mb-0.5">{user?.displayName}</p>
            <p className="text-[8px] font-bold text-text-secondary uppercase truncate max-w-[120px]">{user?.email}</p>
          </div>
          <img 
            src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
            className="w-8 h-8 rounded-full border border-accent-yellow/20"
            alt="Profile"
          />
        </div>

        <button
          onClick={handleLogout}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-bg-secondary border border-border-subtle text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
