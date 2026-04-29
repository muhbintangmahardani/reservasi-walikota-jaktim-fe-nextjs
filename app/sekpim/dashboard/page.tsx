// frontend/app/sekpim/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';

export default function SekpimDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservasiPending, setReservasiPending] = useState([]);
  const [jadwalAktif, setJadwalAktif] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedReservasi, setSelectedReservasi] = useState<any>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  const [categoryLabel, setCategoryLabel] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // 🔥 EFEK PENGUNCI SCROLL MUTLAK 🔥
  useEffect(() => {
    if (isApproveModalOpen || isRejectModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isApproveModalOpen, isRejectModalOpen]);

  // 1. Live Clock Sync
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Initial Data & LIVE SYNC
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchDashboardData(false);
    const liveSyncInterval = setInterval(() => fetchDashboardData(true), 10000);
    return () => clearInterval(liveSyncInterval);
  }, []);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [resPending, resAktif] = await Promise.all([
        api.get('/reservations/pending'),
        api.get('/reservations/active')
      ]);
      setReservasiPending(resPending.data.data || resPending.data);
      setJadwalAktif(resAktif.data.data || resAktif.data);
    } catch (error) {
      console.error("Gagal sinkronisasi");
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  // 🔥 EKSEKUSI API LANGSUNG 🔥
  const executeVerifyAPI = async (status: string) => {
    setIsSubmitting(true);
    const loadToast = toast.loading('Memproses...');

    try {
      await api.put(`/reservations/${selectedReservasi.id}/verify`, {
        status,
        category_label: categoryLabel,
        rejection_reason: rejectionReason
      });
      
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setCategoryLabel('');
      setRejectionReason('');
      
      fetchDashboardData(true);
      toast.success(status === 'verified' ? 'Agenda disetujui!' : 'Agenda ditolak.', { id: loadToast });

    } catch (e) { 
      toast.error('Gagal memproses, periksa koneksi Anda.', { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="vip-dashboard-wrapper">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        /* --- UKURAN DIPADATKAN (SCALE DOWN) --- */
        .vip-dashboard-wrapper { 
          padding: 24px 32px; font-family: var(--font-jakarta), sans-serif; 
          background: transparent; min-height: 100vh; max-width: 1140px; 
          margin: 0 auto; box-sizing: border-box; animation: slideUpFade 0.5s ease forwards;
        }
        
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* --- HERO BANNER --- */
        .hero-banner { 
          background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%); 
          padding: 32px; border-radius: 24px; color: white; display: flex; 
          justify-content: space-between; align-items: center; margin-bottom: 24px; 
          box-shadow: 0 15px 25px -5px rgba(30, 27, 75, 0.25); position: relative; overflow: hidden; 
        }
        .hero-banner::after { 
          content: ''; position: absolute; right: -40px; top: -40px; width: 200px; height: 200px; 
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%); 
          border-radius: 50%; pointer-events: none; 
        }
        .hero-title { font-size: 26px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .hero-subtitle { color: #c7d2fe; margin: 0; font-size: 14px; font-weight: 500; }
        
        .live-badge { 
          background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); 
          padding: 8px 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); 
          display: flex; align-items: center; gap: 8px; font-weight: 800; font-family: monospace; 
          font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .live-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 1.5s infinite; box-shadow: 0 0 8px #34d399; }

        /* --- STATS GRID --- */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { 
          background: white; padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; 
          display: flex; align-items: center; gap: 16px; transition: 0.2s; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); 
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 15px -3px rgba(0,0,0,0.05); border-color: #cbd5e1; }
        .icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .stat-num { font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.1; margin-bottom: 2px; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        /* --- SECTION HEADER --- */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
        .live-indicator-text { 
          font-size: 12px; color: #475569; display: flex; align-items: center; gap: 6px; 
          font-weight: 700; background: #f8fafc; padding: 6px 12px; border-radius: 16px; border: 1px solid #e2e8f0; 
        }

        /* --- REQUEST LIST --- */
        .request-list { display: flex; flex-direction: column; gap: 12px; }
        .request-card { 
          background: white; padding: 16px 20px; border-radius: 16px; border: 1px solid #e2e8f0; 
          display: flex; align-items: center; justify-content: space-between; gap: 20px; 
          transition: 0.2s; border-left: 5px solid #f59e0b; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .request-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
        .rc-left { display: flex; align-items: center; gap: 16px; flex: 1; }
        .rc-avatar { 
          width: 44px; height: 44px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          color: #d97706; border-radius: 12px; display: flex; align-items: center; justify-content: center; 
          font-size: 20px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.1);
        }
        .rc-info h4 { margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #0f172a; }
        .rc-info p { margin: 0; font-size: 12px; color: #475569; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rc-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; font-size: 11px; font-weight: 800; border: 1px solid #e2e8f0; }
        
        .rc-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
        .btn-act { 
          padding: 10px 16px; border-radius: 10px; font-weight: 800; border: none; 
          cursor: pointer; transition: 0.2s; font-size: 13px; display: flex; 
          align-items: center; justify-content: center; gap: 6px; font-family: var(--font-jakarta), sans-serif;
        }
        .btn-terima { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15); }
        .btn-terima:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(16, 185, 129, 0.25); }
        .btn-tolak { background: #fff; color: #ef4444; border: 1px solid #fecaca; }
        .btn-tolak:hover { background: #fef2f2; border-color: #ef4444; transform: translateY(-2px); }

        /* --- MODAL INPUT COMPACT --- */
        .modal-input {
          width: 100%; padding: 12px 14px; border-radius: 10px; border: 2px solid #e2e8f0; 
          margin-bottom: 20px; font-family: var(--font-jakarta), sans-serif; font-size: 14px; 
          outline: none; background-color: #f8fafc; font-weight: 600; box-sizing: border-box; transition: 0.2s;
        }
        .modal-input:focus { border-color: #4f46e5; background: #fff; }

        .btn-modal { padding: 12px; border-radius: 10px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; transition: 0.2s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-modal:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }

        /* ANIMASI */
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* --- RESPONSIVE IPAD --- */
        @media (max-width: 1024px) {
          .vip-dashboard-wrapper { padding: 20px; }
          .stats-grid { gap: 12px; }
          .stat-card { padding: 16px; flex-direction: column; text-align: center; gap: 10px; }
          .request-card { flex-direction: column; align-items: stretch; padding: 20px; }
          .rc-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
          .btn-act { width: 100%; }
        }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 768px) { 
          .vip-dashboard-wrapper { padding: 16px; } 
          .hero-banner { flex-direction: column; align-items: flex-start; gap: 16px; padding: 24px; border-radius: 20px; }
          .hero-title { font-size: 22px; }
          .stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .stat-card { flex-direction: row; text-align: left; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .request-card { padding: 16px; gap: 16px; }
          .rc-left { align-items: flex-start; flex-direction: column; gap: 10px; }
          .rc-actions { display: flex; flex-direction: column; width: 100%; }
        }
      `}} />

      {/* HERO SECTION */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="hero-title font-heading">Halo, {user?.role === 'pimpinan' ? 'Pimpinan' : 'Asisten'}! 👋</h1>
          <p className="hero-subtitle font-body">Selamat datang di Panel Eksekutif. Pantau agenda hari ini.</p>
        </div>
        <div className="live-badge">
          <div className="live-dot"></div>
          {formatTime(currentTime)}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="stats-grid font-body">
        <div className="stat-card">
          <div className="icon-box" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' }}>⏳</div>
          <div>
            <div className="stat-label">Menunggu Verifikasi</div>
            <div className="stat-num font-heading">{reservasiPending.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-box" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#15803d' }}>📅</div>
          <div>
            <div className="stat-label">Total Jadwal Aktif</div>
            <div className="stat-num font-heading">{jadwalAktif.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-box" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: '#4f46e5' }}>🏢</div>
          <div>
            <div className="stat-label">Ruangan Terpakai</div>
            <div className="stat-num font-heading">{jadwalAktif.filter((a:any) => a.location_type === 'ruangan_terdaftar').length}</div>
          </div>
        </div>
      </div>

      {/* UI PENGAJUAN MASUK */}
      <div className="section-header">
        <h2 className="font-heading"><span style={{ fontSize: '24px' }}>🔔</span> Pengajuan Masuk</h2>
        <div className="live-indicator-text font-body">
          <div style={{ width: '6px', height: '6px', background: '#4f46e5', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          Live Sync Active
        </div>
      </div>
        
      {isLoading && reservasiPending.length === 0 ? (
        <div className="font-body" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Sinkronisasi data real-time...</span>
        </div>
      ) : reservasiPending.length === 0 ? (
        <div className="font-body" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#10b981' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                <path d="M9 16l2 2 4-4" /> 
              </svg>
            </div>
          </div>
          <span className="font-heading" style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', display: 'block', marginBottom: '6px' }}>
            Kotak Masuk Bersih!
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Semua antrean pengajuan telah diverifikasi.
          </p>
        </div>
      ) : (
        <div className="request-list">
          {reservasiPending.map((item: any) => (
            <div key={item.id} className="request-card">
              <div className="rc-left">
                <div className="rc-avatar">📄</div>
                <div className="rc-info">
                  <h4 className="font-heading">{item.event_name}</h4>
                  <p className="font-body">
                    <span style={{ color: '#1e1b4b', fontWeight: 800, background: '#e0e7ff', padding: '4px 8px', borderRadius: '6px' }}>{item.origin_unit}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>📅 {new Date(item.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span className="rc-badge">🕒 {new Date(item.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </p>
                </div>
              </div>
              <div className="rc-actions">
                <button className="btn-act btn-terima" onClick={() => { setSelectedReservasi(item); setIsApproveModalOpen(true); }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Terima
                </button>
                <button className="btn-act btn-tolak" onClick={() => { setSelectedReservasi(item); setIsRejectModalOpen(true); }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL TERIMA (COMPACT) --- */}
      {isApproveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', animation: 'popIn 0.2s ease-out' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#15803d', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-heading" style={{ fontWeight: 800, margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Input Label Agenda</h3>
            <p className="font-body" style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.5 }}>Kategori untuk <strong style={{color:'#0f172a'}}>{selectedReservasi?.event_name}</strong>.</p>
            
            <input 
              type="text" 
              placeholder="Cth: Paripurna / Penting" 
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              className="modal-input font-body"
              autoFocus
            />
            
            <div className="font-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-modal" 
                onClick={() => executeVerifyAPI('verified')} 
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
              >
                {isSubmitting ? (
                  <><div style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Memproses...</>
                ) : 'Simpan & Setujui'}
              </button>
              <button className="btn-modal" onClick={() => setIsApproveModalOpen(false)} disabled={isSubmitting} style={{ background: '#f1f5f9', color: '#475569' }}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TOLAK (COMPACT) --- */}
      {isRejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', animation: 'popIn 0.2s ease-out' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', color: '#b91c1c', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="font-heading" style={{ fontWeight: 800, margin: '0 0 8px 0', color: '#ef4444', fontSize: '20px' }}>Tolak Pengajuan</h3>
            <p className="font-body" style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.5 }}>Alasan pembatalan untuk <strong style={{color:'#0f172a'}}>{selectedReservasi?.event_name}</strong>.</p>
            
            <textarea 
              rows={3}
              placeholder="Cth: Jadwal Pimpinan bentrok" 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="modal-input font-body"
              style={{ resize: 'vertical' }}
              autoFocus
            />
            
            <div className="font-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-modal" 
                onClick={() => executeVerifyAPI('rejected')} 
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}
              >
                {isSubmitting ? (
                  <><div style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Memproses...</>
                ) : 'Kirim Penolakan'}
              </button>
              <button className="btn-modal" onClick={() => setIsRejectModalOpen(false)} disabled={isSubmitting} style={{ background: '#f1f5f9', color: '#475569' }}>Batal</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}