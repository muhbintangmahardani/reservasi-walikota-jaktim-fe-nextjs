// frontend/app/sekpim/jadwal/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function KelolaJadwalPage() {
  const router = useRouter();
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJadwalAktif();
  }, []);

  const fetchJadwalAktif = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reservations/active');
      let data = res.data.data || res.data;
      data.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setJadwalList(data);
    } catch (error) {
      console.warn('Gagal mengambil data, menggunakan data dummy.');
      setJadwalList([
        { id: 101, event_name: 'Rapat Koordinasi Wilayah', start_time: '2026-04-28 09:00:00', end_time: '2026-04-28 12:00:00', location_type: 'ruangan_terdaftar', room: { room_name: 'Ruang Pola' }, pejabat_pelaksana: 'Walikota', category_label: 'Penting' },
        { id: 102, event_name: 'Kunjungan Lapangan', start_time: '2026-04-29 13:00:00', end_time: '2026-04-29 15:00:00', location_type: 'lainnya', other_location: 'Kecamatan Cakung', pejabat_pelaksana: 'Wakil Walikota', category_label: 'Internal' },
      ] as any);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationDisplay = (item: any) => {
    if (item.location_type === 'ruangan_terdaftar' && item.room) {
      return item.room.room_name || item.room.name || 'Ruangan Internal';
    }
    if (item.other_location) {
      return item.other_location;
    }
    return 'Menunggu Konfirmasi Lokasi';
  };

  const filteredJadwal = jadwalList.filter((j: any) => 
    j.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.pejabat_pelaksana?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="jadwal-container">
      <style dangerouslySetInnerHTML={{__html: `
        /* ========================================= */
        /* DESKTOP-FIRST LAYOUT (SUPER RAPIH)        */
        /* ========================================= */
        .jadwal-container { padding: 32px 40px; font-family: 'Inter', sans-serif; max-width: 1200px; margin: 0 auto; box-sizing: border-box; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 20px; }
        .header-title h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .header-title p { color: #64748b; margin: 0; font-size: 15px; }
        
        .btn-tambah { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); flex-shrink: 0; }
        .btn-tambah:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }

        .search-bar { background: white; padding: 16px 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: 0.2s; }
        .search-bar:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-input { border: none; outline: none; width: 100%; font-size: 15px; font-family: 'Inter'; color: #0f172a; background: transparent; }
        
        .schedule-list { display: flex; flex-direction: column; gap: 16px; }
        
        /* CARD UTAMA DESKTOP */
        .schedule-card { 
          background: white; border-radius: 20px; border: 1px solid #e2e8f0; 
          padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; 
          gap: 32px; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); 
          position: relative; overflow: hidden; 
        }
        .schedule-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); transform: translateY(-2px); }
        
        .sc-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }
        .indicator-internal { background: #3b82f6; }
        .indicator-external { background: #8b5cf6; }

        /* KONTEN KIRI (KALENDER & INFO BERSAMPINGAN) */
        .sc-main-content { display: flex; align-items: center; gap: 24px; flex: 1; }

        .sc-date { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; min-width: 80px; height: 80px; flex-shrink: 0; }
        .sc-month { font-size: 12px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; }
        .sc-day { font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.1; }

        .sc-info { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
        .sc-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .sc-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.3; }
        .sc-label { font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; white-space: nowrap; }
        
        .sc-details-row { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }
        .sc-detail-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; font-weight: 600; }

        /* KONTEN KANAN (TOMBOL AKSI) */
        .sc-actions { flex-shrink: 0; }
        .btn-action { padding: 12px 24px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-edit { background: #f8fafc; color: #2563eb; border: 1px solid #e2e8f0; }
        .btn-edit:hover { background: #eff6ff; border-color: #bfdbfe; }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ========================================= */
        /* RESPONSIVE DESIGN                         */
        /* ========================================= */
        
        /* IPAD / TABLET */
        @media (max-width: 1024px) {
          .jadwal-container { padding: 24px; }
          .schedule-card { padding: 20px 24px; gap: 20px; }
          .sc-details-row { gap: 16px; }
        }

        /* MOBILE / HP */
        @media (max-width: 768px) {
          .jadwal-container { padding: 16px; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .btn-tambah { width: 100%; justify-content: center; padding: 14px; }
          
          /* Kartu menjadi vertikal penuh di HP */
          .schedule-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 20px 16px 20px 20px; }
          
          /* Tanggal & Info di HP disejajarkan ke atas (align-start) */
          .sc-main-content { align-items: flex-start; gap: 16px; }
          
          .sc-date { min-width: 64px; height: 64px; border-radius: 14px; }
          .sc-day { font-size: 22px; }
          
          .sc-details-row { flex-direction: column; align-items: flex-start; gap: 10px; margin-top: 8px; background: #f8fafc; padding: 16px; border-radius: 12px; }
          
          /* Tombol Edit Full Width */
          .sc-actions { width: 100%; }
          .btn-action { width: 100%; padding: 14px; }
        }
      `}} />

      <div className="page-header">
        <div className="header-title">
          <h1>Kelola Jadwal Aktif</h1>
          <p>Pantau dan edit jadwal resmi yang sudah disetujui.</p>
        </div>
        <button className="btn-tambah" onClick={() => router.push('/sekpim/jadwal/create')}>
          <span style={{ fontSize: '18px' }}>+</span> Tambah Jadwal Baru
        </button>
      </div>

      <div className="search-bar">
        <span style={{ fontSize: '20px', color: '#94a3b8' }}>🔍</span>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Cari nama kegiatan atau pelaksana..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Memuat data jadwal...</span>
        </div>
      ) : filteredJadwal.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📅</span>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '18px', display: 'block', marginBottom: '8px' }}>Tidak ada jadwal aktif ditemukan</span>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Belum ada jadwal atau kata pencarian tidak cocok.</span>
        </div>
      ) : (
        <div className="schedule-list">
          {filteredJadwal.map((item) => {
            const dateObj = new Date(item.start_time);
            const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
            const day = dateObj.toLocaleDateString('id-ID', { day: '2-digit' });
            const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const isInternal = item.location_type === 'ruangan_terdaftar';

            return (
              <div key={item.id} className="schedule-card">
                <div className={`sc-indicator ${isInternal ? 'indicator-internal' : 'indicator-external'}`}></div>

                {/* AREA KIRI (Tanggal & Detail) */}
                <div className="sc-main-content">
                  
                  <div className="sc-date">
                    <span className="sc-month">{month}</span>
                    <span className="sc-day">{day}</span>
                  </div>

                  <div className="sc-info">
                    <div className="sc-title-row">
                      <h3 className="sc-title">{item.event_name}</h3>
                      <span className="sc-label">{item.category_label || 'Umum'}</span>
                    </div>
                    
                    <div className="sc-details-row">
                      <div className="sc-detail-item">
                        <span style={{ color: '#3b82f6', fontSize: '16px' }}>🕒</span> 
                        {time} WIB
                      </div>
                      <div className="sc-detail-item">
                        <span style={{ color: '#f59e0b', fontSize: '16px' }}>📍</span> 
                        {getLocationDisplay(item)}
                      </div>
                      <div className="sc-detail-item">
                        <span style={{ color: '#10b981', fontSize: '16px' }}>👤</span> 
                        {item.pejabat_pelaksana || 'Pimpinan'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* AREA KANAN (Tombol) */}
                <div className="sc-actions">
                  <button 
                    className="btn-action btn-edit" 
                    onClick={() => router.push(`/sekpim/jadwal/${item.id}/edit`)}
                  >
                    <span>✏️</span> Edit Jadwal
                  </button>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}