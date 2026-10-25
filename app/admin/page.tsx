'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileText, Package, Users, CheckCircle2, 
  XCircle, Clock, MapPin, Building2, LogOut, Search, 
  Filter, Calendar, Gift, AlertTriangle, Check, X, Shield, Sparkles, Flame, Menu, LayoutDashboard, HeartHandshake, UserCheck, TrendingUp, CheckCircle, ArrowUpRight, ArrowRight, Activity, CalendarDays, Phone, Mail, FileDown, Eye, Layers, DollarSign, Image as ImageIcon, Receipt, Moon, Sun, Lock, Edit3, AlertCircle
} from 'lucide-react';

const INITIAL_ADMIN_REQUESTS = [
  {
    id: 2,
    applicantName: 'Fatma Demir',
    identityNo: '19823456789',
    city: 'İstanbul',
    district: 'Sancaktepe',
    phone: '0532 555 44 33',
    type: 'esya',
    title: 'Çocuk Kışlık Mont ve Bot Seti (Numara 36)',
    category: 'Giyim',
    amount: 0,
    urgency: 'Orta',
    status: 'approved',
    institution: 'İstanbul / Ümraniye',
    date: '15 Ekim 2026',
    householdCount: 4,
    monthlyIncome: '4.500 TL',
    dueDate: '-',
    invoicePhoto: '',
    isConflict: false,
    donorNames: [],
    selectedDonor: ''
  },
  {
    id: 4,
    applicantName: 'Ahmet Yılmaz',
    identityNo: '24567891234',
    city: 'Ankara',
    district: 'Çankaya',
    phone: '0533 444 22 11',
    type: 'fatura',
    title: 'Ekim Ayı Su Faturası Desteği',
    category: 'Fatura Ödemesi',
    amount: 320,
    urgency: 'Acil',
    status: 'pending_review',
    institution: 'ASKİ Ankara Su',
    date: '19 Ekim 2026',
    householdCount: 3,
    monthlyIncome: '3.800 TL',
    dueDate: '30 Ekim 2026',
    invoicePhoto: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    isConflict: false,
    donorNames: [],
    selectedDonor: ''
  },
  {
    id: 5,
    applicantName: 'Ayşe Kaya',
    identityNo: '31245678901',
    city: 'Bursa',
    district: 'Nilüfer',
    phone: '0544 333 22 10',
    type: 'egitim',
    title: 'İlkokul Kırtasiye ve Çanta Seti Desteği',
    category: 'Eğitim',
    amount: 600,
    urgency: 'Normal',
    status: 'pending_review',
    institution: 'Nilüfer Kırtasiye',
    date: '20 Ekim 2026',
    householdCount: 5,
    monthlyIncome: '4.100 TL',
    dueDate: '05 Kasım 2026',
    invoicePhoto: '',
    isConflict: false,
    donorNames: [],
    selectedDonor: ''
  }
];

const INITIAL_ADMIN_DONATIONS = [
  {
    id: 1,
    uniqueCardKey: 'fatura_cakisan_elektrik',
    title: 'Ekim Ayı Elektrik Faturası Desteği (Çakışan Ödeme)',
    category: 'Fatura Ödemesi',
    city: 'İstanbul',
    district: 'Sancaktepe',
    donorName: 'Mehmet Bulut ve Halil İbrahim Tekin',
    status: 'pending_approval',
    date: '17 Ekim 2026',
    type: 'fatura',
    imageUrl: null,
    description: 'CK Boğaziçi Elektrik fatura ödeme talebi (Mükerrer İstek).',
    paymentStatus: 'pending_approval',
    colorTheme: 'amber',
    amount: 540,
    dueDate: '25 Ekim 2026',
    applicantName: 'Fatma Demir',
    urgency: 'Acil',
    donorPhone: '0542 222 33 44',
    receiptUrl: '',
    receiptName: '',
    isConflict: true,
    donorNames: ['Mehmet Bulut', 'Halil İbrahim Tekin'],
    selectedDonor: ''
  },
  {
    id: 301,
    uniqueCardKey: 'bagisci_esya_bulasik',
    title: 'Az Kullanılmış 4 Programlı Bulaşık Makinesi',
    category: 'Beyaz Eşya',
    city: 'İstanbul',
    district: 'Ümraniye',
    donorName: 'Zeynep Koç (Bağışçı)',
    status: 'pending_approval',
    date: '18 Ekim 2026',
    type: 'esya_bagisi',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Hiçbir arızası yok, taşınma nedeniyle bağışlamak istiyorum. Tüm hortumları tam.',
    paymentStatus: 'pending_approval',
    colorTheme: 'teal',
    amount: 0,
    dueDate: '-',
    donorPhone: '0535 111 22 33',
    isConflict: false
  },
  {
    id: 302,
    uniqueCardKey: 'fatura_elektrik_540',
    title: 'Ekim Ayı Elektrik Faturası Desteği',
    category: 'Fatura Ödemesi',
    city: 'İstanbul',
    district: 'Sancaktepe',
    donorName: 'Mehmet Bulut (Ödemek İsteyen)',
    status: 'published',
    date: '17 Ekim 2026',
    type: 'fatura',
    imageUrl: null,
    description: 'CK Boğaziçi Elektrik fatura ödeme talebi.',
    paymentStatus: 'waiting_donor_payment',
    colorTheme: 'amber',
    amount: 540,
    dueDate: '25 Ekim 2026',
    applicantName: 'Fatma Demir',
    urgency: 'Acil',
    donorPhone: '0542 222 33 44',
    receiptUrl: '/receipts/fatura_makbuz_540.pdf',
    receiptName: 'elektrik_fatura_makbuzu_540tl.pdf',
    isConflict: false
  }
];

const INITIAL_NEEDYS = [
  { id: 1, fullName: 'Fatma Demir', identityNo: '19823456789', phone: '0532 555 44 33', email: 'fatma.demir@gmail.com', address: 'Atatürk Mah. Çilek Sok. No:12 D:4, Sancaktepe / İstanbul', status: 'Onaylı Hak Sahibi', registerDate: '01 Ekim 2026', reportUrl: '/reports/sosyal_inceleme_fatma_demir.pdf', reportName: 'sosyal_inceleme_fatma_demir.pdf' },
  { id: 2, fullName: 'Ahmet Yılmaz', identityNo: '24567891234', phone: '0533 444 22 11', email: 'ahmet.yilmaz@outlook.com', address: 'Kızılay Mah. Ziya Gökalp Cad. No:45, Çankaya / Ankara', status: 'Onay Bekliyor', registerDate: '10 Ekim 2026', reportUrl: '/reports/hane_durum_raporu_ahmet_yilmaz.pdf', reportName: 'hane_durum_raporu_ahmet_yilmaz.pdf' },
  { id: 3, fullName: 'Ayşe Kaya', identityNo: '31245678901', phone: '0544 333 22 10', email: 'ayse.kaya@gmail.com', address: 'Fethiye Mah. Lale Sok. No:8, Nilüfer / Bursa', status: 'Onaylı Hak Sahibi', registerDate: '12 Ekim 2026', reportUrl: '/reports/fakirlik_belgesi_ayse_kaya.pdf', reportName: 'fakirlik_belgesi_ayse_kaya.pdf' },
  { id: 4, fullName: 'Mustafa Çelik', identityNo: '45678912345', phone: '0536 777 88 99', email: 'm.celik@yahoo.com', address: 'Kazım Dirik Mah. 296 Sok. No:15, Bornova / İzmir', status: 'Onay Bekliyor', registerDate: '15 Ekim 2026', reportUrl: '/reports/sosyal_inceleme_mustafa_celik.pdf', reportName: 'sosyal_inceleme_mustafa_celik.pdf' }
];

const MOCK_DONORS = [
  { id: 101, fullName: 'Zeynep Koç', identityNo: '15987654321', phone: '0535 111 22 33', email: 'zeynep.koc@kurumsal.com', address: 'Sarigazi Mah. Demokrasi Cad. No:22, Sancaktepe / İstanbul', status: 'Aktif Bağışçı', date: '16 Ekim 2026' },
  { id: 102, fullName: 'Mehmet Bulut', identityNo: '35795148263', phone: '0542 222 33 44', email: 'm.bulut@gmail.com', address: 'Atakent Mah. Alemdağ Cad. No:104, Ümraniye / İstanbul', status: 'Aktif Bağışçı', date: '15 Ekim 2026' },
  { id: 103, fullName: 'Halil İbrahim Tekin', identityNo: '75315985246', phone: '0555 999 88 77', email: 'hitekin@hotmail.com', address: 'Bostanlı Mah. Cemal Gürsel Cad. No:50, Karşıyaka / İzmir', status: 'Aktif Bağışçı', date: '14 Ekim 2026' },
  { id: 104, fullName: 'Elif Şahin', identityNo: '95135745612', phone: '0532 444 55 66', email: 'elif.sahin@gmail.com', address: 'Bahçelievler Mah. 7. Cad. No:12, Çankaya / Ankara', status: 'Aktif Bağışçı', date: '18 Ekim 2026' }
];

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState(INITIAL_ADMIN_REQUESTS);
  const [donations, setDonations] = useState(INITIAL_ADMIN_DONATIONS);
  const [needys, setNeedys] = useState(INITIAL_NEEDYS);
   
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'donations' | 'needys' | 'donors'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
   
  const [requestFilterTab, setRequestFilterTab] = useState<'Tümü' | 'Acil' | 'Fatura Ödemesi' | 'Onaylanan' | 'Onaylanmayan'>('Tümü');
  const [donationFilterTab, setDonationFilterTab] = useState<'Tümü' | 'Bekleyen İncelemeler' | 'Çakışan Ödemeler' | 'Ödeme Bekleyenler' | 'Onaylananlar / Ödenenler'>('Tümü');

  const [needySearch, setNeedySearch] = useState('');
  const [needyStatusFilter, setNeedyStatusFilter] = useState<'Tümü' | 'Onaylı Hak Sahibi' | 'Onay Bekliyor'>('Tümü');
   
  const [donorSearch, setDonorSearch] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectConflictDonor = (donationId: number, donorName: string) => {
    setDonations(prev => prev.map(d => d.id === donationId ? { ...d, selectedDonor: donorName } : d));
  };

  const handleApproveConflictDonation = (donationId: number) => {
    const targetDon = donations.find(d => d.id === donationId);
    if (!targetDon) return;

    if (targetDon.isConflict && !targetDon.selectedDonor) {
      setNotification('Lütfen çakışan ödemeyi yapması için listeden 1 bağışçı seçin.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const chosen = targetDon.selectedDonor || targetDon.donorNames[0] || 'Mehmet Bulut';
    const others = targetDon.donorNames.filter((d: string) => d !== chosen);

    setDonations(prev => prev.map(d => d.id === donationId ? { 
      ...d, 
      paymentStatus: 'waiting_donor_payment', 
      isConflict: false, 
      donorName: `${chosen} (Ödemek İsteyen)` 
    } : d));

    setNotification(`Çakışma çözüldü! Seçilen bağışçı (${chosen}) onaylandı ve "Ödeme Bekliyor" aşamasına alındı. Diğer bağışçılara (${others.join(', ') || 'diğerleri'}) otomatik red mesajı iletildi.`);
    setTimeout(() => setNotification(null), 6000);
  };

  const handleApproveRequest = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    setNotification('Talep onaylandı.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectRequest = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    setNotification('Talep reddedildi.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveDonorEsya = (cardId: number) => {
    setDonations(prev => prev.map(d => {
      if (d.id === cardId) {
        if (d.type === 'fatura') {
          return { ...d, paymentStatus: 'waiting_donor_payment' };
        } else {
          return { ...d, paymentStatus: 'approved', status: 'published' };
        }
      }
      return d;
    }));
    setNotification('İşlem onaylandı.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectDonorEsya = (cardId: number) => {
    setDonations(prev => prev.filter(d => d.id !== cardId));
    setNotification('İşlem reddedildi.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveNeedy = (id: number) => {
    setNeedys(prev => prev.map(n => n.id === id ? { ...n, status: 'Onaylı Hak Sahibi' } : n));
    setNotification('İhtiyaç sahibi başvuru onaylandı.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectNeedy = (id: number) => {
    setNeedys(prev => prev.filter(n => n.id !== id));
    setNotification('Başvuru reddedildi ve listeden kaldırıldı.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleViewReport = (reportUrl: string, reportName: string) => {
    setNotification(`"${reportName}" adlı dosya açılıyor.`);
    setTimeout(() => setNotification(null), 4000);
    window.open(reportUrl, '_blank');
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase());
    if (requestFilterTab === 'Acil') return matchesSearch && r.urgency === 'Acil';
    if (requestFilterTab === 'Fatura Ödemesi') return matchesSearch && r.category === 'Fatura Ödemesi';
    if (requestFilterTab === 'Onaylanan') return matchesSearch && r.status === 'approved';
    if (requestFilterTab === 'Onaylanmayan') return matchesSearch && r.status !== 'approved';
    return matchesSearch;
  });

  const filteredDonations = donations.filter(d => {
    if (donationFilterTab === 'Tümü') return true;
    if (donationFilterTab === 'Bekleyen İncelemeler') {
      return d.paymentStatus === 'pending_approval' && !d.isConflict;
    }
    if (donationFilterTab === 'Çakışan Ödemeler') {
      return d.isConflict === true;
    }
    if (donationFilterTab === 'Ödeme Bekleyenler') {
      return d.paymentStatus === 'waiting_donor_payment' && !d.isConflict;
    }
    if (donationFilterTab === 'Onaylananlar / Ödenenler') {
      return d.paymentStatus === 'approved';
    }
    return true;
  });

  const filteredNeedys = needys.filter(n => {
    const matchesSearch = n.fullName.toLowerCase().includes(needySearch.toLowerCase()) || n.identityNo.includes(needySearch);
    const matchesStatus = needyStatusFilter === 'Tümü' || n.status === needyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDonors = MOCK_DONORS.filter(d =>
    d.fullName.toLowerCase().includes(donorSearch.toLowerCase()) ||
    d.identityNo.includes(donorSearch)
  );

  return (
    <div className={`min-h-screen font-sans relative selection:bg-[#17A2B8] selection:text-white flex flex-col justify-between ${isDarkMode ? 'bg-[#0A2322] text-white' : 'bg-[#F4F9F9] text-slate-900'}`}>
      <div>
      <div 
        className={`fixed inset-0 bg-[#0A2322]/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside 
        className={`fixed top-0 left-0 bottom-0 w-80 z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 transform bg-[#0C3533] text-white border-r border-[#145350] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#145350]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#17A2B8]/20 text-[#17A2B8] rounded-2xl border border-[#17A2B8]/40 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-sm tracking-wide block leading-tight text-white">VAKIF YÖNETİMİ</span>
                <span className="text-[10px] text-[#17A2B8] font-extrabold tracking-widest uppercase">KONTROL MERKEZİ</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-2 opacity-70 hover:opacity-100 rounded-xl bg-[#092927] hover:bg-[#145350] transition-all cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-300/80 px-1">Yönetim Menüsü</h4>
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-teal-200" />
                <span>Dashboard (Genel Bakış)</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'requests' ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-teal-200" />
                <span>Hak Sahibi Taleplerini Yönet</span>
              </div>
              <span className="bg-[#145350] text-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-black">{requests.length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('donations'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'donations' ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-teal-200" />
                <span>Bağışçı Onay & Fatura Ödemeleri</span>
              </div>
              <span className="bg-[#145350] text-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-black">{donations.length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('needys'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'needys' ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-200" />
                <span>İhtiyaç Sahipleri Listesi</span>
              </div>
              <span className="bg-[#145350] text-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-black">{needys.length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('donors'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'donors' ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-4 h-4 text-teal-200" />
                <span>Bağışçılar Listesi</span>
              </div>
              <span className="bg-[#145350] text-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-black">{MOCK_DONORS.length}</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#145350] text-[11px] text-teal-300 text-center font-medium">
          Aziz Mahmud Hüdayi Vakfı © 2026
        </div>
      </aside>

      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm ${isDarkMode ? 'bg-[#0C3533]/95 border-teal-800/40 text-white' : 'bg-white/95 border-[#17A2B8]/15 text-slate-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
           
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/30 text-[#17A2B8] hover:bg-[#17A2B8]/20 transition-all cursor-pointer flex items-center justify-center shadow-xs hover:scale-105 active:scale-95"
              title="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="p-2.5 bg-gradient-to-br from-[#17A2B8] to-[#117A8B] text-white rounded-2xl shadow-md group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className={`font-black text-sm tracking-tight block leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  HÜDAYİ VAKFI
                </span>
                <span className="text-[10px] text-[#17A2B8] font-extrabold tracking-wider uppercase mt-1 block">
                  Yönetim ve Denetim Masası
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-[11px] font-bold shadow-inner ${isDarkMode ? 'bg-[#092927] border-[#145350] text-white' : 'bg-[#17A2B8]/5 border-[#17A2B8]/15 text-slate-700'}`}>
              <Calendar className="w-4 h-4 text-[#17A2B8]" />
              <span>{currentDateTime}</span>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/25 text-[#17A2B8] hover:bg-[#17A2B8]/20 transition-all cursor-pointer shadow-xs hover:scale-105"
              title={isDarkMode ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/25 shadow-xs">
              <div className="w-9 h-9 bg-gradient-to-br from-[#17A2B8] to-[#117A8B] text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                YD
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold text-xs block leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yönetici Yetkilisi</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="text-[10px] text-[#17A2B8] font-bold block mt-0.5">yonetici@hudai.org.tr</span>
              </div>
            </div>

            <a 
              href="/admin-giris" 
              className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs hover:scale-105"
              title="Güvenli Çıkış"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Çıkış</span>
            </a>
          </div>

        </div>
      </header>

      <section className="bg-gradient-to-r from-[#0C3533] via-[#117A8B] to-[#0A2322] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-2xl relative overflow-hidden border-b border-[#145350]">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#17A2B8]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
         
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#17A2B8]/30 text-teal-100 border border-[#17A2B8]/50 px-4 py-2 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-teal-200" />
              <span>Hüdâyi Vakfı • Yetkili Denetim Masası</span>
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
            </div>
             
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Genel Bakış & Operasyon Merkezi
            </h1>
             
            <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed font-medium">
              Hak sahibi taleplerini, fatura çakışmalarını ve bağışları buradan güvenle yönetebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3.5 shrink-0">
            <div className="w-32 h-32 bg-[#092927]/90 border border-[#145350] rounded-3xl p-4 flex flex-col justify-between shadow-xl backdrop-blur-md hover:border-[#17A2B8]/50 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center justify-between">
                Toplam Talep <FileText className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 transition-transform" />
              </span>
              <div>
                <span className="text-3xl font-black text-white">{requests.length}</span>
                <span className="text-[10px] text-teal-200 block mt-0.5 font-semibold">Kayıtlı Talep</span>
              </div>
            </div>

            <div className="w-32 h-32 bg-[#092927]/90 border border-amber-500/40 rounded-3xl p-4 flex flex-col justify-between shadow-xl backdrop-blur-md hover:border-amber-500/70 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                Çakışan <AlertCircle className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 transition-transform animate-pulse" />
              </span>
              <div>
                <span className="text-3xl font-black text-amber-400">
                  {donations.filter(d => d.isConflict).length}
                </span>
                <span className="text-[10px] text-amber-200/80 block mt-0.5 font-semibold">Mükerrer Fatura</span>
              </div>
            </div>

            <div className="w-32 h-32 bg-[#092927]/90 border border-rose-500/40 rounded-3xl p-4 flex flex-col justify-between shadow-xl backdrop-blur-md hover:border-rose-500/70 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 flex items-center justify-between">
                Acil Durum <Flame className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 transition-transform text-rose-400" />
              </span>
              <div>
                <span className="text-3xl font-black text-rose-400">{requests.filter(r => r.urgency === 'Acil').length}</span>
                <span className="text-[10px] text-rose-200/80 block mt-0.5 font-semibold">Kritik Talep</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {notification && (
          <div className="bg-[#17A2B8]/15 border border-[#17A2B8]/40 text-slate-900 dark:text-white p-4 rounded-3xl flex items-center gap-3 shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-[#17A2B8] shrink-0" />
            <span className="text-xs font-bold">{notification}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
             
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               
              <div onClick={() => setActiveTab('needys')} className={`backdrop-blur-md p-7 rounded-3xl border-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-5 group ${isDarkMode ? 'bg-[#0C3533] border-emerald-600/40 text-white' : 'bg-emerald-50/80 border-emerald-600/60 text-emerald-950'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-2xl ${isDarkMode ? 'bg-emerald-900/80 text-emerald-100' : 'bg-emerald-200/90 text-emerald-900'}`}>İhtiyaç Sahipleri</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-emerald-900 text-emerald-100 group-hover:bg-emerald-700 group-hover:text-white' : 'bg-emerald-200 text-emerald-900 group-hover:bg-emerald-700 group-hover:text-white'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{needys.filter(n => n.status === 'Onaylı Hak Sahibi').length}</h3>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1.5 mt-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    <TrendingUp className="w-4 h-4" /> Tabloyu görüntüle →
                  </span>
                </div>
              </div>

              <div onClick={() => setActiveTab('donations')} className={`backdrop-blur-md p-7 rounded-3xl border-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-5 group ${isDarkMode ? 'bg-[#0C3533] border-amber-600/40 text-white' : 'bg-amber-50/80 border-amber-600/60 text-amber-950'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-2xl ${isDarkMode ? 'bg-amber-900/80 text-amber-100' : 'bg-amber-200/90 text-amber-900'}`}>Çakışan Talepler</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-amber-900 text-amber-100 group-hover:bg-amber-700 group-hover:text-white' : 'bg-amber-200 text-amber-900 group-hover:bg-amber-700 group-hover:text-white'}`}>
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>{donations.filter(d => d.isConflict).length}</h3>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1.5 mt-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Mükerrer ödeme uyarısı
                  </span>
                </div>
              </div>

              <div onClick={() => setActiveTab('donations')} className={`backdrop-blur-md p-7 rounded-3xl border-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-5 group ${isDarkMode ? 'bg-[#0C3533] border-indigo-600/40 text-white' : 'bg-indigo-50/70 border-indigo-600/60 text-indigo-950'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-2xl ${isDarkMode ? 'bg-indigo-900/80 text-indigo-100' : 'bg-indigo-200/90 text-indigo-900'}`}>Ödeme Bekleyenler</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-900 text-indigo-100 group-hover:bg-indigo-700 group-hover:text-white' : 'bg-indigo-200 text-indigo-900 group-hover:bg-indigo-700 group-hover:text-white'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
                    {donations.filter(d => d.paymentStatus === 'waiting_donor_payment').length}
                  </h3>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1.5 mt-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    <Sparkles className="w-4 h-4" /> İşlem bekliyor
                  </span>
                </div>
              </div>

              <div onClick={() => setActiveTab('donations')} className={`backdrop-blur-md p-7 rounded-3xl border-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-5 group ${isDarkMode ? 'bg-[#0C3533] border-teal-600/40 text-white' : 'bg-teal-50/80 border-teal-600/60 text-teal-950'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-2xl ${isDarkMode ? 'bg-teal-900/80 text-teal-100' : 'bg-teal-200/90 text-teal-900'}`}>Aktif Vitrin</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-teal-900 text-teal-100 group-hover:bg-[#17A2B8] group-hover:text-white' : 'bg-teal-200 text-teal-900 group-hover:bg-[#17A2B8] group-hover:text-white'}`}>
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-teal-950'}`}>{donations.length}</h3>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1.5 mt-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-800'}`}>
                    <Package className="w-4 h-4" /> Yayındaki toplam öğe
                  </span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
               
              <div className={`lg:col-span-2 rounded-3xl border border-[#17A2B8]/20 shadow-xl p-6 sm:p-8 space-y-6 ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex items-center justify-between border-b border-[#17A2B8]/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Acil İnceleme Bekleyen Talepler</h3>
                      <p className={`text-[11px] ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>Yöneticinin anında onaylaması gereken öncelikli kayıtlar.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-[#17A2B8] hover:underline flex items-center gap-1 cursor-pointer">
                    Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {requests.filter(r => r.urgency === 'Acil').slice(0, 3).map(req => (
                    <div key={req.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#092927] border-[#145350]' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase">Acil</span>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>{req.category}</span>
                        </div>
                        <h4 className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.title}</h4>
                        <span className={`text-[11px] ${isDarkMode ? 'text-teal-100' : 'text-slate-600'}`}>Hak Sahibi: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{req.applicantName}</strong> ({req.district}/{req.city})</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('requests')}
                        className="px-4 py-2 bg-[#17A2B8] text-white rounded-xl text-xs font-bold hover:bg-[#117A8B] transition-colors shadow-xs shrink-0 cursor-pointer"
                      >
                        İncele
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-3xl border shadow-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 ${isDarkMode ? 'bg-[#0C3533] border-[#17A2B8]/40 text-white' : 'bg-gradient-to-br from-[#17A2B8]/10 via-white to-[#117A8B]/10 border-[#17A2B8]/30 text-slate-900'}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? 'border-[#145350]' : 'border-[#17A2B8]/20'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#17A2B8] text-white rounded-xl shadow-md">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operasyonel Kısayollar</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#17A2B8] animate-ping"></span>
                  </div>

                  <div className="space-y-2.5">
                    <button 
                      onClick={() => setActiveTab('requests')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer shadow-xs ${isDarkMode ? 'bg-[#092927] hover:bg-[#145350] border-[#145350] text-teal-100' : 'bg-white hover:bg-[#17A2B8]/5 border-[#17A2B8]/25 text-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#17A2B8]" />
                        <span className="text-xs font-bold">Hak Sahibi Taleplerine Git</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#17A2B8] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => setActiveTab('donations')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer shadow-xs ${isDarkMode ? 'bg-[#092927] hover:bg-[#145350] border-[#145350] text-teal-100' : 'bg-white hover:bg-[#17A2B8]/5 border-[#17A2B8]/25 text-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="w-4 h-4 text-[#17A2B8]" />
                        <span className="text-xs font-bold">Bağışçı Onay Masası</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#17A2B8] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => setActiveTab('needys')}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer shadow-xs ${isDarkMode ? 'bg-[#092927] hover:bg-[#145350] border-[#145350] text-teal-100' : 'bg-white hover:bg-[#17A2B8]/5 border-[#17A2B8]/25 text-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-[#17A2B8]" />
                        <span className="text-xs font-bold">İhtiyaç Sahipleri Listesi</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#17A2B8] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-[11px] flex items-center justify-between shadow-inner ${isDarkMode ? 'bg-[#092927]/80 border-[#145350] text-teal-200' : 'bg-[#17A2B8]/10 border-[#17A2B8]/30 text-slate-700'}`}>
                  <span>Sistem Durumu: Güvenli</span>
                  <span className="font-black text-[#17A2B8]">Aktif</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-3xl border border-[#17A2B8]/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
              <div className={`p-2 rounded-2xl border border-[#17A2B8]/15 flex items-center gap-1.5 flex-wrap ${isDarkMode ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                {(['Tümü', 'Acil', 'Fatura Ödemesi', 'Onaylanan', 'Onaylanmayan'] as const).map(tabName => (
                  <button
                    key={tabName}
                    onClick={() => setRequestFilterTab(tabName)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      requestFilterTab === tabName 
                        ? 'bg-[#17A2B8] text-white shadow-md' 
                        : isDarkMode ? 'text-teal-200 hover:text-white hover:bg-[#17A2B8]/10' : 'text-slate-600 hover:text-slate-900 hover:bg-[#17A2B8]/10'
                    }`}
                  >
                    {tabName}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                <input
                  type="text"
                  placeholder="Talep, kişi veya şehir ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-[#17A2B8] w-full shadow-inner ${isDarkMode ? 'bg-[#092927] border border-[#145350] text-white placeholder:text-teal-400/60' : 'bg-[#17A2B8]/5 border border-[#17A2B8]/20 text-slate-900 placeholder:text-slate-400'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredRequests.length === 0 ? (
                <div className={`rounded-3xl border border-[#17A2B8]/20 p-12 text-center space-y-3 shadow-md col-span-full ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
                  <div className="w-12 h-12 bg-[#17A2B8]/10 text-[#17A2B8] rounded-2xl flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aranan kriterlere uygun talep bulunamadı</h4>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <div key={req.id} className={`rounded-3xl border p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5 ${isDarkMode ? 'bg-[#0C3533] border-[#17A2B8]/20' : 'bg-white border-[#17A2B8]/20 text-slate-900'}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border ${
                          req.status === 'pending_review' 
                            ? isDarkMode ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.status === 'approved' 
                              ? isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isDarkMode ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {req.status === 'pending_review' ? 'İnceleme Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>

                        {req.urgency && (
                          <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                            req.urgency === 'Acil' ? 'bg-rose-500 text-white border-rose-600 shadow-xs' : 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          }`}>
                            <Flame className="w-3.5 h-3.5" />
                            <span>{req.urgency} Aciliyet</span>
                          </span>
                        )}

                        <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-[#17A2B8]/20 text-[#17A2B8]' : 'bg-[#17A2B8]/10 text-[#17A2B8]'}`}>{req.category}</span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className={`text-base font-black leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.title}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>
                          <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hak Sahibi:</strong> {req.applicantName} ({req.phone}) • <MapPin className="w-3.5 h-3.5 inline text-[#17A2B8]" /> {req.district} / {req.city}
                        </p>
                      </div>

                      <div className={`grid grid-cols-2 gap-2.5 pt-2 border-t border-[#17A2B8]/10 text-xs`}>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#092927] border-[#145350]' : 'bg-[#17A2B8]/5 border-[#17A2B8]/10'}`}>
                          <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Hane Kişi Sayısı</span>
                          <strong className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.householdCount} Kişi</strong>
                        </div>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#092927] border-[#145350]' : 'bg-[#17A2B8]/5 border-[#17A2B8]/10'}`}>
                          <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Aylık Hane Geliri</span>
                          <strong className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.monthlyIncome}</strong>
                        </div>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#092927] border-[#145350]' : 'bg-[#17A2B8]/5 border-[#17A2B8]/10'}`}>
                          <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Destek Tutarı / Kurum</span>
                          <strong className={`font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{req.amount > 0 ? `${req.amount} TL` : req.institution}</strong>
                        </div>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#092927] border-[#145350]' : 'bg-[#17A2B8]/5 border-[#17A2B8]/10'}`}>
                          <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Son Ödeme / Tarih</span>
                          <strong className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.dueDate || '-'}</strong>
                        </div>
                      </div>

                      {req.type === 'fatura' && (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                          <div className="font-extrabold text-emerald-500 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Yalnızca Vakıf Görünümü (Fatura Detayı)
                          </div>
                          <div><strong className="opacity-75">Kurum / Abone:</strong> {req.institution}</div>
                          <div><strong className="opacity-75">Son Ödeme Tarihi:</strong> {req.dueDate || 'Belirtilmedi'}</div>
                          {req.invoicePhoto && (
                            <div>
                              <span className="opacity-75 block mb-1">Fatura Belgesi (Fotoğraf):</span>
                              <img src={req.invoicePhoto} alt="Fatura" className="w-full h-28 object-cover rounded-xl border border-emerald-500/30 shadow-xs" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#17A2B8]/10 mt-auto">
                      {req.status === 'pending_review' ? (
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className={`flex-1 font-extrabold py-3 px-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs ${isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'}`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reddet</span>
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="flex-1 bg-[#17A2B8] hover:bg-[#117A8B] text-white font-extrabold py-3 px-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Onayla</span>
                          </button>
                        </div>
                      ) : req.status === 'approved' ? (
                        <span className={`text-xs font-bold border py-3 px-4 rounded-2xl flex items-center gap-2 w-full justify-center shadow-xs ${isDarkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`}>
                          <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> Onaylandı (Ödeme Havuzuna Aktarıldı)
                        </span>
                      ) : (
                        <span className={`text-xs font-bold border py-3 px-4 rounded-2xl flex items-center gap-2 w-full justify-center shadow-xs ${isDarkMode ? 'text-rose-300 bg-rose-950/60 border-rose-800' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>
                          <XCircle className={`w-4 h-4 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} /> Talep Reddedildi
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-3xl border border-[#17A2B8]/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
              <div className={`p-2 rounded-2xl border border-[#17A2B8]/15 flex items-center gap-1.5 flex-wrap ${isDarkMode ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                {(['Tümü', 'Bekleyen İncelemeler', 'Çakışan Ödemeler', 'Ödeme Bekleyenler', 'Onaylananlar / Ödenenler'] as const).map(tabName => (
                  <button
                    key={tabName}
                    onClick={() => setDonationFilterTab(tabName)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      donationFilterTab === tabName 
                        ? 'bg-[#17A2B8] text-white shadow-md' 
                        : isDarkMode ? 'text-teal-200 hover:text-white hover:bg-[#17A2B8]/10' : 'text-slate-600 hover:text-slate-900 hover:bg-[#17A2B8]/10'
                    }`}
                  >
                    {tabName}
                    {tabName === 'Çakışan Ödemeler' && (
                      <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                        {donations.filter(d => d.isConflict).length}
                      </span>
                    )}
                    {tabName === 'Bekleyen İncelemeler' && (
                      <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                        {donations.filter(d => d.paymentStatus === 'pending_approval' && !d.isConflict).length}
                      </span>
                    )}
                    {tabName === 'Ödeme Bekleyenler' && (
                      <span className="ml-2 bg-amber-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                        {donations.filter(d => d.paymentStatus === 'waiting_donor_payment' && !d.isConflict).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className={`text-xs font-bold px-3 py-2 rounded-2xl border border-[#17A2B8]/15 ${isDarkMode ? 'bg-[#092927] text-teal-200' : 'bg-[#17A2B8]/5 text-slate-600'}`}>
                Aktif Bağış Kalemi: <span className="text-[#17A2B8] dark:text-teal-300 font-black">{filteredDonations.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredDonations.length === 0 ? (
                <div className={`rounded-3xl border border-[#17A2B8]/20 p-12 text-center space-y-3 shadow-md col-span-full ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
                  <div className="w-12 h-12 bg-[#17A2B8]/10 text-[#17A2B8] rounded-2xl flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bu sekmede gösterilecek öğe bulunmuyor.</h4>
                </div>
              ) : (
                filteredDonations.map(don => {
                  const theme = don.colorTheme || 'teal';
                  const isApproved = don.paymentStatus === 'approved';
                  const isWaitingDonorPayment = don.paymentStatus === 'waiting_donor_payment';
                  const isEsyaBagisi = don.type === 'esya_bagisi';

                  const themeClasses = don.isConflict ? {
                    card: isDarkMode ? 'bg-[#0C3533] border-amber-500 ring-2 ring-amber-400/30 shadow-md text-white' : 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30 shadow-md text-slate-900',
                    header: 'bg-gradient-to-br from-amber-800 to-amber-900 text-amber-100 shadow-md',
                    badge: 'bg-amber-100 text-amber-900 border-amber-300',
                    btnApprove: 'bg-amber-600 hover:bg-amber-700 text-white',
                    btnReject: isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  } : ({
                    teal: {
                      card: isDarkMode ? 'bg-[#0C3533] border-[#17A2B8]/30 ring-2 ring-[#17A2B8]/20 shadow-md text-white' : 'bg-white border-[#17A2B8]/30 ring-2 ring-[#17A2B8]/20 shadow-md text-slate-900',
                      header: 'bg-gradient-to-br from-[#0C3533] to-[#117A8B] text-teal-100 shadow-md',
                      badge: 'bg-[#17A2B8]/10 text-[#17A2B8] border-[#17A2B8]/20',
                      btnApprove: 'bg-[#17A2B8] hover:bg-[#117A8B] text-white',
                      btnReject: isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    },
                    amber: {
                      card: isDarkMode ? 'bg-[#0C3533] border-amber-700 ring-2 ring-amber-400/30 shadow-md text-white' : 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30 shadow-md text-amber-950',
                      header: 'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 text-amber-100 shadow-md',
                      badge: 'bg-amber-100 text-amber-900 border-amber-300',
                      btnApprove: 'bg-amber-600 hover:bg-amber-700 text-white',
                      btnReject: isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    },
                    indigo: {
                      card: isDarkMode ? 'bg-[#0C3533] border-indigo-700 ring-2 ring-indigo-400/30 shadow-md text-white' : 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/30 shadow-md text-indigo-950',
                      header: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-indigo-100 shadow-md',
                      badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                      btnApprove: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                      btnReject: isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }
                  } as Record<string, any>)[theme] || {
                    card: isDarkMode ? 'bg-[#0C3533] border-[#17A2B8]/30 ring-2 ring-[#17A2B8]/20 shadow-md text-white' : 'bg-white border-[#17A2B8]/30 ring-2 ring-[#17A2B8]/20 shadow-md text-slate-900',
                    header: 'bg-gradient-to-br from-[#0C3533] to-[#117A8B] text-teal-100 shadow-md',
                    badge: 'bg-[#17A2B8]/10 text-[#17A2B8] border-[#17A2B8]/20',
                    btnApprove: 'bg-[#17A2B8] hover:bg-[#117A8B] text-white',
                    btnReject: isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  };

                  return (
                    <div key={don.id} className={`rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between border ${themeClasses.card}`}>
                      <div>
                        {don.imageUrl ? (
                          <div className="relative h-48 w-full bg-slate-100 dark:bg-[#092927] overflow-hidden border-b border-[#17A2B8]/10">
                            <img src={don.imageUrl} alt={don.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-xl uppercase tracking-wider">
                              {don.category}
                            </span>
                            <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-xl shadow-md">
                              Bağışçı Fotoğrafı
                            </span>
                          </div>
                        ) : (
                          <div className={`p-6 flex flex-col justify-between ${themeClasses.header}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-xl bg-white/20 backdrop-blur-xs tracking-wider">
                                {don.category}
                              </span>
                              <Receipt className="w-6 h-6 opacity-90" />
                            </div>
                             
                            <div className="mt-6 flex items-center justify-between">
                              <span className="text-2xl font-black text-white">{don.amount > 0 ? `${don.amount} TL` : 'Fatura Desteği'}</span>
                            </div>
                          </div>
                        )}

                        <div className="p-7 space-y-4">
                          <div className={`flex items-center justify-between text-xs font-semibold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                            <span>{don.date}</span>
                            <span className="text-[#17A2B8] font-bold">{don.district} / {don.city}</span>
                          </div>

                          <h3 className={`text-base font-black leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{don.title}</h3>
                          <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-teal-100' : 'text-slate-600'}`}>{don.description}</p>

                          {don.isConflict && (
                            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-3">
                              <div className="font-black text-amber-500 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 shrink-0" /> Çakışan Fatura Ödemesi (Mükerrer İstek)
                              </div>
                              <p className="opacity-90 leading-relaxed font-medium">
                                Bu faturayı ödemek isteyen hayırseverler: <strong className="underline">{don.donorNames?.join(' ve ')}</strong>. Lütfen ödemeyi yapması için **1 kişi seçin**. Seçtiğiniz kişinin ödemesi onaylanacak, diğer hayırsever otomatik olarak reddedilecek ve faturanın ödendiğine dair mesaj iletilecektir.
                              </p>

                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block">Ödemeyi Gerçekleştirecek Hayırseveri Seçin:</span>
                                <div className="space-y-2">
                                  {don.donorNames?.map((donorName: string) => (
                                    <label key={donorName} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${don.selectedDonor === donorName ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold' : (isDarkMode ? 'bg-[#092927] border-[#145350] text-teal-100 hover:bg-[#145350]/50' : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-100/50')}`}>
                                      <div className="flex items-center gap-2.5">
                                        <input 
                                          type="radio" 
                                          name={`conflict_donor_${don.id}`} 
                                          checked={don.selectedDonor === donorName} 
                                          onChange={() => handleSelectConflictDonor(don.id, donorName)}
                                          className="accent-amber-600 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-xs">{donorName}</span>
                                      </div>
                                      {don.selectedDonor === donorName && (
                                        <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-lg">Seçildi (Onaylanacak)</span>
                                      )}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isDarkMode ? 'border-teal-900/50' : 'border-slate-100'}`}>
                            <div className={`p-3 rounded-2xl border shadow-inner ${isDarkMode ? 'bg-[#092927] border-teal-900/50' : 'bg-slate-50 border-slate-200/60'}`}>
                              <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                {isEsyaBagisi ? 'Eşyayı Ekleyen Bağışçı' : 'Ödemeyi Yapacak Hayırsever'}
                              </span>
                              <strong className={`text-xs font-extrabold truncate block mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {isEsyaBagisi ? don.donorName : (don.donorName || 'Mehmet Bulut')}
                              </strong>
                            </div>
                             
                            <div className={`p-3 rounded-2xl border shadow-inner ${isDarkMode ? 'bg-[#092927] border-teal-900/50' : 'bg-slate-50 border-slate-200/60'}`}>
                              <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                {isEsyaBagisi ? 'İletişim / Tel' : 'Fatura Tutarı'}
                              </span>
                              <strong className="text-xs text-[#17A2B8] font-extrabold block mt-0.5">
                                {isEsyaBagisi ? (don.donorPhone || '0535 111 22 33') : `${don.amount} TL`}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-7 pt-0 mt-auto">
                        {don.isConflict ? (
                          <div className="pt-2">
                            <button
                              onClick={() => handleApproveConflictDonation(don.id)}
                              className="w-full bg-[#17A2B8] hover:bg-[#117A8B] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Çakışmayı Çöz ve Onayla</span>
                            </button>
                          </div>
                        ) : !isApproved && !isWaitingDonorPayment ? (
                          <div className="space-y-2.5">
                            <button
                              onClick={() => handleApproveDonorEsya(don.id)}
                              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${themeClasses.btnApprove}`}
                            >
                              <Check className="w-4 h-4" />
                              <span>{isEsyaBagisi ? 'Bağış Eşyasını Onayla ve Vitrine Çıkar' : 'Ödeme Bildirimini Onayla'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectDonorEsya(don.id)}
                              className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${themeClasses.btnReject}`}
                            >
                              <X className="w-4 h-4" />
                              <span>{isEsyaBagisi ? 'Bu Bağışı Reddet' : 'Talebi Reddet'}</span>
                            </button>
                          </div>
                        ) : isWaitingDonorPayment ? (
                          <div className="space-y-3">
                            <div className={`text-[11px] font-extrabold border py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 shadow-inner ${isDarkMode ? 'text-amber-300 bg-amber-950/60 border-amber-800' : 'text-amber-900 bg-amber-100 border-amber-300'}`}>
                              <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> Ödeme Bekliyor (Bağışçı İşlemi)
                            </div>
                            <button
                              onClick={() => {
                                setDonations(prev => prev.map(item => item.id === don.id ? { ...item, paymentStatus: 'approved', receiptUrl: '/receipts/fatura_makbuz_ornek.pdf', receiptName: 'fatura_odeme_makbuzu.pdf' } : item));
                                setNotification('Bağışçı ödemesi onaylandı ve makbuz sisteme eklendi.');
                                setTimeout(() => setNotification(null), 4000);
                              }}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Simüle Et: Bağışçı Ödemeyi Yaptı (Makbuz Yükle)
                            </button>
                          </div>
                        ) : isEsyaBagisi ? (
                          <div className={`text-[11px] font-extrabold border py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 shadow-inner ${isDarkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> Onaylandı & Vitrinde Yayınlandı
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className={`text-[11px] font-extrabold border py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 shadow-inner ${isDarkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`}>
                              <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> Ödeme Tamamlandı & Makbuz Yüklendi
                            </div>
                            {don.receiptUrl && (
                              <button
                                onClick={() => handleViewReport(don.receiptUrl!, don.receiptName!)}
                                className={`w-full py-3 px-4 border border-[#17A2B8]/30 hover:bg-[#17A2B8]/10 text-[#17A2B8] rounded-2xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${isDarkMode ? 'bg-[#092927]' : 'bg-white'}`}
                              >
                                <FileDown className="w-4 h-4 text-rose-500" />
                                <span>Ödeme Makbuzunu Görüntüle / İndir</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'needys' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`rounded-3xl border border-[#17A2B8]/25 shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
              <div className={`p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#17A2B8]/15 ${isDarkMode ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kayıtlı İhtiyaç Sahipleri Listesi</h3>
                    <span className="text-xs font-black bg-[#17A2B8] text-white px-3 py-1 rounded-xl shadow-xs">
                      {filteredNeedys.length} Kişi
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>Vakıf onaylı hak sahipleri ve inceleme raporu bekleyen başvurular.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className={`flex items-center gap-1 p-1 rounded-2xl border border-[#17A2B8]/30 shadow-inner w-full sm:w-auto ${isDarkMode ? 'bg-[#092927]' : 'bg-white'}`}>
                    {(['Tümü', 'Onaylı Hak Sahibi', 'Onay Bekliyor'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setNeedyStatusFilter(status)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                          needyStatusFilter === status 
                            ? 'bg-[#17A2B8] text-white shadow-md' 
                            : isDarkMode ? 'text-teal-200 hover:text-white hover:bg-[#17A2B8]/10' : 'text-slate-600 hover:text-slate-900 hover:bg-[#17A2B8]/10'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                    <input
                      type="text"
                      placeholder="İsim veya T.C. ile ara..."
                      value={needySearch}
                      onChange={(e) => setNeedySearch(e.target.value)}
                      className={`rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-[#17A2B8] w-full sm:w-64 shadow-inner ${isDarkMode ? 'bg-[#092927] border border-[#145350] text-white placeholder:text-teal-400/60' : 'bg-white border border-[#17A2B8]/30 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`overflow-x-auto ${isDarkMode ? 'bg-[#0C3533]' : 'bg-white'}`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-black border-b border-[#17A2B8]/20 tracking-wider ${isDarkMode ? 'bg-[#092927] text-teal-100' : 'bg-[#17A2B8]/10 text-slate-800'}`}>
                      <th className="py-4 px-6">Tam Adı Soyadı</th>
                      <th className="py-4 px-6">T.C. Kimlik No</th>
                      <th className="py-4 px-6">İnceleme Raporu (PDF)</th>
                      <th className="py-4 px-6">İletişim (Telefon / E-Posta)</th>
                      <th className="py-4 px-6">Adres / Lokasyon</th>
                      <th className="py-4 px-6">Kayıt Tarihi</th>
                      <th className="py-4 px-6">Vakıf İşlemi / Durum</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium align-middle ${isDarkMode ? 'divide-teal-900/40 text-teal-100' : 'divide-[#17A2B8]/10 text-slate-700'}`}>
                    {filteredNeedys.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`py-12 text-center font-bold ${isDarkMode ? 'text-teal-400/60' : 'text-slate-400'}`}>
                          Aranan kriterlere uygun ihtiyaç sahibi bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filteredNeedys.map((needy) => {
                        const isPending = needy.status === 'Onay Bekliyor';
                        return (
                          <tr 
                            key={needy.id} 
                            className={`transition-colors ${isPending ? (isDarkMode ? 'bg-amber-950/30' : 'bg-amber-50/80') : (isDarkMode ? 'hover:bg-[#092927]' : 'hover:bg-[#17A2B8]/5')}`}
                          >
                            <td className={`py-4 px-6 font-extrabold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              <span>
                                {needy.fullName}
                              </span>
                            </td>
                            <td className={`py-4 px-6 font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-teal-100' : 'text-slate-800'}`}>{needy.identityNo}</td>
                             
                            <td className="py-4 px-6 whitespace-nowrap">
                              <button
                                onClick={() => handleViewReport(needy.reportUrl, needy.reportName)}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 border border-[#17A2B8]/30 hover:bg-[#17A2B8]/10 rounded-xl font-bold text-[11px] transition-all cursor-pointer shadow-xs ${isDarkMode ? 'bg-[#092927] text-teal-300' : 'bg-white text-[#17A2B8]'}`}
                                title="PDF Raporunu Yeni Sekmede Aç"
                              >
                                <FileText className="w-4 h-4 text-rose-500" />
                                <span className="underline truncate max-w-[140px] font-extrabold">{needy.reportName}</span>
                                <Eye className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                              </button>
                            </td>

                            <td className={`py-4 px-6 whitespace-nowrap ${isDarkMode ? 'text-teal-200' : 'text-slate-700'}`}>
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 font-bold">
                                  <Phone className="w-3.5 h-3.5 text-[#17A2B8]" /> {needy.phone}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                  <Mail className="w-3.5 h-3.5 text-[#17A2B8]" /> {needy.email}
                                </span>
                              </div>
                            </td>

                            <td className={`py-4 px-6 max-w-xs truncate font-medium ${isDarkMode ? 'text-teal-300' : 'text-slate-600'}`} title={needy.address}>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-[#17A2B8] shrink-0" /> {needy.address}
                              </span>
                            </td>
                            <td className={`py-4 px-6 whitespace-nowrap font-medium ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>{needy.registerDate}</td>
                             
                            <td className="py-4 px-6 whitespace-nowrap">
                              {!isPending ? (
                                <span className={`inline-block px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-2xs ${isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                                  Onaylı Hak Sahibi
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApproveNeedy(needy.id)}
                                    className="px-3.5 py-2 bg-[#17A2B8] hover:bg-[#117A8B] text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1"
                                    title="Onayla"
                                  >
                                    <Check className="w-4 h-4" /> Onayla
                                  </button>
                                  <button
                                    onClick={() => handleRejectNeedy(needy.id)}
                                    className={`px-3.5 py-2 border rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-xs ${isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'}`}
                                    title="Reddet"
                                  >
                                    <X className="w-4 h-4" /> Reddet
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`rounded-3xl border border-[#17A2B8]/25 shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`}>
              <div className={`p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#17A2B8]/15 ${isDarkMode ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kayıtlı Bağışçılar Havuzu Listesi</h3>
                    <span className="text-xs font-black bg-[#17A2B8] text-white px-3 py-1 rounded-xl shadow-xs">
                      {filteredDonors.length} Bağışçı
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>Sisteme kayıtlı olan hayırsever bağışçılarımız.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                  <input
                    type="text"
                    placeholder="İsim veya T.C. ile ara..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    className={`rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-[#17A2B8] w-full sm:w-72 shadow-inner ${isDarkMode ? 'bg-[#092927] border border-[#145350] text-white placeholder:text-teal-400/60' : 'bg-white border border-[#17A2B8]/30 text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>

              <div className={`overflow-x-auto ${isDarkMode ? 'bg-[#0C3533]' : 'bg-white'}`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-black border-b border-[#17A2B8]/20 tracking-wider ${isDarkMode ? 'bg-[#092927] text-teal-100' : 'bg-[#17A2B8]/10 text-slate-800'}`}>
                      <th className="py-4 px-6">Tam Adı Soyadı</th>
                      <th className="py-4 px-6">T.C. Kimlik No</th>
                      <th className="py-4 px-6">Telefon Numarası</th>
                      <th className="py-4 px-6">E-Posta Adresi</th>
                      <th className="py-4 px-6">Adres / Lokasyon</th>
                      <th className="py-4 px-6">Kayıt Tarihi</th>
                      <th className="py-4 px-6">Durumu</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium align-middle ${isDarkMode ? 'divide-teal-900/40 text-teal-100' : 'divide-[#17A2B8]/10 text-slate-700'}`}>
                    {filteredDonors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`py-12 text-center font-bold ${isDarkMode ? 'text-teal-400/60' : 'text-slate-400'}`}>
                          Aranan kriterlere uygun bağışçı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filteredDonors.map((donor) => (
                        <tr key={donor.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#092927]' : 'hover:bg-[#17A2B8]/5'}`}>
                          <td className={`py-4 px-6 font-extrabold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{donor.fullName}</td>
                          <td className={`py-4 px-6 font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-teal-100' : 'text-slate-800'}`}>{donor.identityNo}</td>
                          <td className={`py-4 px-6 font-bold whitespace-nowrap ${isDarkMode ? 'text-teal-100' : 'text-slate-800'}`}>
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-[#17A2B8]" /> {donor.phone}
                            </span>
                          </td>
                          <td className={`py-4 px-6 whitespace-nowrap font-medium ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-[#17A2B8]" /> {donor.email}
                            </span>
                          </td>
                          <td className={`py-4 px-6 max-w-xs truncate font-medium ${isDarkMode ? 'text-teal-300' : 'text-slate-600'}`} title={donor.address}>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#17A2B8] shrink-0" /> {donor.address}
                            </span>
                          </td>
                          <td className={`py-4 px-6 whitespace-nowrap font-medium ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>{donor.date}</td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-block px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-2xs ${isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                              {donor.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>

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