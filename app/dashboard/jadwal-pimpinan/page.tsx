// frontend/app/dashboard/jadwal-pimpinan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function JadwalPimpinanPage() {
  const [pimpinanSchedules, setPimpinanSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mengambil rentang 14 hari ke depan
  const getNext14Days = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const dateList = getNext14Days();

  useEffect(() => {
    const fetchPimpinanAgenda = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/reservations');
        // KUNCI PERBAIKAN: Filter Logika yang lebih cerdas
        const vipAgenda = response.data.filter((item: any) => {
          // Syarat Mutlak: Status harus 'verified'
          if (item.status !== 'verified') return false;

          // Syarat Masuk ke Papan Pimpinan (Salah satu dari 3 kondisi ini):
          // 1. Jadwal buatan pimpinan langsung (origin_unit kosong)
          // 2. Kolom pejabat_pelaksana berisi "Walikota" / "Wakil"
          // 3. Category Label mengandung kata "Pimpinan" atau "VIP"
          const isDirectLeaderCreation = !item.origin_unit;
          const isLeaderRole = item.pejabat_pelaksana && item.pejabat_pelaksana.toLowerCase().includes('walikota');
          const isVIPLabel = item.category_label && item.category_label.toLowerCase().includes('pimpinan');

          return isDirectLeaderCreation || isLeaderRole || isVIPLabel;
        });

        setPimpinanSchedules(vipAgenda);
      } catch (err) {
        console.error('Gagal mengambil jadwal pimpinan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPimpinanAgenda();
  }, []);

  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const dailySchedules = pimpinanSchedules
    .filter(r => r.start_time.startsWith(selectedDate))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="vip-container" style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* CSS RESPONSIVE & TAHUN STYLE */}
      <style dangerouslySetInnerHTML={{__html: `
        .header-vip { display: flex; align-items: center; gap: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; border-radius: 24px; color: #fff; margin-bottom: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); }
        
        .date-scroller { display: flex; gap: 12px; overflow-x: auto; padding: 4px 4px 16px 4px; margin-bottom: 24px; scrollbar-width: none; -ms-overflow-style: none; }
        .date-scroller::-webkit-scrollbar { display: none; }
        
        .timeline-item { display: flex; gap: 24px; position: relative; margin-bottom: 32px; }
        .timeline-left { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .timeline-dot { width: 12px; height: 12px; background-color: #eab308; border-radius: 50%; margin-top: 8px; border: 3px solid #fefce8; z-index: 2; }
        .timeline-line { width: 2px; background-color: #e2e8f0; flex: 1; margin-top: -4px; border-radius: 2px; }
        
        .agenda-card { flex: 1; background-color: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px; transition: transform 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .agenda-card:hover { transform: translateY(-2px); border-color: #fef08a; background-color: #fffdf5; }

        /* RESPONSIVE MOBILE & IPAD */
        @media (max-width: 1024px) {
          .header-vip { padding: 24px; gap: 16px; }
          .header-vip h2 { font-size: 20px !important; }
        }

        @media (max-width: 768px) {
          .header-vip { flex-direction: column; text-align: center; }
          .timeline-item { flex-direction: column; gap: 12px; }
          .timeline-left { flex-direction: row; min-width: auto; justify-content: flex-start; gap: 12px; }
          .timeline-line { display: none; }
          .agenda-card { padding: 16px; border-left: 4px solid #eab308; }
        }
      `}} />

      {/* HEADER EKSKLUSIF DENGAN TAHUN */}
      <div className="header-vip">
        <div style={{ width: '64px', height: '64px', backgroundColor: '#d97706', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 16px -4px rgba(217, 119, 6, 0.4)' }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        </div>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
            JADWAL PIMPINAN {new Date().getFullYear()}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontWeight: 500 }}>
            Agenda Resmi Walikota Jakarta Timur • Tahun Anggaran {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* STRIP TANGGAL HORIZONTAL */}
      <div className="date-scroller">
        {dateList.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const hasAgenda = pimpinanSchedules.some(r => r.start_time.startsWith(dateStr));
          
          return (
            <button 
              key={dateStr} onClick={() => setSelectedDate(dateStr)}
              style={{ 
                flexShrink: 0, padding: '14px 18px', borderRadius: '18px', cursor: 'pointer',
                background: isSelected ? '#0f172a' : '#fff', color: isSelected ? '#fff' : '#0f172a',
                border: isSelected ? 'none' : '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '85px', transition: 'all 0.2s', position: 'relative'
              }}
            >
              {hasAgenda && !isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', backgroundColor: '#d97706', borderRadius: '50%', border: '2px solid #fff' }}></div>}
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isSelected ? '#94a3b8' : '#64748b' }}>{getDayName(dateStr)}</span>
              <span style={{ fontSize: '22px', fontWeight: 800 }}>{dateStr.split('-')[2]}</span>
            </button>
          );
        })}
      </div>

      {/* DAFTAR AGENDA DENGAN TANGGAL & TAHUN LENGKAP */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Agenda {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '10px' }}>
            {dailySchedules.length} Agenda
          </span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
             <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#d97706', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : dailySchedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Tidak ada agenda pimpinan terjadwal pada hari ini.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dailySchedules.map((schedule, index) => {
               // Mendeteksi apakah ini buatan pimpinan atau pengajuan dari bagian
               const sourceLabel = !schedule.origin_unit ? "AGENDA INTERNAL" : "UNDANGAN BAGIAN";
               
               return (
              <div key={schedule.id} className="timeline-item">
                
                {/* TIMELINE JAM */}
                <div className="timeline-left">
                  <div style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{formatTime(schedule.start_time)}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>WIB</span>
                  </div>
                  <div className="timeline-dot"></div>
                  {index !== dailySchedules.length - 1 && <div className="timeline-line"></div>}
                </div>

                {/* KARTU KONTEN */}
                <div className="agenda-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                      {schedule.event_name}
                    </h4>
                    <div style={{ backgroundColor: '#fefce8', color: '#a16207', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, border: '1px solid #fef08a', flexShrink: 0 }}>
                      {sourceLabel}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      s/d {formatTime(schedule.end_time)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {schedule.location_type === 'ruangan_terdaftar' ? (schedule.room?.room_name || 'Ruang Internal') : (schedule.other_location || 'Luar Kantor')}
                    </div>
                    
                    {/* Menampilkan siapa yang diutus (Walikota/Wakil/Asisten) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {schedule.pejabat_pelaksana || 'Pimpinan'}
                    </div>

                  </div>
                </div>

              </div>
            );
            })}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}