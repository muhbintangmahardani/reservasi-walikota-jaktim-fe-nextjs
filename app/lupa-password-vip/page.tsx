// frontend/app/lupa-password-vip/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LupaPasswordVip() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Nomor WA Admin Pusat Kominfotik
  const ADMIN_WA_NUMBER = "6281234567890"; 
  const WA_MESSAGE = encodeURIComponent("Halo Admin IT Support Kominfotik, saya (Pimpinan/Asisten) mengalami kendala lupa password untuk Portal Pimpinan Smart Room. Mohon bantuan reset secepatnya.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await api.post('/request-reset-password', { email });
      
      setStatus('success');
      setMessage('Permintaan berhasil dikirim. Tim IT Support Kominfotik akan segera memverifikasi dan mereset password Anda.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email tidak terdaftar dalam sistem.');
    }
  };

  return (
    <div className="forgot-vip-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .forgot-vip-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc; /* Latar belakang cerah konsisten */
          padding: 24px;
          font-family: var(--font-jakarta), sans-serif;
        }

        .font-heading { font-family: var(--font-outfit), sans-serif !important; }
        .font-body { font-family: var(--font-jakarta), sans-serif !important; }

        .forgot-card {
          width: 100%;
          max-width: 460px;
          background-color: #ffffff;
          border-radius: 28px;
          padding: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
          text-align: center;
          position: relative;
          border: 1px solid #f1f5f9;
        }

        /* --- TOMBOL KEMBALI VIP (Aksen Indigo) --- */
        .btn-back-vip {
          position: absolute;
          top: 32px; left: 32px;
          background: #eef2ff; border: none; color: #4f46e5;
          padding: 8px 16px; border-radius: 20px;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-family: var(--font-jakarta), sans-serif;
        }
        .btn-back-vip:hover {
          background: #e0e7ff; color: #312e81; transform: translateX(-3px);
        }

        /* --- ICON & HEADER --- */
        .icon-vip-shield {
          width: 72px; height: 72px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 32px auto 24px auto; color: #4f46e5;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1);
        }

        .forgot-header h2 { font-size: 28px; font-weight: 800; color: #1e1b4b; margin: 0 0 12px 0; letter-spacing: -0.5px; }

        .sop-box {
          background-color: #f8fafc; padding: 20px; border-radius: 16px;
          border: 1px dashed #cbd5e1; margin-bottom: 32px; text-align: left;
        }
        .sop-box p { color: #475569; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 500; }

        /* --- INPUT & TOMBOL SUBMIT --- */
        .form-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #334155; text-align: left; }
        .premium-input {
          width: 100%; padding: 16px 20px; border-radius: 16px;
          border: 2px solid #e2e8f0; background-color: #f8fafc;
          font-size: 15px; font-weight: 600; color: #0f172a;
          outline: none; transition: all 0.2s; box-sizing: border-box;
          font-family: inherit;
        }
        .premium-input:focus { border-color: #4f46e5; background-color: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .btn-submit {
          width: 100%; padding: 16px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
          color: white; font-weight: 800; font-size: 15px; cursor: pointer;
          transition: 0.3s; box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.3);
          font-family: var(--font-jakarta), sans-serif;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(67, 56, 202, 0.4); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        /* --- STATE NOTIFIKASI --- */
        .success-box {
          background: #f0fdf4; color: #166534; padding: 20px; border-radius: 16px;
          margin-bottom: 24px; font-weight: 500; font-size: 14px; line-height: 1.6;
          text-align: left; border: 1px solid #bbf7d0; animation: fadeIn 0.4s;
        }
        .btn-wa {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          padding: 16px; border-radius: 16px; background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
          color: #fff; border: none; font-weight: 800; font-size: 15px; text-decoration: none;
          transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3);
        }
        .btn-wa:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(22, 163, 74, 0.4); }

        .error-box {
          background: #fef2f2; color: #991b1b; padding: 14px 16px; border-radius: 12px;
          margin-bottom: 24px; font-size: 13px; font-weight: 600; border-left: 4px solid #ef4444;
          text-align: left; animation: fadeIn 0.3s;
        }

        .divider {
          display: flex; align-items: center; margin: 24px 0;
        }
        .divider-line { flex: 1; height: 1px; background-color: #e2e8f0; }
        .divider-text { padding: 0 16px; font-size: 12px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* RESPONSIVE IPAD & MOBILE */
        @media (max-width: 640px) {
          .forgot-vip-wrapper { padding: 16px; }
          .forgot-card { padding: 40px 24px 32px 24px; border-radius: 24px; }
          
          .btn-back-vip { top: 20px; left: 20px; padding: 6px 12px; font-size: 12px; }
          
          .icon-vip-shield { margin-top: 24px; width: 60px; height: 60px; }
          .forgot-header h2 { font-size: 24px; }
          
          .sop-box { padding: 16px; margin-bottom: 24px; }
          .premium-input { padding: 14px 16px; font-size: 14px; }
          .btn-submit, .btn-wa { padding: 14px; font-size: 14px; }
        }
      `}} />

      <div className="forgot-card">

        {/* Tombol Kembali VIP (Penting: ngelink ke /login-vip) */}
        <button onClick={() => router.push('/login-vip')} className="btn-back-vip">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Kembali
        </button>

        <div className="icon-vip-shield">
          <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>

        <div className="forgot-header">
          <h2 className="font-heading">Bantuan Akses VIP</h2>
        </div>

        <div className="sop-box">
          <p className="font-body">
            Untuk alasan keamanan, pemulihan kata sandi <strong>Portal Pimpinan</strong> harus melalui verifikasi langsung oleh Tim IT Support / Administrator Kominfotik.
          </p>
        </div>

        {status === 'success' ? (
          // --- TAMPILAN SUKSES ---
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div className="success-box font-body">
              ✅ <strong>Notifikasi Terkirim!</strong><br/>{message}
            </div>
            
            <p className="font-body" style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>Butuh penanganan prioritas segera?</p>
            <a href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer" className="btn-wa font-body">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Hubungi via WhatsApp
            </a>
          </div>
        ) : (
          // --- TAMPILAN FORM ---
          <form onSubmit={handleSubmit} style={{ textAlign: 'left', animation: 'fadeIn 0.3s' }}>
            
            {status === 'error' && (
              <div className="error-box font-body">{message}</div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label font-body">Masukkan Email VIP Anda:</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pimpinan@jaktim.go.id"
                className="premium-input font-body"
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className="btn-submit">
              {status === 'loading' ? 'Mengirim Permintaan...' : 'Kirim Permintaan ke Admin'}
            </button>

            {/* DIVIDER ATAU */}
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text font-body">ATAU</span>
              <div className="divider-line"></div>
            </div>

            {/* TOMBOL JALUR CEPAT WHATSAPP */}
            <a href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer" className="btn-wa font-body">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Hubungi IT Support (WhatsApp)
            </a>

          </form>
        )}

      </div>
    </div>
  );
}