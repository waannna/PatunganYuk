// src/components/Footer.jsx
import { ReceiptDivider } from './ui';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 bg-stone-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="receipt-paper receipt-shadow border border-stone-300/60 py-6 px-6 max-w-2xl mx-auto">
          <ReceiptDivider double />
          
          <div className="text-center py-4">
            <p className="font-mono font-bold text-sm tracking-widest text-stone-900">
              PATUNGAN<span className="text-stone-500">YUK</span>
            </p>
            <p className="font-mono text-[9px] tracking-[0.3em] text-stone-500 mt-2">
               SISTEM PATUNGAN 
            </p>
          </div>

          <ReceiptDivider />

          <div className="text-center space-y-1 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-stone-600">
              SISTEM FINANSIAL &middot; PEMROGRAMAN WEB
            </p>
            <p className="font-mono text-[9px] text-stone-400">
              &copy; {new Date().getFullYear()} PATUNGANYUK
            </p>
          </div>

          <ReceiptDivider double />

          <div className="text-center pt-3">
            <p className="font-mono text-[9px] tracking-[0.3em] text-stone-400">
               TERIMA KASIH 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}