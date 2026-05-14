import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: authData.user.id, 
              full_name: fullName, 
              role: 'admin' // Set as admin by default for the first user
            }]);
          
          if (profileError) {
            console.error('Profile Error:', profileError);
            throw new Error('User terdaftar tapi gagal membuat profil. Pastikan tabel "profiles" sudah dibuat di Supabase.');
          }
          setSuccess('Akun berhasil dibuat! Silakan cek email atau langsung login.');
          setIsSignUp(false);
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        // Check if user is admin in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user?.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Anda tidak memiliki akses admin atau data profil belum dibuat.');
        }

        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          <h1 className="text-3xl font-display font-black mb-2">{isSignUp ? 'DAFTAR ADMIN' : 'ADMIN LOGIN'}</h1>
          <p className="text-text-secondary text-sm font-medium">Davsplace Studio Management Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-medium text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full bg-bg-tertiary border border-border-subtle py-3 px-4 rounded-xl outline-none focus:border-accent-yellow transition-all"
                placeholder="Davs Admin"
              />
            </div>
          )}

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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'DAFTAR SEKARANG' : 'MASUK KE DASHBOARD')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-text-secondary hover:text-accent-yellow transition-colors"
          >
            {isSignUp ? 'Sudah punya akun? Login di sini' : 'Belum punya akun admin? Daftar Akun Pertama'}
          </button>
        </div>

        <div className="mt-8 text-center text-[8px] text-text-secondary font-bold uppercase tracking-widest opacity-30">
          Davsplace Studio &copy; 2024
        </div>
      </motion.div>
    </div>
  );
}
