// frontend/app/dashboard/jadwal/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Room { id: number; room_name: string; }
interface Reservation { id: number; event_name: string; start_time: string; end_time: string; status: 'pending' | 'verified' | 'rejected'; room_id: number; }

export default function CekJadwalRuangan() {
  const router = useRouter();
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  const hours = Array.from({ length: 13 }, (_, i) => i + 7);

  const getNext14Days = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i); dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const dateList = getNext14Days();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resRooms = await api.get('/rooms');
        setRooms(resRooms.data.filter((r: any) => r.is_active));
        const resJadwal = await api.get(`/reservations?_t=${Date.now()}`);
        setAllReservations(resJadwal.data.filter((r: Reservation) => r.status !== 'rejected'));
      } catch (err) {} finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const getDateStatusColor = (dateStr: string) => {
    const count = allReservations.filter(r => r.start_time.startsWith(dateStr)).length;
    if (count === 0) return 'transparent'; 
    if (rooms.length > 0 && count >= (rooms.length * 2)) return '#fee2e2'; // Merah (Penuh)
    return '#fef9c3'; // Kuning (Sebagian)
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' });
  };

  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const activeMonthYear = new Date(selectedDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const dailyReservations = allReservations.filter(r => r.start_time.startsWith(selectedDate));

  const calculateBlockStyle = (startTime: string, endTime: string) => {
    const start = new Date(startTime); const end = new Date(endTime);
    let startHour = Math.max(7, start.getHours() + start.getMinutes() / 60);
    let endHour = Math.min(19, end.getHours() + end.getMinutes() / 60);
    const top = Math.round((startHour - 7) * 60); 
    const height = Math.max(24, Math.round((endHour - startHour) * 60)); 
    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* CSS KHUSUS UNTUK EFEK EXPAND (HOVER PADA BLOK KECIL) */}
      <style dangerouslySetInnerHTML={{__html: `
        .event-block {
          position: absolute; left: 4px; right: 4px;
          border-radius: 6px; padding: 4px 8px;
          overflow: hidden; z-index: 15;
          display: flex; flex-direction: column; cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .event-block:hover {
          z-index: 50 !important;
          height: auto !important;
          min-height: max-content;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }
        .event-block .event-title {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .event-block:hover .event-title {
          white-space: normal; overflow: visible;
        }
        .event-block .event-time { display: none; }
        .event-block:hover .event-time { display: block; margin-top: 4px; }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Cek Jadwal Reservasi</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Lihat ketersediaan ruangan sebelum mengajukan form.</p>
        </div>
        <button onClick={() => router.push('/dashboard/jadwal/create')} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Isi Form Reservasi
        </button>
      </div>

      <div style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activeMonthYear}</h3>
        </div>
        
        {/* STRIP TANGGAL HORIZONTAL */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {dateList.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            const statusBg = getDateStatusColor(dateStr);
            let borderColor = '#e2e8f0'; if (statusBg === '#fee2e2') borderColor = '#ef4444'; if (statusBg === '#fef9c3') borderColor = '#eab308'; 
            
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)} style={{ flexShrink: 0, padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', background: isSelected ? '#2563eb' : statusBg, color: isSelected ? '#fff' : '#0f172a', border: isSelected ? '2px solid #2563eb' : `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: isSelected ? '#bfdbfe' : '#64748b' }}>{getDayName(dateStr)}</span>
                <span style={{ fontSize: '18px', fontWeight: 800 }}>{dateStr.split('-')[2]}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* KETERANGAN / LEGENDA WARNA TANGGAL                             */}
        {/* ============================================================== */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}></div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Belum Ada Jadwal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #eab308', backgroundColor: '#fef9c3' }}></div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Tersedia / Sebagian Terisi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #ef4444', backgroundColor: '#fee2e2' }}></div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Jadwal Penuh</span>
          </div>
        </div>
        {/* ============================================================== */}
      </div>

      {/* KALENDER GRID BAWAH */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '650px', position: 'relative' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Memuat jadwal...</div>
          ) : (
            <div style={{ display: 'flex', minWidth: 'max-content', position: 'relative' }}>
              
              {/* KOLOM JAM (KIRI STICKY) */}
              <div style={{ width: '70px', flexShrink: 0, borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc', position: 'sticky', left: 0, zIndex: 30 }}>
                <div style={{ height: '60px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', position: 'sticky', top: 0, zIndex: 40 }}></div>
                <div style={{ position: 'relative' }}>
                  {hours.slice(0, -1).map(hour => (
                    <div key={hour} style={{ height: '60px', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{hour.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))}
                  <div style={{ position: 'relative' }}><span style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>19:00</span></div>
                </div>
              </div>

              {/* KOLOM RUANGAN */}
              <div style={{ display: 'flex', flex: 1 }}>
                {rooms.map(room => {
                  const roomReservations = dailyReservations.filter(r => r.room_id === room.id);
                  
                  return (
                    <div key={room.id} style={{ width: '220px', flex: 1, borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                      <div style={{ height: '60px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        {room.room_name}
                      </div>

                      <div style={{ position: 'relative', height: `${(hours.length - 1) * 60}px`, backgroundColor: '#fff' }}>
                        {hours.slice(0, -1).map((hour) => (
                          <div key={hour} style={{ height: '60px', borderTop: '1px solid #f1f5f9', boxSizing: 'border-box' }}></div>
                        ))}

                        {/* BLOCK ACARA */}
                        {roomReservations.map(res => {
                          const style = calculateBlockStyle(res.start_time, res.end_time);
                          const isVerified = res.status === 'verified';
                          
                          return (
                            <div 
                              key={res.id} 
                              className="event-block"
                              style={{
                                top: style.top, 
                                height: style.height,
                                minHeight: style.height,
                                backgroundColor: isVerified ? '#eff6ff' : '#f8fafc',
                                border: `1px solid ${isVerified ? '#bfdbfe' : '#e2e8f0'}`,
                                borderLeft: `4px solid ${isVerified ? '#3b82f6' : '#cbd5e1'}`,
                              }}
                            >
                              <p className="event-title" style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', margin: '0 0 2px 0', lineHeight: 1.3 }}>
                                {res.event_name}
                              </p>
                              <p className="event-time" style={{ fontSize: '11px', color: '#3b82f6', margin: 0, fontWeight: 600 }}>
                                {formatTime(res.start_time)} - {formatTime(res.end_time)}
                              </p>
                            </div>
                          );
                        })}
                        
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}