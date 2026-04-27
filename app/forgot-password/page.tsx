// frontend/app/forgot-password/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>

        {/* Tombol Kembali */}
        <button 
          onClick={() => router.push('/')} 
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600 }}
        >
          &larr; Kembali ke Login
        </button>

        {/* Ikon Keamanan */}
        <div style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: '#3b82f6' }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Reset Password
        </h2>

        {/* Penjelasan SOP */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Sesuai dengan <strong>Standar Operasional Keamanan (SOP)</strong> Kominfotik, reset password tidak dapat dilakukan secara otomatis untuk menjaga kerahasiaan data jadwal pimpinan.
          </p>
        </div>

        <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
          Silakan hubungi Tim IT Helpdesk untuk verifikasi data dan pemulihan akun Anda:
        </p>

        {/* Tombol WhatsApp */}
        <a
          href="https://wa.me/6281100000000" // TODO: Ganti dengan nomor WhatsApp Admin Kominfotik yang asli
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.2)' }}
        >
          {/* Ikon WhatsApp SVG */}
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Hubungi IT Support (WhatsApp)
        </a>

      </div>
    </div>
  );
}