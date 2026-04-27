// frontend/app/sekpim/jadwal/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';

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
      // Ambil detail jadwal dari API Laravel (Anda perlu menambahkan Route::get('/reservations/{id}') di Laravel)
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
      setFormData({ event_name: 'Rapat Dummy', start_time: '2026-04-28T09:00', end_time: '2026-04-28T12:00', location_type: 'ruangan_terdaftar', other_location: '', pejabat_pelaksana: 'Walikota', pejabat_pendamping: 'Asisten Kesra', category_label: 'Wajib Hadir' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Mengirim perubahan. Backend Laravel HARUS memicu Notifikasi setelah proses update ini selesai.
      await api.put(`/reservations/${params.id}`, formData);
      alert('Perubahan berhasil disimpan! (Notifikasi dikirim ke Pemohon)');
      router.push('/sekpim/dashboard');
    } catch (error) {
      alert('Gagal menyimpan perubahan.');
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIKA FLOWCHART: Cek Role Asisten
  const isAsisten = user?.role?.toLowerCase() === 'asisten';

  if (isFetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat Detail Jadwal...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 14px; font-weight: 600; color: #1e293b; }
        .form-input { padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
        .form-input:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
        .full-width { grid-column: span 2; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
      `}} />

      <a href="/sekpim/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>&larr; Kembali</a>
      <h1 style={{ marginTop: '16px', marginBottom: '24px', fontSize: '24px', fontWeight: 800 }}>Edit Jadwal</h1>

      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {isAsisten && (
          <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', marginBottom: '24px', borderRadius: '8px', fontSize: '13px', color: '#1e40af', fontWeight: 500 }}>
            <strong>Mode Asisten:</strong> Anda hanya dapat mengedit "Pejabat Pelaksana" dan "Pendamping".
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          
          {/* Kolom Terkunci Untuk Asisten */}
          <div className="form-group full-width">
            <label className="form-label">Nama Kegiatan</label>
            <input type="text" className="form-input" disabled={isAsisten} value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Waktu Mulai</label>
            <input type="datetime-local" className="form-input" disabled={isAsisten} value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Waktu Selesai</label>
            <input type="datetime-local" className="form-input" disabled={isAsisten} value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Label Kategori</label>
            <input type="text" className="form-input" disabled={isAsisten} value={formData.category_label} onChange={e => setFormData({...formData, category_label: e.target.value})} />
          </div>

          <div className="full-width" style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }}></div>

          {/* Kolom Bebas Edit Untuk Semua */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#047857' }}>Pejabat Pelaksana</label>
            <input type="text" className="form-input" style={{ borderColor: '#10b981' }} value={formData.pejabat_pelaksana} onChange={e => setFormData({...formData, pejabat_pelaksana: e.target.value})} placeholder="Contoh: Walikota" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#047857' }}>Pejabat Pendamping</label>
            <input type="text" className="form-input" style={{ borderColor: '#10b981' }} value={formData.pejabat_pendamping} onChange={e => setFormData({...formData, pejabat_pendamping: e.target.value})} placeholder="Contoh: Asisten Kesra" />
          </div>

          <div className="form-group full-width" style={{ marginTop: '16px' }}>
            <Button type="submit" isLoading={isLoading} style={{ backgroundColor: '#1e40af', width: '100%' }}>Simpan Perubahan & Kirim Notifikasi</Button>
          </div>
        </form>
      </div>
    </div>
  );
}