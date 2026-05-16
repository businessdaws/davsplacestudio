import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';

// ✅ Daftar email yang diizinkan sebagai admin
const ADMIN_EMAILS = [
  'davsplacestudio@gmail.com',
  'businessdaws@gmail.com',
  'buainessdaws@gmail.com',
  'admin@davs.studio',
  'fajarmuniri@gmail.com'
];

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const syncProfile = async (user: User) => {
    const normalizedEmail = user.email?.toLowerCase();
    const isAdminEmail = normalizedEmail && ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

    // Cek apakah email ada di daftar admin
    if (!isAdminEmail) {
      await signOut(auth);
      setError(`Akses ditolak. Akun ${user.email} tidak terdaftar sebagai admin.`);
      setLoading(false);
      return;
    }

    try {
      // Upsert profile sebagai admin
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        id: user.uid,
        role: 'admin',
        full_name: user.displayName || user.email?.split('@')[0] || 'Admin',
        avatar_url: user.photoURL || '',
        updated_at: serverTimestamp(),
      }, { merge: true });

      // Verifikasi apakah role sudah benar-benar tersimpan
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.data();

      if (profileData?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Data admin gagal divalidasi. Coba login kembali.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Sync Profile Error:', err);
      setError('Gagal sinkronisasi profil: ' + (err.message || 'Coba lagi.'));
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        syncProfile(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncProfile(userCredential.user);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('auth/unauthorized-domain')) {
        setError(
          'DOMAIN TIDAK TEROTORISASI: Link aplikasi ini belum didaftarkan di Firebase Console. ' +
          'Silakan masuk ke Firebase Console > Authentication > Settings > Authorized Domains, lalu tambahkan domain: ' +
          window.location.hostname
        );
      } else if (err.message === 'Firebase: Error (auth/user-not-found).') {
        setError('Email tidak terdaftar.');
      } else if (err.message === 'Firebase: Error (auth/wrong-password).') {
        setError('Password salah.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat login.');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.message?.includes('auth/unauthorized-domain')) {
        setError(
          'DOMAIN TIDAK TEROTORISASI: Link aplikasi ini belum didaftarkan di Firebase Console. ' +
          'Silakan masuk ke Firebase Console > Authentication > Settings > Authorized Domains, lalu tambahkan domain: ' +
          window.location.hostname
        );
      } else {
        setError(err.message || 'Gagal login dengan Google.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--glow-yellow)_0%,_transparent_70%)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-bg-secondary border border-border-subtle p-10 rounded-[1.5rem] shadow-2xl"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-text-secondary hover:text-accent-yellow transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-accent-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,197,24,0.3)]">
            <Shield className="w-8 h-8 text-bg-primary" />
          </div>
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">Admin Access</h1>
          <p className="text-text-secondary text-sm">Davsplace Studio Management Portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-8">
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
            className="w-full py-4 mt-2 bg-accent-yellow text-bg-primary font-black rounded-xl shadow-xl hover:bg-accent-yellow-bright transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'MASUK KE DASHBOARD'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-bg-secondary px-2 text-text-secondary">Atau</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Masuk dengan Google
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-text-secondary mt-5 leading-relaxed">
          Hanya akun yang terdaftar sebagai admin<br/>yang dapat mengakses dashboard ini.
        </p>

        <div className="mt-10 text-center text-[8px] text-text-secondary font-bold uppercase tracking-widest opacity-30">
          Davsplace Studio © 2026
        </div>
      </motion.div>
    </div>
  );
}
