// frontend/app/dashboard/laporan/page.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/axios';

export default function LaporanPage() {
  const [reportType, setReportType] = useState<'mingguan' | 'bulanan'>('bulanan');
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState('');
  
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- FUNGSI DOWNLOAD PDF ---
  const handleDownloadPDF = async () => {
    if (reportType === 'bulanan' && !selectedMonth) { setErrorMsg('Pilih bulan terlebih dahulu.'); return; }
    if (reportType === 'mingguan' && !selectedWeek) { setErrorMsg('Pilih minggu terlebih dahulu.'); return; }

    setErrorMsg('');
    setIsLoadingPDF(true);

    try {
      const periode = reportType === 'bulanan' ? selectedMonth : selectedWeek;
      const response = await api.get('/laporan-ruangan/pdf', { params: { type: reportType, periode: periode } });
      const { filename, file_data } = response.data;

      if (!file_data) throw new Error('Data PDF kosong dari server.');

      const byteCharacters = atob(file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error("Error Download PDF:", error);
      setErrorMsg(error.response?.data?.message || error.message || 'Gagal mengunduh PDF.');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = async () => {
    if (reportType === 'bulanan' && !selectedMonth) { setErrorMsg('Pilih bulan terlebih dahulu.'); return; }
    if (reportType === 'mingguan' && !selectedWeek) { setErrorMsg('Pilih minggu terlebih dahulu.'); return; }

    setErrorMsg('');
    setIsLoadingExcel(true);

    try {
      const periode = reportType === 'bulanan' ? selectedMonth : selectedWeek;
      const response = await api.get('/laporan-ruangan/excel', { params: { type: reportType, periode: periode } });
      
      const { data, header, filename } = response.data;
      
      const sanitizeData = (row: any[]) => row.map(item => {
        let str = item ? String(item) : '';
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      });

      const csvRows = [
        header.join(','),
        ...data.map((row: any[]) => sanitizeData(row).join(','))
      ];
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n'); 
      const encodedUri = encodeURI(csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error: any) {
      console.error("Error Export Excel:", error);
      setErrorMsg(error.response?.data?.message || 'Gagal export Excel.');
    } finally {
      setIsLoadingExcel(false);
    }
  };

  return (
    <div className="premium-report-wrapper">
      
      <style dangerouslySetInnerHTML={{__html: `
        .premium-report-wrapper { 
          max-width: 900px;
          margin: 0 auto; 
          padding-top: 10px;
          padding-bottom: 60px;
          font-family: var(--font-jakarta), sans-serif; 
          animation: slideUp 0.6s ease-out; 
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .header-section { margin-bottom: 40px; text-align: left; }
        .header-section h1 { font-family: var(--font-outfit), sans-serif; font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .header-section p { font-family: var(--font-jakarta), sans-serif; color: #64748b; font-size: 16px; margin: 0; }

        .main-card { 
          background: #ffffff; border-radius: 32px; padding: 48px; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.02); 
          border: 1px solid #f1f5f9; position: relative; overflow: hidden; 
        }
        .main-card::before { 
          content: ""; position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; 
          background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 70%); z-index: 0; pointer-events: none;
        }

        .tab-switcher { display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; padding: 8px; border-radius: 20px; margin-bottom: 40px; position: relative; z-index: 1; }
        .tab-item { font-family: var(--font-jakarta), sans-serif; padding: 16px; text-align: center; cursor: pointer; border-radius: 16px; font-weight: 700; font-size: 15px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; border: none; }
        .tab-item.active { background: #ffffff; color: #2563eb; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .tab-item.inactive { color: #64748b; background: transparent; }
        .tab-item.inactive:hover { color: #0f172a; background: rgba(255,255,255,0.5); }

        .input-group { margin-bottom: 30px; position: relative; z-index: 1; overflow: hidden; }
        .slide-content { animation: slideXFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .input-group label { display: block; font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 12px; padding-left: 4px; }
        
        /* 🔥 FIX MUTLAK: PRESISI VERTIKAL UNTUK iOS 🔥 */
        .styled-input { 
          display: block; 
          width: 100%; 
          max-width: 100%; 
          height: 52px; 
          padding: 14px 16px; /* Bantalan presisi agar teks tertekan ke tengah */
          line-height: 20px;  /* Kunci tinggi teks */
          border-radius: 18px; 
          border: 2px solid #e2e8f0; 
          background: #f8fafc; 
          font-size: 15px; 
          font-weight: 600; 
          color: #0f172a; 
          transition: all 0.3s; 
          outline: none; 
          box-sizing: border-box !important; 
          font-family: var(--font-jakarta), sans-serif; 
          margin: 0;

          -webkit-appearance: none;
          appearance: none;
        }

        .styled-input:focus { border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

        /* Kembalikan icon kalender khusus di Desktop (pakai mouse) */
        @media (hover: hover) and (pointer: fine) {
          input[type="month"].styled-input,
          input[type="week"].styled-input {
            -webkit-appearance: auto;
            appearance: auto;
            padding: 0 16px; /* Desktop aman pakai padding 0 */
          }
        }

        .error-alert { background: #fff1f2; color: #be123c; padding: 16px 20px; border-radius: 16px; margin-bottom: 24px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 12px; border: 1px solid #fecdd3; animation: shake 0.5s ease; }
        .info-center { margin-top: 32px; padding: 20px; background: #f0f9ff; border-radius: 20px; display: flex; gap: 16px; align-items: flex-start; border: 1px solid #e0f2fe; margin-bottom: 32px; position: relative; z-index: 1; }
        .info-center p { font-size: 13px; color: #0369a1; line-height: 1.6; margin: 0; font-weight: 600; }

        .btn-wrapper { width: 100%; display: flex; gap: 16px; position: relative; z-index: 1; }
        .btn-action { 
          font-family: var(--font-jakarta), sans-serif; flex: 1; padding: 18px 20px; border-radius: 18px; 
          border: none; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; 
          align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); color: white; box-sizing: border-box; 
        }
        .btn-action:disabled { opacity: 0.7; cursor: not-allowed; filter: grayscale(1); transform: none !important; box-shadow: none !important; }
        
        .btn-pdf { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
        .btn-pdf:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 20px 30px -5px rgba(15, 23, 42, 0.3); }
        
        .btn-excel { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
        .btn-excel:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 20px 30px -5px rgba(4, 120, 87, 0.3); }

        .loading-spinner { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: rotate 0.8s linear infinite; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideXFade { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes rotate { 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) { 
          .premium-report-wrapper { padding-left: 15px; padding-right: 15px; }
          .main-card { padding: 32px; border-radius: 24px; } 
          .header-section h1 { font-size: 28px; } 
        }

        @media (max-width: 768px) {
          .premium-report-wrapper { padding-top: 0px; padding-bottom: 40px; padding-left: 15px; padding-right: 15px; }
          .header-section { margin-top: 4px; margin-bottom: 24px; text-align: left; }
          .header-section h1 { font-size: 24px; line-height: 1.2; }
          
          .main-card { padding: 24px; border-radius: 20px; }
          .tab-switcher { grid-template-columns: 1fr; gap: 8px; margin-bottom: 24px; }
          .tab-item { padding: 12px; font-size: 14px; }
          
          /* 🔥 Perhitungan akurat untuk ukuran layar kecil 🔥 */
          .styled-input { height: 48px; padding: 12px 16px; line-height: 20px; font-size: 14px; }
          
          .info-center { flex-direction: column; gap: 10px; margin-bottom: 24px; padding: 16px; }
          .btn-wrapper { flex-direction: column; gap: 12px; }
          .btn-action { padding: 16px; font-size: 14px; width: 100%; height: 52px; }
        }
      `}} />

      <div className="header-section">
        <h1 className="font-heading">Pusat Dokumentasi & Data</h1>
        <p className="font-body">Arsip penggunaan ruangan & agenda pimpinan yang terverifikasi.</p>
      </div>

      <div className="main-card">
        
        <div className="tab-switcher font-body">
          <button className={`tab-item ${reportType === 'bulanan' ? 'active' : 'inactive'}`} onClick={() => { setReportType('bulanan'); setErrorMsg(''); }}>
            <span style={{fontSize: '18px'}}>📅</span> Laporan Bulanan
          </button>
          <button className={`tab-item ${reportType === 'mingguan' ? 'active' : 'inactive'}`} onClick={() => { setReportType('mingguan'); setErrorMsg(''); }}>
            <span style={{fontSize: '18px'}}>📋</span> Laporan Mingguan
          </button>
        </div>

        {errorMsg && (
          <div className="error-alert font-body"><span style={{fontSize: '20px'}}>⚠️</span> {errorMsg}</div>
        )}

        <div className="input-group font-body">
          <div key={reportType} className="slide-content">
            {reportType === 'bulanan' ? (
              <>
                <label>Pilih Periode Bulan</label>
                <input type="month" className="styled-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
              </>
            ) : (
              <>
                <label>Pilih Periode Minggu</label>
                <input type="week" className="styled-input" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} />
              </>
            )}
          </div>
        </div>

        <div className="info-center font-body">
          <div style={{fontSize: '24px'}}>✨</div>
          <p>Laporan ini diekspor langsung dari server secara <i>real-time</i> dan mencakup seluruh riwayat penggunaan ruangan.</p>
        </div>

        <div className="btn-wrapper">
          <button className="btn-action btn-pdf font-body" onClick={handleDownloadPDF} disabled={isLoadingPDF || isLoadingExcel}>
            {isLoadingPDF ? (
              <><div className="loading-spinner"></div> Memproses PDF...</>
            ) : (
              <><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> Unduh PDF Resmi</>
            )}
          </button>

          <button className="btn-action btn-excel font-body" onClick={handleExportExcel} disabled={isLoadingPDF || isLoadingExcel}>
            {isLoadingExcel ? (
              <><div className="loading-spinner"></div> Memproses CSV...</>
            ) : (
              <><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Data (CSV)</>
            )}
          </button>
        </div>

      </div>

      <div className="font-body" style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
        Dikelola oleh Sekretariat Pimpinan & Kominfotik Jakarta Timur
      </div>
    </div>
  );
}