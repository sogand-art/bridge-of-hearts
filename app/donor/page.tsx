'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, addDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { donorAuth as auth, donorDb as db } from '../lib/firebase-donor';
import {
  Heart, ShieldCheck, FileText, Package, MapPin, CheckCircle2, PlusCircle, User, Clock, X,
  Settings, LogOut, History, Check, Lock, Search, FileCheck, Phone, Bell, Moon, Sun, Download,
  Sparkles, Menu, Edit3, Trash2, Camera, ChevronDown, Image as ImageIcon, Eye, EyeOff, CreditCard,
} from 'lucide-react';


// ⬇️ Kendi TURKEY_CITIES bloğunu buraya yapıştır (bu kısa listeyi sil) ⬇️
const TURKEY_CITIES: { [key: string]: string[] } = {
  'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat'],
  'Bursa': ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl'],
  'Diyarbakır': ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Nizip'],
  'İstanbul': ['Kadıköy', 'Üsküdar', 'Ümraniye', 'Sancaktepe', 'Sultanbeyli', 'Beylikdüzü', 'Esenyurt', 'Fatih', 'Bağcılar', 'Başakşehir', 'Pendik', 'Kartal', 'Maltepe', 'Ataşehir', 'Bakırköy', 'Küçükçekmece', 'Avcılar', 'Beşiktaş', 'Şişli', 'Zeytinburnu'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Karabağlar'],
  'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas'],
  'Kocaeli': ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Derince'],
  'Konya': ['Selçuklu', 'Meram', 'Karatay'],
  'Mersin': ['Mezitli', 'Yenişehir', 'Toroslar', 'Akdeniz', 'Tarsus'],
  'Sakarya': ['Adapazarı', 'Serdivan', 'Erenler'],
  'Samsun': ['İlkadım', 'Atakum', 'Canik'],
  'Şanlıurfa': ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Siverek'],
  'Trabzon': ['Ortahisar', 'Akçaabat'],
};

const NEEDS_COLLECTION = 'requests';

type ViewMode = 'explore' | 'create_listing' | 'my_item_listings' | 'history' | 'verification' | 'profile' | 'settings';

const CATEGORIES = ['Mobilya', 'Beyaz Eşya', 'Elektronik', 'Ev Tekstili / Halı'];
const CONDITIONS = [
  'Sıfır Gibi (Hiç Kullanılmamış)',
  'Az Kullanılmış (Çok İyi)',
  'Orta Durumda (İşlevsel & Temiz)',
  'Yoğun Kullanılmış / Bakım Gerektirir',
];

const toAscii = (s: string) =>
  String(s ?? '')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');

    function PasswordInput({
  value, onChange, placeholder, className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className || ''} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
function Select({
  value, options, onChange, darkMode, big = false, maxH = 'max-h-48',
}: {
  value: string; options: string[]; onChange: (v: string) => void;
  darkMode: boolean; big?: boolean; maxH?: string;
}) {
  const [open, setOpen] = useState(false);
  const r = big ? 'rounded-2xl' : 'rounded-xl';
  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border ${r} py-3 px-4 text-xs font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)}></div>
          <div className={`absolute top-full left-0 right-0 mt-1 ${maxH} overflow-y-auto ${r} border shadow-xl z-30 p-1 space-y-0.5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${value === opt ? 'bg-[#22b2a6]/10 text-[#1b9187]' : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <span>{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DonorDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fatura' | 'esya_talebi' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('Tümü');
  const [itemListingTab, setItemListingTab] = useState<'all' | 'approved' | 'pending'>('all');
  const [historyTab, setHistoryTab] = useState<'all' | 'fatura' | 'esya'>('all');
  const [verificationTab, setVerificationTab] = useState<'all' | 'approved' | 'pending'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [donationItems, setDonationItems] = useState<any[]>([]);
  const [needsError, setNeedsError] = useState<string | null>(null);

  const [activeItemToPay, setActiveItemToPay] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
const [cardNo, setCardNo] = useState('');
const [cardName, setCardName] = useState('');
const [cardExp, setCardExp] = useState('');
const [cardCvc, setCardCvc] = useState('');
  const [itemToRequestApproval, setItemToRequestApproval] = useState<any>(null);
  const [itemToFulfill, setItemToFulfill] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'foundation_pickup' | 'donor_delivers'>('foundation_pickup');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [revealedPhoneId, setRevealedPhoneId] = useState<string | number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string, ms = 4000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), ms);
  };

  const [myDonationHistory, setMyDonationHistory] = useState<any[]>([]);
  const [mySubmittedListings, setMySubmittedListings] = useState<any[]>([]);

  const [authReady, setAuthReady] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileProfession, setProfileProfession] = useState('');
  const [profileCity, setProfileCity] = useState('İstanbul');
  const [profileDistrict, setProfileDistrict] = useState('Kadıköy');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifA, setNotifA] = useState(true);
  const [notifB, setNotifB] = useState(true);
  const [notifC, setNotifC] = useState(true);

  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Mobilya');
  const [itemCondition, setItemCondition] = useState('Az Kullanılmış (Çok İyi)');
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('Kadıköy');
  const [isSaving, setIsSaving] = useState(false);

  // ---- Oturum ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/login'; return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const d: any = snap.exists() ? snap.data() : {};
        if (d.role !== 'donor') { window.location.href = '/login'; return; }
        setProfileName(d.fullName || d.name || d.displayName || user.email?.split('@')[0] || 'Kullanıcı');
        setProfileEmail(d.email || user.email || '');
        setProfilePhone(d.phone || '');
        setProfileProfession(d.profession || '');
        if (d.city) setProfileCity(d.city);
        if (d.district) setProfileDistrict(d.district);
        setProfileAddress(d.address || '');
      } catch (err) {
        console.error('Profil yüklenemedi:', err);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ---- İhtiyaç talepleri (requests) ----
  useEffect(() => {
    if (!authReady) return;
    const unsub = onSnapshot(
      collection(db, NEEDS_COLLECTION),
      (snap) => {
        console.log('requests:', snap.size, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setNeedsError(null);
        const list = snap.docs
          .map((d) => {
            const x: any = d.data();
            const secs = x.createdAt?.seconds;
            const category = x.category || 'Fatura Ödemesi';
            const isInvoice = /fatura/i.test(category) || x.type === 'fatura';
            const loc = x.location || [x.district, x.city].filter(Boolean).join(', ');
            return {
              id: d.id,
              createdAt: x.createdAt,
              type: isInvoice ? 'fatura' : 'esya_talebi',
              category,
              title: x.title || x.requestTitle || x.description || category,
              description: x.description || x.title || x.requestTitle || '',
              location: loc,
              amount: Number(x.amount) || 0,
              urgencyLevel: x.urgencyLevel || 'normal',
              inspector: x.inspector || 'Vakıf Onaylı İnceleme',
              paymentStatus: x.paymentStatus || 'none',
              status: x.status || '',
              date: secs ? new Date(secs * 1000).toLocaleDateString('tr-TR') : 'Az önce',
              // ihtiyaç sahibinin kişisel bilgileri bilerek taşınmıyor
            };
          })
          .filter((x: any) => x.status === 'approved' && !['paid', 'fulfilled', 'rejected'].includes(x.paymentStatus));
        list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setDonationItems(list);
      },
      (err) => {
        console.error('Talepler okunamadı:', err);
        setNeedsError(err.message || 'Talepler okunamadı');
      }
    );
    return () => unsub();
  }, [authReady]);

  // ---- Kullanıcının ilanları ve bağışları ----
  useEffect(() => {
    if (!authReady || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const u1 = onSnapshot(
      query(collection(db, 'itemListings'), where('userId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
        list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMySubmittedListings(list);
      },
      (err) => console.error('İlanlar okunamadı:', err)
    );
    const u2 = onSnapshot(
      query(collection(db, 'donations'), where('userId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => {
          const x: any = d.data();
          const secs = x.createdAt?.seconds;
          return { ...x, id: d.id, date: secs ? new Date(secs * 1000).toLocaleDateString('tr-TR') : 'Bugün' };
        });
        list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMyDonationHistory(list);
      },
      (err) => console.error('Bağışlar okunamadı:', err)
    );
    return () => { u1(); u2(); };
  }, [authReady]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const initials =
    profileName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  // ---- Yardımcılar ----
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (TURKEY_CITIES[city]?.length) setSelectedDistrict(TURKEY_CITIES[city][0]);
  };
  const handleProfileCityChange = (city: string) => {
    setProfileCity(city);
    if (TURKEY_CITIES[city]?.length) setProfileDistrict(TURKEY_CITIES[city][0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Fotoğraf en fazla 5MB olabilir.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEditing && editingItem) setEditingItem({ ...editingItem, image: reader.result as string });
      else setItemImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

 const compressImage = (dataUrl: string, maxSize = 800, quality = 0.7): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas_failed')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = dataUrl;
  });


const uploadImageIfNeeded = async (img: string | null) => {
  if (!img || !img.startsWith('data:')) return img;
  return await compressImage(img);
};
  // ---- Eşya ilanı ----
 const handleCreateListing = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!itemTitle.trim() || !auth.currentUser || isSaving) return;
  if (!itemImage) {
    showToast('Lütfen eşya fotoğrafını yükleyin. Fotoğraf zorunludur.');
    return;
  }
  setIsSaving(true);
  try {
    const imageUrl = await uploadImageIfNeeded(itemImage);
    await addDoc(collection(db, 'itemListings'), {
      userId: auth.currentUser.uid,
        title: itemTitle.trim(),
        donorName: (profileName.split(' ')[0] || 'Bağışçı') + ' ' + ((profileName.split(' ').slice(-1)[0] || '')[0] || '') + '.',
        category: itemCategory,
        city: selectedCity,
        district: selectedDistrict,
        condition: itemCondition,
        image: imageUrl || null,
        status: 'Vakıf İncelemesinde (Bekliyor)',
        createdAt: serverTimestamp(),
      });
      showToast(`"${itemTitle}" ilanınız vakıf onayına gönderildi.`);
      setItemTitle('');
      setItemImage(null);
      setViewMode('my_item_listings');
    } catch (err: any) {
      console.error(err);
      showToast('İlan kaydedilemedi: ' + (err?.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteListing = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, 'itemListings', String(id)));
      showToast('Eşya bağış ilanınız silindi.');
    } catch (err) {
      console.error(err);
      showToast('İlan silinemedi.');
    }
  };

  const handleSaveEditedListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const imageUrl = await uploadImageIfNeeded(editingItem.image || null);
      await updateDoc(doc(db, 'itemListings', String(editingItem.id)), {
        title: editingItem.title,
        category: editingItem.category,
        condition: editingItem.condition,
        image: imageUrl || null,
      });
      setEditingItem(null);
      showToast('Eşya ilanı güncellendi.');
    } catch (err: any) {
      console.error(err);
      showToast('Güncelleme yapılamadı: ' + (err?.message || ''));
    }
  };

  // ---- Onay isteği ----
  const handleConfirmRequestApproval = async () => {
    if (!itemToRequestApproval) return;
    const item = itemToRequestApproval;
    try {
      await updateDoc(doc(db, NEEDS_COLLECTION, String(item.id)), {
        paymentStatus: 'requested',
        requestedBy: auth.currentUser?.uid || '',
        requestedAt: serverTimestamp(),
      });
      setItemToRequestApproval(null);
      showToast(`"${item.title}" için vakıftan onay isteği gönderildi.`);
    } catch (err: any) {
      console.error(err);
      showToast('Onay isteği gönderilemedi: ' + (err?.message || ''));
    }
  };

  // ---- Eşya talebini sahiplenme ----
  const handleCompleteFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToFulfill) return;
    const item = itemToFulfill;
    const uid = auth.currentUser?.uid || '';
    try {
      await updateDoc(doc(db, NEEDS_COLLECTION, String(item.id)), {
        paymentStatus: 'fulfilled',
        fulfilledBy: uid,
        fulfilledAt: serverTimestamp(),
        deliveryMethod,
      });
      await addDoc(collection(db, 'donations'), {
        userId: uid,
        type: 'esya',
        title: item.title,
        amount: 0,
        location: item.location,
        receiptNo: `ESY-${Date.now()}`,
        createdAt: serverTimestamp(),
      });
      setItemToFulfill(null);
      showToast(`"${item.title}" desteğiniz kaydedildi. Lojistik ekibimiz sizinle iletişime geçecek.`, 5000);
    } catch (err: any) {
      console.error(err);
      showToast('Kayıt yapılamadı: ' + (err?.message || ''));
    }
  };

  // ---- Ödeme (sunucu tarafı iyzico/PayTR entegrasyonu bekleniyor) ----
  const handleConfirmYes = () => {
  setShowConfirmModal(false);
  setShowCardModal(true);
};

const closeCardModal = () => {
  setShowCardModal(false);
  setActiveItemToPay(null);
  setCardNo(''); setCardName(''); setCardExp(''); setCardCvc('');
};

const handleCompleteCardPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!activeItemToPay || !auth.currentUser || isPaying) return;

  if (cardNo.replace(/\s/g, '').length !== 16) { showToast('Kart numarası 16 haneli olmalı.'); return; }
  if (!cardName.trim()) { showToast('Kart üzerindeki ismi girin.'); return; }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExp)) { showToast('Son kullanma tarihi AA/YY biçiminde olmalı.'); return; }
  if (!/^\d{3}$/.test(cardCvc)) { showToast('CVC 3 haneli olmalı.'); return; }

  setIsPaying(true);
  const item = activeItemToPay;
  const uid = auth.currentUser.uid;
  try {
    await updateDoc(doc(db, NEEDS_COLLECTION, String(item.id)), {
      paymentStatus: 'fulfilled',
      fulfilledBy: uid,
      fulfilledAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'donations'), {
      userId: uid,
      type: 'fatura',
      title: item.title,
      amount: item.amount,
      location: item.location,
      receiptNo: `MAK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: serverTimestamp(),
    });
    closeCardModal();
    showToast(`Ödeme tamamlandı! "${item.title}" için makbuzunuz Bağış Geçmişim'de.`, 5000);
  } catch (err: any) {
    console.error(err);
    showToast('Ödeme kaydedilemedi: ' + (err?.message || ''), 5000);
  } finally {
    setIsPaying(false);
  }
};

  // ---- Makbuz ----
  const handleDownloadReceipt = async (receiptNo: string, title: string, amount: number, location: string, date: string) => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('GONUL KOPRUSU VAKFI - BAGIS MAKBUZU', 20, 25);
      pdf.setFontSize(11);
      [
        `Belge No: ${receiptNo}`,
        `Bagisci: ${toAscii(profileName)}`,
        `Konu: ${toAscii(title)}`,
        `Tutar: ${amount} TL`,
        `Lokasyon: ${toAscii(location || '-')}`,
        `Tarih: ${toAscii(date)}`,
      ].forEach((l, i) => pdf.text(l, 20, 45 + i * 10));
      pdf.setFontSize(9);
      pdf.text('Bu belge bilgilendirme amaclidir. Resmi makbuz icin vakif ile iletisime geciniz.', 20, 115);
      pdf.save(`Gonul-Koprusu-Makbuz-${receiptNo}.pdf`);
      showToast(`"${receiptNo}" numaralı makbuz indirildi.`);
    } catch (err) {
      console.error(err);
      showToast('Makbuz oluşturulamadı.');
    }
  };

  // ---- Profil / şifre ----
  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fullName: profileName, phone: profilePhone, profession: profileProfession,
        city: profileCity, district: profileDistrict, address: profileAddress,
      });
      showToast('Profil ve adres bilgileriniz güncellendi!');
    } catch (err: any) {
      console.error(err);
      showToast('Profil kaydedilemedi: ' + (err?.message || ''));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { showToast('Lütfen şifre alanlarını doldurun.'); return; }
    if (newPassword.length < 6) { showToast('Yeni şifre en az 6 karakter olmalı.'); return; }
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('no_user');
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
      await updatePassword(user, newPassword);
      showToast('Şifreniz güncellendi!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      showToast(err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential' ? 'Mevcut şifre hatalı.' : 'Şifre güncellenemedi.');
    }
  };

  const handleNavigation = (mode: ViewMode) => { setViewMode(mode); setIsSidebarOpen(false); };

  // ---- Türetilmiş ----
  const filteredItems = donationItems.filter((item) => {
    if (activeFilter === 'fatura' && item.type !== 'fatura') return false;
    if (activeFilter === 'esya_talebi' && item.type !== 'esya_talebi') return false;
    if (activeFilter === 'approved' && item.paymentStatus !== 'approved') return false;
    if (selectedCityFilter !== 'Tümü' && !(item.location || '').includes(selectedCityFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const hit = (item.title || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q) || (item.location || '').toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const paidInvoices = myDonationHistory.filter((r) => r.type === 'fatura');
  const paidInvoiceTotal = paidInvoices.reduce((s: number, r: any) => s + (r.amount || 0), 0);
  const isApprovedStatus = (s: string) => (s || '').includes('Onaylandı');
  const isPendingStatus = (s: string) => (s || '').includes('Bekliyor');
  const approvedCount = mySubmittedListings.filter((i) => isApprovedStatus(i.status)).length;
  const pendingCount = mySubmittedListings.filter((i) => isPendingStatus(i.status)).length;
  const helpedFamilies = myDonationHistory.length + approvedCount;
  const openNeedTotal = donationItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalDonatedAmount = myDonationHistory.reduce((s: number, r: any) => s + (r.amount || 0), 0);

  const bySubmissionTab = (tab: 'all' | 'approved' | 'pending') =>
    mySubmittedListings.filter((i) => tab === 'approved' ? isApprovedStatus(i.status) : tab === 'pending' ? isPendingStatus(i.status) : true);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-bold">Yükleniyor...</div>;
  }

  // ---- Ortak sınıflar ----
  const card = `rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const inputCls = `w-full border rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`;
  const modalCls = `max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
  const tabBtn = (active: boolean) => `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${active ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'}`;
  const primaryBtn = 'bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer';
  const ghostBtn = `py-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`;
  const tabsWrap = `p-2 rounded-2xl border flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const badge = 'text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border';
  const okBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  const warnBadge = 'bg-amber-50 text-amber-800 border-amber-200';

  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'profile', label: 'Profilim', icon: <User className="w-4 h-4 text-[#22b2a6]" /> },
    { mode: 'explore', label: 'İhtiyaç İlanları', icon: <FileText className="w-4 h-4 text-[#22b2a6]" /> },
    { mode: 'my_item_listings', label: 'Eşya Bağışlarım', icon: <Package className="w-4 h-4 text-[#22b2a6]" /> },
    { mode: 'history', label: 'Bağış Geçmişim', icon: <History className="w-4 h-4 text-[#22b2a6]" /> },
    { mode: 'verification', label: 'Vakıf Onay Süreci', icon: <ShieldCheck className="w-4 h-4 text-[#22b2a6]" /> },
    { mode: 'settings', label: 'Ayarlar', icon: <Settings className="w-4 h-4 text-[#22b2a6]" /> },
  ];

  const StatusPill = ({ s }: { s: string }) => (
    <span className={`${badge} ${isApprovedStatus(s) ? okBadge : warnBadge}`}>{s}</span>
  );

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#22b2a6] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#1b9187] flex items-center gap-3 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Düzenleme modalı */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={modalCls}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2"><Edit3 className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-extrabold">Eşya İlanını Düzenle</h3></div>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEditedListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Eşya Başlığı</label>
                <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1 opacity-80">Kategori</label>
                  <Select value={editingItem.category} options={CATEGORIES} onChange={(v) => setEditingItem({ ...editingItem, category: v })} darkMode={darkMode} /></div>
                <div><label className="block font-bold mb-1 opacity-80">Kondisyon</label>
                  <Select value={editingItem.condition} options={CONDITIONS} onChange={(v) => setEditingItem({ ...editingItem, condition: v })} darkMode={darkMode} /></div>
              </div>
              <div>
                <label className="block font-bold mb-1 opacity-80">Fotoğrafı Güncelle</label>
                <div className={`border-2 border-dashed rounded-2xl p-3 text-center ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  {editingItem.image ? (
                    <div className="space-y-2">
                      <img src={editingItem.image} alt="Önizleme" className="w-full h-28 object-cover rounded-xl" />
                      <label className="text-[#22b2a6] font-bold hover:underline cursor-pointer text-[11px] block"><span>Fotoğrafı Değiştir</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" /></label>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-2"><ImageIcon className="w-5 h-5 text-[#22b2a6] mb-1" /><span className="font-bold">Fotoğraf Ekle</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" /></label>
                  )}
                </div>
              </div>
              <button type="submit" className={`${primaryBtn} w-full font-extrabold py-3.5 text-xs`}>Değişiklikleri Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* Sahiplenme modalı */}
      {itemToFulfill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={modalCls}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2"><Package className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-extrabold">Eşya Desteği Sahiplenme</h3></div>
              <button onClick={() => setItemToFulfill(null)} className="p-1 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs bg-[#22b2a6]/10 p-3.5 rounded-2xl border border-[#22b2a6]/30 space-y-1">
              <span className="font-bold text-[#1b9187] block text-sm">{itemToFulfill.title}</span>
              <p className="opacity-80">{itemToFulfill.description}</p>
            </div>
            <form onSubmit={handleCompleteFulfill} className="space-y-4 text-xs">
              <div className="space-y-2">
                {[
                  { v: 'foundation_pickup', t: 'Vakıf Kuryesi Gelip Alsın', d: 'Gönüllü ekibimiz adresinize gelerek eşyayı teslim alsın.' },
                  { v: 'donor_delivers', t: 'Kendi Aracımla Teslim Edeceğim', d: 'İhtiyaç sahibine veya vakıf merkezine kendim ulaştıracağım.' },
                ].map((o) => (
                  <label key={o.v} className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer ${deliveryMethod === o.v ? 'border-[#22b2a6] bg-[#22b2a6]/10' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input type="radio" name="delivery" checked={deliveryMethod === o.v} onChange={() => setDeliveryMethod(o.v as any)} className="mt-0.5" />
                    <div><span className="font-bold block">{o.t}</span><span className="text-[11px] opacity-60">{o.d}</span></div>
                  </label>
                ))}
              </div>
              <button type="submit" className={`${primaryBtn} w-full font-extrabold py-3.5 text-xs`}>Destek Talebini Onayla & Tamamla</button>
            </form>
          </div>
        </div>
      )}

      {/* Onay isteği modalı */}
      {itemToRequestApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={modalCls}>
            <div className="w-12 h-12 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl flex items-center justify-center border border-[#22b2a6]/30 mx-auto"><Clock className="w-6 h-6" /></div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold">Vakıftan Onay İstiyor musunuz?</h3>
              <p className="text-xs opacity-70"><span className="font-bold text-[#1b9187]">{itemToRequestApproval.title}</span> için ödeme yapabilmek adına vakıf onay masasına inceleme talebi göndermek istiyor musunuz?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setItemToRequestApproval(null)} className={ghostBtn}>Vazgeç</button>
              <button type="button" onClick={handleConfirmRequestApproval} className={`${primaryBtn} py-3 text-xs`}>Evet, Onay İste</button>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme onay modalı */}
{showConfirmModal && activeItemToPay && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className={modalCls}>
      <div className="w-12 h-12 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl flex items-center justify-center border border-[#22b2a6]/30 mx-auto"><ShieldCheck className="w-6 h-6" /></div>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-extrabold">Ödeme Onayı</h3>
        <p className="text-xs opacity-70"><span className="font-bold text-[#1b9187]">{activeItemToPay.title}</span> için <span className="font-extrabold">{activeItemToPay.amount} TL</span> tutarındaki ödemeyi gerçekleştirmek istediğinize emin misiniz?</p>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button type="button" onClick={() => { setShowConfirmModal(false); setActiveItemToPay(null); }} className={ghostBtn}>Hayır, Vazgeç</button>
        <button type="button" onClick={handleConfirmYes} className={`${primaryBtn} py-3 text-xs`}>Evet, Eminim</button>
      </div>
    </div>
  </div>
)}

{/* Kart ödeme modalı */}
{showCardModal && activeItemToPay && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className={modalCls}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-extrabold">Güvenli Kart Ödeme Ekranı</h3></div>
        <button type="button" onClick={closeCardModal} className="p-1 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
      </div>

      <div className="text-xs bg-[#22b2a6]/10 p-3 rounded-xl border border-[#22b2a6]/30 flex items-center justify-between">
        <span>Ödenecek Tutar:</span>
        <span className="font-extrabold text-[#1b9187] text-sm">{activeItemToPay.amount} TL</span>
      </div>

      <div className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-2">
        TEST MODU: Gerçek kart bilgisi girmeyin. Hiçbir ödeme alınmaz.
      </div>

      <form onSubmit={handleCompleteCardPayment} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold mb-1 opacity-80">Kart Üzerindeki Ad Soyad</label>
          <input type="text" placeholder="Ad Soyad" value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block font-bold mb-1 opacity-80">Kart Numarası</label>
          <input type="text" inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000" value={cardNo}
            onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
            className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1 opacity-80">Son Kullanma (AA/YY)</label>
            <input type="text" inputMode="numeric" maxLength={5} placeholder="10/28" value={cardExp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                setCardExp(v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v);
              }} className={inputCls} />
          </div>
          <div>
            <label className="block font-bold mb-1 opacity-80">CVC</label>
            <input type="password" inputMode="numeric" maxLength={3} placeholder="•••" value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={isPaying} className={`${primaryBtn} w-full font-extrabold py-3.5 text-xs disabled:opacity-60`}>
          {isPaying ? 'İşleniyor...' : 'Ödemeyi Tamamla & Makbuz Al'}
        </button>
      </form>
    </div>
  </div>
)}

      {/* Yan panel */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`fixed top-0 left-0 bottom-0 w-72 z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-100' : 'bg-white border-r border-slate-200 text-slate-800'}`}>
        <div>
          <div className={`flex items-center justify-between mb-8 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#22b2a6] text-white rounded-xl shadow-sm"><Heart className="w-5 h-5 fill-white" /></div>
              <span className="font-extrabold text-xs tracking-wider">GÖNÜL KÖPRÜSÜ</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <nav className="space-y-1.5 text-xs font-bold">
            {navItems.map((n) => (
              <button key={n.mode} onClick={() => handleNavigation(n.mode)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${viewMode === n.mode ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'}`}>
                {n.icon}<span>{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={`pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={async () => { await signOut(auth); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('explore')}>
              <div className="p-2.5 bg-[#22b2a6] text-white rounded-2xl shadow-md"><Heart className="w-5 h-5 fill-white" /></div>
              <div>
                <span className="font-extrabold text-base tracking-tight block leading-tight">GÖNÜL KÖPRÜSÜ</span>
                <span className="text-[10px] text-[#1b9187] font-extrabold tracking-widest uppercase block">Vakfı Bağışçı Portalı</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-6 py-2 rounded-2xl bg-[#22b2a6]/10 border border-[#22b2a6]/30 text-xs font-bold">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Aktif İhtiyaç: <strong className="text-[#1b9187]">{donationItems.length} Talep</strong></span></div>
            <div className="w-px h-4 bg-[#22b2a6]/30"></div>
            <span>Bekleyen Talep: <strong className="text-[#1b9187]">{openNeedTotal.toLocaleString('tr-TR')} TL</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 p-1 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => handleNavigation('explore')} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${viewMode === 'explore' ? (darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-sm') : 'opacity-70 hover:opacity-100'}`}>İhtiyaçları Gör & Öde</button>
              <button onClick={() => handleNavigation('create_listing')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${viewMode === 'create_listing' ? 'bg-[#22b2a6] text-white' : 'opacity-70 hover:opacity-100'}`}><PlusCircle className="w-3.5 h-3.5" /><span>Eşya Bağışla</span></button>
            </div>
            <div onClick={() => handleNavigation('profile')} className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl border border-[#22b2a6]/30 bg-[#22b2a6]/10 cursor-pointer hover:bg-[#22b2a6]/20">
              <div className="text-right hidden sm:block"><span className="font-extrabold text-xs block leading-tight">{profileName}</span><span className="text-[10px] text-[#1b9187] font-bold block">Bağışçı</span></div>
              <div className="w-9 h-9 bg-[#22b2a6] text-white rounded-xl overflow-hidden flex items-center justify-center font-black text-xs">
                {profileAvatar ? <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" /> : initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* İstatistik */}
      <section className="bg-gradient-to-br from-[#1b9187] via-[#147a71] to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#22b2a6]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Hoş Geldiniz, {profileName}</h1>
              <p className="text-[#e0f7f5] text-xs mt-1">
                {helpedFamilies > 0 ? `Bugüne kadar yaptığınız yardımlarla ${helpedFamilies} ailenin ihtiyacına doğrudan dokundunuz.` : 'Henüz bir bağışınız yok. İhtiyaç ilanlarını inceleyerek ilk desteğinizi verebilirsiniz.'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-[#80ede5]" />
              <div><span className="text-[10px] text-[#e0f7f5] block font-semibold">Bağışçı Durumu</span><span className="text-sm font-extrabold">{myDonationHistory.length > 0 ? 'Aktif Bağışçı' : 'Yeni Bağışçı'}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Ödenen Fatura', icon: <FileText className="w-4 h-4" />, value: `${paidInvoiceTotal.toLocaleString('tr-TR')} TL`, sub: `${paidInvoices.length} Fatura Tamamen Kapatıldı`, cls: 'text-amber-300' },
              { label: 'Eşya Bağışları', icon: <Package className="w-4 h-4" />, value: `${mySubmittedListings.length} Adet`, sub: 'Gönderdiğiniz Eşya İlanları', cls: 'text-amber-300' },
              { label: 'Dokunulan Hayat', icon: <Heart className="w-4 h-4" />, value: `${helpedFamilies} Aile`, sub: 'Türkiye Geneli Doğrudan', cls: 'text-white' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
                <div className="flex items-center justify-between mb-2"><span className="text-[#e0f7f5] text-[11px] font-semibold">{s.label}</span>
                  <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20">{s.icon}</div></div>
                <div className={`text-2xl font-black mb-0.5 ${s.cls}`}>{s.value}</div>
                <span className="text-[10px] text-[#e0f7f5]/80 block">{s.sub}</span>
              </div>
            ))}
            <div onClick={() => handleNavigation('verification')} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 hover:bg-white/[0.14] cursor-pointer">
              <div className="flex items-center justify-between mb-2"><span className="text-[#e0f7f5] text-[11px] font-semibold">Şeffaflık Belgeleri</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20"><ShieldCheck className="w-4 h-4" /></div></div>
              <div className="text-2xl font-black text-[#80ede5] mb-0.5">{myDonationHistory.length} Belge</div>
              <span className="text-[10px] text-[#e0f7f5] underline block">İncelemek İçin Tıkla ➔</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PROFİL */}
        {viewMode === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`${card} p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#22b2a6] text-white rounded-2xl overflow-hidden flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  {profileAvatar ? <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" /> : initials}
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 bg-[#22b2a6]/10 hover:bg-[#22b2a6]/20 text-[#1b9187] border border-[#22b2a6]/30 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer">
                    <Camera className="w-4 h-4" /><span>Profil Fotoğrafı Yükle</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const r = new FileReader();
                      r.onloadend = () => { setProfileAvatar(r.result as string); showToast('Profil fotoğrafı bu oturum için güncellendi.'); };
                      r.readAsDataURL(file);
                    }} />
                  </label>
                  <span className="text-[10px] opacity-60 block mt-1">PNG, JPG veya WEBP (Max 5MB)</span>
                </div>
              </div>
              <div className={`px-4 py-3 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] opacity-60 block font-bold uppercase tracking-wider">Durum</span>
                <span className="text-lg font-black text-[#22b2a6]">{myDonationHistory.length > 0 ? 'Aktif' : 'Yeni'}</span>
              </div>
            </div>

            <div className={`${card} p-6 sm:p-8`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><User className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-bold">Kişisel, Meslek ve Adres Bilgilerim</h3></div>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block font-bold mb-1.5 opacity-80">Ad Soyad</label><input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={inputCls} /></div>
                  <div><label className="block font-bold mb-1.5 opacity-80">E-posta Adresi</label><input type="email" value={profileEmail} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block font-bold mb-1.5 opacity-80">Telefon Numarası</label><input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className={inputCls} /></div>
                  <div><label className="block font-bold mb-1.5 opacity-80">Meslek / Çalışma Alanı</label><input type="text" value={profileProfession} onChange={(e) => setProfileProfession(e.target.value)} placeholder="Örn: Yazılım Mühendisi, Öğretmen vb." className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block font-bold mb-1.5 opacity-80">Şehir (İl)</label><Select value={profileCity} options={Object.keys(TURKEY_CITIES)} onChange={handleProfileCityChange} darkMode={darkMode} maxH="max-h-60" /></div>
                  <div><label className="block font-bold mb-1.5 opacity-80">İlçe</label><Select value={profileDistrict} options={TURKEY_CITIES[profileCity] || []} onChange={setProfileDistrict} darkMode={darkMode} maxH="max-h-60" /></div>
                </div>
                <div><label className="block font-bold mb-1.5 opacity-80">Açık Adres (Eşya Toplama / Lojistik İçin)</label>
                  <textarea rows={2} value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} placeholder="Mahalle, Cadde, Sokak, No ve Daire bilgisi" className={inputCls}></textarea></div>
                <button type="button" onClick={handleSaveProfile} className={`${primaryBtn} py-3 px-6`}>Bilgileri Kaydet</button>
              </div>
            </div>
          </div>
        )}

        {/* AYARLAR */}
        {viewMode === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`${card} p-6 sm:p-8`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><Lock className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-bold">Şifre Değiştir</h3></div>
              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block font-bold mb-1.5 opacity-80">Mevcut Şifre</label><PasswordInput  placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} /></div>
                  <div><label className="block font-bold mb-1.5 opacity-80">Yeni Şifre</label><PasswordInput  placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} /></div>
                </div>
                <button type="submit" className={`${primaryBtn} py-3 px-6`}>Şifreyi Güncelle</button>
              </form>
            </div>
            <div className={`${card} p-6 sm:p-8`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><Settings className="w-5 h-5 text-[#22b2a6]" /><h3 className="text-base font-bold">Uygulama ve Bildirim Tercihleri</h3></div>
              <div className="space-y-6 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#22b2a6]/10 text-[#22b2a6] rounded-xl border border-[#22b2a6]/30">{darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</div>
                    <div><span className="font-bold block">Karanlık Mod (Dark Mode)</span><span className="text-[11px] opacity-60">Göz yormayan koyu renk tema deneyimi</span></div>
                  </div>
                  <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${darkMode ? 'bg-[#22b2a6] justify-end' : 'bg-slate-300 justify-start'}`}><div className="bg-white w-4 h-4 rounded-full shadow-md"></div></button>
                </div>
                <div className={`pt-4 border-t space-y-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className="font-bold flex items-center gap-1.5 mb-2"><Bell className="w-4 h-4 text-[#22b2a6]" /> Bildirim Tercihleri</span>
                  <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={notifA} onChange={(e) => setNotifA(e.target.checked)} className="w-4 h-4 rounded" /><span>Bağışınız yerine ulaştığında veya makbuz üretildiğinde bildirim al</span></label>
                  <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={notifB} onChange={(e) => setNotifB(e.target.checked)} className="w-4 h-4 rounded" /><span>Eşya bağış ilanınız vakıf tarafından onaylandığında bildirim al</span></label>
                  <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={notifC} onChange={(e) => setNotifC(e.target.checked)} className="w-4 h-4 rounded" /><span>Acil fatura yardımları eklendiğinde anlık bildirim al</span></label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* İHTİYAÇ İLANLARI */}
        {viewMode === 'explore' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`${card} p-5 sm:p-6 space-y-4`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#22b2a6]" /><span>Vakıf Onaylı Canlı Destek Borsası</span></h2>
                  <p className="text-xs opacity-70 mt-0.5">İhtiyaç sahibi taleplerini inceleyin, onay vererek doğrudan destek olun.</p>
                </div>
                <div className={`flex items-center gap-1.5 p-1 rounded-2xl border flex-wrap ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  {([['all', 'Tümü'], ['fatura', 'Faturalar'], ['esya_talebi', 'Eşya / Diğer Talepler'], ['approved', 'Onaylananlar']] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setActiveFilter(k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${activeFilter === k ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-7 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 opacity-50"><Search className="w-4 h-4" /></span>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="İhtiyaç başlığı veya açıklama içinde ara..." className={`${inputCls} rounded-2xl pl-10`} />
                </div>
                <div className="sm:col-span-5">
                  <Select value={selectedCityFilter} options={['Tümü', ...Object.keys(TURKEY_CITIES)]} onChange={setSelectedCityFilter} darkMode={darkMode} big maxH="max-h-60" />
                </div>
              </div>
            </div>

            {needsError && (
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold">Talepler okunamadı: {needsError}</div>
            )}

            {!needsError && filteredItems.length === 0 && (
              <div className={`${card} p-12 text-center space-y-2`}>
                <Search className="w-8 h-8 text-[#22b2a6] mx-auto" />
                <h3 className="text-base font-extrabold">Şu an gösterilecek ihtiyaç bulunmuyor</h3>
                <p className="text-xs opacity-70">Filtreleri değiştirmeyi deneyin veya daha sonra tekrar bakın.</p>
              </div>
            )}

            <div className="space-y-4">
              {filteredItems.map((item) => {
                let urgencyBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                let iconBg = 'bg-[#22b2a6]/10 text-[#22b2a6] border-[#22b2a6]/30';
                let urgencyText = 'Normal İhtiyaç';
                if (item.urgencyLevel === 'high') { urgencyBadge = 'bg-rose-50 text-rose-800 border-rose-200'; iconBg = 'bg-rose-50 text-rose-700 border-rose-200'; urgencyText = 'Çok Acil / Kritik'; }
                else if (item.urgencyLevel === 'medium') { urgencyBadge = warnBadge; iconBg = 'bg-amber-50 text-amber-700 border-amber-200'; urgencyText = 'Acil Destek'; }

                return (
                  <div key={item.id} className={`${card} p-5 sm:p-6 hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3.5 rounded-2xl shrink-0 border shadow-sm ${iconBg}`}>{item.type === 'fatura' ? <FileText className="w-6 h-6" /> : <Package className="w-6 h-6" />}</div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`${badge} ${urgencyBadge}`}>{urgencyText}</span>
                          <span className={`${badge} ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>{item.category}</span>
                          {item.location && <span className="text-[11px] opacity-60 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>}
                          <span className="text-[11px] opacity-50">• {item.date}</span>
                        </div>
                        <h3 className="text-base font-extrabold">{item.title}</h3>
                        {item.description && item.description !== item.title && <p className="text-xs opacity-75 leading-relaxed">{item.description}</p>}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#1b9187] font-bold pt-1"><CheckCircle2 className="w-4 h-4" /><span>{item.inspector}</span></div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                      {item.amount > 0 && (
                        <div className="text-left md:text-right">
                          <span className="text-[10px] opacity-60 block font-semibold">Talep Edilen Tutar</span>
                          <span className="text-xl font-black text-[#1b9187]">{item.amount} TL</span>
                        </div>
                      )}
                      <div className="w-full md:w-48">
                        {item.type === 'fatura' ? (
                          <>
                            {item.paymentStatus === 'none' && (
                              <button onClick={() => setItemToRequestApproval(item)} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700">
                                <Clock className="w-3.5 h-3.5 text-[#22b2a6]" /><span>Onay İste</span></button>
                            )}
                            {item.paymentStatus === 'requested' && (
                              <div className="w-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs py-3 rounded-xl text-center flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5 animate-spin" /><span>Onay Bekleniyor</span></div>
                            )}
                            {item.paymentStatus === 'approved' && (
                              <button onClick={() => { setActiveItemToPay(item); setShowConfirmModal(true); }} className={`${primaryBtn} w-full text-xs py-3 flex items-center justify-center gap-1.5 animate-pulse`}>
                                <CheckCircle2 className="w-3.5 h-3.5" /><span>Ödemeyi Yap</span></button>
                            )}
                          </>
                        ) : (
                          <button onClick={() => setItemToFulfill(item)} className={`w-full text-xs font-bold py-3 rounded-xl cursor-pointer border shadow-sm ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}`}>Sağlayabilirim</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EŞYA BAĞIŞLARIM */}
        {viewMode === 'my_item_listings' && (() => {
          const list = bySubmissionTab(itemListingTab);
          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`${card} p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-3 py-1 rounded-full">Bağışçı Portalı</span>
                  <h2 className="text-xl sm:text-2xl font-black pt-1">Eşya Bağışlarım & Takip Paneli</h2>
                  <p className="text-xs opacity-75 max-w-xl">Vakıf onayına sunduğunuz eşya bağışlarınızın durumunu inceleyin, lojistik süreçlerini takip edin.</p>
                </div>
                <button onClick={() => handleNavigation('create_listing')} className={`${primaryBtn} font-extrabold text-xs py-3.5 px-6 rounded-2xl flex items-center gap-2 shrink-0`}><PlusCircle className="w-4 h-4" /><span>Yeni Eşya Bağışla</span></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Toplam İlan', v: mySubmittedListings.length, icon: <Package className="w-6 h-6" />, c: 'bg-[#22b2a6]/10 text-[#22b2a6] border-[#22b2a6]/30' },
                  { label: 'Yayında Olanlar', v: approvedCount, icon: <CheckCircle2 className="w-6 h-6" />, c: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
                  { label: 'İncelemede Bekleyen', v: pendingCount, icon: <Clock className="w-6 h-6" />, c: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
                ].map((s) => (
                  <div key={s.label} className={`${card} p-4 flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.c}`}>{s.icon}</div>
                    <div><span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">{s.label}</span><span className="text-xl font-black">{s.v} Adet</span></div>
                  </div>
                ))}
              </div>

              <div className={tabsWrap}>
                <button onClick={() => setItemListingTab('all')} className={tabBtn(itemListingTab === 'all')}>Tüm İlanlarım ({mySubmittedListings.length})</button>
                <button onClick={() => setItemListingTab('approved')} className={tabBtn(itemListingTab === 'approved')}>Yayında Olanlar</button>
                <button onClick={() => setItemListingTab('pending')} className={tabBtn(itemListingTab === 'pending')}>İncelemedekiler</button>
              </div>

              {list.length === 0 ? (
                <div className={`${card} p-12 text-center space-y-3`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30"><Package className="w-8 h-8" /></div>
                  <h3 className="text-base font-extrabold">Bu sekmede henüz ilan bulunmuyor</h3>
                  <p className="text-xs opacity-70 max-w-sm mx-auto">Kullanmadığınız eşyalarınızı bağışlayarak ihtiyaç sahibi ailelerin hayatına dokunabilirsiniz.</p>
                  <button onClick={() => handleNavigation('create_listing')} className={`${primaryBtn} mt-2 text-xs py-2.5 px-5 inline-flex items-center gap-2`}><PlusCircle className="w-4 h-4" /> Eşya Bağışla</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {list.map((item) => {
                    const isApproved = isApprovedStatus(item.status);
                    return (
                      <div key={item.id} className={`${card} p-5 sm:p-6 hover:shadow-md space-y-4`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#22b2a6]/10 border border-[#22b2a6]/30 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-[#22b2a6]" />}
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusPill s={item.status} />
                                <span className={`${badge} bg-slate-100 border-slate-200 text-slate-700`}>{item.category}</span>
                                <span className="text-[11px] opacity-60 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.city} / {item.district}</span>
                              </div>
                              <h3 className="text-base font-extrabold">{item.title}</h3>
                              <p className="text-xs opacity-75">Kondisyon: <strong className="text-[#1b9187]">{item.condition}</strong></p>
                              <div className="pt-2 flex items-center gap-2 text-[10px] font-bold">
                                <span className="text-[#1b9187]">✓ Vakıf İncelemesi</span><span className="opacity-40">›</span>
                                <span className={isApproved ? 'text-[#1b9187]' : 'opacity-40'}>{isApproved ? '✓' : '2'} Yayında & Eşleştirme</span><span className="opacity-40">›</span>
                                <span className="opacity-40">3 Kurye Teslimatı</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setEditingItem({ ...item })} className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"><Edit3 className="w-3.5 h-3.5 text-[#22b2a6]" /><span>Düzenle</span></button>
                            <button onClick={() => handleDeleteListing(item.id)} className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>Sil</span></button>
                          </div>
                        </div>

                        {isApproved && (
                          <div className="pt-4 border-t border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl space-y-3">
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">🟩 Eşleşme Sağlandı & Vakıf Onayladı</span>
                            <p className="text-xs font-bold text-[#1b9187]">🎉 "{item.title}" bağışınız ihtiyacı olan bir aile ile eşleştirildi.</p>
                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                              {revealedPhoneId === item.id ? (
                                <div className="bg-[#22b2a6]/10 text-[#1b9187] font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2"><Phone className="w-4 h-4" /><span>Tel: 0216 555 00 00 (Ayşe H.)</span></div>
                              ) : (
                                <button onClick={() => setRevealedPhoneId(item.id)} className={`${primaryBtn} w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5`}><Phone className="w-3.5 h-3.5" /><span>Vakıf Yetkilisini Ara</span></button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* EŞYA BAĞIŞLA */}
        {viewMode === 'create_listing' && (
          <div className={`${card} max-w-2xl mx-auto p-6 sm:p-8`}>
            <div className={`mb-6 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-2.5 py-1 rounded-md">Eşya Bağış Formu</span>
              <h2 className="text-xl font-extrabold mt-2">Kullanmadığınız Eşyayı Bağışlayın</h2>
            </div>
            <form onSubmit={handleCreateListing} className="space-y-5 text-xs">
              <div><label className="block font-bold mb-1.5 opacity-80">Eşya Başlığı</label>
                <input type="text" required value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Örn: Çalışma Masası ve Sandalye Takımı" className={inputCls} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1.5 opacity-80">Kategori</label><Select value={itemCategory} options={CATEGORIES} onChange={setItemCategory} darkMode={darkMode} /></div>
                <div><label className="block font-bold mb-1.5 opacity-80">Eşya Durumu / Kondisyonu</label><Select value={itemCondition} options={CONDITIONS} onChange={setItemCondition} darkMode={darkMode} /></div>
              </div>
              <div>
                <label className="block font-bold mb-1.5 opacity-80">Eşya Fotoğrafı Yükle</label>
                <div className={`border-2 border-dashed rounded-2xl p-4 text-center ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  {itemImage ? (
                    <div className="space-y-2">
                      <img src={itemImage} alt="Önizleme" className="w-full h-36 object-cover rounded-xl" />
                      <button type="button" onClick={() => setItemImage(null)} className="text-rose-600 font-bold hover:underline text-[11px]">Fotoğrafı Kaldır / Değiştir</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center space-y-2 py-4">
                      <div className="w-10 h-10 rounded-xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center border border-[#22b2a6]/30"><ImageIcon className="w-5 h-5" /></div>
                      <div><span className="font-bold block">Fotoğraf seçmek için tıklayın</span><span className="text-[10px] opacity-60">PNG, JPG veya WEBP (Max. 5MB)</span></div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1.5 opacity-80">Şehir (İl)</label><Select value={selectedCity} options={Object.keys(TURKEY_CITIES)} onChange={handleCityChange} darkMode={darkMode} maxH="max-h-60" /></div>
                <div><label className="block font-bold mb-1.5 opacity-80">İlçe</label><Select value={selectedDistrict} options={TURKEY_CITIES[selectedCity] || []} onChange={setSelectedDistrict} darkMode={darkMode} maxH="max-h-60" /></div>
              </div>
              <button type="submit" disabled={isSaving} className={`${primaryBtn} w-full font-extrabold py-3.5 px-4 text-xs disabled:opacity-60`}>{isSaving ? 'Gönderiliyor...' : 'İlanı Vakıf Onayına Gönder'}</button>
            </form>
          </div>
        )}

        {/* BAĞIŞ GEÇMİŞİ */}
        {viewMode === 'history' && (() => {
          const filtered = myDonationHistory.filter((r) => historyTab === 'fatura' ? r.type === 'fatura' : historyTab === 'esya' ? r.type === 'esya' : true);
          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`${card} p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-3 py-1 rounded-full">Resmi Arşiv</span>
                  <h2 className="text-xl sm:text-2xl font-black pt-1">Bağış Geçmişim & Makbuzlar</h2>
                  <p className="text-xs opacity-75 max-w-xl">Ödediğiniz faturaları ve bağışlarınızı inceleyin, makbuzlarınızı indirin.</p>
                </div>
                <div className="bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-5 py-3 rounded-2xl text-center shrink-0">
                  <span className="text-[10px] font-bold opacity-70 block uppercase">Toplam Destek</span>
                  <span className="text-lg font-black text-[#1b9187]">{totalDonatedAmount.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
              <div className={tabsWrap}>
                <button onClick={() => setHistoryTab('all')} className={tabBtn(historyTab === 'all')}>Tüm Bağışlar ({myDonationHistory.length})</button>
                <button onClick={() => setHistoryTab('fatura')} className={tabBtn(historyTab === 'fatura')}>Faturalar</button>
                <button onClick={() => setHistoryTab('esya')} className={tabBtn(historyTab === 'esya')}>Eşya / Diğer</button>
              </div>
              {filtered.length === 0 ? (
                <div className={`${card} p-12 text-center space-y-3`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30"><History className="w-8 h-8" /></div>
                  <h3 className="text-base font-extrabold">Bu kategoride henüz bağış kaydınız bulunmuyor</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((r) => (
                    <div key={r.id} className={`${card} p-5 sm:p-6 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center border border-[#22b2a6]/30 shrink-0"><FileText className="w-6 h-6" /></div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2"><span className={`${badge} ${okBadge}`}>Kayıtlı</span><span className="text-[11px] opacity-60 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.location}</span><span className="text-[11px] opacity-50">• {r.date}</span></div>
                          <h3 className="text-base font-extrabold">{r.title}</h3>
                          <p className="text-xs opacity-75">Belge Numarası: <strong className="text-[#1b9187]">{r.receiptNo}</strong></p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 shrink-0">
                        <div className="sm:text-right"><span className="text-[10px] opacity-60 block font-semibold">Ödenen Tutar</span><span className="text-xl font-black text-[#1b9187]">{r.amount} TL</span></div>
                        <button onClick={() => handleDownloadReceipt(r.receiptNo, r.title, r.amount, r.location, r.date)} className={`${primaryBtn} flex items-center gap-2 text-xs py-3 px-5`}><Download className="w-4 h-4" /><span>PDF Makbuz İndir</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* VAKIF ONAY SÜRECİ */}
        {viewMode === 'verification' && (() => {
          const list = bySubmissionTab(verificationTab);
          return (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-[#1b9187] via-[#147a71] to-slate-900 text-white p-8 rounded-3xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-extrabold text-[#80ede5]"><ShieldCheck className="w-4 h-4" /><span>Vakıf Denetim Masası & Şeffaflık Takibi</span></div>
                    <h2 className="text-2xl sm:text-3xl font-black">Eşya Bağışı Onay ve Süreç Merkezi</h2>
                    <p className="text-[#e0f7f5] text-xs sm:text-sm leading-relaxed max-w-xl">Bağışladığınız eşyaların inceleme ve onay durumlarını buradan takip edebilirsiniz.</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0">
                    <div className="text-center"><span className="text-[10px] uppercase font-bold block">Onaylanan</span><span className="text-xl font-black text-emerald-300">{approvedCount}</span></div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center"><span className="text-[10px] uppercase font-bold block">İncelemede</span><span className="text-xl font-black text-amber-300">{pendingCount}</span></div>
                  </div>
                </div>
              </div>
              <div className={tabsWrap}>
                <button onClick={() => setVerificationTab('all')} className={tabBtn(verificationTab === 'all')}>Tüm İlanlarım ({mySubmittedListings.length})</button>
                <button onClick={() => setVerificationTab('approved')} className={tabBtn(verificationTab === 'approved')}>Onaylanan ({approvedCount})</button>
                <button onClick={() => setVerificationTab('pending')} className={tabBtn(verificationTab === 'pending')}>İncelemede ({pendingCount})</button>
              </div>
              {list.length === 0 ? (
                <div className={`${card} p-12 text-center space-y-3`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30"><FileCheck className="w-8 h-8" /></div>
                  <h3 className="text-base font-extrabold">Bu filtrede eşya ilanı bulunmuyor</h3>
                </div>
              ) : (
                <div className="space-y-6">
                  {list.map((l) => {
                    const ok = isApprovedStatus(l.status);
                    return (
                      <div key={l.id} className={`${card} p-6 sm:p-7 hover:shadow-md space-y-5`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${ok ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>{ok ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}</div>
                            <div>
                              <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">İlan ID: #{String(l.id).slice(0, 8)} • {l.category}</span>
                              <h3 className="text-lg font-extrabold mt-0.5">{l.title}</h3>
                            </div>
                          </div>
                          <StatusPill s={l.status} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-4">
                            <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative">
                              {l.image ? <img src={l.image} alt={l.title} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Package className="w-10 h-10 text-[#22b2a6] mx-auto mb-1 opacity-60" /><span className="text-[11px] font-bold opacity-60 block">Fotoğraf Yüklenmedi</span></div>}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1"><MapPin className="w-3 h-3 text-[#22b2a6]" /> {l.city} / {l.district}</div>
                            </div>
                          </div>
                          <div className="md:col-span-8 space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {[['Kondisyon Durumu', l.condition], ['Lokasyon', `${l.city}, ${l.district}`], ['Eksper Raporu', ok ? 'Onaylandı & Mühürlendi' : 'İnceleme Sırasında']].map(([k, v]) => (
                                <div key={k} className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}><span className="text-[10px] opacity-60 block font-bold uppercase">{k}</span><span className="font-extrabold mt-0.5 block">{v}</span></div>
                              ))}
                            </div>
                            <div className={`p-4 rounded-2xl border ${ok ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
                              <p className="text-xs leading-relaxed text-slate-700">{ok ? 'Bu eşya vakıf uzmanlarınca incelenmiş ve bir aile ile eşleştirilmiştir. Kurye ve lojistik ekibimiz teslimat için hazırlıklara başlamıştır.' : 'Eşyanızın fotoğrafları ve kondisyon beyanı vakıf inceleme komisyonumuzca değerlendirilmektedir. Ortalama onay süresi 24 saattir.'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </main>

      <footer className="bg-[#181C20] text-[#9CA3AF] py-12 px-6 sm:px-12 lg:px-20 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#6B7280] block mb-1">AZİZ MAHMÛD</span>
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white block">HÜDÂYİ VAKFI</span>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2.5 text-xs font-semibold">
            <a href="#" className="hover:text-white transition-colors">Kurumsal Sayfa</a>
            <a href="#" className="hover:text-white transition-colors">Hesap Numaralarımız</a>
            <a href="#" className="hover:text-white transition-colors">İletişim</a>
            <a href="#" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</a>
            <a href="#" className="hover:text-white transition-colors">Bilgi Güvenliği ve Gizlilik Politikası</a>
          </div>
        </div>
      </footer>
    </div>
  );
}