// frontend/app/sekpim/layout.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function SekpimLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  // State untuk Dropdown Profil
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const token = document.cookie.includes('token');
    if (!token) {
      window.location.href = '/login-vip';
    } else {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, []);

  // Tutup sidebar dan profil saat pindah rute
  useEffect(() => {
    setIsOpen(false);
    setShowProfile(false);
  }, [pathname]);

  // Deteksi klik di luar dropdown profil untuk menutupnya otomatis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfile]);

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/sekpim/dashboard', 
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> 
    },
    { 
      name: 'Kelola Jadwal', 
      path: '/sekpim/jadwal', 
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
    },
    { 
      name: 'Kelola Reservasi', 
      path: '/sekpim/reservasi', 
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login-vip';
  };

  const getPageTitle = () => {
    if (pathname.includes('/sekpim/dashboard')) return 'Dashboard Eksekutif';
    if (pathname.includes('/sekpim/jadwal')) return 'Kelola Jadwal';
    if (pathname.includes('/sekpim/reservasi')) return 'Kelola Reservasi';
    return 'Portal Pimpinan';
  };

  if (!isClient) return null;

  return (
    <div className="layout-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        body { margin: 0; padding: 0; background-color: #f8fafc; }
        .layout-wrapper { display: flex; min-height: 100vh; font-family: var(--font-jakarta), sans-serif; overflow: hidden; }
        
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }
        
        /* ========================================= */
        /* SIDEBAR GELAP EKSKLUSIF VIP               */
        /* ========================================= */
        .sekpim-sidebar { 
          width: 280px; 
          background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%); 
          height: 100vh; position: fixed; left: 0; top: 0; color: white; 
          display: flex; flex-direction: column; z-index: 1000; 
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;
          box-shadow: 10px 0 25px rgba(30, 27, 75, 0.15);
        }
        
        .sidebar-header {
          height: 80px; box-sizing: border-box; padding: 0 24px; 
          border-bottom: 1px solid rgba(255,255,255,0.08); 
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }

        .sidebar-logo { display: flex; align-items: center; gap: 14px; overflow: hidden; }
        .logo-text-container { display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        
        .logo-text { 
          font-weight: 800; font-size: 16px; letter-spacing: 0.5px; color: #f8fafc; 
          margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
        }
        .logo-subtext { 
          font-size: 11px; color: #a5b4fc; margin: 0; text-transform: uppercase; letter-spacing: 1px; 
          font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
        }
        
        .menu-list { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 24px 16px; overflow-y: auto; }
        .menu-item { 
          display: flex; align-items: center; gap: 14px; padding: 14px 18px; 
          border-radius: 14px; cursor: pointer; transition: all 0.2s ease; color: #a5b4fc; 
          font-weight: 700; text-decoration: none; font-size: 14.5px; white-space: nowrap;
          border: 1px solid transparent;
        }
        .menu-item:hover { background: rgba(255,255,255,0.06); color: white; }
        
        .menu-item.active { 
          background: #4f46e5; color: white; 
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); 
          border-color: #6366f1;
        }

        /* ========================================= */
        /* MAIN AREA & NAVBAR SOLID WHITE            */
        /* ========================================= */
        .main-area { 
          flex: 1; margin-left: 280px; display: flex; flex-direction: column; 
          width: calc(100% - 280px); transition: margin-left 0.3s, width 0.3s;
          height: 100vh; overflow-y: auto; scroll-behavior: smooth;
        }

        .top-navbar {
          height: 80px; 
          background: #ffffff; 
          border-bottom: 1px solid #e2e8f0; 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 0 40px; position: sticky; top: 0; z-index: 90; flex-shrink: 0; gap: 16px;
        }
        
        .nav-left { 
          display: flex; align-items: center; gap: 16px; min-width: 0; 
        }
        
        /* 🔥 ANTI-KEBOCORAN CSS FIX: Mengunci Ukuran Judul secara Absolut 🔥 */
        .navbar-sekpim-title-locked { 
          font-size: 18px !important; 
          font-weight: 800 !important; 
          color: #0f172a !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          white-space: nowrap !important; 
          overflow: hidden !important; 
          text-overflow: ellipsis !important;
          letter-spacing: -0.5px !important;
          line-height: 1.2 !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .hamburger-btn { 
          display: none; background: none; border: none; color: #0f172a; 
          cursor: pointer; padding: 8px; margin-left: -8px; border-radius: 8px; transition: 0.2s;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hamburger-btn:active { background: #f1f5f9; }

        /* ========================================= */
        /* DROPDOWN PROFIL & LOGOUT                  */
        /* ========================================= */
        .profile-wrapper { position: relative; flex-shrink: 0; display: flex; align-items: center; }
        .profile-btn { 
          display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #f1f5f9; 
          padding: 6px 16px 6px 6px; border-radius: 30px; cursor: pointer; transition: 0.2s; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02); font-family: var(--font-jakarta), sans-serif;
        }
        .profile-btn:hover { background: #f8fafc; border-color: #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
        
        .nav-avatar { 
          width: 36px; height: 36px; background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%); 
          color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          font-weight: 800; font-size: 14px; flex-shrink: 0; 
        }
        .nav-info { display: flex; flex-direction: column; text-align: left; }
        .nav-name { font-size: 14px; font-weight: 700; color: #0f172a; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; margin-bottom: 2px;}
        .nav-role { font-size: 11px; color: #64748b; text-transform: capitalize; font-weight: 600; line-height: 1; }

        .profile-dropdown { 
          position: absolute; top: calc(100% + 12px); right: 0; width: 220px; background: white; 
          border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
          padding: 8px; z-index: 100; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .dropdown-header { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 8px; background: #f8fafc; border-radius: 12px 12px 0 0; }
        .dropdown-item { 
          width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
          border-radius: 12px; border: none; background: transparent; cursor: pointer; 
          font-size: 14px; font-weight: 700; transition: 0.2s; box-sizing: border-box;
          font-family: var(--font-jakarta), sans-serif;
        }
        .logout-btn { color: #ef4444; }
        .logout-btn:hover { background: #fef2f2; color: #dc2626; }

        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .content-body { flex: 1; position: relative; }
        
        .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 990; backdrop-filter: blur(4px); transition: opacity 0.3s; opacity: 0; pointer-events: none; }
        .mobile-overlay.show { display: block; opacity: 1; pointer-events: auto; }

        /* ========================================= */
        /* RESPONSIVE IPAD & MOBILE                  */
        /* ========================================= */
        @media (max-width: 1024px) {
          .sekpim-sidebar { transform: translateX(-100%); box-shadow: 20px 0 25px -5px rgba(0,0,0,0.1); }
          .sekpim-sidebar.open { transform: translateX(0); }
          .main-area { margin-left: 0; width: 100%; }
          .top-navbar { padding: 0 32px; }
          .hamburger-btn { display: flex; }
          .mobile-overlay { display: block; }
        }

        @media (max-width: 768px) {
          .top-navbar { padding: 0 20px; }
          .sidebar-header { padding: 0 20px; }
          .nav-info { display: none; }
          .profile-btn { padding: 6px; }
          
          /* 🔥 FIX MOBILE: Ukuran Font disesuaikan dengan !important 🔥 */
          .navbar-sekpim-title-locked { font-size: 16px !important; } 
        }
      `}} />

      <div className={`mobile-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)}></div>

      {/* ========================================================= */}
      {/* SIDEBAR                                                   */}
      {/* ========================================================= */}
      <aside className={`sekpim-sidebar ${isOpen ? 'open' : ''}`}>
        
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '12px', padding: '4px', boxSizing: 'border-box', flexShrink: 0 }}>
              <img 
                src="/Lambang_Kota_Jakarta_Timur.png" 
                alt="Logo Jaktim" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/City_of_Jakarta_Timur_Logo.png/200px-City_of_Jakarta_Timur_Logo.png"; }} 
              />
            </div>
            <div className="logo-text-container">
              <span className="logo-text font-heading">SMART ROOM</span>
              <span className="logo-subtext font-body">Portal Pimpinan</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hamburger-btn" style={{ color: '#a5b4fc', display: 'none' }} id="close-sidebar-mobile">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <style>{`@media (max-width: 1024px) { #close-sidebar-mobile { display: flex !important; } }`}</style>
        </div>

        <nav className="menu-list">
          {menuItems.map((item) => (
            <a
              key={item.path}
              onClick={() => { router.push(item.path); setIsOpen(false); }}
              className={`menu-item font-body ${pathname === item.path ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* MAIN AREA & NAVBAR                                        */}
      {/* ========================================================= */}
      <main className="main-area">
        <header className="top-navbar">
          <div className="nav-left">
            <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            {/* 🔥 MENGGUNAKAN CLASS BARU YANG SUDAH DIKUNCI 🔥 */}
            <h1 className="navbar-sekpim-title-locked font-heading">{getPageTitle()}</h1>
          </div>

          <div className="profile-wrapper" ref={profileRef}>
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="nav-avatar font-heading">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
              </div>
              <div className="nav-info font-body">
                <span className="nav-name">{user?.name || 'Pimpinan User'}</span>
                <span className="nav-role">{user?.role || 'VIP Access'}</span>
              </div>
              <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '4px', marginRight: '4px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {/* DROPDOWN LOGOUT */}
            {showProfile && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <p className="font-body" style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Masuk Sebagai</p>
                  <p className="font-heading" style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#0f172a', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Pimpinan User'}</p>
                </div>
                
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Keluar / Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
}