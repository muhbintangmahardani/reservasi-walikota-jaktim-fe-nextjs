// frontend/app/dashboard/ruangan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

// Mendefinisikan tipe data TypeScript untuk Ruangan
interface Room {
  id: number;
  room_name: string;
  capacity: number;
  facilities: string;
  is_active: boolean;
}

export default function RuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fungsi untuk mengambil data ruangan dari API Laravel
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data);
      } catch (err: any) {
        setError('Gagal mengambil data ruangan. Pastikan server aktif.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER HALAMAN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            Data Master Ruangan
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Daftar fasilitas ruangan yang dapat dipesan oleh unit kerja.
          </p>
        </div>
        
        {/* Tombol Tambah (Opsional untuk Admin nanti) */}
        <button style={{ 
          backgroundColor: '#2563eb', color: 'white', border: 'none', 
          padding: '10px 20px', borderRadius: '8px', fontWeight: 600, 
          fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Tambah Ruangan
        </button>
      </div>

      {/* KOTAK TABEL */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        
        {/* State Loading & Error */}
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            Memuat data ruangan...
          </div>
        ) : error ? (
          <div style={{ padding: '20px', background: '#fef2f2', color: '#ef4444', textAlign: 'center', borderBottom: '1px solid #fee2e2' }}>
            {error}
          </div>
        ) : (
          /* Wrapper Tabel untuk Responsif (Bisa di-scroll menyamping di HP) */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Ruangan</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kapasitas</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fasilitas Utama</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {room.room_name}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        {room.capacity} Orang
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', lineHeight: '1.5', maxWidth: '300px' }}>
                      {room.facilities}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: room.is_active ? '#dcfce7' : '#fef2f2',
                        color: room.is_active ? '#166534' : '#991b1b'
                      }}>
                        {room.is_active ? 'Tersedia' : 'Maintenance'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Tampilan jika data kosong */}
                {rooms.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      Belum ada data ruangan yang didaftarkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}