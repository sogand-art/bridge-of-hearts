import Link from 'next/link';
import { Heart, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#1b9187] via-[#147a71] to-slate-900">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-white/10 border-2 border-amber-300 rounded-3xl flex items-center justify-center text-amber-300 font-black text-2xl mx-auto shadow-2xl">
            HV
          </div>
          <span className="text-amber-300 font-black text-xs tracking-widest uppercase block">
            AZİZ MAHMUD HÜDAYİ VAKFI
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Gönül Köprüsü Sosyal Yardımlaşma Platformu
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto">
            İhtiyaç sahipleri, bağışçılar ve vakıf yöneticileri için güvenli ve denetimli yardımlaşma sistemi. Lütfen devam edeceğiniz rolü seçin:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
          <Link
            href="/register?role=needy"
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-white transition-all hover:scale-105 space-y-3 group block"
          >
            <div className="w-12 h-12 bg-amber-300 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">İhtiyacım Var</h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              Yardım almak için beyan formunu doldurun.
            </p>
            <span className="text-amber-300 text-xs font-bold inline-flex items-center gap-1 group-hover:underline">
              Kayıt Ol / Başvur <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/register?role=donor"
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-white transition-all hover:scale-105 space-y-3 group block"
          >
            <div className="w-12 h-12 bg-[#22b2a6] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">Bağışçıyım</h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              Onaylı faturalara ve eşya taleplerine destek olun.
            </p>
            <span className="text-[#80ede5] text-xs font-bold inline-flex items-center gap-1 group-hover:underline">
              Bağışçı Kaydı <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin-giris"
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-white transition-all hover:scale-105 space-y-3 group block"
          >
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">Vakıf Yöneticisi</h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              Başvuruları inceleyin, onaylayın ve yönetin.
            </p>
            <span className="text-amber-300 text-xs font-bold inline-flex items-center gap-1 group-hover:underline">
              Yönetim Masası <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <p className="text-slate-300 text-xs">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-white font-bold underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}