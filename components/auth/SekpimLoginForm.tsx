// frontend/components/auth/SekpimLoginForm.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SekpimLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      const token = response.data.access_token;
      const role = user.role.toLowerCase();

      // PROTEKSI: Hanya izinkan pimpinan dan asisten
      if (role !== 'pimpinan' && role !== 'asisten') {
        setError('⚠️ Akses Ditolak: Gunakan Portal Umum untuk User Bagian.');
        setIsLoading(false);
        return;
      }

      Cookies.set('token', token, { expires: 1 });
      localStorage.setItem('user', JSON.stringify(user));
      
      window.location.href = '/sekpim/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.');
      setIsLoading(false); 
    } 
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          borderLeft: '4px solid #ef4444', 
          color: '#991b1b', 
          padding: '14px', 
          fontSize: '13px', 
          borderRadius: '8px', 
          fontWeight: 600 
        }}>
          {error}
        </div>
      )}
      
      <Input 
        label="Email Pimpinan/Asisten" 
        type="email" 
        placeholder="nama@jt.go.id" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      
      <Input 
        label="Password" 
        type="password" 
        placeholder="••••••••" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />

      <div style={{ marginTop: '10px' }}>
        <Button type="submit" isLoading={isLoading}>
          Sign In (Pimpinan & Asisten)
        </Button>
      </div>
    </form>
  );
}