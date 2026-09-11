// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Tag, HelpCircle, 
  Shield, Home, ChevronDown,
  UserCircle, Wallet, Clock,
  Settings, LogOut, MessageSquare
} from 'lucide-react';
import { Avatar, Badge } from './ui';
import ConfirmModal from './ConfirmModal';

export default function Navbar({ currentUser, onOpenReportModal, isAdmin, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  const navItems = [
    { key: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={14} />, path: '/dashboard' },
    { key: 'groups', label: 'GRUP', icon: <Home size={14} />, path: '/groups' },
    { key: 'activity', label: 'AKTIVITAS', icon: <Activity size={14} />, path: '/activity' },
    { key: 'categories', label: 'KATEGORI', icon: <Tag size={14} />, path: '/categories' },
    { key: 'help', label: 'BANTUAN', icon: <HelpCircle size={14} />, path: '/help' },
  ];

  const profileItems = [
    { key: 'profile', label: 'PROFIL', icon: <UserCircle size={14} />, desc: 'Kelola akun', path: '/profile' },
    { key: 'settings', label: 'PENGATURAN', icon: <Settings size={14} />, desc: 'Preferensi', path: '/settings' },
    { key: 'activity', label: 'AKTIVITAS', icon: <Clock size={14} />, desc: 'Riwayat', path: '/activity' },
    { key: 'categories', label: 'KATEGORI', icon: <Tag size={14} />, desc: 'Atur kategori', path: '/categories' },
    { key: 'help', label: 'BANTUAN', icon: <HelpCircle size={14} />, desc: 'Panduan', path: '/help' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isProfileOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen) return;
    
    const updatePosition = () => {
      if (profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      }
    };
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setConfirmLogout(true);
  };

  const doLogout = () => {
    setConfirmLogout(false);
    onLogout();
  };

  const isActive = (path) => location.pathname === path;

  const dropdownContent = isProfileOpen && currentUser && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
      className="
        w-64 z-[9999]
        receipt-paper receipt-shadow
        border-2 border-stone-300
        overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      <div className="p-4 border-b-2 border-dashed border-stone-300">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-mono font-bold text-xs uppercase text-stone-900 truncate">
              {currentUser.name}
            </p>
            <p className="font-mono text-[9px] text-stone-500 truncate">
              {currentUser.email}
            </p>
            {isAdmin && (
              <div className="mt-1">
                <Badge variant="primary" size="sm">ADMINISTRATOR</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-2">
        {profileItems.map((item, idx) => (
          <div key={item.key}>
            <button
              onClick={() => handleNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left
                font-mono transition-colors
                ${isActive(item.path)
                  ? 'bg-stone-900 text-amber-50'
                  : 'text-stone-700 hover:bg-stone-100'
                }
              `}
            >
              <span className={isActive(item.path) ? 'text-amber-50' : 'text-stone-500'}>
                {item.icon}
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {item.label}
                </p>
                <p className={`text-[9px] ${
                  isActive(item.path) ? 'text-amber-200/70' : 'text-stone-400'
                }`}>
                  {item.desc}
                </p>
              </div>
            </button>
            {idx < profileItems.length - 1 && (
              <div className="mx-4 border-t border-dashed border-stone-200" />
            )}
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-stone-300">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-4 py-3
            font-mono text-[10px] font-bold uppercase tracking-widest
            text-red-700 hover:bg-red-50 transition-colors
          "
        >
          <LogOut size={14} />
          KELUAR
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav className="hidden lg:block sticky top-0 z-50">
        <div className={`
          w-full transition-all duration-300
          receipt-paper border-b-2 border-stone-300
          ${isScrolled ? 'receipt-shadow' : ''}
        `}>
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-3 items-center h-14">

              <div className="flex items-center">
                <button 
                  onClick={() => handleNavigate('/dashboard')}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 bg-stone-900 flex items-center justify-center border-2 border-stone-900">
                    <Wallet size={14} className="text-amber-50" />
                  </div>
                  <div className="leading-none">
                    <p className="font-mono font-bold tracking-widest text-sm text-stone-900">
                      PATUNGAN<span className="text-stone-500">YUK</span>
                    </p>
                    <p className="font-mono text-[8px] tracking-[0.2em] text-stone-500 mt-0.5">
                      SISTEM PATUNGAN
                    </p>
                  </div>
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center justify-center gap-0">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        relative px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest
                        transition-colors flex items-center gap-1.5
                        ${isActive(item.path)
                          ? 'text-stone-900'
                          : 'text-stone-500 hover:text-stone-800'
                        }
                      `}
                    >
                      {item.icon}
                      {item.label}
                      {isActive(item.path) && (
                        <span className="absolute bottom-0 left-3 right-3 border-b-2 border-dashed border-stone-900" />
                      )}
                    </button>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigate('/admin')}
                      className={`
                        relative px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest
                        transition-colors flex items-center gap-1.5
                        ${isActive('/admin')
                          ? 'text-amber-800'
                          : 'text-stone-500 hover:text-amber-800'
                        }
                      `}
                    >
                      <Shield size={14} />
                      ADMIN
                      {isActive('/admin') && (
                        <span className="absolute bottom-0 left-3 right-3 border-b-2 border-dashed border-amber-800" />
                      )}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {currentUser ? (
                  <>
                    <button
                      onClick={onOpenReportModal}
                      className="
                        flex items-center gap-1.5 px-3 py-1.5
                        font-mono text-[10px] font-bold uppercase tracking-widest
                        text-stone-600 hover:text-stone-900
                        border-2 border-dashed border-stone-300 hover:border-stone-600
                        transition-colors
                      "
                    >
                      <MessageSquare size={12} />
                      LAPOR
                    </button>

                    <button
                      ref={profileRef}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`
                        flex items-center gap-2 px-2 py-1.5
                        border-2 transition-colors
                        ${isProfileOpen 
                          ? 'border-stone-900 bg-stone-900 text-amber-50' 
                          : 'border-dashed border-stone-300 hover:border-stone-600'
                        }
                      `}
                    >
                      <Avatar name={currentUser.name} size="sm" />
                      <span className={`
                        font-mono text-[10px] font-bold uppercase tracking-widest
                        ${isProfileOpen ? 'text-amber-50' : 'text-stone-700'}
                      `}>
                        {currentUser.name?.split(' ')[0]}
                      </span>
                      <ChevronDown 
                        size={12} 
                        className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${
                          isProfileOpen ? 'text-amber-50' : 'text-stone-500'
                        }`} 
                      />
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-xs text-stone-500 uppercase">
                    SILAKAN MASUK
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}

      <ConfirmModal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={doLogout}
        title="KELUAR AKUN"
        message="Yakin ingin keluar dari akun Anda?"
        confirmText="YA, KELUAR"
        cancelText="BATAL"
        danger={true}
      />
    </>
  );
}