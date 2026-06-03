'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthBackground from '@/components/AuthBackground';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');

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
      // Cek apakah username sudah ada
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle();

      if (checkError) {
        console.error('Check user error:', checkError);
        setError(`Gagal memeriksa username: ${checkError.message}`);
        return;
      }

      if (existingUser) {
        setError('Username sudah terdaftar.');
        return;
      }

      const { error: insertError } = await supabase.from('users').insert([{
        username: username.trim(),
        password: password
      }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`Gagal membuat akun: ${insertError.message}`);
        return;
      }

      // Tampilkan popup sukses, lalu redirect ke login setelah 3 detik
      setRegisteredUsername(username.trim());
      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Terjadi kesalahan tak terduga. Coba lagi.');
    }
  };

  return (
    <AuthBackground>
      {/* ── Popup Sukses ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center animate-slide-up">
            {/* Ikon centang */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Akun Berhasil Dibuat!</h2>
            <p className="text-sm text-slate-500 mb-1">Selamat datang,</p>
            <p className="text-lg font-bold text-slate-800 mb-5">@{registeredUsername}</p>
            <p className="text-xs text-slate-400 mb-6">Silakan login menggunakan akun yang baru saja Anda daftarkan.</p>

            <button
              onClick={() => { window.location.href = '/login'; }}
              className="w-full py-3.5 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95"
            >
              Masuk Sekarang
            </button>

            <p className="text-xs text-slate-400 mt-4">Otomatis menuju login dalam 3 detik...</p>
          </div>
        </div>
      )}

      {/* ── Form Register ── */}
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
