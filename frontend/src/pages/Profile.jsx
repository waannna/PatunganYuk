// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  ArrowLeft, User, Mail, Phone, Shield, Edit2, 
  LogOut, ChevronRight, Settings, HelpCircle,
  Receipt, Calendar
} from 'lucide-react';
import { 
  Card, Button, Input, Avatar, Badge, 
  ReceiptDivider, LoadingSpinner 
} from '../components/ui';
import ConfirmModal from '../components/ConfirmModal';
import { getGroups, getGroupExpenses, getUserFinancialSummary } from '../services/api';

export default function Profile({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [stats, setStats] = useState({
    groups: 0,
    transactions: 0,
    totalPaid: 0,
    totalPaidByOthers: 0,
    youllGet: 0,
    youllPay: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser?.name) return;
      setLoadingStats(true);
      try {
        const gRes = await getGroups('', '', '', currentUser.name, currentUser.email);
        const userGroups = gRes.data || [];
        
        let totalTransactions = 0;
        let totalPaid = 0;
        let totalPaidByOthers = 0;
        
        for (const group of userGroups) {
          try {
            const expRes = await getGroupExpenses(group.id, 'expenseDate', 'desc');
            const groupExpenses = expRes.data || [];
            
            groupExpenses.forEach(exp => {
              totalTransactions++;
              if (exp.paidBy === currentUser.name) {
                totalPaid += exp.amount || 0;
              } else {
                totalPaidByOthers += exp.amount || 0;
              }
            });
          } catch (err) {
            console.warn(`Gagal ambil grup ${group.id}`);
          }
        }

        const summaryRes = await getUserFinancialSummary(currentUser.name, currentUser.email);
        const summary = summaryRes.data || {};

        setStats({
          groups: userGroups.length,
          transactions: totalTransactions,
          totalPaid,
          totalPaidByOthers,
          youllGet: summary.youllGet || 0,
          youllPay: summary.youllPay || 0
        });
      } catch (err) {
        addNotification('Gagal memuat statistik profil', 'error', 3000, 'ERROR');
      } finally {
        setLoadingStats(false);
      }
    };
    
    loadStats();
  }, [currentUser]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification('Nama tidak boleh kosong', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setLoading(true);
    const updatedUser = { ...currentUser, name: name.trim(), phoneNumber: phone.trim() };
    localStorage.setItem('patunganyuk_user', JSON.stringify(updatedUser));
    addNotification('Profil diperbarui', 'success', 3000, 'SUKSES');
    setLoading(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const doLogout = () => {
    setConfirmLogout(false);
    onLogout();
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 
  }).format(val || 0);

  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">PROFIL</h1>
        <p className="receipt-label mt-1">KARTU ANGGOTA</p>
        <ReceiptDivider double />
        <div className="flex justify-center mb-3">
          <Avatar name={currentUser?.name} size="xl" className="border-4 border-stone-900" />
        </div>
        <p className="font-mono font-bold text-lg uppercase tracking-wider">
          {currentUser?.name}
        </p>
        <p className="receipt-label mt-1">{currentUser?.email}</p>
        {currentUser?.role === 'ADMIN' && (
          <div className="mt-2">
            <Badge variant="primary" size="md">ADMINISTRATOR</Badge>
          </div>
        )}
        <ReceiptDivider />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">SEJAK</p>
            <p className="font-bold">{memberSince}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">ID ANGGOTA</p>
            <p className="font-bold">#{String(currentUser?.id || '001').padStart(6, '0')}</p>
          </div>
        </div>
      </div>

      <Card padding="p-5">
        <p className="receipt-label text-center mb-3">═══ STATISTIK ANDA ═══</p>
        {loadingStats ? (
          <div className="py-4">
            <LoadingSpinner size="sm" message="MEMUAT..." />
          </div>
        ) : (
          <div className="font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-600">TOTAL GRUP ANDA</span>
              <span className="font-bold">{stats.groups}</span>
            </div>
            <ReceiptDivider />
            <div className="flex justify-between">
              <span className="text-stone-600">TOTAL TRANSAKSI</span>
              <span className="font-bold">{stats.transactions}</span>
            </div>
            <ReceiptDivider />
            <div className="flex justify-between">
              <span className="text-stone-600">ANDA BAYAR</span>
              <span className="font-bold text-red-800">{formatRupiah(stats.totalPaid)}</span>
            </div>
            <ReceiptDivider />
            <div className="flex justify-between">
              <span className="text-stone-600">ORANG LAIN BAYAR</span>
              <span className="font-bold text-emerald-800">{formatRupiah(stats.totalPaidByOthers)}</span>
            </div>
            <ReceiptDivider double />
            <div className="flex justify-between">
              <span className="text-stone-600">PIUTANG</span>
              <span className="font-bold text-emerald-800">{formatRupiah(stats.youllGet)}</span>
            </div>
            <ReceiptDivider />
            <div className="flex justify-between">
              <span className="text-stone-600">UTANG</span>
              <span className="font-bold text-red-800">{formatRupiah(stats.youllPay)}</span>
            </div>
          </div>
        )}
      </Card>

      <Card padding="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="receipt-label">═══ INFORMASI AKUN ═══</p>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} icon={Edit2}>
              EDIT
            </Button>
          )}
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          {isEditing ? (
            <>
              <Input 
                label="NAMA"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                icon={User}
              />
              <Input 
                label="NO. WHATSAPP"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="08123456789"
                icon={Phone}
              />
              <div className="space-y-1.5">
                <label className="receipt-label">EMAIL</label>
                <div className="px-3 py-2.5 bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-between">
                  <span className="font-mono text-sm text-stone-600">{currentUser?.email}</span>
                  <Badge variant="success" size="sm">TERVERIFIKASI</Badge>
                </div>
                <p className="text-[9px] font-mono text-stone-400 uppercase">EMAIL TIDAK DAPAT DIUBAH</p>
              </div>
              <ReceiptDivider />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="secondary" 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(currentUser?.name || '');
                    setPhone(currentUser?.phoneNumber || '');
                  }}
                >
                  BATAL
                </Button>
                <Button type="submit" loading={loading}>
                  SIMPAN
                </Button>
              </div>
            </>
          ) : (
            <div className="font-mono text-xs space-y-3">
              <div>
                <p className="receipt-label mb-1">NAMA</p>
                <p className="font-bold uppercase text-sm">{currentUser?.name}</p>
              </div>
              <ReceiptDivider />
              <div>
                <p className="receipt-label mb-1">EMAIL</p>
                <p className="font-bold">{currentUser?.email}</p>
              </div>
              <ReceiptDivider />
              <div>
                <p className="receipt-label mb-1">NO. WHATSAPP</p>
                <p className="font-bold uppercase">
                  {currentUser?.phoneNumber || '— BELUM DIISI —'}
                </p>
              </div>
            </div>
          )}
        </form>
      </Card>

      <Card padding="p-5">
        <p className="receipt-label text-center mb-3">═══ MENU ═══</p>
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between py-3 hover:bg-stone-100/50 -mx-2 px-2 transition-colors font-mono"
          >
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-stone-500" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase">PENGATURAN</p>
                <p className="text-[10px] text-stone-500">Preferensi dan konfigurasi</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </button>
          <ReceiptDivider />
          <button 
            onClick={() => navigate('/help')}
            className="w-full flex items-center justify-between py-3 hover:bg-stone-100/50 -mx-2 px-2 transition-colors font-mono"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-stone-500" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase">PUSAT BANTUAN</p>
                <p className="text-[10px] text-stone-500">FAQ dan panduan</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </button>
          <ReceiptDivider />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between py-3 hover:bg-red-50 -mx-2 px-2 transition-colors font-mono"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-red-700" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase text-red-700">KELUAR</p>
                <p className="text-[10px] text-red-500">Keluar dari akun Anda</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      </Card>

      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">KARTU ANGGOTA</p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">PATUNGANYUK v1.0.0 • {new Date().getFullYear()}</p>
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
    </div>
  );
}