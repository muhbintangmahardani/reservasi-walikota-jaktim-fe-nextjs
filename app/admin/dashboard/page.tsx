// frontend/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const router = useRouter();
  const [userCount, setUserCount] = useState<number | string>('...');
  const [adminName, setAdminName] = useState('Administrator');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // State Khusus Loading Tabel Log
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  // === STATE NOTIFIKASI ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // === DATA LOG RIWAYAT LOGIN ===
  const [recentLogins, setRecentLogins] = useState<any[]>([]);

  // Kunci Scroll saat Modal Terbuka
  useEffect(() => {
    if (showNotifModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showNotifModal]);

  // Jam Real-Time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data Utama & Polling Log (Real-time)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setAdminName(JSON.parse(userData).name || 'Administrator');
    }

    const fetchInitialData = async () => {
      try {
        const [resUsers, resNotif] = await Promise.all([
          api.get('/users'),
          api.get('/notifications').catch(() => ({ data: [] }))
        ]);
        
        setUserCount(resUsers.data.data ? resUsers.data.data.length : (resUsers.data.length || 0));
        setNotifications(resNotif.data.data || resNotif.data || []);
      } catch (error) {
        console.error("Gagal mengambil data statis dashboard:", error);
        setUserCount('?');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLiveLogs = async () => {
      try {
        const resLogs = await api.get('/login-logs');
        
        let logsData = [];
        if (resLogs.data && Array.isArray(resLogs.data.data)) {
          logsData = resLogs.data.data;
        } else if (Array.isArray(resLogs.data)) {
          logsData = resLogs.data;
        } else {
          return; 
        }

        if (logsData.length > 0) {
          const formattedLogs = logsData.slice(0, 5).map((log: any) => ({
            id: log.id,
            action: log.action || log.activity || 'Akses Sistem',
            user: typeof log.user === 'string' 
                  ? log.user 
                  : (log.user?.name || log.name || log.username || 'User Sistem'),
            time: new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: log.status || 'success' 
          }));
          setRecentLogins(formattedLogs);
        } else {
          setRecentLogins([]); 
        }
      } catch (error: any) {
        console.error("Gagal menarik data log realtime:", error.response?.data || error.message);
      } finally {
        // 🔥 MATIKAN SPINNER LOADING SETELAH API SELESAI 🔥
        setIsLogsLoading(false);
      }
    };

    fetchInitialData();
    fetchLiveLogs();

    const logInterval = setInterval(() => {
      fetchLiveLogs();
    }, 10000);

    return () => clearInterval(logInterval);
  }, []);

  const handleDismissNotif = async (notifId: number) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      await api.delete(`/notifications/${notifId}`);
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
    }
  };

  return (
    <div className="enterprise-dashboard">
      <style dangerouslySetInnerHTML={{__html: `
        .enterprise-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          font-family: var(--font-jakarta), sans-serif;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }

        /* ========================================= */
        /* HEADER SECTION                            */
        /* ========================================= */
        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .dash-greeting { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .dash-subtitle { font-size: 15px; color: #64748b; margin: 0; font-weight: 500; }
        
        .header-actions { display: flex; gap: 12px; align-items: center; }
        
        .clock-widget { display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .clock-icon { color: #4f46e5; animation: pulse-opacity 2s infinite; }
        .clock-text { font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; }
        .clock-date { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .notif-trigger { position: relative; background: white; border: 1px solid #e2e8f0; width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #475569; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); flex-shrink: 0; }
        .notif-trigger:hover { border-color: #cbd5e1; color: #0f172a; transform: translateY(-2px); }
        .notif-badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; font-size: 11px; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px #f8fafc; }

        /* ========================================= */
        /* SYSTEM OVERVIEW CARD (HERO)               */
        /* ========================================= */
        .overview-card { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 24px; padding: 32px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; box-shadow: 0 15px 30px -10px rgba(30, 27, 75, 0.4); position: relative; overflow: hidden; }
        .overview-card::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 50%; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.2) 0%, transparent 70%); pointer-events: none; }
        
        .ov-left { position: relative; z-index: 10; }
        .ov-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; display: block; }
        .ov-status { font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 12px; }
        .status-indicator { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); animation: pulse-green 2s infinite; }

        .ov-metrics { display: flex; gap: 32px; position: relative; z-index: 10; }
        .ov-metric-item { display: flex; flex-direction: column; }
        .ov-metric-val { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .ov-metric-lbl { font-size: 13px; color: #cbd5e1; font-weight: 500; margin-top: 4px; }

        /* ========================================= */
        /* STATS GRID                                */
        /* ========================================= */
        .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 24px; }
        .stat-box { background: white; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.01); position: relative; overflow: hidden; }
        .stat-box:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #cbd5e1; transform: translateY(-4px); }
        
        .stat-box-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .stat-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .trend-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .trend-up { background: #dcfce7; color: #16a34a; }
        .trend-neutral { background: #f1f5f9; color: #64748b; }
        
        .stat-box-title { font-size: 14px; font-weight: 700; color: #64748b; margin: 0 0 8px 0; }
        .stat-box-value { font-size: 36px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; letter-spacing: -1px; }

        /* ========================================= */
        /* 🔥 AKSES CEPAT (HORIZONTAL BANNER) 🔥     */
        /* ========================================= */
        .quick-action-banner {
          background: linear-gradient(to right, #ffffff, #f8fafc);
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: 0.3s;
        }
        .quick-action-banner:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        
        .qab-left { display: flex; align-items: center; gap: 24px; }
        .qab-icon { width: 64px; height: 64px; background: #eef2ff; color: #4f46e5; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .qab-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
        .qab-desc { font-size: 14px; color: #64748b; margin: 0; font-weight: 500; }
        
        .qab-btn { 
          background: #4f46e5; color: white; border: none; padding: 14px 28px; 
          border-radius: 14px; font-weight: 700; font-size: 14px; cursor: pointer; 
          display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; 
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); white-space: nowrap;
        }
        .qab-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(79, 70, 229, 0.3); background: #4338ca; }

        /* ========================================= */
        /* LOG TABLE PANEL (FULL WIDTH)              */
        /* ========================================= */
        .panel-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); width: 100%; box-sizing: border-box; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .panel-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }

        .log-table { width: 100%; border-collapse: collapse; }
        .log-table th { text-align: left; padding: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
        .log-table td { padding: 16px 0; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .log-table tr:last-child td { border-bottom: none; padding-bottom: 0; }
        
        .log-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 14px; flex-shrink: 0; }
        .bg-success { background-color: #22c55e; box-shadow: 0 0 0 3px #dcfce7; }
        .bg-warning { background-color: #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }
        .bg-error { background-color: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }

        .log-action-text { font-size: 15px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 4px; }
        .log-user-text { font-size: 13px; color: #64748b; font-weight: 500; }
        .log-time-badge { font-size: 13px; font-weight: 700; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; display: inline-block; }

        /* ========================================= */
        /* MODAL NOTIFIKASI                          */
        /* ========================================= */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
        .modal-card { background: white; width: 100%; max-width: 480px; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; max-height: 85vh; overflow: hidden; margin: auto; }
        .modal-header { padding: 24px 32px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
        .close-modal-btn { background: white; border: 1px solid #e2e8f0; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-modal-btn:hover { background: #f1f5f9; color: #0f172a; }
        
        .modal-body { padding: 0; overflow-y: auto; flex: 1; }
        .notif-item { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
        .notif-item:hover { background: #f8fafc; }
        .notif-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .notif-title-group { display: flex; align-items: center; gap: 12px; }
        .notif-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
        .notif-msg { font-size: 14px; color: #64748b; margin: 0 0 12px 0; line-height: 1.6; padding-left: 32px; }
        .btn-dismiss { font-size: 12px; font-weight: 700; color: #4f46e5; background: #eef2ff; border: none; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: 0.2s; margin-left: 32px; }
        .btn-dismiss:hover { background: #e0e7ff; color: #3730a3; }

        /* ANIMATIONS */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        @keyframes pulse-opacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        /* 🔥 ANIMASI LOADING SPINNER 🔥 */
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* ========================================= */
        /* RESPONSIVE DESIGN (IPAD & MOBILE)         */
        /* ========================================= */
        @media (max-width: 1024px) {
          .overview-card { flex-direction: column; align-items: flex-start; gap: 24px; padding: 28px; }
          .ov-metrics { width: 100%; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
          .quick-action-banner { padding: 24px; }
        }

        @media (max-width: 768px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
          .dash-greeting { font-size: 24px; }
          .dash-subtitle { font-size: 14px; }
          .header-actions { width: 100%; justify-content: space-between; }
          .clock-widget { padding: 8px 12px; }
          .clock-text { font-size: 13px; }
          
          .overview-card { padding: 24px; border-radius: 20px; }
          .ov-status { font-size: 20px; }
          .ov-metric-val { font-size: 24px; }
          .ov-metrics { gap: 16px; }

          .stats-container { grid-template-columns: 1fr; gap: 16px; }
          .stat-box { padding: 20px; border-radius: 16px; }
          .stat-box-value { font-size: 32px; }
          
          .quick-action-banner { flex-direction: column; align-items: flex-start; gap: 20px; padding: 20px; border-radius: 20px; }
          .qab-left { flex-direction: column; align-items: flex-start; gap: 16px; }
          .qab-icon { width: 48px; height: 48px; font-size: 24px; border-radius: 14px; }
          .qab-btn { width: 100%; justify-content: center; }

          .panel-card { padding: 20px; border-radius: 20px; }
          .log-table thead { display: none; }
          .log-table tbody tr { 
            display: flex; flex-direction: column; padding: 16px 0; 
            border-bottom: 1px dashed #cbd5e1; gap: 12px; align-items: flex-start;
          }
          .log-table tbody tr:last-child { border-bottom: none; }
          .log-table td { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 0; border: none; width: 100%; text-align: left; 
          }
          
          .log-table td:nth-child(1) { flex-direction: row; align-items: flex-start; gap: 8px; }
          .log-table td:nth-child(2)::before { content: 'Waktu Akses:'; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
          .log-table td:nth-child(3)::before { content: 'Status:'; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
          
          .modal-card { border-radius: 20px; }
          .modal-header { padding: 16px 20px; }
          .notif-item { padding: 20px; flex-direction: column; align-items: flex-start; gap: 12px; }
          .notif-top { flex-direction: column; gap: 8px; }
          .notif-msg { padding-left: 0; }
          .btn-dismiss { margin-left: 0; width: 100%; text-align: center; margin-top: 8px; }
        }
      `}} />

      {/* --- HEADER --- */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting font-heading">Sistem Analitik Admin.</h1>
          <p className="dash-subtitle">Pantau kesehatan sistem, log aktivitas, dan kelola otoritas pengguna.</p>
        </div>
        
        <div className="header-actions">
          <div className="clock-widget">
            <svg className="clock-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <div className="clock-text font-heading">{currentTime.toLocaleTimeString('id-ID')} WIB</div>
              <div className="clock-date">{currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <button className="notif-trigger" onClick={() => setShowNotifModal(true)}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
        </div>
      </div>

      {/* --- SYSTEM OVERVIEW HERO --- */}
      <div className="overview-card">
        <div className="ov-left">
          <span className="ov-label">Status Server Saat Ini</span>
          <div className="ov-status font-heading">
            <div className="status-indicator"></div>
            Sistem Berjalan Optimal
          </div>
        </div>
        <div className="ov-metrics font-heading">
          <div className="ov-metric-item">
            <span className="ov-metric-val">99.9%</span>
            <span className="ov-metric-lbl">Uptime Server</span>
          </div>
          <div className="ov-metric-item">
            <span className="ov-metric-val">ID-01</span>
            <span className="ov-metric-lbl">Cluster Node</span>
          </div>
          <div className="ov-metric-item">
            <span className="ov-metric-val">Aman</span>
            <span className="ov-metric-lbl">Protokol Keamanan</span>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-box-header">
            <div className="stat-icon-wrap" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div className="trend-badge trend-up">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg> Aktif
            </div>
          </div>
          <p className="stat-box-title">Total Akun Terdaftar</p>
          <h3 className="stat-box-value font-heading">{isLoading ? '...' : userCount}</h3>
        </div>

        <div className="stat-box">
          <div className="stat-box-header">
            <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className="trend-badge trend-neutral">Sistem</div>
          </div>
          <p className="stat-box-title">Pembaruan Database</p>
          <h3 className="stat-box-value font-heading">Real-Time</h3>
        </div>

        <div className="stat-box">
          <div className="stat-box-header">
            <div className="stat-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div className="trend-badge trend-up">Terlindungi</div>
          </div>
          <p className="stat-box-title">Integritas Keamanan</p>
          <h3 className="stat-box-value font-heading">100%</h3>
        </div>
      </div>

      {/* --- 🔥 AKSES CEPAT (HORIZONTAL BANNER) 🔥 --- */}
      <div className="quick-action-banner">
        <div className="qab-left">
          <div className="qab-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <h3 className="qab-title font-heading">Kelola Pengguna Sistem</h3>
            <p className="qab-desc font-body">Pusat kendali untuk menambah admin, mengatur hak akses, atau mereset password akun.</p>
          </div>
        </div>
        <button className="qab-btn font-heading" onClick={() => router.push('/admin/users')}>
          Buka Manajemen User
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>

      {/* --- LOG TABLE (FULL WIDTH) --- */}
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title font-heading">Log Audit Otorisasi</h3>
        </div>
        
        <table className="log-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Aktivitas / Pengguna</th>
              <th style={{ width: '25%' }}>Waktu Sistem</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* 🔥 LOGIKA LOADING SPINNER DITERAPKAN DI SINI 🔥 */}
            {isLogsLoading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: '36px', height: '36px', border: '4px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Memuat log aktivitas terkini...</span>
                </td>
              </tr>
            ) : recentLogins.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p style={{ margin: 0, fontWeight: 600 }}>Sistem sedang berjalan. Belum ada aktivitas log yang ditarik dari server.</p>
                </td>
              </tr>
            ) : (
              recentLogins.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span className={`log-status-dot ${log.status === 'success' ? 'bg-success' : log.status === 'warning' ? 'bg-warning' : 'bg-error'}`} style={{ marginTop: '6px' }}></span>
                      <div>
                        <span className="log-action-text">{log.action}</span>
                        <span className="log-user-text">{log.user}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="log-time-badge">{log.time}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: log.status === 'success' ? '#16a34a' : log.status === 'warning' ? '#d97706' : '#dc2626' }}>
                      {log.status === 'success' ? 'Berhasil' : log.status === 'warning' ? 'Peringatan' : 'Gagal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* MODAL NOTIFIKASI LAYANG (Bebas Bug Scroll)                  */}
      {/* ========================================================= */}
      {showNotifModal && (
        <div className="modal-overlay" onClick={() => setShowNotifModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h3 className="font-heading">Pusat Notifikasi</h3>
              <button className="close-modal-btn" onClick={() => setShowNotifModal(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="modal-body">
              {notifications.length === 0 ? (
                <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                  <p style={{ margin: 0, fontSize: '15px', color: '#64748b', fontWeight: 600 }}>Sistem aman, tidak ada pesan masuk.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="notif-item">
                    <div className="notif-top">
                      <div className="notif-title-group">
                        <span style={{ fontSize: '18px' }}>{notif.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <h4 className="notif-title">{notif.title}</h4>
                      </div>
                      <span className="notif-time">{new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                    <p className="notif-msg">{notif.message}</p>
                    <button className="btn-dismiss" onClick={() => handleDismissNotif(notif.id)}>
                      Tandai Sudah Dibaca
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}