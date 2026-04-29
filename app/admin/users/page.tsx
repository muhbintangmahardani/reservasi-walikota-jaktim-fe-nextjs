// frontend/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminUsersPage() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: 'user_bagian', password: '' });

  // State Custom Alert (Premium Alert)
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'warning', // 'warning', 'success', 'error'
    title: '',
    message: '',
    targetId: null as any
  });

  // 🔥 PENGUNCI SCROLL LAYAR BELAKANG 🔥
  useEffect(() => {
    if (isModalOpen || alertConfig.isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen, alertConfig.isOpen]);

  // ==========================================
  // 2. FETCH DATA & FILTERING
  // ==========================================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || res.data || []);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      toast.error('Gagal mengambil data pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // 3. FUNGSI CRUD (TAMBAH, EDIT, HAPUS)
  // ==========================================
  const openModal = (user: any = null) => {
    if (user) {
      setIsEditMode(true);
      setFormData({ id: user.id, name: user.name, email: user.email, role: user.role, password: '' });
    } else {
      setIsEditMode(false);
      setFormData({ id: '', name: '', email: '', role: 'user_bagian', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadToast = toast.loading('Menyimpan data pengguna...');

    try {
      if (isEditMode) {
        const { password, ...dataTanpaPassword } = formData;
        const payload = password ? formData : dataTanpaPassword;
        await api.put(`/users/${formData.id}`, payload);
      } else {
        await api.post('/users', formData);
      }
      
      setIsModalOpen(false);
      fetchUsers(); 
      
      toast.dismiss(loadToast);
      setAlertConfig({
        isOpen: true, type: 'success', title: 'Berhasil! 🎉',
        message: isEditMode ? 'Data pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan.',
        targetId: null
      });
    } catch (error: any) {
      toast.dismiss(loadToast);
      setAlertConfig({
        isOpen: true, type: 'error', title: 'Gagal Menyimpan',
        message: error.response?.data?.message || 'Terjadi kesalahan pada sistem.', targetId: null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (user: any) => {
    setAlertConfig({
      isOpen: true, type: 'warning', title: 'Hapus Pengguna?',
      message: `Anda yakin ingin menghapus permanen akun "${user.name}"? Tindakan ini tidak dapat dikembalikan.`,
      targetId: user.id
    });
  };

  const confirmDelete = async () => {
    if (!alertConfig.targetId) return;
    setIsSubmitting(true);
    const loadToast = toast.loading('Menghapus data...');
    try {
      await api.delete(`/users/${alertConfig.targetId}`);
      setUsers(users.filter(u => u.id !== alertConfig.targetId));
      
      toast.dismiss(loadToast);
      setAlertConfig({
        isOpen: true, type: 'success', title: 'Berhasil Dihapus! 🎉',
        message: 'Akun pengguna telah permanen dihapus dari sistem database.', targetId: null
      });
    } catch (error: any) {
      toast.dismiss(loadToast);
      setAlertConfig({
        isOpen: true, type: 'error', title: 'Gagal Menghapus',
        message: error.response?.data?.message || 'Terjadi kesalahan sistem saat menghapus.', targetId: null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 4. UI RENDER & STYLING
  // ==========================================
  return (
    <div className="users-page-wrapper">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        /* ========================================= */
        /* BASE & TYPOGRAPHY                         */
        /* ========================================= */
        .users-page-wrapper {
          padding: 0;
          font-family: var(--font-jakarta), sans-serif;
          animation: slideUpFade 0.5s ease;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .header-title h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px; }
        .header-title p { color: #64748b; margin: 0; font-size: 14px; font-weight: 500; }

        .btn-tambah { 
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); color: white; border: none; 
          padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; 
          transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(67, 56, 202, 0.2); 
          font-family: inherit; white-space: nowrap;
        }
        .btn-tambah:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(67, 56, 202, 0.3); }

        /* SEARCH BAR */
        .search-container { 
          background: white; padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; 
          display: flex; align-items: center; gap: 12px; width: 100%; max-width: 400px; margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.2s;
        }
        .search-container:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .search-input { border: none; outline: none; width: 100%; font-size: 14px; font-weight: 600; color: #0f172a; background: transparent; font-family: inherit; }
        .search-input::placeholder { color: #94a3b8; font-weight: 500; }

        /* ========================================= */
        /* DESKTOP TABLE                             */
        /* ========================================= */
        .table-container { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; }
        .table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-scroll::-webkit-scrollbar { height: 6px; }
        .table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        .modern-table { width: 100%; min-width: 800px; border-collapse: collapse; text-align: left; }
        .modern-table th { background: #f8fafc; padding: 16px 20px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        .modern-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: 0.2s; }
        .modern-table tbody tr:hover td { background: #f8fafc; }
        .modern-table tbody tr:last-child td { border-bottom: none; }

        .user-main-info { display: flex; align-items: center; gap: 14px; }
        .user-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); color: #4f46e5; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; border: 1px solid #c7d2fe; }
        .user-name { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
        .user-email { font-size: 13px; color: #64748b; margin: 0; font-weight: 500; }

        .role-badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.5px; white-space: nowrap; }
        .role-admin { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        .role-sekpim { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .role-user { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

        .action-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-act { padding: 8px 14px; border-radius: 10px; font-weight: 800; font-size: 13px; border: none; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; }
        .btn-edit { background: #f1f5f9; color: #4f46e5; border: 1px solid #e2e8f0; } .btn-edit:hover { background: #e0e7ff; border-color: #c7d2fe; transform: translateY(-1px); }
        .btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; } .btn-delete:hover { background: #fee2e2; border-color: #fca5a5; transform: translateY(-1px); }

        /* ========================================= */
        /* MODAL GLOBAL STYLES (ANTI BOCOR iOS)      */
        /* ========================================= */
        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); 
          z-index: 9998; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 32px 16px; 
          overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; 
        }
        
        .modal-card { 
          background: white; padding: 32px; border-radius: 28px; width: 100%; max-width: 500px; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
          margin: auto; flex-shrink: 0; 
        }

        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 800; color: #334155; margin-bottom: 8px; }
        
        /* 🔥 FORM INPUT ANTI-LUBER 🔥 */
        .form-input { 
          display: block; width: 100%; max-width: 100%; min-width: 0; height: 52px; padding: 14px 16px; line-height: 20px; 
          border-radius: 14px; border: 2px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 14px; 
          font-weight: 600; color: #0f172a; box-sizing: border-box !important; transition: 0.2s; outline: none; margin: 0;
          -webkit-appearance: none; appearance: none;
        }
        select.form-input { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; background-size: 20px; padding-right: 40px; }
        .form-input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .form-input::placeholder { color: #94a3b8; font-weight: 500; }

        /* 🔥 TOMBOL MODAL SETENGAH-SETENGAH (50:50) 🔥 */
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 28px; width: 100%; }
        .btn-modal { display: flex; align-items: center; justify-content: center; padding: 14px 16px; border-radius: 14px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; transition: 0.2s; font-family: inherit; width: 100%; }
        .btn-submit-action { background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); color: white; box-shadow: 0 4px 6px rgba(67, 56, 202, 0.2); }
        .btn-submit-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3); }
        .btn-cancel { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .btn-cancel:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; }
        .btn-delete-action { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); }
        .btn-delete-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3); }
        .btn-modal:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* ========================================= */
        /* RESPONSIVE DESIGN (IPAD & MOBILE)         */
        /* ========================================= */
        @media (max-width: 1024px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .btn-tambah { width: 100%; justify-content: center; padding: 14px; }
          .search-container { max-width: 100%; }

          /* 🔥 TABLE TO CARD LAYOUT 🔥 */
          .table-container { background: transparent; border: none; box-shadow: none; overflow: visible; }
          .table-scroll { overflow: visible; }
          .modern-table, .modern-table tbody { display: block; width: 100%; min-width: 100%; }
          .modern-table thead { display: none; }
          
          .modern-table tr { 
            display: flex; flex-direction: column; background: #fff; margin-bottom: 16px; 
            padding: 24px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;
          }
          
          .modern-table td { display: flex; flex-direction: column; align-items: flex-start; padding: 0; border: none; margin-bottom: 16px; width: 100%; }
          .modern-table td::before { content: attr(data-label); font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 8px; }
          
          .modern-table td[data-label="Pengguna"]::before { display: none; }
          .modern-table td[data-label="Pengguna"] { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #cbd5e1; }
          
          .modern-table td[data-label="Aksi"]::before { display: none; }
          .modern-table td[data-label="Aksi"] { margin-bottom: 0; margin-top: 8px; }

          .action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; justify-content: stretch; }
          .btn-act { width: 100%; justify-content: center; padding: 14px; font-size: 13px; }
        }

        @media (max-width: 768px) {
          .modal-card { padding: 24px; border-radius: 24px; }
          .header-title h1 { font-size: 24px; }
        }
      `}} />

      {/* HEADER PAGE */}
      <div className="page-header">
        <div className="header-title">
          <h1 className="font-heading">Manajemen Pengguna</h1>
          <p className="font-body">Kelola hak akses dan direktori akun Smart Room.</p>
        </div>
        <button className="btn-tambah font-body" onClick={() => openModal()}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Daftarkan User Baru
        </button>
      </div>

      <div className="search-container font-body">
        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Cari nama atau email pengguna..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABEL DATA PENGGUNA */}
      <div className="table-container font-body">
        <div className="table-scroll">
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Memuat direktori pengguna...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#f8fafc' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <span className="font-heading" style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', display: 'block', marginBottom: '8px' }}>Tidak ada pengguna ditemukan.</span>
            </div>
          ) : (
            <table className="modern-table">
              <thead className="font-heading">
                <tr>
                  <th style={{ width: '40%' }}>Profil Pengguna</th>
                  <th style={{ width: '25%' }}>Hak Akses (Role)</th>
                  <th style={{ width: '15%' }}>ID Sistem</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id}>
                    <td data-label="Pengguna">
                      <div className="user-main-info">
                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="user-name">{user.name}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Hak Akses (Role)">
                      <span className={`role-badge ${user.role === 'admin_kominfotik' ? 'role-admin' : user.role === 'sekpim' || user.role === 'asisten' ? 'role-sekpim' : 'role-user'}`}>
                        {user.role === 'admin_kominfotik' ? 'Super Admin' : user.role === 'sekpim' || user.role === 'asisten' ? 'Sekpim/Asisten' : 'Unit Kerja'}
                      </span>
                    </td>
                    <td data-label="ID Sistem">
                      <span style={{ fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>USR-{user.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td data-label="Aksi" style={{ textAlign: 'center' }}>
                      <div className="action-btns" style={{ justifyContent: 'center' }}>
                        <button className="btn-act btn-edit" onClick={() => openModal(user)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Edit
                        </button>
                        <button className="btn-act btn-delete" onClick={() => triggerDelete(user)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL FORM TAMBAH / EDIT                                  */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card font-body">
            <h2 className="font-heading" style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {isEditMode ? 'Edit Profil Pengguna' : 'Daftarkan Pengguna Baru'}
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
              {isEditMode ? 'Perbarui informasi akun dan hak akses di bawah ini.' : 'Lengkapi kredensial untuk memberikan hak akses ke dalam sistem.'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap / Nama Instansi <span style={{color: '#ef4444'}}>*</span></label>
                <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Biro Umum / John Doe" />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Email Login <span style={{color: '#ef4444'}}>*</span></label>
                <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Contoh: user@jaktim.go.id" />
              </div>

              <div className="form-group">
                <label className="form-label">Tingkat Hak Akses (Role) <span style={{color: '#ef4444'}}>*</span></label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user_bagian">Unit Kerja / Bagian (Pemohon)</option>
                  <option value="sekpim">Sekretariat Pimpinan (Verifikator)</option>
                  <option value="asisten">Asisten Pemerintahan</option>
                  <option value="admin_kominfotik">Super Admin (Tim IT Kominfotik)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kata Sandi {isEditMode && <span style={{color: '#94a3b8', fontWeight: 500}}>(Abaikan jika tidak ingin diubah)</span>}</label>
                <input type="password" className="form-input" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditMode ? "Ketik sandi baru..." : "Buat kata sandi minimal 8 karakter"} />
              </div>

              {/* 🔥 TOMBOL DIBAGI RATA 50:50 🔥 */}
              <div className="modal-actions">
                <button type="submit" disabled={isSubmitting} className="btn-modal btn-submit-action">
                  {isSubmitting ? (
                    <><div style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></div> Menyimpan...</>
                  ) : (
                    isEditMode ? 'Simpan Perubahan' : 'Daftarkan User'
                  )}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="btn-modal btn-cancel">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOM PREMIUM ALERT (DELETE CONFIRMATION)                */}
      {/* ========================================================= */}
      {alertConfig.isOpen && (
        <div className="modal-overlay font-body">
          <div className="modal-card" style={{ maxWidth: '380px', textAlign: 'center', padding: '40px' }}>
            
            <div style={{ width: '72px', height: '72px', margin: '0 auto 20px auto', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: alertConfig.type === 'success' ? '#dcfce7' : alertConfig.type === 'warning' ? '#fef3c7' : '#fee2e2', color: alertConfig.type === 'success' ? '#15803d' : alertConfig.type === 'warning' ? '#d97706' : '#b91c1c' }}>
              {alertConfig.type === 'success' ? (
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              ) : alertConfig.type === 'warning' ? (
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              ) : (
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            
            <h3 className="font-heading" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{alertConfig.title}</h3>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 32px 0', lineHeight: 1.6 }}>{alertConfig.message}</p>

            {alertConfig.type === 'warning' ? (
              /* 🔥 TOMBOL HAPUS DIBAGI RATA 50:50 🔥 */
              <div className="modal-actions" style={{ marginTop: 0 }}>
                <button disabled={isSubmitting} onClick={confirmDelete} className="btn-modal btn-delete-action">
                  {isSubmitting ? 'Memproses...' : 'Ya, Hapus'}
                </button>
                <button disabled={isSubmitting} onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="btn-modal btn-cancel">
                  Batal
                </button>
              </div>
            ) : (
              <button 
                className="btn-modal btn-submit-action"
                style={{ marginTop: 0 }}
                onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
              >
                Tutup & Lanjutkan
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}