// frontend/app/dashboard/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState('');

  // 🔥 TAMBAHAN parameter isBackgroundSync agar loading tidak mengganggu UI
  const fetchHistory = async (isBackgroundSync = false) => {
    try {
      if (!isBackgroundSync) setIsLoading(true); // Loading utuh hanya saat pertama kali buka
      
      const res = await api.get(`/my-reservations?_t=${Date.now()}`); // _t untuk mencegah cache browser
      const historyData = res.data.data || res.data || [];

      if (Array.isArray(historyData)) {
        const sortedData = historyData.sort((a: any, b: any) => {
           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setHistoryList(sortedData);
      } else {
        setHistoryList([]);
      }
      
      // Update jam sync
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    } catch (error: any) {
      if (!isBackgroundSync) console.error('Gagal mengambil riwayat:', error);
      // Jika background sync gagal (misal koneksi putus sebentar), jangan hapus list yang ada
    } finally {
      if (!isBackgroundSync) setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Panggil pertama kali (dengan loading)
    fetchHistory();

    // 2. Jalankan BACKGROUND POLLING setiap 10 detik
    const syncInterval = setInterval(() => {
      fetchHistory(true); // true = Background Sync tanpa loading nutupin layar
    }, 10000);

    // 3. Bersihkan interval saat pindah halaman
    return () => clearInterval(syncInterval);
  }, []);

  // FUNGSI HAPUS DENGAN SWEETALERT PREMIUM
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Batalkan Pengajuan?',
      text: 'Apakah Anda yakin ingin membatalkan dan menghapus reservasi ini? Aksi ini tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan',
      cancelButtonText: 'Tutup',
      buttonsStyling: false,
      customClass: {
        container: 'swal-premium-backdrop', 
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-error-btn', 
        cancelButton: 'swal-cancel-btn', 
        actions: 'swal-actions-container'
      }
    });

    if (!result.isConfirmed) return;

    const loadingToast = toast.loading('Membatalkan pengajuan...');

    try {
      await api.delete(`/reservations/${id}`);
      setHistoryList(historyList.filter(item => item.id !== id));
      toast.success('Pengajuan berhasil dibatalkan.', { id: loadingToast });
    } catch (err: any) {
      toast.error('Gagal membatalkan pengajuan.', { id: loadingToast });
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.message || 'Terjadi kesalahan pada server.',
        buttonsStyling: false,
        customClass: {
          container: 'swal-premium-backdrop', 
          popup: 'swal-premium-popup', 
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text', 
          confirmButton: 'swal-premium-btn'
        }
      });
    }
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="history-wrapper">
      <Toaster position="top-center" />

      {/* --- CSS PREMIUM KHUSUS HALAMAN RIWAYAT --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .history-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding-top: 10px;
          padding-bottom: 60px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* Header Halaman & Live Sync */
        .header-history { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .header-history h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .header-history p { color: #64748b; font-size: 16px; margin: 0; }
        
        .live-badge {
          background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 14px;
          border-radius: 20px; display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; color: #166534;
        }
        .dot-pulse { width: 8px; height: 8px; background-color: #22c55e; border-radius: 50%; position: relative; }
        .dot-pulse::after {
          content: ""; position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px;
          border-radius: 50%; border: 2px solid #22c55e; animation: pulse 1.5s cubic-bezier(0.2, 0, 0.2, 1) infinite;
        }

        /* Banner Informasi */
        .info-banner {
          background-color: #eff6ff; border-radius: 24px; border: 1px solid #bfdbfe;
          padding: 24px; margin-bottom: 32px; display: flex; gap: 20px; align-items: flex-start;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.05);
        }
        .info-icon {
          width: 48px; height: 48px; background-color: #3b82f6; color: #fff;
          border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }

        /* Kartu Riwayat */
        .history-card {
          background: #ffffff; border-radius: 24px; padding: 28px;
          border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
          position: relative; overflow: hidden; transition: all 0.3s;
        }
        .history-card:hover { transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .history-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; transition: background-color 0.5s; }

        /* Grid Detail */
        .detail-grid {
          display: flex; flex-wrap: wrap; gap: 20px; background-color: #f8fafc;
          padding: 16px 20px; border-radius: 16px; border: 1px solid #f1f5f9; margin-top: 20px;
        }
        .detail-item { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
        .detail-icon { width: 36px; height: 36px; background-color: #e0e7ff; color: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

        /* Tombol Batalkan */
        .btn-delete-modern {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px;
          background-color: #fef2f2; color: #ef4444; border: 1px solid #fca5a5;
          border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .btn-delete-modern:hover { background-color: #fee2e2; color: #dc2626; border-color: #f87171; }

        /* CUSTOM SWEETALERT */
        .swal-premium-backdrop { backdrop-filter: blur(6px) !important; background: rgba(15, 23, 42, 0.5) !important; }
        .swal-premium-popup { border-radius: 28px !important; padding: 32px 24px !important; font-family: var(--font-jakarta), sans-serif !important; }
        .swal-premium-title { font-family: var(--font-outfit), sans-serif !important; font-size: 24px !important; font-weight: 800 !important; color: #0f172a !important; margin-bottom: 8px !important; }
        .swal-premium-text { font-size: 15px !important; color: #475569 !important; line-height: 1.6 !important; }
        .swal-actions-container { gap: 12px !important; margin-top: 24px !important; }
        .swal-error-btn { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important; color: white !important; border: none !important; border-radius: 14px !important; padding: 12px 24px !important; font-weight: 700 !important; font-size: 15px !important; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3) !important; transition: all 0.2s !important; }
        .swal-error-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 15px 25px -5px rgba(239, 68, 68, 0.4) !important; }
        .swal-cancel-btn { background: #f1f5f9 !important; color: #475569 !important; border: none !important; border-radius: 14px !important; padding: 12px 24px !important; font-weight: 700 !important; font-size: 15px !important; transition: all 0.2s !important; }
        .swal-cancel-btn:hover { background: #e2e8f0 !important; color: #0f172a !important; }
        .swal-premium-btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; color: white !important; border: none !important; border-radius: 14px !important; padding: 12px 24px !important; font-weight: 700 !important; font-size: 15px !important; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

        /* --- RESPONSIVE IPAD --- */
        @media (max-width: 1024px) {
          .history-wrapper { padding-left: 15px; padding-right: 15px; }
        }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 768px) {
          .history-wrapper { padding-top: 0px; padding-bottom: 40px; padding-left: 15px; padding-right: 15px; }
          .header-history { margin-top: 4px; margin-bottom: 20px; }
          .header-history h2 { font-size: 26px; line-height: 1.2; }
          
          .info-banner { flex-direction: column; padding: 20px; border-radius: 20px; gap: 16px; margin-bottom: 24px; }
          .info-icon { width: 40px; height: 40px; border-radius: 12px; }
          
          .history-card { padding: 20px; border-radius: 20px; }
          .detail-grid { grid-template-columns: 1fr; gap: 16px; padding: 16px; border-radius: 14px; }
          
          .btn-delete-modern { width: 100%; justify-content: center; }
          
          /* SweetAlert Responsive */
          .swal-premium-popup { width: 92% !important; padding: 24px 16px !important; }
          .swal-actions-container { flex-direction: column-reverse !important; width: 100% !important; }
          .swal-error-btn, .swal-cancel-btn, .swal-premium-btn { width: 100% !important; margin: 0 !important; }
        }
      `}} />

      {/* HEADER HALAMAN */}
      <div className="header-history">
        <div>
          <h2 className="font-heading">Rincian & Riwayat Pengajuan</h2>
          <p className="font-body">Pantau status dan detail pengajuan reservasi ruangan Anda di sini.</p>
        </div>
        {/* 🔥 INDIKATOR LIVE UPDATE 🔥 */}
        <div className="live-badge font-body" title="Sistem memantau pembaruan status secara real-time">
          <div className="dot-pulse"></div>
          Live Sync
        </div>
      </div>

      {/* KOTAK INFORMASI KONTAK PIC & NOTES PENTING */}
      <div className="info-banner">
        <div className="info-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h3 className="font-heading" style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px 0' }}>Pusat Bantuan & Kontak PIC</h3>
          <p className="font-body" style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 16px 0', lineHeight: 1.6, fontWeight: 600 }}>
            <strong>NOTES:</strong> Jika ada perubahan jadwal yang dilakukan setelah verifikasi, harap segera menghubungi kontak PIC bagian terkait.
          </p>
          <div className="font-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Pemerintahan:</strong> TBA
            </div>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Kesra:</strong> TBA
            </div>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Ekbang:</strong> TBA
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR RIWAYAT */}
      {isLoading ? (
        <div className="font-body" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '36px', height: '36px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
          <span style={{ fontWeight: 600 }}>Memuat riwayat Anda...</span>
        </div>
      ) : historyList.length === 0 ? (
        <div className="font-body" style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', border: '2px dashed #cbd5e1' }}>
          <div style={{ width: '72px', height: '72px', backgroundColor: '#f1f5f9', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <h3 className="font-heading" style={{ fontSize: '22px', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 800 }}>Belum Ada Pengajuan</h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Anda belum pernah membuat reservasi ruangan sebelumnya.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {historyList.map((item) => {
            
            // Konfigurasi Dinamis Warna Berdasarkan Status
            let statusConfig = { bg: '#fef9c3', text: '#d97706', label: 'Menunggu Verifikasi', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
            if (item.status === 'verified') statusConfig = { bg: '#dcfce7', text: '#16a34a', label: 'Disetujui', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' };
            else if (item.status === 'rejected') statusConfig = { bg: '#fef2f2', text: '#dc2626', label: 'Ditolak', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' };

            return (
              <div key={item.id} className="history-card">
                
                {/* Garis Warna Status */}
                <div className="history-indicator" style={{ backgroundColor: statusConfig.text }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
                  <div>
                    <div className="font-body" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ backgroundColor: statusConfig.bg, color: statusConfig.text, padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', transition: 'all 0.5s ease' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={statusConfig.icon}></path></svg>
                        {statusConfig.label}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-heading" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.event_name}</h3>
                  </div>
                </div>

                {/* Rincian Ruangan & Waktu */}
                <div className="detail-grid font-body">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 700, textTransform: 'uppercase' }}>Lokasi</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>{item.room?.room_name || 'Luar Kantor'}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 700, textTransform: 'uppercase' }}>Tanggal Acara</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>{formatDate(item.start_time)}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 700, textTransform: 'uppercase' }}>Waktu</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                        {formatTime(item.start_time)} - {formatTime(item.end_time)} WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kotak Alasan Penolakan (Muncul Otomatis jika Ditolak) */}
                {item.status === 'rejected' && item.rejection_reason && (
                  <div className="font-body" style={{ marginTop: '20px', padding: '16px 20px', backgroundColor: '#fef2f2', borderRadius: '14px', border: '1px solid #fecaca', display: 'flex', gap: '16px', alignItems: 'flex-start', animation: 'slideUpFade 0.5s ease' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>Pesan dari Verifikator:</p>
                      <p style={{ fontSize: '14px', color: '#7f1d1d', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>"{item.rejection_reason}"</p>
                    </div>
                  </div>
                )}

                {/* TOMBOL DELETE / BATALKAN (Hanya untuk Pending, Hilang Otomatis jika Disetujui/Ditolak) */}
                {item.status === 'pending' && (
                  <div className="font-body" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', transition: 'opacity 0.5s' }}>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete-modern">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Batalkan Pengajuan
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}