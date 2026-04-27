// frontend/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css"; // Memanggil global CSS

// Menggunakan font Inter dengan subset latin
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Reservasi Ruangan - Kominfotik Jaktim",
  description: "Sistem Manajemen Reservasi Ruangan Kantor Walikota Jakarta Timur",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}