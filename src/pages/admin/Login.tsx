import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Loader2, ArrowLeft, Chrome } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session on mount to handle redirect back from OAuth
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setLoading(true);
        try {
          const user = session.user;
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          // Auto-create for known admins
          const adminEmails = ['firdausnatadiwangsa@gmail.com', 'businessdaws@gmail.com', 'admin@davsplace.studio'];
          if ((profileError?.code === 'PGRST116' || !profile) && user.email && adminEmails.includes(user.email)) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{ id: user.id, role: 'admin', full_name: user.user_metadata?.full_name || 'Admin' }])
              .select('role')
              .single();
            if (!createError) {
              profile = newProfile;
              profileError = null;
            }
          }

          if (profileError || profile?.role !== 'admin') {
            await supabase.auth.signOut();
            setError(`Akses Ditolak: Profil admin tidak ditemukan untuk UID ${user.id.slice(0, 8)}...`);
          } else {
            navigate('/admin/dashboard');
          }
        } catch (err: any) {
          console.error('Session check error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      const user = data.user;
      if (!user) throw new Error('User not found after login');

      // Check if user is admin in profiles table
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If no profile exists, and it's a "known" admin email, create it
      const adminEmails = ['firdausnatadiwangsa@gmail.com', 'businessdaws@gmail.com', 'admin@davsplace.studio'];
      if ((profileError?.code === 'PGRST116' || !profile) && user.email && adminEmails.includes(user.email)) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { id: user.id, role: 'admin', full_name: user.user_metadata?.full_name || 'Admin' }
          ])
          .select('role')
          .single();
        
        if (!createError) {
          profile = newProfile;
          profileError = null;
        } else {
          console.error('Failed to create admin profile:', createError);
        }
      }

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        console.error('Profile check failed:', { profileError, profile, userId: user.id });
        throw new Error(`Akses Ditolak: Profil admin tidak ditemukan untuk UID ${user.id.slice(0, 8)}... Pastikan email Anda terdaftar sebagai admin.`);
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/login`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--glow-yellow)_0%,_transparent_70%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-secondary border border-border-subtle p-10 rounded-[1.5rem] shadow-2xl"
      >
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-text-secondary hover:text-accent-yellow transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,197,24,0.3)]">
            <Lock className="w-8 h-8 text-bg-primary" />
          </div>
          <h1 className="text-3xl font-display font-black mb-2">ADMIN LOGIN</h1>
          <p className="text-text-secondary text-sm font-medium">Davsplace Studio Management Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full bg-bg-tertiary border border-border-subtle py-3 pl-11 pr-4 rounded-xl outline-none focus:border-accent-yellow transition-all"
                placeholder="admin@davsplace.studio"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full bg-bg-tertiary border border-border-subtle py-3 pl-11 pr-4 rounded-xl outline-none focus:border-accent-yellow transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-accent-yellow text-bg-primary font-black rounded-xl shadow-xl hover:bg-accent-yellow-bright transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'MASUK KE DASHBOARD'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-bg-secondary px-2 text-text-secondary">Atau</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-bg-tertiary border border-border-subtle text-text-primary font-bold rounded-xl hover:border-accent-yellow transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Chrome className="w-5 h-5" />
                MASUK DENGAN GOOGLE
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center text-[8px] text-text-secondary font-bold uppercase tracking-widest opacity-30">
          Davsplace Studio &copy; 2024
        </div>
      </motion.div>
    </div>
  );
}
