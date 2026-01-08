'use client';

import { useConfig } from '@/providers/ConfigProvider';
import { LayoutDashboard, FileText, Settings, LogOut, Shield, UploadCloud, ChevronDown, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const config = useConfig();
    const [role, setRole] = useState<string | null>(null);
    const [isManagementOpen, setIsManagementOpen] = useState(false);
    const router = useRouter();

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

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push('/login');
    };

    const hasManagementAccess = role === 'admin' || role === 'superuser';

    return (
        <aside className={twMerge(
            "w-72 border-r flex flex-col h-full shadow-2xl transition-all duration-500 relative perspective-[1000px]",
            isDarkMode
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-black border-white/5 text-white'
                : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 text-slate-800'
        )}>
            {/* --- 3D Floating Header --- */}
            <motion.div
                initial={{ opacity: 0, y: -20, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={twMerge(
                    "p-8 flex items-center gap-4 mb-2 z-20",
                    isDarkMode ? 'border-b border-white/5' : 'border-b border-slate-100'
                )}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                    style={{
                        backgroundColor: 'var(--primary-color)',
                        transform: 'translateZ(20px)'
                    }}
                >
                    {config?.company_name?.[0] || 'N'}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-wider uppercase opacity-50">Northern</span>
                    <span className={twMerge(
                        "font-black text-lg leading-none tracking-tight",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {config?.company_name || 'Sales Dashboard'}
                    </span>
                </div>
            </motion.div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto z-10">

                {/* --- STANDARD MENU ITEMS --- */}
                <MenuHeading isDarkMode={isDarkMode}>Main Navigation</MenuHeading>

                <MenuItem
                    href="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isDarkMode={isDarkMode}
                />
                <MenuItem
                    href="/dashboard/reports"
                    icon={FileText}
                    label="Reports"
                    isDarkMode={isDarkMode}
                />

                {/* --- 3D MANAGEMENT DROPDOWN --- */}
                {hasManagementAccess && (
                    <div className="mt-4">
                        <MenuHeading isDarkMode={isDarkMode}>Administration</MenuHeading>
                        <div className="perspective-[1000px]">
                            <motion.button
                                whileHover={{ scale: 1.02, translateZ: 10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsManagementOpen(!isManagementOpen)}
                                className={twMerge(
                                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-bold mb-2 shadow-lg group relative overflow-hidden",
                                    isDarkMode
                                        ? 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                                        : 'bg-white text-slate-700 hover:text-[var(--primary-color)] shadow-slate-200 border border-slate-100'
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={twMerge(
                                        "p-2 rounded-lg transition-colors",
                                        isDarkMode ? "bg-white/10 group-hover:bg-[var(--primary-color)]" : "bg-slate-100 group-hover:bg-[var(--primary-color)] group-hover:text-white"
                                    )}>
                                        <Layers size={18} />
                                    </div>
                                    <span>Management</span>
                                </div>
                                <motion.div
                                    animate={{ rotate: isManagementOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown size={16} className="opacity-50" />
                                </motion.div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </motion.button>

                            <AnimatePresence>
                                {isManagementOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, rotateX: -20, transformOrigin: "top" }}
                                        animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
                                        exit={{ opacity: 0, height: 0, rotateX: -20 }}
                                        transition={{ duration: 0.3, ease: "anticipate" }}
                                        className="accordion-content pl-2 overflow-hidden"
                                    >
                                        <div className="pl-4 border-l-2 border-dashed border-white/10 py-2 flex flex-col gap-1">
                                            {hasManagementAccess && (
                                                <MenuItem
                                                    href="/admin"
                                                    icon={UploadCloud}
                                                    label="Upload Data"
                                                    isDarkMode={isDarkMode}
                                                    isSubItem
                                                />
                                            )}
                                            {role === 'superuser' && (
                                                <MenuItem
                                                    href="/superuser"
                                                    icon={Shield}
                                                    label="Admin Panel"
                                                    isDarkMode={isDarkMode}
                                                    isSubItem
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                <div className="mt-auto">
                    <MenuHeading isDarkMode={isDarkMode}>System</MenuHeading>
                    <MenuItem
                        href="/dashboard/settings"
                        icon={Settings}
                        label="Settings"
                        isDarkMode={isDarkMode}
                    />
                </div>
            </nav>

            {/* --- LOGOUT BUTTON --- */}
            <div className={twMerge(
                "p-6 relative z-20",
                isDarkMode ? 'border-t border-white/5' : 'border-t border-slate-100'
            )}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className={twMerge(
                        "w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold transition-all shadow-lg",
                        isDarkMode
                            ? 'bg-gradient-to-r from-red-900/50 to-red-600/20 text-red-200 border border-red-500/20 hover:border-red-500/50 hover:from-red-900/80'
                            : 'bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-slate-200'
                    )}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </motion.button>
            </div>
        </aside>
    );
}

// --- SUB-COMPONENTS ---

function MenuHeading({ children, isDarkMode }: { children: React.ReactNode, isDarkMode: boolean }) {
    return (
        <h3 className={twMerge(
            "text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-5 mt-4",
            isDarkMode ? "text-slate-500" : "text-slate-400"
        )}>
            {children}
        </h3>
    );
}

function MenuItem({ href, icon: Icon, label, isSubItem = false, isDarkMode }: any) {
    return (
        <Link href={href} className="block perspective-[1000px] group">
            <motion.div
                whileHover={{ x: 5, translateZ: 20 }}
                whileTap={{ scale: 0.98 }}
                className={twMerge(
                    "flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium relative overflow-hidden",
                    !isSubItem && "shadow-sm hover:shadow-md",
                    isSubItem
                        ? (isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                        : (isDarkMode ? "text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5" : "text-slate-600 hover:text-[var(--primary-color)] bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200")
                )}
            >
                <Icon size={isSubItem ? 16 : 20} className={twMerge(
                    "transition-colors duration-300",
                    isSubItem
                        ? "opacity-70 group-hover:opacity-100"
                        : (isDarkMode ? "group-hover:text-white" : "group-hover:text-[var(--primary-color)]")
                )} />
                <span className="relative z-10">{label}</span>

                {!isSubItem && (
                    <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                )}
            </motion.div>
        </Link>
    );
}
