'use client';

import { useConfig } from '@/providers/ConfigProvider';
import { LayoutDashboard, FileText, Settings, LogOut, Shield, UploadCloud, ChevronDown, Layers, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function TopNav({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const config = useConfig();
    // Initialize role from localStorage if available (Optimistic UI)
    const [role, setRole] = useState<string | null>(null);

    const [isManagementOpen, setIsManagementOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Fetch user role on mount and update cache
    useEffect(() => {
        // 1. Fast Local Check
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('user_role');
            if (cached) setRole(cached);
        }

        const fetchRole = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (data?.role) {
                    setRole(data.role);
                    localStorage.setItem('user_role', data.role); // Cache it
                }
            }
        };
        fetchRole();
    }, []);

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        localStorage.removeItem('user_role'); // Clear cache
        router.push('/login');
    };

    const hasManagementAccess = role === 'admin' || role === 'superuser';

    return (
        <nav className={twMerge(
            "w-full px-6 py-4 flex items-center justify-between border-b transition-all duration-500 z-50 sticky top-0 backdrop-blur-md",
            isDarkMode
                ? 'bg-slate-900/80 border-white/10 text-white'
                : 'bg-white/80 border-slate-200 text-slate-800'
        )}>
            {/* LEFT: BRAND */}
            <div className="flex items-center gap-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    {config?.company_name?.[0] || 'N'}
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-[10px] tracking-wider uppercase opacity-50">Northern</span>
                    <span className="font-black text-lg tracking-tight">
                        {config?.company_name || 'Sales Dashboard'}
                    </span>
                </div>
            </div>

            {/* CENTER: NAVIGATION ITEMS */}
            <div className="flex items-center gap-2">
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isDarkMode={isDarkMode} active={pathname === '/dashboard'} />
                <NavItem href="/dashboard/reports" icon={FileText} label="Reports" isDarkMode={isDarkMode} active={pathname === '/dashboard/reports'} />

                {/* Direct High-Level Links (Split) */}
                {(role === 'admin' || role === 'superuser') && (
                    <NavItem href="/admin" icon={UploadCloud} label="Upload" isDarkMode={isDarkMode} active={pathname === '/admin'} />
                )}

                {role === 'superuser' && (
                    <NavItem href="/superuser" icon={Shield} label="Superuser" isDarkMode={isDarkMode} active={pathname === '/superuser'} />
                )}
            </div>

            {/* RIGHT: SYSTEM & LOGOUT */}
            <div className="flex items-center gap-2">
                <NavItem href="/dashboard/settings" icon={Settings} label="" isDarkMode={isDarkMode} active={pathname === '/dashboard/settings'} />
                <button
                    onClick={handleLogout}
                    className={twMerge(
                        "p-2.5 rounded-xl transition-all",
                        isDarkMode
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                    )}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}

function NavItem({ href, icon: Icon, label, isDarkMode, active }: any) {
    return (
        <Link href={href}>
            <div className={twMerge(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm group relative overflow-hidden",
                active
                    ? (isDarkMode ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'bg-white text-blue-600 shadow-md')
                    : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
            )}>
                <Icon size={18} className={twMerge("transition-colors", active ? "text-[var(--primary-color)]" : "opacity-70 group-hover:opacity-100")} />
                {label && <span>{label}</span>}
                {active && (
                    <motion.div layoutId="active-pill" className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--primary-color)]" />
                )}
            </div>
        </Link>
    );
}

function DropdownItem({ href, icon: Icon, label, isDarkMode }: any) {
    return (
        <Link href={href} className={twMerge(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
            isDarkMode
                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
        )}>
            <Icon size={16} />
            <span>{label}</span>
        </Link>
    );
}
