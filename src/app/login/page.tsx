'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/AuthBackground';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
        window.location.href = '/dashboard';
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
