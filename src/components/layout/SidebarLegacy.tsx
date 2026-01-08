'use client';

import { useConfig } from '@/providers/ConfigProvider';
import { LayoutDashboard, FileText, Settings, LogOut, Shield, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function Sidebar({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const config = useConfig();
    const [role, setRole] = useState<string | null>(null);

    // Fetch user role on mount
    useEffect(() => {
        const fetchRole = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setRole(data?.role || null);
            }
        };
        fetchRole();
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    // Admin-only links
    if (role === 'admin' || role === 'superuser') {
        navItems.push({ name: 'Upload Data', href: '/admin', icon: UploadCloud });
    }
    if (role === 'superuser') {
        navItems.push({ name: 'Admin Panel', href: '/superuser', icon: Shield });
    }

    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className={`w-64 border-r flex flex-col h-full shadow-sm transition-all duration-300 ${isDarkMode
            ? 'bg-black/20 backdrop-blur-xl border-white/10 text-white'
            : 'bg-white border-gray-100 text-gray-900'
            }`}>
            <div className={`p-6 flex items-center gap-3 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-50'}`}>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    {config?.company_name?.[0] || 'N'}
                </div>
                <span className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {config?.company_name || 'Northern Sales Dashboard'}
                </span>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${isDarkMode
                            ? 'text-white/70 hover:bg-white/10 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-color)]'
                            }`}
                    >
                        <item.icon size={20} className={`transition-colors ${isDarkMode
                            ? 'group-hover:text-white'
                            : 'group-hover:text-[var(--primary-color)]'
                            }`} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className={`p-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-50'}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors ${isDarkMode
                        ? 'text-white/50 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                        }`}>
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
