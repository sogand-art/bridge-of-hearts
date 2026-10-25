'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Heart, User, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'donor' | 'needy'>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      console.log('1) giriş deneniyor');
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('2) auth tamam, uid:', cred.user.uid);

      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      console.log('3) firestore cevap verdi, belge var mı:', snap.exists());

      if (!snap.exists()) {
        await signOut(auth);
        setErrorMsg('Bu hesap için kayıt bilgisi bulunamadı. Lütfen önce kayıt olun.');
        setLoading(false);
        return;
      }

      const data = snap.data();
      console.log('4) rol:', data.role, '| seçilen:', selectedRole, '| durum:', data.status);

      if (data.role !== selectedRole) {
        await signOut(auth);
        setErrorMsg(
          data.role === 'donor'
            ? 'Bu hesap bir Bağışçı hesabıdır. Lütfen "Bağışçıyım" seçin.'
            : 'Bu hesap bir İhtiyaç Sahibi hesabıdır. Lütfen "İhtiyacım Var" seçin.'
        );
        setLoading(false);
        return;
      }

      if (data.role === 'needy' && data.status !== 'active' && data.status !== 'approved') {
        await signOut(auth);
        setInfoMsg('Başvurunuz vakıf onayında. Onaylandığında giriş yapabilirsiniz.');
        setLoading(false);
        return;
      }

      const target = data.role === 'donor' ? '/donor' : '/needy';
      console.log('5) yönlendiriliyor:', target);
      // Tam sayfa yönlendirme: router.push'a göre daha güvenilir
      window.location.href = target;
      // loading açık kalır, sayfa değişene kadar buton tekrar basılamaz
    } catch (err: any) {
      console.error('HATA:', err);
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/user-not-found': 'Bu e-posta ile kayıtlı hesap yok.',
        'auth/wrong-password': 'E-posta veya şifre hatalı.',
        'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin.',
        'permission-denied': 'Veritabanı erişim izni yok (Firestore kurallarını kontrol edin).',
        'unavailable': 'Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.',
      };
      setErrorMsg(messages[err.code] || 'Giriş sırasında bir hata oluştu: ' + (err.code || err.message));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Şifre sıfırlamak için önce e-posta adresinizi yazın.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err: any) {
      setErrorMsg('Şifre sıfırlama gönderilemedi: ' + err.code);
    }
  };

  const inputWrap =
    'flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3.5 focus-within:border-[#0f766e] focus-within:bg-white';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f1f5f9]">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Sol panel: koyu yeşil */}
        <div className="hidden md:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-[#0f766e] via-[#0d5c56] to-[#0b1426]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center font-black text-[#fcd34d]">
              HV
            </div>
            <span className="font-extrabold tracking-wider text-base">AZİZ MAHMUD HÜDAYİ</span>
          </div>

          <div className="space-y-4">
            <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border border-white/30 text-[#99f6e4] bg-white/10">
              Giriş Portalı
            </span>
            <h2 className="text-4xl font-black leading-tight">İyiliğe ve İhtiyaca Ortak Olun</h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Vakfımızın denetiminde, bağışçılar ve ihtiyaç sahipleri arasında doğrudan ve güvenli bir bağ kuruyoruz.
            </p>
            <ul className="space-y-2 text-xs font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5eead4]" /> Onaylı Fatura &amp; Zekat Ödemeleri
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5eead4]" /> PDF Onaylı Beyan Formları
              </li>
            </ul>
          </div>

          <span className="text-[11px] text-white/70">© 2026 Aziz Mahmud Hüdayi Vakfı • Gönül Köprüsü</span>
        </div>

        {/* Sağ panel */}
        <div className="p-6 sm:p-10">
          <div className="flex gap-8 border-b border-slate-200 mb-8 text-sm font-bold">
            <span className="pb-3 border-b-2 border-[#0f766e] text-slate-900">Giriş Yap</span>
            <Link href={`/register?role=${selectedRole}`} className="pb-3 text-slate-400 hover:text-slate-700">
              Kayıt Ol &amp; Form Doldur
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-xs">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Tekrar Hoş Geldiniz</h1>
              <p className="text-slate-400 mt-1">Rolünüzü seçip bilgilerinizi girerek platforma erişebilirsiniz.</p>
            </div>

            <div>
              <span className="block font-semibold mb-2 text-slate-700">Platformdaki Rolünüzü Seçin</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border-2 font-bold transition-all ${
                    selectedRole === 'donor'
                      ? 'border-[#0f766e] bg-[#f0fdfa] text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <Heart className="w-4 h-4" /> Bağışçıyım
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('needy')}
                  className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border-2 font-bold transition-all ${
                    selectedRole === 'needy'
                      ? 'border-[#0f766e] bg-[#f0fdfa] text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <User className="w-4 h-4" /> İhtiyacım Var
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-slate-700">E-posta</label>
              <div className={inputWrap}>
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Şifre</label>
                <Link href="/password" className="font-bold text-[#0f766e] hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className={inputWrap}>
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
              </div>
            )}
            {infoMsg && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> <span>{infoMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#0d5c56] disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl shadow-md transition-all"
            >
              {loading ? 'Giriş yapılıyor...' : (<>Sisteme Giriş Yap <ArrowRight className="w-4 h-4" /></>)}
            </button>

            <p className="text-center text-slate-500">
              Hesabınız yok mu?{' '}
              <Link href={`/register?role=${selectedRole}`} className="font-bold text-[#0f766e] hover:underline">
                Kayıt Ol
              </Link>
            </p>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0f766e]" /> KVKK Uyumlu Güvenli Altyapı
              </span>
              <Link href="/admin-giris" className="font-bold text-slate-600 hover:text-slate-900">
                Vakıf Yönetim Masası
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}