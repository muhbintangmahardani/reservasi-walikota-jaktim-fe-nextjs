// frontend/app/sekpim/jadwal/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function CreateJadwalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE CUSTOM ALERT
  const [customAlert, setCustomAlert] = useState({
    isOpen: false, type: 'success', title: '', message: '', onConfirm: null as any
  });

  const [formData, setFormData] = useState({
    event_name: '', start_time: '', end_time: '', location_type: 'ruangan_terdaftar',
    room_id: '', other_location: '', origin_unit: 'Sekretariat Pimpinan', 
    pejabat_pelaksana: '', pejabat_pendamping: '', category_label: 'Agenda Pimpinan', status: 'verified'
  });

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.data || res.data);
    } catch (error) {
      setRooms([{ id: 1, room_name: 'Ruang Pola' }, { id: 2, room_name: 'Ruang Rapat Khusus' }] as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, user_id: user?.id };
      
      // FIX WAKTU MYSQL
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

      await api.post('/reservations', payload);
      
      setCustomAlert({
        isOpen: true, type: 'success', title: 'Berhasil Ditambahkan!', 
        message: 'Jadwal baru berhasil disimpan ke dalam sistem pimpinan.',
        onConfirm: () => router.push('/sekpim/jadwal')
      });
      
    } catch (error: any) {
      const responseData = error.response?.data;
      let errorMsg = 'Terjadi kesalahan saat menghubungi server.';
      if (error.response?.status === 422) {
        if (responseData?.errors) {
          const firstKey = Object.keys(responseData.errors)[0];
          errorMsg = responseData.errors[firstKey][0];
        } else if (responseData?.message) { errorMsg = responseData.message; }
      }
      setCustomAlert({ isOpen: true, type: 'error', title: 'Gagal Menyimpan', message: errorMsg, onConfirm: null });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="create-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .create-page-wrapper {
          padding: 32px 40px; 
          max-width: 900px; 
          margin: 0 auto; 
          font-family: var(--font-jakarta), sans-serif;
          animation: slideUpFade 0.5s ease forwards;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* --- TOMBOL KEMBALI KAPSUL --- */
        .btn-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: #eef2ff; color: #4f46e5; border: 1px solid transparent;
          padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; 
          cursor: pointer; transition: all 0.2s; margin-bottom: 24px;
          text-decoration: none; font-family: inherit;
        }
        .btn-back:hover { background: #e0e7ff; transform: translateX(-3px); border-color: #c7d2fe; }

        .page-title { margin: 0 0 24px 0; font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }

        /* --- FORM CARD --- */
        .form-card { 
          background: white; padding: 40px; border-radius: 24px; 
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; 
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .full-width { grid-column: span 2; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 13px; font-weight: 800; color: #334155; }
        
        /* 🔥 FIX MUTLAK iOS: Mencegah input luber & menjaga presisi vertikal 🔥 */
        .form-input, .form-select { 
          display: block;
          width: 100%; 
          max-width: 100%;
          min-width: 0;
          height: 52px; /* Kunci tinggi */
          padding: 14px 16px; 
          line-height: 20px; /* Penahan presisi teks di tengah */
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          font-size: 14px; 
          box-sizing: border-box !important; 
          transition: all 0.2s; 
          outline: none; 
          background: #f8fafc; 
          font-family: inherit; 
          font-weight: 600; 
          color: #0f172a;
          margin: 0;

          /* Reset tampilan kaku Apple */
          -webkit-appearance: none;
          appearance: none;
        }

        /* Khusus Select: Kembalikan panah dropdown yang hilang */
        .form-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat; 
          background-position: right 16px center; 
          background-size: 20px;
          padding-right: 40px;
        }

        .form-input::placeholder { color: #94a3b8; font-weight: 500; }
        .form-input:focus, .form-select:focus { 
          border-color: #4f46e5; background: white; 
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); 
        }

        /* Kembalikan icon kalender khusus di Desktop (pakai mouse) */
        @media (hover: hover) and (pointer: fine) {
          input[type="datetime-local"].form-input {
            -webkit-appearance: auto;
            appearance: auto;
            padding: 0 16px; /* Desktop aman pakai padding 0 */
          }
        }

        /* DIVIDER */
        .section-divider {
          grid-column: span 2;
          display: flex; align-items: center; margin: 8px 0;
        }
        .divider-line { flex: 1; height: 1px; background-color: #e2e8f0; }
        .divider-text { padding: 0 16px; font-size: 12px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

        /* TOMBOL SUBMIT */
        .btn-submit {
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); 
          color: white; border: none; width: 100%; height: 56px; 
          border-radius: 14px; font-size: 15px; font-weight: 800; 
          cursor: pointer; transition: 0.3s; box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3);
          display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(67, 56, 202, 0.4); }
        .btn-submit:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* RESPONSIVE DESIGN */
        @media (max-width: 768px) { 
          .create-page-wrapper { padding: 16px; } 
          .form-card { padding: 24px; border-radius: 20px; }
          .form-grid { grid-template-columns: 1fr; gap: 20px; } 
          .full-width, .section-divider { grid-column: span 1; } 
          .page-title { font-size: 24px; }
        }
      `}} />

      {/* Tombol Kembali Kapsul */}
      <button onClick={() => router.push('/sekpim/jadwal')} className="btn-back font-body">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Kembali ke Daftar Jadwal
      </button>
      
      <h1 className="page-title font-heading">Tambah Jadwal Baru</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-grid font-body">
          
          <div className="form-group full-width">
            <label className="form-label">Nama Kegiatan <span style={{color:'#ef4444'}}>*</span></label>
            <input type="text" className="form-input" required value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} placeholder="Contoh: Rapat Internal Evaluasi" autoFocus />
          </div>
          
          <div className="form-group">
            <label className="form-label">Waktu Mulai <span style={{color:'#ef4444'}}>*</span></label>
            <input type="datetime-local" className="form-input" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Waktu Selesai <span style={{color:'#ef4444'}}>*</span></label>
            <input type="datetime-local" className="form-input" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
          </div>
          
          <div className="section-divider">
            <div className="divider-line"></div>
            <span className="divider-text">Detail Lokasi</span>
            <div className="divider-line"></div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipe Lokasi</label>
            <select className="form-select" value={formData.location_type} onChange={e => setFormData({...formData, location_type: e.target.value})}>
              <option value="ruangan_terdaftar">Ruangan di Kantor</option>
              <option value="lainnya">Lokasi Eksternal / Luar Kantor</option>
            </select>
          </div>
          
          {formData.location_type === 'ruangan_terdaftar' ? (
            <div className="form-group">
              <label className="form-label">Pilih Ruangan <span style={{color:'#ef4444'}}>*</span></label>
              <select className="form-select" required value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})}>
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.room_name || r.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Nama Lokasi Eksternal <span style={{color:'#ef4444'}}>*</span></label>
              <input type="text" className="form-input" required value={formData.other_location} onChange={e => setFormData({...formData, other_location: e.target.value})} placeholder="Contoh: Hotel Borobudur, Jakarta Pusat" />
            </div>
          )}
          
          <div className="section-divider">
            <div className="divider-line"></div>
            <span className="divider-text">Detail Pelaksana</span>
            <div className="divider-line"></div>
          </div>

          <div className="form-group">
            <label className="form-label">Pejabat Pelaksana</label>
            <input type="text" className="form-input" value={formData.pejabat_pelaksana} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Pendamping (Opsional)</label>
            <input type="text" className="form-input" value={formData.pejabat_pendamping} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Pemerintahan" />
          </div>
          
          <div className="form-group full-width">
            <label className="form-label">Kategori Label</label>
            <input type="text" className="form-input" value={formData.category_label} onChange={e => setFormData({...formData, category_label: e.target.value})} placeholder="Contoh: Agenda Pimpinan / VIP" />
          </div>
          
          <div className="form-group full-width" style={{ marginTop: '8px' }}>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? (
                <><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Menyimpan...</>
              ) : (
                'Simpan Jadwal Baru'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CUSTOM ALERT COMPONENT PREMIUM */}
      {customAlert.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            
            <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: customAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: customAlert.type === 'success' ? '#15803d' : '#b91c1c' }}>
              {customAlert.type === 'success' ? (
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              )}
            </div>
            
            <h3 className="font-heading" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{customAlert.title}</h3>
            <p className="font-body" style={{ fontSize: '15px', color: '#64748b', margin: '0 0 32px 0', lineHeight: 1.6 }}>{customAlert.message}</p>
            
            <button 
              className="font-body"
              onClick={() => {
                if(customAlert.onConfirm) customAlert.onConfirm();
                setCustomAlert({...customAlert, isOpen: false});
              }} 
              style={{ background: customAlert.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', padding: '16px', width: '100%', borderRadius: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: '0.2s', boxShadow: customAlert.type === 'success' ? '0 10px 15px -3px rgba(16, 185, 129, 0.3)' : '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}