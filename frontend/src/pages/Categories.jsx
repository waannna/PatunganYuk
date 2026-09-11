// src/pages/Categories.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  Tag, Plus, ArrowLeft, Search, Trash2, Palette,
  Edit2, ArrowUpDown, X
} from 'lucide-react';
import { 
  Card, Button, Input, Badge, EmptyState, 
  LoadingSpinner, ReceiptDivider, Confetti, Select
} from '../components/ui';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useConfetti } from '../hooks/useConfetti';
import { getCategories } from '../services/api';

export default function Categories() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { confettiTrigger, fireConfetti } = useConfetti();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  
  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [colorCode, setColorCode] = useState('#1c1917');
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Confirm
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  // ==================== LOAD (SEARCH + SORT KE BACKEND) ====================
  const loadCategories = async (search = '', sort = 'name', dir = 'asc') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sort) params.append('sortBy', sort);
      if (dir) params.append('direction', dir);
      
      const res = await fetch(`${API_BASE}/categories?${params.toString()}`);
      const data = await res.json();
      if (data.data) setCategories(data.data);
    } catch (err) {
      addNotification('Gagal memuat kategori', 'error', 3000, 'ERROR');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories(searchQuery, sortBy, sortDir);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, sortDir]);

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDir(dir);
  };

  // ==================== HANDLERS ====================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification('Nama kategori harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.toUpperCase(), colorCode, isActive: true }),
      });
      setName('');
      setShowCreateModal(false);
      await loadCategories(searchQuery, sortBy, sortDir);
      addNotification(`Kategori "${name}" dibuat`, 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal membuat kategori', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      colorCode: cat.colorCode || '#1c1917',
      isActive: cat.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      addNotification('Nama kategori harus diisi', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategory.name.toUpperCase(),
          colorCode: editingCategory.colorCode,
          isActive: editingCategory.isActive
        }),
      });
      setShowEditModal(false);
      setEditingCategory(null);
      await loadCategories(searchQuery, sortBy, sortDir);
      addNotification('Kategori diperbarui', 'success', 3000, 'SUKSES');
      fireConfetti();
    } catch (err) {
      addNotification('Gagal memperbarui kategori', 'error', 3000, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, catName) => {
    setConfirmModal({
      isOpen: true,
      title: 'HAPUS KATEGORI',
      message: `Yakin hapus kategori "${catName}"?`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
          await loadCategories(searchQuery, sortBy, sortDir);
          addNotification(`Kategori "${catName}" dihapus`, 'success', 3000, 'SUKSES');
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          addNotification('Gagal menghapus kategori', 'error', 3000, 'ERROR');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Confetti trigger={confettiTrigger} />

      {/* HEADER */}
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">KATEGORI</h1>
        <p className="receipt-label mt-1">MANAJEMEN KATEGORI</p>
        <ReceiptDivider double />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">TOTAL</p>
            <p className="font-bold">{categories.length} KATEGORI</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">AKTIF</p>
            <p className="font-bold">{categories.filter(c => c.isActive).length}</p>
          </div>
        </div>
        <ReceiptDivider />
        
        {/* SEARCH + SORT + NEW */}
        <div className="px-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="CARI KATEGORI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="name-asc">NAMA A-Z</option>
              <option value="name-desc">NAMA Z-A</option>
              <option value="id-asc">TERLAMA</option>
              <option value="id-desc">TERBARU</option>
            </select>
          </div>
          <Button onClick={() => setShowCreateModal(true)} icon={Plus} size="sm">
            BARU
          </Button>
        </div>
      </div>

      {/* LIST */}
      <Card padding="p-5">
        <p className="receipt-label text-center mb-4">═══ DAFTAR KATEGORI ═══</p>
        
        {loading ? (
          <div className="py-8">
            <LoadingSpinner size="md" message="MEMUAT..." />
          </div>
        ) : categories.length > 0 ? (
          <div>
            {categories.map((c, idx) => (
              <div key={c.id}>
                <div className="flex items-center gap-3 py-3">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border-2 border-stone-900 flex-shrink-0"
                    style={{ backgroundColor: c.colorCode || '#1c1917' }}
                  >
                    <Tag size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold uppercase text-stone-900 truncate">
                        {c.name}
                      </p>
                      {c.isActive ? (
                        <Badge variant="success" size="sm">AKTIF</Badge>
                      ) : (
                        <Badge variant="default" size="sm">NONAKTIF</Badge>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                      WARNA: {c.colorCode || '#1c1917'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 text-stone-400 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {idx < categories.length - 1 && <ReceiptDivider />}
              </div>
            ))}

            <ReceiptDivider double />
            <div className="flex justify-between font-mono text-xs pt-2">
              <span className="font-bold uppercase">TOTAL KATEGORI</span>
              <span className="font-bold">{categories.length}</span>
            </div>
          </div>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title="TIDAK DITEMUKAN"
            description={`Tidak ada kategori "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon={Tag}
            title="BELUM ADA KATEGORI"
            description="Buat kategori pertama untuk mengelompokkan transaksi"
            actionLabel="TAMBAH KATEGORI"
            onAction={() => setShowCreateModal(true)}
          />
        )}
      </Card>

      {/* FOOTER */}
      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3"> MANAJEMEN KATEGORI </p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          PATUNGANYUK • {new Date().getFullYear()}
        </p>
        <ReceiptDivider double />
      </div>

      {/* ============ MODAL: CREATE ============ */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="KATEGORI BARU"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="NAMA KATEGORI"
            placeholder="CONTOH: MAKANAN"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={Tag}
          />
          <div className="space-y-1.5">
            <label className="receipt-label">WARNA LABEL</label>
            <div className="flex items-center gap-3 p-3 bg-stone-100 border-2 border-dashed border-stone-300">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-12 cursor-pointer border-2 border-stone-900 bg-transparent"
              />
              <div className="flex-1">
                <p className="font-mono text-xs font-bold uppercase">{colorCode}</p>
                <p className="text-[10px] font-mono text-stone-500">KLIK UNTUK UBAH WARNA</p>
              </div>
              <Palette size={20} className="text-stone-500" />
            </div>
          </div>
          <ReceiptDivider />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={submitting} icon={Plus}>
              TAMBAH
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============ MODAL: EDIT ============ */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="EDIT KATEGORI"
      >
        {editingCategory && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="NAMA KATEGORI"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
              icon={Tag}
            />
            <div className="space-y-1.5">
              <label className="receipt-label">WARNA LABEL</label>
              <div className="flex items-center gap-3 p-3 bg-stone-100 border-2 border-dashed border-stone-300">
                <input
                  type="color"
                  value={editingCategory.colorCode}
                  onChange={(e) => setEditingCategory({ ...editingCategory, colorCode: e.target.value })}
                  className="w-12 h-12 cursor-pointer border-2 border-stone-900 bg-transparent"
                />
                <div className="flex-1">
                  <p className="font-mono text-xs font-bold uppercase">{editingCategory.colorCode}</p>
                </div>
                <Palette size={20} className="text-stone-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="receipt-label">STATUS</label>
              <select
                value={editingCategory.isActive ? 'AKTIF' : 'NONAKTIF'}
                onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.value === 'AKTIF' })}
                className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
              </select>
            </div>
            <ReceiptDivider />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
                BATAL
              </Button>
              <Button type="submit" loading={submitting}>
                SIMPAN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============ CONFIRM ============ */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={true}
        loading={submitting}
      />
    </div>
  );
}