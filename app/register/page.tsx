'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import PasswordInput from '../lib/PasswordInput';
import { auth, db } from '../lib/firebase';
import { Heart, User, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin',
  'Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa',
  'Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum',
  'Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Iğdır','Isparta','İstanbul','İzmir',
  'Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis','Kırıkkale','Kırklareli',
  'Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir',
  'Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak',
  'Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
];

const inputClass =
  'w-full border border-slate-200 bg-slate-50 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#d9a40b] focus:bg-white';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'donor' | 'needy'>('needy');

  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const [familyMembers, setFamilyMembers] = useState('');
  const [childrenCount, setChildrenCount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [housingType, setHousingType] = useState('Kiracı');
  const [workingPersonCount, setWorkingPersonCount] = useState('');
  const [hasSpecialCareNeeded, setHasSpecialCareNeeded] = useState(false);
  const [disabilityDetails, setDisabilityDetails] = useState('');
  const [hasOtherSupport, setHasOtherSupport] = useState(false);
  const [supportInstitutionDetails, setSupportInstitutionDetails] = useState('');
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('role');
    if (r === 'donor' || r === 'needy') setSelectedRole(r);
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (tcNo.length !== 11) {
      setErrorMsg('Hata: T.C. Kimlik Numarası eksiksiz 11 haneli olmalıdır.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Hata: Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (selectedRole === 'needy' && !declarationConfirmed) {
      setErrorMsg('Hata: Beyan edilen bilgilerin doğruluğunu onaylamalısınız.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const baseData = {
        role: selectedRole,
        fullName,
        tcNo,
        phone,
        age,
        email,
        city: selectedCity,
        district: selectedDistrict,
        address: fullAddress,
        status: selectedRole === 'needy' ? 'pending' : 'active',
        createdAt: serverTimestamp(),
      };

      const needyData =
        selectedRole === 'needy'
          ? {
              familyMembers,
              childrenCount,
              monthlyIncome,
              housingType,
              workingPersonCount,
              hasSpecialCareNeeded,
              disabilityDetails,
              hasOtherSupport,
              supportInstitutionDetails,
            }
          : {};

      


const { tcNo: _tc, age: _age, ...publicData } = baseData;

await setDoc(doc(db, 'users', cred.user.uid), publicData);
await setDoc(doc(db, 'userPrivate', cred.user.uid), {
  tcNo,
  age,
  ...needyData,
});
      await signOut(auth);

      setIsSubmitted(true);
      setSuccessMsg(
        selectedRole === 'needy'
          ? 'Beyan formunuz vakıf onayına gönderildi. Onaylandıktan sonra giriş yapabilirsiniz.'
          : 'Kaydınız oluşturuldu! Şimdi giriş yapabilirsiniz.'
      );
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Bu e-posta ile zaten bir hesap var.',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/weak-password': 'Şifre çok zayıf (en az 6 karakter).',
      };
      setErrorMsg(messages[err.code] || 'Kayıt sırasında bir hata oluştu: ' + err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f1f5f9]">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Sol panel: altın sarısı */}
        <div className="hidden md:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-[#e8b00c] via-[#b8860b] to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center font-black text-[#ffe58a]">
              HV
            </div>
            <span className="font-extrabold tracking-wider text-base">AZİZ MAHMUD HÜDAYİ</span>
          </div>

          <div className="space-y-4">
            <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border border-white/50 text-white">
              Resmi Vakıf Kayıt Portalı
            </span>
            <h2 className="text-4xl font-black leading-tight">Güvenli ve Denetimli Yardımlaşma</h2>
            <p className="text-sm text-white/90 leading-relaxed">
              İhtiyaç sahipleri için doldurulan beyan formları Vakıf İnceleme Kurulu tarafından titizlikle incelenir. Onaylanan haneler güvenle destek alabilir.
            </p>
            <ul className="space-y-2 text-xs font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffe58a]" /> Vakıf Onaylı Hak Sahipliği
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffe58a]" /> PDF Çıktılı Sosyal İnceleme Formu
              </li>
            </ul>
          </div>

          <span className="text-[11px] text-white/80">© 2026 Aziz Mahmud Hüdayi Vakfı • Gönül Köprüsü</span>
        </div>

        {/* Sağ panel */}
        <div className="p-6 sm:p-10 max-h-screen overflow-y-auto">
          <div className="flex gap-8 border-b border-slate-200 mb-6 text-sm font-bold">
            <Link href="/login" className="pb-3 text-slate-400 hover:text-slate-700">
              Giriş Yap
            </Link>
            <span className="pb-3 border-b-2 border-[#d9a40b] text-slate-900">Kayıt Ol &amp; Beyan Formu</span>
          </div>

          {isSubmitted ? (
            <div className="text-center space-y-4 py-10">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">{successMsg}</p>
              <Link
                href="/login"
                className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl"
              >
                Giriş Sayfasına Git
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {selectedRole === 'donor' ? 'Bağışçı Hesabı Oluşturun' : 'Yeni Hesap Oluşturun'}
                </h1>
                <p className="text-slate-400 mt-1">
                  {selectedRole === 'donor'
                    ? 'Bilgilerinizi girin, hemen bağış yapmaya başlayın.'
                    : 'Rolünüzü seçin ve resmi sosyal inceleme formunu eksiksiz doldurun.'}
                </p>
              </div>

              <div>
                <span className="block font-semibold mb-2 text-slate-700">Platformdaki Rolünüzü Seçin</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('donor')}
                    className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border-2 font-bold transition-all ${
                      selectedRole === 'donor'
                        ? 'border-[#e0a90c] bg-[#fffbeb] text-slate-900'
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
                        ? 'border-[#e0a90c] bg-[#fffbeb] text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <User className="w-4 h-4" /> İhtiyacım Var
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Adınız Soyadınız (Sadece Harf) *</label>
                  <input required className={inputClass} placeholder="Örn: Fatma Demir" value={fullName} onChange={(e) => setFullName(e.target.value.replace(/[0-9]/g, ''))} />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">T.C. Kimlik No (11 Rakam) *</label>
                  <input required className={inputClass} placeholder="11 haneli T.C." maxLength={11} value={tcNo} onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Telefon Numarası *</label>
                  <input required className={inputClass} placeholder="05XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Yaşınız *</label>
                  <input required className={inputClass} placeholder="Örn: 42" maxLength={3} value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">E-posta *</label>
                  <input required type="email" className={inputClass} placeholder="ornek@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Şifre *</label>
                  <PasswordInput required className={inputClass} placeholder="En az 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Şehir (İl) *</label>
                  <select className={inputClass} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">İlçe *</label>
                  <input required className={inputClass} placeholder="Örn: Beylikdüzü" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Açık Adres (Mahalle, Sokak, Kapı No) *</label>
                <textarea required rows={2} className={inputClass} placeholder="Örn: Fatih Mah. Gül Sok. No: 12 Daire: 4" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
              </div>

              {selectedRole === 'needy' && (
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-3xl p-5 space-y-3">
                  <p className="font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Sosyal İnceleme ve Hane Beyan Bilgileri
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Aile Fert Sayısı</label>
                      <input className={inputClass} placeholder="Örn: 3" value={familyMembers} onChange={(e) => setFamilyMembers(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Çocuk Sayısı</label>
                      <input className={inputClass} placeholder="Örn: 1" value={childrenCount} onChange={(e) => setChildrenCount(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Aylık Gelir (TL)</label>
                      <input className={inputClass} placeholder="Örn: 4500" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Ev / Mülk Durumu</label>
                      <select className={inputClass} value={housingType} onChange={(e) => setHousingType(e.target.value)}>
                        <option>Kiracı</option>
                        <option>Ev Sahibi</option>
                        <option>Yakınında / Lojman</option>
                        <option>Barınma Sorunu Var</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Çalışan Kişi</label>
                      <input className={inputClass} placeholder="Örn: 1" value={workingPersonCount} onChange={(e) => setWorkingPersonCount(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input type="checkbox" checked={hasSpecialCareNeeded} onChange={(e) => setHasSpecialCareNeeded(e.target.checked)} />
                    <span>Hanede özel bakım gerektiren / engelli birey var</span>
                  </label>
                  {hasSpecialCareNeeded && (
                    <input className={inputClass} placeholder="Engel / hastalık detayı" value={disabilityDetails} onChange={(e) => setDisabilityDetails(e.target.value)} />
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input type="checkbox" checked={hasOtherSupport} onChange={(e) => setHasOtherSupport(e.target.checked)} />
                    <span>Başka bir kurumdan destek alıyorum</span>
                  </label>
                  {hasOtherSupport && (
                    <input className={inputClass} placeholder="Hangi kurum / ne kadar" value={supportInstitutionDetails} onChange={(e) => setSupportInstitutionDetails(e.target.value)} />
                  )}

                  <label className="flex items-start gap-2 cursor-pointer pt-1 text-slate-800">
                    <input type="checkbox" className="mt-0.5" checked={declarationConfirmed} onChange={(e) => setDeclarationConfirmed(e.target.checked)} />
                    <span className="font-bold">Beyan ettiğim bilgilerin doğru olduğunu onaylıyorum.</span>
                  </label>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d9a40b] hover:bg-[#b8860b] disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl shadow-md transition-all"
              >
                {loading
                  ? 'Gönderiliyor...'
                  : selectedRole === 'needy'
                  ? 'Beyan Formunu Vakfa Gönder'
                  : 'Hesabımı Oluştur'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}