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
  const [lastSync, setLastSync] = useState('');

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
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    } catch (error) {
      // Ignore error for now to keep UI clean
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

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '40px' }}>
      
      {/* CSS PERBAIKAN: Memindahkan Media Query ke tag Style */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .desktop-origin-unit { display: block; }
        @media (max-width: 768px) {
          .desktop-origin-unit { display: none; }
        }
      `}} />

      {/* HEADER & LIVE INDICATOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Halo, {userName || 'Bapak/Ibu'} 👋
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            {unitName || 'User Bagian'} - Selamat datang di Dashboard Smart Room Kominfotik.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', width: '10px', height: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', position: 'absolute', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
            Live Sync • Terakhir: {lastSync || '...'}
          </span>
        </div>
      </div>

      {/* KARTU STATISTIK */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Pengajuan</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.total}</h3>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fef9c3', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Menunggu Verifikasi</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.pending}</h3>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#dcfce7', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Disetujui</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.verified}</h3>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Ditolak</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{isLoading ? '-' : stats.rejected}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* JADWAL TERDEKAT */}
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Jadwal Ruangan Terdekat</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Agenda terverifikasi yang akan datang dalam waktu dekat.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/jadwal')}
            style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            Lihat Kalender &rarr;
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
            Memuat jadwal...
          </div>
        ) : upcomingSchedules.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Belum ada jadwal terverifikasi dalam waktu dekat.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingSchedules.map((schedule) => {
              const startDate = new Date(schedule.start_time);
              const endDate = new Date(schedule.end_time);
              const isToday = startDate.toDateString() === new Date().toDateString();

              return (
                <div key={schedule.id} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: isToday ? '#eff6ff' : '#f8fafc', borderRadius: '12px', border: `1px solid ${isToday ? '#bfdbfe' : '#e2e8f0'}`, alignItems: 'center' }}>
                  
                  <div style={{ minWidth: '60px', textAlign: 'center', padding: '8px', backgroundColor: isToday ? '#2563eb' : '#fff', borderRadius: '10px', border: isToday ? 'none' : '1px solid #e2e8f0', color: isToday ? '#fff' : '#0f172a' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px 0', opacity: isToday ? 0.9 : 0.6 }}>
                      {startDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </p>
                    <p style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                      {startDate.getDate()}
                    </p>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{schedule.event_name}</h4>
                      {isToday && <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px' }}>HARI INI</span>}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        {schedule.room?.room_name || 'Luar Kantor'}
                      </div>
                    </div>
                  </div>

                  {/* KELAS CSS AMAN UNTUK REACT */}
                  <div className="desktop-origin-unit">
                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, margin: 0, textAlign: 'right' }}>{schedule.origin_unit}</p>
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