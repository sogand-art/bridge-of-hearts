'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, addDoc, collection, onSnapshot, serverTimestamp, deleteField,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  ShieldCheck, FileText, Package, Users, CheckCircle2, XCircle, Clock, MapPin, LogOut, Search,
  Calendar, Gift, Check, X, Sparkles, Flame, Menu, LayoutDashboard, HeartHandshake, TrendingUp,
  ArrowRight, Phone, Mail, Eye, Receipt, Moon, Sun, Lock, AlertCircle,
} from 'lucide-react';

type Tab = 'dashboard' | 'requests' | 'donations' | 'needys' | 'donors';

const fmtDate = (ts: any) =>
  ts?.seconds ? new Date(ts.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

export default function AdminDashboardPage() {
  const [authReady, setAuthReady] = useState(false);
  const [rawRequests, setRawRequests] = useState<any[]>([]);
  const [rawListings, setRawListings] = useState<any[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [requestFilterTab, setRequestFilterTab] = useState<'Tümü' | 'Acil' | 'Fatura Ödemesi' | 'Onaylanan' | 'Onaylanmayan'>('Tümü');
  const [donationFilterTab, setDonationFilterTab] = useState<'Tümü' | 'Bekleyen İncelemeler' | 'Ödeme Bekleyenler' | 'Onaylananlar / Ödenenler'>('Tümü');
  const [needySearch, setNeedySearch] = useState('');
  const [needyStatusFilter, setNeedyStatusFilter] = useState<'Tümü' | 'Onaylı Hak Sahibi' | 'Onay Bekliyor'>('Tümü');
  const [donorSearch, setDonorSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const notify = (msg: string, ms = 4000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), ms);
  };

  // ---- Oturum + admin kontrolü ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/admin-giris'; return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists() || (snap.data() as any).role !== 'admin') {
          window.location.href = '/admin-giris';
          return;
        }
        setAdminEmail(user.email || '');
      } catch (e) {
        console.error(e);
        window.location.href = '/admin-giris';
        return;
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ---- Canlı veri ----
  useEffect(() => {
    if (!authReady) return;
    const onErr = (name: string) => (err: any) => {
      console.error(name, err);
      setLoadError(`${name} okunamadı: ${err.message}`);
    };
    const u1 = onSnapshot(collection(db, 'requests'),
      (s) => setRawRequests(s.docs.map((d) => ({ ...(d.data() as any), id: d.id }))), onErr('requests'));
    const u2 = onSnapshot(collection(db, 'itemListings'),
      (s) => setRawListings(s.docs.map((d) => ({ ...(d.data() as any), id: d.id }))), onErr('itemListings'));
    const u3 = onSnapshot(collection(db, 'users'),
      (s) => setRawUsers(s.docs.map((d) => ({ ...(d.data() as any), id: d.id }))), onErr('users'));
    return () => { u1(); u2(); u3(); };
  }, [authReady]);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setCurrentDateTime(n.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' • ' + n.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  // ---- Veriyi ekranın beklediği biçime çevir ----
  const userMap: Record<string, any> = {};
  rawUsers.forEach((u) => { userMap[u.id] = u; });
  const userName = (uid?: string) => (uid && (userMap[uid]?.fullName || userMap[uid]?.name || userMap[uid]?.email)) || '-';
  const userPhone = (uid?: string) => (uid && userMap[uid]?.phone) || '-';

  const requests = rawRequests
    .map((x) => {
      const category = x.category || 'Fatura Ödemesi';
      const isInvoice = /fatura/i.test(category) || x.type === 'fatura';
      const status = x.status === 'approved' || x.status === 'rejected' ? x.status : 'pending_review';
      return {
        id: x.id,
        createdAt: x.createdAt,
        applicantName: x.applicantName || '-',
        phone: x.applicantPhone || '-',
        city: x.city || '',
        district: x.district || '',
        title: x.title || x.requestTitle || x.description || category,
        category,
        type: isInvoice ? 'fatura' : 'esya',
        amount: Number(x.amount) || 0,
        urgency: x.urgency || x.urgencyLevel || '',
        status,
        institution: x.institution || '-',
        dueDate: x.dueDate || '-',
        householdCount: x.householdCount ?? '-',
        monthlyIncome: x.monthlyIncome || '-',
        invoicePhoto: x.invoicePhoto || '',
        paymentStatus: x.paymentStatus || 'none',
        requestedBy: x.requestedBy || '',
        paidBy: x.paidBy || '',
        date: fmtDate(x.createdAt),
      };
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  type Card = {
    key: string; kind: 'listing' | 'invoice'; id: string; title: string; category: string; city: string; district: string;
    donorName: string; donorPhone: string; amount: number; imageUrl: string | null; description: string;
    stage: 'pending' | 'waiting' | 'done'; date: string; createdAt: any;
  };

  const cards: Card[] = [
    ...rawListings.map((l): Card => ({
      key: 'l_' + l.id, kind: 'listing', id: l.id,
      title: l.title || 'Eşya', category: l.category || 'Eşya', city: l.city || '', district: l.district || '',
      donorName: userName(l.userId), donorPhone: userPhone(l.userId), amount: 0,
      imageUrl: l.image || null, description: `Kondisyon: ${l.condition || '-'}`,
      stage: (l.status || '').includes('Bekliyor') ? 'pending' : (l.status || '').includes('Onaylandı') ? 'done' : 'done',
      date: fmtDate(l.createdAt), createdAt: l.createdAt,
      ...( (l.status || '').includes('Reddedildi') ? {} : {} ),
    })).filter((c, i) => !(rawListings[i].status || '').includes('Reddedildi')),
    ...requests
      .filter((r) => ['requested', 'approved', 'paid'].includes(r.paymentStatus))
      .map((r): Card => ({
        key: 'r_' + r.id, kind: 'invoice', id: r.id,
        title: r.title, category: r.category, city: r.city, district: r.district,
        donorName: userName(r.paymentStatus === 'paid' ? r.paidBy : r.requestedBy),
        donorPhone: userPhone(r.paymentStatus === 'paid' ? r.paidBy : r.requestedBy),
        amount: r.amount, imageUrl: null, description: `${r.institution !== '-' ? r.institution + ' • ' : ''}Son ödeme: ${r.dueDate}`,
        stage: r.paymentStatus === 'requested' ? 'pending' : r.paymentStatus === 'approved' ? 'waiting' : 'done',
        date: r.date, createdAt: r.createdAt,
      })),
  ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const isNeedyApproved = (u: any) => u.approvalStatus === 'approved';
  const needys = rawUsers
    .filter((u) => u.role !== 'donor' && u.role !== 'admin' && u.approvalStatus !== 'rejected')
    .map((u) => ({
      id: u.id,
      fullName: u.fullName || u.name || u.email || '-',
      identityNo: u.identityNo || u.tcNo || u.tc || '-',
      phone: u.phone || '-',
      email: u.email || '-',
      address: [u.address, u.district, u.city].filter(Boolean).join(', ') || '-',
      status: isNeedyApproved(u) ? 'Onaylı Hak Sahibi' : 'Onay Bekliyor',
      registerDate: fmtDate(u.createdAt),
      reportUrl: u.reportUrl || '',
      reportName: u.reportName || (u.reportUrl ? 'inceleme_raporu.pdf' : 'Rapor yok'),
    }));

  const donors = rawUsers
    .filter((u) => u.role === 'donor')
    .map((u) => ({
      id: u.id,
      fullName: u.fullName || u.name || u.email || '-',
      identityNo: u.identityNo || u.tcNo || u.tc || '-',
      phone: u.phone || '-',
      email: u.email || '-',
      address: [u.address, u.district, u.city].filter(Boolean).join(', ') || '-',
      status: 'Aktif Bağışçı',
      date: fmtDate(u.createdAt),
    }));

  // ---- İşlemler ----
  const run = async (fn: () => Promise<void>, ok: string) => {
    try { await fn(); notify(ok); }
    catch (e: any) { console.error(e); notify('İşlem başarısız: ' + (e?.message || '')); }
  };

 const handleApproveRequest = (id: string) =>
  run(() => updateDoc(doc(db, 'requests', id), {
    status: 'approved',
    statusText: 'Vakıf Onayladı / Bağışçı Bekleniyor',
    approvedAt: serverTimestamp(),
    paymentStatus: 'none',
  }), 'Talep onaylandı, bağışçılara açıldı.');
 const handleRejectRequest = (id: string) =>
  run(() => updateDoc(doc(db, 'requests', id), {
    status: 'rejected',
    statusText: 'Vakıf Tarafından Reddedildi',
  }), 'Talep reddedildi.');

  const approveListing = (id: string) =>
    run(() => updateDoc(doc(db, 'itemListings', id), { status: 'Onaylandı & Yayında' }), 'Eşya bağışı onaylandı.');
  const rejectListing = (id: string) =>
    run(() => updateDoc(doc(db, 'itemListings', id), { status: 'Reddedildi' }), 'Eşya bağışı reddedildi.');

  const approveInvoicePayment = (id: string) =>
    run(() => updateDoc(doc(db, 'requests', id), { paymentStatus: 'approved' }), 'Onaylandı, bağışçı ödeme yapabilir.');
  const rejectInvoicePayment = (id: string) =>
    run(() => updateDoc(doc(db, 'requests', id), { paymentStatus: 'none', requestedBy: deleteField(), requestedAt: deleteField() }), 'Bağışçı isteği reddedildi.');

  const markPaid = (c: Card) => {
    const r = requests.find((x) => x.id === c.id);
    if (!r) return;
    return run(async () => {
      const donorUid = r.requestedBy || '';
      await updateDoc(doc(db, 'requests', r.id), { paymentStatus: 'paid', paidBy: donorUid, paidAt: serverTimestamp() });
      if (donorUid) {
        await addDoc(collection(db, 'donations'), {
          userId: donorUid, type: 'fatura', title: r.title, amount: r.amount,
          location: [r.district, r.city].filter(Boolean).join(', '),
          receiptNo: `MAK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: serverTimestamp(),
        });
      }
    }, 'Ödeme kaydedildi, bağışçının geçmişine eklendi.');
  };

  const approveNeedy = (id: string) =>
    run(() => updateDoc(doc(db, 'users', id), { approvalStatus: 'approved' }), 'İhtiyaç sahibi onaylandı.');
  const rejectNeedy = (id: string) =>
    run(() => updateDoc(doc(db, 'users', id), { approvalStatus: 'rejected' }), 'Başvuru reddedildi.');

  const openReport = (url: string, name: string) => {
    if (!url) { notify('Bu kişi için yüklenmiş rapor yok.'); return; }
    notify(`"${name}" açılıyor.`);
    window.open(url, '_blank');
  };

  // ---- Filtreler ----
  const q = searchQuery.toLowerCase();
  const filteredRequests = requests.filter((r) => {
    const m = r.title.toLowerCase().includes(q) || r.applicantName.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
    if (requestFilterTab === 'Acil') return m && r.urgency === 'Acil';
    if (requestFilterTab === 'Fatura Ödemesi') return m && r.category === 'Fatura Ödemesi';
    if (requestFilterTab === 'Onaylanan') return m && r.status === 'approved';
    if (requestFilterTab === 'Onaylanmayan') return m && r.status !== 'approved';
    return m;
  });
  const filteredCards = cards.filter((c) => {
    if (donationFilterTab === 'Bekleyen İncelemeler') return c.stage === 'pending';
    if (donationFilterTab === 'Ödeme Bekleyenler') return c.stage === 'waiting';
    if (donationFilterTab === 'Onaylananlar / Ödenenler') return c.stage === 'done';
    return true;
  });
  const filteredNeedys = needys.filter((n) =>
    (n.fullName.toLowerCase().includes(needySearch.toLowerCase()) || n.identityNo.includes(needySearch)) &&
    (needyStatusFilter === 'Tümü' || n.status === needyStatusFilter));
  const filteredDonors = donors.filter((d) =>
    d.fullName.toLowerCase().includes(donorSearch.toLowerCase()) || d.identityNo.includes(donorSearch));

  const pendingCardCount = cards.filter((c) => c.stage === 'pending').length;
  const waitingCardCount = cards.filter((c) => c.stage === 'waiting').length;
  const urgentCount = requests.filter((r) => r.urgency === 'Acil' && r.status === 'pending_review').length;
  const pendingRequestCount = requests.filter((r) => r.status === 'pending_review').length;

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F9F9] text-slate-500 text-sm font-bold">Yükleniyor...</div>;
  }

  // ---- Stil yardımcıları ----
  const d = isDarkMode;
  const panel = `rounded-3xl border border-[#17A2B8]/20 shadow-md ${d ? 'bg-[#0C3533] text-white' : 'bg-white text-slate-900'}`;
  const tabsBox = `p-2 rounded-2xl border border-[#17A2B8]/15 flex items-center gap-1.5 flex-wrap ${d ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`;
  const tabBtn = (a: boolean) => `px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${a ? 'bg-[#17A2B8] text-white shadow-md' : d ? 'text-teal-200 hover:text-white hover:bg-[#17A2B8]/10' : 'text-slate-600 hover:text-slate-900 hover:bg-[#17A2B8]/10'}`;
  const inputCls = `rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-[#17A2B8] w-full shadow-inner ${d ? 'bg-[#092927] border border-[#145350] text-white placeholder:text-teal-400/60' : 'bg-[#17A2B8]/5 border border-[#17A2B8]/20 text-slate-900 placeholder:text-slate-400'}`;
  const miniBox = `p-3 rounded-2xl border ${d ? 'bg-[#092927] border-[#145350]' : 'bg-[#17A2B8]/5 border-[#17A2B8]/10'}`;
  const miniLabel = `text-[10px] block font-bold ${d ? 'text-teal-300' : 'text-slate-500'}`;
  const miniVal = `font-extrabold ${d ? 'text-white' : 'text-slate-900'}`;
  const rejectBtn = `font-extrabold py-3 px-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs ${d ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'}`;
  const okBtn = 'bg-[#17A2B8] hover:bg-[#117A8B] text-white font-extrabold py-3 px-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md';
  const doneBox = `text-xs font-bold border py-3 px-4 rounded-2xl flex items-center gap-2 w-full justify-center shadow-xs ${d ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`;
  const th = 'py-4 px-6';

  const navItems: { tab: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard (Genel Bakış)', icon: <LayoutDashboard className="w-4 h-4 text-teal-200" /> },
    { tab: 'requests', label: 'Hak Sahibi Taleplerini Yönet', icon: <FileText className="w-4 h-4 text-teal-200" />, count: requests.length },
    { tab: 'donations', label: 'Bağışçı Onay & Fatura Ödemeleri', icon: <Gift className="w-4 h-4 text-teal-200" />, count: cards.length },
    { tab: 'needys', label: 'İhtiyaç Sahipleri Listesi', icon: <Users className="w-4 h-4 text-teal-200" />, count: needys.length },
    { tab: 'donors', label: 'Bağışçılar Listesi', icon: <HeartHandshake className="w-4 h-4 text-teal-200" />, count: donors.length },
  ];

  const statCards = [
    { label: 'İhtiyaç Sahipleri', value: needys.filter((n) => n.status === 'Onaylı Hak Sahibi').length, sub: 'Tabloyu görüntüle →', icon: <Users className="w-5 h-5" />, tab: 'needys' as Tab, c: 'emerald' },
    { label: 'Bekleyen Talepler', value: pendingRequestCount, sub: 'İnceleme bekliyor', icon: <AlertCircle className="w-5 h-5" />, tab: 'requests' as Tab, c: 'amber' },
    { label: 'Ödeme Bekleyenler', value: waitingCardCount, sub: 'İşlem bekliyor', icon: <Clock className="w-5 h-5" />, tab: 'donations' as Tab, c: 'indigo' },
    { label: 'Aktif Vitrin', value: cards.length, sub: 'Bağışçı hareketi', icon: <Gift className="w-5 h-5" />, tab: 'donations' as Tab, c: 'teal' },
  ];
  const colorMap: Record<string, { l: string; dk: string }> = {
    emerald: { l: 'bg-emerald-50/80 border-emerald-600/60 text-emerald-950', dk: 'bg-[#0C3533] border-emerald-600/40 text-white' },
    amber: { l: 'bg-amber-50/80 border-amber-600/60 text-amber-950', dk: 'bg-[#0C3533] border-amber-600/40 text-white' },
    indigo: { l: 'bg-indigo-50/70 border-indigo-600/60 text-indigo-950', dk: 'bg-[#0C3533] border-indigo-600/40 text-white' },
    teal: { l: 'bg-teal-50/80 border-teal-600/60 text-teal-950', dk: 'bg-[#0C3533] border-teal-600/40 text-white' },
  };

  return (
    <div className={`min-h-screen font-sans relative selection:bg-[#17A2B8] selection:text-white flex flex-col justify-between ${d ? 'bg-[#0A2322] text-white' : 'bg-[#F4F9F9] text-slate-900'}`}>
      <div>
        {/* Yan panel */}
        <div className={`fixed inset-0 bg-[#0A2322]/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
        <aside className={`fixed top-0 left-0 bottom-0 w-80 z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 bg-[#0C3533] text-white border-r border-[#145350] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#145350]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#17A2B8]/20 text-[#17A2B8] rounded-2xl border border-[#17A2B8]/40"><ShieldCheck className="w-6 h-6" /></div>
                <div>
                  <span className="font-black text-sm tracking-wide block leading-tight">VAKIF YÖNETİMİ</span>
                  <span className="text-[10px] text-[#17A2B8] font-extrabold tracking-widest uppercase">KONTROL MERKEZİ</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 opacity-70 hover:opacity-100 rounded-xl bg-[#092927] hover:bg-[#145350] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-300/80 px-1">Yönetim Menüsü</h4>
              {navItems.map((n) => (
                <button key={n.tab} onClick={() => { setActiveTab(n.tab); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === n.tab ? 'bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/30 scale-[1.02]' : 'bg-[#092927] hover:bg-[#145350] text-teal-100'}`}>
                  <div className="flex items-center gap-3">{n.icon}<span>{n.label}</span></div>
                  {n.count !== undefined && <span className="bg-[#145350] text-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-black">{n.count}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-[#145350] text-[11px] text-teal-300 text-center font-medium">Aziz Mahmud Hüdayi Vakfı © 2026</div>
        </aside>

        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm ${d ? 'bg-[#0C3533]/95 border-teal-800/40 text-white' : 'bg-white/95 border-[#17A2B8]/15 text-slate-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="p-3 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/30 text-[#17A2B8] hover:bg-[#17A2B8]/20 cursor-pointer"><Menu className="w-5 h-5" /></button>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="p-2.5 bg-gradient-to-br from-[#17A2B8] to-[#117A8B] text-white rounded-2xl shadow-md"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <span className="font-black text-sm tracking-tight block leading-none">HÜDAYİ VAKFI</span>
                  <span className="text-[10px] text-[#17A2B8] font-extrabold tracking-wider uppercase mt-1 block">Yönetim ve Denetim Masası</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-[11px] font-bold ${d ? 'bg-[#092927] border-[#145350] text-white' : 'bg-[#17A2B8]/5 border-[#17A2B8]/15 text-slate-700'}`}>
                <Calendar className="w-4 h-4 text-[#17A2B8]" /><span>{currentDateTime}</span>
              </div>
              <button onClick={() => setIsDarkMode(!d)} className="p-3 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/25 text-[#17A2B8] hover:bg-[#17A2B8]/20 cursor-pointer">
                {d ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/25">
                <div className="w-9 h-9 bg-gradient-to-br from-[#17A2B8] to-[#117A8B] text-white rounded-xl flex items-center justify-center font-black text-xs">YD</div>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5"><span className="font-extrabold text-xs block leading-tight">Yönetici Yetkilisi</span><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span></div>
                  <span className="text-[10px] text-[#17A2B8] font-bold block mt-0.5">{adminEmail}</span>
                </div>
              </div>
              <button onClick={async () => { await signOut(auth); window.location.href = '/admin-giris'; }}
                className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <LogOut className="w-4 h-4" /><span className="hidden xl:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-r from-[#0C3533] via-[#117A8B] to-[#0A2322] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-2xl relative overflow-hidden border-b border-[#145350]">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#17A2B8]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#17A2B8]/30 text-teal-100 border border-[#17A2B8]/50 px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-teal-200" /><span>Hüdâyi Vakfı • Yetkili Denetim Masası</span><span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Genel Bakış & Operasyon Merkezi</h1>
              <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed font-medium">Hak sahibi taleplerini, bağışçı onaylarını ve ödemeleri buradan güvenle yönetebilirsiniz.</p>
            </div>
            <div className="grid grid-cols-3 gap-3.5 shrink-0">
              {[
                { t: 'Toplam Talep', v: requests.length, s: 'Kayıtlı Talep', b: 'border-[#145350]', c: 'text-white', tc: 'text-teal-300', sc: 'text-teal-200', icon: <FileText className="w-3.5 h-3.5 opacity-70" /> },
                { t: 'Bekleyen', v: pendingCardCount, s: 'Bağışçı Onayı', b: 'border-amber-500/40', c: 'text-amber-400', tc: 'text-amber-300', sc: 'text-amber-200/80', icon: <AlertCircle className="w-3.5 h-3.5 opacity-70" /> },
                { t: 'Acil Durum', v: urgentCount, s: 'Kritik Talep', b: 'border-rose-500/40', c: 'text-rose-400', tc: 'text-rose-300', sc: 'text-rose-200/80', icon: <Flame className="w-3.5 h-3.5 opacity-70 text-rose-400" /> },
              ].map((s) => (
                <div key={s.t} className={`w-32 h-32 bg-[#092927]/90 border ${s.b} rounded-3xl p-4 flex flex-col justify-between shadow-xl backdrop-blur-md`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${s.tc} flex items-center justify-between`}>{s.t} {s.icon}</span>
                  <div><span className={`text-3xl font-black ${s.c}`}>{s.v}</span><span className={`text-[10px] ${s.sc} block mt-0.5 font-semibold`}>{s.s}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {notification && (
            <div className="bg-[#17A2B8]/15 border border-[#17A2B8]/40 p-4 rounded-3xl flex items-center gap-3 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-[#17A2B8] shrink-0" /><span className="text-xs font-bold">{notification}</span>
            </div>
          )}
          {loadError && (
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold">{loadError} — Firestore Rules'ta admin yetkisini kontrol edin.</div>
          )}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s) => (
                  <div key={s.label} onClick={() => setActiveTab(s.tab)} className={`p-7 rounded-3xl border-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-5 ${d ? colorMap[s.c].dk : colorMap[s.c].l}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-2xl bg-black/10">{s.label}</span>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-black/10">{s.icon}</div>
                    </div>
                    <div><h3 className="text-4xl font-black">{s.value}</h3><span className="text-[11px] font-extrabold flex items-center gap-1.5 mt-2"><TrendingUp className="w-4 h-4" /> {s.sub}</span></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className={`lg:col-span-2 ${panel} shadow-xl p-6 sm:p-8 space-y-6`}>
                  <div className="flex items-center justify-between border-b border-[#17A2B8]/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${d ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}><Flame className="w-5 h-5" /></div>
                      <div><h3 className="font-black text-sm">İnceleme Bekleyen Talepler</h3><p className={`text-[11px] ${d ? 'text-teal-200' : 'text-slate-500'}`}>Yöneticinin onaylaması gereken öncelikli kayıtlar.</p></div>
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-[#17A2B8] hover:underline flex items-center gap-1 cursor-pointer">Tümünü Gör <ArrowRight className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="space-y-3">
                    {requests.filter((r) => r.status === 'pending_review').slice(0, 4).map((req) => (
                      <div key={req.id} className={`flex items-center justify-between p-4 rounded-2xl border ${d ? 'bg-[#092927] border-[#145350]' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {req.urgency === 'Acil' && <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase">Acil</span>}
                            <span className={`text-xs font-bold ${d ? 'text-teal-200' : 'text-slate-500'}`}>{req.category}</span>
                          </div>
                          <h4 className="text-xs font-extrabold">{req.title}</h4>
                          <span className="text-[11px] opacity-80">Hak Sahibi: <strong>{req.applicantName}</strong> ({req.district}/{req.city})</span>
                        </div>
                        <button onClick={() => setActiveTab('requests')} className="px-4 py-2 bg-[#17A2B8] text-white rounded-xl text-xs font-bold hover:bg-[#117A8B] shrink-0 cursor-pointer">İncele</button>
                      </div>
                    ))}
                    {pendingRequestCount === 0 && <p className="text-xs opacity-60 text-center py-6">Bekleyen talep yok.</p>}
                  </div>
                </div>

                <div className={`rounded-3xl border shadow-xl p-6 sm:p-8 space-y-4 ${d ? 'bg-[#0C3533] border-[#17A2B8]/40' : 'bg-gradient-to-br from-[#17A2B8]/10 via-white to-[#117A8B]/10 border-[#17A2B8]/30'}`}>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#17A2B8]/20">
                    <div className="p-2 bg-[#17A2B8] text-white rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
                    <span className="font-black text-sm">Operasyonel Kısayollar</span>
                  </div>
                  {([['requests', 'Hak Sahibi Taleplerine Git', <FileText key="a" className="w-4 h-4 text-[#17A2B8]" />], ['donations', 'Bağışçı Onay Masası', <Gift key="b" className="w-4 h-4 text-[#17A2B8]" />], ['needys', 'İhtiyaç Sahipleri Listesi', <Users key="c" className="w-4 h-4 text-[#17A2B8]" />]] as [Tab, string, React.ReactNode][]).map(([t, l, i]) => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between group cursor-pointer ${d ? 'bg-[#092927] hover:bg-[#145350] border-[#145350] text-teal-100' : 'bg-white hover:bg-[#17A2B8]/5 border-[#17A2B8]/25 text-slate-800'}`}>
                      <div className="flex items-center gap-3">{i}<span className="text-xs font-bold">{l}</span></div>
                      <ArrowRight className="w-4 h-4 text-[#17A2B8] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TALEPLER */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className={`${panel} p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className={tabsBox}>
                  {(['Tümü', 'Acil', 'Fatura Ödemesi', 'Onaylanan', 'Onaylanmayan'] as const).map((t) => (
                    <button key={t} onClick={() => setRequestFilterTab(t)} className={tabBtn(requestFilterTab === t)}>{t}</button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                  <input type="text" placeholder="Talep, kişi veya şehir ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredRequests.length === 0 ? (
                  <div className={`${panel} p-12 text-center space-y-3 col-span-full`}>
                    <div className="w-12 h-12 bg-[#17A2B8]/10 text-[#17A2B8] rounded-2xl flex items-center justify-center mx-auto"><Search className="w-6 h-6" /></div>
                    <h4 className="text-sm font-black">Gösterilecek talep bulunamadı</h4>
                  </div>
                ) : filteredRequests.map((req) => (
                  <div key={req.id} className={`${panel} p-7 hover:shadow-xl transition-all flex flex-col justify-between space-y-5`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border ${req.status === 'pending_review' ? 'bg-amber-50 text-amber-700 border-amber-200' : req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {req.status === 'pending_review' ? 'İnceleme Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                        {req.urgency && (
                          <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-white ${req.urgency === 'Acil' ? 'bg-rose-500 border-rose-600' : 'bg-amber-500 border-amber-600'}`}>
                            <Flame className="w-3.5 h-3.5" /><span>{req.urgency} Aciliyet</span>
                          </span>
                        )}
                        <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-[#17A2B8]/10 text-[#17A2B8]">{req.category}</span>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-black leading-snug">{req.title}</h3>
                        <p className={`text-xs ${d ? 'text-teal-200' : 'text-slate-600'}`}>
                          <strong>Hak Sahibi:</strong> {req.applicantName} ({req.phone}) • <MapPin className="w-3.5 h-3.5 inline text-[#17A2B8]" /> {req.district} / {req.city}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#17A2B8]/10 text-xs">
                        <div className={miniBox}><span className={miniLabel}>Hane Kişi Sayısı</span><strong className={miniVal}>{req.householdCount === '-' ? '-' : `${req.householdCount} Kişi`}</strong></div>
                        <div className={miniBox}><span className={miniLabel}>Aylık Hane Geliri</span><strong className={miniVal}>{req.monthlyIncome}</strong></div>
                        <div className={miniBox}><span className={miniLabel}>Destek Tutarı</span><strong className="font-extrabold text-emerald-600">{req.amount > 0 ? `${req.amount} TL` : req.institution}</strong></div>
                        <div className={miniBox}><span className={miniLabel}>Talep Tarihi</span><strong className={miniVal}>{req.date}</strong></div>
                      </div>
                      {req.type === 'fatura' && (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                          <div className="font-extrabold text-emerald-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Yalnızca Vakıf Görünümü (Fatura Detayı)</div>
                          <div><strong className="opacity-75">Kurum / Abone:</strong> {req.institution}</div>
                          <div><strong className="opacity-75">Son Ödeme Tarihi:</strong> {req.dueDate}</div>
                          <div><strong className="opacity-75">Teslimat / Adres:</strong> {rawRequests.find((x) => x.id === req.id)?.applicantAddress || '-'}</div>
                          {req.invoicePhoto && <img src={req.invoicePhoto} alt="Fatura" className="w-full h-28 object-cover rounded-xl border border-emerald-500/30" />}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-[#17A2B8]/10 mt-auto">
                      {req.status === 'pending_review' ? (
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => handleRejectRequest(req.id)} className={`flex-1 ${rejectBtn}`}><XCircle className="w-4 h-4" /><span>Reddet</span></button>
                          <button onClick={() => handleApproveRequest(req.id)} className={`flex-1 ${okBtn}`}><CheckCircle2 className="w-4 h-4" /><span>Onayla</span></button>
                        </div>
                      ) : req.status === 'approved' ? (
                        <span className={doneBox}><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Onaylandı (Bağışçılara Açıldı)</span>
                      ) : (
                        <span className={`${doneBox} !text-rose-700 !bg-rose-50 !border-rose-200`}><XCircle className="w-4 h-4 text-rose-600" /> Talep Reddedildi</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BAĞIŞÇI ONAY & ÖDEMELER */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              <div className={`${panel} p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className={tabsBox}>
                  {(['Tümü', 'Bekleyen İncelemeler', 'Ödeme Bekleyenler', 'Onaylananlar / Ödenenler'] as const).map((t) => (
                    <button key={t} onClick={() => setDonationFilterTab(t)} className={tabBtn(donationFilterTab === t)}>
                      {t}
                      {t === 'Bekleyen İncelemeler' && <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">{pendingCardCount}</span>}
                      {t === 'Ödeme Bekleyenler' && <span className="ml-2 bg-amber-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">{waitingCardCount}</span>}
                    </button>
                  ))}
                </div>
                <div className={`text-xs font-bold px-3 py-2 rounded-2xl border border-[#17A2B8]/15 ${d ? 'bg-[#092927] text-teal-200' : 'bg-[#17A2B8]/5 text-slate-600'}`}>
                  Aktif Bağış Kalemi: <span className="text-[#17A2B8] font-black">{filteredCards.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredCards.length === 0 ? (
                  <div className={`${panel} p-12 text-center space-y-3 col-span-full`}>
                    <div className="w-12 h-12 bg-[#17A2B8]/10 text-[#17A2B8] rounded-2xl flex items-center justify-center mx-auto"><Search className="w-6 h-6" /></div>
                    <h4 className="text-sm font-black">Bu sekmede gösterilecek öğe bulunmuyor.</h4>
                  </div>
                ) : filteredCards.map((c) => {
                  const isListing = c.kind === 'listing';
                  const header = c.stage === 'waiting' || c.stage === 'pending' && !isListing
                    ? 'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 text-amber-100'
                    : 'bg-gradient-to-br from-[#0C3533] to-[#117A8B] text-teal-100';
                  return (
                    <div key={c.key} className={`rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between border shadow-md ${d ? 'bg-[#0C3533] border-[#17A2B8]/30 text-white' : 'bg-white border-[#17A2B8]/30 text-slate-900'}`}>
                      <div>
                        {c.imageUrl ? (
                          <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                            <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-extrabold px-3 py-1 rounded-xl uppercase tracking-wider">{c.category}</span>
                            <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-xl">Bağışçı Fotoğrafı</span>
                          </div>
                        ) : (
                          <div className={`p-6 ${header}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-xl bg-white/20 tracking-wider">{c.category}</span>
                              {isListing ? <Package className="w-6 h-6 opacity-90" /> : <Receipt className="w-6 h-6 opacity-90" />}
                            </div>
                            <div className="mt-6"><span className="text-2xl font-black text-white">{c.amount > 0 ? `${c.amount} TL` : 'Bağış Desteği'}</span></div>
                          </div>
                        )}
                        <div className="p-7 space-y-4">
                          <div className={`flex items-center justify-between text-xs font-semibold ${d ? 'text-teal-300' : 'text-slate-500'}`}>
                            <span>{c.date}</span><span className="text-[#17A2B8] font-bold">{c.district} / {c.city}</span>
                          </div>
                          <h3 className="text-base font-black leading-snug">{c.title}</h3>
                          <p className={`text-xs leading-relaxed font-medium ${d ? 'text-teal-100' : 'text-slate-600'}`}>{c.description}</p>
                          <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${d ? 'border-teal-900/50' : 'border-slate-100'}`}>
                            <div className={miniBox}><span className={miniLabel}>{isListing ? 'Eşyayı Ekleyen Bağışçı' : 'Ödemeyi Yapacak Hayırsever'}</span><strong className={`${miniVal} text-xs truncate block mt-0.5`}>{c.donorName}</strong></div>
                            <div className={miniBox}><span className={miniLabel}>{isListing ? 'İletişim / Tel' : 'Fatura Tutarı'}</span><strong className="text-xs text-[#17A2B8] font-extrabold block mt-0.5">{isListing ? c.donorPhone : `${c.amount} TL`}</strong></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-7 pt-0 mt-auto">
                        {c.stage === 'pending' ? (
                          <div className="space-y-2.5">
                            <button onClick={() => (isListing ? approveListing(c.id) : approveInvoicePayment(c.id))} className={`${okBtn} w-full py-3.5`}>
                              <Check className="w-4 h-4" /><span>{isListing ? 'Bağış Eşyasını Onayla ve Vitrine Çıkar' : 'Ödeme İsteğini Onayla'}</span>
                            </button>
                            <button onClick={() => (isListing ? rejectListing(c.id) : rejectInvoicePayment(c.id))} className={`${rejectBtn} w-full`}>
                              <X className="w-4 h-4" /><span>{isListing ? 'Bu Bağışı Reddet' : 'İsteği Reddet'}</span>
                            </button>
                          </div>
                        ) : c.stage === 'waiting' ? (
                          <div className="space-y-3">
                            <div className={`text-[11px] font-extrabold border py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 ${d ? 'text-amber-300 bg-amber-950/60 border-amber-800' : 'text-amber-900 bg-amber-100 border-amber-300'}`}>
                              <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> Ödeme Bekliyor (Bağışçı İşlemi)
                            </div>
                            <button onClick={() => markPaid(c)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                              Ödeme Alındı Olarak İşaretle
                            </button>
                          </div>
                        ) : (
                          <div className={`text-[11px] font-extrabold border py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 ${d ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {isListing ? 'Onaylandı & Vitrinde Yayınlandı' : 'Ödeme Tamamlandı'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* İHTİYAÇ SAHİPLERİ */}
          {activeTab === 'needys' && (
            <div className={`${panel} shadow-xl overflow-hidden`}>
              <div className={`p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#17A2B8]/15 ${d ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold">Kayıtlı İhtiyaç Sahipleri Listesi</h3>
                    <span className="text-xs font-black bg-[#17A2B8] text-white px-3 py-1 rounded-xl">{filteredNeedys.length} Kişi</span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${d ? 'text-teal-200' : 'text-slate-600'}`}>Vakıf onaylı hak sahipleri ve onay bekleyen başvurular.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className={`flex items-center gap-1 p-1 rounded-2xl border border-[#17A2B8]/30 ${d ? 'bg-[#092927]' : 'bg-white'}`}>
                    {(['Tümü', 'Onaylı Hak Sahibi', 'Onay Bekliyor'] as const).map((s) => (
                      <button key={s} onClick={() => setNeedyStatusFilter(s)} className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold cursor-pointer ${needyStatusFilter === s ? 'bg-[#17A2B8] text-white shadow-md' : d ? 'text-teal-200 hover:bg-[#17A2B8]/10' : 'text-slate-600 hover:bg-[#17A2B8]/10'}`}>{s}</button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                    <input type="text" placeholder="İsim veya T.C. ile ara..." value={needySearch} onChange={(e) => setNeedySearch(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-black border-b border-[#17A2B8]/20 tracking-wider ${d ? 'bg-[#092927] text-teal-100' : 'bg-[#17A2B8]/10 text-slate-800'}`}>
                      <th className={th}>Tam Adı Soyadı</th><th className={th}>T.C. Kimlik No</th><th className={th}>İnceleme Raporu</th>
                      <th className={th}>İletişim</th><th className={th}>Adres / Lokasyon</th><th className={th}>Kayıt Tarihi</th><th className={th}>Vakıf İşlemi / Durum</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium align-middle ${d ? 'divide-teal-900/40 text-teal-100' : 'divide-[#17A2B8]/10 text-slate-700'}`}>
                    {filteredNeedys.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center font-bold opacity-60">Aranan kriterlere uygun ihtiyaç sahibi bulunamadı.</td></tr>
                    ) : filteredNeedys.map((n) => {
                      const pending = n.status === 'Onay Bekliyor';
                      return (
                        <tr key={n.id} className={pending ? (d ? 'bg-amber-950/30' : 'bg-amber-50/80') : ''}>
                          <td className={`${th} font-extrabold whitespace-nowrap`}>{n.fullName}</td>
                          <td className={`${th} font-mono font-bold whitespace-nowrap`}>{n.identityNo}</td>
                          <td className={`${th} whitespace-nowrap`}>
                            <button onClick={() => openReport(n.reportUrl, n.reportName)} className={`inline-flex items-center gap-2 px-3.5 py-2 border border-[#17A2B8]/30 hover:bg-[#17A2B8]/10 rounded-xl font-bold text-[11px] cursor-pointer ${d ? 'bg-[#092927] text-teal-300' : 'bg-white text-[#17A2B8]'}`}>
                              <FileText className="w-4 h-4 text-rose-500" /><span className="underline truncate max-w-[140px] font-extrabold">{n.reportName}</span><Eye className="w-3.5 h-3.5 opacity-70" />
                            </button>
                          </td>
                          <td className={`${th} whitespace-nowrap`}>
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 font-bold"><Phone className="w-3.5 h-3.5 text-[#17A2B8]" /> {n.phone}</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] opacity-70"><Mail className="w-3.5 h-3.5 text-[#17A2B8]" /> {n.email}</span>
                            </div>
                          </td>
                          <td className={`${th} max-w-xs truncate`} title={n.address}><span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#17A2B8] shrink-0" /> {n.address}</span></td>
                          <td className={`${th} whitespace-nowrap opacity-70`}>{n.registerDate}</td>
                          <td className={`${th} whitespace-nowrap`}>
                            {!pending ? (
                              <span className="inline-block px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200">Onaylı Hak Sahibi</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button onClick={() => approveNeedy(n.id)} className="px-3.5 py-2 bg-[#17A2B8] hover:bg-[#117A8B] text-white rounded-xl text-[11px] font-extrabold cursor-pointer shadow-md flex items-center gap-1"><Check className="w-4 h-4" /> Onayla</button>
                                <button onClick={() => rejectNeedy(n.id)} className="px-3.5 py-2 border rounded-xl text-[11px] font-extrabold cursor-pointer flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"><X className="w-4 h-4" /> Reddet</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BAĞIŞÇILAR */}
          {activeTab === 'donors' && (
            <div className={`${panel} shadow-xl overflow-hidden`}>
              <div className={`p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#17A2B8]/15 ${d ? 'bg-[#092927]' : 'bg-[#17A2B8]/5'}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold">Kayıtlı Bağışçılar Havuzu Listesi</h3>
                    <span className="text-xs font-black bg-[#17A2B8] text-white px-3 py-1 rounded-xl">{filteredDonors.length} Bağışçı</span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${d ? 'text-teal-200' : 'text-slate-600'}`}>Sisteme kayıtlı hayırsever bağışçılarımız.</p>
                </div>
                <div className="relative sm:w-72">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#17A2B8]" />
                  <input type="text" placeholder="İsim veya T.C. ile ara..." value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-black border-b border-[#17A2B8]/20 tracking-wider ${d ? 'bg-[#092927] text-teal-100' : 'bg-[#17A2B8]/10 text-slate-800'}`}>
                      <th className={th}>Tam Adı Soyadı</th><th className={th}>T.C. Kimlik No</th><th className={th}>Telefon</th><th className={th}>E-Posta</th><th className={th}>Adres / Lokasyon</th><th className={th}>Kayıt Tarihi</th><th className={th}>Durumu</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium align-middle ${d ? 'divide-teal-900/40 text-teal-100' : 'divide-[#17A2B8]/10 text-slate-700'}`}>
                    {filteredDonors.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center font-bold opacity-60">Bağışçı bulunamadı.</td></tr>
                    ) : filteredDonors.map((x) => (
                      <tr key={x.id}>
                        <td className={`${th} font-extrabold whitespace-nowrap`}>{x.fullName}</td>
                        <td className={`${th} font-mono font-bold whitespace-nowrap`}>{x.identityNo}</td>
                        <td className={`${th} font-bold whitespace-nowrap`}><span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#17A2B8]" /> {x.phone}</span></td>
                        <td className={`${th} whitespace-nowrap`}><span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-[#17A2B8]" /> {x.email}</span></td>
                        <td className={`${th} max-w-xs truncate`} title={x.address}><span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#17A2B8] shrink-0" /> {x.address}</span></td>
                        <td className={`${th} whitespace-nowrap opacity-70`}>{x.date}</td>
                        <td className={`${th} whitespace-nowrap`}><span className="inline-block px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200">{x.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

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