// frontend/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .landing-wrapper { 
          min-height: 100vh; display: flex; flex-direction: column; 
          align-items: center; justify-content: center; position: relative; 
          overflow: hidden; padding: 24px; box-sizing: border-box; 
          background-color: #f8fafc; font-family: var(--font-jakarta), sans-serif; 
          /* 🔥 Sentuhan Background Tekstur Titik-titik Modern 🔥 */
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }
        
        /* --- Background Element Dekoratif --- */
        .bg-circle-1 { 
          position: absolute; top: -15%; left: -10%; width: 600px; height: 600px; 
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%); 
          z-index: 1; pointer-events: none; 
          filter: blur(40px);
        }
        .bg-circle-2 { 
          position: absolute; bottom: -15%; right: -10%; width: 700px; height: 700px; 
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0) 70%); 
          z-index: 1; pointer-events: none; 
          filter: blur(40px);
        }

        /* --- Kontainer Utama --- */
        .content-container { 
          position: relative; z-index: 10; 
          text-align: center; max-width: 1050px; width: 100%; 
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        
        /* 🔥 LOGO DIBESARKAN 🔥 */
        .logo-box { 
          width: 120px; height: 120px; background: white; border-radius: 28px; 
          box-shadow: 0 15px 35px -5px rgba(0,0,0,0.08); display: flex; 
          align-items: center; justify-content: center; margin: 0 auto 32px auto; 
          padding: 16px; box-sizing: border-box; border: 1px solid #f1f5f9;
          transition: 0.3s;
        }
        .logo-box:hover { transform: scale(1.05) translateY(-4px); box-shadow: 0 20px 40px -5px rgba(0,0,0,0.12); }
        
        .main-title { 
          font-size: 42px; font-weight: 800; color: #0f172a; 
          margin: 0 0 16px 0; letter-spacing: -1px; line-height: 1.2; 
        }
        .sub-title { 
          font-size: 16px; color: #64748b; margin: 0 auto 56px auto; 
          max-width: 600px; line-height: 1.6; font-weight: 500;
          background: rgba(255,255,255,0.7); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(4px);
        }

        /* --- GRID 3 PORTAL --- */
        .portal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; }
        
        .portal-card { 
          background: rgba(255, 255, 255, 0.95); border-radius: 28px; padding: 48px 32px; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
          cursor: pointer; position: relative; overflow: hidden; display: flex; 
          flex-direction: column; align-items: center; 
          z-index: 20; -webkit-tap-highlight-color: transparent; 
          backdrop-filter: blur(10px);
        }
        
        /* Mengunci posisi konten di atas bayangan aura */
        .portal-card > * { position: relative; z-index: 10; }

        /* 🔥 EFEK BAYANGAN AURA DI DALAM KARTU 🔥 */
        .portal-card::before {
          content: ''; position: absolute; top: -40%; right: -40%; width: 250px; height: 250px; 
          border-radius: 50%; opacity: 0.08; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
          z-index: 0; pointer-events: none;
        }

        .icon-wrapper { 
          width: 72px; height: 72px; border-radius: 22px; display: flex; 
          align-items: center; justify-content: center; margin-bottom: 24px; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        
        /* 🔥 WARNA SPESIFIK & BAYANGAN LUAR TIAP PORTAL 🔥 */
        
        /* 1. Card User (Biru) */
        .card-user { box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.15); }
        .card-user::before { background: #3b82f6; filter: blur(50px); }
        .card-user .icon-wrapper { background: #eff6ff; color: #3b82f6; }
        .card-user:hover, .card-user:active { 
          transform: translateY(-8px); border-bottom: 4px solid #3b82f6; border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.25); 
        }
        .card-user:hover::before { opacity: 0.2; transform: scale(1.2); }
        .card-user:hover .icon-wrapper, .card-user:active .icon-wrapper { background: #3b82f6; color: white; transform: scale(1.1) rotate(-5deg); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }

        /* 2. Card Sekpim (Oranye) */
        .card-sekpim { box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.15); }
        .card-sekpim::before { background: #f59e0b; filter: blur(50px); }
        .card-sekpim .icon-wrapper { background: #fffbeb; color: #f59e0b; }
        .card-sekpim:hover, .card-sekpim:active { 
          transform: translateY(-8px); border-bottom: 4px solid #f59e0b; border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.25); 
        }
        .card-sekpim:hover::before { opacity: 0.2; transform: scale(1.2); }
        .card-sekpim:hover .icon-wrapper, .card-sekpim:active .icon-wrapper { background: #f59e0b; color: white; transform: scale(1.1) rotate(5deg); box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }

        /* 3. Card Admin (Indigo) */
        .card-admin { box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.15); }
        .card-admin::before { background: #6366f1; filter: blur(50px); }
        .card-admin .icon-wrapper { background: #eef2ff; color: #6366f1; }
        .card-admin:hover, .card-admin:active { 
          transform: translateY(-8px); border-bottom: 4px solid #6366f1; border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.25); 
        }
        .card-admin:hover::before { opacity: 0.2; transform: scale(1.2); }
        .card-admin:hover .icon-wrapper, .card-admin:active .icon-wrapper { background: #6366f1; color: white; transform: scale(1.1) rotate(5deg); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }

        .card-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.5px; }
        .card-desc { font-size: 14px; color: #64748b; margin: 0; line-height: 1.6; font-weight: 500; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* --- RESPONSIVE UNTUK IPAD & HP --- */
        @media (max-width: 1024px) {
          .portal-grid { gap: 16px; }
          .portal-card { padding: 40px 24px; }
          .card-title { font-size: 20px; }
        }

        @media (max-width: 820px) { /* iPad Portrait */
          .logo-box { width: 100px; height: 100px; padding: 14px; margin-bottom: 28px; } /* Ukuran Logo iPad */
          .main-title { font-size: 36px; }
          
          .portal-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; gap: 20px; }
          .portal-card { padding: 32px; flex-direction: row; text-align: left; gap: 24px; border-radius: 24px; }
          .icon-wrapper { margin-bottom: 0; width: 64px; height: 64px; flex-shrink: 0; }
        }

        @media (max-width: 480px) { /* Mobile HP */
          .landing-wrapper { padding: 16px; }
          .logo-box { width: 88px; height: 88px; padding: 12px; margin-bottom: 24px; border-radius: 24px; } /* Ukuran Logo Mobile */
          
          .main-title { font-size: 28px; }
          .sub-title { font-size: 14px; margin-bottom: 40px; }
          
          .portal-card { flex-direction: column; text-align: center; padding: 32px 24px; gap: 0; }
          .icon-wrapper { margin-bottom: 20px; }
          .card-title { font-size: 20px; }
        }
      `}} />

      {/* --- Lingkaran Cahaya Background --- */}
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <div className="content-container">
        
        {/* --- Area Logo --- */}
        <div className="logo-box">
          <img 
            src="/Lambang_Kota_Jakarta_Timur.png" 
            alt="Logo Jaktim" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/City_of_Jakarta_Timur_Logo.png/200px-City_of_Jakarta_Timur_Logo.png"; }}
          />
        </div>

        <h1 className="main-title font-heading">Sistem Informasi Smart Room</h1>
        <p className="sub-title font-body">Selamat datang di portal reservasi cerdas Kominfotik Jakarta Timur. Silakan pilih portal masuk sesuai dengan hak akses Anda.</p>

        <div className="portal-grid">
          
          {/* 1. KARTU USER BAGIAN */}
          <div className="portal-card card-user" role="button" tabIndex={0} onClick={() => router.push('/login')}>
            <div className="icon-wrapper">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <h2 className="card-title font-heading">User Bagian / Unit</h2>
              <p className="card-desc font-body">Portal untuk membuat pengajuan jadwal reservasi ruangan dan melihat riwayat.</p>
            </div>
          </div>

          {/* 2. KARTU SEKPIM */}
          <div className="portal-card card-sekpim" role="button" tabIndex={0} onClick={() => router.push('/login-vip')}>
            <div className="icon-wrapper">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
            </div>
            <div>
              <h2 className="card-title font-heading">Sekretariat Pimpinan</h2>
              <p className="card-desc font-body">Portal untuk verifikasi jadwal, menolak/menerima, dan mengelola jadwal pimpinan.</p>
            </div>
          </div>

          {/* 3. KARTU ADMIN */}
          <div className="portal-card card-admin" role="button" tabIndex={0} onClick={() => router.push('/login-admin')}>
            <div className="icon-wrapper">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h2 className="card-title font-heading">Administrator</h2>
              <p className="card-desc font-body">Pusat kendali utama untuk mengelola daftar pengguna dan sistem keamanan.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}