// frontend/app/dashboard/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/my-reservations');
      const sortedData = response.data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setHistoryList(sortedData);
    } catch (error) {
      console.error('Gagal mengambil riwayat');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // FUNGSI UNTUK MENGHAPUS / MEMBATALKAN RESERVASI
  const handleDelete = async (id: number) => {
    const isConfirm = window.confirm('Apakah Anda yakin ingin membatalkan pengajuan reservasi ini? Aksi ini tidak dapat dikembalikan.');
    
    if (!isConfirm) return;

    try {
      // Tembak API delete Laravel
      await api.delete(`/reservations/${id}`);
      
      // Hapus data dari state (layar) tanpa perlu refresh browser
      setHistoryList(historyList.filter(item => item.id !== id));
      alert('✅ Pengajuan berhasil dibatalkan dan dihapus.');
    } catch (err: any) {
      alert('Gagal membatalkan pengajuan: ' + (err.response?.data?.message || 'Terjadi kesalahan server.'));
    }
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* HEADER HALAMAN */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Rincian & Riwayat Pengajuan</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Pantau status dan detail pengajuan reservasi ruangan Anda di sini.
        </p>
      </div>

      {/* ============================================================== */}
      {/* KOTAK INFORMASI KONTAK PIC & NOTES PENTING (SESUAI REQUEST)      */}
      {/* ============================================================== */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px 0' }}>Pusat Bantuan & Kontak PIC</h3>
          <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 12px 0', lineHeight: 1.5, fontWeight: 600 }}>
            <strong>NOTES:</strong> Jika ada perubahan jadwal yang dilakukan pengguna setelah verifikasi dapat menghubungi kontak PIC yang bersangkutan.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Pemerintahan:</strong> TBA
            </div>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Kesra:</strong> TBA
            </div>
            <div style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '13px', color: '#1e3a8a' }}>
              <strong>Ekbang:</strong> TBA
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR RIWAYAT */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
          Memuat riwayat Anda...
        </div>
      ) : historyList.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '50%', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 700 }}>Belum ada pengajuan</h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Anda belum pernah membuat reservasi ruangan.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {historyList.map((item) => {
            
            let statusConfig = { bg: '#fef9c3', text: '#854d0e', label: 'Menunggu Verifikasi', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
            if (item.status === 'verified') statusConfig = { bg: '#dcfce7', text: '#166534', label: 'Disetujui', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' };
            else if (item.status === 'rejected') statusConfig = { bg: '#fef2f2', text: '#991b1b', label: 'Ditolak', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' };

            return (
              <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: statusConfig.text, opacity: 0.8 }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: statusConfig.bg, color: statusConfig.text, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={statusConfig.icon}></path></svg>
                        {statusConfig.label}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                        Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{item.event_name}</h3>
                  </div>
                </div>

                {/* Rincian Ruangan & Waktu */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 600 }}>Ruangan</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>{item.room?.room_name || 'Luar Kantor'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 600 }}>Tanggal</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>{formatDate(item.start_time)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 600 }}>Jam</p>
                      <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                        {formatTime(item.start_time)} - {formatTime(item.end_time)} WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kotak Alasan Penolakan */}
                {item.status === 'rejected' && item.rejection_reason && (
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>Pesan dari Verifikator:</p>
                      <p style={{ fontSize: '14px', color: '#7f1d1d', margin: 0, lineHeight: 1.6 }}>"{item.rejection_reason}"</p>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TOMBOL DELETE / BATALKAN (Hanya muncul jika status Pending)    */}
                {/* ============================================================== */}
                {item.status === 'pending' && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Batalkan Pengajuan
                    </button>
                  </div>
                )}
                {/* ============================================================== */}

              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
    </div>
  );
}