import type { Viewport, Metadata } from 'next';
import "./globals.css";
import AppShell from '@/components/AppShell';
import PwaLifecycle from '@/components/PwaLifecycle';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: "Sales Tracker",
  description: "Advanced Sales Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SalesTracker",
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 flex flex-col h-screen overflow-hidden font-sans text-slate-200">
        <PwaLifecycle />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}