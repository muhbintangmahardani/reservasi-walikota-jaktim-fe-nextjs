// frontend/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .landing-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Ornamen Lingkaran Dekoratif di Background */
        .landing-wrapper::before {
          content: '';
          position: absolute;
          top: -10%;
          left: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
        }
        .landing-wrapper::after {
          content: '';
          position: absolute;
          bottom: -10%;
          right: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
        }

        .hero-section {
          text-align: center;
          max-width: 800px;
          z-index: 10;
          margin-bottom: 48px;
        }

        .logo-img {
          width: 100px;
          height: auto;
          margin-bottom: 24px;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
        }

        .hero-title {
          font-size: 36px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.2;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .hero-title span {
          color: #1e40af;
        }

        .hero-subtitle {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
          font-weight: 400;
        }

        .portal-grid {
          display: flex;
          gap: 24px;
          z-index: 10;
          width: 100%;
          max-width: 700px;
        }

        .portal-card {
          flex: 1;
          background: #ffffff;
          padding: 40px 32px;
          border-radius: 24px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          text-decoration: none;
          display: block;
        }

        .portal-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }

        .icon-box {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px auto;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .card-user .icon-box { background: #eff6ff; color: #3b82f6; }
        .card-vip .icon-box { background: #f0fdf4; color: #10b981; }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        .footer-text {
          margin-top: 64px;
          font-size: 13px;
          color: #94a3b8;
          z-index: 10;
        }

        /* RESPONSIVE IPAD & MOBILE */
        @media (max-width: 768px) {
          .portal-grid { flex-direction: column; max-width: 400px; }
          .hero-title { font-size: 28px; }
          .logo-img { width: 80px; }
        }
      `}} />

      {/* HERO SECTION */}
      <div className="hero-section">
        <img 
          src="/Lambang_Kota_Jakarta_Timur.png" 
          alt="Logo Jakarta Timur" 
          className="logo-img"
          onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/b/b2/City_of_Jakarta_Timur_Logo.png"; }}
        />
        <h1 className="hero-title">
          Sistem Informasi <br /> <span>Reservasi Ruangan (SIRR)</span>
        </h1>
        <p className="hero-subtitle">
          Portal Layanan Terpadu Penjadwalan Fasilitas dan Agenda <br />
          Pemerintah Kota Administrasi Jakarta Timur
        </p>
      </div>

      {/* PORTAL SELECTION */}
      <div className="portal-grid">
        
        {/* KARTU 1: USER BAGIAN */}
        <div onClick={() => router.push('/login')} className="portal-card card-user">
          <div className="icon-box">🏢</div>
          <h2 className="card-title">Portal Unit Kerja</h2>
          <p className="card-desc">
            Khusus Staf / Bagian untuk mengajukan reservasi ruangan dan melihat jadwal yang tersedia.
          </p>
        </div>

        {/* KARTU 2: PIMPINAN & ASISTEN (VIP) */}
        <div onClick={() => router.push('/login-vip')} className="portal-card card-vip">
          <div className="icon-box">⭐</div>
          <h2 className="card-title">Portal Pimpinan</h2>
          <p className="card-desc">
            Khusus Pimpinan dan Asisten untuk verifikasi reservasi dan mengelola agenda internal.
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="footer-text">
        &copy; {new Date().getFullYear()} Pemerintah Kota Administrasi Jakarta Timur
      </div>
    </div>
  );
}