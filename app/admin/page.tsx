'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, collection, query, where, onSnapshot,
  writeBatch, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Tab = 'pending' | 'approved' | 'paid' | 'items' | 'all';

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [needsMap, setNeedsMap] = useState<Record<string, any>>({});
  const [itemListings, setItemListings] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('pending');
  const [selected, setSelected] = useState<any>(null);
  const [publicDesc, setPublicDesc] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'medium' | 'high'>('normal');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/admin-giris'; return; }
      try {
        const token = await user.getIdTokenResult(true);
        if (!token.claims.admin) {
          window.location.href = '/admin-giris';
          return;
        }
        setReady(true);
      } catch (e) {
        console.error(e);
        window.location.href = '/admin-giris';
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const unsub1 = onSnapshot(collection(db, 'requests'), (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
      list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRequests(list);
    }, (e) => console.error('requests:', e));

          const unsub2 = onSnapshot(collection(db, 'publicNeeds'), (snap) => {
      const m: Record<string, any> = {};
      snap.docs.forEach((d) => { m[d.id] = { ...(d.data() as any), id: d.id }; });
      setNeedsMap(m);
    }, (e) => console.error('publicNeeds:', e));
    const unsub3 = onSnapshot(collection(db, 'itemListings'), (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
      list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setItemListings(list);
    }, (e) => console.error('itemListings:', e));

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [ready]);

  const isPendingListing = (s: string) => (s || '').includes('Bekliyor');
  const isApprovedListing = (s: string) => (s || '').includes('Onaylandı');

  const openReview = (r: any) => {
    setSelected(r);
    setUrgency('normal');
    setPublicDesc(
      r.type === 'fatura'
        ? `${r.institution} faturası için destek bekleniyor.`
        : `${r.title} için destek bekleniyor.`
    );
  };

  const approve = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const r = selected;
      const batch = writeBatch(db);
      batch.update(doc(db, 'requests', r.id), {
        status: 'approved_waiting_donor',
        statusText: 'Vakıf Onaylandı / Bağışçı Bekleniyor',
        approvedAt: serverTimestamp()
      });
      // Bağışçıya giden kayıt: adres, telefon, isim, fatura fotoğrafı YOK
      batch.set(doc(db, 'publicNeeds', r.id), {
        requestId: r.id,
        type: r.type === 'fatura' ? 'fatura' : 'esya_talebi',
        title: r.title,
        category: r.type === 'fatura' ? 'Fatura' : 'Eşya Talebi',
        location: `${r.district || ''}, ${r.city || ''}`,
        amount: r.type === 'fatura' ? Number(r.amount) || 0 : 0,
        urgencyLevel: urgency,
        verified: true,
        inspector: 'Vakıf Onaylı İnceleme',
        description: publicDesc,
        paymentStatus: 'approved',
        createdAt: serverTimestamp()
      });
      await batch.commit();
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert('Onaylanamadı. Konsoldaki hatayı kontrol edin.');
    }
    setBusy(false);
  };

  const reject = async () => {
    if (!selected || busy) return;
    if (!confirm('Bu talep reddedilsin mi?')) return;
    setBusy(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'requests', selected.id), {
        status: 'rejected',
        statusText: 'Talep Reddedildi'
      });
      await batch.commit();
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert('İşlem başarısız.');
    }
    setBusy(false);
  };

  const completeRequest = async (needId: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'requests', needId), {
        status: 'completed',
        statusText: 'Tamamlandı / Destek Ulaştı'
      });
      batch.update(doc(db, 'publicNeeds', needId), { paymentStatus: 'closed' });
      await batch.commit();
    } catch (e) {
      console.error(e);
      alert('İşlem başarısız.');
    }
  };

  // Eşya bağışı onay / ret
  const approveListing = async (id: string) => {
    try {
      await updateDoc(doc(db, 'itemListings', id), {
        status: 'Vakıf Tarafından Onaylandı',
        reviewedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      alert('Onaylanamadı. Konsoldaki hatayı kontrol edin.');
    }
  };

  const rejectListing = async (id: string) => {
    if (!confirm('Bu eşya bağışı reddedilsin mi?')) return;
    try {
      await updateDoc(doc(db, 'itemListings', id), {
        status: 'Vakıf Tarafından Reddedildi',
        reviewedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      alert('İşlem başarısız.');
    }
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">Yükleniyor...</div>;
  }
    const paidNeeds = Object.values(needsMap).filter((n: any) => ['paid', 'fulfilled'].includes(n.paymentStatus));

  const liveLabel = (r: any) => {
    const s = needsMap[r.id]?.paymentStatus;
    if (s === 'fulfilled') return 'Bağışçı Bulundu';
    if (s === 'paid') return 'Ödeme Yapıldı';
    if (s === 'requested') return 'Bağışçı Onay İstedi';
    return r.status;
  };

  const shown = requests.filter((r) => {
    if (tab === 'pending') return r.status === 'pending_review';
    if (tab === 'approved') return r.status === 'approved_waiting_donor';
    return true;
  });

  const pendingListingCount = itemListings.filter((i) => isPendingListing(i.status)).length;

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 rounded-xl text-xs font-bold border ${tab === t ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-lg">Vakıf Onay Paneli</h1>
          <p className="text-xs text-slate-500">Talepleri incele, onayla veya reddet</p>
        </div>
        <button
          onClick={async () => { await signOut(auth); window.location.href = '/admin-giris'; }}
          className="text-xs font-bold text-rose-600"
        >
          Çıkış Yap
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {tabBtn('pending', `Bekleyen (${requests.filter((r) => r.status === 'pending_review').length})`)}
          {tabBtn('approved', 'Onaylı')}
          {tabBtn('items', `Eşya Bağışları (${pendingListingCount})`)}
          {tabBtn('paid', `Ödenenler (${paidNeeds.length})`)}
          {tabBtn('all', 'Tümü')}
        </div>

        {tab === 'items' ? (
          <div className="grid md:grid-cols-2 gap-4">
            {itemListings.length === 0 && <p className="text-sm text-slate-500">Eşya bağışı yok.</p>}
            {itemListings.map((i) => (
              <div key={i.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">{i.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isApprovedListing(i.status)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isPendingListing(i.status)
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>{i.status}</span>
                </div>

                {i.image ? (
                  <img src={i.image} alt={i.title} className="w-full h-48 object-cover rounded-xl border" />
                ) : (
                  <div className="w-full h-24 rounded-xl border bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                    Fotoğraf yok
                  </div>
                )}

                <div>
                  <h3 className="font-bold">{i.title}</h3>
                  <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                    <div>Kondisyon: {i.condition}</div>
                    <div>Konum: {i.city} / {i.district}</div>
                    <div className="text-[10px] text-slate-400">Bağışçı ID: {String(i.userId || '').slice(0, 8)}</div>
                  </div>
                </div>

                {isPendingListing(i.status) && (
                  <div className="flex gap-3">
                    <button onClick={() => rejectListing(i.id)} className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold py-2.5 rounded-xl">
                      Reddet
                    </button>
                    <button onClick={() => approveListing(i.id)} className="flex-1 bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl">
                      Onayla
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : tab === 'paid' ? (
          <div className="space-y-3">
            {paidNeeds.length === 0 && <p className="text-sm text-slate-500">Ödenmiş talep yok.</p>}
            {paidNeeds.map((n) => (
              <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{n.title}</div>
                  <div className="text-xs text-slate-500">{n.amount ? `${n.amount} TL` : 'Eşya'} • {n.location}</div>
                </div>
                <button onClick={() => completeRequest(n.id)} className="bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Tamamlandı Olarak İşaretle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {shown.length === 0 && <p className="text-sm text-slate-500">Bu sekmede talep yok.</p>}
            {shown.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500">{r.category}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">{liveLabel(r)}</span>
                </div>
                <h3 className="font-bold">{r.title}</h3>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>Kişi: {r.applicantName} • {r.applicantPhone}</div>
                  <div>Konum: {r.district} / {r.city}</div>
                  {r.type === 'fatura' && (
                    <>
                      <div>Kurum: {r.institution} • Tutar: <b>{r.amount} TL</b></div>
                      <div>Son ödeme: {r.dueDate}</div>
                    </>
                  )}
                </div>
                {r.status === 'pending_review' && (
                  <button onClick={() => openReview(r)} className="mt-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl">
                    İncele
                  </button>
                )}
                                {r.status === 'approved_waiting_donor' && ['fulfilled', 'paid'].includes(needsMap[r.id]?.paymentStatus) && (
                  <button onClick={() => completeRequest(r.id)} className="mt-2 bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                    Tamamlandı Olarak İşaretle
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-black text-lg">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div><b>Ad Soyad:</b> {selected.applicantName}</div>
              <div><b>Telefon:</b> {selected.applicantPhone}</div>
              <div><b>Adres:</b> {selected.applicantAddress}</div>
              {selected.type === 'fatura' && (
                <>
                  <div><b>Kurum:</b> {selected.institution}</div>
                  <div><b>Tutar:</b> {selected.amount} TL</div>
                  <div><b>Son ödeme:</b> {selected.dueDate}</div>
                </>
              )}
            </div>

            {selected.invoicePhoto ? (
              <a href={selected.invoicePhoto} target="_blank" rel="noreferrer">
                <img src={selected.invoicePhoto} alt="Fatura" className="w-full max-h-72 object-contain rounded-xl border" />
                <span className="text-[11px] text-emerald-700 font-bold">Tam boyutta aç</span>
              </a>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Fatura fotoğrafı yüklenmemiş.
              </p>
            )}

            <div>
              <label className="block text-xs font-bold mb-1">Bağışçıya görünecek açıklama (isim/adres yazma)</label>
              <textarea
                rows={3}
                value={publicDesc}
                onChange={(e) => setPublicDesc(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Aciliyet</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs"
              >
                <option value="normal">Normal</option>
                <option value="medium">Acil</option>
                <option value="high">Çok Acil / Kritik</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={reject} disabled={busy} className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold py-3 rounded-xl">
                Reddet
              </button>
              <button onClick={approve} disabled={busy} className="flex-1 bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl disabled:opacity-60">
                {busy ? 'İşleniyor...' : 'Onayla ve Yayınla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}