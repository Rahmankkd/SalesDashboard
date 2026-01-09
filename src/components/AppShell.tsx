'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserRole } from '@/app/actions/auth-access';

// --- ICONS ---
const IconDash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconUpload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const IconUsers = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconSettings = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconReport = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconLogout = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function AppShell({ children }: { children: React.ReactNode }) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const pathname = usePathname();
    const router = useRouter();

    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Hide Top Bar on login page
    const isLoginPage = pathname === '/login';

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user && !isLoginPage) {
                router.push('/login');
                return;
            }

            if (user) {
                const fetchedRole = await getUserRole();
                setRole(fetchedRole);
            }
            setLoading(false);
        };

        checkUser();
    }, [pathname]);

    if (isLoginPage || loading) {
        return <>{children}</>;
    }

    return (
        <>
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50 shadow-lg">

                {/* 1. LEFT: LOGO */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-mono font-bold shadow-[0_0_15px_rgba(22,163,74,0.5)]">
                        KK
                    </div>
                    <span className="font-bold text-white text-xs md:text-sm tracking-tight hidden md:block uppercase">Berjaya Krispy Kreme Doughnuts Sdn Bhd</span>
                </div>

                {/* 2. CENTER: NAVIGATION LINKS */}
                <nav className="flex items-center gap-1 md:gap-2">

                    <NavLink href="/dashboard" active={pathname === '/dashboard'} icon={<IconDash />}>
                        Sales
                    </NavLink>

                    <NavLink href="/dashboard/reports" active={pathname === '/dashboard/reports'} icon={<IconReport />}>
                        Beverages & Combo
                    </NavLink>

                    {(role === 'admin' || role === 'superuser') && (
                        <NavLink href="/admin" active={pathname === '/admin'} icon={<IconUpload />}>
                            Data Entry
                        </NavLink>
                    )}

                    {role === 'superuser' && (
                        <NavLink href="/superuser" active={pathname === '/superuser'} icon={<IconUsers />}>
                            Users
                        </NavLink>
                    )}

                    <NavLink href="/settings" active={pathname === '/settings'} icon={<IconSettings />}>
                        Settings
                    </NavLink>
                </nav>

                {/* 3. RIGHT: USER & LOGOUT */}
                <div className="flex items-center gap-4">
                    {/* INSTALL APP BUTTON (Visible only if installable) */}
                    <InstallButton />

                    {/* Role Badge */}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Signed in as</span>
                        <span className={`text-xs font-bold uppercase ${role === 'superuser' ? 'text-purple-400' : role === 'admin' ? 'text-blue-400' : 'text-slate-200'}`}>
                            {role}
                        </span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                    <button
                        onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                        title="Sign Out"
                    >
                        <IconLogout />
                        <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </>
    );
}

// --- HELPER COMPONENT FOR INSTALL BUTTON ---
function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (!deferredPrompt) return null;

    return (
        <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-green-500/30 animate-pulse"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="hidden sm:inline">Install App</span>
        </button>
    );
}

// --- HELPER COMPONENT FOR TOP LINKS ---
function NavLink({ href, children, active, icon }: { href: string, children: React.ReactNode, active: boolean, icon: any }) {
    return (
        <Link href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${active
            ? 'bg-white/10 text-white border-white/10 shadow-inner'
            : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
            }`}>
            {icon}
            <span className="hidden sm:inline">{children}</span>
        </Link>
    );
}
