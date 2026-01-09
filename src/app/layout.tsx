import type { Viewport, Metadata } from 'next';
import "./globals.css";
import AppShell from '@/components/AppShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Sales Tracker",
  description: "Advanced Sales Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 flex flex-col h-screen overflow-hidden font-sans text-slate-200">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}