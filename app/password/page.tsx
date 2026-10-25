'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      auth.languageCode = 'tr'; // Mail Türkçe gelsin
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin.',
        'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
      };
      // Güvenlik: "bu e-posta kayıtlı değil" bilgisini göstermiyoruz
      if (err.code === 'auth/user-not-found') {
        setSent(true);
      } else {
        setErrorMsg(messages[err.code] || 'Bir hata oluştu: ' + err.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f1f5f9]">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#f0fdfa] border border-[#0f766e]/30 flex items-center justify-center mx-auto">
          <KeyRound className="w-7 h-7 text-[#0f766e]" />
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-black text-slate-900">E-postanızı kontrol edin</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>{email}</strong> adresi sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.
              Gelen kutunuzu ve spam klasörünü kontrol edin.
            </p>
            <Link
              href="/login"
              className="inline-block bg-[#0f766e] hover:bg-[#0d5c56] text-white text-xs font-bold px-6 py-3 rounded-xl"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900">Şifremi Unuttum</h1>
              <p className="text-slate-400 mt-1">
                Kayıtlı e-posta adresinizi yazın, size şifre sıfırlama bağlantısı gönderelim.
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-slate-700">E-posta</label>
              <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3.5 focus-within:border-[#0f766e] focus-within:bg-white">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-[#0d5c56] disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl shadow-md transition-all"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}