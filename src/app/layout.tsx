import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/lib/store";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoneyFlow — Kelola Keuanganmu",
  description:
    "Aplikasi manajemen keuangan pribadi untuk mencatat pemasukan, pengeluaran, dan target tabungan dengan dashboard interaktif.",
  keywords: ["keuangan", "manajemen", "pemasukan", "pengeluaran", "tabungan"],
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-0 text-text-primary font-sans">
        <GoogleOAuthProvider clientId={clientId}>
          <FinanceProvider>{children}</FinanceProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
