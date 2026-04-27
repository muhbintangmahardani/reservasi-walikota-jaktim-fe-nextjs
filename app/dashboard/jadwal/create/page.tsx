// frontend/app/dashboard/jadwal/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';

interface Room {
  id: number;
  room_name: string;
}

export default function FormReservasiUser() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [namaHari, setNamaHari] = useState('');

  // State Form 100% Sesuai Flowchart
  const [formData, setFormData] = useState({
    tanggal: '',
    nama_acara: '',
    waktu_mulai: '',
    waktu_selesai: '',
    tempat_id: '',
    tempat_lainnya: '',
    pejabat_pelaksana: '',
    pejabat_pendamping: '',
    pakaian: '',
    asal_surat: ''
  });

  // Daftar Asal Surat/Undangan Sesuai Flowchart Strict
  const daftarBagian = [
    "Bagian Pemerintahan",
    "Bagian Hukum",
    "Bagian Kepegawaian, Ketatalaksanaan, dan Pelayanan Publik (KKPP)",
    "Bagian Perekonomian",
    "Bagian Pembangunan dan Lingkungan Hidup (PLH)",
    "Bagian Umum dan Protokol",
    "Bagian Kesejehteraan Rakyat (Kesra)",
    "Bagian Program, Pelaporan, dan Keuangan (PPK)",
    "Pemberdayaan Kesejahteraan Keluarga (PKK)"
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

  // Update State dan Otomatis Hitung "Hari"
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Jika yang diubah adalah tanggal, otomatis cari nama harinya
    if (name === 'tanggal' && value) {
      const dateObj = new Date(value);
      const hari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
      setNamaHari(hari);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Mengirim pengajuan...');

    // Mapping payload untuk backend Laravel
    const payload = {
      event_name: formData.nama_acara,
      start_time: `${formData.tanggal} ${formData.waktu_mulai}:00`,
      end_time: `${formData.tanggal} ${formData.waktu_selesai}:00`,
      
      // 🛠️ PERBAIKAN 1: Pastikan ID ruangan adalah null jika 'lainnya' atau kosong
      room_id: (formData.tempat_id === 'lainnya' || !formData.tempat_id) ? null : parseInt(formData.tempat_id),
      
      // 🛠️ PERBAIKAN 2: Gunakan kata kunci baku yang dikenali Laravel & Sekpim
      location_type: formData.tempat_id === 'lainnya' ? 'lainnya' : 'ruangan_terdaftar',
      other_location: formData.tempat_id === 'lainnya' ? formData.tempat_lainnya : null,
      
      pejabat_pelaksana: formData.pejabat_pelaksana,
      pejabat_pendamping: formData.pejabat_pendamping,
      pakaian: formData.pakaian,
      origin_unit: formData.asal_surat,
      status: 'pending' // 🛠️ Tambahkan status default pending
    };

    try {
      await api.post('/reservations', payload);
      toast.success('Reservasi berhasil diajukan! Menunggu verifikasi.', { id: loadingToast });
      
      // Beri jeda 1 detik agar user bisa membaca toast sukses sebelum pindah halaman
      setTimeout(() => {
        router.push('/dashboard/history');
      }, 1000);
      
    } catch (err: any) {
      setIsLoading(false);
      
      // 🕸️ JARING RAKSASA: Tangkap SEMUA status code dan pesannya!
      const statusCode = err.response?.status || 'Tidak ada status (Network Error / CORS)';
      const responseData = err.response?.data || err.message;
      
      const errorText = JSON.stringify(responseData, null, 2);
      
      // Paksa pop-up muncul apapun yang terjadi!
      alert(`🚨 TERJADI ERROR!\nStatus Code: ${statusCode}\n\nBalasan Server:\n${errorText}`);
      
      console.error("Error Detail:", err);
      toast.error(`Gagal! Error ${statusCode}`, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <Toaster position="top-center" />

      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => router.push('/dashboard/jadwal')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          &larr; Kembali ke Jadwal
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Form Pengajuan Reservasi Ruangan</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Sesuai standar operasional, mohon isi data berikut dengan lengkap.</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. HARI, TANGGAL */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Hari, Tanggal</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="text" readOnly value={namaHari ? `${namaHari},` : 'Hari,'} style={{ width: '120px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }} placeholder="Hari" />
              <input type="date" name="tanggal" required value={formData.tanggal} onChange={handleChange} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>

          {/* 2. NAMA ACARA */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nama Acara</label>
            <input type="text" name="nama_acara" required value={formData.nama_acara} onChange={handleChange} placeholder="Contoh: Rapat Koordinasi Wilayah" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          {/* 3. JAM MULAI - BERAKHIR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Jam Mulai</label>
              <input type="time" name="waktu_mulai" required value={formData.waktu_mulai} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Jam Berakhir</label>
              <input type="time" name="waktu_selesai" required value={formData.waktu_selesai} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>

          {/* 4. TEMPAT */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Tempat</label>
            <select name="tempat_id" required value={formData.tempat_id} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', marginBottom: formData.tempat_id === 'lainnya' ? '12px' : '0' }}>
              <option value="" disabled>-- Dropdown list (TBA) --</option>
              {rooms.map(room => <option key={room.id} value={room.id}>{room.room_name}</option>)}
              <option value="lainnya">Lainnya (Isi free text)</option>
            </select>
            {/* Muncul Jika Pilih "Lainnya" */}
            {formData.tempat_id === 'lainnya' && (
              <input type="text" name="tempat_lainnya" required value={formData.tempat_lainnya} onChange={handleChange} placeholder="Sebutkan tempat (Isi free text)..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #3b82f6', backgroundColor: '#eff6ff', outline: 'none' }} />
            )}
          </div>

          {/* 5 & 6. PEJABAT PELAKSANA & PENDAMPING */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pejabat Pelaksana</label>
              <input type="text" name="pejabat_pelaksana" required value={formData.pejabat_pelaksana} onChange={handleChange} placeholder="Pejabat Pelaksana" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pejabat Pendamping</label>
              <input type="text" name="pejabat_pendamping" value={formData.pejabat_pendamping} onChange={handleChange} placeholder="Pejabat Pendamping" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>

          {/* 7. PAKAIAN */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pakaian</label>
            <input type="text" name="pakaian" required value={formData.pakaian} onChange={handleChange} placeholder="Pakaian yang digunakan" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          {/* 8. ASAL SURAT / UNDANGAN */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Asal Surat / Undangan</label>
            <select name="asal_surat" required value={formData.asal_surat} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
              <option value="" disabled>-- Pilih Asal Surat / Undangan --</option>
              {daftarBagian.map((bagian, idx) => (
                <option key={idx} value={bagian}>{bagian}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} style={{ marginTop: '24px', width: '100%', padding: '14px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {isLoading ? 'Memproses Pengajuan...' : 'Submit Form Reservasi'}
          </button>

        </form>
      </div>
    </div>
  );
}