// src/components/ReceiptModal.jsx
import { useEffect, useRef } from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Button, ReceiptDivider } from './ui';

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !receiptData) return null;

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val || 0);

  const formatDate = (date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
      day: d.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase()
    };
  };

  const now = formatDate(receiptData.paymentDate || new Date());
  const receiptNo = `PY-${Date.now().toString().slice(-8)}`;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
      >
        {/* STRUK */}
        <div className="receipt-paper receipt-shadow border-2 border-stone-400 receipt-print relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 bg-stone-900 text-amber-50 hover:bg-stone-800 transition-colors print:hidden"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="text-center pt-6 pb-4 px-5">
            <div className="text-[10px] tracking-[0.4em] text-stone-500 mb-2">
              ★ ★ ★ ★ ★
            </div>
            <h1 className="receipt-title text-xl tracking-widest text-stone-900">
              PATUNGANYUK
            </h1>
            <p className="receipt-label mt-0.5">BUKTI PEMBAYARAN</p>
            <p className="font-mono text-[9px] text-stone-500 mt-1">
              Jl. Patungan No. 1, Indonesia
            </p>
          </div>

          <ReceiptDivider double />

          {/* Status */}
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 border-2 border-emerald-700">
              <CheckCircle size={14} className="text-emerald-800" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                PEMBAYARAN BERHASIL
              </span>
            </div>
          </div>

          <ReceiptDivider />

          {/* Info Transaksi */}
          <div className="px-5 py-3 font-mono text-[10px] space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">NO. STRUK</span>
              <span className="font-bold">{receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">TANGGAL</span>
              <span className="font-bold">{now.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">WAKTU</span>
              <span className="font-bold">{now.time} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">KASIR</span>
              <span className="font-bold uppercase">{receiptData.cashier || 'SYSTEM'}</span>
            </div>
          </div>

          <ReceiptDivider />

          {/* Detail Pembayaran */}
          <div className="px-5 py-3">
            <p className="receipt-label text-center mb-3">═══ DETAIL PEMBAYARAN ═══</p>

            <div className="font-mono text-[10px] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-stone-500">DARI</span>
                <span className="font-bold uppercase">{receiptData.fromMember}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">KEPADA</span>
                <span className="font-bold uppercase">{receiptData.toMember}</span>
              </div>
              {receiptData.groupName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">GRUP</span>
                  <span className="font-bold uppercase truncate ml-2">{receiptData.groupName}</span>
                </div>
              )}
            </div>

            <ReceiptDivider />

            <div className="py-2">
              <p className="receipt-label mb-1">JUMLAH DIBAYAR</p>
              <p className="font-mono font-bold text-2xl text-stone-900 text-right">
                {formatRupiah(receiptData.amount)}
              </p>
            </div>

            <ReceiptDivider />

            <div className="py-2 space-y-1.5 font-mono text-[10px]">
              {receiptData.description && (
                <div className="flex justify-between">
                  <span className="text-stone-500">KETERANGAN</span>
                  <span className="font-bold uppercase text-right ml-2 max-w-[60%]">
                    {receiptData.description}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">METODE</span>
                <span className="font-bold uppercase">{receiptData.method || 'TRANSFER'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">STATUS</span>
                <span className="font-bold uppercase text-emerald-800">LUNAS</span>
              </div>
            </div>
          </div>

          <ReceiptDivider double />

          {/* Footer */}
          <div className="text-center py-5 px-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-stone-600">
              ★ TERIMA KASIH ★
            </p>
            <p className="font-mono text-[9px] text-stone-500 mt-1">
              Struk ini adalah bukti sah pembayaran
            </p>

            <ReceiptDivider />

            <p className="font-mono text-[8px] text-stone-400 mt-2">
              PATUNGANYUK v1.0.0 • {new Date().getFullYear()}
            </p>

            {/* Barcode */}
            <div className="mt-3 flex justify-center items-end gap-0.5 h-10">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-stone-900"
                  style={{
                    width: Math.random() > 0.5 ? '2px' : '1px',
                    height: `${60 + Math.random() * 40}%`,
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-[8px] text-stone-500 mt-1 tracking-widest">
              {receiptNo}
            </p>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-4 flex gap-2 print:hidden">
          <Button variant="secondary" fullWidth onClick={handlePrint} icon={Printer}>
            CETAK
          </Button>
          <Button variant="primary" fullWidth onClick={onClose}>
            SELESAI
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-paper, .receipt-paper * { visibility: visible; }
          .receipt-paper { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}