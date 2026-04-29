// frontend/app/sekpim/reservasi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';

export default function KelolaReservasiPage() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // STATE UNTUK CUSTOM PREMIUM ALERT
  const [customAlert, setCustomAlert] = useState({
    isOpen: false, type: 'success', title: '', message: ''
  });
  
  // Data State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    event_name: '', start_time: '', end_time: '', location_type: 'ruangan_terdaftar',
    room_id: '', other_location: '', origin_unit: '', pejabat_pelaksana: '', pejabat_pendamping: '',
    category_label: '', status: 'verified', rejection_reason: ''
  });

  // PENGUNCI SCROLL BAWAAN REACT
  useEffect(() => {
    if (isFormModalOpen || isVerifyModalOpen || isRejectModalOpen || customAlert.isOpen) {
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
  }, [isFormModalOpen, isVerifyModalOpen, isRejectModalOpen, customAlert.isOpen]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [resRes, resRooms] = await Promise.all([
        api.get('/reservations'),
        api.get('/rooms')
      ]);
      let data = resRes.data.data || resRes.data;
      data.sort((a: any, b: any) => new Date(b.created_at || b.start_time).getTime() - new Date(a.created_at || a.start_time).getTime());
      setReservations(data);
      setRooms(resRooms.data.data || resRooms.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleSaveReservasi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadToast = toast.loading('Menyimpan data...');

    try {
      const payload = { ...formData, user_id: user?.id };
      
      if (payload.start_time && payload.start_time.includes('T')) {
        payload.start_time = payload.start_time.replace('T', ' ') + (payload.start_time.length === 16 ? ':00' : '');
      }
      if (payload.end_time && payload.end_time.includes('T')) {
        payload.end_time = payload.end_time.replace('T', ' ') + (payload.end_time.length === 16 ? ':00' : '');
      }

      if (payload.location_type === 'lainnya') {
        payload.room_id = null as any; 
      } else {
        payload.other_location = null as any;
        if (payload.room_id === '') payload.room_id = null as any;
      }

      if (isEditMode) {
        await api.put(`/reservations/${selectedItem.id}`, payload);
      } else {
        await api.post('/reservations', payload);
      }
      
      setIsFormModalOpen(false);
      fetchInitialData();

      toast.success(isEditMode ? 'Perubahan Tersimpan!' : 'Reservasi Berhasil Dibuat!', { id: loadToast });
      
    } catch (error: any) { 
      let errorMsg = 'Terjadi kesalahan sistem.';
      if (error.response?.status === 422) {
        if (error.response.data?.errors) {
          errorMsg = error.response.data.errors[Object.keys(error.response.data.errors)[0]][0];
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      }
      toast.error('Gagal menyimpan.', { id: loadToast });
      setCustomAlert({ isOpen: true, type: 'error', title: 'Gagal Menyimpan', message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeVerify = async (status: string) => {
    setIsSubmitting(true);
    const loadToast = toast.loading('Memproses verifikasi...');
    try {
      await api.put(`/reservations/${selectedItem.id}/verify`, {
        status,
        category_label: formData.category_label,
        rejection_reason: formData.rejection_reason
      });
      
      setIsVerifyModalOpen(false);
      setIsRejectModalOpen(false);
      fetchInitialData();

      toast.success(status === 'verified' ? 'Agenda Disetujui!' : 'Agenda Ditolak.', { id: loadToast });
    } catch (e) { 
      toast.error('Gagal memproses verifikasi.', { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setFormData({
      event_name: item.event_name || '',
      start_time: item.start_time ? item.start_time.slice(0, 16) : '',
      end_time: item.end_time ? item.end_time.slice(0, 16) : '',
      location_type: item.location_type || 'ruangan_terdaftar',
      room_id: item.room_id || '',
      other_location: item.other_location || item.location || '',
      origin_unit: item.origin_unit || 'Sekretariat Pimpinan',
      pejabat_pelaksana: item.pejabat_pelaksana || '',
      pejabat_pendamping: item.pejabat_pendamping || '',
      category_label: item.category_label || '',
      status: item.status || 'verified',
      rejection_reason: item.rejection_reason || ''
    });
    setIsFormModalOpen(true);
  };

  const openAdd = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setFormData({
      event_name: '', start_time: '', end_time: '', location_type: 'ruangan_terdaftar',
      room_id: '', other_location: '', origin_unit: 'Sekretariat Pimpinan', 
      pejabat_pelaksana: '', pejabat_pendamping: '',
      category_label: 'Agenda Pimpinan', status: 'verified', rejection_reason: ''
    });
    setIsFormModalOpen(true);
  };

  const isAsisten = user?.role === 'asisten';
  const disableForAsisten = isAsisten && isEditMode;

  const getLocationDisplay = (item: any) => {
    if (item.room && (item.room.room_name || item.room.name)) {
      return item.room.room_name || item.room.name;
    }
    if (item.other_location) return item.other_location;
    if (item.location) return item.location;
    return '-';
  };

  const displayData = reservations.filter((r: any) => {
    const matchStatus = filterStatus === 'all' || r?.status === filterStatus;
    const matchSearch = r?.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r?.pejabat_pelaksana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r?.origin_unit?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="reservasi-container">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        /* ========================================= */
        /* BASE & TYPOGRAPHY                         */
        /* ========================================= */
        .reservasi-container { 
          padding: 24px 32px; font-family: var(--font-jakarta), sans-serif; 
          max-width: 1140px; margin: 0 auto; box-sizing: border-box; 
          animation: slideUpFade 0.5s ease; text-align: left;
        }
        
        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 20px; text-align: left; }
        .header-title h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px; text-align: left; }
        .header-title p { color: #64748b; margin: 0; font-size: 14px; font-weight: 500; text-align: left; }
        
        .btn-tambah { 
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: white; border: none; 
          padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; 
          transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; 
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); flex-shrink: 0; font-family: inherit; 
        }
        .btn-tambah:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(79, 70, 229, 0.3); }

        /* --- CONTROLS: FILTER & SEARCH --- */
        .controls-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; width: 100%; }
        
        .filter-pills-container { width: 100%; max-width: 600px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; flex: 1; }
        .filter-pills-container::-webkit-scrollbar { display: none; }
        .filter-pills { display: flex; gap: 8px; width: max-content; padding-bottom: 4px; }
        
        .pill-btn { padding: 10px 18px; border-radius: 12px; border: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; white-space: nowrap; font-family: inherit; }
        .pill-btn.active { background: #1e1b4b; color: white; border-color: #1e1b4b; box-shadow: 0 4px 6px rgba(30, 27, 75, 0.2); }
        .pill-btn.inactive { background: white; color: #64748b; }
        .pill-btn.inactive:hover { background: #f8fafc; border-color: #cbd5e1; }

        .search-bar { background: white; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; min-width: 280px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.2s; }
        .search-bar:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .search-input { border: none; outline: none; width: 100%; font-size: 14px; font-weight: 600; color: #0f172a; background: transparent; font-family: inherit; text-align: left; }
        .search-input::placeholder { color: #94a3b8; font-weight: 500; }

        /* --- DESKTOP TABLE --- */
        .table-container { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; }
        .table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-scroll::-webkit-scrollbar { height: 6px; }
        .table-scroll::-webkit-scrollbar-track { background: #f8fafc; }
        .table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .modern-table { width: 100%; min-width: 950px; border-collapse: collapse; text-align: left; }
        .modern-table th { background: #f8fafc; padding: 16px 20px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; text-align: left; }
        .modern-table th.center-col { text-align: center; }
        
        .modern-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: top; text-align: left; transition: background 0.2s ease; }
        .modern-table tbody tr:hover td { background: #f8fafc; }
        .modern-table tbody tr:last-child td { border-bottom: none; }

        .primary-text { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px; display: block; line-height: 1.4; text-align: left; }
        .secondary-text { font-size: 13px; color: #475569; font-weight: 600; display: flex; align-items: center; justify-content: flex-start; gap: 6px; text-align: left; }

        .status-badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.5px; white-space: nowrap; border: 1px solid transparent; }

        .action-btns { display: flex; gap: 8px; align-items: center; justify-content: flex-start; flex-wrap: wrap; }
        .btn-act { padding: 8px 14px; border-radius: 10px; font-weight: 800; font-size: 13px; border: none; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; text-align: center; gap: 6px; white-space: nowrap; font-family: inherit; }
        .btn-act.terima { background: #dcfce7; color: #15803d; } .btn-act.terima:hover { background: #bbf7d0; transform: translateY(-1px); }
        .btn-act.tolak { background: #fee2e2; color: #b91c1c; } .btn-act.tolak:hover { background: #fecaca; transform: translateY(-1px); }
        .btn-act.edit { background: #f1f5f9; color: #4f46e5; border: 1px solid #e2e8f0; width: 100%; } .btn-act.edit:hover { background: #e0e7ff; border-color: #c7d2fe; transform: translateY(-1px); }

        /* ========================================= */
        /* 🔥 FIX MUTLAK SCROLL MODAL ANDROID & iOS 🔥 */
        /* ========================================= */
        .modal-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(15, 23, 42, 0.75); 
          backdrop-filter: blur(8px); 
          z-index: 9998; 
          padding: 16px; 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: flex-start; /* Kunci penahan agar atas tidak kepotong */
          overflow-y: auto; 
          -webkit-overflow-scrolling: touch; 
          overscroll-behavior: contain; 
        }
        
        .modal-card { 
          background: white; 
          padding: 32px; 
          border-radius: 24px; 
          width: 100%; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); 
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
          text-align: left; 
          flex-shrink: 0; /* Cegah penyok */
        }

        /* KHUSUS MODAL TINGGI (FORM) */
        .modal-form-tall {
          max-width: 800px;
          margin: 40px auto 100px auto; /* Margin bawah 100px agar aman dari Nav Bar Android */
        }

        /* KHUSUS MODAL PENDEK (AKSI) */
        .modal-action-short {
          max-width: 380px;
          margin: auto; /* Otomatis ke tengah karena kontennya pendek */
        }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .form-label { font-size: 13px; font-weight: 800; color: #334155; text-align: left; }
        
        /* 🔥 FIX MUTLAK iOS: Mencegah input luber & menjaga presisi vertikal 🔥 */
        .form-input { 
          display: block;
          width: 100%; 
          max-width: 100%;
          min-width: 0;
          height: 52px; 
          padding: 14px 16px; 
          line-height: 20px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          font-size: 14px; 
          box-sizing: border-box !important; 
          background: #f8fafc; 
          transition: 0.2s; 
          outline: none; 
          font-family: inherit; 
          font-weight: 600; 
          color: #0f172a; 
          text-align: left; 
          margin: 0;
          -webkit-appearance: none;
          appearance: none;
        }

        select.form-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat; 
          background-position: right 16px center; 
          background-size: 20px;
          padding-right: 40px;
        }

        .form-input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .form-input:disabled { 
          background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; 
          -webkit-text-fill-color: #64748b; 
        }
        
        @media (hover: hover) and (pointer: fine) {
          input[type="datetime-local"].form-input {
            -webkit-appearance: auto;
            appearance: auto;
            padding: 0 16px;
          }
        }

        .full-col { grid-column: span 2; }
        
        .section-divider { grid-column: span 2; display: flex; align-items: center; margin: 8px 0; }
        .divider-line { flex: 1; height: 1px; background-color: #e2e8f0; }
        .divider-text { padding: 0 16px; font-size: 12px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; text-align: center; }

        /* TOMBOL MODAL */
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; width: 100%; }
        .btn-modal { display: flex; align-items: center; justify-content: center; text-align: center; padding: 14px 16px; border-radius: 14px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; transition: 0.2s; font-family: inherit; width: 100%; }
        
        .btn-submit-action { background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); color: white; box-shadow: 0 4px 6px rgba(67, 56, 202, 0.2); }
        .btn-submit-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3); }
        
        .btn-terima-action { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
        .btn-terima-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); }
        
        .btn-tolak-action { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); }
        .btn-tolak-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3); }
        
        .btn-cancel { background: #f1f5f9; color: #475569; }
        .btn-cancel:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; }
        .btn-modal:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* 🔥 MODE KARTU (CARD LAYOUT) UNTUK IPAD & MOBILE 🔥 */
        @media (max-width: 1024px) {
          .reservasi-container { padding: 20px; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .btn-tambah { width: 100%; justify-content: center; padding: 14px; }
          .controls-row { flex-direction: column-reverse; align-items: stretch; margin-bottom: 20px; gap: 12px; }
          .filter-pills-container { max-width: calc(100vw - 40px); }
          .search-bar { width: 100%; box-sizing: border-box; }
          
          .table-container { background: transparent; border: none; box-shadow: none; overflow: visible; }
          .table-scroll { overflow: visible; }
          .modern-table, .modern-table tbody { display: block; width: 100%; min-width: 100%; }
          .modern-table thead { display: none; }
          
          .modern-table tr { 
            display: flex; flex-direction: column; gap: 16px; background: #fff; margin-bottom: 16px; 
            padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;
          }
          
          .modern-table td { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; text-align: left; padding: 0; border: none; width: 100% !important; }
          
          .modern-table td::before { content: attr(data-label); font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px; display: block; text-align: left; }
          .modern-table td[data-label="Aksi"]::before { display: none; }
          .modern-table td[data-label="Aksi"] { margin-top: 8px; padding-top: 16px; border-top: 1px dashed #cbd5e1; width: 100%; }

          .action-btns { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; justify-content: stretch; }
          .action-btns .btn-act.edit { grid-column: span 2; }
          .action-btns .btn-act { padding: 12px; width: 100%; justify-content: center; text-align: center; }

          .form-grid { grid-template-columns: 1fr; gap: 16px; }
          .full-col, .section-divider { grid-column: span 1; }
          
          .modal-card { padding: 24px; }
          .modal-form-tall { margin: 20px auto 100px auto; } /* Aman dari Nav Bar Android */
        }

        @media (max-width: 480px) {
          .modal-actions { grid-template-columns: 1fr; gap: 10px; }
        }
      `}} />

      {/* HEADER */}
      <div className="page-header">
        <div className="header-title">
          <h1 className="font-heading">Kelola Reservasi</h1>
          <p className="font-body">Verifikasi pengajuan dari unit kerja atau buat agenda baru.</p>
        </div>
        <button className="btn-tambah font-body" onClick={openAdd}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Tambah Reservasi Baru
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="controls-row font-body">
        <div className="filter-pills-container">
          <div className="filter-pills">
            {['all', 'pending', 'verified', 'rejected'].map(s => (
              <button 
                key={s} 
                className={`pill-btn ${filterStatus === s ? 'active' : 'inactive'}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'Semua Status' : s === 'pending' ? 'Menunggu' : s === 'verified' ? 'Disetujui' : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>
        <div className="search-bar">
          <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cari acara atau unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABEL DATA / CARD LIST */}
      <div className="table-container font-body">
        <div className="table-scroll">
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Memuat data reservasi...</span>
            </div>
          ) : displayData.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="font-heading" style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', display: 'block', marginBottom: '8px' }}>Tidak ada data ditemukan.</span>
            </div>
          ) : (
            <table className="modern-table">
              <thead className="font-heading">
                <tr>
                  <th style={{ width: '30%' }}>Detail Kegiatan</th>
                  <th style={{ width: '25%' }}>Waktu Pelaksanaan</th>
                  <th style={{ width: '20%' }}>Lokasi Ruangan</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th className="center-col" style={{ width: '15%' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item: any) => (
                  <tr key={item.id}>
                    
                    {/* DETAIL KEGIATAN */}
                    <td data-label="Detail Kegiatan">
                      <span className="primary-text font-heading" style={{ fontSize: '16px' }}>{item.event_name}</span>
                      <div className="secondary-text">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#0f172a', fontWeight: 700 }}>{item.origin_unit || 'Sekretariat Pimpinan'}</span>
                      </div>
                    </td>

                    {/* WAKTU PELAKSANAAN */}
                    <td data-label="Waktu Pelaksanaan">
                      <span className="primary-text">
                        {new Date(item.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <div className="secondary-text" style={{ color: '#4f46e5', fontWeight: 700 }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline strokeLinecap="round" strokeLinejoin="round" points="12 6 12 12 16 14"></polyline></svg>
                        {new Date(item.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>

                    {/* LOKASI RUANGAN */}
                    <td data-label="Lokasi Ruangan">
                      <span className="primary-text" style={{ color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {getLocationDisplay(item)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td data-label="Status">
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: item.status === 'verified' ? '#dcfce7' : (item.status === 'rejected' ? '#fee2e2' : '#fef3c7'), 
                          color: item.status === 'verified' ? '#15803d' : (item.status === 'rejected' ? '#b91c1c' : '#b45309'),
                          borderColor: item.status === 'verified' ? '#bbf7d0' : (item.status === 'rejected' ? '#fecaca' : '#fde68a')
                        }}
                      >
                        {item.status === 'verified' ? (
                          <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg> DISETUJUI</>
                        ) : item.status === 'rejected' ? (
                          <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg> DITOLAK</>
                        ) : (
                          <><div style={{ width: '6px', height: '6px', background: '#d97706', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div> MENUNGGU</>
                        )}
                      </span>
                    </td>

                    {/* AKSI / TINDAKAN */}
                    <td data-label="Aksi">
                      <div className="action-btns">
                        {item.status === 'pending' || !item.status ? (
                          <>
                            <button className="btn-act terima" onClick={() => { setSelectedItem(item); setIsVerifyModalOpen(true); }}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                              Terima
                            </button>
                            <button className="btn-act tolak" onClick={() => { setSelectedItem(item); setIsRejectModalOpen(true); }}>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                              Tolak
                            </button>
                          </>
                        ) : (
                          <button className="btn-act edit" onClick={() => openEdit(item)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL FORM (TAMBAH / EDIT) PREMIUM        */}
      {/* ========================================= */}
      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card modal-form-tall">
            <h2 className="font-heading" style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: 800, color: '#0f172a', textAlign: 'left' }}>{isEditMode ? 'Edit Reservasi' : 'Tambah Reservasi Baru'}</h2>
            <p className="font-body" style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', textAlign: 'left' }}>
              {disableForAsisten ? 'Mode Asisten: Hanya dapat mengubah Pelaksana & Pendamping.' : 'Lengkapi formulir penjadwalan di bawah ini dengan cermat.'}
            </p>
            
            <form onSubmit={handleSaveReservasi} className="form-grid font-body">
              
              <div className="section-divider">
                <div className="divider-line"></div><span className="divider-text">Detail Inti</span><div className="divider-line"></div>
              </div>

              <div className="form-group full-col">
                <label className="form-label">Asal Unit / Instansi Pemohon <span style={{color: '#ef4444'}}>*</span></label>
                <input className="form-input" disabled={disableForAsisten} required value={formData.origin_unit || ''} onChange={e => setFormData({...formData, origin_unit: e.target.value})} placeholder="Contoh: Sekretariat Pimpinan / Sudin Kesehatan" />
              </div>

              <div className="form-group full-col">
                <label className="form-label">Nama Kegiatan <span style={{color: '#ef4444'}}>*</span></label>
                <input className="form-input" disabled={disableForAsisten} required value={formData.event_name || ''} onChange={e => setFormData({...formData, event_name: e.target.value})} placeholder="Contoh: Rapat Paripurna" autoFocus={!disableForAsisten} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Waktu Mulai <span style={{color: '#ef4444'}}>*</span></label>
                <input type="datetime-local" className="form-input" disabled={disableForAsisten} required value={formData.start_time || ''} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Waktu Selesai <span style={{color: '#ef4444'}}>*</span></label>
                <input type="datetime-local" className="form-input" disabled={disableForAsisten} required value={formData.end_time || ''} onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>
              
              <div className="section-divider">
                <div className="divider-line"></div><span className="divider-text">Lokasi & Label</span><div className="divider-line"></div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipe Lokasi</label>
                <select className="form-input" disabled={disableForAsisten} value={formData.location_type || 'ruangan_terdaftar'} onChange={e => setFormData({...formData, location_type: e.target.value})}>
                  <option value="ruangan_terdaftar">Ruangan Kantor Internal</option>
                  <option value="lainnya">Lokasi Eksternal / Luar Kantor</option>
                </select>
              </div>
              
              <div className="form-group">
                {formData.location_type === 'ruangan_terdaftar' ? (
                  <>
                    <label className="form-label">Pilih Ruangan <span style={{color: '#ef4444'}}>*</span></label>
                    <select className="form-input" disabled={disableForAsisten} required value={formData.room_id || ''} onChange={e => setFormData({...formData, room_id: e.target.value})}>
                      <option value="">-- Pilih Ruangan --</option>
                      {rooms.map((r:any) => <option key={r.id} value={r.id}>{r.room_name || r.name}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="form-label">Lokasi Lainnya <span style={{color: '#ef4444'}}>*</span></label>
                    <input className="form-input" disabled={disableForAsisten} required value={formData.other_location || ''} onChange={e => setFormData({...formData, other_location: e.target.value})} placeholder="Contoh: Hotel Borobudur" />
                  </>
                )}
              </div>
              
              <div className="form-group full-col">
                <label className="form-label">Kategori Label</label>
                <input className="form-input" disabled={disableForAsisten} value={formData.category_label || ''} onChange={e => setFormData({...formData, category_label: e.target.value})} placeholder="Contoh: Agenda VIP" />
              </div>

              <div className="section-divider">
                <div className="divider-line"></div><span className="divider-text">Area Bebas Edit</span><div className="divider-line"></div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#047857' }}>Pejabat Pelaksana</label>
                <input className="form-input" style={{ borderColor: '#10b981', backgroundColor: '#f0fdf4' }} value={formData.pejabat_pelaksana || ''} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" autoFocus={disableForAsisten} />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ color: '#047857' }}>Pejabat Pendamping</label>
                <input className="form-input" style={{ borderColor: '#10b981', backgroundColor: '#f0fdf4' }} value={formData.pejabat_pendamping || ''} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Pemerintahan" />
              </div>

              <div className="full-col modal-actions">
                <button type="submit" disabled={isSubmitting} className="btn-modal btn-submit-action">
                  {isSubmitting ? (
                    <><div style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></div> Menyimpan...</>
                  ) : (
                    isEditMode ? 'Simpan Perubahan' : 'Tambahkan Reservasi'
                  )}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsFormModalOpen(false)} className="btn-modal btn-cancel">
                  Batal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TERIMA (QUICK ACTION)               */}
      {/* ========================================= */}
      {isVerifyModalOpen && (
        <div className="modal-overlay font-body">
          <div className="modal-card modal-action-short">
            <div style={{ width: '56px', height: '56px', background: '#dcfce7', color: '#15803d', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-heading" style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Terima & Beri Label</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>Label ini akan tampil di kalender resmi Pimpinan.</p>
            
            <input className="form-input" placeholder="Contoh: Agenda Penting / VIP" value={formData.category_label || ''} onChange={e => setFormData({...formData, category_label: e.target.value})} style={{ marginBottom: '20px' }} autoFocus />
            
            <div className="modal-actions" style={{ marginTop: '0' }}>
              <button onClick={() => executeVerify('verified')} disabled={isSubmitting} className="btn-modal btn-terima-action">
                {isSubmitting ? 'Memproses...' : 'Simpan & Setujui'}
              </button>
              <button onClick={() => setIsVerifyModalOpen(false)} disabled={isSubmitting} className="btn-modal btn-cancel">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TOLAK (QUICK ACTION)                 */}
      {/* ========================================= */}
      {isRejectModalOpen && (
        <div className="modal-overlay font-body">
          <div className="modal-card modal-action-short">
            <div style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#b91c1c', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="font-heading" style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#ef4444', textAlign: 'center' }}>Tolak Reservasi</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>Berikan alasan agar pemohon mengerti penolakan ini.</p>
            
            <textarea className="form-input" rows={3} placeholder="Contoh: Jadwal Walikota bentrok..." value={formData.rejection_reason || ''} onChange={e => setFormData({...formData, rejection_reason: e.target.value})} style={{ marginBottom: '20px', resize: 'vertical' }} autoFocus />
            
            <div className="modal-actions" style={{ marginTop: '0' }}>
              <button onClick={() => executeVerify('rejected')} disabled={isSubmitting} className="btn-modal btn-tolak-action">
                {isSubmitting ? 'Memproses...' : 'Kirim Penolakan'}
              </button>
              <button onClick={() => setIsRejectModalOpen(false)} disabled={isSubmitting} className="btn-modal btn-cancel">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOM PREMIUM ALERT COMPONENT                             */}
      {/* ========================================================= */}
      {customAlert.isOpen && (
        <div className="modal-overlay font-body">
          <div className="modal-card modal-action-short" style={{ padding: '40px', textAlign: 'center' }}>
            
            <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: customAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: customAlert.type === 'success' ? '#15803d' : '#b91c1c' }}>
              {customAlert.type === 'success' ? (
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              )}
            </div>

            <h3 className="font-heading" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', textAlign: 'center' }}>{customAlert.title}</h3>
            <p className="font-body" style={{ fontSize: '15px', color: '#64748b', margin: '0 0 32px 0', lineHeight: 1.6, textAlign: 'center' }}>{customAlert.message}</p>

            <button 
              className="btn-modal"
              onClick={() => setCustomAlert({...customAlert, isOpen: false})} 
              style={{ background: customAlert.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}