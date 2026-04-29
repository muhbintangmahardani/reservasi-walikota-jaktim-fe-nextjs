// frontend/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [unitName, setUnitName] = useState('');
  
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentTime, setCurrentTime] = useState('');

  const fetchData = async () => {
    try {
      const myRes = await api.get(`/my-reservations?_t=${Date.now()}`);
      const myData = myRes.data;
      
      setStats({
        total: myData.length,
        pending: myData.filter((x: any) => x.status === 'pending').length,
        verified: myData.filter((x: any) => x.status === 'verified').length,
        rejected: myData.filter((x: any) => x.status === 'rejected').length
      });

      const allRes = await api.get(`/reservations?_t=${Date.now()}`);
      const now = new Date();
      
      const upcoming = allRes.data
        .filter((x: any) => x.status === 'verified' && new Date(x.end_time) >= now)
        .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5);
      
      setUpcomingSchedules(upcoming);

    } catch (error) {
      // Abaikan error agar UI tetap bersih saat sinkronisasi background
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
      setUnitName(user.unit_name);
    }

    setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    fetchData();
    const dataInterval = setInterval(fetchData, 15000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <div className="dashboard-wrapper">
      
      {/* --- CSS PREMIUM & KONSISTENSI FONT --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* PAKSA FONT BASE PLUS JAKARTA SANS */
        .dashboard-wrapper {
          padding-bottom: 60px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-jakarta), sans-serif;
        }

        /* PEMBAGIAN HIERARKI FONT */
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .welcome-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          border-radius: 28px;
          padding: 40px;
          color: white;
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2);
        }
        .welcome-banner::after {
          content: "";
          position: absolute;
          top: -50px;
          right: -50px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          pointer-events: none;
        }

        .sync-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
          font-variant-numeric: tabular-nums; 
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.06);
        }
        .stat-icon-wrapper {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .schedule-container {
          background: #ffffff;
          border-radius: 28px;
          padding: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
        }
        .schedule-item {
          display: flex;
          gap: 20px;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid transparent;
          align-items: center;
          transition: all 0.2s;
        }
        .schedule-item:hover {
          background: #f8fafc;
        }
        .schedule-today {
          background: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
        }
        
        .cal-icon {
          min-width: 65px;
          text-align: center;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .cal-month {
          background: #0f172a;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 0;
          letter-spacing: 1px;
        }
        .cal-day {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          padding: 6px 0;
        }

        .btn-view-all {
          font-family: var(--font-jakarta), sans-serif;
          padding: 10px 20px; 
          border-radius: 14px; 
          background-color: #eff6ff; 
          color: #2563eb; 
          border: none; 
          font-size: 14px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        .btn-view-all:hover { background-color: #dbeafe; }

        @keyframes ping-soft { 75%, 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .welcome-banner { padding: 32px; flex-direction: column; align-items: flex-start; gap: 24px; }
        }

        @media (max-width: 768px) {
          .dashboard-wrapper { padding-bottom: 30px; }
          .welcome-banner { border-radius: 24px; padding: 24px; }
          .welcome-banner h2 { font-size: 24px !important; }
          .sync-badge { width: 100%; justify-content: center; }
          
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { padding: 20px; border-radius: 20px; }
          .stat-icon-wrapper { width: 44px; height: 44px; border-radius: 14px; margin-bottom: 12px; }
          .stat-icon-wrapper svg { width: 22px; height: 22px; }
          .stat-card h3 { font-size: 22px !important; }

          .schedule-container { padding: 20px; border-radius: 24px; }
          .schedule-item { padding: 16px; gap: 12px; flex-direction: column; align-items: flex-start; }
          .cal-icon { display: flex; width: 100%; border-radius: 12px; align-items: center; border: none; background: #f1f5f9; box-shadow: none;}
          .cal-month { padding: 8px 12px; border-radius: 12px; }
          .cal-day { padding: 8px 12px; font-size: 16px; }
          .unit-label { display: none; }
        }
      `}} />

      {/* --- HEADER BANNER PREMIUM --- */}
      <div className="welcome-banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Halo, {userName || 'Bapak/Ibu'} 👋
          </h2>
          <p className="font-body" style={{ fontSize: '15px', margin: 0, color: '#cbd5e1', fontWeight: 500 }}>
            {unitName || 'User Bagian'} • Panel Utama Smart Room Kominfotik
          </p>
        </div>

        {/* JAM BERDETAK REAL-TIME */}
        <div className="sync-badge font-body" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', width: '10px', height: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%', position: 'absolute', animation: 'ping-soft 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
          </div>
          Live Waktu: {currentTime || '...'} WIB
        </div>
      </div>

      {/* --- KARTU STATISTIK GRID --- */}
      <div className="stats-grid">
        
        {/* Card 1: Total */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <p className="font-body" style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pengajuan</p>
          <h3 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.total}</h3>
        </div>

        {/* Card 2: Menunggu */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v2a6 6 0 01-6 6 6 6 0 016 6v2H4v-2a6 6 0 016-6 6 6 0 01-6-6V4z"></path></svg>
          </div>
          <p className="font-body" style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Menunggu</p>
          <h3 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.pending}</h3>
        </div>

        {/* Card 3: Disetujui */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <p className="font-body" style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disetujui</p>
          <h3 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.verified}</h3>
        </div>

        {/* Card 4: Ditolak */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m4.586 7H4a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <p className="font-body" style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ditolak</p>
          <h3 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.rejected}</h3>
        </div>

      </div>

      {/* --- DAFTAR JADWAL TERDEKAT --- */}
      <div className="schedule-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Agenda Terdekat</h3>
            <p className="font-body" style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Jadwal kegiatan yang akan datang.</p>
          </div>
          <button 
            className="btn-view-all font-body"
            onClick={() => router.push('/dashboard/jadwal')}
          >
            Lihat Kalender Penuh &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="font-body" style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
            Menyinkronkan data jadwal...
          </div>
        ) : upcomingSchedules.length === 0 ? (
          <div className="font-body" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>☕</span>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 600, margin: 0 }}>Santai dulu, belum ada jadwal terdekat.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingSchedules.map((schedule) => {
              const startDate = new Date(schedule.start_time);
              const endDate = new Date(schedule.end_time);
              const isToday = startDate.toDateString() === new Date().toDateString();

              return (
                <div key={schedule.id} className={`schedule-item ${isToday ? 'schedule-today' : ''}`}>
                  
                  {/* Ikon Kalender Estetik */}
                  <div className="cal-icon">
                    <div className="cal-month font-body" style={{ backgroundColor: isToday ? '#16a34a' : '#0f172a' }}>
                      {startDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </div>
                    <div className="cal-day font-heading" style={{ color: isToday ? '#16a34a' : '#0f172a' }}>
                      {startDate.getDate()}
                    </div>
                  </div>

                  {/* Info Utama */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h4 className="font-heading" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{schedule.event_name}</h4>
                      {isToday && <span className="font-body" style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.5px' }}>HARI INI</span>}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      <div className="font-body" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                      <div className="font-body" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        {schedule.room?.room_name || 'Luar Kantor'}
                      </div>
                    </div>
                  </div>

                  {/* Info Unit Pengaju (Hanya di Desktop) */}
                  <div className="unit-label font-body">
                    <span style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      {schedule.origin_unit}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}