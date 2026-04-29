// frontend/components/auth/SekpimLoginForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { toast, Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function SekpimLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 🔥 STATE UNTUK INGAT SAYA 🔥
  const [rememberMe, setRememberMe] = useState(false);

  // Cek local storage saat dimuat
  useEffect(() => {
    const savedEmail = localStorage.getItem('vip_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loadToast = toast.loading('Memverifikasi otoritas VIP...');

    try {
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      const token = response.data.token || response.data.access_token;
      
      if (!token) throw new Error("Sistem gagal mendapatkan token keamanan dari server.");

      const role = user.role?.toLowerCase().trim() || '';
      if (role !== 'pimpinan' && role !== 'asisten' && role !== 'sekpim') {
        setError(`⚠️ Akses Ditolak: Akun ini tercatat sebagai "${role}", silakan gunakan Portal Umum.`);
        toast.error('Akses ditolak!', { id: loadToast });
        setIsLoading(false);
        return;
      }

      Cookies.set('token', token, { expires: 1, path: '/' });
      localStorage.setItem('user', JSON.stringify(user));
      
      // Simpan/Hapus Email VIP berdasarkan checkbox
      if (rememberMe) {
        localStorage.setItem('vip_remembered_email', email);
      } else {
        localStorage.removeItem('vip_remembered_email');
      }

      toast.success('Otorisasi Berhasil! Mengalihkan...', { id: loadToast });

      setTimeout(() => {
        window.location.href = '/sekpim/dashboard';
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Email atau password salah.');
      toast.error('Gagal masuk!', { id: loadToast });
      setIsLoading(false); 
    } 
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        .login-form { display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: var(--font-jakarta), sans-serif; }
        .input-wrapper { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .input-label { font-size: 13px; font-weight: 700; color: #334155; }
        
        .relative-box { 
          position: relative; width: 100%; display: flex; align-items: center; 
        }
        
        /* Aksen Border Biru Dongker untuk VIP */
        .custom-input {
          width: 100%;
          padding: 14px 44px 14px 16px; 
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .eye-button {
          position: absolute;
          right: 12px; 
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        .eye-button:hover { color: #0f172a; }

        .options-row { display: flex; justify-content: space-between; align-items: center; margin-top: -4px; flex-wrap: wrap; gap: 8px; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; }

        .forgot-btn {
          background: none; border: none; padding: 0; 
          font-size: 13px; color: #4f46e5; font-weight: 700; 
          cursor: pointer; font-family: inherit; transition: color 0.2s;
        }
        .forgot-btn:hover { color: #3730a3; text-decoration: underline; }

        /* Tombol Submit VIP (Indigo) */
        .btn-vip-submit {
          width: 100%; padding: 16px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
          color: white; font-weight: 800; font-size: 14px; cursor: pointer;
          transition: 0.3s; box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3);
          font-family: inherit; margin-top: 8px; display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        .btn-vip-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(67, 56, 202, 0.4); }
        .btn-vip-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        @media (max-width: 900px) {
          .custom-input { padding: 12px 40px 12px 14px; font-size: 13px; }
          .options-row { font-size: 12px !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

      {error && <div style={{ color: '#991b1b', fontSize: '13px', fontWeight: 600, background: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>{error}</div>}

      <div className="input-wrapper">
        <label className="input-label">Email Pimpinan/Asisten</label>
        <div className="relative-box">
          <input type="email" required placeholder="nama@jt.go.id" value={email} onChange={(e) => setEmail(e.target.value)} className="custom-input" />
        </div>
      </div>

      <div className="input-wrapper">
        <label className="input-label">Password</label>
        <div className="relative-box">
          <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="custom-input" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-button">
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="options-row">
        <label className="checkbox-label">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }} />
          Ingat Saya
        </label>
        {/* Tombol Lupa Password VIP */}
        <button type="button" onClick={() => router.push('/lupa-password-vip')} className="forgot-btn">
          Lupa Password?
        </button>
      </div>

      <button type="submit" disabled={isLoading} className="btn-vip-submit">
        {isLoading ? (
          <><div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Mengautentikasi...</>
        ) : (
          'Sign In (Pimpinan & Asisten)'
        )}
      </button>
    </form>
  );
}