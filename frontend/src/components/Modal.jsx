// src/components/Modal.jsx
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ReceiptDivider } from './ui';

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    full: 'max-w-4xl'
  };

  return (
    <div className="
      fixed inset-0 z-50 
      flex items-center justify-center p-4 
      bg-stone-900/60 backdrop-blur-sm 
      animate-in fade-in duration-200
    ">
      <div 
        ref={modalRef}
        className={`
          receipt-paper receipt-shadow
          border-2 border-stone-400
          ${sizeClasses[size]} w-full
          animate-in zoom-in-95 duration-200 
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        <div className="
          px-5 py-4 border-b-2 border-dashed border-stone-300 
          flex-shrink-0
        ">
          <div className="flex items-center justify-between mb-2">
            {showClose && (
              <button 
                onClick={onClose} 
                className="
                  p-1 text-stone-500 hover:text-stone-900 
                  transition-colors
                "
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="text-center">
            <h3 className="
              font-mono font-bold text-sm uppercase tracking-widest 
              text-stone-900
            ">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}