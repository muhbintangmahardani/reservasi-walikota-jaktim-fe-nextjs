// frontend/app/login-vip/page.tsx
'use client';

import SekpimLoginForm from '@/components/auth/SekpimLoginForm';

export default function PimpinanLoginPage() {
  return (
    <div className="split-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .split-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0f172a; /* Gelap untuk VIP feel */
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .split-card {
          display: flex;
          width: 100%;
          max-width: 950px;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* SISI KIRI: Branding VIP */
        .split-left {
          flex: 1.1;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
        }

        .logo-jaktim {
          width: 110px;
          height: auto;
          margin-bottom: 24px;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3));
        }

        /* SISI KANAN: Form */
        .split-right {
          flex: 1;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #ffffff;
        }

        .form-header { margin-bottom: 32px; }
        .form-header h2 { font-size: 28px; font-weight: 800; color: #1e1b4b; margin: 0 0 8px 0; }
        .form-header p { font-size: 15px; color: #64748b; margin: 0; }

        .footer-note {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }

        @media (max-width: 850px) {
          .split-card { flex-direction: column; max-width: 450px; }
          .split-left { padding: 40px 30px; }
          .split-right { padding: 40px 30px; }
        }
      `}} />

      <div className="split-card">
        
        {/* SISI KIRI: Branding Pimpinan */}
        <div className="split-left">
          <img 
            src="/Lambang_Kota_Jakarta_Timur.png" 
            alt="Logo Jakarta Timur" 
            className="logo-jaktim"
            onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/b/b2/City_of_Jakarta_Timur_Logo.png"; }}
          />
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            Sistem Informasi <br /> Portal Pimpinan
          </h1>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#818cf8', margin: '0 auto 20px auto', borderRadius: '4px' }}></div>
          <p style={{ fontSize: '14px', color: '#c7d2fe', lineHeight: 1.6, fontWeight: 300 }}>
            Panel Khusus Verifikasi & Penjadwalan Agenda Walikota, Wakil Walikota, dan Sekretaris Kota Administrasi Jakarta Timur.
          </p>
        </div>

        {/* SISI KANAN: Form Login Sekpim */}
        <div className="split-right">
          <div className="form-header">
            <h2>Login Pimpinan</h2>
            <p>Khusus Pimpinan & Asisten Sekpim.</p>
          </div>

          <SekpimLoginForm />

          <div className="footer-note">
             <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
              &copy; {new Date().getFullYear()} Suku Dinas Kominfotik <br/>
              Kota Administrasi Jakarta Timur.
            </p>
            <a href="/" style={{ fontSize: '13px', color: '#4f46e5', textDecoration: 'none', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>
               &larr; Kembali ke Beranda
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}