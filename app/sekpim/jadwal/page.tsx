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
        .jadwal-container { 
          padding: 24px 32px; 
          font-family: var(--font-jakarta), sans-serif; 
          max-width: 1140px; 
          margin: 0 auto; 
          box-sizing: border-box; 
          animation: slideUpFade 0.5s ease forwards;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 20px; }
        .header-title h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .header-title p { color: #64748b; margin: 0; font-size: 14px; font-weight: 500; }
        
        .btn-tambah { 
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); 
          color: white; border: none; padding: 12px 20px; border-radius: 12px; 
          font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.2s; 
          display: flex; align-items: center; gap: 8px; 
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); flex-shrink: 0; 
          font-family: inherit;
        }
        .btn-tambah:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(79, 70, 229, 0.3); }

        .search-bar { 
          background: white; padding: 14px 20px; border-radius: 14px; 
          border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; 
          margin-bottom: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.2s; 
        }
        .search-bar:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .search-input { border: none; outline: none; width: 100%; font-size: 14px; font-family: inherit; font-weight: 600; color: #0f172a; background: transparent; }
        .search-input::placeholder { color: #94a3b8; font-weight: 500; }
        
        .schedule-list { display: flex; flex-direction: column; gap: 16px; }
        
        /* CARD UTAMA DESKTOP */
        .schedule-card { 
          background: white; border-radius: 16px; border: 1px solid #e2e8f0; 
          padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; 
          gap: 24px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); 
          position: relative; overflow: hidden; 
        }
        .schedule-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-2px); }
        
        .sc-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; }
        .indicator-internal { background: #4f46e5; }
        .indicator-external { background: #0ea5e9; }

        /* KONTEN KIRI (KALENDER & INFO BERSAMPINGAN) */
        .sc-main-content { display: flex; align-items: center; gap: 20px; flex: 1; }

        .sc-date { 
          display: flex; flex-direction: column; align-items: center; justify-content: center; 
          background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 14px; 
          min-width: 72px; height: 72px; flex-shrink: 0; 
        }
        .sc-month { font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; }
        .sc-day { font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.1; }

        .sc-info { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
        .sc-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sc-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.3; letter-spacing: -0.3px; }
        .sc-label { 
          font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 800; 
          background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; white-space: nowrap; 
        }
        
        .sc-details-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
        .sc-detail-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; font-weight: 600; }
        .detail-icon { color: #94a3b8; display: flex; align-items: center; }

        /* KONTEN KANAN (TOMBOL AKSI) */
        .sc-actions { flex-shrink: 0; }
        .btn-action { 
          padding: 10px 18px; border-radius: 10px; font-weight: 800; border: none; 
          cursor: pointer; transition: 0.2s; font-size: 13px; display: flex; 
          align-items: center; justify-content: center; gap: 6px; font-family: inherit;
        }
        .btn-edit { background: #f8fafc; color: #4f46e5; border: 1px solid #e2e8f0; }
        .btn-edit:hover { background: #e0e7ff; border-color: #c7d2fe; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ========================================= */
        /* RESPONSIVE DESIGN                         */
        /* ========================================= */
        
        /* IPAD / TABLET */
        @media (max-width: 1024px) {
          .jadwal-container { padding: 24px; }
          .schedule-card { padding: 20px; gap: 20px; }
          .sc-details-row { gap: 12px; }
        }

        /* MOBILE / HP */
        @media (max-width: 768px) {
          .jadwal-container { padding: 16px; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
          .btn-tambah { width: 100%; justify-content: center; padding: 14px; font-size: 14px; }
          
          /* Kartu menjadi vertikal penuh di HP */
          .schedule-card { flex-direction: column; align-items: stretch; gap: 16px; padding: 16px 16px 16px 20px; }
          
          /* Tanggal & Info di HP disejajarkan ke atas (align-start) */
          .sc-main-content { align-items: flex-start; gap: 16px; }
          
          .sc-date { min-width: 60px; height: 60px; border-radius: 12px; }
          .sc-day { font-size: 22px; }
          
          .sc-details-row { flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 8px; background: #f8fafc; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; }
          
          /* Tombol Edit Full Width */
          .sc-actions { width: 100%; }
          .btn-action { width: 100%; padding: 12px; font-size: 14px; }
        }
      `}} />

      <div className="page-header">
        <div className="header-title">
          <h1 className="font-heading">Kelola Jadwal Aktif</h1>
          <p className="font-body">Pantau dan edit jadwal resmi yang sudah disetujui.</p>
        </div>
        <button className="btn-tambah font-body" onClick={() => router.push('/sekpim/jadwal/create')}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Tambah Jadwal Baru
        </button>
      </div>

      <div className="search-bar">
        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          className="search-input font-body" 
          placeholder="Cari nama kegiatan atau pelaksana..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="font-body" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
          <span style={{ color: '#475569', fontWeight: 700, fontSize: '14px' }}>Memuat data jadwal...</span>
        </div>
      ) : filteredJadwal.length === 0 ? (
        <div className="font-body" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
             <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <span className="font-heading" style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', display: 'block', marginBottom: '8px' }}>Tidak ada jadwal aktif ditemukan</span>
          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Belum ada jadwal atau kata pencarian tidak cocok.</span>
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
                    <span className="sc-month font-body">{month}</span>
                    <span className="sc-day font-heading">{day}</span>
                  </div>

                  <div className="sc-info">
                    <div className="sc-title-row">
                      <h3 className="sc-title font-heading">{item.event_name}</h3>
                      <span className="sc-label font-body">{item.category_label || 'Umum'}</span>
                    </div>
                    
                    <div className="sc-details-row font-body">
                      <div className="sc-detail-item">
                        <span className="detail-icon"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span> 
                        {time} WIB
                      </div>
                      <div className="sc-detail-item">
                        <span className="detail-icon" style={{color: '#f59e0b'}}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span> 
                        {getLocationDisplay(item)}
                      </div>
                      <div className="sc-detail-item">
                        <span className="detail-icon" style={{color: '#10b981'}}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></span> 
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
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Edit Jadwal
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