// frontend/app/admin/layout.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  // State untuk Dropdown Profil
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // PENJAGA PINTU KHUSUS ADMIN
  // ==========================================================
  useEffect(() => {
    setIsClient(true);
    const token = document.cookie.includes('token');
    if (!token) {
      window.location.href = '/login-admin';
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Jika yang mencoba masuk BUKAN admin, tendang keluar!
        if (parsedUser.role !== 'admin_kominfotik') {
          window.location.href = '/login-admin';
        } else {
          setUser(parsedUser);
        }
      } else {
        window.location.href = '/login-admin';
      }
    }
  }, []);

  // Tutup sidebar dan profil saat pindah rute
  useEffect(() => {
    setIsOpen(false);
    setShowProfile(false);
  }, [pathname]);

  // Deteksi klik di luar dropdown profil
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

  // 🔥 MENU KHUSUS ADMIN DENGAN IKON SVG MODERN 🔥
  const menuItems = [
    { 
      name: 'Dashboard Admin', 
      path: '/admin/dashboard', 
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> 
    },
    { 
      name: 'Manajemen User', 
      path: '/admin/users', 
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login-admin';
  };

  const getPageTitle = () => {
    if (pathname.includes('/admin/dashboard')) return 'Pusat Kendali Admin';
    if (pathname.includes('/admin/users')) return 'Manajemen Pengguna';
    return 'Portal Administrator';
  };

  if (!isClient) return null;

  return (
    <div className="layout-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        body { margin: 0; padding: 0; background-color: #f8fafc; }
        .layout-wrapper { display: flex; min-height: 100vh; font-family: var(--font-jakarta), sans-serif; overflow: hidden; background-color: #f8fafc; }
        
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* ========================================= */
        /* SIDEBAR KIRI                             */
        /* ========================================= */
        .admin-sidebar { 
          width: 280px; 
          background: #0f172a; 
          height: 100vh; position: fixed; left: 0; top: 0; color: white; display: flex; flex-direction: column; 
          z-index: 1000; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-sizing: border-box;
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }
        
        .sidebar-header {
          height: 84px; box-sizing: border-box; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.08); 
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }

        .sidebar-logo { display: flex; align-items: center; gap: 12px; overflow: hidden; min-width: 0; }
        .logo-text-container { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
        
        .logo-text { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: #f8fafc; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .logo-subtext { font-size: 11px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .close-sidebar-btn {
          display: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          color: #94a3b8; cursor: pointer; padding: 8px; border-radius: 12px; transition: 0.2s;
          align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px;
        }
        .close-sidebar-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }

        .menu-list { flex: 1; display: flex; flex-direction: column; gap: 10px; padding: 28px 20px; overflow-y: auto; }
        
        .menu-item { 
          display: flex; align-items: center; gap: 14px; padding: 16px 20px; 
          border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: #94a3b8; 
          font-weight: 600; text-decoration: none; font-size: 15px; white-space: nowrap; border: 1px solid transparent;
        }
        .menu-item:hover { background: rgba(255,255,255,0.05); color: white; transform: translateX(6px); }
        .menu-item.active { 
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); 
          color: white; border-color: #3730a3; box-shadow: 0 10px 20px -5px rgba(67, 56, 202, 0.4); 
        }

        /* ========================================= */
        /* AREA UTAMA & NAVBAR ATAS                  */
        /* ========================================= */
        .main-area { 
          flex: 1; margin-left: 280px; display: flex; flex-direction: column; 
          width: calc(100% - 280px); transition: margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s;
          height: 100vh; overflow-y: auto; background-color: #f8fafc;
        }

        .top-navbar {
          height: 84px; 
          background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; 
          padding: 0 40px; position: sticky; top: 0; z-index: 90; flex-shrink: 0; gap: 16px;
        }
        
        .nav-left { display: flex; align-items: center; gap: 20px; min-width: 0; }
        .page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.5px; }
        
        .hamburger-btn { 
          display: none; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 24px; color: #0f172a; 
          cursor: pointer; padding: 10px; margin-left: -8px; border-radius: 12px; transition: 0.2s;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hamburger-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

        /* ========================================= */
        /* PROFIL DROPDOWN                           */
        /* ========================================= */
        .profile-wrapper { position: relative; flex-shrink: 0; }
        .profile-btn { 
          display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #e2e8f0; 
          padding: 6px 20px 6px 6px; border-radius: 30px; cursor: pointer; transition: all 0.3s ease; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02); font-family: inherit;
        }
        .profile-btn:hover { background: #f8fafc; border-color: #cbd5e1; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transform: translateY(-1px); }
        
        .nav-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(67, 56, 202, 0.3); }
        .nav-info { display: flex; flex-direction: column; text-align: left; }
        .nav-name { font-size: 14px; font-weight: 800; color: #0f172a; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-role { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-top: 2px; }

        .profile-dropdown { 
          position: absolute; top: calc(100% + 12px); right: 0; width: 240px; background: white; 
          border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); 
          padding: 8px; z-index: 100; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .dropdown-header { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; background: #f8fafc; border-radius: 12px 12px 0 0; text-align: left; }
        .dropdown-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 800; transition: 0.2s; box-sizing: border-box; font-family: inherit; }
        .logout-btn { color: #ef4444; }
        .logout-btn:hover { background: #fef2f2; color: #b91c1c; transform: translateX(4px); }

        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        /* ========================================= */
        /* KONTEN & OVERLAY                          */
        /* ========================================= */
        .content-body { flex: 1; position: relative; padding: 32px 40px; }
        
        .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 990; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: opacity 0.3s; opacity: 0; pointer-events: none; }
        .mobile-overlay.show { display: block; opacity: 1; pointer-events: auto; }

        /* ========================================= */
        /* RESPONSIVE DESIGN (IPAD & MOBILE)         */
        /* ========================================= */
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%); box-shadow: 20px 0 25px -5px rgba(0,0,0,0.1); width: 260px; } /* Lebar sidebar sedikit dikecilkan di tablet */
          .admin-sidebar.open { transform: translateX(0); }
          .main-area { margin-left: 0; width: 100%; }
          .top-navbar { padding: 0 32px; }
          .hamburger-btn { display: flex; }
          .close-sidebar-btn { display: flex; } 
          .mobile-overlay { display: block; }
          .content-body { padding: 32px; }
        }

        @media (max-width: 768px) {
          .admin-sidebar { width: 250px; } /* Lebar diperkecil di HP */
          
          /* 🔥 FIX FONT SIZE MOBILE AGAR TIDAK NABRAK 🔥 */
          .logo-text { font-size: 15px; } 
          .logo-subtext { font-size: 10px; }
          
          .top-navbar { padding: 0 20px; height: 76px; }
          .nav-info { display: none; }
          .profile-btn { padding: 6px; }
          .page-title { font-size: 18px; } 
          .hamburger-btn { padding: 8px; }
          .content-body { padding: 20px 16px; }
        }
      `}} />

      {/* OVERLAY MOBILE */}
      <div className={`mobile-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)}></div>

      {/* SIDEBAR ADMIN */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '12px', padding: '6px', boxSizing: 'border-box', flexShrink: 0 }}>
              <img 
                src="/Lambang_Kota_Jakarta_Timur.png" 
                alt="Logo Jaktim" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div className="logo-text-container">
              <span className="logo-text font-heading">PORTAL ADMIN</span>
              <span className="logo-subtext font-body">Pusat Kendali</span>
            </div>
          </div>
          
          <button onClick={() => setIsOpen(false)} className="close-sidebar-btn">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="menu-list font-body">
          {menuItems.map((item) => (
            <a
              key={item.path}
              onClick={() => { router.push(item.path); setIsOpen(false); }}
              className={`menu-item ${pathname === item.path ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        <header className="top-navbar">
          <div className="nav-left">
            <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="page-title font-heading">{getPageTitle()}</h1>
          </div>

          <div className="profile-wrapper" ref={profileRef}>
            <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
              <div className="nav-avatar font-heading">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
              <div className="nav-info font-body">
                <span className="nav-name">{user?.name || 'Administrator'}</span>
                <span className="nav-role">Super Admin</span>
              </div>
              <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '6px', marginRight: '6px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {showProfile && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <p className="font-body" style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hak Akses Penuh</p>
                  <p className="font-heading" style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#0f172a', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Administrator'}</p>
                </div>
                
                <button onClick={handleLogout} className="dropdown-item logout-btn font-body">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Keluar Sistem
                </button>
              </div>
            )}
          </div>
        </header>

        {/* KONTEN HALAMAN ANAK (DASHBOARD / USERS) MUNCUL DI SINI */}
        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
}