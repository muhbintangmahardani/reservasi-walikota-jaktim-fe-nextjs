// frontend/app/sekpim/reservasi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';

export default function KelolaReservasiPage() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // STATE UNTUK CUSTOM PREMIUM ALERT (SweetAlert UI)
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    type: 'success', // 'success', 'error'
    title: '',
    message: ''
  });
  
  // Data State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    event_name: '', start_time: '', end_time: '', location_type: 'ruangan_terdaftar',
    room_id: '', other_location: '', origin_unit: '', pejabat_pelaksana: '', pejabat_pendamping: '',
    category_label: '', status: 'verified', rejection_reason: ''
  });

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

      setCustomAlert({
        isOpen: true,
        type: 'success',
        title: isEditMode ? 'Perubahan Tersimpan!' : 'Berhasil Ditambahkan!',
        message: isEditMode ? 'Data reservasi telah berhasil diperbarui.' : 'Reservasi baru berhasil masuk ke dalam database MySQL.'
      });
      
    } catch (error: any) { 
      const responseData = error.response?.data;
      let errorMsg = 'Terjadi kesalahan sistem yang tidak diketahui.';
      
      if (error.response?.status === 422) {
        if (responseData?.errors) {
          const validationErrors = responseData.errors;
          const firstErrorKey = Object.keys(validationErrors)[0];
          errorMsg = validationErrors[firstErrorKey][0];
        } else if (responseData?.message) {
          errorMsg = responseData.message;
        }
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      }

      setCustomAlert({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: errorMsg
      });
    }
  };

  const executeVerify = async (status: string) => {
    try {
      await api.put(`/reservations/${selectedItem.id}/verify`, {
        status,
        category_label: formData.category_label,
        rejection_reason: formData.rejection_reason
      });
      
      setIsVerifyModalOpen(false);
      setIsRejectModalOpen(false);
      fetchInitialData();

      setCustomAlert({
        isOpen: true,
        type: 'success',
        title: status === 'verified' ? 'Berhasil Disetujui!' : 'Berhasil Ditolak!',
        message: `Status reservasi telah berhasil diperbarui.`
      });
    } catch (e) { 
      setCustomAlert({
        isOpen: true,
        type: 'error',
        title: 'Verifikasi Gagal',
        message: 'Terjadi kesalahan saat memproses data ke server.'
      });
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

  // 🚀 FUNGSI LOKASI SAPU BERSIH (MENAMPILKAN APA ADANYA)
  const getLocationDisplay = (item: any) => {
    // 1. Jika relasi database "room" ada dan memiliki nama, langsung tampilkan
    if (item.room && (item.room.room_name || item.room.name)) {
      return item.room.room_name || item.room.name;
    }
    
    // 2. Jika tidak ada relasi ruangan, tampilkan apapun yang ada di kolom lokasi (other_location atau location)
    if (item.other_location) return item.other_location;
    if (item.location) return item.location; // Berjaga-jaga jika backend memakai nama kolom 'location'
    
    // 3. Jika benar-benar kosong dari database
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
    <div className="mega-container">
      <style dangerouslySetInnerHTML={{__html: `
        .mega-container { padding: 32px 40px; font-family: 'Inter', sans-serif; max-width: 1200px; margin: 0 auto; box-sizing: border-box; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 20px; }
        .header-title h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .header-title p { color: #64748b; margin: 0; font-size: 15px; }
        .btn-tambah { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); flex-shrink: 0; }
        .btn-tambah:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }

        .controls-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; width: 100%; }
        
        .filter-pills-container { width: 100%; max-width: 600px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; flex: 1; }
        .filter-pills-container::-webkit-scrollbar { display: none; }
        .filter-pills { display: flex; gap: 10px; width: max-content; padding-bottom: 4px; }
        
        .pill-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .pill-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
        .pill-btn.inactive { background: white; color: #64748b; }
        .pill-btn.inactive:hover { background: #f1f5f9; }

        .search-bar { background: white; padding: 10px 16px; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; min-width: 280px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .search-input { border: none; outline: none; width: 100%; font-size: 14px; color: #0f172a; background: transparent; }

        .table-wrapper { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02); }
        .mega-table { width: 100%; border-collapse: collapse; text-align: left; }
        .mega-table th { background: #f8fafc; padding: 16px 20px; color: #475569; font-size: 13px; font-weight: 700; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        .mega-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; vertical-align: middle; }
        .mega-table tbody tr:hover { background: #f8fafc; }

        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; letter-spacing: 0.5px; }

        .action-btns { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-act { padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-act.terima { background: #dcfce7; color: #15803d; } .btn-act.terima:hover { background: #bbf7d0; }
        .btn-act.tolak { background: #fee2e2; color: #b91c1c; } .btn-act.tolak:hover { background: #fecaca; }
        .btn-act.edit { background: #eff6ff; color: #1d4ed8; } .btn-act.edit:hover { background: #dbeafe; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9998; padding: 16px; }
        .modal-card { background: white; padding: 32px; border-radius: 24px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); max-height: 90vh; overflow-y: auto; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 700; color: #475569; }
        .form-input { padding: 12px 16px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; width: 100%; box-sizing: border-box; background: #f8fafc; transition: 0.2s; outline: none; }
        .form-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }
        .full-col { grid-column: span 2; }

        /* ANIMASI CUSTOM ALERT PREMIUM */
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        @media (max-width: 1024px) {
          .mega-container { padding: 24px; }
          .filter-pills-container { max-width: 100%; }
        }

        @media (max-width: 768px) {
          .mega-container { padding: 16px; overflow-x: hidden; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .btn-tambah { width: 100%; justify-content: center; padding: 14px; }
          .controls-row { flex-direction: column-reverse; align-items: stretch; width: 100%; }
          .filter-pills-container { max-width: calc(100vw - 32px); }
          .search-bar { width: 100%; box-sizing: border-box; }
          .mega-table thead { display: none; }
          .mega-table tr { display: block; padding: 16px; border-bottom: 8px solid #f1f5f9; position: relative; }
          .mega-table td { display: block; padding: 8px 0; text-align: right; border: none; position: relative; padding-left: 40%; font-size: 14px; }
          .mega-table td::before { content: attr(data-label); position: absolute; left: 0; font-weight: 700; color: #64748b; text-align: left; }
          .action-btns { width: 100%; flex-direction: row; margin-top: 12px; }
          .btn-act { flex: 1; padding: 12px; }
          .form-grid { grid-template-columns: 1fr; }
          .full-col { grid-column: span 1; }
          .modal-card { padding: 24px; }
        }
      `}} />

      {/* HEADER */}
      <div className="page-header">
        <div className="header-title">
          <h1>Kelola Reservasi</h1>
          <p>Verifikasi pengajuan dari unit kerja atau buat agenda baru.</p>
        </div>
        <button className="btn-tambah" onClick={openAdd}>
          <span style={{ fontSize: '18px' }}>+</span> Tambah Reservasi Baru
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="controls-row">
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
          <span style={{ color: '#94a3b8' }}>🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cari acara atau unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
            Memuat data reservasi...
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📄</span>
            <span style={{ fontWeight: 600 }}>Tidak ada data yang ditemukan.</span>
          </div>
        ) : (
          <table className="mega-table">
            <thead>
              <tr>
                <th>Detail Kegiatan</th>
                <th>Waktu</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item: any) => (
                <tr key={item.id}>
                  <td data-label="Detail Kegiatan">
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.event_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {item.origin_unit ? `🏢 ${item.origin_unit}` : '👤 Sekretariat Pimpinan'}
                    </div>
                  </td>
                  <td data-label="Waktu">
                    <div style={{ fontWeight: 600 }}>{new Date(item.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                  </td>
                  <td data-label="Lokasi">
                    {/* IMPLEMENTASI FUNGSI PENCEGAH LOKASI SAPU BERSIH */}
                    {getLocationDisplay(item)}
                  </td>
                  <td data-label="Status">
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: item.status === 'verified' ? '#dcfce7' : (item.status === 'rejected' ? '#fee2e2' : '#fef3c7'), 
                        color: item.status === 'verified' ? '#15803d' : (item.status === 'rejected' ? '#b91c1c' : '#b45309') 
                      }}
                    >
                      {item.status ? item.status.toUpperCase() : 'PENDING'}
                    </span>
                  </td>
                  <td data-label="Aksi">
                    <div className="action-btns">
                      {item.status === 'pending' || !item.status ? (
                        <>
                          <button className="btn-act terima" onClick={() => { setSelectedItem(item); setIsVerifyModalOpen(true); }}>✓ Terima</button>
                          <button className="btn-act tolak" onClick={() => { setSelectedItem(item); setIsRejectModalOpen(true); }}>✕ Tolak</button>
                        </>
                      ) : (
                        <button className="btn-act edit" onClick={() => openEdit(item)}>✏️ Edit</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL FORM (TAMBAH / EDIT)                */}
      {/* ========================================= */}
      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '800px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800 }}>{isEditMode ? 'Edit Reservasi' : 'Tambah Reservasi Baru'}</h2>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
              {disableForAsisten ? 'Anda login sebagai Asisten. Hanya dapat merubah Pelaksana & Pendamping.' : 'Lengkapi formulir di bawah ini dengan cermat.'}
            </p>
            
            <form onSubmit={handleSaveReservasi} className="form-grid">
              
              <div className="form-group full-col">
                <label className="form-label">Asal Unit / Instansi Pemohon <span style={{color: '#ef4444'}}>*</span></label>
                <input className="form-input" disabled={disableForAsisten} required value={formData.origin_unit || ''} onChange={e => setFormData({...formData, origin_unit: e.target.value})} placeholder="Contoh: Sekretariat Pimpinan" />
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

              <div className="form-group">
                <label className="form-label">Pejabat Pelaksana</label>
                <input className="form-input" value={formData.pejabat_pelaksana || ''} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" autoFocus={disableForAsisten} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Pejabat Pendamping</label>
                <input className="form-input" value={formData.pejabat_pendamping || ''} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Pemerintahan" />
              </div>

              <div className="full-col" style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                <Button type="submit" style={{ flex: '1 1 200px', background: '#0f172a', padding: '14px', fontSize: '14px' }}>
                  {isEditMode ? 'Simpan Perubahan' : 'Tambahkan Reservasi'}
                </Button>
                <Button type="button" onClick={() => setIsFormModalOpen(false)} style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#475569', padding: '14px', fontSize: '14px' }}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL TERIMA & TOLAK                      */}
      {/* ========================================= */}
      {isVerifyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#15803d', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>✓</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>Terima & Beri Label</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>Label ini akan tampil di kalender resmi Pimpinan.</p>
            
            <input className="form-input" placeholder="Contoh: Agenda Penting / VIP" value={formData.category_label || ''} onChange={e => setFormData({...formData, category_label: e.target.value})} style={{ marginBottom: '24px' }} autoFocus />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => executeVerify('verified')} style={{ background: '#10b981', width: '100%', padding: '14px' }}>Simpan & Setujui</Button>
              <Button onClick={() => setIsVerifyModalOpen(false)} style={{ background: '#f1f5f9', color: '#64748b', width: '100%', padding: '14px' }}>Batal</Button>
            </div>
          </div>
        </div>
      )}

      {isRejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', color: '#b91c1c', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>✕</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>Tolak Reservasi</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>Berikan alasan agar pemohon mengerti penolakan ini.</p>
            
            <textarea className="form-input" rows={3} placeholder="Contoh: Jadwal bentrok..." value={formData.rejection_reason || ''} onChange={e => setFormData({...formData, rejection_reason: e.target.value})} style={{ marginBottom: '24px', resize: 'vertical' }} autoFocus />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => executeVerify('rejected')} style={{ background: '#ef4444', width: '100%', padding: '14px' }}>Kirim Penolakan</Button>
              <Button onClick={() => setIsRejectModalOpen(false)} style={{ background: '#f1f5f9', color: '#64748b', width: '100%', padding: '14px' }}>Batal</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚀 CUSTOM PREMIUM ALERT COMPONENT (SWEETALERT REPLACEMENT)*/}
      {/* ========================================================= */}
      {customAlert.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            
            <div style={{ width: '70px', height: '70px', margin: '0 auto 20px auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              background: customAlert.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: customAlert.type === 'success' ? '#15803d' : '#b91c1c'
            }}>
              {customAlert.type === 'success' ? '✨' : '⚠️'}
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{customAlert.title}</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px 0', lineHeight: 1.6 }}>{customAlert.message}</p>

            <button 
              onClick={() => setCustomAlert({...customAlert, isOpen: false})} 
              style={{ background: customAlert.type === 'success' ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '14px', width: '100%', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}