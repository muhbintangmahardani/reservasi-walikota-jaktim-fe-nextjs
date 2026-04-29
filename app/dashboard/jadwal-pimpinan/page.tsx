// frontend/app/dashboard/jadwal-pimpinan/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';

export default function JadwalPimpinanPage() {
  const [pimpinanSchedules, setPimpinanSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 🔥 STATE UNTUK DRAG-TO-SCROLL
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const getNext14Days = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const dateList = getNext14Days();

  useEffect(() => {
    const fetchPimpinanAgenda = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/reservations');
        const vipAgenda = response.data.filter((item: any) => {
          if (item.status !== 'verified') return false;

          const isDirectLeaderCreation = !item.origin_unit;
          const isLeaderRole = item.pejabat_pelaksana && item.pejabat_pelaksana.toLowerCase().includes('walikota');
          const isVIPLabel = item.category_label && item.category_label.toLowerCase().includes('pimpinan');

          return isDirectLeaderCreation || isLeaderRole || isVIPLabel;
        });

        setPimpinanSchedules(vipAgenda);
      } catch (err) {
        console.error('Gagal mengambil jadwal pimpinan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPimpinanAgenda();
  }, []);

  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' });
  const getMonthName = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const dailySchedules = pimpinanSchedules
    .filter(r => r.start_time.startsWith(selectedDate))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // 🔥 FUNGSI KENDALI MOUSE UNTUK DESKTOP (DRAG TO SCROLL)
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
    <div className="vip-wrapper">
      
      {/* --- CSS PREMIUM & KONSISTENSI FONT --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .vip-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding-top: 10px;
          padding-bottom: 60px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        /* HEADER VIP */
        .header-vip { 
          display: flex; align-items: center; gap: 24px; 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
          padding: 32px; border-radius: 28px; color: #fff; margin-bottom: 32px; 
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2); 
          position: relative; overflow: hidden;
        }
        .header-vip::after {
          content: ""; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); pointer-events: none;
        }
        .header-vip h2 { font-size: 28px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: 0.5px; }
        .header-vip p { font-size: 15px; margin: 0; color: #cbd5e1; font-weight: 500; }
        .vip-icon-box {
          width: 68px; height: 68px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
          box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); border: 2px solid #fcd34d;
        }

        /* PITA TANGGAL HORIZONTAL */
        .date-scroller { 
          display: flex; gap: 14px; overflow-x: auto; padding: 4px 4px 16px 4px; 
          margin-bottom: 24px; scrollbar-width: none; -ms-overflow-style: none; 
          scroll-behavior: smooth; cursor: grab; 
        }
        .date-scroller:active { cursor: grabbing; } 
        .date-scroller::-webkit-scrollbar { display: none; }
        
        .date-card { 
          flex-shrink: 0; min-width: 85px; padding: 16px 14px; border-radius: 20px; 
          border: 1px solid #e2e8f0; background: #fff; text-align: center; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; 
          align-items: center; gap: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); 
          position: relative; user-select: none; 
        }
        .date-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .date-card.active { 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
          border: none; color: white; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3); 
          transform: translateY(-3px); 
        }
        
        .dc-day { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .date-card.active .dc-day { color: #94a3b8; }
        .dc-date { font-size: 26px; font-weight: 800; line-height: 1; margin: 4px 0; }
        .dc-month { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #d97706; letter-spacing: 0.5px; }
        .date-card.active .dc-month { color: #fde047; }
        
        .agenda-indicator { 
          position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; 
          background-color: #d97706; border-radius: 50%; border: 2px solid #fff; pointer-events: none; 
        }
        .date-card.active .agenda-indicator { border-color: #0f172a; }

        /* CONTAINER TIMELINE AGENDA */
        .agenda-container {
          background-color: rgba(255,255,255,0.7); backdrop-filter: blur(12px); 
          border-radius: 32px; border: 1px solid #f1f5f9; padding: 36px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
        }
        .agenda-header { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 36px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; flex-wrap: wrap; gap: 16px;
        }

        /* TIMELINE ITEM */
        .timeline-item { display: flex; gap: 24px; position: relative; margin-bottom: 32px; }
        .timeline-item:last-child { margin-bottom: 0; }
        .timeline-left { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .time-badge {
          background-color: #0f172a; padding: 10px 14px; border-radius: 14px; 
          display: flex; flex-direction: column; align-items: center; min-width: 75px; 
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);
        }
        .timeline-dot { 
          width: 14px; height: 14px; background-color: #f59e0b; border-radius: 50%; 
          margin-top: 12px; border: 3px solid #fffdf5; z-index: 2; 
          box-shadow: 0 0 0 1px #fde68a;
        }
        .timeline-line { width: 2px; background: linear-gradient(to bottom, #fde68a, #e2e8f0); flex: 1; margin-top: -6px; border-radius: 2px; }
        
        .agenda-card { 
          flex: 1; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; 
          padding: 28px; display: flex; flex-direction: column; gap: 16px; transition: all 0.3s; 
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02); 
        }
        .agenda-card:hover { transform: translateY(-3px); border-color: #fde047; box-shadow: 0 20px 25px -5px rgba(217, 119, 6, 0.05); }

        /* LOADING & EMPTY STATE */
        .loading-spinner-circle {
          width: 36px; height: 36px; border: 4px solid #f1f5f9; border-top-color: #d97706; 
          border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px auto;
        }

        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* --- RESPONSIVE IPAD --- */
        @media (max-width: 1024px) {
          .vip-wrapper { padding-left: 15px; padding-right: 15px; }
          .header-vip { padding: 28px; gap: 20px; }
        }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 768px) {
          .vip-wrapper { padding-top: 0px; padding-bottom: 40px; }
          
          .header-vip { 
            flex-direction: column; text-align: center; padding: 24px; 
            margin-top: 8px; /* Whitespace ke navbar */
            margin-bottom: 24px; border-radius: 24px;
          }
          .header-vip h2 { font-size: 24px; line-height: 1.2; }
          .vip-icon-box { width: 56px; height: 56px; border-radius: 16px; }
          .vip-icon-box svg { width: 28px; height: 28px; }

          .date-card { min-width: 75px; padding: 12px 10px; }
          .dc-date { font-size: 22px; }

          .agenda-container { padding: 20px; border-radius: 24px; }
          .agenda-header { margin-bottom: 24px; padding-bottom: 16px; flex-direction: column; align-items: flex-start; }

          .timeline-item { flex-direction: column; gap: 12px; margin-bottom: 24px; }
          .timeline-left { flex-direction: row; min-width: auto; justify-content: flex-start; gap: 12px; align-items: center; }
          .timeline-line, .timeline-dot { display: none; } /* Hilangkan garis vertikal di mobile */
          
          .time-badge { flex-direction: row; gap: 8px; padding: 8px 16px; border-radius: 12px; }
          .time-badge span { font-size: 14px !important; }
          
          .agenda-card { padding: 20px; border-radius: 20px; border-left: 4px solid #f59e0b; }
        }
      `}} />

      {/* HEADER VIP */}
      <div className="header-vip">
        <div className="vip-icon-box">
          <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        </div>
        <div>
          <h2 className="font-heading">JADWAL PIMPINAN {new Date().getFullYear()}</h2>
          <p className="font-body">Agenda Resmi Walikota Jakarta Timur • Tahun Anggaran {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* PITA TANGGAL HORIZONTAL (DRAG TO SCROLL) */}
      <div 
        className="date-scroller"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {dateList.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const hasAgenda = pimpinanSchedules.some(r => r.start_time.startsWith(dateStr));
          
          return (
            <div 
              key={dateStr} 
              onMouseUp={(e) => {
                if (Math.abs(e.pageX - scrollRef.current!.offsetLeft - startX) < 5) {
                  setSelectedDate(dateStr);
                }
              }}
              className={`date-card ${isSelected ? 'active' : ''}`}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              {hasAgenda && !isSelected && <div className="agenda-indicator"></div>}
              <span className="dc-day font-body">{getDayName(dateStr)}</span>
              <span className="dc-date font-heading">{dateStr.split('-')[2]}</span>
              <span className="dc-month font-heading">{getMonthName(dateStr)}</span>
            </div>
          );
        })}
      </div>

      {/* KONTAINER TIMELINE */}
      <div className="agenda-container">
        
        <div className="agenda-header">
          <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Agenda {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <span className="font-body" style={{ fontSize: '13px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '12px' }}>
            {dailySchedules.length} Agenda Terjadwal
          </span>
        </div>

        {isLoading ? (
          <div className="font-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
             <div className="loading-spinner-circle"></div>
             <span style={{ color: '#64748b', fontWeight: 600 }}>Memuat agenda pimpinan...</span>
          </div>
        ) : dailySchedules.length === 0 ? (
          <div className="font-body" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>☕</span>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 600, margin: 0 }}>Pimpinan belum memiliki agenda pada hari ini.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dailySchedules.map((schedule, index) => {
               const sourceLabel = !schedule.origin_unit ? "AGENDA INTERNAL" : "UNDANGAN BAGIAN";
               
               return (
              <div key={schedule.id} className="timeline-item">
                
                {/* Bagian Kiri (Waktu & Garis) */}
                <div className="timeline-left">
                  <div className="time-badge">
                    <span className="font-heading" style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{formatTime(schedule.start_time)}</span>
                    <span className="font-body" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>WIB</span>
                  </div>
                  <div className="timeline-dot"></div>
                  {index !== dailySchedules.length - 1 && <div className="timeline-line"></div>}
                </div>

                {/* Bagian Kanan (Kartu Detail Agenda) */}
                <div className="agenda-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <h4 className="font-heading" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4, flex: 1 }}>
                      {schedule.event_name}
                    </h4>
                    <div className="font-body" style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, border: '1px solid #fde68a', flexShrink: 0 }}>
                      {sourceLabel}
                    </div>
                  </div>
                  
                  {/* Grid Detail Kotak Abu-abu */}
                  <div className="font-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      s/d {formatTime(schedule.end_time)} WIB
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {schedule.location_type === 'ruangan_terdaftar' ? (schedule.room?.room_name || 'Ruang Internal') : (schedule.other_location || 'Luar Kantor')}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {schedule.pejabat_pelaksana || 'Pimpinan'}
                    </div>
                  </div>
                </div>

              </div>
            );
            })}
          </div>
        )}

      </div>
    </div>
  );
}