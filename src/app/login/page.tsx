'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import AuthBackground from '@/components/AuthBackground';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        if (!userInfo.email) {
          setError('Email dari Google tidak ditemukan.');
          setIsGoogleLoading(false);
          return;
        }

        let { data: user, error: fetchError } = await supabase.from('users').select('*').eq('email', userInfo.email).single();
        
        if (fetchError && fetchError.code === 'PGRST116') {
          // User not found, create one
          const { data: newUser, error: insertError } = await supabase.from('users').insert([{ 
            email: userInfo.email, 
            username: userInfo.name || userInfo.email.split('@')[0], 
            password: 'google_oauth_dummy_password_' + Date.now() 
          }]).select().single();
          
          if (insertError) throw insertError;
          user = newUser;
        } else if (fetchError) {
          throw fetchError;
        }
        
        if (user) {
          localStorage.setItem('moneyflow_authenticated', 'true');
          localStorage.setItem('moneyflow_username', user.username);
          router.replace('/dashboard');
        } else {
          setError('Gagal login dengan Google.');
          setIsGoogleLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal menghubungi server database.');
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Login Google dibatalkan atau gagal.');
      setIsGoogleLoading(false);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password.trim()) {
      setError('Masukkan username/email dan password.');
      return;
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${identifier.trim()},email.eq.${identifier.trim()}`)
        .eq('password', password)
        .single();
      
      if (error || !user) {
        setError('Username/Email atau password salah.');
      } else {
        localStorage.setItem('moneyflow_authenticated', 'true');
        localStorage.setItem('moneyflow_username', user.username);
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server database.');
    }
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-sm mx-auto animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-rose-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">MoneyFlow adalah aplikasi manajemen keuangan pribadi berbasis web yang dirancang untuk membantu pengguna mengelola dan memantau kondisi keuangan secara lebih terstruktur.</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Masuk</h1>
        </div>

        {/* Dummy Google Button (for visual similarity to the provided image) */}
        <button 
          type="button" 
          onClick={() => handleGoogleLogin()}
          disabled={isGoogleLoading}
          className="w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {isGoogleLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs text-slate-400 font-semibold uppercase">atau</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center animate-fade-in">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
              placeholder="Email atau username"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
              placeholder="Kata Sandi"
              required
            />
            <div className="text-left mt-3 px-2">
              <a href="#" className="text-xs font-bold text-slate-700 hover:text-slate-900">Lupa sandi?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95"
          >
            Masuk
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-500 mt-8 font-medium">
          Belum punya akun?{' '}
          <Link href="/register" className="text-slate-900 font-bold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </AuthBackground>
  );
}
