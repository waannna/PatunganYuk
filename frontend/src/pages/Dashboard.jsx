// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { 
  ArrowUpRight, ArrowDownRight, Wallet,
  RefreshCw, Clock, Search, ChevronRight, User,
  Activity, Tag, Receipt, Coffee, ShoppingBag, Car, 
  Home as HomeIcon, Utensils, PieChart, ArrowUpDown
} from 'lucide-react';
import { 
  Card, Button, Badge, Input, Select, 
  EmptyState, ProgressBar,
  SkeletonCard, SkeletonTransaction, SkeletonChart,
  Confetti, TrendChart, ReceiptDivider
} from '../components/ui';
import { useConfetti } from '../hooks/useConfetti';
import { getGroups, getGroupExpenses } from '../services/api';

export default function Dashboard({ currentUser }) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { confettiTrigger, fireConfetti } = useConfetti();
  
  const [stats, setStats] = useState({
    totalPaidByUser: 0,
    totalPaidByOthers: 0,
    balance: 0,
    youllGet: 0,
    youllPay: 0,
    personalExpenses: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  // ==================== ICON KATEGORI ====================
  const getCategoryIcon = (category) => {
    const icons = {
      'Makanan': <Utensils size={14} />,
      'Transportasi': <Car size={14} />,
      'Harian': <ShoppingBag size={14} />,
      'Pendapatan': <Wallet size={14} />,
      'Rumah': <HomeIcon size={14} />,
      'Hiburan': <Coffee size={14} />,
    };
    return icons[category] || <Receipt size={14} />;
  };

  // ==================== FETCH DATA ====================
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    setError(null);
    
    try {
      // STEP 1: Ambil grup milik user
      const groupsRes = await getGroups('', '', '', currentUser?.name, currentUser?.email);
      const userGroups = groupsRes.data || [];
      
      // STEP 2: Loop tiap grup, ambil expense
      let allTransactions = [];
      let totalPaidByUser = 0;
      let totalPaidByOthers = 0;
      
      for (const group of userGroups) {
        try {
          const expRes = await getGroupExpenses(group.id, 'expenseDate', 'desc');
          const groupExpenses = expRes.data || [];
          
          groupExpenses.forEach(exp => {
            const amount = exp.amount || 0;
            
            // Bandingkan case-insensitive & trim
            const payerName = (exp.paidBy || '').trim().toLowerCase();
            const userName = (currentUser?.name || '').trim().toLowerCase();
            const isUserPaid = payerName === userName;
            
            // Hitung share user per expense
            const memberCount = group.memberCount || 1;
            const userShare = amount / memberCount;
            
            if (isUserPaid) {
              // User bayar full → user "menalangi" orang lain
              totalPaidByUser += amount - userShare;
            } else {
              // Orang lain bayar → user "berutang" share-nya
              totalPaidByOthers += userShare;
            }
            
            allTransactions.push({
              id: exp.id,
              title: exp.title,
              amount: amount,
              type: isUserPaid ? 'expense' : 'income',
              date: exp.expenseDate,
              category: exp.category || 'Lainnya',
              paidBy: exp.paidBy,
              groupId: group.id,
              groupName: group.name,
            });
          });
        } catch (err) {
          console.warn(`Gagal ambil expense grup ${group.id}:`, err);
        }
      }
      
      // STEP 3: Ambil summary user dari backend (sudah hitung settlements)
      const summaryRes = await fetch(
        `${API_BASE}/users/summary?name=${encodeURIComponent(currentUser?.name || '')}&email=${encodeURIComponent(currentUser?.email || '')}`
      );
      const summaryData = await summaryRes.json();
      
      const youllGet = summaryData.data?.youllGet || 0;
      const youllPay = summaryData.data?.youllPay || 0;
      const personalExpenses = summaryData.data?.personalExpenses || 0;
      
      // STEP 4: Set stats
      setStats({
        totalPaidByUser,
        totalPaidByOthers,
        balance: youllGet - youllPay,
        youllGet,
        youllPay,
        personalExpenses,
        transactions: allTransactions
      });

      calculateCategoryData(allTransactions);
      calculateTrendData(allTransactions);
      setLastUpdated(new Date());
      
      if (showRefreshIndicator) {
        addNotification('Data berhasil diperbarui', 'success', 3000, 'SUKSES');
        fireConfetti();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data dari server. Pastikan backend Java berjalan.');
      addNotification('Gagal memuat data dari server', 'error', 4000, 'ERROR');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateCategoryData = (transactions) => {
    const categories = {};
    const colors = {
      'Makanan': '#c2410c',
      'Transportasi': '#1e40af',
      'Harian': '#6b21a8',
      'Rumah': '#9f1239',
      'Hiburan': '#be185d',
      'Lainnya': '#44403c',
    };
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Lainnya';
        if (!categories[cat]) {
          categories[cat] = { name: cat, amount: 0, color: colors[cat] || '#44403c' };
        }
        categories[cat].amount += t.amount;
      });
    
    const total = Object.values(categories).reduce((sum, c) => sum + c.amount, 0);
    const categoryArray = Object.values(categories).map(c => ({
      ...c,
      percentage: total > 0 ? (c.amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
    
    setCategoryData(categoryArray);
  };

  const calculateTrendData = (transactions) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const now = new Date();
    const trend = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const total = transactions
        .filter(t => {
          if (!t.date) return false;
          const tDate = new Date(t.date);
          return tDate.getMonth() === month && tDate.getFullYear() === year && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      trend.push({ label: monthName, value: total });
    }
    
    setTrendData(trend);
  };

  // INITIAL FETCH
  useEffect(() => {
    if (currentUser) fetchDashboardData(false);
  }, [currentUser]);

  // LISTEN EVENT "refresh-dashboard" dari halaman lain
  useEffect(() => {
    const handleRefresh = () => {
      if (currentUser) fetchDashboardData(false);
    };
    
    window.addEventListener('refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('refresh-dashboard', handleRefresh);
  }, [currentUser]);

  // AUTO-REFRESH tiap 30 detik
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 
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

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // ==================== FILTER + SORT ====================
  const filteredAndSortedTransactions = (() => {
    let result = [...stats.transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.title?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q) ||
        tx.paidBy?.toLowerCase().includes(q) ||
        tx.groupName?.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        case 'title':
          valA = a.title?.toLowerCase() || '';
          valB = b.title?.toLowerCase() || '';
          break;
        case 'category':
          valA = a.category?.toLowerCase() || '';
          valB = b.category?.toLowerCase() || '';
          break;
        case 'date':
        default:
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  })();

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortField(field);
    setSortDir(dir);
  };

  const totalExpense = categoryData.reduce((sum, c) => sum + c.amount, 0);

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <SkeletonCard />
        <SkeletonChart />
        <SkeletonCard />
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <Card padding="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto border-2 border-dashed border-red-400 flex items-center justify-center mb-4">
              <span className="text-3xl">⚠</span>
            </div>
            <p className="receipt-label mb-2 text-red-700">KONEKSI GAGAL</p>
            <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-stone-900 mb-2">
              {error}
            </h3>
            <p className="font-mono text-[10px] text-stone-500 mb-4">
              PERIKSA KONEKSI BACKEND JAVA ANDA
            </p>
            <Button onClick={() => fetchDashboardData(true)} icon={RefreshCw}>
              COBA LAGI
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Confetti trigger={confettiTrigger} />

      {/* HEADER STRUK */}
      <div className="text-center py-6 receipt-paper receipt-shadow border border-stone-300/60 receipt-print">
        <h1 className="receipt-title text-2xl tracking-widest">PATUNGANYUK</h1>
        <p className="receipt-label mt-1">LAPORAN KEUANGAN PRIBADI</p>
        <ReceiptDivider double />
        <div className="px-5 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-left">
            <p className="text-stone-500">KASIR</p>
            <p className="font-bold uppercase">{currentUser?.name || 'USER'}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">WAKTU</p>
            <p className="font-bold">{lastUpdated ? formatTime(lastUpdated) : '--:--'}</p>
          </div>
          <div className="text-left">
            <p className="text-stone-500">TANGGAL</p>
            <p className="font-bold">{new Date().toLocaleDateString('id-ID').toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">NO. STRUK</p>
            <p className="font-bold">#{String(Date.now()).slice(-6)}</p>
          </div>
        </div>
        <ReceiptDivider />
        <div className="px-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => fetchDashboardData(true)} disabled={refreshing} icon={RefreshCw}>
            {refreshing ? 'MEMUAT...' : 'REFRESH'}
          </Button>
          <Badge variant="success" size="sm">● ONLINE</Badge>
        </div>
      </div>

      {/* POSISI ANDA */}
      <Card padding="p-5">
        <div className="text-center">
          <p className="receipt-label mb-2">═══ POSISI ANDA ═══</p>
          <p className={`font-mono font-bold text-3xl sm:text-4xl tracking-tight ${
            stats.balance >= 0 ? 'text-emerald-800' : 'text-red-800'
          }`}>
            {stats.balance >= 0 ? '+' : ''}{formatRupiah(stats.balance)}
          </p>
          <p className="font-mono text-[10px] text-stone-500 mt-1 uppercase">
            {stats.balance >= 0 
              ? 'ANDA AKAN MENERIMA LEBIH BANYAK' 
              : 'ANDA AKAN MEMBAYAR LEBIH BANYAK'}
          </p>
        </div>
        <ReceiptDivider />
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="receipt-label mb-1">PIUTANG</p>
            <p className="font-mono font-bold text-sm text-emerald-800">+{formatRupiah(stats.youllGet)}</p>
            <p className="font-mono text-[9px] text-stone-400 mt-0.5">HARUS DITERIMA</p>
          </div>
          <div className="text-center">
            <p className="receipt-label mb-1">UTANG</p>
            <p className="font-mono font-bold text-sm text-red-800">-{formatRupiah(stats.youllPay)}</p>
            <p className="font-mono text-[9px] text-stone-400 mt-0.5">HARUS DIBAYAR</p>
          </div>
        </div>
        <ReceiptDivider />
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="receipt-label mb-1">ANDA BAYAR</p>
            <p className="font-mono font-bold text-xs text-stone-900">
              {formatRupiah(stats.totalPaidByUser)}
            </p>
          </div>
          <div>
            <p className="receipt-label mb-1">ORANG LAIN BAYAR</p>
            <p className="font-mono font-bold text-xs text-stone-900">
              {formatRupiah(stats.totalPaidByOthers)}
            </p>
          </div>
        </div>
      </Card>

      {/* TREN 6 BULAN */}
      {trendData.length > 0 && trendData.some(t => t.value > 0) && (
        <Card padding="p-5">
          <div className="text-center mb-4">
            <p className="receipt-label">═══ TREN 6 BULAN ═══</p>
          </div>
          <TrendChart data={trendData} color="#1c1917" height={180} />
        </Card>
      )}

      {/* DONUT KATEGORI */}
      {categoryData.length > 0 && totalExpense > 0 && (
        <Card padding="p-5">
          <div className="text-center mb-4">
            <p className="receipt-label">═══ PENGELUARAN PER KATEGORI ═══</p>
            <p className="font-mono text-xs text-stone-500 mt-1">TOTAL: {formatRupiah(totalExpense)}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#e7e5e4" strokeWidth="20" />
                {(() => {
                  let cum = 0;
                  return categoryData.slice(0, 5).map((cat, idx) => {
                    const percent = (cat.amount / totalExpense) * 100;
                    const circumference = 2 * Math.PI * 60;
                    const dashArray = `${(percent / 100) * circumference} ${circumference}`;
                    const dashOffset = -((cum / 100) * circumference);
                    cum += percent;
                    return (
                      <circle 
                        key={idx} 
                        cx="80" cy="80" r="60" 
                        fill="none" 
                        stroke={cat.color} 
                        strokeWidth="20" 
                        strokeDasharray={dashArray} 
                        strokeDashoffset={dashOffset} 
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="receipt-label">TOTAL</p>
                <p className="font-mono font-bold text-sm text-stone-900">
                  {formatRupiah(totalExpense).replace('Rp', 'Rp ').split(',')[0]}
                </p>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-2">
              {categoryData.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-stone-400" style={{ backgroundColor: cat.color }} />
                    <span className="uppercase text-stone-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">{Math.round(cat.percentage)}%</span>
                    <span className="font-bold text-stone-900">{formatRupiah(cat.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TRANSAKSI */}
      <Card padding="p-5">
        <div className="text-center mb-4">
          <p className="receipt-label">═══ TRANSAKSI DARI GRUP ANDA ═══</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="CARI TRANSAKSI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none placeholder:text-stone-400"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none"
          >
            <option value="all">SEMUA</option>
            <option value="income">MASUK</option>
            <option value="expense">KELUAR</option>
          </select>
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <select
              value={`${sortField}-${sortDir}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-xs uppercase focus:border-stone-600 focus:border-solid focus:outline-none appearance-none"
            >
              <option value="date-desc">TERBARU</option>
              <option value="date-asc">TERLAMA</option>
              <option value="amount-desc">NOMINAL TERTINGGI</option>
              <option value="amount-asc">NOMINAL TERENDAH</option>
              <option value="title-asc">JUDUL A-Z</option>
              <option value="title-desc">JUDUL Z-A</option>
            </select>
          </div>
        </div>

        <ReceiptDivider />

        {filteredAndSortedTransactions.slice(0, 10).map((tx, idx) => (
          <div key={`${tx.groupId}-${tx.id}`}>
            <div className="py-2 font-mono">
              <div className="flex items-start gap-2">
                <div className="text-stone-400 mt-0.5">{getCategoryIcon(tx.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold uppercase text-stone-900 truncate">
                      {tx.title}
                    </span>
                    <span className={`text-xs font-bold ${
                      tx.type === 'expense' ? 'text-red-800' : 'text-emerald-800'
                    }`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                    <span className="truncate">
                      {tx.category} • {tx.paidBy} • {tx.groupName}
                    </span>
                    <span className="flex-shrink-0 ml-2">{formatDate(tx.date)}</span>
                  </div>
                </div>
              </div>
            </div>
            {idx < Math.min(filteredAndSortedTransactions.length, 10) - 1 && <ReceiptDivider />}
          </div>
        ))}

        {filteredAndSortedTransactions.length === 0 && (
          <EmptyState 
            icon={Receipt}
            title={searchQuery ? 'TIDAK DITEMUKAN' : 'BELUM ADA TRANSAKSI'}
            description={searchQuery 
              ? `Tidak ada transaksi "${searchQuery}"` 
              : 'Mulai catat pengeluaran pertama Anda'}
            actionLabel={searchQuery ? null : 'CATAT SEKARANG'}
            onAction={searchQuery ? null : () => navigate('/groups')}
          />
        )}

        {filteredAndSortedTransactions.length > 0 && (
          <>
            <ReceiptDivider />
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/activity')}>
                LIHAT SEMUA →
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* FOOTER */}
      <div className="text-center py-6 font-mono">
        <ReceiptDivider double />
        <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3"> TERIMA KASIH </p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          PATUNGANYUK • {new Date().getFullYear()}
        </p>
        <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
          *** HANYA DATA GRUP ANDA ***
        </p>
        <ReceiptDivider double />
      </div>
    </div>
  );
}