// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  ArrowLeft, Users, Layers, DollarSign, Activity, 
  AlertTriangle, RefreshCw, Search, Trash2, CheckCircle,
  Shield, Receipt, Edit2, ArrowUpDown, X, Mail
} from 'lucide-react';
import { 
  Card, Button, Input, Badge, EmptyState, 
  LoadingSpinner, ReceiptDivider, Confetti 
} from '../components/ui';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useConfetti } from '../hooks/useConfetti';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { confettiTrigger, fireConfetti } = useConfetti();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Search & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  
  // Edit User Modal
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null, danger: false
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  // ==================== LOAD DATA ====================
  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, gRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/users`), 
        fetch(`${API_BASE}/groups`), 
        fetch(`${API_BASE}/reports`)
      ]);
      const uData = await uRes.json(); 
      const gData = await gRes.json(); 
      const tData = await tRes.json();
      
      const allUsers = uData.data || [];
      const allGroups = gData.data || [];
      const allTickets = tData.data || [];
      
      setUsers(allUsers);
      setGroups(allGroups);
      setTickets(allTickets);
      
      // Aggregate expenses dari semua grup
      let allExpenses = [];
      for (const group of allGroups) {
        try {
          const expRes = await fetch(`${API_BASE}/groups/${group.id}/expenses`);
          const expData = await expRes.json();
          if (expData.data) {
            const withGroup = expData.data.map(exp => ({
              ...exp,
              groupName: group.name,
              groupId: group.id
            }));
            allExpenses = allExpenses.concat(withGroup);
          }
        } catch (err) {
          console.warn(`Gagal ambil expense grup ${group.id}:`, err);
        }
      }
      
      allExpenses.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
      setExpenses(allExpenses);
      
    } catch (err) { 
      console.error('Error loading admin data:', err);
      addNotification('Gagal memuat data dari server', 'error', 3000, 'ERROR');
    } finally { 
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ==================== HANDLERS ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    addNotification('Data diperbarui', 'success', 2000, 'SUKSES');
    fireConfetti();
  };

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDir(dir);
  };

  // ---------- DELETE USER ----------
  const handleDeleteUser = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      title: 'HAPUS PENGGUNA',
      message: `Yakin hapus pengguna "${userName}"?\nSemua data terkait akan hilang.`,
      danger: true,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
          await loadData();
          addNotification('Pengguna dihapus', 'success', 3000, 'SUKSES');
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          addNotification('Gagal menghapus pengguna', 'error', 3000, 'ERROR');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // ---------- EDIT USER ----------
  const handleOpenEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'USER',
      phoneNumber: user.phoneNumber || ''
    });
    setShowEditUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUser.name.trim()) {
      addNotification('Nama tidak boleh kosong', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          phoneNumber: editingUser.phoneNumber
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowEditUser(false);
        setEditingUser(null);
        await loadData();
        addNotification('Pengguna diperbarui', 'success', 3000, 'SUKSES');
        fireConfetti();
      } else {
        addNotification(data.message || 'Gagal update', 'error', 3000, 'ERROR');
      }
    } catch (err) {
      addNotification('Gagal memperbarui pengguna', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- DELETE GROUP ----------
  const handleDeleteGroup = (groupId, groupName) => {
    setConfirmModal({
      isOpen: true,
      title: 'HAPUS GRUP',
      message: `Yakin hapus grup "${groupName}"?\nSemua transaksi di dalamnya akan hilang.`,
      danger: true,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await fetch(`${API_BASE}/groups/${groupId}`, { method: 'DELETE' });
          await loadData();
          addNotification('Grup dihapus', 'success', 3000, 'SUKSES');
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          addNotification('Gagal menghapus grup', 'error', 3000, 'ERROR');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // ---------- RESOLVE TICKET ----------
  const handleResolveTicket = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'SELESAIKAN LAPORAN',
      message: 'Tandai laporan ini sebagai selesai?',
      danger: false,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await fetch(`${API_BASE}/reports/${id}/toggle`, { method: 'PUT' });
          setTickets(tickets.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
          addNotification('Laporan diselesaikan', 'success', 3000, 'SUKSES');
          fireConfetti();
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          addNotification('Gagal menyelesaikan laporan', 'error', 3000, 'ERROR');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // ==================== STATS ====================
  const totalMoney = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalUsers = users.length;
  const totalGroups = groups.length;
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;

  const formatRupiah = (val) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

  // ==================== FILTER + SORT ====================
  const applyFilterSort = (data, searchFields) => {
    let result = [...data];
    
    // Filter search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(q)
        )
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'email':
          valA = (a.email || '').toLowerCase();
          valB = (b.email || '').toLowerCase();
          break;
        case 'id':
        default:
          valA = a.id || 0;
          valB = b.id || 0;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  };

  const filteredUsers = applyFilterSort(users, ['name', 'email']);
  const filteredGroups = applyFilterSort(groups, ['name', 'category']);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
        <LoadingSpinner size="lg" message="MEMUAT DATA ADMIN..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Confetti trigger={confettiTrigger} />

      {/* HEADER STRUK */}
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">ADMIN CONSOLE</h1>
        <p className="receipt-label mt-1">PANEL ADMINISTRATOR</p>
        <ReceiptDivider double />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">ADMIN</p>
            <p className="font-bold uppercase">SISTEM</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">WAKTU</p>
            <p className="font-bold">
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <ReceiptDivider />
        <div className="px-5 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
            KEMBALI
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} icon={RefreshCw} className="flex-1">
            {refreshing ? 'MEMUAT...' : 'REFRESH DATA'}
          </Button>
        </div>
      </div>

      {/* STATS STRUK */}
      <Card padding="p-5">
        <p className="receipt-label text-center mb-4">═══ STATISTIK SISTEM ═══</p>
        <div className="font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-600 flex items-center gap-2">
              <Users size={12} /> TOTAL PENGGUNA
            </span>
            <span className="font-bold">{totalUsers}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600 flex items-center gap-2">
              <Layers size={12} /> TOTAL GRUP
            </span>
            <span className="font-bold">{totalGroups}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600 flex items-center gap-2">
              <Activity size={12} /> TOTAL TRANSAKSI
            </span>
            <span className="font-bold">{expenses.length}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600 flex items-center gap-2">
              <DollarSign size={12} /> PERPUTARAN UANG
            </span>
            <span className="font-bold">{formatRupiah(totalMoney)}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600 flex items-center gap-2">
              <AlertTriangle size={12} /> LAPORAN TERBUKA
            </span>
            <span className={`font-bold ${openTickets > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {openTickets} / {totalTickets}
            </span>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <Card padding="p-0">
        <div className="flex border-b-2 border-dashed border-stone-300 overflow-x-auto">
          {[
            { id: 'overview', label: 'RINGKASAN', icon: '📊' },
            { id: 'users', label: 'PENGGUNA', icon: '👥' },
            { id: 'groups', label: 'GRUP', icon: '📁' },
            { id: 'tickets', label: 'LAPORAN', icon: '🎫' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`
                flex-1 min-w-fit px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors
                ${activeTab === tab.id 
                  ? 'bg-stone-900 text-amber-50' 
                  : 'text-stone-500 hover:bg-stone-100'}
              `}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH & SORT BAR */}
        {(activeTab === 'users' || activeTab === 'groups') && (
          <div className="p-5 border-b-2 border-dashed border-stone-300 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? 'CARI NAMA / EMAIL...' : 'CARI NAMA / KATEGORI...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none placeholder:text-stone-400"
              />
            </div>
            <div className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none appearance-none"
              >
                <option value="id-desc">TERBARU</option>
                <option value="id-asc">TERLAMA</option>
                <option value="name-asc">NAMA A-Z</option>
                <option value="name-desc">NAMA Z-A</option>
                {activeTab === 'users' && (
                  <>
                    <option value="email-asc">EMAIL A-Z</option>
                    <option value="email-desc">EMAIL Z-A</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <p className="receipt-label text-center">═══ RINGKASAN CEPAT ═══</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-stone-100 border border-dashed border-stone-300">
                  <p className="receipt-label mb-1">PENGGUNA</p>
                  <p className="font-mono font-bold text-2xl">{totalUsers}</p>
                </div>
                <div className="text-center p-3 bg-stone-100 border border-dashed border-stone-300">
                  <p className="receipt-label mb-1">GRUP</p>
                  <p className="font-mono font-bold text-2xl">{totalGroups}</p>
                </div>
                <div className="text-center p-3 bg-stone-100 border border-dashed border-stone-300">
                  <p className="receipt-label mb-1">TRANSAKSI</p>
                  <p className="font-mono font-bold text-2xl">{expenses.length}</p>
                </div>
                <div className="text-center p-3 bg-stone-100 border border-dashed border-stone-300">
                  <p className="receipt-label mb-1">LAPORAN</p>
                  <p className="font-mono font-bold text-2xl">{totalTickets}</p>
                </div>
              </div>

              <ReceiptDivider double />

              <p className="receipt-label text-center">═══ AKTIVITAS TERBARU ═══</p>
              <div className="space-y-1">
                {expenses.slice(0, 5).map((exp, idx) => (
                  <div key={`${exp.groupId}-${exp.id}`}>
                    <div className="flex justify-between py-2 font-mono">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase text-stone-900 truncate">{exp.title}</p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {exp.paidBy} • {exp.category} • {exp.groupName}
                        </p>
                      </div>
                      <p className="font-mono text-xs font-bold text-stone-900 flex-shrink-0 ml-2">
                        {formatRupiah(exp.amount)}
                      </p>
                    </div>
                    {idx < 4 && <ReceiptDivider />}
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-center py-4 font-mono text-xs text-stone-400">
                    BELUM ADA TRANSAKSI
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============ USERS ============ */}
          {activeTab === 'users' && (
            <div>
              {filteredUsers.length > 0 ? (
                <div>
                  {filteredUsers.map((u, idx) => (
                    <div key={u.id}>
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-stone-800 text-amber-50 border border-stone-900 flex-shrink-0">
                          <span className="font-mono font-bold text-sm">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs font-bold uppercase text-stone-900 truncate">
                              {u.name}
                            </p>
                            {u.role === 'ADMIN' && (
                              <Badge variant="primary" size="sm">ADMIN</Badge>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-stone-500 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 text-stone-400 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {idx < filteredUsers.length - 1 && <ReceiptDivider />}
                    </div>
                  ))}
                  <ReceiptDivider double />
                  <div className="flex justify-between pt-2 font-mono text-xs">
                    <span className="font-bold uppercase">TOTAL</span>
                    <span className="font-bold">{filteredUsers.length} PENGGUNA</span>
                  </div>
                </div>
              ) : searchTerm ? (
                <EmptyState
                  icon={Search}
                  title="TIDAK DITEMUKAN"
                  description={`Tidak ada pengguna "${searchTerm}"`}
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="TIDAK ADA PENGGUNA"
                  description="Belum ada pengguna terdaftar"
                />
              )}
            </div>
          )}

          {/* ============ GROUPS ============ */}
          {activeTab === 'groups' && (
            <div>
              {filteredGroups.length > 0 ? (
                <div>
                  {filteredGroups.map((g, idx) => (
                    <div key={g.id}>
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-stone-800 text-amber-50 border border-stone-900 flex-shrink-0">
                          <Layers size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs font-bold uppercase text-stone-900 truncate">
                            {g.name}
                          </p>
                          <p className="font-mono text-[10px] text-stone-500">
                            KATEGORI: {g.category} • ID: #{g.id}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(g.id, g.name)}
                          className="p-2 text-stone-400 hover:text-red-700 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {idx < filteredGroups.length - 1 && <ReceiptDivider />}
                    </div>
                  ))}
                  <ReceiptDivider double />
                  <div className="flex justify-between pt-2 font-mono text-xs">
                    <span className="font-bold uppercase">TOTAL</span>
                    <span className="font-bold">{filteredGroups.length} GRUP</span>
                  </div>
                </div>
              ) : searchTerm ? (
                <EmptyState
                  icon={Search}
                  title="TIDAK DITEMUKAN"
                  description={`Tidak ada grup "${searchTerm}"`}
                />
              ) : (
                <EmptyState
                  icon={Layers}
                  title="TIDAK ADA GRUP"
                  description="Belum ada grup dibuat"
                />
              )}
            </div>
          )}

          {/* ============ TICKETS ============ */}
          {activeTab === 'tickets' && (
            <div>
              {tickets.length > 0 ? (
                <div>
                  {tickets.map((t, idx) => (
                    <div key={t.id}>
                      <div className="py-3 font-mono">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase text-stone-900">
                              {t.subject}
                            </p>
                            <p className="text-[10px] text-stone-500 mt-0.5">
                              {t.reporterEmail || t.user}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {t.reportDate || t.date}
                            </p>
                          </div>
                          <Badge 
                            variant={t.status === 'OPEN' ? 'warning' : 'success'} 
                            size="sm"
                          >
                            {t.status === 'OPEN' ? '● TERBUKA' : '✓ SELESAI'}
                          </Badge>
                        </div>
                        {t.description && (
                          <div className="mt-2 pl-3 border-l-2 border-dashed border-stone-300">
                            <p className="font-mono text-[10px] text-stone-600 leading-relaxed">
                              {t.description}
                            </p>
                          </div>
                        )}
                        {t.status === 'OPEN' && (
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleResolveTicket(t.id)}
                              icon={CheckCircle}
                            >
                              SELESAIKAN
                            </Button>
                          </div>
                        )}
                      </div>
                      {idx < tickets.length - 1 && <ReceiptDivider />}
                    </div>
                  ))}
                  <ReceiptDivider double />
                  <div className="flex justify-between pt-2 font-mono text-xs">
                    <span className="font-bold uppercase">TOTAL LAPORAN</span>
                    <span className="font-bold">{tickets.length}</span>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={AlertTriangle}
                  title="TIDAK ADA LAPORAN"
                  description="Belum ada laporan kendala dari pengguna"
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ============ MODAL: EDIT USER ============ */}
      <Modal
        isOpen={showEditUser}
        onClose={() => setShowEditUser(false)}
        title="EDIT PENGGUNA"
      >
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Input
              label="NAMA LENGKAP"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              required
              icon={Users}
            />
            <Input
              label="EMAIL"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              required
              icon={Mail}
            />
            <Input
              label="NO. WHATSAPP"
              value={editingUser.phoneNumber}
              onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
              placeholder="08123456789"
            />
            <div className="space-y-1.5">
              <label className="receipt-label">ROLE</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <ReceiptDivider />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditUser(false)}>
                BATAL
              </Button>
              <Button type="submit" loading={submitting}>
                SIMPAN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============ CONFIRM MODAL ============ */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        loading={submitting}
      />
    </div>
  );
}