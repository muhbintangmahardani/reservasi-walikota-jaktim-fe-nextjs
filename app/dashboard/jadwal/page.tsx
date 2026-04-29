// frontend/app/dashboard/jadwal/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Room { id: number; room_name: string; }
interface Reservation { id: number; event_name: string; start_time: string; end_time: string; status: 'pending' | 'verified' | 'rejected'; room_id: number; origin_unit?: string; }

export default function CekJadwalRuangan() {
  const router = useRouter();
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  // STATE UNTUK DRAG-TO-SCROLL (Pemilih Tanggal)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Array 24 Jam (0 - 23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Menghitung waktu saat ini (untuk garis merah real-time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeMinutes((now.getHours() * 60) + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update setiap 1 menit
    return () => clearInterval(interval);
  }, []);

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
        
        // Filter cerdas menangkap kata kunci meskipun ada tambahan "(RRU)"
        const targetKeywords = ['pola', 'utama', 'rru', 'khusus walikota'];
        const filteredRooms = resRooms.data.filter((r: any) => 
          r.is_active && targetKeywords.some(keyword => r.room_name.toLowerCase().includes(keyword))
        );
        
        // Menampilkan hasil filter
        setRooms(filteredRooms.length > 0 ? filteredRooms : resRooms.data.filter((r: any) => r.is_active));
        
        const resJadwal = await api.get(`/reservations?_t=${Date.now()}`);
        setAllReservations(resJadwal.data.filter((r: Reservation) => r.status !== 'rejected'));
      } catch (err) {
        console.error("Gagal memuat jadwal", err);
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  const getDateStatusColor = (dateStr: string) => {
    const count = allReservations.filter(r => r.start_time.startsWith(dateStr)).length;
    if (count === 0) return 'transparent'; 
    if (rooms.length > 0 && count >= (rooms.length * 2)) return '#fee2e2'; 
    return '#fef9c3'; 
  };

  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' });
  const getMonthName = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  const activeMonthYear = new Date(selectedDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const dailyReservations = allReservations.filter(r => r.start_time.startsWith(selectedDate));
  
  // Cek apakah tanggal yang dipilih adalah HARI INI
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const calculateBlockStyle = (startTime: string, endTime: string) => {
    const start = new Date(startTime); const end = new Date(endTime);
    let startHour = start.getHours() + start.getMinutes() / 60;
    let endHour = end.getHours() + end.getMinutes() / 60;
    
    // Handle jika jadwal berakhir di 00:00 hari berikutnya
    if (endHour === 0 && startHour > 0) endHour = 24;
    
    const top = Math.round(startHour * 60); 
    const height = Math.max(20, Math.round((endHour - startHour) * 60)); // Tinggi minimum 20px
    return { top: `${top}px`, height: `${height}px` };
  };

  // FUNGSI DRAG MOUSE UNTUK TANGGAL
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="jadwal-room-wrapper">
      
      {/* --- CSS KUSTOM GABUNGAN UI MODERN --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .jadwal-room-wrapper {
          max-width: 1200px; margin: 0 auto; padding-bottom: 60px;
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* HEADER */
        .header-jadwal { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px; margin-top: 10px;
        }
        .header-jadwal h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .header-jadwal p { color: #64748b; font-size: 16px; margin: 0; }

        .btn-booking {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white; border: none; padding: 14px 24px; border-radius: 16px;
          font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.15);
        }
        .btn-booking:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(15, 23, 42, 0.25); }

        /* WADAH TANGGAL */
        .date-container {
          background: #ffffff; padding: 24px; border-radius: 24px; margin-bottom: 32px;
          border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
        }

        .date-scroller-cek {
          display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; margin-top: 16px;
          scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; cursor: grab;
        }
        .date-scroller-cek:active { cursor: grabbing; }
        .date-scroller-cek::-webkit-scrollbar { display: none; }

        .cek-date-card {
          user-select: none; flex-shrink: 0; padding: 14px 16px; border-radius: 16px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; 
          align-items: center; gap: 4px; min-width: 85px; background: #fff;
        }

        /* KALENDER GRID (VERSI MODERN CLEAN) */
        .grid-container {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px;
          overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
          position: relative;
        }
        
        .grid-scroll-area {
          overflow-x: auto; overflow-y: auto; max-height: 750px; position: relative;
        }
        .grid-scroll-area::-webkit-scrollbar { width: 8px; height: 8px; }
        .grid-scroll-area::-webkit-scrollbar-track { background: #f8fafc; }
        .grid-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        /* SUMBU WAKTU (FIXED ALIGNMENT) */
        .time-axis {
          width: 65px; flex-shrink: 0; background: #ffffff; 
          position: sticky; left: 0; z-index: 40; border-right: 1px solid #f1f5f9;
        }
        .time-slot { height: 60px; position: relative; }
        
        .time-label {
          position: absolute; top: 0; right: 10px; transform: translateY(-50%);
          font-size: 11.5px; color: #94a3b8; font-weight: 600; 
          background: #ffffff; padding: 0 4px; line-height: 1;
        }

        .room-column {
          width: 280px; min-width: 280px; flex: 1; border-right: 1px solid #f1f5f9; position: relative;
        }
        .room-column:last-child { border-right: none; }
        
        .room-header {
          height: 60px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 30; display: flex; align-items: center; 
          justify-content: center; font-weight: 800; color: #0f172a; font-size: 14.5px;
          border-bottom: 1px solid #e2e8f0; padding: 0 16px; text-align: center;
        }

        .grid-line { 
          height: 60px; border-bottom: 1px solid #f1f5f9; box-sizing: border-box; position: relative; 
        }
        .grid-line::after {
          content: ''; position: absolute; top: 50%; left: 0; right: 0;
          border-top: 1px dashed #f8fafc;
        }

        /* 🔥 EVENT CHIPS - KEMBALIKAN EFEK HOVER (POP-OUT) 🔥 */
        .event-block {
          position: absolute; left: 4px; right: 8px; border-radius: 8px; padding: 6px 10px;
          overflow: hidden; z-index: 15; display: flex; flex-direction: column; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        /* Efek Hover / Tap aktif di Mobile untuk menampilkan jadwal yang terlalu sempit */
        .event-block:hover, .event-block:active, .event-block:focus {
          z-index: 50 !important; height: auto !important; min-height: max-content;
          transform: scale(1.02); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05);
        }
        
        .event-title { 
          white-space: normal; 
          font-size: 13.5px; font-weight: 800; margin: 0 0 4px 0; line-height: 1.25; 
        }
        
        .event-time { 
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 600; opacity: 0.9; margin: 0 0 4px 0; 
        }
        
        .event-unit { 
          display: inline-block; font-size: 10.5px; padding: 2px 0px; 
          width: fit-content; font-weight: 700; line-height: 1.2; margin: 0; opacity: 0.85;
        }

        /* GARIS MERAH REALTIME */
        .current-time-line {
          position: absolute; left: 0; right: 0; height: 2px; background-color: #ef4444; z-index: 25; pointer-events: none;
        }
        .current-time-dot {
          position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%;
        }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* --- RESPONSIVE IPAD --- */
        @media (max-width: 1024px) {
          .jadwal-room-wrapper { padding-left: 15px; padding-right: 15px; }
          .header-jadwal { margin-top: 8px; margin-bottom: 24px; }
          .room-column { width: 230px; min-width: 230px; }
          
          .event-block { padding: 6px 8px; }
          .event-title { font-size: 12.5px; }
          .event-time { font-size: 11px; }
          .event-unit { font-size: 10px; }
        }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 768px) {
          .jadwal-room-wrapper { padding-top: 0px; padding-bottom: 40px; }
          .header-jadwal { margin-top: 4px; margin-bottom: 20px; }
          .header-jadwal h2 { font-size: 24px; line-height: 1.2; }
          
          .btn-booking { width: 100%; justify-content: center; padding: 14px; font-size: 14px; }
          .date-container { padding: 16px; border-radius: 20px; margin-bottom: 20px; }
          .cek-date-card { min-width: 70px; padding: 10px; }
          
          .time-axis { width: 50px; }
          .time-label { font-size: 10.5px; right: 6px; }
          
          .room-column { width: 180px; min-width: 180px; }
          .room-header { font-size: 13px; padding: 0 8px; }
          .grid-container { border-radius: 16px; }

          .event-block { padding: 6px; border-radius: 6px; left: 2px; right: 4px; }
          .event-title { font-size: 11.5px; margin-bottom: 2px; }
          .event-time { font-size: 10px; margin-bottom: 2px; }
          .event-time svg { width: 10px; height: 10px; }
          .event-unit { font-size: 9px; }
        }
      `}} />

      {/* --- HEADER --- */}
      <div className="header-jadwal">
        <div>
          <h2 className="font-heading">Cek Ketersediaan Ruangan</h2>
          <p className="font-body">Pantau matriks waktu pemakaian ruang rapat hari ini dan ke depan.</p>
        </div>
        <button onClick={() => router.push('/dashboard/jadwal/create')} className="btn-booking font-heading">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Isi Form Reservasi
        </button>
      </div>

      {/* --- DATE SELECTOR --- */}
      <div className="date-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#2563eb' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>
            {activeMonthYear}
          </h3>
        </div>
        
        <div 
          className="date-scroller-cek"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {dateList.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            const statusBg = getDateStatusColor(dateStr);
            let borderColor = '#e2e8f0'; 
            if (statusBg === '#fee2e2') borderColor = '#fca5a5'; 
            if (statusBg === '#fef9c3') borderColor = '#fde047'; 
            
            return (
              <div 
                key={dateStr} 
                className="cek-date-card"
                onMouseUp={(e) => {
                  if (Math.abs(e.pageX - scrollRef.current!.offsetLeft - startX) < 5) {
                    setSelectedDate(dateStr);
                  }
                }}
                style={{ 
                  background: isSelected ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : statusBg, 
                  color: isSelected ? '#fff' : '#0f172a', 
                  border: isSelected ? 'none' : `1px solid ${borderColor}`,
                  cursor: isDragging ? 'grabbing' : 'pointer',
                  boxShadow: isSelected ? '0 10px 15px -3px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                <span className="font-body" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isSelected ? '#bfdbfe' : '#64748b' }}>
                  {getDayName(dateStr)}
                </span>
                <span className="font-heading" style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.2 }}>
                  {dateStr.split('-')[2]}
                </span>
                <span className="font-body" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isSelected ? '#bfdbfe' : '#64748b' }}>
                  {getMonthName(dateStr)}
                </span>
              </div>
            );
          })}
        </div>

        {/* LEGENDA WARNA KOTAK */}
        <div className="font-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}></div>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Kosong</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid #fde047', backgroundColor: '#fef9c3' }}></div>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Tersedia Sebagian</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid #fca5a5', backgroundColor: '#fee2e2' }}></div>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Jadwal Penuh</span>
          </div>
        </div>
      </div>

      {/* --- KALENDER GRID (FULL 24 JAM) --- */}
      <div className="grid-container">
        <div className="grid-scroll-area" id="calendar-scroll-area">
          
          {isLoading ? (
            <div className="font-body" style={{ padding: '100px 20px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
              <p style={{ fontWeight: 600, fontSize: '15px', margin: 0 }}>Menyinkronkan matriks ruangan...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', minWidth: 'max-content', position: 'relative' }}>
              
              {/* KOLOM JAM (KIRI STICKY) */}
              <div className="time-axis">
                <div style={{ height: '60px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}></div>
                
                <div style={{ position: 'relative' }}>
                  {hours.map(hour => (
                    <div key={hour} className="time-slot">
                      {/* Jam 00:00 tidak dilabeli agar tidak menabrak header */}
                      {hour > 0 && (
                        <span className="time-label font-body">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KOLOM RUANGAN */}
              <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                
                {/* GARIS MERAH INDIKATOR WAKTU SAAT INI */}
                {isToday && (
                  <div className="current-time-line" style={{ top: `${currentTimeMinutes}px` }}>
                    <div className="current-time-dot"></div>
                  </div>
                )}

                {rooms.map(room => {
                  const roomReservations = dailyReservations.filter(r => r.room_id === room.id);
                  
                  return (
                    <div key={room.id} className="room-column">
                      
                      <div className="room-header font-heading">
                        {room.room_name}
                      </div>

                      <div style={{ position: 'relative', height: `${24 * 60}px`, backgroundColor: '#fff' }}>
                        {/* Garis Horizontal 24 Jam */}
                        {hours.map((hour) => (
                          <div key={hour} className="grid-line"></div>
                        ))}

                        {/* BLOCK ACARA DENGAN EFEK HOVER/TAP POP-OUT */}
                        {roomReservations.map(res => {
                          const style = calculateBlockStyle(res.start_time, res.end_time);
                          const isVerified = res.status === 'verified';
                          
                          return (
                            <div 
                              key={res.id} 
                              className="event-block"
                              tabIndex={0} /* Memungkinkan efek focus di Mobile tap */
                              style={{
                                top: style.top, 
                                height: style.height,
                                backgroundColor: isVerified ? '#eff6ff' : '#fffbeb',
                                border: `1px solid ${isVerified ? '#dbeafe' : '#fef3c7'}`,
                              }}
                            >
                              <p className="event-title font-heading" style={{ color: isVerified ? '#1e40af' : '#92400e' }}>
                                {res.event_name}
                              </p>
                              
                              <p className="event-time font-body" style={{ color: isVerified ? '#3b82f6' : '#d97706' }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {formatTime(res.start_time)} - {formatTime(res.end_time)}
                              </p>
                              
                              {res.origin_unit && (
                                <p className="event-unit font-body" style={{ color: isVerified ? '#1d4ed8' : '#b45309' }}>
                                  🏢 {res.origin_unit}
                                </p>
                              )}
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