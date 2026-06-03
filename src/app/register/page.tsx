'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/AuthBackground';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Semua field harus diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    if (password.length < 4) {
      setError('Password minimal 4 karakter.');
      return;
    }

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .single();
        
      if (existingUser) {
        setError('Username sudah terdaftar.');
        return;
      }
      
      const { error: insertError } = await supabase.from('users').insert([{
        username: username.trim(),
        password: password
      }]);
      
      if (insertError) {
        throw insertError;
      }
      
      localStorage.setItem('moneyflow_authenticated', 'true');
      localStorage.setItem('moneyflow_username', username.trim());
      window.location.href = '/dashboard';
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Buat Akun</h1>
          <p className="text-sm text-slate-500 font-medium">Daftar untuk mulai mengelola keuangan</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center animate-fade-in">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
              placeholder="Username"
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
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
              placeholder="Konfirmasi Kata Sandi"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95"
          >
            Daftar Sekarang
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-500 mt-8 font-medium">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </AuthBackground>
  );
}
