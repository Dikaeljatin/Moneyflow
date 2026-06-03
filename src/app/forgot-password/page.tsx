'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthBackground from '@/components/AuthBackground';
import { supabase } from '@/lib/supabase';

type Step = 'username' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Masukkan username Anda.');
      return;
    }
    setLoading(true);
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .single();

      if (!user) {
        setError('Username tidak ditemukan.');
      } else {
        setStep('reset');
      }
    } catch {
      setError('Gagal menghubungi server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Semua field harus diisi.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Sandi minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('username', username.trim());

      if (updateError) throw updateError;

      setStep('success');
    } catch {
      setError('Gagal menyimpan sandi baru. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-sm mx-auto animate-slide-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-rose-500/30">
            {step === 'success' ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>

          {step === 'username' && (
            <>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Lupa Sandi</h1>
              <p className="text-sm text-slate-500 font-medium">Masukkan username Anda untuk melanjutkan</p>
            </>
          )}
          {step === 'reset' && (
            <>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Buat Sandi Baru</h1>
              <p className="text-sm text-slate-500 font-medium">
                Halo, <span className="font-bold text-slate-700">{username}</span>. Silakan masukkan sandi baru Anda.
              </p>
            </>
          )}
          {step === 'success' && (
            <>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sandi Diperbarui!</h1>
              <p className="text-sm text-slate-500 font-medium">Sandi Anda berhasil diubah. Silakan masuk kembali.</p>
            </>
          )}
        </div>

        {/* Step: Verify Username */}
        {step === 'username' && (
          <form onSubmit={handleVerifyUsername} className="space-y-4">
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
                placeholder="Masukkan username"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Memverifikasi...' : 'Lanjutkan'}
            </button>
          </form>
        )}

        {/* Step: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
                placeholder="Sandi Baru"
                required
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-sm"
                placeholder="Konfirmasi Sandi Baru"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('username'); setError(''); setNewPassword(''); setConfirmPassword(''); }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              ← Kembali
            </button>
          </form>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <Link
              href="/login"
              className="block w-full py-3.5 rounded-full bg-gradient-to-b from-slate-800 to-black text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-[0.99] active:scale-95 text-center"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}

        {/* Back to login */}
        {step !== 'success' && (
          <p className="text-center text-xs text-slate-500 mt-8 font-medium">
            Ingat sandi Anda?{' '}
            <Link href="/login" className="text-slate-900 font-bold hover:underline">
              Masuk
            </Link>
          </p>
        )}
      </div>
    </AuthBackground>
  );
}
