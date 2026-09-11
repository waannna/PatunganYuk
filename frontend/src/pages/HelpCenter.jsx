// src/pages/HelpCenter.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, MessageCircle, Mail, 
  HelpCircle, ChevronDown, Search, Info
} from 'lucide-react';
import { 
  Card, Button, Input, Badge, ReceiptDivider, EmptyState 
} from '../components/ui';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { 
      id: 1, 
      q: 'BAGAIMANA CARA MEMBUAT GRUP PATUNGAN?', 
      a: 'Buka halaman GRUP SAYA, klik tombol "BARU", masukkan nama dan kategori, lalu simpan. Grup akan langsung aktif dan siap digunakan.' 
    },
    { 
      id: 2, 
      q: 'BAGAIMANA CARA MENAMBAHKAN ANGGOTA KE GRUP?', 
      a: 'Pilih grup yang diinginkan, klik tombol "ANGGOTA" di panel detail grup, masukkan nama anggota baru, lalu klik TAMBAH.' 
    },
    { 
      id: 3, 
      q: 'APA YANG DIMAKSUD DENGAN PIUTANG DAN UTANG?', 
      a: 'Piutang adalah uang yang harusnya Anda terima dari orang lain. Utang adalah uang yang harus Anda bayarkan. Sistem menghitung otomatis berdasarkan transaksi yang tercatat.' 
    },
    { 
      id: 4, 
      q: 'BAGAIMANA CARA MENCATAT PENGELUARAN?', 
      a: 'Pilih grup, klik tombol "CATAT", isi deskripsi, nominal, kategori, dan siapa yang membayar. Klik SIMPAN, transaksi langsung tercatat.' 
    },
    { 
      id: 5, 
      q: 'APA ITU PELUNASAN DAN BAGAIMANA CARA MENGGUNAKANNYA?', 
      a: 'Pelunasan adalah fitur untuk mencatat pembayaran utang antar anggota. Anda bisa mengisi manual atau menggunakan SARAN PELUNASAN otomatis dari sistem.' 
    },
    { 
      id: 6, 
      q: 'APAKAH DATA SAYA AMAN?', 
      a: 'Ya, semua data disimpan di server dengan enkripsi. Kami tidak membagikan data Anda ke pihak ketiga tanpa izin.' 
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      {/* ==================== HEADER STRUK ==================== */}
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">
          PUSAT BANTUAN
        </h1>
        <p className="receipt-label mt-1">PANDUAN & FAQ</p>
        <ReceiptDivider double />
        <div className="px-5">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} icon={ArrowLeft} fullWidth>
            KEMBALI KE DASHBOARD
          </Button>
        </div>
        <ReceiptDivider />
        <div className="px-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="CARI PERTANYAAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {/* ==================== AI ASSISTANT BANNER ==================== */}
      <Card padding="p-5">
        <div className="text-center mb-4">
          <p className="receipt-label">═══ ASISTEN AI ═══</p>
        </div>
        <div className="text-center py-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-amber-50 border-2 border-stone-900">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              AI ASSISTANT AKTIF
            </span>
          </div>
          <p className="font-mono text-xs text-stone-600 mt-3 leading-relaxed">
            Butuh bantuan cepat?<br />
            Klik ikon <strong>BOT</strong> di pojok kanan bawah
          </p>
        </div>
        <ReceiptDivider />
        <div className="grid grid-cols-2 gap-2">
          {['CARA BUAT GRUP', 'TAMBAH ANGGOTA', 'CATAT PENGELUARAN', 'PELUNASAN UTANG'].map((text) => (
            <div key={text} className="text-center px-2 py-2 bg-stone-100 border border-dashed border-stone-300">
              <span className="font-mono text-[9px] uppercase tracking-wider text-stone-600">
                {text}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ==================== FAQ ==================== */}
      <Card padding="p-5">
        <div className="text-center mb-4">
          <p className="receipt-label">═══ TANYA JAWAB ═══</p>
          <p className="font-mono text-[10px] text-stone-500 mt-1">
            {filteredFaqs.length} PERTANYAAN
          </p>
        </div>

        {filteredFaqs.length > 0 ? (
          <div>
            {filteredFaqs.map((faq, idx) => (
              <div key={faq.id}>
                <button
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                  className="w-full text-left py-3 hover:bg-stone-100/50 -mx-2 px-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-stone-400 flex-shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-mono text-xs font-bold uppercase text-stone-800 leading-snug">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={`text-stone-400 flex-shrink-0 transition-transform ${
                        activeFaq === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {activeFaq === faq.id && (
                  <div className="ml-6 pb-3 border-l-2 border-dashed border-stone-300 pl-3 mt-1">
                    <p className="font-mono text-xs text-stone-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
                
                {idx < filteredFaqs.length - 1 && <ReceiptDivider />}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HelpCircle}
            title="TIDAK DITEMUKAN"
            description="Coba kata kunci lain atau hubungi support"
          />
        )}
      </Card>

      {/* ==================== CONTACT ==================== */}
      <Card padding="p-5">
        <div className="text-center mb-4">
          <p className="receipt-label">═══ HUBUNGI KAMI ═══</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-stone-100 border border-dashed border-stone-300">
            <MessageCircle size={18} className="text-stone-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold uppercase">LIVE CHAT</p>
              <p className="font-mono text-[10px] text-stone-500">Senin-Jumat, 09:00-17:00 WIB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-100 border border-dashed border-stone-300">
            <Mail size={18} className="text-stone-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold uppercase">EMAIL</p>
              <p className="font-mono text-[10px] text-stone-500">support@patunganyuk.com</p>
            </div>
          </div>
        </div>
        <ReceiptDivider />
        <Button variant="primary" fullWidth icon={Mail}>
          KIRIM EMAIL SUPPORT
        </Button>
      </Card>

      {/* ==================== FOOTER STRUK ==================== */}
      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">
           KAMI SIAP MEMBANTU 
        </p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          PATUNGANYUK • SUPPORT CENTER
        </p>
        <ReceiptDivider double />
      </div>
    </div>
  );
}