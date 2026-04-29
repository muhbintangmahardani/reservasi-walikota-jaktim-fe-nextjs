// frontend/app/login-admin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';

export default function LoginAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadToast = toast.loading('Memverifikasi otoritas Admin...');

    try {
      const response = await api.post('/login', { email, password });
      
      const { token, user } = response.data;

      // 🛡️ PROTEKSI EKSTRA: Pastikan yang login BENAR-BENAR ADMIN KOMINFOTIK
      const userRole = user?.role?.toLowerCase().trim() || '';

      if (userRole !== 'admin_kominfotik') {
        toast.error(`Akses Ditolak! Anda tercatat sebagai: "${user?.role || 'Tidak ada role'}"`, { id: loadToast });
        setIsLoading(false);
        return; 
      }

      // Jika lolos, simpan sesi
      document.cookie = `token=${token}; path=/; max-age=86400`;
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Otorisasi Berhasil. Selamat Datang, Admin!', { id: loadToast });

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email atau Password salah.', { id: loadToast });
      setIsLoading(false);
    }
  };

  return (
    <div className="split-wrapper">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        /* ========================================= */
        /* BASE WRAPPER CERAH (KONSISTEN)            */
        /* ========================================= */
        .split-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc; 
          padding: 24px;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .split-card {
          display: flex;
          width: 100%;
          max-width: 1000px;
          background: #ffffff;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08); 
          border: 1px solid #e2e8f0;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* SISI KIRI: Branding Admin (Warna Dark Slate) */
        .split-left {
          flex: 1.1;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .glow-effect {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(79,70,229,0.3) 0%, rgba(0,0,0,0) 70%);
          top: -50px;
          left: -50px;
          border-radius: 50%;
          z-index: 0;
        }

        .logo-jaktim {
          width: 120px; 
          height: auto;
          margin-bottom: 24px;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3));
          z-index: 1;
        }

        .left-content { z-index: 1; }

        /* SISI KANAN: Form */
        .split-right {
          flex: 1;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #ffffff;
        }

        /* 🔥 Dibuat rata kiri (text-align: left) 🔥 */
        .form-header { margin-bottom: 32px; text-align: left; }
        .form-header h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .form-header p { font-size: 15px; color: #64748b; margin: 0; }

        .form-group { margin-bottom: 24px; }
        .form-group label { display: block; font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 10px; text-align: left; }
        
        .form-input { 
          display: block;
          width: 100%; 
          max-width: 100%;
          height: 52px; 
          padding: 0 16px; 
          border-radius: 16px; 
          border: 2px solid #e2e8f0; 
          background: #f8fafc; 
          font-family: var(--font-jakarta), sans-serif;
          font-size: 15px;
          font-weight: 600; 
          color: #0f172a; 
          box-sizing: border-box !important; 
          transition: all 0.3s; 
          outline: none; 
          margin: 0;
          -webkit-appearance: none;
          appearance: none;
          text-align: left;
        }
        .form-input:focus { border-color: #4f46e5; background: #ffffff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .form-input::placeholder { color: #94a3b8; font-weight: 500; }

        /* IKON MATA PASSWORD */
        .password-wrapper { position: relative; display: flex; align-items: center; }
        .password-input { padding-right: 50px !important; }
        .btn-eye {
          position: absolute; right: 12px; background: none; border: none; color: #94a3b8;
          padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;
        }
        .btn-eye:hover { color: #4f46e5; transform: scale(1.1); }

        .btn-submit { 
          width: 100%; height: 56px; background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
          color: white; border: none; border-radius: 16px; font-family: var(--font-jakarta), sans-serif;
          font-size: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; margin-top: 8px; 
          box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3); display: flex; align-items: center; justify-content: center;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(67, 56, 202, 0.4); }
        .btn-submit:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

        .footer-note {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .btn-back-home {
          display: inline-flex; align-items: center; gap: 8px;
          background-color: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
          padding: 10px 20px; 
          border-radius: 24px; 
          font-family: var(--font-jakarta), sans-serif;
          font-size: 14px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.3s ease;
          margin-top: 20px; 
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.05);
        }
        .btn-back-home:hover { 
          background-color: #e0e7ff; 
          color: #3730a3; 
          border-color: #a5b4fc;
          transform: translateX(-4px);
          box-shadow: 0 6px 10px rgba(79, 70, 229, 0.1); 
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ========================================= */
        /* RESPONSIVE DESIGN                         */
        /* ========================================= */
        @media (max-width: 1024px) {
          .split-wrapper { padding: 16px; }
          .split-card { max-width: 100%; border-radius: 24px; }
          .split-left { padding: 40px 24px; flex: 1; }
          .split-right { padding: 40px 24px; flex: 1; }
          .logo-jaktim { width: 100px; margin-bottom: 20px; } 
          .left-content h1 { font-size: 26px !important; }
          .form-header h2 { font-size: 26px; }
        }

        @media (max-width: 640px) {
          .split-card { flex-direction: column; max-width: 480px; border-radius: 28px; }
          .split-left { padding: 40px 24px 32px 24px; border-radius: 28px 28px 0 0; }
          .logo-jaktim { width: 85px; margin-bottom: 16px; } 
          .left-content h1 { font-size: 24px !important; }
          .left-content p { font-size: 13px !important; }
          .split-right { padding: 32px 24px 40px 24px; border-radius: 0 0 28px 28px; }
          
          /* 🔥 Tetap rata kiri di HP 🔥 */
          .form-header { margin-bottom: 24px; text-align: left; }
          .form-header h2 { font-size: 24px; }
          
          .glow-effect { display: none; }
        }
      `}} />

      <div className="split-card">
        
        {/* SISI KIRI: Branding Administrator */}
        <div className="split-left">
          <div className="glow-effect"></div>
          <img 
            src="/Lambang_Kota_Jakarta_Timur.png" 
            alt="Logo Jakarta Timur" 
            className="logo-jaktim"
            onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/b/b2/City_of_Jakarta_Timur_Logo.png"; }}
          />
          <div className="left-content">
            <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
              Pusat Kendali <br /> Administrator
            </h1>
            <div style={{ width: '48px', height: '4px', backgroundColor: '#818cf8', margin: '0 auto 20px auto', borderRadius: '4px' }}></div>
            <p className="font-body" style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, fontWeight: 500, maxWidth: '320px', margin: '0 auto' }}>
              Panel khusus Tim IT Kominfotik untuk manajemen pengguna, pemantauan sistem, dan pengaturan keamanan portal Smart Room.
            </p>
          </div>
        </div>

        {/* SISI KANAN: Form Login Admin */}
        <div className="split-right">
          <div className="form-header">
            <h2 className="font-heading">Otorisasi Sistem</h2>
            <p className="font-body">Masukkan kredensial Super Admin Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="font-body">
            
            {/* EMAIL */}
            <div className="form-group">
              <label>Alamat Email Admin</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="admin@kominfotik.jt" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            {/* PASSWORD DENGAN IKON MATA */}
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input password-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="btn-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1} 
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    /* 🔥 LOGIKA FIX: JIKA TERLIHAT (TEXT), TAMPILKAN MATA TERBUKA 🔥 */
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  ) : (
                    /* 🔥 LOGIKA FIX: JIKA TERSEMBUNYI (PASSWORD), TAMPILKAN MATA DICORET 🔥 */
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div> Memverifikasi...</>
              ) : (
                'Otorisasi Masuk'
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="footer-note">
             <p className="font-body" style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.6, margin: '0' }}>
              &copy; {new Date().getFullYear()} Suku Dinas Kominfotik <br/>
              Kota Administrasi Jakarta Timur.
            </p>
            <button 
              className="btn-back-home font-body"
              onClick={() => router.push('/')} 
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Kembali ke Beranda
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}