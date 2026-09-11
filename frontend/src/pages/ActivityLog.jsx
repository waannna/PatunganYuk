import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  Activity, Clock, Search, Calendar, 
  Receipt, ShoppingBag, Car, 
  Home as HomeIcon, Utensils, Film, Plane, Gift, Zap,
  ArrowUpDown
} from 'lucide-react';
import { 
  Card, EmptyState, LoadingSpinner, ReceiptDivider
} from '../components/ui';
import { getGroups, getGroupExpenses } from '../services/api';

export default function ActivityLog() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expenseDate');
  const [sortDir, setSortDir] = useState('desc');

  const currentUser = JSON.parse(localStorage.getItem('patunganyuk_user') || '{}');

  const categoryIcons = {
    'Makanan': <Utensils size={12} />,
    'Transportasi': <Car size={12} />,
    'Hiburan': <Film size={12} />,
    'Perjalanan': <Plane size={12} />,
    'Belanja': <ShoppingBag size={12} />,
    'Hadiah': <Gift size={12} />,
    'Listrik': <Zap size={12} />,
    'Rumah': <HomeIcon size={12} />,
  };

  useEffect(() => {
    let cancelled = false;

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const gRes = await getGroups('', '', '', currentUser?.name, currentUser?.email);
        const userGroups = gRes.data || [];
        
        if (userGroups.length === 0) {
          if (!cancelled) {
            setActivities([]);
            setLoading(false);
          }
          return;
        }
        
        let combined = [];
        for (const group of userGroups) {
          try {
            const expRes = await getGroupExpenses(group.id, sortBy, sortDir);
            const groupExpenses = expRes.data || [];
            
            const withGroup = groupExpenses.map(exp => ({
              ...exp,
              groupName: group.name,
              groupId: group.id,
              type: 'expense'
            }));
            combined = combined.concat(withGroup);
          } catch (err) {
            console.warn(`Gagal ambil expense grup ${group.id}`);
          }
        }
        
        if (!cancelled) {
          setActivities(combined);
        }
      } catch (err) {
        if (!cancelled) {
          addNotification('Gagal memuat aktivitas', 'error', 3000, 'ERROR');
          setActivities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchActivities, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sortBy, sortDir]);

  const filteredActivities = activities.filter(act => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.title?.toLowerCase().includes(q) ||
      act.paidBy?.toLowerCase().includes(q) ||
      act.groupName?.toLowerCase().includes(q) ||
      act.category?.toLowerCase().includes(q)
    );
  });

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDir(dir);
  };

  const formatRupiah = (val) => 
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'HARI INI';
    if (date.toDateString() === yesterday.toDateString()) return 'KEMARIN';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const groupedActivities = filteredActivities.reduce((acc, act) => {
    const dateKey = formatDate(act.expenseDate);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(act);
    return acc;
  }, {});

  const totalAmount = filteredActivities.reduce((sum, a) => sum + (a.amount || 0), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
        <LoadingSpinner size="lg" message="MEMUAT AKTIVITAS..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">AKTIVITAS</h1>
        <p className="receipt-label mt-1">RIWAYAT TRANSAKSI ANDA</p>
        <ReceiptDivider double />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">USER</p>
            <p className="font-bold uppercase">{currentUser?.name || 'USER'}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">TOTAL</p>
            <p className="font-bold">{filteredActivities.length} TRANSAKSI</p>
          </div>
        </div>
        <ReceiptDivider />
        <div className="px-5 grid grid-cols-2 sm:grid-cols-[1fr_auto] gap-2">
          <div className="relative col-span-2 sm:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-10" />
            <input
              type="text"
              placeholder="CARI TRANSAKSI..."
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
              <option value="expenseDate-desc">TERBARU</option>
              <option value="expenseDate-asc">TERLAMA</option>
              <option value="amount-desc">NOMINAL TERTINGGI</option>
              <option value="amount-asc">NOMINAL TERENDAH</option>
              <option value="title-asc">JUDUL A-Z</option>
              <option value="title-desc">JUDUL Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <Card padding="p-5">
        <p className="receipt-label text-center mb-3">═══ RINGKASAN ═══</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="receipt-label mb-1">TOTAL TRANSAKSI</p>
            <p className="font-mono font-bold text-lg text-stone-900">
              {filteredActivities.length}
            </p>
          </div>
          <div>
            <p className="receipt-label mb-1">NILAI TOTAL</p>
            <p className="font-mono font-bold text-sm text-stone-900 pt-1">
              {formatRupiah(totalAmount)}
            </p>
          </div>
        </div>
      </Card>

      {Object.keys(groupedActivities).length > 0 ? (
        <Card padding="p-5">
          <p className="receipt-label text-center mb-4">═══ DETAIL TRANSAKSI ═══</p>
          
          {Object.entries(groupedActivities).map(([dateLabel, acts]) => (
            <div key={dateLabel} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={12} className="text-stone-500" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-stone-700">
                  {dateLabel}
                </span>
                <div className="flex-1 border-t border-dashed border-stone-300" />
              </div>

              <div className="space-y-1">
                {acts.map((act, idx) => (
                  <div key={`${act.groupId}-${act.id}`}>
                    <div className="flex items-start gap-2 py-2 font-mono">
                      <div className="w-8 h-8 flex items-center justify-center bg-stone-800 text-amber-50 border border-stone-900 flex-shrink-0">
                        {categoryIcons[act.category] || <Receipt size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase text-stone-900 truncate">
                          {act.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-stone-500">{act.paidBy}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[10px] text-stone-500 truncate">{act.groupName}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[10px] text-stone-500">{act.category}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={9} className="text-stone-400" />
                          <span className="text-[9px] text-stone-400">
                            {formatTime(act.expenseDate)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-mono text-xs font-bold ${
                          act.paidBy === currentUser?.name ? 'text-red-800' : 'text-emerald-800'
                        }`}>
                          {formatRupiah(act.amount)}
                        </p>
                      </div>
                    </div>
                    {idx < acts.length - 1 && <ReceiptDivider />}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <ReceiptDivider double />
          <div className="flex justify-between font-mono text-xs pt-2">
            <span className="font-bold uppercase">TOTAL KESELURUHAN</span>
            <span className="font-bold text-stone-900">{formatRupiah(totalAmount)}</span>
          </div>
        </Card>
      ) : searchQuery ? (
        <Card padding="p-0">
          <EmptyState 
            icon={Search}
            title="TIDAK DITEMUKAN"
            description={`Tidak ada transaksi dengan kata kunci "${searchQuery}"`}
          />
        </Card>
      ) : (
        <Card padding="p-0">
          <EmptyState 
            icon={Activity}
            title="BELUM ADA AKTIVITAS"
            description="Anda belum punya transaksi di grup manapun"
            actionLabel="BUAT GRUP"
            onAction={() => navigate('/groups')}
          />
        </Card>
      )}

      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">TERIMA KASIH</p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">PATUNGANYUK • {new Date().getFullYear()}</p>
        <ReceiptDivider double />
      </div>
    </div>
  );
}