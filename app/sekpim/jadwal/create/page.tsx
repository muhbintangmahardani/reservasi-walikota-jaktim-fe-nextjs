// frontend/app/sekpim/jadwal/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';

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
        message: 'Jadwal baru berhasil disimpan ke database.',
        onConfirm: () => router.push('/sekpim/jadwal') // Redirect setelah klik Mengerti
      });
      
    } catch (error: any) {
      const responseData = error.response?.data;
      let errorMsg = 'Terjadi kesalahan sistem.';
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
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 14px; font-weight: 600; color: #0f172a; }
        .form-input { padding: 12px 16px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; width: 100%; box-sizing: border-box; transition: 0.2s; outline: none; background: #f8fafc; }
        .form-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-select { padding: 12px 16px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; background-color: #f8fafc; transition: 0.2s; outline: none; }
        .form-select:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .full-width { grid-column: span 2; }
        .form-card { background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } .form-card { padding: 24px; } }
      `}} />

      <button onClick={() => router.push('/sekpim/jadwal')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '14px', marginBottom: '16px', padding: 0 }}>
        &larr; Kembali ke Daftar Jadwal
      </button>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>Tambah Jadwal Baru</h1>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Nama Kegiatan <span style={{color:'#ef4444'}}>*</span></label>
            <input type="text" className="form-input" required value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} placeholder="Contoh: Rapat Internal" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Waktu Mulai <span style={{color:'#ef4444'}}>*</span></label>
            <input type="datetime-local" className="form-input" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Waktu Selesai <span style={{color:'#ef4444'}}>*</span></label>
            <input type="datetime-local" className="form-input" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Lokasi</label>
            <select className="form-select" value={formData.location_type} onChange={e => setFormData({...formData, location_type: e.target.value})}>
              <option value="ruangan_terdaftar">Ruangan di Kantor</option>
              <option value="lainnya">Lokasi Eksternal / Lainnya</option>
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
              <input type="text" className="form-input" required value={formData.other_location} onChange={e => setFormData({...formData, other_location: e.target.value})} placeholder="Contoh: Hotel Borobudur" />
            </div>
          )}
          <div className="full-width" style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
          <div className="form-group">
            <label className="form-label">Pejabat Pelaksana</label>
            <input type="text" className="form-input" value={formData.pejabat_pelaksana} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" />
          </div>
          <div className="form-group">
            <label className="form-label">Pendamping</label>
            <input type="text" className="form-input" value={formData.pejabat_pendamping} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Pemerintahan" />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Kategori Label</label>
            <input type="text" className="form-input" value={formData.category_label} onChange={e => setFormData({...formData, category_label: e.target.value})} placeholder="Contoh: Agenda Pimpinan / VIP" />
          </div>
          <div className="form-group full-width" style={{ marginTop: '16px' }}>
            <Button type="submit" isLoading={isLoading} style={{ backgroundColor: '#2563eb', width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px' }}>
              Simpan Jadwal Baru
            </Button>
          </div>
        </form>
      </div>

      {/* CUSTOM ALERT COMPONENT */}
      {customAlert.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div style={{ width: '70px', height: '70px', margin: '0 auto 20px auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: customAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: customAlert.type === 'success' ? '#15803d' : '#b91c1c' }}>
              {customAlert.type === 'success' ? '✨' : '⚠️'}
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{customAlert.title}</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px 0', lineHeight: 1.6 }}>{customAlert.message}</p>
            <button 
              onClick={() => {
                if(customAlert.onConfirm) customAlert.onConfirm();
                setCustomAlert({...customAlert, isOpen: false});
              }} 
              style={{ background: customAlert.type === 'success' ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '14px', width: '100%', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}