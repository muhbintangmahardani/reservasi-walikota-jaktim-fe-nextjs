// frontend/app/login/page.tsx
'use client';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function UserLoginPage() {
  return (
    <div className="split-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
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
          flex-direction: row;
          width: 100%;
          max-width: 900px;
          min-height: 540px;
          background: #ffffff;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          animation: scaleUp 0.5s ease forwards;
        }

        .split-left {
          flex: 1.1;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          position: relative;
        }

        /* 🔥 LOGO SIZE DI SESUAIKAN 🔥 */
        .logo-jaktim {
          width: 120px; 
          height: auto;
          margin-bottom: 24px;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3));
          z-index: 1;
        }

        .split-right {
          flex: 1;
          padding: 60px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #ffffff;
        }

        .form-header { margin-bottom: 32px; }
        .form-header h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
        .form-header p { font-size: 15px; color: #64748b; margin: 0; }

        /* 🔥 FOOTER & KEMBALI KE BERANDA DIKEMBALIKAN 🔥 */
        .footer-note {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .back-link-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 20px;
          background-color: #eff6ff; color: #2563eb;
          font-size: 13px; font-weight: 700; text-decoration: none;
          transition: all 0.2s; border: 1px solid #bfdbfe;
        }
        .back-link-btn:hover { background-color: #dbeafe; color: #1d4ed8; transform: translateY(-2px); }

        @keyframes scaleUp { 0% { transform: scale(0.98); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        /* RESPONSIVE IPAD AIR & MINI */
        @media (max-width: 900px) {
          .split-card { max-width: 100%; min-height: 480px; }
          .split-left { padding: 40px 24px; flex: 1; }
          .split-right { padding: 40px 32px; flex: 1.2; } 
          
          .logo-jaktim { width: 75px; margin-bottom: 16px; }
          .split-left h1 { font-size: 24px !important; margin-bottom: 12px !important; }
          .split-left p { font-size: 13px !important; }
          
          .form-header { margin-bottom: 24px; }
          .form-header h2 { font-size: 26px; }
          .form-header p { font-size: 14px; }
        }

        /* RESPONSIVE HP */
        @media (max-width: 640px) {
          .split-wrapper { padding: 16px; }
          .split-card { flex-direction: column; max-width: 420px; border-radius: 24px; }
          .split-left { padding: 40px 24px; }
          .split-right { padding: 32px 24px; }
        }
      `}} />

      <div className="split-card">
        
        {/* SISI KIRI */}
        <div className="split-left">
          <img 
            src="/Lambang_Kota_Jakarta_Timur.png" 
            alt="Logo Jakarta Timur" 
            className="logo-jaktim" 
            onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/City_of_Jakarta_Timur_Logo.png/200px-City_of_Jakarta_Timur_Logo.png"; }} 
          />
          <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Sistem Informasi <br/> Reservasi Ruangan
          </h1>
          <p className="font-body" style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, fontWeight: 500 }}>
            Optimalisasi koordinasi fasilitas Kantor Walikota Jakarta Timur melalui sistem terintegrasi.
          </p>
        </div>

        {/* SISI KANAN */}
        <div className="split-right">
          <div className="form-header">
            <h2 className="font-heading">Portal Unit Kerja</h2>
            <p className="font-body">Silakan masukkan kredensial Anda.</p>
          </div>
          
          {/* KOMPONEN FORM LOGIN */}
          <LoginForm />

          {/* FOOTER & TOMBOL KEMBALI */}
          <div className="footer-note">
            <p className="font-body" style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
              &copy; {new Date().getFullYear()} Suku Dinas Kominfotik <br/> Kota Administrasi Jakarta Timur.
            </p>
            <Link href="/" className="back-link-btn font-body">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}