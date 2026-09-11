// src/components/MobileHeader.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Wallet } from 'lucide-react';
import { Avatar } from './ui';

export default function MobileHeader({ currentUser, isAdmin }) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const notifButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const notifications = [];

  useEffect(() => {
    if (isNotifOpen && notifButtonRef.current) {
      const rect = notifButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isNotifOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifButtonRef.current && !notifButtonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerContent = (
    <header 
      className="
        lg:hidden
        receipt-paper border-b-2 border-stone-300
        px-4 py-2.5 flex items-center justify-between
      "
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transform: 'translateZ(0)'
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-stone-900 flex items-center justify-center border border-stone-900">
          <Wallet size={14} className="text-amber-50" />
        </div>
        <div className="leading-none">
          <p className="font-mono font-bold tracking-widest text-xs text-stone-900">
            PATUNGAN<span className="text-stone-500">YUK</span>
          </p>
          <p className="font-mono text-[7px] tracking-[0.15em] text-stone-500 mt-0.5">
            SISTEM PATUNGAN
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => navigate('/help')}
          className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <HelpCircle size={18} />
        </button>

        <button
          ref={notifButtonRef}
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="p-2 text-stone-500 hover:text-stone-900 transition-colors relative"
        >
          <Bell size={18} />
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="p-1"
        >
          <Avatar name={currentUser?.name} size="sm" />
        </button>
      </div>
    </header>
  );

  const notifDropdown = isNotifOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${dropdownPos.top}px`,
        right: `${dropdownPos.right}px`,
        zIndex: 9999
      }}
      className="
        lg:hidden w-72
        receipt-paper receipt-shadow
        border-2 border-stone-300
        overflow-hidden
      "
    >
      <div className="px-4 py-3 border-b-2 border-dashed border-stone-300 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-stone-900">
          NOTIFIKASI
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-3 border-b border-dashed border-stone-200">
              <p className="font-mono text-[10px]">{n.message}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <Bell size={24} className="text-stone-300 mx-auto mb-2" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
              TIDAK ADA NOTIFIKASI
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {typeof document !== 'undefined' && createPortal(headerContent, document.body)}
      {typeof document !== 'undefined' && createPortal(notifDropdown, document.body)}
    </>
  );
}