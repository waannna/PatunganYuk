import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import {
  Users, Plus, Search, UserPlus, Trash2, Edit2,
  ChevronRight, Wallet, CreditCard,
  ShoppingBag, Car, Home as HomeIcon, Utensils,
  Film, Plane, Gift, Zap, Receipt, Send, X, DollarSign,
  ArrowUpDown, Mail, Phone
} from 'lucide-react';

import {
  Card, Button, Input, Avatar, Badge,
  EmptyState, SkeletonCard, Confetti, ReceiptDivider
} from '../components/ui';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import ReceiptModal from '../components/ReceiptModal';
import { useConfetti } from '../hooks/useConfetti';
import {
  getGroups, createGroup, deleteGroup,
  getMembers, addMember, deleteMember,
  getGroupExpenses, createGroupExpense, updateGroupExpense,
  getGroupBalances, getGroupSettlements,
  settleDebt, deleteGroupExpense,
  getNonGroupExpenses, createNonGroupExpense,
  getCategories
} from '../services/api';

export default function Home({ currentUser }) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { confettiTrigger, fireConfetti } = useConfetti();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null, danger: false
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Makanan');
  const [editingGroup, setEditingGroup] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [settleFrom, setSettleFrom] = useState('');
  const [settleTo, setSettleTo] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const categoryIcons = {
    'Makanan': <Utensils size={16} />,
    'Transportasi': <Car size={16} />,
    'Hiburan': <Film size={16} />,
    'Perjalanan': <Plane size={16} />,
    'Belanja': <ShoppingBag size={16} />,
    'Hadiah': <Gift size={16} />,
    'Listrik': <Zap size={16} />,
    'Rumah': <HomeIcon size={16} />,
  };

  const currentUserEmail = currentUser?.email || '';
  const currentUserName = currentUser?.name || '';
  const selectedGroupId = selectedGroup?.id ?? null;

  const loadGroups = async (sortField = 'id', direction = 'desc') => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        getGroups('', sortField, direction, currentUserName, currentUserEmail),
        getCategories()
      ]);

      if (gRes.data) setGroups(gRes.data);
      if (cRes.data && cRes.data.length > 0) {
        setCategories(cRes.data);
        setNewExpenseCategory(cRes.data[0].name);
      }
    } catch (err) {
      addNotification('Gagal memuat grup dari server', 'error', 3000, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserName) return;
    loadGroups(sortBy, sortDir);
  }, [sortBy, sortDir, currentUserEmail, currentUserName]);

  const loadGroupDetail = async (group) => {
    if (!group) return;
    setLoadingDetail(true);
    try {
      if (group.id === null) {
        const res = await getNonGroupExpenses(currentUserEmail);
        if (res.data) setExpenses(res.data);
        setMembers([]); setSettlements([]); setBalanceData(null);
      } else {
        const [mRes, eRes, sRes, bRes] = await Promise.all([
          getMembers(group.id),
          getGroupExpenses(group.id, 'expenseDate', 'desc'),
          getGroupSettlements(group.id),
          getGroupBalances(group.id),
        ]);
        if (mRes.data) setMembers(mRes.data);
        if (eRes.data) setExpenses(eRes.data);
        if (sRes.data) setSettlements(sRes.data);
        if (bRes.data) setBalanceData(bRes.data);

        if (mRes.data && mRes.data.length > 0) {
          setNewExpensePaidBy(currentUserName || mRes.data[0].memberName);
          setSettleFrom(mRes.data[0].memberName);
          setSettleTo(mRes.data[1]?.memberName || mRes.data[0].memberName);
        }
      }
    } catch (err) {
      addNotification('Gagal memuat detail grup', 'error', 3000, 'ERROR');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId !== null) {
      loadGroupDetail(selectedGroup);
    }
  }, [selectedGroupId]);

  const filteredGroups = groups.filter(g => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q)
    );
  });

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDir(dir);
  };

  const openConfirm = (title, message, onConfirm, danger = false) => {
    setConfirmModal({
      isOpen: true, title, message, danger,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      addNotification('Nama grup harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      await createGroup({
        name: newGroupName,
        category: newGroupCategory,
        description: ''
      }, currentUserName, currentUserEmail);

      setNewGroupName('');
      setShowCreateGroup(false);
      await loadGroups(sortBy, sortDir);
      addNotification(`Grup "${newGroupName}" dibuat`, 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal membuat grup', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditGroup = (group, e) => {
    if (e) e.stopPropagation();
    setEditingGroup({
      id: group.id,
      name: group.name,
      category: group.category,
      description: group.description || ''
    });
    setShowEditGroup(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup) return;
    if (!editingGroup.name.trim()) {
      addNotification('Nama grup harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingGroup.name,
          category: editingGroup.category,
          description: editingGroup.description
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowEditGroup(false);
        setEditingGroup(null);
        await loadGroups(sortBy, sortDir);
        if (selectedGroup?.id === editingGroup.id) {
          setSelectedGroup({ ...selectedGroup, ...editingGroup });
        }
        addNotification('Grup diperbarui', 'success', 3000, 'SUKSES');
        fireConfetti();
      } else {
        addNotification(data.message || 'Gagal update grup', 'error', 3000, 'ERROR');
      }
    } catch (err) {
      addNotification('Gagal memperbarui grup', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = (groupId, groupName) => {
    openConfirm(
      'HAPUS GRUP',
      `Yakin hapus grup "${groupName}"? Semua data akan hilang permanen.`,
      async () => {
        try {
          await deleteGroup(groupId);
          if (selectedGroup?.id === groupId) setSelectedGroup(null);
          await loadGroups(sortBy, sortDir);
          addNotification(`Grup "${groupName}" dihapus`, 'success', 3000, 'SUKSES');
        } catch (err) {
          addNotification('Gagal menghapus grup', 'error', 3000, 'ERROR');
        }
      },
      true
    );
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !selectedGroup) {
      addNotification('Nama anggota harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addMember(selectedGroup.id, {
        memberName: newMemberName.trim(),
        email: '',
        phoneNumber: ''
      });

      if (res.status === 'success') {
        setNewMemberName('');
        setShowAddMember(false);
        await loadGroupDetail(selectedGroup);
        addNotification(`${newMemberName} ditambahkan`, 'success', 3000, 'SUKSES');
        fireConfetti();
      } else {
        addNotification(res.message || 'Gagal menambah anggota', 'error', 3000, 'ERROR');
      }
    } catch (err) {
      addNotification('Gagal menambah anggota', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditMember = (member) => {
    setEditingMember({
      id: member.id,
      memberName: member.memberName,
      email: member.email || '',
      phoneNumber: member.phoneNumber || ''
    });
    setShowEditMember(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember || !selectedGroup) return;
    if (!editingMember.memberName.trim()) {
      addNotification('Nama anggota harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/groups/${selectedGroup.id}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: editingMember.memberName,
          email: editingMember.email,
          phoneNumber: editingMember.phoneNumber
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowEditMember(false);
        setEditingMember(null);
        await loadGroupDetail(selectedGroup);
        addNotification('Anggota diperbarui', 'success', 3000, 'SUKSES');
        fireConfetti();
      } else {
        addNotification(data.message || 'Gagal update anggota', 'error', 3000, 'ERROR');
      }
    } catch (err) {
      addNotification('Gagal memperbarui anggota', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = (memberId, memberName) => {
    openConfirm(
      'KELUARKAN ANGGOTA',
      `Yakin keluarkan ${memberName} dari grup?`,
      async () => {
        try {
          await deleteMember(selectedGroup.id, memberId);
          await loadGroupDetail(selectedGroup);
          addNotification(`${memberName} dikeluarkan`, 'success', 3000, 'SUKSES');
        } catch (err) {
          addNotification('Gagal menghapus anggota', 'error', 3000, 'ERROR');
        }
      },
      true
    );
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) {
      addNotification('Deskripsi dan nominal harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: newExpenseTitle,
        amount: parseFloat(newExpenseAmount),
        paidBy: newExpensePaidBy || currentUserName || 'Anonim',
        category: newExpenseCategory || 'Lainnya',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: selectedGroup?.id === null ? 'Non-Group' : 'Group Split'
      };

      if (selectedGroup?.id === null) {
        await createNonGroupExpense(payload);
      } else {
        await createGroupExpense(selectedGroup.id, payload);
      }

      const expenseReceipt = {
        fromMember: payload.paidBy,
        toMember: selectedGroup?.name || 'PENGELUARAN',
        amount: parseFloat(newExpenseAmount),
        description: newExpenseTitle,
        groupName: selectedGroup?.name,
        paymentDate: new Date().toISOString(),
        method: 'CATAT PENGELUARAN',
        cashier: currentUserName
      };

      setNewExpenseTitle('');
      setNewExpenseAmount('');
      setShowAddExpense(false);
      await loadGroupDetail(selectedGroup);

      window.dispatchEvent(new Event('refresh-dashboard'));

      setReceiptData(expenseReceipt);
      setShowReceipt(true);

      addNotification('Pengeluaran tercatat!', 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal mencatat pengeluaran', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditExpense = (exp) => {
    setEditingExpense({
      id: exp.id,
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      paidBy: exp.paidBy,
      expenseDate: exp.expenseDate,
      notes: exp.notes || ''
    });
    setShowEditExpense(true);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (!editingExpense.title || !editingExpense.amount) {
      addNotification('Deskripsi dan nominal harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      await updateGroupExpense(selectedGroup.id, editingExpense.id, {
        title: editingExpense.title,
        amount: parseFloat(editingExpense.amount),
        paidBy: editingExpense.paidBy,
        category: editingExpense.category,
        expenseDate: editingExpense.expenseDate,
        notes: editingExpense.notes
      });

      setShowEditExpense(false);
      setEditingExpense(null);
      await loadGroupDetail(selectedGroup);

      window.dispatchEvent(new Event('refresh-dashboard'));

      addNotification('Transaksi diperbarui', 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal memperbarui transaksi', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = (expenseId, title) => {
    openConfirm(
      'HAPUS TRANSAKSI',
      `Yakin hapus transaksi "${title}"?`,
      async () => {
        try {
          await deleteGroupExpense(selectedGroup.id, expenseId);
          await loadGroupDetail(selectedGroup);

          window.dispatchEvent(new Event('refresh-dashboard'));

          addNotification('Transaksi dihapus', 'success', 3000, 'SUKSES');
        } catch (err) {
          addNotification('Gagal menghapus transaksi', 'error', 3000, 'ERROR');
        }
      },
      true
    );
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!settleFrom || !settleTo || !settleAmount) {
      addNotification('Semua field harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    if (settleFrom === settleTo) {
      addNotification('Pengirim dan penerima harus berbeda', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      await settleDebt(selectedGroup.id, {
        fromMember: settleFrom,
        toMember: settleTo,
        amount: parseFloat(settleAmount),
        paymentDate: new Date().toISOString().split('T')[0]
      });

      const settlementReceipt = {
        fromMember: settleFrom,
        toMember: settleTo,
        amount: parseFloat(settleAmount),
        description: 'PELUNASAN UTANG',
        groupName: selectedGroup?.name,
        paymentDate: new Date().toISOString(),
        method: 'TRANSFER',
        cashier: currentUserName
      };

      setSettleAmount('');
      setShowSettle(false);
      setShowGroupDetail(false);
      await loadGroupDetail(selectedGroup);

      window.dispatchEvent(new Event('refresh-dashboard'));

      setReceiptData(settlementReceipt);
      setShowReceipt(true);

      addNotification('Pelunasan berhasil dicatat!', 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal mencatat pelunasan', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplySuggestion = (item) => {
    setSettleFrom(item.from);
    setSettleTo(item.to);
    setSettleAmount(item.amount);
    setShowSettle(true);
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val || 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Confetti trigger={confettiTrigger} />

      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">GRUP SAYA</h1>
        <p className="receipt-label mt-1">DAFTAR GRUP PATUNGAN</p>
        <ReceiptDivider double />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">PEMILIK</p>
            <p className="font-bold uppercase">{currentUserName || 'USER'}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">TOTAL GRUP</p>
            <p className="font-bold">{filteredGroups.length}</p>
          </div>
        </div>
        <ReceiptDivider />
        <div className="px-5 grid grid-cols-2 sm:grid-cols-[1fr_auto_auto] gap-2">
          <div className="relative col-span-2 sm:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-10" />
            <input
              type="text"
              placeholder="CARI GRUP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none placeholder:text-stone-400"
            />
          </div>
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10" />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none appearance-none"
            >
              <option value="id-desc">TERBARU</option>
              <option value="id-asc">TERLAMA</option>
              <option value="name-asc">NAMA A-Z</option>
              <option value="name-desc">NAMA Z-A</option>
              <option value="category-asc">KATEGORI A-Z</option>
              <option value="category-desc">KATEGORI Z-A</option>
            </select>
          </div>
          <Button onClick={() => setShowCreateGroup(true)} icon={Plus} size="sm" fullWidth>
            BARU
          </Button>
        </div>
      </div>

      <Card padding="p-5">
        <p className="receipt-label text-center mb-3">═══ RINGKASAN ═══</p>
        <div className="font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-600">TOTAL GRUP</span>
            <span className="font-bold">{filteredGroups.length}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600">TOTAL TRANSAKSI</span>
            <span className="font-bold">{expenses.length}</span>
          </div>
          <ReceiptDivider />
          <div className="flex justify-between">
            <span className="text-stone-600">TOTAL PENGELUARAN</span>
            <span className="font-bold text-red-800">{formatRupiah(totalExpenses)}</span>
          </div>
        </div>
      </Card>

      <Card padding="p-0" className="overflow-hidden">
        <button
          onClick={() => {
            setSelectedGroup({ id: null, name: 'Pengeluaran Pribadi', category: 'Personal' });
            setShowGroupDetail(true);
          }}
          className="w-full p-4 text-left hover:bg-stone-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center bg-stone-800 text-amber-50 border-2 border-stone-900">
              <CreditCard size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold text-sm uppercase text-stone-900">
                PENGELUARAN PRIBADI
              </p>
              <p className="receipt-label mt-0.5">CATATAN TANPA GRUP</p>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </div>
        </button>
      </Card>

      <Card padding="p-5">
        <div className="text-center mb-4">
          <p className="receipt-label">═══ DAFTAR GRUP ═══</p>
        </div>

        {filteredGroups.length > 0 ? (
          <div className="space-y-2">
            {filteredGroups.map((group, idx) => (
              <div key={group.id}>
                <div
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowGroupDetail(true);
                  }}
                  className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-stone-100/50 -mx-2 px-2 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-stone-800 text-amber-50 border border-stone-900 flex-shrink-0">
                    {categoryIcons[group.category] || <Wallet size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-sm uppercase text-stone-900 truncate">
                      {group.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="receipt-label">KAT: {group.category}</span>
                      <span className="text-stone-300">•</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditGroup(group, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-blue-700 transition-all"
                      title="Edit Grup"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id, group.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-700 transition-all"
                      title="Hapus Grup"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <ChevronRight size={16} className="text-stone-400 flex-shrink-0" />
                </div>
                {idx < filteredGroups.length - 1 && <ReceiptDivider />}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title="TIDAK DITEMUKAN"
            description={`Tidak ada grup dengan kata kunci "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="BELUM ADA GRUP"
            description="Buat grup pertama untuk mulai patungan"
            actionLabel="BUAT GRUP"
            onAction={() => setShowCreateGroup(true)}
          />
        )}
      </Card>

      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">TERIMA KASIH</p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          PATUNGANYUK • {new Date().getFullYear()}
        </p>
        <ReceiptDivider double />
      </div>

      <Modal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} title="BUAT GRUP BARU">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="NAMA GRUP"
            placeholder="CONTOH: LIBURAN BALI 2026"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            icon={Users}
          />
          <div className="space-y-2">
            <label className="receipt-label">KATEGORI</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(categoryIcons).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewGroupCategory(cat)}
                  className={`
                    flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] uppercase tracking-wider transition-all
                    ${newGroupCategory === cat
                      ? 'border-stone-900 bg-stone-900 text-amber-50'
                      : 'border-dashed border-stone-300 bg-white text-stone-700 hover:border-stone-500'}
                  `}
                >
                  <span>{categoryIcons[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <ReceiptDivider />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreateGroup(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={submitting}>
              SIMPAN
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditGroup} onClose={() => setShowEditGroup(false)} title="EDIT GRUP">
        {editingGroup && (
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <Input
              label="NAMA GRUP"
              value={editingGroup.name}
              onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
              required
              icon={Users}
            />
            <div className="space-y-2">
              <label className="receipt-label">KATEGORI</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(categoryIcons).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditingGroup({ ...editingGroup, category: cat })}
                    className={`
                      flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] uppercase tracking-wider transition-all
                      ${editingGroup.category === cat
                        ? 'border-stone-900 bg-stone-900 text-amber-50'
                        : 'border-dashed border-stone-300 bg-white text-stone-700 hover:border-stone-500'}
                    `}
                  >
                    <span>{categoryIcons[cat]}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="DESKRIPSI"
              value={editingGroup.description}
              onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
              placeholder="OPSIONAL"
            />
            <ReceiptDivider />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditGroup(false)}>
                BATAL
              </Button>
              <Button type="submit" loading={submitting}>
                SIMPAN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={showGroupDetail && !!selectedGroup}
        onClose={() => setShowGroupDetail(false)}
        title={selectedGroup?.name?.toUpperCase() || 'DETAIL GRUP'}
        size="lg"
      >
        {loadingDetail ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center pb-3 border-b-2 border-dashed border-stone-300">
              <p className="receipt-label">DETAIL TRANSAKSI</p>
              <p className="font-mono font-bold text-sm uppercase mt-1">
                {selectedGroup?.name}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddExpense(true)}
                icon={Plus}
                className="flex-col py-3 h-auto"
              >
                <span className="text-[9px] mt-1">CATAT</span>
              </Button>
              {selectedGroup?.id !== null && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettle(true)}
                    icon={Send}
                    className="flex-col py-3 h-auto"
                  >
                    <span className="text-[9px] mt-1">LUNAS</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMember(true)}
                    icon={UserPlus}
                    className="flex-col py-3 h-auto"
                  >
                    <span className="text-[9px] mt-1">ANGGOTA</span>
                  </Button>
                </>
              )}
            </div>

            {selectedGroup?.id !== null && members.length > 0 && (
              <div>
                <p className="receipt-label mb-2">═══ ANGGOTA ({members.length}) ═══</p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="group flex items-center gap-2 bg-stone-100 hover:bg-stone-200 border border-dashed border-stone-300 pl-1 pr-2 py-1 transition-colors"
                    >
                      <Avatar name={m.memberName} size="sm" />
                      <span className="font-mono text-xs font-bold uppercase text-stone-800">
                        {m.memberName}
                      </span>
                      <button
                        onClick={() => handleOpenEditMember(m)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-blue-700 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id, m.memberName)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-700 transition-all"
                        title="Hapus"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {balanceData?.debtTransfers?.length > 0 && (
              <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-400">
                <p className="receipt-label text-amber-900 mb-2">⚡ SARAN PELUNASAN</p>
                <div className="space-y-2">
                  {balanceData.debtTransfers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-amber-200 px-3 py-2">
                      <div className="font-mono text-xs">
                        <span className="font-bold uppercase">{item.from}</span>
                        <span className="text-stone-400 mx-2">→</span>
                        <span className="font-bold uppercase">{item.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {formatRupiah(item.amount)}
                        </span>
                        <Button size="sm" onClick={() => handleApplySuggestion(item)}>
                          PAKAI
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="receipt-label mb-3">═══ TRANSAKSI ({expenses.length}) ═══</p>
              {expenses.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                  {expenses.slice(0, 20).map((exp, idx) => (
                    <div key={exp.id}>
                      <div className="flex items-center gap-2 py-2 font-mono">
                        <div className="w-8 h-8 flex items-center justify-center bg-stone-800 text-amber-50 border border-stone-900 flex-shrink-0">
                          {categoryIcons[exp.category] || <Receipt size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase text-stone-900 truncate">
                            {exp.title}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {exp.paidBy} • {exp.expenseDate} • {exp.category}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-1">
                          <p className="font-mono text-xs font-bold text-stone-900">
                            {formatRupiah(exp.amount)}
                          </p>
                          {selectedGroup?.id !== null && (
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1 text-stone-400 hover:text-blue-700 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.title)}
                            className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {idx < expenses.length - 1 && <ReceiptDivider />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Receipt size={24} className="text-stone-300 mx-auto mb-2" />
                  <p className="receipt-label">BELUM ADA TRANSAKSI</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="TAMBAH ANGGOTA">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="NAMA ANGGOTA"
            placeholder="CONTOH: BUDI SANTOSO"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            required
            icon={UserPlus}
          />
          <ReceiptDivider />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddMember(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={submitting} icon={UserPlus}>
              TAMBAH
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditMember} onClose={() => setShowEditMember(false)} title="EDIT ANGGOTA">
        {editingMember && (
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <Input
              label="NAMA ANGGOTA"
              value={editingMember.memberName}
              onChange={(e) => setEditingMember({ ...editingMember, memberName: e.target.value })}
              required
              icon={UserPlus}
            />
            <Input
              label="EMAIL (OPSIONAL)"
              type="email"
              value={editingMember.email}
              onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              placeholder="email@example.com"
              icon={Mail}
            />
            <Input
              label="NO. WHATSAPP (OPSIONAL)"
              value={editingMember.phoneNumber}
              onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })}
              placeholder="08123456789"
              icon={Phone}
            />
            <ReceiptDivider />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditMember(false)}>
                BATAL
              </Button>
              <Button type="submit" loading={submitting}>
                SIMPAN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="CATAT PENGELUARAN">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="DESKRIPSI"
            placeholder="CONTOH: MAKAN MALAM"
            value={newExpenseTitle}
            onChange={(e) => setNewExpenseTitle(e.target.value)}
            required
            icon={Receipt}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="NOMINAL"
              type="number"
              placeholder="0"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              required
              icon={DollarSign}
            />
            <div className="space-y-1.5">
              <label className="receipt-label">KATEGORI</label>
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedGroup?.id !== null && members.length > 0 && (
            <div className="space-y-1.5">
              <label className="receipt-label">DIBAYAR OLEH</label>
              <select
                value={newExpensePaidBy}
                onChange={(e) => setNewExpensePaidBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.memberName}>{m.memberName.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <ReceiptDivider />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddExpense(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={submitting}>
              SIMPAN
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditExpense} onClose={() => setShowEditExpense(false)} title="EDIT TRANSAKSI">
        {editingExpense && (
          <form onSubmit={handleUpdateExpense} className="space-y-4">
            <Input
              label="DESKRIPSI"
              value={editingExpense.title}
              onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
              required
              icon={Receipt}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="NOMINAL"
                type="number"
                value={editingExpense.amount}
                onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                required
                icon={DollarSign}
              />
              <div className="space-y-1.5">
                <label className="receipt-label">KATEGORI</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="receipt-label">DIBAYAR OLEH</label>
              <select
                value={editingExpense.paidBy}
                onChange={(e) => setEditingExpense({ ...editingExpense, paidBy: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.memberName}>{m.memberName.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <Input
              label="CATATAN"
              value={editingExpense.notes}
              onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
              placeholder="OPSIONAL"
            />
            <ReceiptDivider />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditExpense(false)}>
                BATAL
              </Button>
              <Button type="submit" loading={submitting}>
                SIMPAN PERUBAHAN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showSettle} onClose={() => setShowSettle(false)} title="PELUNASAN UTANG">
        <form onSubmit={handleSettle} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="receipt-label">DARI</label>
              <select
                value={settleFrom}
                onChange={(e) => setSettleFrom(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.memberName}>{m.memberName.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="receipt-label">KE</label>
              <select
                value={settleTo}
                onChange={(e) => setSettleTo(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.memberName}>{m.memberName.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="NOMINAL"
            type="number"
            placeholder="0"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            required
            icon={DollarSign}
          />
          <ReceiptDivider />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowSettle(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={submitting} icon={Send}>
              CATAT
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        loading={submitting}
      />

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptData={receiptData}
      />
    </div>
  );
}