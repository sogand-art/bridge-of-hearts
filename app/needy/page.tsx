'use client';

import React, { useState, useRef, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, getDoc, addDoc, updateDoc, deleteDoc, collection,
  query, where, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Heart, ShieldCheck, FileText, Package, ArrowUpRight, 
  MapPin, CheckCircle2, PlusCircle, User, Truck, 
  UploadCloud, AlertCircle, ExternalLink, 
  Menu, X, Settings, LogOut, HelpCircle, History, Check, 
  Clock, Lock, KeyRound, MessageSquare, Calendar, FileCheck, 
  ArrowLeft, Trash2, AlertTriangle, UserCheck, ShieldAlert,
  CalendarDays, RefreshCw, Bell, Shield, Sparkles, CheckSquare,
  Filter, Download, Gift, Image as ImageIcon, Search, ChevronDown, Info, Edit3, Save, Camera, Mail, Moon, Sun
} from 'lucide-react';

// TÜRKIYE'NİN 81 ILI
const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "KütauseEffecthya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const CATEGORIES = ["Tümü", "Mobilya", "Giyim", "Elektronik", "Beyaz Eşya"];

const INITIAL_AVAILABLE_DONATIONS = [
  {
    id: 201,
    title: 'Ahşap Çalışma Masası ve Ergonomik Sandalye',
    category: 'Mobilya',
    city: 'İstanbul',
    district: 'Sancaktepe',
    donorName: 'Zeynep K.',
    condition: 'İkinci El / Çok Temiz',
    description: 'Öğrenci kardeşlerimizin ders çalışması için uygun, sağlam çalışma masası.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    date: '16 Ekim 2026'
  },
  {
    id: 202,
    title: 'Çocuk Kışlık Mont ve Bot Seti (Numara 36)',
    category: 'Giyim',
    city: 'İstanbul',
    district: 'Ümraniye',
    donorName: 'Mehmet B.',
    condition: 'Sıfır / Etiketli',
    description: 'Hiç giyilmemiş, kışlık mont ve bot seti.',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    date: '15 Ekim 2026'
  },
  {
    id: 203,
    title: 'Dizüstü Bilgisayar (Eğitim Destekli)',
    category: 'Elektronik',
    city: 'Ankara',
    district: 'Çankaya',
    donorName: 'Ahmet T.',
    condition: 'İkinci El / Çalışır Durumda',
    description: 'Üniversite veya lise eğitimi için uygun formatlanmış dizüstü bilgisayar.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    date: '14 Ekim 2026'
  }
];
const compressImage = (dataUrl: string, maxSize = 1000, quality = 0.7): Promise<string> =>
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
export default function NeedyDashboardPage() {
  const [availableDonations, setAvailableDonations] = useState(INITIAL_AVAILABLE_DONATIONS);

  const [requests, setRequests] = useState<any[]>([]);
  const [publicMap, setPublicMap] = useState<Record<string, any>>({});
  
  const [requestedItemIds, setRequestedItemIds] = useState<number[]>([]);
  const [itemRequestMap, setItemRequestMap] = useState<Record<number, any>>({});
  
  const [viewMode, setViewMode] = useState<'donations_market' | 'my_requests' | 'profile' | 'settings'>('my_requests');
  
  const [requestTabFilter, setRequestTabFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [newRequestType, setNewRequestType] = useState<'esya' | 'fatura'>('fatura');
  const [isModalTypeDropdownOpen, setIsModalTypeDropdownOpen] = useState(false);
  const modalTypeDropdownRef = useRef<HTMLDivElement>(null);

  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestInstitution, setNewRequestInstitution] = useState('');
  const [newRequestAmount, setNewRequestAmount] = useState('');
  const [newRequestDueDate, setNewRequestDueDate] = useState('');
  const [newRequestInvoicePhoto, setNewRequestInvoicePhoto] = useState<string | null>(null);

  const invoicePhotoInputRef = useRef<HTMLInputElement>(null);
  const [newRequestInvoiceFile, setNewRequestInvoiceFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [requestToDelete, setRequestToDelete] = useState<any>(null);

  // ---- Giriş yapan kullanıcının bilgileri (Firestore'dan yüklenir) ----
  const [authReady, setAuthReady] = useState(false);
  const [applicantInfo, setApplicantInfo] = useState({
    fullName: '',
    identityNo: '',
    city: '',
    district: '',
    phone: '',
    gmail: '',
    address: '',
    avatarUrl: ''
  });


     useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUid(user.uid);
      try {
        const [snap, pSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'userPrivate', user.uid)).catch(() => null),
        ]);

        if (!snap.exists()) {
          await signOut(auth);
          window.location.href = '/login';
          return;
        }
        const d: any = snap.data();

        if (d.role !== 'needy') {
          window.location.href = '/donor';
          return;
        }
        if (d.status !== 'active' && d.status !== 'approved') {
          await signOut(auth);
          window.location.href = '/login';
          return;
        }

        const tc = pSnap && pSnap.exists() ? pSnap.data().tcNo || '' : '';

        setApplicantInfo({
          fullName: d.fullName || '',
          identityNo: tc ? tc.slice(0, 3) + '********' : '',
          city: d.city || '',
          district: d.district || '',
          phone: d.phone || '',
          gmail: d.email || user.email || '',
          address: d.address || '',
          avatarUrl: ''
        });
      } catch (err) {
        console.error('Profil yüklenemedi:', err);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);
  // ---- Talepleri Firestore'dan canlı çek ----
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'requests'), where('userId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data: any = d.data();
        return { ...data, id: d.id };
      });
      list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRequests(list);
      setRequestedItemIds(list.filter((r: any) => r.originalDonationId).map((r: any) => r.originalDonationId));
    }, (err) => console.error('Talepler okunamadı:', err));
    return () => unsub();
  }, [uid]);
    useEffect(() => {
    const unsubs = requests
      .filter((r) => r.status === 'approved_waiting_donor')
      .map((r) =>
        onSnapshot(doc(db, 'publicNeeds', r.id), (s) => {
          setPublicMap((prev) => ({ ...prev, [r.id]: s.exists() ? s.data() : undefined }));
        }, (err) => console.error('publicNeeds okunamadı:', err))
      );
    return () => unsubs.forEach((u) => u());
  }, [requests]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(applicantInfo);

  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedCity, setSelectedCity] = useState('Tümü');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const categoryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [targetItemToRequest, setTargetItemToRequest] = useState<any>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
      if (modalTypeDropdownRef.current && !modalTypeDropdownRef.current.contains(event.target as Node)) {
        setIsModalTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Vitrinden eşya talep etme (Firestore'a yazar)
  const handleConfirmRequest = async () => {
    if (!targetItemToRequest || !uid) return;
    const item = targetItemToRequest;
    try {
      await addDoc(collection(db, 'requests'), {
        userId: uid,
        applicantName: applicantInfo.fullName,
        applicantPhone: applicantInfo.phone,
        applicantAddress: applicantInfo.address,
        city: applicantInfo.city,
        district: applicantInfo.district,
        originalDonationId: item.id,
        type: 'esya',
        title: item.title,
        category: item.category,
        amount: 0,
        status: 'pending_review',
        statusText: 'Vakıf İncelemesinde / Onay Bekleniyor',
        institution: `${item.city} / ${item.district}`,
        dueDate: '',
        imageUrl: item.imageUrl,
        invoicePhoto: '',
        donorName: item.donorName,
        createdAt: serverTimestamp()
      });
      setSuccessBanner(`"${item.title}" için talep oluşturuldu. Vakıf onay aşamasına alındı.`);
      setTargetItemToRequest(null);
    } catch (err) {
      console.error('Talep gönderilemedi:', err);
      alert('Talep gönderilemedi. Lütfen tekrar deneyin.');
    }
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleExecuteDeleteRequest = async () => {
    if (!requestToDelete) return;
    try {
      await deleteDoc(doc(db, 'requests', requestToDelete.id));
      setRequestToDelete(null);
      setSuccessBanner('Talep başarıyla iptal edildi / silindi.');
    } catch (err) {
      console.error('Talep silinemedi:', err);
      alert('Talep silinemedi.');
    }
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleOpenEditRequest = (req: any) => {
    setEditingRequestId(req.id);
    setNewRequestType(req.type);
    setNewRequestTitle(req.title);
    setNewRequestInstitution(req.institution || '');
    setNewRequestAmount(req.amount ? req.amount.toString() : '');
    setNewRequestDueDate(req.dueDate || '');
    setNewRequestInvoicePhoto(req.invoicePhoto || null);
    setNewRequestInvoiceFile(null);
    setIsNewRequestModalOpen(true);
  };

  const handleInvoicePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya en fazla 5MB olabilir.');
      return;
    }
    setNewRequestInvoiceFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewRequestInvoicePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetRequestForm = () => {
    setIsNewRequestModalOpen(false);
    setEditingRequestId(null);
    setNewRequestTitle('');
    setNewRequestInstitution('');
    setNewRequestAmount('');
    setNewRequestDueDate('');
    setNewRequestInvoicePhoto(null);
    setNewRequestInvoiceFile(null);
  };

  const handleSaveCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestTitle || !uid || isSaving) return;
    setIsSaving(true);

    try {
      const isFatura = newRequestType === 'fatura';
      const institutionValue = isFatura ? newRequestInstitution : 'Sosyal İnceleme Birimi';

           let invoicePhotoUrl = '';
      if (isFatura && newRequestInvoiceFile && newRequestInvoicePhoto) {
        invoicePhotoUrl = await compressImage(newRequestInvoicePhoto);
      }

      if (editingRequestId) {
        const updates: any = {
          type: newRequestType,
          title: newRequestTitle,
          institution: institutionValue,
          amount: isFatura && newRequestAmount ? Number(newRequestAmount) : 0,
          dueDate: isFatura ? newRequestDueDate : '',
          category: isFatura ? 'Fatura Ödemesi' : 'Özel Eşya / Destek',
          updatedAt: serverTimestamp()
        };
        if (invoicePhotoUrl) updates.invoicePhoto = invoicePhotoUrl;
        await updateDoc(doc(db, 'requests', editingRequestId), updates);
        setSuccessBanner('Talep bilgileriniz başarıyla güncellendi.');
      } else {
        await addDoc(collection(db, 'requests'), {
          userId: uid,
          applicantName: applicantInfo.fullName,
          applicantPhone: applicantInfo.phone,
          applicantAddress: applicantInfo.address,
          city: applicantInfo.city,
          district: applicantInfo.district,
          originalDonationId: null,
          type: newRequestType,
          title: newRequestTitle,
          category: isFatura ? 'Fatura Ödemesi' : 'Özel Eşya / Destek',
          amount: isFatura && newRequestAmount ? Number(newRequestAmount) : 0,
          status: 'pending_review',
          statusText: 'Vakıf İncelemesinde / Onay Bekleniyor',
          institution: institutionValue,
          dueDate: isFatura ? newRequestDueDate : '',
          imageUrl: '',
          invoicePhoto: invoicePhotoUrl,
          donorName: '-',
          createdAt: serverTimestamp()
        });
        setSuccessBanner(`Sayın ${applicantInfo.fullName}, talebiniz vakıf incelemesine gizli olarak gönderildi.`);
      }

      resetRequestForm();
    } catch (err) {
      console.error('Talep kaydedilemedi:', err);
      alert('Talep kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicantInfo(tempProfile);
    setIsEditingProfile(false);
    setSuccessBanner('Profil ve iletişim bilgileriniz başarıyla güncellendi.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setApplicantInfo(prev => ({ ...prev, avatarUrl: result }));
        setSuccessBanner('Profil fotoğrafınız galeriden başarıyla güncellendi.');
        setTimeout(() => setSuccessBanner(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('Yeni şifreler birbiriyle uyuşmuyor!');
      return;
    }
    setSuccessBanner('Şifreniz başarıyla güncellendi.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleNavigation = (mode: 'donations_market' | 'my_requests' | 'profile' | 'settings') => {
    setViewMode(mode);
    setIsSidebarOpen(false);
  };

  const filteredDonations = availableDonations.filter(item => {
    const matchesCategory = selectedCategory === 'Tümü' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesCity = selectedCity === 'Tümü' || item.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesCategory && matchesCity;
  });

  const filteredCities = TURKEY_CITIES.filter(city => 
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(req => {
    if (requestTabFilter === 'all') return true;
    if (requestTabFilter === 'pending') return req.status === 'pending_review';
    if (requestTabFilter === 'approved') return req.status === 'approved_waiting_donor';
    if (requestTabFilter === 'completed') return req.status === 'completed';
    return true;
  });

  const initials =
    applicantInfo.fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-slate-500 text-sm font-bold">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative selection:bg-emerald-600/25 selection:text-emerald-950 transition-colors duration-300 flex flex-col justify-between ${
      isDarkMode ? 'bg-[#121c16] text-[#E2ECE5]' : 'bg-[#FAF8F5] text-[#1B3022]'
    }`}>
      <div className="space-y-0 w-full flex flex-col">
      
        {/* GİZLİ DOSYA SEÇİCİ (GALERİ) */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Fatura Fotoğrafı İçin Gizli Seçici */}
        <input 
          type="file" 
          ref={invoicePhotoInputRef} 
          onChange={handleInvoicePhotoChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* TALEBİ SİLME / İPTAL ETME ONAY MODALI */}
        {requestToDelete !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className={`rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border animate-in fade-in zoom-in-95 space-y-4 ${
              isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60 text-white' : 'bg-white border-emerald-200 text-[#1B3022]'
            }`}>
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Talebi Silmek/İptal Etmek İstediğinize Emin Misiniz?</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                <strong className="font-bold">"{requestToDelete.title}"</strong> başlıklı talebinizi silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setRequestToDelete(null)}
                  className={`flex-1 text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer border ${
                    isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  }`}
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleExecuteDeleteRequest}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-red-700 hover:opacity-95 text-white text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer shadow-md"
                >
                  Evet, Talebi Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VİTRİNDEN TALEP ETME ONAY MODALI */}
        {targetItemToRequest !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className={`rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border animate-in fade-in zoom-in-95 space-y-4 ${
              isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60 text-white' : 'bg-white border-emerald-200 text-[#1B3022]'
            }`}>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-xs">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Talep Göndermek İstediğinize Emin Misiniz?</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                <strong className="font-bold">"{targetItemToRequest.title}"</strong> başlıklı eşya için aşağıdaki adres ve iletişim bilgilerinizle talep oluşturulacaktır.
              </p>

              <div className={`p-3.5 rounded-2xl border space-y-1.5 text-xs ${
                isDarkMode ? 'bg-[#121c16] border-emerald-900/50 text-emerald-100' : 'bg-[#FAF8F5] border-slate-200 text-slate-800'
              }`}>
                <div className="font-extrabold text-emerald-600 flex items-center gap-1.5 pb-1 border-b border-inherit">
                  <UserCheck className="w-4 h-4" />
                  <span>Teslimat & İletişim Bilgileriniz</span>
                </div>
                <div><strong className="opacity-70">Ad Soyad:</strong> {applicantInfo.fullName}</div>
                <div><strong className="opacity-70">Telefon:</strong> {applicantInfo.phone}</div>
                <div><strong className="opacity-70">Adres:</strong> {applicantInfo.address}</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setTargetItemToRequest(null)}
                  className={`flex-1 text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer border ${
                    isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  }`}
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleConfirmRequest}
                  className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-95 text-white text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer shadow-md"
                >
                  Evet, Onay Talebi Gönder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* YENİ TALEP OLUŞTURMA / DÜZENLEME MODALI */}
        {isNewRequestModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60 text-white' : 'bg-white border-emerald-200 text-[#1B3022]'
            }`}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-inherit">
                <div>
                  <h3 className="text-base font-bold">
                    {editingRequestId ? 'Talep Bilgilerini Düzenle' : 'Yeni Destek veya Eşya Talebi Oluştur'}
                  </h3>
                  <span className="text-[10px] opacity-70 font-medium">Bilgileriniz ve açık adresiniz hak sahibi profilinizden otomatik eklenmiştir.</span>
                </div>
                <button onClick={resetRequestForm} className="p-1 opacity-60 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-4 rounded-2xl border mb-5 space-y-2 text-xs ${
                isDarkMode ? 'bg-[#121c16] border-emerald-900/50 text-emerald-100' : 'bg-[#FAF8F5] border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold pb-1 border-b border-inherit">
                  <UserCheck className="w-4 h-4" />
                  <span>Talep Eden Hak Sahibi ve Adres Bilgileri (Otomatik)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] opacity-60 block font-semibold">Ad Soyad</span>
                    <span className="font-bold">{applicantInfo.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 block font-semibold">İletişim No</span>
                    <span className="font-bold">{applicantInfo.phone}</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-[10px] opacity-60 block font-semibold">Açık Teslimat Adresi</span>
                    <span className="font-bold text-emerald-500">{applicantInfo.address}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveCustomRequest} className="space-y-4">
                <div className="relative" ref={modalTypeDropdownRef}>
                  <label className="block text-xs font-bold mb-1.5">Talep Türü</label>
                  <button
                    type="button"
                    onClick={() => setIsModalTypeDropdownOpen(!isModalTypeDropdownOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 text-xs font-bold flex items-center justify-between shadow-xs cursor-pointer transition-all ${
                      isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white hover:bg-[#203429]' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{newRequestType === 'fatura' ? 'Fatura Destek Talebi (Elektrik, Su, Doğalgaz)' : 'Özel Eşya / Temel İhtiyaç Talebi'}</span>
                    <ChevronDown className={`w-4 h-4 opacity-70 transition-transform ${isModalTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isModalTypeDropdownOpen && (
                    <div className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-xl border z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                      isDarkMode ? 'bg-[#1a2b21] border-emerald-900/80 text-white' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <button
                        type="button"
                        onClick={() => { setNewRequestType('fatura'); setIsModalTypeDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          newRequestType === 'fatura' ? 'bg-emerald-700 text-white' : 'hover:opacity-75'
                        }`}
                      >
                        <span>Fatura Destek Talebi (Elektrik, Su, Doğalgaz)</span>
                        {newRequestType === 'fatura' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewRequestType('esya'); setIsModalTypeDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          newRequestType === 'esya' ? 'bg-emerald-700 text-white' : 'hover:opacity-75'
                        }`}
                      >
                        <span>Özel Eşya / Temel İhtiyaç Talebi</span>
                        {newRequestType === 'esya' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Talep Başlığı / Açıklama</label>
                  <input
                    type="text"
                    required
                    value={newRequestTitle}
                    onChange={(e) => setNewRequestTitle(e.target.value)}
                    placeholder={newRequestType === 'fatura' ? 'Örn: Kasım Ayı Doğalgaz Faturası Desteği' : 'Örn: Okul Çantası ve Kırtasiye Malzemesi'}
                    className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                      isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                {newRequestType === 'fatura' && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5">İlgili Kurum / Abone Tipi</label>
                    <input
                      type="text"
                      required
                      value={newRequestInstitution}
                      onChange={(e) => setNewRequestInstitution(e.target.value)}
                      placeholder="Örn: İGDAŞ veya CK Boğaziçi Elektrik"
                      className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                        isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                )}

                {newRequestType === 'fatura' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Fatura Tutarı (TL)</label>
                      <input
                        type="number"
                        required
                        value={newRequestAmount}
                        onChange={(e) => setNewRequestAmount(e.target.value)}
                        placeholder="Örn: 450"
                        className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                          isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Son Ödeme Tarihi</label>
                      <input
                        type="date"
                        required
                        value={newRequestDueDate}
                        onChange={(e) => setNewRequestDueDate(e.target.value)}
                        className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                          isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {newRequestType === 'fatura' && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Fatura Fotoğrafı (Yalnızca Vakıf Tarafından Görülebilir)</label>
                    <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                      isDarkMode ? 'border-emerald-900/60 bg-[#121c16]' : 'border-slate-200 bg-slate-50'
                    }`} onClick={() => invoicePhotoInputRef.current?.click()}>
                      {newRequestInvoicePhoto ? (
                        <div className="space-y-2">
                          <img src={newRequestInvoicePhoto} alt="Fatura Önizleme" className="w-full h-32 object-cover rounded-xl mx-auto" />
                          <span className="text-[11px] text-emerald-500 font-bold block">Fatura yüklendi (Değiştirmek için tıklayın)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1 py-2">
                          <ImageIcon className="w-6 h-6 text-emerald-600 mb-1" />
                          <span className="text-xs font-bold">Fatura görseli yüklemek için tıklayın</span>
                          <span className="text-[10px] opacity-60">Bağışçılar bu görseli ve detayları göremez, yalnızca tutarı görür.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={resetRequestForm}
                    className={`flex-1 text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer border ${
                      isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                    }`}
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-95 disabled:opacity-60 text-white text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer shadow-md"
                  >
                    {isSaving ? 'Kaydediliyor...' : (editingRequestId ? 'Değişiklikleri Kaydet' : 'Talep Oluştur')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SOL YAN PANEL */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside 
          className={`fixed top-0 left-0 bottom-0 w-72 z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDarkMode ? 'bg-[#16241c] text-white border-r border-emerald-900/50' : 'bg-white text-slate-800'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-inherit">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl shadow-sm">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="font-extrabold text-sm block leading-tight">HÜDAYİ VAKFI</span>
                  <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">ANEV UYUMLU</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-1.5 opacity-60 hover:opacity-100 rounded-2xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5 text-xs font-bold overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
              <button
                onClick={() => handleNavigation('donations_market')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-colors ${
                  viewMode === 'donations_market' ? 'bg-emerald-700/20 text-emerald-500 border border-emerald-700/40 shadow-xs' : 'hover:opacity-75'
                }`}
              >
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Bağışlar (Bağışçı Eşya Vitrini)</span>
              </button>

              <button
                onClick={() => handleNavigation('my_requests')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-colors ${
                  viewMode === 'my_requests' ? 'bg-emerald-700/20 text-emerald-500 border border-emerald-700/40 shadow-xs' : 'hover:opacity-75'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Taleplerim (Aktif / Geçmiş)</span>
              </button>

              <div className="pt-4 mt-4 border-t border-inherit space-y-1.5">
                <button
                  onClick={() => handleNavigation('profile')}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-colors ${
                    viewMode === 'profile' ? 'bg-emerald-700/20 text-emerald-500 border border-emerald-700/40 shadow-xs' : 'hover:opacity-75'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Profilim & Belgelerim</span>
                </button>

                <button
                  onClick={() => handleNavigation('settings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-colors ${
                    viewMode === 'settings' ? 'bg-emerald-700/20 text-emerald-500 border border-emerald-700/40 shadow-xs' : 'hover:opacity-75'
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Hesap Ayarları & Şifre</span>
                </button>
              </div>
            </nav>
          </div>

          <div className="pt-4 border-t border-inherit">
            <button
              onClick={async () => {
                await signOut(auth);
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </aside>

        {/* ÜST MENÜ */}
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors ${
          isDarkMode ? 'bg-[#121c16]/90 border-emerald-900/50 text-white' : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  isDarkMode ? 'bg-[#1a2b21] border-emerald-900 hover:bg-[#203429] text-white' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('donations_market')}>
                <div className="p-2.5 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl shadow-sm">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-tight block leading-none">
                    HÜDAYİ VAKFI
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase mt-0.5 block">
                    İhtiyaç Sahibi Portalı
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div 
                onClick={() => handleNavigation('profile')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isDarkMode ? 'bg-[#1a2b21] border-emerald-900 hover:bg-[#203429]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-xs relative overflow-hidden">
                  {applicantInfo.avatarUrl ? (
                    <img src={applicantInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden md:block text-left">
                  <span className="font-extrabold text-xs block leading-tight">{applicantInfo.fullName}</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Onaylı Hak Sahibi</span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* KARŞILAMA BANNER'I (Vitrindeyken görünür) */}
        {viewMode === 'donations_market' && (
          <section className="bg-gradient-to-r from-[#1B3022] via-[#24422F] to-[#122217] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 border border-white/20 px-4 py-1.5 rounded-2xl text-xs font-bold shadow-xs backdrop-blur-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Hüdâyi Vakfı • Onaylı Hak Sahibi Portalı</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  </div>
                  
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    Hoş Geldiniz, {applicantInfo.fullName}
                  </h1>
                  
                  <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                    Bağışçıların paylaştığı eşya ve destekleri aşağıdan inceleyebilir, ihtiyacınız olan ürünler için vakıf onaylı talep oluşturabilirsiniz.
                  </p>

                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-2 rounded-2xl text-[11px] font-medium text-emerald-100 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span><strong className="text-white font-bold">İpucu:</strong> Talep ettiğiniz ürünler sosyal inceleme onayından sonra size yönlendirilir.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-lg text-white flex flex-col justify-between aspect-square">
                    <div className="w-8 h-8 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Vitrin İlanı</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-300">{availableDonations.length} Adet</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleNavigation('my_requests')}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-lg text-white flex flex-col justify-between aspect-square cursor-pointer hover:bg-white/15 transition-all"
                  >
                    <div className="w-8 h-8 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Taleplerim</span>
                      <span className="text-lg sm:text-xl font-black text-teal-200">{requests.length} Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TALEPLERİM BANNER */}
        {viewMode === 'my_requests' && (
          <section className="bg-gradient-to-r from-[#1B3022] via-[#24422F] to-[#122217] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 border border-white/20 px-4 py-1.5 rounded-2xl text-xs font-bold shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Talep & Süreç Yönetimi</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Taleplerim ve Süreç Takibi
                </h1>
                
                <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                  Taleplerinize ait teslimat adresinizi, inceleme aşamalarını ve durum detaylarını aşağıdan takip edebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg text-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Toplam Kayıt</span>
                    <span className="text-sm font-black text-emerald-300">{requests.length} Adet Talep</span>
                  </div>
                </div>

                <button
                  onClick={() => { setEditingRequestId(null); setNewRequestType('fatura'); setNewRequestTitle(''); setNewRequestInstitution(''); setNewRequestAmount(''); setNewRequestDueDate(''); setNewRequestInvoicePhoto(null); setNewRequestInvoiceFile(null); setIsNewRequestModalOpen(true); }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-5 py-4 rounded-3xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xl"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-700" />
                  <span>Yeni Talep Oluştur</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PROFİL BANNER */}
        {viewMode === 'profile' && (
          <section className="bg-gradient-to-r from-[#1B3022] via-[#24422F] to-[#122217] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                
                <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()} title="Galeriden Fotoğraf Seç">
                  <div className="w-24 h-24 bg-white text-[#1B3022] rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl border-4 border-white/20 overflow-hidden relative">
                    {applicantInfo.avatarUrl ? (
                      <img src={applicantInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-white text-slate-800 p-2 rounded-2xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1 text-[10px] font-bold">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 border border-white/20 px-4 py-1.5 rounded-2xl text-xs font-bold shadow-xs backdrop-blur-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Hüdâyi Vakfı • Onaylı Hak Sahibi</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    {applicantInfo.fullName}
                  </h1>
                  <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
                    {applicantInfo.district} / {applicantInfo.city} • T.C. Kimlik: <span className="font-bold text-white">{applicantInfo.identityNo}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg text-white flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Durum</span>
                  <span className="text-sm font-black text-emerald-300">Aktif İnceleme & Destek</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AYARLAR BANNER */}
        {viewMode === 'settings' && (
          <section className="bg-gradient-to-r from-[#1B3022] via-[#24422F] to-[#122217] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 border border-white/20 px-4 py-1.5 rounded-2xl text-xs font-bold shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Güvenlik & Tercih Merkezi</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Hesap Ayarları & Tercihler
                </h1>
                
                <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                  Şifrenizi güvenle güncelleyebilir ve karanlık mod tercihinizi anında yönetebilirsiniz.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg text-white flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Güvenlik Durumu</span>
                  <span className="text-sm font-black text-emerald-300">Hesap Güvenliği: Yüksek</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DİNAMİK İÇERİK */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 w-full">
          
          {successBanner && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 p-4 rounded-3xl flex items-center gap-3 shadow-md animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{successBanner}</span>
            </div>
          )}
          
          {/* EKRAN 1: BAĞIŞLAR / EŞYA VİTRİNİ */}
          {viewMode === 'donations_market' && (
            <div className="space-y-8">
              
              <div className={`p-6 rounded-3xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h2 className="text-xl font-black">Bağışçı Eşya ve Destek Vitrini</h2>
                  <p className="text-xs opacity-70 mt-0.5">Bağışçıların bağışlamak üzere sisteme yüklediği eşyaları filtreleyin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  
                  <div className="relative" ref={categoryRef}>
                    <button
                      onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsCityOpen(false); }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-xs font-bold shadow-xs min-w-[170px] justify-between ${
                        isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white hover:bg-[#203429]' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-emerald-600" />
                        <span>{selectedCategory === 'Tümü' ? 'Tüm Kategoriler' : selectedCategory}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                      <div className={`absolute right-0 mt-2 w-52 rounded-3xl shadow-xl border z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                        isDarkMode ? 'bg-[#1a2b21] border-emerald-900 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                              selectedCategory === cat ? 'bg-emerald-700 text-white' : 'hover:opacity-75'
                            }`}
                          >
                            <span>{cat === 'Tümü' ? 'Tüm Kategoriler' : cat}</span>
                            {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={cityRef}>
                    <button
                      onClick={() => { setIsCityOpen(!isCityOpen); setIsCategoryOpen(false); }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-xs font-bold shadow-xs min-w-[200px] justify-between ${
                        isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white hover:bg-[#203429]' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="truncate">{selectedCity === 'Tümü' ? 'Türkiye Geneli (81 İl)' : selectedCity}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCityOpen && (
                      <div className={`absolute right-0 mt-2 w-64 rounded-3xl shadow-xl border z-50 p-3 animate-in fade-in zoom-in-95 duration-150 ${
                        isDarkMode ? 'bg-[#1a2b21] border-emerald-900 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <div className="mb-2 pb-2 border-b border-inherit">
                          <input
                            type="text"
                            placeholder="İl ara..."
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            className={`w-full border rounded-2xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                              isDarkMode ? 'bg-[#121c16] border-emerald-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                            autoFocus
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                          <button
                            onClick={() => { setSelectedCity('Tümü'); setIsCityOpen(false); setCitySearchQuery(''); }}
                            className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                              selectedCity === 'Tümü' ? 'bg-emerald-700 text-white' : 'hover:opacity-75'
                            }`}
                          >
                            <span>Türkiye Geneli (Tümü)</span>
                            {selectedCity === 'Tümü' && <Check className="w-3.5 h-3.5" />}
                          </button>

                          {filteredCities.map(city => (
                            <button
                              key={city}
                              onClick={() => { setSelectedCity(city); setIsCityOpen(false); setCitySearchQuery(''); }}
                              className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                selectedCity === city ? 'bg-emerald-700 text-white' : 'hover:opacity-75'
                              }`}
                            >
                              <span>{city}</span>
                              {selectedCity === city && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {filteredDonations.length === 0 ? (
                <div className={`rounded-3xl p-16 text-center border shadow-xs ${
                  isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
                }`}>
                  <Package className="w-10 h-10 opacity-40 mx-auto mb-3" />
                  <h3 className="text-base font-bold mb-1">Eşya Bulunamadı</h3>
                  <p className="text-xs opacity-70">Seçtiğiniz il veya kategori kriterine uygun aktif bağış ilanı bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDonations.map(item => {
                    const isAlreadyRequested = requestedItemIds.includes(item.id);

                    return (
                      <div key={item.id} className={`rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all ${
                        isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
                      }`}>
                        
                        <div>
                          <div className="h-48 relative overflow-hidden bg-black/20">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                            <span className={`absolute top-3 left-3 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-2xl border shadow-xs ${
                              isDarkMode ? 'bg-[#121c16]/90 border-emerald-950 text-emerald-300' : 'bg-white/95 border-emerald-200 text-emerald-800'
                            }`}>
                              {item.category}
                            </span>
                          </div>

                          <div className="p-5 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] opacity-70 font-semibold">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                {item.city} / {item.district}
                              </span>
                              <span>{item.date}</span>
                            </div>

                            <h3 className="text-base font-bold leading-snug">{item.title}</h3>
                            <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">{item.description}</p>
                            
                            <div className="pt-2 flex items-center justify-between text-[11px] font-bold opacity-80">
                              <span className={`px-2.5 py-1 rounded-xl ${isDarkMode ? 'bg-[#121c16]' : 'bg-slate-100'}`}>Durum: {item.condition}</span>
                              <span>Bağışçı: {item.donorName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          {isAlreadyRequested ? (
                            <div className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                              <Clock className="w-4 h-4 animate-spin" />
                              <span>Vakıf Onayı Bekleniyor</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setTargetItemToRequest({ 
                                id: item.id, 
                                title: item.title, 
                                imageUrl: item.imageUrl, 
                                donorName: item.donorName, 
                                category: item.category, 
                                city: item.city, 
                                district: item.district 
                              })}
                              className="w-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-95 text-white font-extrabold py-3 px-4 rounded-2xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Gift className="w-4 h-4" />
                              <span>Bu Eşyayı Talep Et (Vakıf Onaylı)</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* EKRAN 2: TALEPLERİM */}
          {viewMode === 'my_requests' && (
            <div className="space-y-6">

              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
                <button
                  onClick={() => setRequestTabFilter('all')}
                  className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer border whitespace-nowrap ${
                    requestTabFilter === 'all' 
                      ? (isDarkMode ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-white border-transparent')
                      : (isDarkMode ? 'bg-[#1a2b21] text-emerald-200 border-emerald-900/60 hover:bg-[#203429]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                  }`}
                >
                  Tümü ({requests.length})
                </button>
                <button
                  onClick={() => setRequestTabFilter('pending')}
                  className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer border whitespace-nowrap ${
                    requestTabFilter === 'pending' 
                      ? (isDarkMode ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-white border-transparent')
                      : (isDarkMode ? 'bg-[#1a2b21] text-emerald-200 border-emerald-900/60 hover:bg-[#203429]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                  }`}
                >
                  İncelemede / Onay Bekleyen
                </button>
                <button
                  onClick={() => setRequestTabFilter('approved')}
                  className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer border whitespace-nowrap ${
                    requestTabFilter === 'approved' 
                      ? (isDarkMode ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-white border-transparent')
                      : (isDarkMode ? 'bg-[#1a2b21] text-emerald-200 border-emerald-900/60 hover:bg-[#203429]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                  }`}
                >
                  Onaylı / Bağışçı Bekleyen
                </button>
                <button
                  onClick={() => setRequestTabFilter('completed')}
                  className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer border whitespace-nowrap ${
                    requestTabFilter === 'completed' 
                      ? (isDarkMode ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-white border-transparent')
                      : (isDarkMode ? 'bg-[#1a2b21] text-emerald-200 border-emerald-900/60 hover:bg-[#203429]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                  }`}
                >
                  Tamamlananlar
                </button>
              </div>

              {filteredRequests.length === 0 ? (
                <div className={`rounded-3xl p-12 text-center border shadow-xs ${
                  isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
                }`}>
                  <FileText className="w-10 h-10 opacity-40 mx-auto mb-3" />
                  <p className="text-xs opacity-70">Bu kategoride kayıtlı talebiniz bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map(req => {
                    let boxBg = isDarkMode ? "bg-[#251d10]/90 border-amber-800/60 text-amber-100" : "bg-amber-50/80 border-amber-300 text-amber-950";
                    let badgeClass = isDarkMode ? "bg-amber-900/40 text-amber-300 border-amber-700/50" : "bg-amber-100 text-amber-950 border-amber-300";
                    let badgeIcon = <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />;

                    if (req.status === 'approved_waiting_donor') {
                      boxBg = isDarkMode ? "bg-[#14291f]/90 border-emerald-800/60 text-emerald-100" : "bg-emerald-50/70 border-emerald-200 text-emerald-900";
                      badgeClass = isDarkMode ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/50" : "bg-emerald-100 text-emerald-900 border-emerald-200";
                      badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
                    } else if (req.status === 'completed') {
                      boxBg = isDarkMode ? "bg-[#13242e]/90 border-sky-800/60 text-sky-100" : "bg-sky-50/70 border-sky-200 text-sky-900";
                      badgeClass = isDarkMode ? "bg-sky-900/40 text-sky-300 border-sky-700/50" : "bg-sky-100 text-sky-900 border-sky-200";
                      badgeIcon = <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
                    }

                    const isCompleted = req.status === 'completed';
                    const isItemRequest = !!req.originalDonationId;
                                        const pn = publicMap[req.id];
                    const donorFound = pn?.paymentStatus === 'fulfilled' || pn?.paymentStatus === 'paid' || pn?.paymentStatus === 'closed';
                    const liveStatusText =
                      pn?.paymentStatus === 'paid' ? 'Ödeme Yapıldı / Destek Yolda'
                      : pn?.paymentStatus === 'fulfilled' ? 'Bağışçı Bulundu / Teslimat Hazırlanıyor'
                      : req.statusText;

                    return (
                      <div key={req.id} className={`rounded-3xl border shadow-sm p-6 flex flex-col justify-between space-y-4 transition-all ${boxBg}`}>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-inherit">
                            <div className="flex items-center gap-2.5">
                              {req.imageUrl ? (
                                <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-inherit bg-black/10 shadow-xs">
                                  <img src={req.imageUrl} alt={req.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${isDarkMode ? 'bg-[#121c16] border-emerald-900' : 'bg-white/80 border-slate-200'}`}>
                                  <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                              )}
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-wider opacity-70 block">
                                  {req.category}
                                </span>
                                <h3 className="text-xs font-bold mt-0.5 line-clamp-1">{req.title}</h3>
                              </div>
                            </div>
                          </div>

                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold border shadow-xs w-full justify-center ${badgeClass}`}>
                            {badgeIcon}
                            <span className="truncate">{liveStatusText}</span>
                          </div>

                          <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs shadow-xs ${isDarkMode ? 'bg-[#121c16]/90 border-emerald-900/60 text-emerald-100' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
                            
                            <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-inherit">
                              <div>
                                <span className="text-[9px] opacity-60 block font-semibold uppercase">Kurum / Konum</span>
                                <span className="font-bold text-[11px] truncate block">{req.institution}</span>
                              </div>

                              {req.amount > 0 ? (
                                <div>
                                  <span className="text-[9px] opacity-60 block font-semibold uppercase">Tutar (Bağışçı Görür)</span>
                                  <span className="font-black text-emerald-500 text-[11px]">{req.amount} TL</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[9px] opacity-60 block font-semibold uppercase">Bağışçı</span>
                                  <span className="font-bold text-[11px] truncate block">
  {donorFound ? 'Bağışçı Bulundu' : (req.donorName !== '-' ? req.donorName : 'Bekleniyor')}
</span>
                                </div>
                              )}
                            </div>

                            {/* YALNIZCA VAKFIN GÖREBİLDİĞİ GİZLİ FATURA BİLGİLERİ */}
                            {req.type === 'fatura' && (
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                                <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Yalnızca Vakıf Görünümü (Gizli)
                                </span>
                                <div><strong className="opacity-75">Son Ödeme Tarihi:</strong> {req.dueDate || 'Belirtilmedi'}</div>
                                {req.invoicePhoto && (
                                  <div className="mt-1">
                                    <span className="opacity-75 block">Fatura Belgesi:</span>
                                    <img src={req.invoicePhoto} alt="Fatura" className="w-full h-20 object-cover rounded-lg mt-1 border border-emerald-500/30" />
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-1">
                              <span className="text-[9px] opacity-60 font-semibold uppercase block">Teslimat Adresi</span>
                              <span className="font-extrabold text-[11px] block">{applicantInfo.fullName} • {applicantInfo.phone}</span>
                              <span className="text-[10px] opacity-80 font-medium block line-clamp-2">{applicantInfo.address}</span>
                            </div>

                          </div>
                        </div>

                        <div className="pt-2 border-t border-inherit flex items-center justify-between gap-2">
                          {!isCompleted && !isItemRequest && (
                            <button
                              onClick={() => handleOpenEditRequest(req)}
                              className={`flex-1 py-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border shadow-xs text-[11px] ${
                                isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <Edit3 className="w-3 h-3 text-emerald-600" />
                              <span>Düzenle</span>
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => setRequestToDelete(req)}
                              className={`flex-1 py-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border shadow-xs text-[11px] ${
                                isDarkMode ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-900/60 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                              }`}
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>{isItemRequest ? 'İptal Et' : 'Sil'}</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className={`w-full text-center text-[10px] font-bold py-2 rounded-2xl border ${
                              isDarkMode ? 'bg-sky-950/40 text-sky-300 border-sky-900/60' : 'bg-sky-100/70 text-sky-800 border-sky-200'
                            }`}>
                              Arşivlendi
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* EKRAN 4: PROFİLİM & BELGELERİM */}
          {viewMode === 'profile' && (
            <div className="space-y-8">
              
              {isEditingProfile ? (
                <div className={`p-8 rounded-3xl border shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto ${
                  isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-inherit">
                    <div>
                      <h3 className="text-lg font-bold">Kişisel ve İletişim Bilgilerini Güncelle</h3>
                      <p className="text-xs opacity-75 mt-0.5">Değişiklikleriniz vakıf onaylı profilinize hemen yansır.</p>
                    </div>
                    <span className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-[#121c16] border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      <Edit3 className="w-5 h-5" />
                    </span>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold mb-1.5">Ad Soyad</label>
                        <input
                          type="text"
                          required
                          value={tempProfile.fullName}
                          onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                          className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                            isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5">T.C. Kimlik No</label>
                        <input
                          type="text"
                          required
                          value={tempProfile.identityNo}
                          onChange={(e) => setTempProfile({ ...tempProfile, identityNo: e.target.value })}
                          className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                            isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5">İletişim Numarası (Telefon)</label>
                        <input
                          type="text"
                          required
                          value={tempProfile.phone}
                          onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                          className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                            isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5">Gmail Adresi</label>
                        <input
                          type="email"
                          required
                          value={tempProfile.gmail}
                          onChange={(e) => setTempProfile({ ...tempProfile, gmail: e.target.value })}
                          className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                            isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold mb-1.5">Açık Teslimat Adresi</label>
                        <textarea
                          rows={3}
                          required
                          value={tempProfile.address}
                          onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                          className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                            isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className={`flex-1 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                        }`}
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs font-bold py-3.5 rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Değişiklikleri Kaydet</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  <div className={`p-8 rounded-3xl border shadow-sm space-y-6 flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2.5 pb-4 border-b border-inherit">
                        <div className={`p-2 rounded-2xl border ${isDarkMode ? 'bg-[#121c16] border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold">Kişisel & İletişim Bilgileri</h3>
                      </div>

                      <div className="space-y-4 pt-5 text-xs">
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div>
                            <span className="text-[10px] opacity-65 block font-semibold uppercase">Ad Soyad</span>
                            <span className="font-extrabold text-sm">{applicantInfo.fullName}</span>
                          </div>
                          <User className="w-4 h-4 opacity-50" />
                        </div>

                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div>
                            <span className="text-[10px] opacity-65 block font-semibold uppercase">T.C. Kimlik No</span>
                            <span className="font-extrabold">{applicantInfo.identityNo}</span>
                          </div>
                          <Shield className="w-4 h-4 opacity-50" />
                        </div>

                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div>
                            <span className="text-[10px] opacity-65 block font-semibold uppercase">Telefon Numarası</span>
                            <span className="font-extrabold">{applicantInfo.phone}</span>
                          </div>
                          <Bell className="w-4 h-4 opacity-50" />
                        </div>

                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div>
                            <span className="text-[10px] opacity-65 block font-semibold uppercase">Gmail Adresi</span>
                            <span className="font-extrabold text-emerald-500">{applicantInfo.gmail}</span>
                          </div>
                          <Mail className="w-4 h-4 text-emerald-600" />
                        </div>

                        <div className={`p-4 rounded-2xl border space-y-1.5 ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <span className="text-[10px] opacity-65 block font-semibold uppercase">Teslimat Adresi</span>
                          <span className="font-bold leading-relaxed block">{applicantInfo.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-inherit">
                      <button
                        onClick={() => { setTempProfile(applicantInfo); setIsEditingProfile(true); }}
                        className={`w-full border font-extrabold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isDarkMode ? 'bg-[#121c16] hover:bg-[#203429] border-emerald-900 text-emerald-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                        }`}
                      >
                        <Edit3 className="w-4 h-4 text-emerald-600" />
                        <span>Bilgileri Düzenle</span>
                      </button>
                    </div>
                  </div>

                  <div className={`p-8 rounded-3xl border shadow-sm space-y-6 flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2.5 pb-4 border-b border-inherit">
                        <div className={`p-2 rounded-2xl border ${isDarkMode ? 'bg-[#121c16] border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold">Vakıf Onaylı Belgelerim</h3>
                      </div>

                      <div className="space-y-4 pt-5 text-xs">
                        <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold block text-sm">Sosyal İnceleme Raporu</span>
                              <span className="text-[11px] opacity-65">Onay Tarihi: 01.10.2026</span>
                            </div>
                          </div>
                          <span className={`font-extrabold px-3.5 py-1.5 rounded-xl text-[11px] border ${isDarkMode ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' : 'bg-emerald-100 text-emerald-900 border-emerald-200'}`}>Onaylandı</span>
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold block text-sm">İhtiyaç Sahibi Doğrulama Belgesi</span>
                              <span className="text-[11px] opacity-65">Geçerlilik: 1 Yıl</span>
                            </div>
                          </div>
                          <span className={`font-extrabold px-3.5 py-1.5 rounded-xl text-[11px] border ${isDarkMode ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' : 'bg-emerald-100 text-emerald-900 border-emerald-200'}`}>Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* EKRAN 5: HESAP AYARLARI */}
          {viewMode === 'settings' && (
            <div className={`max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl border shadow-sm space-y-8 ${
              isDarkMode ? 'bg-[#1a2b21] border-emerald-900/60 text-white' : 'bg-white border-slate-200 text-[#1B3022]'
            }`}>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600">Şifre Değiştir</h3>
                
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                      isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Yeni Şifre</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                        isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full border rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-600 ${
                        isDarkMode ? 'bg-[#121c16] border-emerald-900/60 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Şifreyi Güncelle</span>
                  </button>
                </div>
              </form>

              <div className="border-t border-inherit pt-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600">Görünüm & Tema</h3>
                
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#121c16] border-emerald-900/50' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isDarkMode ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-200/70 text-slate-700'
                    }`}>
                      {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold block text-xs">Karanlık Mod (Dark Mode)</span>
                      <span className="text-[11px] opacity-70">Göz yormayan koyu tema görünümü</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !isDarkMode;
                      setIsDarkMode(nextMode);
                      setSuccessBanner(nextMode ? 'Karanlık moda geçildi.' : 'Aydınlık moda geçildi.');
                      setTimeout(() => setSuccessBanner(null), 3000);
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      isDarkMode ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ALT PANEL */}
      <footer className="bg-[#181C20] text-[#9CA3AF] py-12 px-6 sm:px-12 lg:px-20 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#6B7280] block mb-1">AZİZ MAHMÛD</span>
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white block">HÜDÂYİ VAKFI</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="w-9 h-9 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#9CA3AF] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#9CA3AF] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#9CA3AF] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#9CA3AF] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5 text-xs font-semibold text-[#9CA3AF]">
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