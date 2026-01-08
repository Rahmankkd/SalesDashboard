'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Layout, Moon, Sun, Monitor, Smartphone, Volume2, Shield, LogOut, Database, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    // --- STATE ---
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string>('Loading...');
    const [loading, setLoading] = useState(true);

    // Preferences (Persisted to LocalStorage)
    const [theme, setTheme] = useState('system');
    const [density, setDensity] = useState('comfortable');
    const [startPage, setStartPage] = useState('dashboard');

    // --- LOAD DATA ---
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch Role
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setRole(data?.role || 'user');
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        // Load Local Preferences
        if (typeof window !== 'undefined') {
            setTheme(localStorage.getItem('theme_preference') || 'system');
            setDensity(localStorage.getItem('density_preference') || 'comfortable');
            setStartPage(localStorage.getItem('start_page') || 'dashboard');
        }

        loadProfile();
    }, []);

    // --- HANDLERS ---
    const savePreference = (key: string, value: string, setter: (v: string) => void) => {
        setter(value);
        localStorage.setItem(key, value);
        // Dispatch event for immediate UI updates if we were wiring it up globally
        // window.dispatchEvent(new Event('storage')); 
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_role');
        router.push('/login');
    };

    const handleClearCache = () => {
        if (confirm('Reset all local preferences? This will refresh the page.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (loading) return <div className="p-10 text-slate-400 animate-pulse">Loading Profile...</div>;

    const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 lg:p-10 font-sans">

            {/* HERADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Settings</h1>
                <p className="text-slate-500 font-medium">Manage your profile and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">

                {/* LEFT: PROFILE SERVER CARD */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>

                        <div className="relative flex flex-col items-center mt-8">
                            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl mb-4 transform group-hover:scale-105 transition-transform duration-300">
                                <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-300">
                                    {initials}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{user?.email?.split('@')[0]}</h2>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100">
                                {role}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100">
                                <span className="text-slate-400 flex items-center gap-2"><Monitor size={14} /> ID</span>
                                <span className="font-mono text-xs text-slate-600 truncate max-w-[120px]" title={user?.id}>{user?.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100">
                                <span className="text-slate-400 flex items-center gap-2"><Shield size={14} /> Security</span>
                                <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-3">
                                <span className="text-slate-400 flex items-center gap-2"><Smartphone size={14} /> Last Sign In</span>
                                <span className="text-slate-600 text-xs font-medium">
                                    {new Date(user?.last_sign_in_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full mt-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* RIGHT: PREFERENCES */}
                <div className="lg:col-span-2 space-y-6">

                    {/* UI PREFERENCES */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            UI Preferences
                        </h3>

                        {/* Theme Toggle */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appearance</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['light', 'dark', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => savePreference('theme_preference', t, setTheme)}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === t
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-100 hover:border-slate-300 text-slate-400'
                                            }`}
                                    >
                                        {t === 'light' && <Sun size={24} />}
                                        {t === 'dark' && <Moon size={24} />}
                                        {t === 'system' && <Monitor size={24} />}
                                        <span className="capitalize font-bold text-sm">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Density Toggle */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Density</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['comfortable', 'compact'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => savePreference('density_preference', d, setDensity)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${density === d
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SYSTEM INFO */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Database size={16} className="text-slate-400" /> Local Data
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Clear local cache if you experience issues.</p>
                        </div>
                        <button
                            onClick={handleClearCache}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Reset Cache
                        </button>
                    </div>

                    <div className="text-center text-xs text-slate-300 font-medium py-4">
                        Northern Sales Tracker v1.2.0 • Build 2026.01.08
                    </div>

                </div>
            </div>
        </div>
    );
}
