// frontend/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Kirim data login ke API Laravel
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      const token = response.data.access_token;

      // ==========================================================
      // 2. LOGIKA VALIDASI ROLE (PAGAR BETIS)
      // ==========================================================
      // Kita pastikan role harus 'user_bagian' (case-sensitive sesuai database)
      if (user.role !== 'user_bagian') {
        setError('⚠️ AKSES DITOLAK: Portal ini khusus untuk User Unit Kerja/Bagian. Pimpinan, Asisten, dan Admin dilarang masuk melalui pintu ini.');
        setIsLoading(false);
        return; // BERHENTI: Token TIDAK disimpan, login digagalkan.
      }

      // ==========================================================
      // 3. JIKA LOLOS (User adalah user_bagian)
      // ==========================================================
      // Simpan token ke Cookies (berlaku 1 hari)
      Cookies.set('token', token, { expires: 1 });
      // Simpan data user ke LocalStorage untuk keperluan UI
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect ke Dashboard Utama secara refresh total (Hard Redirect)
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      // Menampilkan pesan error dari Laravel (misal: "Invalid credentials")
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
      setIsLoading(false); 
    } 
  };

  const handleLupaPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <form 
      onSubmit={handleLogin} 
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Alert Error Box */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          borderLeft: '4px solid #ef4444', 
          color: '#991b1b', 
          padding: '16px', 
          fontSize: '13px', 
          borderRadius: '8px', 
          fontWeight: 600, 
          lineHeight: 1.5 
        }}>
          {error}
        </div>
      )}

      <div>
        <Input
          label="Email Address"
          type="email"
          placeholder="staf_umum@jt.go.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div style={{ position: 'relative' }}>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
          <button 
            type="button" 
            onClick={handleLupaPassword}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#2563eb', 
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            Lupa Password?
          </button>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <Button type="submit" isLoading={isLoading}>
          Sign In (User Bagian)
        </Button>
      </div>
    </form>
  );
}