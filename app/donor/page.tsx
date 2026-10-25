'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Heart, ShieldCheck, FileText, Package, ArrowUpRight, 
  MapPin, CheckCircle2, PlusCircle, User, Truck, 
  UploadCloud, AlertCircle, ExternalLink, MoreVertical, 
  Menu, X, Settings, LogOut, HelpCircle, History, Check, 
  ShieldAlert, Lock, Search, FileCheck, Award, Mail, Phone, Bell, Sliders, Moon, Sun,
  Download, Sparkles, CreditCard, Clock, CheckCircle2 as CheckCircleIcon, MessageSquare, Calendar, Globe, Image as ImageIcon,
  FolderOpen, Edit3, Trash2, Briefcase, Home, Camera, ChevronDown
} from 'lucide-react';

const TURKEY_CITIES: { [key: string]: string[] } = {
  'Adana': ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
  'Adıyaman': ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kâhta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
  'Afyonkarahisar': ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  'Ağrı': ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
  'Aksaray': ['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi', 'Sultanhanı'],
  'Amasya': ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
  'Ankara': ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kahramankazan', 'Kalecik', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
  'Antalya': ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
  'Ardahan': ['Çıldır', 'Damal', 'Hanak', 'Merkez', 'Posof', 'Göle'],
  'Artvin': ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Merkez', 'Murgul', 'Şavsat', 'Yusufeli', 'Kemalpaşa'],
  'Aydın': ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
  'Balıkesir': ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  'Bartın': ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'],
  'Batman': ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
  'Bayburt': ['Aydıntepe', 'Demirözü', 'Merkez'],
  'Bilecik': ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  'Bingöl': ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yedisu'],
  'Bitlis': ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
  'Bolu': ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
  'Burdur': ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
  'Bursa': ['Büyükorhan', 'Gemlik', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
  'Çanakkale': ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
  'Çankırı': ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
  'Çorum': ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  'Denizli': ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  'Diyarbakır': ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
  'Düzce': ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca', 'Gölyaka'],
  'Edirne': ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lüleburgaz', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
  'Elazığ': ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
  'Erzincan': ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  'Erzurum': ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karaköprü', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
  'Eskişehir': ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
  'Gaziantep': ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
  'Giresun': ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  'Gümüşhane': ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
  'Hakkâri': ['Çukurca', 'Merkez', 'Şemdinli', 'Yüksekova', 'Derecik'],
  'Hatay': ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  'Iğdır': ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
  'Isparta': ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kâğıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  'İzmir': ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  'Kahramanmaraş': ['Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'],
  'Karabük': ['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'],
  'Karaman': ['Ayrancı', 'Başyayla', 'Ermenek', 'Kâzımkarabekir', 'Merkez', 'Sarıveliler'],
  'Kars': ['Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'],
  'Kastamonu': ['Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
  'Kayseri': ['Akkışla', 'Bünyan', 'Develi', 'Fecirli', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  'Kilis': ['Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'],
  'Kırıkkale': ['Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'],
  'Kırklareli': ['Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
  'Kırşehir': ['Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'],
  'Kocaeli': ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
  'Konya': ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  'Kütahya': ['Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Merkez', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
  'Malatya': ['Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
  'Manisa': ['Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
  'Mardin': ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Viranşehir'],
  'Mersin': ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
  'Muğla': ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
  'Muş': ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
  'Nevşehir': ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
  'Niğde': ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
  'Ordu': ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
  'Osmaniye': ['Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'],
  'Rize': ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
  'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  'Samsun': ['Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
  'Siirt': ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'],
  'Sinop': ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
  'Sivas': ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
  'Şanlıurfa': ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Siverek', 'Suruç', 'Viranşehir'],
  'Şırnak': ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
  'Tekirdağ': ['Çerkezköy', 'Çorlu', 'Ergene', 'Haşirli', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
  'Tokat': ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  'Trabzon': ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
  'Tunceli': ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  'Uşak': ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
  'Van': ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
  'Yalova': ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'],
  'Yozgat': ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
  'Zonguldak': ['Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez']
};

const INITIAL_DONATION_ITEMS = [
  {
    id: 1,
    type: 'fatura',
    title: 'Acil Elektrik Faturası Desteği',
    category: 'Fatura',
    location: 'Sancaktepe, İstanbul',
    amount: 940,
    urgencyLevel: 'high',
    verified: true,
    inspector: 'Vakıf Onaylı İnceleme (14 Ekim)',
    description: 'Kesilme noktasında olan elektrik faturası. 3 çocuklu hane.',
    date: '30 dk önce',
    paymentStatus: 'none'
  },
  {
    id: 2,
    type: 'fatura',
    title: 'Doğalgaz Faturası Desteği',
    category: 'Fatura',
    location: 'Sultanbeyli, İstanbul',
    amount: 1250,
    urgencyLevel: 'medium',
    verified: true,
    inspector: 'Vakıf Onaylı İnceleme (15 Ekim)',
    description: 'Kış ayı doğalgaz desteği. Ödeme isteği gönderildikten sonra ödenebilir.',
    date: '2 saat önce',
    paymentStatus: 'approved'
  },
  {
    id: 3,
    type: 'esya_talebi',
    title: 'Çalışma Masası ve Sandalye',
    category: 'Eşya Talebi',
    location: 'Ümraniye, İstanbul',
    urgencyLevel: 'normal',
    verified: true,
    inspector: 'Vakıf Onaylı İnceleme (16 Ekim)',
    description: 'Üniversite öğrencisi için ders çalışma masası ihtiyacı.',
    date: '4 saat önce'
  }
];

export default function DonorDashboardPage() {
  const [viewMode, setViewMode] = useState<'explore' | 'create_listing' | 'my_item_listings' | 'history' | 'verification' | 'profile' | 'settings'>('explore');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fatura' | 'esya_talebi' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('Tümü');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const [itemListingTab, setItemListingTab] = useState<'all' | 'approved' | 'pending'>('all');
  const [historyTab, setHistoryTab] = useState<'all' | 'fatura' | 'esya'>('all');
  const [verificationTab, setVerificationTab] = useState<'all' | 'approved' | 'pending'>('all');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [donationItems, setDonationItems] = useState(INITIAL_DONATION_ITEMS);

  const [activeItemToPay, setActiveItemToPay] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const [showRequestApprovalModal, setShowRequestApprovalModal] = useState(false);
  const [itemToRequestApproval, setItemToRequestApproval] = useState<any>(null);

  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [itemToFulfill, setItemToFulfill] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'foundation_pickup' | 'donor_delivers'>('foundation_pickup');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isEditConditionOpen, setIsEditConditionOpen] = useState(false);

  const [revealedPhoneId, setRevealedPhoneId] = useState<number | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [myDonationHistory, setMyDonationHistory] = useState([
    {
      id: 501,
      type: 'fatura',
      title: 'Elektrik Faturası Ödemesi',
      amount: 940,
      location: 'Sancaktepe, İstanbul',
      date: '16 Ekim 2026',
      receiptNo: 'MAK-2026-94012'
    },
    {
      id: 502,
      type: 'esya',
      title: 'Çalışma Masası ve Sandalye Desteği',
      amount: 1500,
      location: 'Ümraniye, İstanbul',
      date: '14 Ekim 2026',
      receiptNo: 'MAK-2026-88321'
    }
  ]);

  // ---- Giriş yapan kullanıcının bilgileri (Firestore'dan yüklenir) ----
  const [authReady, setAuthReady] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileProfession, setProfileProfession] = useState('');
  const [profileCity, setProfileCity] = useState('İstanbul');
  const [profileDistrict, setProfileDistrict] = useState('Kadıköy');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [isProfileCityOpen, setIsProfileCityOpen] = useState(false);
  const [isProfileDistrictOpen, setIsProfileDistrictOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const d: any = snap.exists() ? snap.data() : {};

        // Rol kontrolü: sadece bağışçılar bu sayfaya girebilir
        if (d.role !== 'donor') {
          window.location.href = '/login';
          return;
        }

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

  const initials =
    profileName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifDonationReceived, setNotifDonationReceived] = useState(true);
  const [notifListingApproved, setNotifListingApproved] = useState(true);
  const [notifEmergencyAlert, setNotifEmergencyAlert] = useState(true);

  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Mobilya');
  const [isItemCategoryOpen, setIsItemCategoryOpen] = useState(false);
  const [itemCondition, setItemCondition] = useState('Az Kullanılmış (Çok İyi)');
  const [isItemConditionOpen, setIsItemConditionOpen] = useState(false);
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [isCreateCityOpen, setIsCreateCityOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Kadıköy');
  const [isCreateDistrictOpen, setIsCreateDistrictOpen] = useState(false);

  const [mySubmittedListings, setMySubmittedListings] = useState([
    { 
      id: 101, 
      title: '2 Kişilik Koltuk Takımı', 
      category: 'Mobilya',
      city: 'İstanbul', 
      district: 'Ümraniye', 
      condition: 'Az Kullanılmış', 
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
      status: 'Onaylandı & Yayında' 
    },
    { 
      id: 102, 
      title: 'Bebek Beşiği ve Yatak', 
      category: 'Mobilya',
      city: 'Ankara', 
      district: 'Çankaya', 
      condition: 'Sıfır Gibi', 
      image: null,
      status: 'Vakıf İncelemesinde (Bekliyor)' 
    }
  ]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (TURKEY_CITIES[city] && TURKEY_CITIES[city].length > 0) {
      setSelectedDistrict(TURKEY_CITIES[city][0]);
    }
  };

  const handleProfileCityChange = (city: string) => {
    setProfileCity(city);
    if (TURKEY_CITIES[city] && TURKEY_CITIES[city].length > 0) {
      setProfileDistrict(TURKEY_CITIES[city][0]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingItem) {
          setEditingItem({ ...editingItem, image: reader.result as string });
        } else {
          setItemImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteListing = (id: number) => {
    setMySubmittedListings(prev => prev.filter(item => item.id !== id));
    setToastMessage('Eşya bağış ilanınız başarıyla silindi.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleSaveEditedListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMySubmittedListings(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
    setShowEditModal(false);
    setEditingItem(null);
    setToastMessage('Eşya ilanı ve detayları başarıyla güncellendi.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenRequestApprovalModal = (item: any) => {
    setItemToRequestApproval(item);
    setShowRequestApprovalModal(true);
  };

  const handleConfirmRequestApproval = () => {
    if (!itemToRequestApproval) return;
    const item = itemToRequestApproval;

    setDonationItems(prev => prev.map(d => d.id === item.id ? { ...d, paymentStatus: 'requested' } : d));
    setShowRequestApprovalModal(false);
    setItemToRequestApproval(null);

    setToastMessage(`"${item.title}" için vakıftan onay isteği başarıyla gönderildi.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenFulfillModal = (item: any) => {
    setItemToFulfill(item);
    setShowFulfillModal(true);
  };

  const handleCompleteFulfill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToFulfill) return;

    const itemName = itemToFulfill.title;
    setDonationItems(prev => prev.filter(d => d.id !== itemToFulfill.id));

    setShowFulfillModal(false);
    setItemToFulfill(null);

    setToastMessage(`Tebrikler! "${itemName}" eşya desteğiniz kaydedildi. Lojistik ekibimiz sizinle iletişime geçecektir.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleInitiatePayment = (item: any) => {
    setActiveItemToPay(item);
    setShowConfirmModal(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmModal(false);
    setShowCardModal(true);
  };

  const handleCompleteCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExp || !cardCvc) {
      setToastMessage('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const itemName = activeItemToPay.title;
    const itemAmount = activeItemToPay.amount;
    const receiptCode = `MAK-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    setDonationItems(prev => prev.filter(d => d.id !== activeItemToPay.id));

    const newRecord = {
      id: Date.now(),
      type: activeItemToPay.type === 'fatura' ? 'fatura' : 'esya',
      title: itemName,
      amount: itemAmount,
      location: activeItemToPay.location,
      date: 'Bugün',
      receiptNo: receiptCode
    };
    setMyDonationHistory([newRecord, ...myDonationHistory]);

    setShowCardModal(false);
    setCardNumber('');
    setCardHolder('');
    setCardExp('');
    setCardCvc('');
    setActiveItemToPay(null);

    setToastMessage(`Ödeme tamamlandı! "${itemName}" için bağış ödemeniz başarıyla gerçekleşmiştir.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDownloadReceipt = (receiptNo: string, title: string, amount: number, location: string, date: string) => {
    setToastMessage(`Resmi bağış makbuzu (${receiptNo}) PDF olarak hazırlanıyor...`);

    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 400 >>
stream
BT
/F1 18 Tf
50 780 Td
(GONUL KOPRUSU VAKFI - RESMI BAGIS MAKBUZU) Tj
/F1 10 Tf
0 -30 Td
(Belge Takip Numarasi: ${receiptNo}) Tj
0 -20 Td
(Bagisci Adi Soyadi: ${profileName}) Tj
0 -20 Td
(Bagis Konusu / Baslik: ${title}) Tj
0 -20 Td
(Bagis Tutari: ${amount} TL) Tj
0 -20 Td
(Ihtiyac Lokasyonu: ${location}) Tj
0 -20 Td
(Islem Tarihi: ${date}) Tj
0 -40 Td
(Bu belge 5070 sayili Elektronik Imza Kanunu uyarinca resmi gecerlilige sahiptir.) Tj
0 -20 Td
(Tesekkur ederiz.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000230 00000 n 
0000000288 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
738
%%EOF`;

    const blob = new Blob([pdfData], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gonul-Koprusu-Makbuz-${receiptNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setToastMessage(`İndirme başarılı! "${receiptNo}" numaralı resmi PDF makbuzunuz kaydedildi.`);
      setTimeout(() => setToastMessage(null), 5000);
    }, 1500);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    const newListing = {
      id: Date.now(),
      title: itemTitle,
      category: itemCategory,
      city: selectedCity,
      district: selectedDistrict,
      condition: itemCondition,
      image: itemImage,
      status: 'Vakıf İncelemesinde (Bekliyor)'
    };

    setMySubmittedListings([newListing, ...mySubmittedListings]);
    setToastMessage(`"${itemTitle}" başlıklı eşya ilanınız fotoğraf ve kondisyon bilgisiyle kaydedildi!`);
    setTimeout(() => setToastMessage(null), 4000);
     
    setItemTitle('');
    setItemImage(null);
    setViewMode('my_item_listings');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setToastMessage('Lütfen şifre alanlarını eksiksiz doldurun.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setToastMessage('Şifreniz başarıyla güncellendi!');
    setTimeout(() => setToastMessage(null), 4000);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleNavigation = (mode: 'explore' | 'create_listing' | 'my_item_listings' | 'history' | 'verification' | 'profile' | 'settings') => {
    setViewMode(mode);
    setIsSidebarOpen(false);
  };

  const filteredItems = donationItems.filter(item => {
    if (activeFilter === 'fatura' && item.type !== 'fatura') return false;
    if (activeFilter === 'esya_talebi' && item.type !== 'esya_talebi') return false;
    if (activeFilter === 'approved' && item.paymentStatus !== 'approved') return false;
    if (selectedCityFilter !== 'Tümü' && !item.location.includes(selectedCityFilter)) return false;

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchLoc = item.location.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    return true;
  });

  // Kullanıcı bilgisi yüklenene kadar yükleniyor ekranı
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-bold">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
       
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#22b2a6] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#1b9187] flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300">
          <CheckCircleIcon className="w-5 h-5 text-amber-300 shrink-0"/>
          <span className="text-xs font-bold leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-extrabold">Eşya İlanını Düzenle</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Eşya Başlığı</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className={`w-full border rounded-xl py-3 px-3 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block font-bold mb-1 opacity-80">Kategori</label>
                  <div
                    onClick={() => setIsEditCategoryOpen(!isEditCategoryOpen)}
                    className={`w-full border rounded-xl py-3 px-3 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{editingItem.category}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isEditCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isEditCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsEditCategoryOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl z-30 p-1 space-y-0.5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {['Mobilya', 'Beyaz Eşya', 'Elektronik', 'Ev Tekstili / Halı'].map(cat => (
                          <div
                            key={cat}
                            onClick={() => {
                              setEditingItem({ ...editingItem, category: cat });
                              setIsEditCategoryOpen(false);
                            }}
                            className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${editingItem.category === cat ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{cat}</span>
                            {editingItem.category === cat && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <label className="block font-bold mb-1 opacity-80">Kondisyon</label>
                  <div
                    onClick={() => setIsEditConditionOpen(!isEditConditionOpen)}
                    className={`w-full border rounded-xl py-3 px-3 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{editingItem.condition}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isEditConditionOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isEditConditionOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsEditConditionOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl z-30 p-1 space-y-0.5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {['Sıfır Gibi', 'Az Kullanılmış', 'Orta Durumda', 'Yoğun Kullanılmış'].map(cond => (
                          <div
                            key={cond}
                            onClick={() => {
                              setEditingItem({ ...editingItem, condition: cond });
                              setIsEditConditionOpen(false);
                            }}
                            className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${editingItem.condition === cond ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{cond}</span>
                            {editingItem.condition === cond && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Fotoğrafı Güncelle</label>
                <div className={`border-2 border-dashed rounded-2xl p-3 text-center ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  {editingItem.image ? (
                    <div className="space-y-2">
                      <img src={editingItem.image} alt="Düzenlenen Önizleme" className="w-full h-28 object-cover rounded-xl" />
                      <label className="text-[#22b2a6] font-bold hover:underline cursor-pointer text-[11px] block">
                        <span>Fotoğrafı Değiştir</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                      <ImageIcon className="w-5 h-5 text-[#22b2a6] mb-1" />
                      <span className="font-bold">Fotoğraf Ekle</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-extrabold py-3.5 rounded-xl shadow-sm transition-all text-xs cursor-pointer mt-2"
              >
                Değişiklikleri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {showFulfillModal && itemToFulfill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-extrabold">Eşya Desteği Sahiplenme</h3>
              </div>
              <button onClick={() => setShowFulfillModal(false)} className="p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-[#22b2a6]/10 dark:bg-slate-950 p-3.5 rounded-2xl border border-[#22b2a6]/30 space-y-1">
              <span className="font-bold text-[#1b9187] dark:text-[#22b2a6] block text-sm">{itemToFulfill.title}</span>
              <p className="opacity-80">{itemToFulfill.description}</p>
            </div>

            <form onSubmit={handleCompleteFulfill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-2 opacity-85">Lojistik ve Teslimat Tercihi</label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${deliveryMethod === 'foundation_pickup' ? 'border-[#22b2a6] bg-[#22b2a6]/10 dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={deliveryMethod === 'foundation_pickup'} 
                      onChange={() => setDeliveryMethod('foundation_pickup')}
                      className="mt-0.5 text-[#22b2a6]" 
                    />
                    <div>
                      <span className="font-bold block">Vakıf Kuryesi Gelip Alsın</span>
                      <span className="text-[11px] opacity-60">Gönüllü ekibimiz adresinize gelerek eşyayı teslim alsın.</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${deliveryMethod === 'donor_delivers' ? 'border-[#22b2a6] bg-[#22b2a6]/10 dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={deliveryMethod === 'donor_delivers'} 
                      onChange={() => setDeliveryMethod('donor_delivers')}
                      className="mt-0.5 text-[#22b2a6]" 
                    />
                    <div>
                      <span className="font-bold block">Kendi Aracımla Teslim Edeceğim</span>
                      <span className="text-[11px] opacity-60">İhtiyaç sahibine veya vakıf merkezine kendim ulaştıracağım.</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-extrabold py-3.5 rounded-xl shadow-sm transition-all text-xs cursor-pointer mt-2"
              >
                Destek Talebini Onayla & Tamamla
              </button>
            </form>
          </div>
        </div>
      )}

      {showRequestApprovalModal && itemToRequestApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl flex items-center justify-center border border-[#22b2a6]/30 shadow-sm mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold">Vakıftan Onay İstiyor musunuz?</h3>
              <p className="text-xs opacity-70">
                <span className="font-bold text-[#1b9187]">{itemToRequestApproval.title}</span> için ödeme yapabilmek adına vakıf onay masasına inceleme talebi göndermek istiyor musunuz?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRequestApprovalModal(false)}
                className={`py-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestApproval}
                className="py-3 rounded-xl font-bold text-xs bg-[#22b2a6] hover:bg-[#1b9187] text-white shadow-sm transition-all cursor-pointer"
              >
                Evet, Onay İste
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && activeItemToPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl flex items-center justify-center border border-[#22b2a6]/30 shadow-sm mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold">Ödeme Onayı</h3>
              <p className="text-xs opacity-70">
                <span className="font-bold text-[#1b9187]">{activeItemToPay.title}</span> için <span className="font-extrabold">{activeItemToPay.amount} TL</span> tutarındaki ödemeyi gerçekleştirmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`py-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
              >
                Hayır, Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmYes}
                className="py-3 rounded-xl font-bold text-xs bg-[#22b2a6] hover:bg-[#1b9187] text-white shadow-sm transition-all cursor-pointer"
              >
                Evet, Eminim
              </button>
            </div>
          </div>
        </div>
      )}

      {showCardModal && activeItemToPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-extrabold">Güvenli Kart Ödeme Ekranı</h3>
              </div>
              <button onClick={() => setShowCardModal(false)} className="p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-[#22b2a6]/10 dark:bg-slate-950 p-3 rounded-xl border border-[#22b2a6]/30 flex items-center justify-between">
              <span>Ödenecek Tutar:</span>
              <span className="font-extrabold text-[#1b9187] dark:text-[#22b2a6] text-sm">{activeItemToPay.amount} TL</span>
            </div>

            <form onSubmit={handleCompleteCardPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Kart Üzerindeki Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className={`w-full border rounded-xl py-3 px-3 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Kart Numarası</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4543 •••• •••• 1234"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={`w-full border rounded-xl py-3 px-3 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-80">Son Kullanma (AA/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="10/28"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className={`w-full border rounded-xl py-3 px-3 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 opacity-80">CVC / CWD</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className={`w-full border rounded-xl py-3 px-3 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-extrabold py-3.5 rounded-xl shadow-sm transition-all text-xs cursor-pointer mt-2"
              >
                Ödemeyi Güvenle Tamamla & Makbuz Al
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sol Yan Panel */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside 
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-100' : 'bg-white border-r border-slate-200 text-slate-800'}`}
      >
        <div>
          <div className={`flex items-center justify-between mb-8 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#22b2a6] text-white rounded-xl shadow-sm">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-xs tracking-wider">GÖNÜL KÖPRÜSÜ</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-1.5 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => handleNavigation('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'profile' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <User className="w-4 h-4 text-[#22b2a6]" />
              <span>Profilim</span>
            </button>

            <button
              onClick={() => handleNavigation('explore')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'explore' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <FileText className="w-4 h-4 text-[#22b2a6]" />
              <span>İhtiyaç İlanları</span>
            </button>

            <button
              onClick={() => handleNavigation('my_item_listings')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'my_item_listings' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <Package className="w-4 h-4 text-[#22b2a6]" />
              <span>Eşya Bağışlarım</span>
            </button>

            <button
              onClick={() => handleNavigation('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'history' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <History className="w-4 h-4 text-[#22b2a6]" />
              <span>Bağış Geçmişim</span>
            </button>

            <button
              onClick={() => handleNavigation('verification')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'verification' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#22b2a6]" />
              <span>Vakıf Onay Süreci</span>
            </button>

            <button
              onClick={() => handleNavigation('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                viewMode === 'settings' ? 'bg-[#22b2a6]/10 text-[#1b9187] border border-[#22b2a6]/30 font-extrabold' : 'hover:opacity-80'
              }`}
            >
              <Settings className="w-4 h-4 text-[#22b2a6]" />
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        <div className={`pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={async () => {
              await signOut(auth);
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Üst Menü (Header) */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-2">
           
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-2xl cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('explore')}>
              <div className="p-2.5 bg-[#22b2a6] text-white rounded-2xl shadow-md">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block leading-tight">
                  GÖNÜL KÖPRÜSÜ
                </span>
                <span className="text-[10px] text-[#1b9187] dark:text-[#22b2a6] font-extrabold tracking-widest uppercase block">
                  Vakfı Bağışçı Portalı
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-6 py-2 rounded-2xl bg-[#22b2a6]/10 dark:bg-slate-950 border border-[#22b2a6]/30 dark:border-slate-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Aktif İhtiyaç: <strong className="text-[#1b9187] dark:text-[#22b2a6]">14 Aile</strong></span>
            </div>
            <div className="w-px h-4 bg-[#22b2a6]/30 dark:bg-slate-800"></div>
            <div>
              <span>Bugün Desteklenen: <strong className="text-[#1b9187] dark:text-[#22b2a6]">42.500 TL</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 p-1 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => handleNavigation('explore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'explore' 
                    ? (darkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                İhtiyaçları Gör & Öde
              </button>
              <button
                onClick={() => handleNavigation('create_listing')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'create_listing' 
                    ? 'bg-[#22b2a6] text-white shadow-sm' 
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Eşya Bağışla</span>
              </button>
            </div>

            <div 
              onClick={() => handleNavigation('profile')}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl border border-[#22b2a6]/30 dark:border-slate-800 bg-[#22b2a6]/10 dark:bg-slate-950 cursor-pointer hover:bg-[#22b2a6]/20 transition-all"
            >
              <div className="text-right hidden sm:block">
                <span className="font-extrabold text-xs block leading-tight">{profileName}</span>
                <span className="text-[10px] text-[#1b9187] dark:text-[#22b2a6] font-bold block">Bağışçı</span>
              </div>
              <div className="w-9 h-9 bg-[#22b2a6] text-white rounded-xl overflow-hidden flex items-center justify-center font-black text-xs shadow-sm">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* İstatistik Özeti */}
      <section className="bg-gradient-to-br from-[#1b9187] via-[#147a71] to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#22b2a6]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Hoş Geldiniz, {profileName}
              </h1>
              <p className="text-[#e0f7f5] text-xs mt-1">
                Bugüne kadar yaptığınız yardımlarla 4 ailenin ihtiyacına doğrudan dokundunuz.
              </p>
            </div>
             
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#80ede5]" />
              <div>
                <span className="text-[10px] text-[#e0f7f5] block font-semibold">Bağışçı Etki Skoru</span>
                <span className="text-sm font-extrabold text-white">98 / 100 (Yüksek Güven)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-sm hover:bg-white/[0.14] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e0f7f5] text-[11px] font-semibold">Ödenen Fatura</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 mb-0.5">1,840 TL</div>
              <span className="text-[10px] text-[#e0f7f5]/80 block">3 Fatura Tamamen Kapatıldı</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-sm hover:bg-white/[0.14] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e0f7f5] text-[11px] font-semibold">Eşya Bağışları</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 mb-0.5">{mySubmittedListings.length} Adet</div>
              <span className="text-[10px] text-[#e0f7f5]/80 block">Gönderdiğiniz Eşya İlanları</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-sm hover:bg-white/[0.14] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e0f7f5] text-[11px] font-semibold">Dokunulan Hayat</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-0.5">4 Aile</div>
              <span className="text-[10px] text-[#e0f7f5]/80 block">Türkiye Geneli Doğrudan</span>
            </div>

            <div 
              onClick={() => handleNavigation('verification')}
              className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-sm hover:bg-white/[0.14] transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e0f7f5] text-[11px] font-semibold">Şeffaflık Belgeleri</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 text-[#80ede5] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#80ede5] mb-0.5">4 Belge</div>
              <span className="text-[10px] text-[#e0f7f5] underline block group-hover:text-white transition-colors">
                İncelemek İçin Tıkla ➔
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dinamik İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         
        {viewMode === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#22b2a6] text-white rounded-2xl overflow-hidden flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#22b2a6] shrink-0">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 bg-[#22b2a6]/10 hover:bg-[#22b2a6]/20 text-[#1b9187] dark:text-[#22b2a6] border border-[#22b2a6]/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm">
                      <Camera className="w-4 h-4" />
                      <span>Profil Fotoğrafı Yükle</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileAvatar(reader.result as string);
                            setToastMessage('Profil fotoğrafınız başarıyla güncellendi.');
                            setTimeout(() => setToastMessage(null), 4000);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </label>
                    <span className="text-[10px] opacity-60 block mt-1">PNG, JPG veya WEBP (Max 5MB)</span>
                  </div>
                </div>
              </div>

              <div className={`px-4 py-3 rounded-2xl border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] opacity-60 block font-bold uppercase tracking-wider">Güven Skoru</span>
                <span className="text-lg font-black text-[#22b2a6]">98 / 100</span>
              </div>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <User className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-bold">Kişisel, Meslek ve Adres Bilgilerim</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">Ad Soyad</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">E-posta Adresi</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">Telefon Numarası</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">Meslek / Çalışma Alanı</label>
                    <input
                      type="text"
                      value={profileProfession}
                      onChange={(e) => setProfileProfession(e.target.value)}
                      placeholder="Örn: Yazılım Mühendisi, Öğretmen vb."
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block font-bold mb-1.5 opacity-80">Şehir (İl)</label>
                    <div
                      onClick={() => setIsProfileCityOpen(!isProfileCityOpen)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      <span className="truncate">{profileCity}</span>
                      <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isProfileCityOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isProfileCityOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsProfileCityOpen(false)}></div>
                        <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-xl z-30 p-1 space-y-0.5 custom-scrollbar ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                          {Object.keys(TURKEY_CITIES).map(city => (
                            <div
                              key={city}
                              onClick={() => {
                                handleProfileCityChange(city);
                                setIsProfileCityOpen(false);
                              }}
                              className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${profileCity === city ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                              <span>{city}</span>
                              {profileCity === city && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block font-bold mb-1.5 opacity-80">İlçe</label>
                    <div
                      onClick={() => setIsProfileDistrictOpen(!isProfileDistrictOpen)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      <span className="truncate">{profileDistrict}</span>
                      <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isProfileDistrictOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isProfileDistrictOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsProfileDistrictOpen(false)}></div>
                        <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-xl z-30 p-1 space-y-0.5 custom-scrollbar ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                          {TURKEY_CITIES[profileCity]?.map(district => (
                            <div
                              key={district}
                              onClick={() => {
                                setProfileDistrict(district);
                                setIsProfileDistrictOpen(false);
                              }}
                              className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold ${profileDistrict === district ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                              <span>{district}</span>
                              {profileDistrict === district && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 opacity-80">Açık Adres (Eşya Toplama / Lojistik İçin)</label>
                  <textarea
                    rows={2}
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    placeholder="Mahalle, Cadde, Sokak, No ve Daire bilgisi"
                    className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Profil ve adres bilgileriniz başarıyla güncellendi!');
                    setTimeout(() => setToastMessage(null), 4000);
                  }}
                  className="bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Bilgileri Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <Lock className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-bold">Şifre Değiştir</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">Mevcut Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5 opacity-80">Yeni Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full border rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Şifreyi Güncelle
                </button>
              </form>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`mb-6 pb-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <Settings className="w-5 h-5 text-[#22b2a6]" />
                <h3 className="text-base font-bold">Uygulama ve Bildirim Tercihleri</h3>
              </div>

              <div className="space-y-6 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#22b2a6]/10 text-[#22b2a6] rounded-xl border border-[#22b2a6]/30">
                      {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold block">Karanlık Mod (Dark Mode)</span>
                      <span className="text-[11px] opacity-60">Göz yormayan koyu renk tema deneyimi</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${darkMode ? 'bg-[#22b2a6] justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
                  </button>
                </div>

                <div className={`pt-4 border-t space-y-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className="block font-bold flex items-center gap-1.5 mb-2">
                    <Bell className="w-4 h-4 text-[#22b2a6]" /> Bildirim Tercihleri
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifDonationReceived}
                      onChange={(e) => setNotifDonationReceived(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22b2a6]"
                    />
                    <span>Bağışınız yerine ulaştığında veya makbuz üretildiğinde bildirim al</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifListingApproved}
                      onChange={(e) => setNotifListingApproved(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22b2a6]"
                    />
                    <span>Eşya bağış ilanınız vakıf tarafından onaylandığında bildirim al</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifEmergencyAlert}
                      onChange={(e) => setNotifEmergencyAlert(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22b2a6]"
                    />
                    <span>Acil fatura yardımları eklendiğinde anlık bildirim al</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'explore' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#22b2a6]" />
                    <span>Vakıf Onaylı Canlı Destek Borsası</span>
                  </h2>
                  <p className="text-xs opacity-70 mt-0.5">İhtiyaç sahibi taleplerini inceleyin, onay vererek doğrudan destek olun.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === 'all' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setActiveFilter('fatura')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === 'fatura' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Faturalar
                  </button>
                  <button
                    onClick={() => setActiveFilter('esya_talebi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === 'esya_talebi' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Eşya / Diğer Talepler
                  </button>
                  <button
                    onClick={() => setActiveFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === 'approved' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Onaylananlar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-7 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 opacity-50">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İhtiyaç başlığı veya açıklama içinde ara..."
                    className={`w-full border rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>

                <div className="sm:col-span-5 relative">
                  <div
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 pl-10 pr-10 text-xs font-medium cursor-pointer flex items-center justify-between select-none transition-colors ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 opacity-50 pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="truncate">{selectedCityFilter}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 opacity-60 pointer-events-none">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </div>

                  {isCityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsCityDropdownOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border shadow-xl z-30 p-1.5 space-y-0.5 custom-scrollbar animate-in fade-in zoom-in-95 duration-150 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        <div
                          onClick={() => {
                            setSelectedCityFilter('Tümü');
                            setIsCityDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${selectedCityFilter === 'Tümü' ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          <span>Tüm Şehirler</span>
                          {selectedCityFilter === 'Tümü' && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                        </div>
                        {Object.keys(TURKEY_CITIES).map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              setSelectedCityFilter(city);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${selectedCityFilter === city ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{city}</span>
                            {selectedCityFilter === city && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredItems.map(item => {
                let urgencyBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
                let iconBgColor = 'bg-[#22b2a6]/10 text-[#22b2a6] border-[#22b2a6]/30';
                let urgencyText = 'Normal İhtiyaç';

                if (item.urgencyLevel === 'high') {
                  urgencyBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
                  iconBgColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  urgencyText = 'Çok Acil / Kritik';
                } else if (item.urgencyLevel === 'medium') {
                  urgencyBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
                  iconBgColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  urgencyText = 'Acil Destek';
                }

                return (
                  <div key={item.id} className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3.5 rounded-2xl shrink-0 border shadow-sm ${iconBgColor}`}>
                        {item.type === 'fatura' ? <FileText className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${urgencyBadgeColor}`}>
                            {urgencyText}
                          </span>

                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                            {item.category}
                          </span>

                          <span className="text-[11px] opacity-60 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </span>

                          <span className="text-[11px] opacity-50">• {item.date}</span>
                        </div>

                        <h3 className="text-base font-extrabold">{item.title}</h3>
                        <p className="text-xs opacity-75 leading-relaxed">{item.description}</p>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#1b9187] dark:text-[#22b2a6] font-bold pt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{item.inspector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                      {item.amount && (
                        <div className="text-left md:text-right">
                          <span className="text-[10px] opacity-60 block font-semibold">Talep Edilen Tutar</span>
                          <span className="text-xl font-black text-[#1b9187] dark:text-[#22b2a6]">{item.amount} TL</span>
                        </div>
                      )}

                      <div className="w-full md:w-48">
                        {item.type === 'fatura' ? (
                          <div>
                            {item.paymentStatus === 'none' && (
                              <button 
                                onClick={() => handleOpenRequestApprovalModal(item)}
                                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700 shadow-sm"
                              >
                                <Clock className="w-3.5 h-3.5 text-[#22b2a6]" />
                                <span>Onay İste</span>
                              </button>
                            )}

                            {item.paymentStatus === 'requested' && (
                              <div className="w-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 font-bold text-xs py-3 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>Onay Bekleniyor</span>
                              </div>
                            )}

                            {item.paymentStatus === 'approved' && (
                              <button 
                                onClick={() => handleInitiatePayment(item)}
                                className="w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ödemeyi Yap</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenFulfillModal(item)}
                            className={`w-full text-xs font-bold py-3 rounded-xl transition-all cursor-pointer border shadow-sm ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}`}
                          >
                            Sağlayabilirim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'my_item_listings' && (() => {
          const filteredSubmissions = mySubmittedListings.filter(item => {
            if (itemListingTab === 'approved') return item.status.includes('Onaylandı');
            if (itemListingTab === 'pending') return item.status.includes('Bekliyor');
            return true;
          });

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-3 py-1 rounded-full">
                      Bağışçı Portalı
                    </span>
                    <span className="text-[10px] font-bold opacity-60">• Eşya Yönetim Merkezi</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">Eşya Bağışlarım & Takip Paneli</h2>
                  <p className="text-xs opacity-75 max-w-xl">
                    Vakıf onayına sunduğunuz ikinci el mobilya, beyaz eşya ve ev tekstili bağışlarınızın durumunu inceleyin, lojistik süreçlerini takip edin.
                  </p>
                </div>

                <button
                  onClick={() => handleNavigation('create_listing')}
                  className="bg-[#22b2a6] hover:bg-[#1b9187] text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Yeni Eşya Bağışla</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center font-black border border-[#22b2a6]/30">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">Toplam İlan</span>
                    <span className="text-xl font-black">{mySubmittedListings.length} Adet</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">Yayında Olanlar</span>
                    <span className="text-xl font-black">
                      {mySubmittedListings.filter(i => i.status.includes('Onaylandı')).length} Adet
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black border border-amber-500/30">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">İncelemede Bekleyen</span>
                    <span className="text-xl font-black">
                      {mySubmittedListings.filter(i => i.status.includes('Bekliyor')).length} Adet
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-2 rounded-2xl border flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <button
                  onClick={() => setItemListingTab('all')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemListingTab === 'all' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Tüm İlanlarım ({mySubmittedListings.length})
                </button>
                <button
                  onClick={() => setItemListingTab('approved')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemListingTab === 'approved' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Yayında Olanlar
                </button>
                <button
                  onClick={() => setItemListingTab('pending')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemListingTab === 'pending' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  İncelemedekiler
                </button>
              </div>

              {filteredSubmissions.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold">Bu sekmede henüz ilan bulunmuyor</h3>
                  <p className="text-xs opacity-70 max-w-sm mx-auto">
                    Kullanmadığınız eşyalarınızı bağışlayarak ihtiyaç sahibi ailelerin hayatına dokunabilirsiniz.
                  </p>
                  <button
                    onClick={() => handleNavigation('create_listing')}
                    className="mt-2 bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Eşya Bağışla
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map(item => {
                    const isApproved = item.status.includes('Onaylandı');

                    return (
                      <div key={item.id} className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#22b2a6]/10 dark:bg-slate-950 border border-[#22b2a6]/30 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-8 h-8 text-[#22b2a6]" />
                              )}
                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                  isApproved 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                                    : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                }`}>
                                  {item.status}
                                </span>

                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                  {item.category}
                                </span>

                                <span className="text-[11px] opacity-60 font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {item.city} / {item.district}
                                </span>
                              </div>

                              <h3 className="text-base font-extrabold">{item.title}</h3>
                              <p className="text-xs opacity-75">Kondisyon: <strong className="text-[#1b9187] dark:text-[#22b2a6]">{item.condition}</strong></p>

                              <div className="pt-2">
                                <span className="text-[10px] font-bold opacity-60 block mb-1">İlan ve Teslimat Süreci:</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#1b9187] dark:text-[#22b2a6]">
                                    <div className="w-4 h-4 rounded-full bg-[#22b2a6] text-white flex items-center justify-center text-[9px]">✓</div>
                                    <span>Vakıf İncelemesi</span>
                                  </div>
                                  <div className="w-6 h-0.5 bg-[#22b2a6]/40"></div>
                                  <div className={`flex items-center gap-1 text-[10px] font-bold ${isApproved ? 'text-[#1b9187] dark:text-[#22b2a6]' : 'opacity-40'}`}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isApproved ? 'bg-[#22b2a6] text-white' : 'bg-slate-300 text-slate-700'}`}>
                                      {isApproved ? '✓' : '2'}
                                    </div>
                                    <span>Yayında & Eşleştirme</span>
                                  </div>
                                  <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700"></div>
                                  <div className="flex items-center gap-1 text-[10px] font-bold opacity-40">
                                    <div className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[9px]">3</div>
                                    <span>Kurye Teslimatı</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>

                          <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#22b2a6]" />
                                <span>Düzenle</span>
                              </button>

                              <button
                                onClick={() => handleDeleteListing(item.id)}
                                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Sil</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Eşleşme ve Mahremiyet Bölümü */}
                        {isApproved && (
                          <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                                🟩 Eşleşme Sağlandı & Vakıf Onayladı
                              </span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-xs space-y-1">
                              <p className="font-bold text-[#1b9187] dark:text-[#22b2a6]">
                                🎉 Harika haber! "{item.title}" bağışınız, ihtiyacı olan bir aile ile eşleştirildi ve vakıf tarafından onaylandı.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="font-bold opacity-60 block text-[10px] uppercase">Eşleşilen Kişi / Aile Özeti (Mahremiyet Odaklı)</span>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">
                                  <div>• İhtiyaç Sahibi Grubu: <span className="font-bold text-[#1b9187] dark:text-[#22b2a6]">3 Çocuklu Aile (#IHT-8821)</span></div>
                                  <div>• Lokasyon Özeti: <span className="font-bold">{item.city}, {item.district}</span></div>
                                </div>
                              </div>

                              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                <div>
                                  <span className="font-bold opacity-60 block text-[10px] uppercase">Vakıf Sorumlusu İletişimi</span>
                                  <p className="text-[11px] opacity-80 mt-0.5">Süreçle ilgili sorularınız için Vakıf Sorumlusu <strong>Ayşe Hanım</strong> ile iletişime geçebilirsiniz.</p>
                                </div>

                                {revealedPhoneId === item.id ? (
                                  <div className="mt-2 w-full bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6] border border-[#22b2a6]/40 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-inner animate-in fade-in zoom-in-95 duration-200">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>Tel: 0216 555 00 00 (Ayşe H.)</span>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setRevealedPhoneId(item.id)}
                                    className="mt-2 w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Vakıf Yetkilisini Ara</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="text-[11px] opacity-75 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-2">
                              <span>ℹ️ Vakıf temsilcimiz en kısa sürede sizinle telefonla iletişime geçerek eşyanın teslim alınması için en uygun yöntemi organize edecektir.</span>
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

        {viewMode === 'create_listing' && (
          <div className={`max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`mb-6 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-2.5 py-1 rounded-md">
                Eşya Bağış Formu
              </span>
              <h2 className="text-xl font-extrabold mt-2">Kullanmadığınız Eşyayı Bağışlayın</h2>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold mb-1.5 opacity-80">Eşya Başlığı</label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Örn: Çalışma Masası ve Sandalye Takımı"
                  className={`w-full border rounded-2xl py-3 px-4 font-medium focus:outline-none focus:border-[#22b2a6] ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block font-bold mb-1.5 opacity-80">Kategori</label>
                  <div
                    onClick={() => setIsItemCategoryOpen(!isItemCategoryOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{itemCategory}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isItemCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isItemCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsItemCategoryOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-2xl border shadow-xl z-30 p-1.5 space-y-0.5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {['Mobilya', 'Beyaz Eşya', 'Elektronik', 'Ev Tekstili / Halı'].map(cat => (
                          <div
                            key={cat}
                            onClick={() => {
                              setItemCategory(cat);
                              setIsItemCategoryOpen(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-bold ${itemCategory === cat ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{cat}</span>
                            {itemCategory === cat && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <label className="block font-bold mb-1.5 opacity-80">Eşya Durumu / Kondisyonu</label>
                  <div
                    onClick={() => setIsItemConditionOpen(!isItemConditionOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{itemCondition}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isItemConditionOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isItemConditionOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsItemConditionOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-2xl border shadow-xl z-30 p-1.5 space-y-0.5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {[
                          'Sıfır Gibi (Hiç Kullanılmamış)',
                          'Az Kullanılmış (Çok İyi)',
                          'Orta Durumda (İşlevsel & Temiz)',
                          'Yoğun Kullanılmış / Bakım Gerektirir'
                        ].map(cond => (
                          <div
                            key={cond}
                            onClick={() => {
                              setItemCondition(cond);
                              setIsItemConditionOpen(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-bold ${itemCondition === cond ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{cond}</span>
                            {itemCondition === cond && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5 opacity-80">Eşya Fotoğrafı Yükle</label>
                <div className={`border-2 border-dashed rounded-2xl p-4 text-center relative transition-colors ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  {itemImage ? (
                    <div className="space-y-2">
                      <img src={itemImage} alt="Önizleme" className="w-full h-36 object-cover rounded-xl shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setItemImage(null)}
                        className="text-rose-600 font-bold hover:underline text-[11px]"
                      >
                        Fotoğrafı Kaldır / Değiştir
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                      <div className="w-10 h-10 rounded-xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center border border-[#22b2a6]/30">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold block">Fotoğraf seçmek için tıklayın</span>
                        <span className="text-[10px] opacity-60">PNG, JPG veya WEBP (Max. 5MB)</span>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block font-bold mb-1.5 opacity-80">Şehir (İl)</label>
                  <div
                    onClick={() => setIsCreateCityOpen(!isCreateCityOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{selectedCity}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isCreateCityOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isCreateCityOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsCreateCityOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl border shadow-xl z-30 p-1.5 space-y-0.5 custom-scrollbar ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {Object.keys(TURKEY_CITIES).map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              handleCityChange(city);
                              setIsCreateCityOpen(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-bold ${selectedCity === city ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <label className="block font-bold mb-1.5 opacity-80">İlçe</label>
                  <div
                    onClick={() => setIsCreateDistrictOpen(!isCreateDistrictOpen)}
                    className={`w-full border rounded-2xl py-3 px-4 font-medium cursor-pointer flex items-center justify-between select-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <span className="truncate">{selectedDistrict}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isCreateDistrictOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isCreateDistrictOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsCreateDistrictOpen(false)}></div>
                      <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl border shadow-xl z-30 p-1.5 space-y-0.5 custom-scrollbar ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {TURKEY_CITIES[selectedCity]?.map(district => (
                          <div
                            key={district}
                            onClick={() => {
                              setSelectedDistrict(district);
                              setIsCreateDistrictOpen(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-bold ${selectedDistrict === district ? 'bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <span>{district}</span>
                            {selectedDistrict === district && <Check className="w-3.5 h-3.5 text-[#22b2a6]" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#22b2a6] hover:bg-[#1b9187] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-sm transition-all text-xs cursor-pointer"
              >
                İlanı Vakıf Onayına Gönder
              </button>
            </form>
          </div>
        )}

        {viewMode === 'history' && (() => {
          const filteredHistory = myDonationHistory.filter(record => {
            if (historyTab === 'fatura') return record.type === 'fatura';
            if (historyTab === 'esya') return record.type === 'esya';
            return true;
          });

          const totalDonatedAmount = myDonationHistory.reduce((acc, curr) => acc + curr.amount, 0);

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b9187] bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-3 py-1 rounded-full">
                      Resmi Arşiv
                    </span>
                    <span className="text-[10px] font-bold opacity-60">• Dijital Makbuz Merkezi</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">Bağış Geçmişim & Resmi Makbuzlar</h2>
                  <p className="text-xs opacity-75 max-w-xl">
                    Tamamen ödediğiniz faturalarınızı, doğrudan bağış dekontlarınızı inceleyin ve resmi PDF makbuzlarınızı dilediğiniz zaman indirin.
                  </p>
                </div>

                <div className="bg-[#22b2a6]/10 border border-[#22b2a6]/30 px-5 py-3 rounded-2xl text-center shrink-0">
                  <span className="text-[10px] font-bold opacity-70 block uppercase">Toplam Destek</span>
                  <span className="text-lg font-black text-[#1b9187] dark:text-[#22b2a6]">{totalDonatedAmount.toLocaleString()} TL</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center font-black border border-[#22b2a6]/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">Toplam İşlem</span>
                    <span className="text-xl font-black">{myDonationHistory.length} Adet Bağış</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60 font-bold block uppercase tracking-wider">Resmi Onay Durumu</span>
                    <span className="text-xl font-black text-emerald-500">%100 Onaylı & Mühürlü</span>
                  </div>
                </div>
              </div>

              <div className={`p-2 rounded-2xl border flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <button
                  onClick={() => setHistoryTab('all')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'all' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Tüm Bağışlar ({myDonationHistory.length})
                </button>
                <button
                  onClick={() => setHistoryTab('fatura')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'fatura' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Faturalar
                </button>
                <button
                  onClick={() => setHistoryTab('esya')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'esya' ? 'bg-[#22b2a6] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Eşya / Diğer
                </button>
              </div>

              {filteredHistory.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30">
                    <History className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold">Bu kategoride henüz bağış kaydınız bulunmuyor</h3>
                  <p className="text-xs opacity-70 max-w-sm mx-auto">
                    İhtiyaç ilanlarını inceleyerek bu kategoride ilk bağışınızı gerçekleştirebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map(record => (
                    <div key={record.id} className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#22b2a6]/10 text-[#22b2a6] flex items-center justify-center border border-[#22b2a6]/30 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              Resmi Onaylı
                            </span>
                            <span className="text-[11px] opacity-60 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {record.location}
                            </span>
                            <span className="text-[11px] opacity-50">• {record.date}</span>
                          </div>

                          <h3 className="text-base font-extrabold">{record.title}</h3>
                          <p className="text-xs opacity-75">
                            Belge Numarası: <strong className="text-[#1b9187] dark:text-[#22b2a6]">{record.receiptNo}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] opacity-60 block font-semibold">Ödenen Tutar</span>
                          <span className="text-xl font-black text-[#1b9187] dark:text-[#22b2a6]">{record.amount} TL</span>
                        </div>

                        <button
                          onClick={() => handleDownloadReceipt(record.receiptNo, record.title, record.amount, record.location, record.date)}
                          className="flex items-center justify-center gap-2 bg-[#22b2a6] hover:bg-[#1b9187] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF Makbuz İndir</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {viewMode === 'verification' && (() => {
          const filteredVerificationListings = mySubmittedListings.filter(listing => {
            if (verificationTab === 'approved') return listing.status.includes('Onaylandı');
            if (verificationTab === 'pending') return listing.status.includes('Bekliyor');
            return true;
          });

          const approvedCount = mySubmittedListings.filter(i => i.status.includes('Onaylandı')).length;
          const pendingCount = mySubmittedListings.filter(i => i.status.includes('Bekliyor')).length;

          return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
               
              <div className="bg-gradient-to-br from-[#1b9187] via-[#147a71] to-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                 
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-extrabold text-[#80ede5]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Vakıf Denetim Masası & Şeffaflık Takibi</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Eşya Bağışı Onay ve Süreç Merkezi</h2>
                    <p className="text-[#e0f7f5] text-xs sm:text-sm leading-relaxed max-w-xl">
                      Vakfımıza bağışladığınız tüm eşyaların eksper incelemelerini, onay durumlarını, yüksek çözünürlüklü önizlemelerini ve aile eşleşme detaylarını bu profesyonel masadan takip edebilirsiniz.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] text-[#e0f7f5] uppercase font-bold block">Onaylanan</span>
                      <span className="text-xl font-black text-emerald-300">{approvedCount}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center">
                      <span className="text-[10px] text-[#e0f7f5] uppercase font-bold block">İncelemede</span>
                      <span className="text-xl font-black text-amber-300">{pendingCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-2 rounded-2xl border flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <button
                  onClick={() => setVerificationTab('all')}
                  className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    verificationTab === 'all' ? 'bg-[#22b2a6] text-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Tüm İlanlarım ({mySubmittedListings.length})
                </button>
                <button
                  onClick={() => setVerificationTab('approved')}
                  className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    verificationTab === 'approved' ? 'bg-[#22b2a6] text-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Onaylanan & Yayındakiler ({approvedCount})
                </button>
                <button
                  onClick={() => setVerificationTab('pending')}
                  className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    verificationTab === 'pending' ? 'bg-[#22b2a6] text-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  İncelemede Bekleyenler ({pendingCount})
                </button>
              </div>

              {filteredVerificationListings.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="w-16 h-16 bg-[#22b2a6]/10 text-[#22b2a6] rounded-2xl mx-auto flex items-center justify-center border border-[#22b2a6]/30">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold">Bu filtrede eşya ilanı bulunmuyor</h3>
                  <p className="text-xs opacity-70">Yeni bir eşya bağışlayarak süreci buradan takip edebilirsiniz.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredVerificationListings.map(listing => {
                    const isApproved = listing.status.includes('Onaylandı');

                    return (
                      <div 
                        key={listing.id} 
                        className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all hover:shadow-md space-y-5 ${
                          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 border ${
                              isApproved 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            }`}>
                              {isApproved ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">İlan ID: #{listing.id}</span>
                                <span>•</span>
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#22b2a6]/10 text-[#1b9187] dark:text-[#22b2a6] border border-[#22b2a6]/30">
                                  {listing.category}
                                </span>
                              </div>
                              <h3 className="text-lg font-extrabold mt-0.5">{listing.title}</h3>
                            </div>
                          </div>

                          <span className={`text-xs font-extrabold px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-sm ${
                            isApproved 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`}></span>
                            {listing.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-4">
                            <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
                              {listing.image ? (
                                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-4">
                                  <Package className="w-10 h-10 text-[#22b2a6] mx-auto mb-1 opacity-60" />
                                  <span className="text-[11px] font-bold opacity-60 block">Fotoğraf Yüklenmedi</span>
                                </div>
                              )}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#22b2a6]" /> {listing.city} / {listing.district}
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-8 space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] opacity-60 block font-bold uppercase">Kondisyon Durumu</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{listing.condition}</span>
                              </div>

                              <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] opacity-60 block font-bold uppercase">Lokasyon</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{listing.city}, {listing.district}</span>
                              </div>

                              <div className={`p-3 rounded-2xl border col-span-2 sm:col-span-1 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] opacity-60 block font-bold uppercase">Eksper Raporu</span>
                                <span className="font-extrabold text-[#1b9187] dark:text-[#22b2a6] mt-0.5 block">
                                  {isApproved ? 'Onaylandı & Mühürlendi' : 'İnceleme Sırasında'}
                                </span>
                              </div>
                            </div>

                            {isApproved ? (
                              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Vakıf Denetim Notu ve Eşleşme Bilgisi</span>
                                </div>
                                <p className="text-xs opacity-85 leading-relaxed">
                                  Bu eşya vakfımız uzman eksperleri tarafından incelenmiş olup, <strong>3 Çocuklu İhtiyaç Sahibi Aile (#IHT-8821)</strong> ile eşleştirilmiştir. Kurye ve lojistik ekibimiz teslimat için hazırlıklara başlamıştır.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  <span>İnceleme Masası Bekleme Durumu</span>
                                </div>
                                <p className="text-xs opacity-85 leading-relaxed">
                                  Eşyanızın fotoğrafları ve kondisyon beyanı vakıf inceleme komisyonumuzca değerlendirilmektedir. Ortalama onay süresi 24 saattir.
                                </p>
                              </div>
                            )}

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

      {/* Alt Footer */}
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