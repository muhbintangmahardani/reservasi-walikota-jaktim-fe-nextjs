// app/layout.tsx
import './globals.css';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';

// Font untuk Judul (Modern & Elegan)
const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800']
});

// Font untuk Teks Data/Paragraf (Sangat Bersih)
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  title: 'Smart Room App | Pemkot Jaktim',
  description: 'Sistem Manajemen Reservasi Ruangan Cerdas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-blue-200 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}