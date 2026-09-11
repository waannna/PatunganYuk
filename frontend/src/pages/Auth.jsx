// src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, Phone, ArrowRight, 
  Shield, CheckCircle, AlertCircle, Wallet, Fingerprint
} from 'lucide-react';
import { Card, Button, Input, Badge, ReceiptDivider } from '../components/ui';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phoneNumber: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (!isRegister) {
      setFormData(prev => ({
        ...prev,
        email: 'admin@patunganyuk.com',
        password: 'password123'
      }));
    }
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const endpoint = isRegister 
      ? `${API_BASE}/auth/register` 
      : `${API_BASE}/auth/login`;
    
    try {
      const res = await fetch(endpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      const json = await res.json();
      
      if (json.status === 'success') {
        if (isRegister) {
          setSuccessMsg('Akun berhasil dibuat! Silakan masuk.');
          setTimeout(() => {
            setIsRegister(false);
            setSuccessMsg('');
            setFormData({ ...formData, password: '' });
          }, 2500);
        } else {
          onLoginSuccess(json.data);
        }
      } else {
        setErrorMsg(json.message || 'Terjadi kesalahan sistem');
      }
    } catch (err) { 
      setErrorMsg('Gagal terhubung ke server. Periksa koneksi Anda.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-200">
      <div className="w-full max-w-md">
        
        {/* ==================== LOGO RECEIPT ==================== */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 border-2 border-stone-900 mb-3">
            <Wallet size={28} className="text-amber-50" />
          </div>
          <h1 className="font-mono font-bold text-2xl tracking-widest text-stone-900">
            PATUNGAN<span className="text-stone-500">YUK</span>
          </h1>
          <p className="receipt-label mt-1 tracking-[0.3em]">
             SISTEM PATUNGAN 
          </p>
        </div>

        {/* ==================== FORM CARD ==================== */}
        <div className="receipt-paper receipt-shadow border-2 border-stone-300 receipt-print">
          
          {/* Header */}
          <div className="text-center py-5 border-b-2 border-dashed border-stone-300">
            <p className="receipt-label mb-1">
              {isRegister ? 'PENDAFTARAN AKUN BARU' : 'MASUK KE AKUN'}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mx-5 mt-4 p-3 border-2 border-dashed border-red-400 bg-red-50">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-800">
                    ⚠ GAGAL
                  </p>
                  <p className="font-mono text-xs text-red-700 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMsg && (
            <div className="mx-5 mt-4 p-3 border-2 border-dashed border-emerald-400 bg-emerald-50">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    ✓ BERHASIL
                  </p>
                  <p className="font-mono text-xs text-emerald-700 mt-0.5">{successMsg}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {isRegister && (
              <Input 
                label="NAMA LENGKAP" 
                type="text" 
                required 
                placeholder="MASUKKAN NAMA LENGKAP" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                icon={User}
              />
            )}

            <Input 
              label="ALAMAT EMAIL" 
              type="email" 
              required 
              placeholder="NAMA@EMAIL.COM" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              icon={Mail}
            />

            <Input 
              label="KATA SANDI" 
              type="password" 
              required 
              placeholder={isRegister ? 'MINIMAL 6 KARAKTER' : 'MASUKKAN KATA SANDI'} 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              icon={Lock}
            />

            {isRegister && (
              <Input 
                label="NOMOR WHATSAPP" 
                type="text" 
                placeholder="08123456789" 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} 
                icon={Phone}
              />
            )}

            {!isRegister && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 border-2 border-stone-400 checked:bg-stone-900 focus:outline-none" 
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-600">
                    INGAT SAYA
                  </span>
                </label>
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-stone-500">
                  <Fingerprint size={10} /> AMAN
                </span>
              </div>
            )}

            <ReceiptDivider />

            <Button 
              type="submit" 
              loading={loading} 
              fullWidth 
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isRegister ? 'BUAT AKUN' : 'MASUK'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center px-5">
              <div className="w-full border-t border-dashed border-stone-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#fefcf7] font-mono text-[9px] uppercase tracking-widest text-stone-400">
                {isRegister ? 'SUDAH PUNYA AKUN?' : 'BELUM PUNYA AKUN?'}
              </span>
            </div>
          </div>

          {/* Toggle */}
          <div className="px-5 pb-5">
            <Button 
              variant="outline" 
              fullWidth 
              onClick={() => { 
                setIsRegister(!isRegister); 
                setErrorMsg('');
                setSuccessMsg('');
                setFormData({ ...formData, password: '' });
              }}
            >
              {isRegister ? '← MASUK' : 'DAFTAR BARU →'}
            </Button>
          </div>
        </div>

        {/* ==================== FOOTER STRUK ==================== */}
        <div className="text-center py-6 font-mono">
          <ReceiptDivider double />
          <p className="text-[10px] tracking-[0.3em] text-stone-500 mt-3">
             TERIMA KASIH 
          </p>
          <p className="text-[9px] text-stone-400 mt-1 tracking-widest">
            PATUNGANYUK • {new Date().getFullYear()}
          </p>
          <ReceiptDivider double />
        </div>
      </div>
    </div>
  );
}