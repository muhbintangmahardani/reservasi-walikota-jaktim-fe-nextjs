// frontend/app/sekpim/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';

export default function SekpimDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservasiPending, setReservasiPending] = useState([]);
  const [jadwalAktif, setJadwalAktif] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedReservasi, setSelectedReservasi] = useState<any>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // STATE UNTUK CUSTOM PREMIUM ALERT
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    type: 'success', // 'confirm', 'success', 'error'
    title: '',
    message: '',
    onConfirm: null as any
  });

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

  // FUNGSI 1: TRIGGER CUSTOM CONFIRMATION ALERT
  const handleVerifyConfirm = (status: string) => {
    const isAccept = status === 'verified';
    setCustomAlert({
      isOpen: true,
      type: 'confirm',
      title: isAccept ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan',
      message: isAccept 
        ? `Anda akan menerima pengajuan "${selectedReservasi?.event_name}". Agenda ini akan dimasukkan ke kalender Walikota.`
        : `Anda akan menolak pengajuan "${selectedReservasi?.event_name}". Pihak unit kerja akan menerima notifikasi penolakan ini.`,
      onConfirm: () => executeVerifyAPI(status)
    });
  };

  // FUNGSI 2: EKSEKUSI API & SHOW SUCCESS ALERT
  const executeVerifyAPI = async (status: string) => {
    // Tutup alert konfirmasi sementara API berjalan
    setCustomAlert({ ...customAlert, isOpen: false });

    try {
      await api.put(`/reservations/${selectedReservasi.id}/verify`, {
        status,
        category_label: categoryLabel,
        rejection_reason: rejectionReason
      });
      
      // Tutup modal form
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setCategoryLabel('');
      setRejectionReason('');
      fetchDashboardData(false);

      // Tampilkan Custom Alert SUKSES (Delay sedikit agar animasinya smooth)
      setTimeout(() => {
        setCustomAlert({
          isOpen: true,
          type: 'success',
          title: status === 'verified' ? 'Berhasil Diterima!' : 'Berhasil Ditolak!',
          message: `Pengajuan "${selectedReservasi?.event_name}" telah berhasil diproses oleh sistem.`,
          onConfirm: null
        });
      }, 300);

    } catch (e) { 
      setCustomAlert({
        isOpen: true,
        type: 'error',
        title: 'Proses Gagal',
        message: 'Terjadi kesalahan sistem saat menghubungi server.',
        onConfirm: null
      });
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="dashboard-container">
      <style dangerouslySetInnerHTML={{__html: `
        /* TATA LETAK UTAMA */
        .dashboard-container { padding: 24px 32px; font-family: 'Inter', sans-serif; background: transparent; min-height: 100vh; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }
        
        .hero-banner { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; border-radius: 24px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3); position: relative; overflow: hidden; }
        .hero-banner::after { content: ''; position: absolute; right: -50px; top: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; pointer-events: none; }
        .hero-title { font-size: 26px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .hero-subtitle { color: #cbd5e1; margin: 0; font-size: 14px; }
        .live-badge { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 8px; font-weight: 700; font-family: monospace; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .live-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 1.5s infinite; box-shadow: 0 0 8px #34d399; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .icon-box { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .stat-num { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 600; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
        .live-indicator-text { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px; font-weight: 600; background: #f8fafc; padding: 6px 12px; border-radius: 20px; border: 1px solid #e2e8f0; }
        
        .request-list { display: flex; flex-direction: column; gap: 12px; }
        .request-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; gap: 20px; transition: 0.2s; border-left: 5px solid #f59e0b; }
        .request-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 12px -3px rgba(0,0,0,0.04); }
        .rc-left { display: flex; align-items: center; gap: 16px; flex: 1; }
        .rc-avatar { width: 44px; height: 44px; background: #fef3c7; color: #d97706; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .rc-info h4 { margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: #0f172a; }
        .rc-info p { margin: 0; font-size: 12px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rc-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; font-size: 11px; font-weight: 700; }
        
        .rc-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
        .btn-act { padding: 10px 16px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btn-terima { background: #10b981; color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15); }
        .btn-terima:hover { background: #059669; }
        .btn-tolak { background: #fff; color: #ef4444; border: 1px solid #fecaca; }
        .btn-tolak:hover { background: #fef2f2; border-color: #ef4444; }

        /* ANIMASI CUSTOM ALERT PREMIUM */
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .request-card { flex-direction: column; align-items: stretch; }
          .rc-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
          .btn-act { width: 100%; padding: 12px 10px; }
        }
        @media (max-width: 768px) { 
          .dashboard-container { padding: 16px; } 
          .hero-banner { flex-direction: column; align-items: flex-start; gap: 16px; padding: 24px; border-radius: 20px; }
          .stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .request-card { padding: 16px; gap: 16px; }
          .rc-actions { display: flex; flex-direction: column; width: 100%; }
          .btn-act { width: 100%; padding: 12px; font-size: 14px; }
        }
      `}} />

      {/* HERO SECTION */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="hero-title">Halo, {user?.role === 'pimpinan' ? 'Pimpinan' : 'Asisten'}! 👋</h1>
          <p className="hero-subtitle">Selamat datang di Panel Eksekutif. Pantau agenda hari ini.</p>
        </div>
        <div className="live-badge">
          <div className="live-dot"></div>
          {formatTime(currentTime)}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>⏳</div>
          <div>
            <div className="stat-label">Menunggu Verifikasi</div>
            <div className="stat-num">{reservasiPending.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>📅</div>
          <div>
            <div className="stat-label">Total Jadwal Aktif</div>
            <div className="stat-num">{jadwalAktif.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>🏢</div>
          <div>
            <div className="stat-label">Ruangan Terpakai</div>
            <div className="stat-num">{jadwalAktif.filter((a:any) => a.location_type === 'ruangan_terdaftar').length}</div>
          </div>
        </div>
      </div>

      {/* UI PENGAJUAN MASUK */}
      <div className="section-header">
        <h2><span style={{ fontSize: '24px' }}>🔔</span> Pengajuan Masuk</h2>
        <div className="live-indicator-text">
          <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          Live Sync Active
        </div>
      </div>
        
      {isLoading && reservasiPending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Memuat data real-time...</span>
        </div>
      ) : reservasiPending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>☕</span>
          <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>Tidak ada pengajuan baru.</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Semua pengajuan telah Anda verifikasi.</p>
        </div>
      ) : (
        <div className="request-list">
          {reservasiPending.map((item: any) => (
            <div key={item.id} className="request-card" style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <div className="rc-left">
                <div className="rc-avatar">📄</div>
                <div className="rc-info">
                  <h4>{item.event_name}</h4>
                  <p>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{item.origin_unit}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>📅 {new Date(item.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span className="rc-badge">🕒 {new Date(item.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </p>
                </div>
              </div>
              <div className="rc-actions">
                <button className="btn-act btn-terima" onClick={() => { setSelectedReservasi(item); setIsApproveModalOpen(true); }}>
                  <span>✓</span> Terima Pengajuan
                </button>
                <button className="btn-act btn-tolak" onClick={() => { setSelectedReservasi(item); setIsRejectModalOpen(true); }}>
                  <span>✕</span> Tolak Pengajuan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TERIMA */}
      {isApproveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#15803d', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>✓</div>
            <h3 style={{ fontWeight: 800, margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Terima & Input Label</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>Tentukan label kategori untuk agenda <strong style={{color:'#0f172a'}}>{selectedReservasi?.event_name}</strong>.</p>
            
            <input 
              type="text" 
              placeholder="Contoh: Agenda Pimpinan / Penting" 
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
              autoFocus
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => handleVerifyConfirm('verified')} style={{ background: '#10b981', width: '100%', padding: '14px', fontSize: '14px' }}>Simpan & Verifikasi</Button>
              <Button onClick={() => setIsApproveModalOpen(false)} style={{ background: '#f1f5f9', color: '#64748b', width: '100%', padding: '14px', fontSize: '14px' }}>Batal</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOLAK */}
      {isRejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', color: '#b91c1c', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>✕</div>
            <h3 style={{ fontWeight: 800, margin: '0 0 8px 0', color: '#ef4444', fontSize: '20px' }}>Tolak Pengajuan</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>Berikan alasan mengapa pengajuan <strong style={{color:'#0f172a'}}>{selectedReservasi?.event_name}</strong> ditolak.</p>
            
            <textarea 
              rows={3}
              placeholder="Contoh: Jadwal Walikota penuh / Ruangan dipakai internal" 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '24px', fontFamily: 'inherit', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
              autoFocus
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => handleVerifyConfirm('rejected')} style={{ background: '#ef4444', width: '100%', padding: '14px', fontSize: '14px' }}>Kirim Penolakan</Button>
              <Button onClick={() => setIsRejectModalOpen(false)} style={{ background: '#f1f5f9', color: '#64748b', width: '100%', padding: '14px', fontSize: '14px' }}>Batal</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚀 CUSTOM PREMIUM ALERT COMPONENT (PENGGANTI WINDOW.ALERT) */}
      {/* ========================================================= */}
      {customAlert.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            
            {/* ICON ALERT */}
            <div style={{ width: '70px', height: '70px', margin: '0 auto 20px auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              background: customAlert.type === 'success' ? '#dcfce7' : customAlert.type === 'error' ? '#fee2e2' : '#eff6ff',
              color: customAlert.type === 'success' ? '#15803d' : customAlert.type === 'error' ? '#b91c1c' : '#1d4ed8',
              animation: customAlert.type === 'confirm' ? 'pulseAlert 2s infinite' : 'none'
            }}>
              {customAlert.type === 'success' ? '✨' : customAlert.type === 'error' ? '⚠️' : '🤔'}
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{customAlert.title}</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px 0', lineHeight: 1.6 }}>{customAlert.message}</p>

            {/* TOMBOL BAWAH */}
            {customAlert.type === 'confirm' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={customAlert.onConfirm} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>Ya, Lanjutkan</button>
                <button onClick={() => setCustomAlert({...customAlert, isOpen: false})} style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>Batal</button>
              </div>
            ) : (
              <button onClick={() => setCustomAlert({...customAlert, isOpen: false})} style={{ background: customAlert.type === 'success' ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '14px', width: '100%', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
                Mengerti
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}