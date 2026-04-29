// frontend/app/sekpim/jadwal/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';

export default function EditJadwalPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // State Sesuai Database
  const [formData, setFormData] = useState({
    event_name: '',
    start_time: '',
    end_time: '',
    location_type: 'ruangan_terdaftar',
    other_location: '',
    pejabat_pelaksana: '',
    pejabat_pendamping: '',
    category_label: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchDetailJadwal();
  }, [params.id]);

  const fetchDetailJadwal = async () => {
    setIsFetching(true);
    try {
      // Ambil detail jadwal dari API Laravel
      const res = await api.get(`/reservations/${params.id}`);
      const data = res.data.data;
      
      // Format datetime string untuk input type="datetime-local" (YYYY-MM-DDTHH:MM)
      const formatForInput = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';

      setFormData({
        event_name: data.event_name || '',
        start_time: formatForInput(data.start_time),
        end_time: formatForInput(data.end_time),
        location_type: data.location_type || 'ruangan_terdaftar',
        other_location: data.other_location || '',
        pejabat_pelaksana: data.pejabat_pelaksana || '',
        pejabat_pendamping: data.pejabat_pendamping || '',
        category_label: data.category_label || ''
      });
    } catch (error) {
      console.warn('Gagal ambil data, menggunakan data dummy');
      // Dummy data fallback
      setFormData({ event_name: 'Rapat Koordinasi Wilayah', start_time: '2026-04-28T09:00', end_time: '2026-04-28T12:00', location_type: 'ruangan_terdaftar', other_location: '', pejabat_pelaksana: 'Walikota', pejabat_pendamping: 'Asisten Kesra', category_label: 'Wajib Hadir' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadToast = toast.loading('Menyimpan perubahan...');

    try {
      // Mengirim perubahan. Backend Laravel memicu Notifikasi setelah proses update ini selesai.
      await api.put(`/reservations/${params.id}`, formData);
      toast.success('Perubahan berhasil disimpan!', { id: loadToast });
      
      // Redirect mulus setelah toast terlihat
      setTimeout(() => {
        router.push('/sekpim/jadwal');
      }, 1200);
      
    } catch (error) {
      toast.error('Gagal menyimpan perubahan. Periksa koneksi Anda.', { id: loadToast });
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIKA FLOWCHART: Cek Role Asisten
  const isAsisten = user?.role?.toLowerCase() === 'asisten';

  // --- TAMPILAN ANIMASI LOADING SAAT FETCHING DATA ---
  if (isFetching) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'var(--font-jakarta), sans-serif' }}>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
        <div style={{ width: '48px', height: '48px', border: '4px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', fontFamily: 'var(--font-outfit), sans-serif' }}>Mengambil Data Jadwal</h3>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: 500 }}>Mohon tunggu sebentar...</p>
      </div>
    );
  }

  return (
    <div className="edit-page-wrapper">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{__html: `
        .edit-page-wrapper {
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

        /* --- ALERT ASISTEN --- */
        .alert-banner {
          background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #22c55e; 
          padding: 16px 20px; margin-bottom: 24px; border-radius: 16px; 
          display: flex; gap: 16px; align-items: flex-start;
        }
        .alert-banner p { margin: 0; font-size: 14px; color: #166534; line-height: 1.6; font-weight: 500; }

        /* --- FORM CARD --- */
        .form-card { 
          background: white; padding: 40px; border-radius: 24px; 
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; 
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .full-width { grid-column: span 2; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        
        .label-wrapper { display: flex; justify-content: space-between; align-items: center; }
        .form-label { font-size: 13px; font-weight: 800; color: #334155; }
        .lock-icon { color: #94a3b8; display: flex; align-items: center; }
        
        /* 🔥 FIX MUTLAK iOS: Mencegah input luber & menjaga presisi vertikal 🔥 */
        .form-input { 
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
        .form-input:focus:not(:disabled) { 
          border-color: #4f46e5; background: white; 
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); 
        }
        
        /* STATE DISABLED (TERKUNCI) */
        .form-input:disabled {
          background-color: #f1f5f9; color: #64748b; border-color: #e2e8f0; cursor: not-allowed;
          opacity: 0.8;
          -webkit-text-fill-color: #64748b; /* 🔥 FIX iOS: Agar teks yang dikunci tidak pudar/transparan 🔥 */
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
          color: white; border: none; width: 100%; padding: 16px; 
          border-radius: 14px; font-size: 15px; font-weight: 800; 
          cursor: pointer; transition: 0.3s; box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3);
          display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(67, 56, 202, 0.4); }
        .btn-submit:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; transform: none; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* RESPONSIVE DESIGN */
        @media (max-width: 768px) { 
          .edit-page-wrapper { padding: 16px; } 
          .form-card { padding: 24px; border-radius: 20px; }
          .form-grid { grid-template-columns: 1fr; gap: 20px; } 
          .full-width, .section-divider { grid-column: span 1; } 
          .page-title { font-size: 24px; }
          .alert-banner { flex-direction: column; gap: 12px; }
        }
      `}} />

      {/* Tombol Kembali Kapsul */}
      <button onClick={() => router.push('/sekpim/jadwal')} className="btn-back font-body">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Kembali ke Daftar Jadwal
      </button>
      
      <h1 className="page-title font-heading">Edit Jadwal Aktif</h1>

      <div className="form-card">
        
        {isAsisten && (
          <div className="alert-banner">
            <div style={{ color: '#16a34a', flexShrink: 0 }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="font-body">
              <strong>Mode Asisten Aktif:</strong> Sesuai dengan hak akses Anda, informasi inti kegiatan telah dikunci oleh sistem. Anda hanya diizinkan untuk menyesuaikan kolom <strong>Pejabat Pelaksana</strong> dan <strong>Pendamping</strong>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid font-body">
          
          {/* --- KOLOM TERKUNCI UNTUK ASISTEN --- */}
          <div className="form-group full-width">
            <div className="label-wrapper">
              <label className="form-label">Nama Kegiatan</label>
              {isAsisten && <span className="lock-icon" title="Dikunci"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>}
            </div>
            <input type="text" className="form-input" disabled={isAsisten} value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} />
          </div>
          
          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">Waktu Mulai</label>
              {isAsisten && <span className="lock-icon" title="Dikunci"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>}
            </div>
            <input type="datetime-local" className="form-input" disabled={isAsisten} value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          </div>

          <div className="form-group">
            <div className="label-wrapper">
              <label className="form-label">Waktu Selesai</label>
              {isAsisten && <span className="lock-icon" title="Dikunci"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>}
            </div>
            <input type="datetime-local" className="form-input" disabled={isAsisten} value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
          </div>

          <div className="form-group full-width">
            <div className="label-wrapper">
              <label className="form-label">Label Kategori</label>
              {isAsisten && <span className="lock-icon" title="Dikunci"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>}
            </div>
            <input type="text" className="form-input" disabled={isAsisten} value={formData.category_label} onChange={e => setFormData({...formData, category_label: e.target.value})} />
          </div>

          <div className="section-divider">
            <div className="divider-line"></div>
            <span className="divider-text">Area Bebas Edit</span>
            <div className="divider-line"></div>
          </div>

          {/* --- KOLOM BEBAS EDIT UNTUK SEMUA (Diberi aksen hijau agar kontras) --- */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#047857' }}>Pejabat Pelaksana</label>
            <input type="text" className="form-input" style={{ borderColor: '#10b981', backgroundColor: '#f0fdf4' }} value={formData.pejabat_pelaksana} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#047857' }}>Pejabat Pendamping</label>
            <input type="text" className="form-input" style={{ borderColor: '#10b981', backgroundColor: '#f0fdf4' }} value={formData.pejabat_pendamping} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Kesra" />
          </div>

          <div className="form-group full-width" style={{ marginTop: '8px' }}>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? (
                <><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Menyimpan...</>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  Simpan Perubahan & Kirim Notifikasi
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}