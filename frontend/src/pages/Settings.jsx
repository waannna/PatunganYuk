// src/pages/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  ArrowLeft, Bell, Lock, Globe, Sun, 
  ChevronRight, Shield, Database, 
  RefreshCw, LogOut, User,
  Wallet, Download, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  Card, Button, Select, Badge, 
  Toggle, ReceiptDivider 
} from '../components/ui';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [currency, setCurrency] = useState('IDR');
  const [language, setLanguage] = useState('id');
  const [expandedSection, setExpandedSection] = useState('account');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const doLogout = () => {
    setConfirmLogout(false);
    onLogout();
  };

  const handleExportData = () => {
    addNotification('Data sedang diproses untuk diekspor', 'info', 3000, 'PROSES');
    setTimeout(() => {
      addNotification('Data berhasil diekspor ke CSV', 'success', 3000, 'SUKSES');
    }, 1500);
  };

  const handleClearData = () => {
    setConfirmClear(true);
  };

  const doClearData = () => {
    setConfirmClear(false);
    addNotification('Data pengguna telah dihapus', 'warning', 3000, 'DIHAPUS');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'account',
      icon: <User size={16} />,
      title: 'AKUN',
      items: [
        { 
          label: 'INFORMASI PROFIL', 
          desc: 'Nama, email, dan nomor telepon',
          action: () => navigate('/profile'),
          actionLabel: 'KELOLA'
        },
        { 
          label: 'KEAMANAN', 
          desc: 'Ubah kata sandi, 2FA',
          action: () => addNotification('Fitur segera hadir', 'info', 3000, 'INFO'),
          actionLabel: 'KELOLA'
        },
      ]
    },
    {
      id: 'preferences',
      icon: <Globe size={16} />,
      title: 'PREFERENSI',
      items: [
        {
          label: 'MODE GELAP',
          desc: 'Tampilan gelap untuk kenyamanan',
          toggle: { checked: darkMode, onChange: setDarkMode }
        },
        {
          label: 'BAHASA',
          desc: 'Pilih bahasa aplikasi',
          select: {
            value: language,
            onChange: setLanguage,
            options: [
              { value: 'id', label: 'INDONESIA' },
              { value: 'en', label: 'ENGLISH' }
            ]
          }
        },
        {
          label: 'MATA UANG',
          desc: 'Format mata uang',
          select: {
            value: currency,
            onChange: setCurrency,
            options: [
              { value: 'IDR', label: 'IDR (Rp)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' }
            ]
          }
        },
      ]
    },
    {
      id: 'notifications',
      icon: <Bell size={16} />,
      title: 'NOTIFIKASI',
      items: [
        {
          label: 'NOTIFIKASI PUSH',
          desc: 'Terima notifikasi di perangkat',
          toggle: { checked: notifications, onChange: setNotifications }
        },
        {
          label: 'SINKRONISASI OTOMATIS',
          desc: 'Sinkron data secara berkala',
          toggle: { checked: autoSync, onChange: setAutoSync }
        },
      ]
    },
    {
      id: 'data',
      icon: <Database size={16} />,
      title: 'DATA',
      items: [
        {
          label: 'EKSPOR DATA',
          desc: 'Unduh semua data dalam format CSV',
          action: handleExportData,
          actionLabel: 'EKSPOR'
        },
        {
          label: 'HAPUS DATA',
          desc: 'Hapus semua data pengguna',
          action: handleClearData,
          actionLabel: 'HAPUS',
          danger: true
        },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">PENGATURAN</h1>
        <p className="receipt-label mt-1">KONFIGURASI SISTEM</p>
        <ReceiptDivider double />
        <div className="px-5 text-[10px] font-mono text-left">
          <p className="text-stone-500">PENGGUNA</p>
          <p className="font-bold uppercase">{currentUser?.name || 'USER'}</p>
        </div>
        <ReceiptDivider />
        <div className="px-5">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} icon={ArrowLeft} fullWidth>
            KEMBALI KE PROFIL
          </Button>
        </div>
      </div>

      {sections.map((section) => (
        <Card key={section.id} padding="p-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-stone-700">{section.icon}</div>
              <p className="receipt-label font-bold text-stone-900">{section.title}</p>
            </div>
            {expandedSection === section.id ? (
              <ChevronUp size={16} className="text-stone-400" />
            ) : (
              <ChevronDown size={16} className="text-stone-400" />
            )}
          </button>

          {expandedSection === section.id && (
            <div className="px-5 pb-5">
              <ReceiptDivider />
              {section.items.map((item, idx) => (
                <div key={idx}>
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-mono text-xs font-bold uppercase ${
                        item.danger ? 'text-red-700' : 'text-stone-900'
                      }`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    {item.toggle && (
                      <Toggle 
                        checked={item.toggle.checked} 
                        onChange={item.toggle.onChange} 
                      />
                    )}

                    {item.select && (
                      <select
                        value={item.select.value}
                        onChange={(e) => item.select.onChange(e.target.value)}
                        className="px-3 py-2 bg-white border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
                      >
                        {item.select.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {item.action && (
                      <Button 
                        variant={item.danger ? 'danger' : 'outline'} 
                        size="sm"
                        onClick={item.action}
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                  </div>
                  {idx < section.items.length - 1 && <ReceiptDivider />}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Card padding="p-5">
        <Button 
          variant="danger" 
          fullWidth 
          onClick={handleLogout} 
          icon={LogOut}
        >
          KELUAR DARI AKUN
        </Button>
      </Card>

      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">SISTEM KONFIGURASI</p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          PATUNGANYUK v1.0.0 • BUILD {new Date().getFullYear()}
        </p>
        <ReceiptDivider double />
      </div>

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

      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={doClearData}
        title="HAPUS SEMUA DATA"
        message="Yakin hapus semua data pengguna? Tindakan ini tidak dapat dibatalkan."
        confirmText="YA, HAPUS"
        cancelText="BATAL"
        danger={true}
      />
    </div>
  );
}