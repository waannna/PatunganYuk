// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import MobileHeader from './components/MobileHeader';
import Footer from './components/Footer';
import Modal from './components/Modal';
import AIAssistant from './components/AIAssistant';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider, NotificationContainer, useNotification } from './hooks/useNotification';
import { Button, Input } from './components/ui';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Categories from './pages/Categories';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import HelpCenter from './pages/HelpCenter';
import { createIssueReport } from './services/api';

// ==================== PROTECTED ROUTE ====================
function ProtectedRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('patunganyuk_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-dashed border-stone-400 border-t-stone-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth" replace />;
  return children;
}

// ==================== ADMIN ROUTE ====================
function AdminRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('patunganyuk_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-dashed border-stone-400 border-t-stone-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

// ==================== APP CONTENT ====================
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const saved = localStorage.getItem('patunganyuk_user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/dashboard');
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('patunganyuk_user', JSON.stringify(user));
    addNotification(`Selamat datang, ${user.name}!`, 'success', 3000, 'SUKSES');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('patunganyuk_user');
    addNotification('Anda telah keluar', 'info', 3000, 'INFO');
    navigate('/auth');
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportDesc.trim()) {
      addNotification('Harap isi semua field', 'warning', 3000, 'PERINGATAN');
      return;
    }
    setReportLoading(true);
    try {
      const res = await createIssueReport({
        reporterEmail: currentUser?.email || 'anon@patunganyuk.com',
        subject: reportSubject,
        description: reportDesc
      });
      if (res.status === 'success') {
        addNotification('Laporan berhasil dikirim!', 'success', 3000, 'SUKSES');
        setIsReportModalOpen(false);
        setReportSubject('');
        setReportDesc('');
      } else {
        addNotification(res.message || 'Gagal mengirim laporan', 'error', 3000, 'ERROR');
      }
    } catch (err) {
      addNotification('Gagal terhubung ke server', 'error', 3000, 'ERROR');
    } finally {
      setReportLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isAuthRoute = location.pathname === '/auth';

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-200 flex flex-col justify-between font-mono text-stone-900">
        <main className="flex-grow flex items-center justify-center p-4">
          <Auth onLoginSuccess={handleLogin} />
        </main>
        <Footer />
        <NotificationContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-200 font-mono text-stone-900">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isAdmin={isAdmin}
      />

      <MobileHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isAdmin={isAdmin}
      />

      <main className={`flex-grow w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 ${
        !isAuthRoute ? 'pb-24 lg:pb-8' : ''
      }`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard currentUser={currentUser} /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Home currentUser={currentUser} /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile currentUser={currentUser} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings currentUser={currentUser} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {!isAuthRoute && currentUser && (
        <BottomNav currentUser={currentUser} isAdmin={isAdmin} />
      )}

      <div className="hidden lg:block">
        <Footer />
      </div>

      <NotificationContainer />
      {currentUser && <AIAssistant />}

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="LAPOR KENDALA">
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <Input
            label="SUBJEK MASALAH"
            type="text"
            required
            value={reportSubject}
            onChange={(e) => setReportSubject(e.target.value)}
            placeholder="JUDUL SINGKAT MASALAH"
          />
          <div className="space-y-1.5">
            <label className="receipt-label">RINCIAN KENDALA</label>
            <textarea
              required
              rows="4"
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/70 border-2 border-dashed border-stone-300 font-mono text-sm focus:border-stone-600 focus:border-solid focus:outline-none resize-none placeholder:text-stone-400 placeholder:italic"
              placeholder="JELASKAN MASALAH SECARA DETAIL..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t-2 border-dashed border-stone-300">
            <Button variant="secondary" type="button" onClick={() => setIsReportModalOpen(false)}>
              BATAL
            </Button>
            <Button type="submit" loading={reportLoading}>
              KIRIM
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==================== APP ====================
function App() {
  return (
    <NotificationProvider>
      <ScrollToTop />
      <AppContent />
    </NotificationProvider>
  );
}

export default App;