'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, Check } from 'lucide-react';

export default function AdminGirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdTokenResult(true);

      if (!token.claims.admin) {
        await signOut(auth);
        setNotification('Bu hesabın yönetici yetkisi yok.');
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setNotification('Yetkili girişi başarılı. Admin paneline yönlendiriliyorsunuz...');
      setTimeout(() => router.push('/admin'), 1000);
    } catch {
      setNotification('E-posta veya şifre hatalı.');
      setTimeout(() => setNotification(null), 4000);
    }
  };



  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans selection:bg-emerald-600 selection:text-white">
      
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/60 text-emerald-100 p-4 rounded-3xl flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Ana Kart Konteynerı */}
      <div className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200">
        
        {/* Sol Taraf: Koyu Yeşil Geniş Tanıtım Alanı */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#072220] via-[#0C3533] to-[#041615] text-white p-10 sm:p-14 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-3 bg-emerald-900/40 border border-emerald-600/30 px-4.5 py-2.5 rounded-2xl shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                HV
              </div>
              <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-100">AZİZ MAHMUD HÜDAYİ</span>
            </div>

            <div className="space-y-4 pt-6">
              <span className="inline-block px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                GİRİŞ PORTALI
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                Yönetim ve Denetim Masası
              </h1>
              <p className="text-sm text-emerald-200/85 leading-relaxed font-medium">
                Vakfımızın güvenli altyapısında yetkili denetimler ve onay mekanizmaları için özel gizli geçit.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-10 relative z-10">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Güvenli Şifrelenmiş Yönetici Oturumu</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Hızlı Onay ve Denetim Yetkisi</span>
            </div>

            <div className="pt-8 border-t border-emerald-800/60 text-xs text-emerald-400/70 font-semibold">
              © 2026 Aziz Mahmud Hüdayi Vakfı • Gönül Köprüsü
            </div>
          </div>

        </div>

        {/* Sağ Taraf: Genişletilmiş Giriş Formu Alanı */}
        <div className="lg:col-span-7 p-10 sm:p-16 flex flex-col justify-center bg-white space-y-8">
          
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tekrar Hoş Geldiniz
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Yetkili bilgilerinizi girerek admin paneline erişebilirsiniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 pt-2 w-full block">
            
            <div className="space-y-2.5 w-full">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block px-1">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative w-full">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-emerald-600" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yonetici@hudai.org.tr"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs block"
                />
              </div>
            </div>

            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Şifre
                </label>
              </div>
              <div className="relative w-full">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-emerald-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs block"
                />
              </div>
            </div>

            {/* Geniş ve Daha İnce (Kısa) Düğme Tasarımı */}
            <div className="w-full pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0C3533] hover:bg-[#072220] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-teal-900/20 cursor-pointer group"
              >
                <span>Sisteme Giriş Yap</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </form>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            <span>KVKK Uyumlu Güvenli Altyapı ve Veri Koruma</span>
          </div>

        </div>

      </div>

    </div>
  );
}