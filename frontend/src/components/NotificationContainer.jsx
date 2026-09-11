// src/components/NotificationContainer.jsx
import { useNotification } from '../hooks/useNotification';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-emerald-600" />;
      case 'error': return <AlertCircle size={18} className="text-rose-600" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-600" />;
      default: return <Info size={18} className="text-indigo-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-rose-50 border-rose-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-indigo-50 border-indigo-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-800';
      case 'error': return 'text-rose-800';
      case 'warning': return 'text-amber-800';
      default: return 'text-indigo-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100%-2rem)] space-y-2 pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm animate-in slide-in-from-right duration-300 ${getBgColor(n.type)}`}
          >
            <span className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</span>
            <span className={`text-sm flex-1 ${getTextColor(n.type)}`}>{n.message}</span>
            <button 
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}