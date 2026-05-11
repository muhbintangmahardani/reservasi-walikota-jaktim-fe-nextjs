# 🎨 Smart Room Workspace - Frontend (Kominfotik Jakarta Timur)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

Ini adalah repositori *Frontend* untuk **Sistem Informasi Smart Room Kominfotik Jakarta Timur**. Dibangun menggunakan Next.js (App Router), aplikasi ini menyajikan antarmuka pengguna (UI) kelas Enterprise untuk memvisualisasikan jadwal ruangan yang sangat responsif di berbagai perangkat (Desktop, iPad, dan Mobile).

## 🚀 Fitur Utama Frontend

*   **Multi-Portal Architecture**: Desain UI/UX yang dinamis dan terpisah berdasarkan level akses (*Dashboard Admin*, *Portal Sekpim VIP*, dan *User Area*).
*   **Modern Room Matrix (GCalendar Engine)**:
    *   Tampilan *grid* presisi 24 jam.
    *   *Smart Event Cards* berwarna cerah yang menyesuaikan tinggi berdasarkan durasi, dilengkapi efek *pop-out* untuk membaca detail di layar terbatas.
    *   Indikator garis waktu merah (*Real-time Time Indicator*).
    *   Navigasi tanggal interaktif bergaya *Pill-Shape* dengan fitur *Drag-to-Scroll*.
*   **Live Polling Dashboard**: Modul khusus untuk Admin yang menarik pembaruan log audit (percobaan *login* gagal, dsb) dari backend secara *real-time*.

## 🛠️ Tech Stack
*   **Framework**: Next.js 14/15 (App Router dengan Turbopack)
*   **Styling**: Custom CSS (Enterprise UI) & Tailwind CSS
*   **HTTP Client**: Axios (dengan *Interceptors* untuk otomatisasi Token Sanctum)

## 🔧 Panduan Instalasi (Localhost)

**Prasyarat**: Node.js >= 18 dan NPM.

1. **Install Dependensi Node.js**
   Jalankan perintah ini di dalam folder `frontend`:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment**
   Buat file `.env.local` di folder utama `frontend` dan tambahkan URL Backend Anda:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME="Smart Room Kominfotik JT"
   ```

3. **Jalankan Mode Development**
   ```bash
   npm run dev
   ```
   *Aplikasi akan berjalan di `http://localhost:3000`*

## 📝 Beberapa Penambahan Commit
*   `feat(ui):` Penambahan halaman atau komponen baru.
*   `ux(calendar):` Perbaikan interaksi pengguna, animasi, atau tata letak.
*   `security(nextjs):` Penambalan celah keamanan di sisi klien atau *headers*.
*   `fix(layout):` Perbaikan *bug* responsivitas pada layar *mobile/tablet*.

## Beberaoa Catatan
ganti .env be pada bagian app_url dan frontend_url
ganti next.config.ts ip addressnya, kemudian axios.ts dan .env
