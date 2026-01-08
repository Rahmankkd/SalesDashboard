'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { Header } from '@/components/layout/Header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDarkMode = pathname === '/dashboard' || pathname === '/admin';

    return (
        <div className={`flex flex-col h-screen font-[family-name:var(--font-geist-sans)] transition-colors duration-500 ${isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-green-950 to-black text-white'
            : 'bg-gray-50 text-gray-900'
            }`}>
            <TopNav isDarkMode={isDarkMode} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header is optional now as TopNav covers it, but keeping it for breadcrumbs if needed, or we can hide it */}
                {/* <Header isDarkMode={isDarkMode} />  <-- Disabling separate Header to save space as TopNav acts as header */}
                <main className={`flex-1 overflow-auto p-8 relative ${isDarkMode ? 'scrollbar-dark' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
