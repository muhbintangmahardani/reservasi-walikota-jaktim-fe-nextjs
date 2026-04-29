// frontend/app/dashboard/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // States Notifikasi
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // States Profil User
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('User Bagian');
  const [userInitials, setUserInitials] = useState('U');

  // ==========================================================
  // NOMOR WA ADMIN (Ganti dengan nomor asli Admin Anda)
  // Format: Gunakan 62 tanpa angka 0 di depan. Contoh: 628123456789
  // ==========================================================
  const ADMIN_WA_NUMBER = "6281234567890"; 
  const WA_MESSAGE = encodeURIComponent("Halo Admin Smart Room Kominfotik, saya butuh bantuan/panduan terkait sistem reservasi ruangan.");

  // ==========================================================
  // PENJAGA PINTU & AMBIL DATA USER
  // ==========================================================
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const role = user.role?.toLowerCase() || '';
      
      // Jika BUKAN user_bagian, usir!
      if (role !== 'user_bagian') {
        window.location.href = '/login-vip';
        return;
      }

      const name = user.name || 'User Bagian';
      setUserName(name);
      setUserInitials(name.charAt(0).toUpperCase());

    } else {
      window.location.href = '/'; 
    }
  }, [pathname]);

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
      } catch (err) {} 
    };
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000); 
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Gagal update status notifikasi');
    }
  };

  useEffect(() => {
    setIsSidebarOpen(false);
    setShowNotif(false);
    setShowProfile(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    if (showNotif || showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotif, showProfile]);

  const getPageTitle = () => {
    if (pathname.includes('/jadwal-pimpinan')) return 'Jadwal Pimpinan';
    if (pathname.includes('/jadwal/create')) return 'Isi Form Reservasi';
    if (pathname.includes('/jadwal')) return 'Cek Jadwal Ruangan';
    if (pathname.includes('/history')) return 'Riwayat Pengajuan';
    if (pathname.includes('/laporan')) return 'Laporan Penggunaan';
    return 'Beranda Utama';
  };

  return (
    <div className="layout-container">
      
      {/* CSS LAYOUT BERSIH & PREMIUM */}
      <style dangerouslySetInnerHTML={{__html: `
        .layout-container { 
          display: flex; height: 100vh; background-color: #f8fafc; 
          font-family: var(--font-jakarta), sans-serif; overflow: hidden; 
        }
        
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }
        
        /* --- SIDEBAR --- */
        .sidebar { 
          width: 280px; background: #ffffff; border-right: 1px solid #f1f5f9; 
          display: flex; flex-direction: column; z-index: 50; flex-shrink: 0; 
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); height: 100vh;
          box-shadow: 4px 0 24px rgba(0,0,0,0.02);
        }
        .sidebar-header { 
          height: 80px; box-sizing: border-box; padding: 0 24px; 
          border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; 
          justify-content: space-between; flex-shrink: 0;
        }
        
        .main-wrapper { flex: 1; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; position: relative; scroll-behavior: smooth; }
        
        /* --- TOP NAVBAR --- */
        .top-header { 
          height: 80px; flex-shrink: 0; box-sizing: border-box; display: flex; 
          align-items: center; justify-content: space-between; padding: 0 40px; 
          background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); 
          border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 40; 
        }
        .hamburger-btn { display: none; background: none; border: none; color: #0f172a; cursor: pointer; padding: 8px; margin-left: -8px; border-radius: 8px; transition: background 0.2s; }
        .hamburger-btn:active { background: #f1f5f9; }
        
        .main-content { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .spacer-anti-mepet { display: none; } 

        /* --- UI NAVBAR KANAN (NOTIFIKASI & PROFIL) --- */
        .nav-right-actions { display: flex; align-items: center; gap: 16px; }

        .notif-wrapper { position: relative; }
        .notif-panel { 
          position: absolute; top: calc(100% + 16px); right: 0; width: 380px; max-height: 500px; 
          background-color: #ffffff; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); 
          border: 1px solid #f1f5f9; z-index: 100; display: flex; flex-direction: column; overflow: hidden; 
          animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        /* --- DROPDOWN PROFIL --- */
        .profile-wrapper { position: relative; }
        .profile-btn { 
          display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #f1f5f9; 
          padding: 6px 16px 6px 6px; border-radius: 30px; cursor: pointer; transition: 0.2s; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02); font-family: var(--font-jakarta), sans-serif;
        }
        .profile-btn:hover { background: #f8fafc; border-color: #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
        .profile-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
        .profile-name { font-size: 14px; font-weight: 700; color: #0f172a; white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
        
        .profile-dropdown { 
          position: absolute; top: calc(100% + 16px); right: 0; width: 240px; background: white; 
          border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
          padding: 8px; z-index: 100; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .dropdown-item { 
          width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; 
          border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 700; 
          transition: 0.2s; font-family: var(--font-jakarta), sans-serif;
        }
        .logout-btn { color: #ef4444; }
        .logout-btn:hover { background: #fef2f2; color: #dc2626; }

        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .glass-overlay { display: none; }

        /* --- KARTU BANTUAN SIDEBAR BAWAH --- */
        .sidebar-footer-card {
          margin-top: auto; 
          padding: 24px;
        }
        .help-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px;
          text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .help-btn {
          width: 100%; background: #2563eb; color: #fff; border: none;
          padding: 12px 10px; border-radius: 12px; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: all 0.2s; font-family: var(--font-jakarta), sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .help-btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(37, 99, 235, 0.3); }

        /* --- RESPONSIVE IPAD & MOBILE --- */
        @media (max-width: 1024px) {
          .sidebar { position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 20px 0 25px -5px rgba(0,0,0,0.1); }
          .glass-overlay { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 45; }
          
          .top-header { padding: 0 32px; } 
          .hamburger-btn { display: flex; align-items: center; justify-content: center; }
          .main-content { padding: 0 32px 40px 32px; } 
          .spacer-anti-mepet { display: block; height: 32px; width: 100%; flex-shrink: 0; }
        }

        @media (max-width: 768px) {
          .top-header { padding: 0 20px; } 
          .sidebar-header { padding: 0 20px; }
          .main-content { padding: 0 20px 80px 20px; } 
          .spacer-anti-mepet { display: block; height: 48px; width: 100%; flex-shrink: 0; }
          
          .profile-name { display: none; }
          .profile-btn { padding: 6px; } 
          
          .notif-panel { 
            position: fixed !important; top: 80px !important; right: 20px !important; left: 20px !important; 
            width: auto !important; max-height: 65vh !important; z-index: 9999 !important; 
          }
        }
      `}} />

      {isSidebarOpen && <div className="glass-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* ========================================================= */}
      {/* SIDEBAR                                                   */}
      {/* ========================================================= */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/Lambang_Kota_Jakarta_Timur.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/City_of_Jakarta_Timur_Logo.png/200px-City_of_Jakarta_Timur_Logo.png"; }} />
            </div>
            <div>
              <h1 className="font-heading" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>Smart Room</h1>
              <p className="font-body" style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 600 }}>Kominfotik Jaktim</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="hamburger-btn" style={{ fontSize: '28px', color: '#64748b', padding: '4px' }}>&times;</button>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
          <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} style={getNavItemStyle(pathname === '/dashboard')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Beranda Utama
          </Link>
          <Link href="/dashboard/jadwal" onClick={() => setIsSidebarOpen(false)} style={getNavItemStyle(pathname.includes('/dashboard/jadwal') && !pathname.includes('jadwal-pimpinan'))}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Cek Jadwal Ruangan
          </Link>
          <Link href="/dashboard/history" onClick={() => setIsSidebarOpen(false)} style={getNavItemStyle(pathname === '/dashboard/history')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Riwayat Pengajuan
          </Link>
          <Link href="/dashboard/jadwal-pimpinan" onClick={() => setIsSidebarOpen(false)} style={getNavItemStyle(pathname === '/dashboard/jadwal-pimpinan')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
            Jadwal Pimpinan
          </Link>
          <Link href="/dashboard/laporan" onClick={() => setIsSidebarOpen(false)} style={getNavItemStyle(pathname.includes('/dashboard/laporan'))}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Laporan PDF
          </Link>

          {/* 🔥 KARTU BANTUAN SIDEBAR BAWAH (LINK WA) 🔥 */}
          <div className="sidebar-footer-card">
            <div className="help-box">
              <div style={{ width: '40px', height: '40px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h4 className="font-heading" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Butuh Bantuan?</h4>
              <p className="font-body" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4, fontWeight: 500 }}>Hubungi admin via WhatsApp jika butuh panduan sistem.</p>
              
              {/* TAUTAN WHATSAPP OTOMATIS */}
              <a 
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${WA_MESSAGE}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none' }}
              >
                <button className="help-btn">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  Kontak Admin WA
                </button>
              </a>

            </div>
          </div>
          
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT & TOP NAVBAR                                 */}
      {/* ========================================================= */}
      <div className="main-wrapper">
        
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {getPageTitle()}
            </h2>
          </div>

          <div className="nav-right-actions">
            
            {/* 🔔 TOMBOL NOTIFIKASI */}
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} 
                style={{ position: 'relative', background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} 
                onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="font-body" style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN NOTIFIKASI */}
              {showNotif && (
                <div className="notif-panel">
                  <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h3 className="font-heading" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Pemberitahuan</h3>
                    {unreadCount > 0 && <button className="font-body" onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Tandai Dibaca</button>}
                  </div>
                  
                  <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
                    {notifications.length === 0 ? (
                      <div className="font-body" style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#94a3b8' }}>
                          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: 600 }}>Kotak masuk bersih.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="font-body" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: notif.is_read ? '#fff' : '#eff6ff', transition: 'background 0.2s', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', marginTop: '6px', backgroundColor: notif.type === 'success' ? '#22c55e' : notif.type === 'error' ? '#ef4444' : '#3b82f6', flexShrink: 0, boxShadow: notif.is_read ? 'none' : '0 0 0 4px rgba(59,130,246,0.1)' }}></div>
                            <div>
                              <p className="font-heading" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{notif.title}</p>
                              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5, fontWeight: 500 }}>{notif.message}</p>
                              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 👤 TOMBOL PROFIL & LOGOUT */}
            <div className="profile-wrapper" ref={profileRef}>
              <button 
                className="profile-btn" 
                onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              >
                <div className="profile-avatar">{userInitials}</div>
                <span className="profile-name font-body">{userName}</span>
                <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '4px', marginRight: '4px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {/* DROPDOWN PROFIL */}
              {showProfile && (
                <div className="profile-dropdown">
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', backgroundColor: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
                    <p className="font-body" style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Masuk Sebagai</p>
                    <p className="font-heading" style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
                  </div>
                  
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Keluar / Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="main-content">
          <div className="spacer-anti-mepet"></div>
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper Style untuk Navigasi Aktif
function getNavItemStyle(isActive: boolean) {
  return {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '14px',
    fontSize: '14.5px', fontWeight: 700, textDecoration: 'none', color: isActive ? '#fff' : '#64748b',
    backgroundColor: isActive ? '#0f172a' : 'transparent', transition: 'all 0.2s ease', border: 'none', 
    textAlign: 'left' as const, fontFamily: 'var(--font-jakarta), sans-serif',
    boxShadow: isActive ? '0 10px 15px -3px rgba(15, 23, 42, 0.2)' : 'none'
  };
}