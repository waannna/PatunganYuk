// src/components/ui/NotifPopup.jsx
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function NotifPopup({ message, type = 'info', duration = 4000, onClose, title }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
  };

  const colors = {
    success: 'border-emerald-700 bg-emerald-50 text-emerald-900',
    error: 'border-red-700 bg-red-50 text-red-900',
    warning: 'border-amber-700 bg-amber-50 text-amber-900',
    info: 'border-stone-700 bg-stone-50 text-stone-900',
  };

  return (
    <div
      className={`
        receipt-paper receipt-shadow border-2 border-dashed
        flex items-start gap-3 p-3
        transform transition-all duration-300
        ${colors[type]}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-mono font-bold uppercase text-[10px] tracking-widest mb-1">
            {title}
          </p>
        )}
        <p className="font-mono text-xs leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={handleClose} 
        className="flex-shrink-0 hover:opacity-60 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default NotifPopup;