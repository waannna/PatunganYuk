// src/components/ConfirmModal.jsx
import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button, ReceiptDivider } from './ui';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'KONFIRMASI', 
  message = 'Yakin ingin melanjutkan?',
  confirmText = 'YA, LANJUTKAN',
  cancelText = 'BATAL',
  danger = false,
  loading = false
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm">
      <div className="w-full max-w-sm receipt-paper receipt-shadow border-2 border-stone-400 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3 border-b-2 border-dashed border-stone-300 flex items-center justify-between">
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 text-center">
          <div className={`
            w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2
            ${danger 
              ? 'border-red-400 bg-red-50' 
              : 'border-stone-400 bg-stone-50'
            }
          `}>
            <AlertTriangle size={28} className={danger ? 'text-red-700' : 'text-stone-600'} />
          </div>
          
          <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-stone-900 mb-2">
            {title}
          </h3>
          
          <p className="font-mono text-xs text-stone-600 leading-relaxed">
            {message}
          </p>
        </div>

        <ReceiptDivider />

        {/* Actions */}
        <div className="px-5 py-4 flex gap-2">
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={danger ? 'danger' : 'primary'} 
            fullWidth 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}