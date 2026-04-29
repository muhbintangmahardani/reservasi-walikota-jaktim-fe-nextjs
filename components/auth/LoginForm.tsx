// frontend/components/auth/LoginForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { toast, Toaster } from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadToast = toast.loading('Memverifikasi...');
    try {
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      const token = response.data.token || response.data.access_token;
      if (user?.role?.toLowerCase() !== 'user_bagian') {
        setError("Akses Ditolak! Khusus Portal Unit Kerja.");
        toast.error('Akses ditolak!', { id: loadToast });
        setIsLoading(false); return;
      }
      document.cookie = `token=${token}; path=/; max-age=86400`;
      localStorage.setItem('user', JSON.stringify(user));
      if (rememberMe) { localStorage.setItem('remembered_email', email); } 
      else { localStorage.removeItem('remembered_email'); }
      toast.success('Login Berhasil!', { id: loadToast });
      setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    } catch (err: any) {
      setError('Email atau password salah.');
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
        .custom-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

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

        /* 🔥 PERBAIKAN TOMBOL LUPA PASSWORD 🔥 */
        .forgot-btn {
          background: none; border: none; padding: 0; 
          font-size: 13px; color: #2563eb; font-weight: 700; 
          cursor: pointer; font-family: inherit; transition: color 0.2s;
        }
        .forgot-btn:hover { color: #1d4ed8; text-decoration: underline; }

        @media (max-width: 900px) {
          .custom-input { padding: 12px 40px 12px 14px; font-size: 13px; }
          .options-row { font-size: 12px !important; }
        }
      `}} />

      {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600, background: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>⚠️ {error}</div>}

      <div className="input-wrapper">
        <label className="input-label">Email Address</label>
        <div className="relative-box">
          <input type="email" required placeholder="staf_umum@jt.go.id" value={email} onChange={(e) => setEmail(e.target.value)} className="custom-input" />
        </div>
      </div>

      <div className="input-wrapper">
        <label className="input-label">Kata Sandi</label>
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
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#2563eb', width: '16px', height: '16px' }} />
          Ingat Saya
        </label>
        {/* KEMBALIKAN FUNGSI ROUTER PUSH */}
        <button type="button" onClick={() => router.push('/forgot-password')} className="forgot-btn">
          Lupa Password?
        </button>
      </div>

      <Button type="submit" isLoading={isLoading} style={{ borderRadius: '12px', padding: '14px', fontWeight: 800, marginTop: '8px' }}>Sign In (User Bagian)</Button>
    </form>
  );
}