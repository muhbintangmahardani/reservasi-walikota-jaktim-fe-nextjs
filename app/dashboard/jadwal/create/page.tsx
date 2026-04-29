// frontend/app/dashboard/jadwal/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Room { id: number; room_name: string; }

export default function FormReservasiUser() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [namaHari, setNamaHari] = useState('');

  const [formData, setFormData] = useState({
    tanggal: '', nama_acara: '', waktu_mulai: '', waktu_selesai: '',
    tempat_id: '', tempat_lainnya: '', pejabat_pelaksana: '', pejabat_pendamping: '',
    pakaian: '', asal_surat: ''
  });

  const daftarBagian = [
    "Bagian Pemerintahan", "Bagian Hukum", "Bagian Kepegawaian, Ketatalaksanaan, dan Pelayanan Publik (KKPP)",
    "Bagian Perekonomian", "Bagian Pembangunan dan Lingkungan Hidup (PLH)", "Bagian Umum dan Protokol",
    "Bagian Kesejehteraan Rakyat (Kesra)", "Bagian Program, Pelaporan, dan Keuangan (PPK)", "Pemberdayaan Kesejahteraan Keluarga (PKK)"
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data.filter((r: any) => r.is_active));
      } catch (err) {
        toast.error('Gagal memuat daftar ruangan dari server.');
      }
    };
    fetchRooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'waktu_selesai' && formData.waktu_mulai) {
      if (value <= formData.waktu_mulai) {
        Swal.fire({
          icon: 'warning',
          title: 'Waktu Tidak Valid!',
          text: 'Jam berakhir tidak boleh sama atau lebih cepat dari jam mulai.',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Paham, Atur Ulang',
          customClass: { popup: 'swal-custom-popup', title: 'swal-custom-title' }
        });
        return;
      }
    }

    if (name === 'waktu_mulai' && formData.waktu_selesai) {
      if (value >= formData.waktu_selesai) {
        Swal.fire({
          icon: 'info',
          title: 'Perhatian',
          text: 'Jam mulai melebihi batas jam berakhir. Silakan atur ulang jam berakhir Anda.',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Baik',
          customClass: { popup: 'swal-custom-popup', title: 'swal-custom-title' }
        });
        setFormData({ ...formData, waktu_mulai: value, waktu_selesai: '' });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'tanggal' && value) {
      const dateObj = new Date(value);
      const hari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
      setNamaHari(hari);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.waktu_selesai <= formData.waktu_mulai) {
      Swal.fire({
        icon: 'error', title: 'Error', text: 'Periksa kembali jam mulai dan berakhir Anda!',
        confirmButtonColor: '#ef4444', customClass: { popup: 'swal-custom-popup', title: 'swal-custom-title' }
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Mengirim pengajuan...');

    const payload = {
      event_name: formData.nama_acara,
      start_time: `${formData.tanggal} ${formData.waktu_mulai}:00`,
      end_time: `${formData.tanggal} ${formData.waktu_selesai}:00`,
      room_id: (formData.tempat_id === 'lainnya' || !formData.tempat_id) ? null : parseInt(formData.tempat_id),
      location_type: formData.tempat_id === 'lainnya' ? 'lainnya' : 'ruangan_terdaftar',
      other_location: formData.tempat_id === 'lainnya' ? formData.tempat_lainnya : null,
      pejabat_pelaksana: formData.pejabat_pelaksana,
      pejabat_pendamping: formData.pejabat_pendamping,
      pakaian: formData.pakaian,
      origin_unit: formData.asal_surat,
      status: 'pending'
    };

    try {
      await api.post('/reservations', payload);
      toast.success('Reservasi berhasil diajukan! Menunggu verifikasi.', { id: loadingToast });
      setTimeout(() => { router.push('/dashboard/history'); }, 1500);
      
    } catch (err: any) {
      setIsLoading(false);
      toast.dismiss(loadingToast);

      const responseData = err.response?.data || {};
      let errorMessage = responseData.message || 'Terjadi kesalahan saat menghubungi server.';

      const isConflict = errorMessage.toLowerCase().includes('terisi') || 
                         errorMessage.toLowerCase().includes('bentrok') || 
                         errorMessage.toLowerCase().includes('sudah ada') ||
                         err.response?.status === 409;

      Swal.fire({
        icon: isConflict ? 'error' : 'warning',
        title: isConflict ? 'Ruangan Sudah Terisi!' : 'Gagal Mengirim',
        text: isConflict ? 'Maaf, ruangan yang Anda pilih sudah dipesan pada rentang waktu tersebut. Silakan pilih waktu atau ruangan lain.' : errorMessage,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Tutup',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  return (
    <div className="form-reservasi-wrapper">
      <Toaster position="top-center" />

      {/* --- CSS PREMIUM KHUSUS FORM --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .form-reservasi-wrapper {
          max-width: 850px;
          margin: 0 auto;
          /* 🔥 DIPEPETKAN MAKSIMAL KE ATAS 🔥 */
          margin-top: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 60px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .swal-custom-popup { border-radius: 24px !important; font-family: var(--font-jakarta), sans-serif !important; }
        .swal-custom-title { font-family: var(--font-outfit), sans-serif !important; font-weight: 800 !important; color: #0f172a !important; }

        .btn-back-modern {
          display: inline-flex; align-items: center; gap: 8px;
          background-color: #eff6ff; 
          color: #2563eb; 
          padding: 8px 18px; 
          border-radius: 20px; 
          border: 1px solid #bfdbfe; 
          font-family: var(--font-jakarta), sans-serif; 
          font-size: 14px; 
          font-weight: 700;
          cursor: pointer; 
          transition: all 0.2s; 
          margin-top: 0 !important; /* Pastikan tidak ada jarak bawaan dari tombol */
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.05);
        }
        .btn-back-modern:hover { 
          background-color: #dbeafe; 
          color: #1d4ed8; 
          border-color: #93c5fd;
          transform: translateX(-4px); 
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .form-header-box { margin-bottom: 32px; }
        .form-header-box h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .form-header-box p { color: #64748b; font-size: 16px; margin: 0; }

        .form-card {
          background: #ffffff; padding: 40px; border-radius: 28px;
          border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
          overflow: hidden; 
          box-sizing: border-box;
        }

        .form-group { margin-bottom: 24px; width: 100%; box-sizing: border-box; }
        .form-label { display: block; font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        
        .modern-input {
          width: 100%; 
          height: 52px; 
          padding: 0 16px; 
          border-radius: 16px;
          border: 2px solid #e2e8f0; 
          background-color: #f8fafc;
          font-family: var(--font-jakarta), sans-serif; 
          font-size: 15px; 
          font-weight: 500; 
          color: #0f172a;
          transition: all 0.3s; 
          box-sizing: border-box; 
          outline: none; 
          margin: 0; 
          -webkit-appearance: none; 
          appearance: none; 
        }

        select.modern-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 16px center; background-size: 20px;
          padding-right: 40px;
        }

        .modern-input::placeholder { color: #94a3b8; font-weight: 400; }
        .modern-input:focus { border-color: #3b82f6; background-color: #ffffff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .modern-input:read-only { background-color: #e2e8f0; color: #475569; cursor: not-allowed; border-color: #cbd5e1; }

        .date-time-grid { display: flex; width: 100%; gap: 12px; }
        .date-time-grid > input:first-child { width: 30%; flex: 0 0 auto; }
        .date-time-grid > input:last-child { width: 70%; flex: 1 1 auto; min-width: 0; }

        .time-grid { display: flex; width: 100%; gap: 16px; }
        .time-grid > div { width: 50%; flex: 1 1 auto; min-width: 0; }

        .btn-submit {
          width: 100%; height: 56px; border-radius: 16px; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white; border: none; font-family: var(--font-jakarta), sans-serif; font-size: 16px; font-weight: 800;
          cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.15);
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(15, 23, 42, 0.25); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        .loading-spinner-circle { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #ffffff; border-radius: 50%; animation: spinLoading 0.8s linear infinite; }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spinLoading { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .form-reservasi-wrapper { padding-left: 15px; padding-right: 15px; }
        }

        @media (max-width: 768px) {
          /* 🔥 Di HP juga dibikin mepet 0px ke atas 🔥 */
          .form-reservasi-wrapper { padding-top: 0 !important; padding-bottom: 40px; }
          .btn-back-modern { margin-top: 0 !important; margin-bottom: 16px; }
          .form-header-box { margin-bottom: 24px; }
          .form-header-box h2 { font-size: 24px; line-height: 1.2; margin-bottom: 6px; }
          .form-card { padding: 24px; border-radius: 20px; }
          
          .date-time-grid { flex-direction: column; gap: 16px; }
          .date-time-grid > input:first-child, .date-time-grid > input:last-child { width: 100%; }
          
          .time-grid { flex-direction: column; gap: 16px; }
          .time-grid > div { width: 100%; }
        }
      `}} />

      {/* --- TOMBOL KEMBALI & HEADER --- */}
      <button onClick={() => router.push('/dashboard/jadwal')} className="btn-back-modern">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Kembali ke Kalender
      </button>

      <div className="form-header-box">
        <h2 className="font-heading">Form Reservasi Ruangan</h2>
        <p className="font-body">Lengkapi detail kegiatan Anda dengan benar untuk proses verifikasi.</p>
      </div>

      {/* --- CARD FORM --- */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label font-body">Pilih Tanggal Acara</label>
            <div className="date-time-grid">
              <input type="text" readOnly value={namaHari ? `${namaHari}` : 'Hari'} className="modern-input font-body" style={{ textAlign: 'center', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 700 }} />
              <input type="date" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="modern-input font-body" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-body">Nama Acara / Kegiatan</label>
            <input type="text" name="nama_acara" required value={formData.nama_acara} onChange={handleChange} placeholder="Contoh: Rapat Koordinasi Wilayah Timur" className="modern-input font-body" />
          </div>

          <div className="form-group time-grid">
            <div>
              <label className="form-label font-body">Jam Mulai</label>
              <input type="time" name="waktu_mulai" required value={formData.waktu_mulai} onChange={handleChange} className="modern-input font-body" />
            </div>
            <div>
              <label className="form-label font-body">Jam Berakhir</label>
              <input type="time" name="waktu_selesai" required value={formData.waktu_selesai} onChange={handleChange} className="modern-input font-body" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-body">Lokasi Ruangan</label>
            <select name="tempat_id" required value={formData.tempat_id} onChange={handleChange} className="modern-input modern-select font-body">
              <option value="" disabled>-- Pilih Ruangan yang Tersedia --</option>
              {rooms.map(room => <option key={room.id} value={room.id}>{room.room_name}</option>)}
              <option value="lainnya" style={{ fontWeight: 700 }}>+ Lokasi Lainnya (Luar Gedung)</option>
            </select>
            
            {formData.tempat_id === 'lainnya' && (
              <div style={{ marginTop: '12px', animation: 'slideUpFade 0.3s forwards' }}>
                <input type="text" name="tempat_lainnya" required value={formData.tempat_lainnya} onChange={handleChange} placeholder="Ketik nama lokasi / alamat di sini..." className="modern-input font-body" style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff' }} />
              </div>
            )}
          </div>

          <div className="form-group time-grid">
            <div>
              <label className="form-label font-body">Pejabat Pelaksana</label>
              <input type="text" name="pejabat_pelaksana" required value={formData.pejabat_pelaksana} onChange={handleChange} placeholder="Contoh: Walikota" className="modern-input font-body" />
            </div>
            <div>
              <label className="form-label font-body">Pejabat Pendamping <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Opsional)</span></label>
              <input type="text" name="pejabat_pendamping" value={formData.pejabat_pendamping} onChange={handleChange} placeholder="Contoh: Asisten Perekonomian" className="modern-input font-body" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-body">Dresscode / Pakaian</label>
            <input type="text" name="pakaian" required value={formData.pakaian} onChange={handleChange} placeholder="Contoh: Pakaian Dinas Harian (PDH)" className="modern-input font-body" />
          </div>

          <div className="form-group">
            <label className="form-label font-body">Asal Surat / Unit Pemohon</label>
            <select name="asal_surat" required value={formData.asal_surat} onChange={handleChange} className="modern-input modern-select font-body">
              <option value="" disabled>-- Pilih Unit Bagian --</option>
              {daftarBagian.map((bagian, idx) => (
                <option key={idx} value={bagian}>{bagian}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? (
              <>
                <div className="loading-spinner-circle"></div>
                Memproses Pengajuan...
              </>
            ) : (
              'Kirim Pengajuan Reservasi'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}