'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, User, Shield, LogOut, Bell, Moon, Smartphone, Check } from 'lucide-react';

export default function SettingsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- STATES FOR FUNCTIONALITY ---
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPassLoading, setIsPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMessage(null);
        if (password.length < 6) {
            setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        if (password !== confirmPassword) {
            setPassMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setIsPassLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setPassMessage({ type: 'error', text: error.message });
        } else {
            setPassMessage({ type: 'success', text: 'Password updated successfully!' });
            setPassword('');
            setConfirmPassword('');
        }
        setIsPassLoading(false);
    };

    if (loading) return <div className="p-10 text-slate-400 animate-pulse">Loading preferences...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* --- HEADER --- */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                <p className="text-slate-400 mt-2">Manage your profile, security, and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN: NAVIGATION / QUICK INFO --- */}
                <div className="space-y-6">
                    {/* ID CARD */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-green-500/20 transition-all"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
                                <User size={32} className="text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{user?.email?.split('@')[0]}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${profile?.role === 'superuser' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20' : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'}`}>
                                        {profile?.role || 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between group/item hover:border-white/10 transition-colors">
                                <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
                                    <span className="text-xs font-medium text-green-400">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DANGER ZONE (Moved to sidebar for better layout) */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-red-200 mb-2 flex items-center gap-2">
                            <LogOut size={16} /> Session
                        </h3>
                        <p className="text-xs text-red-400/60 mb-4 leading-relaxed">
                            Sign out of your account on this device. You will need to log in again to access the dashboard.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold rounded-xl text-sm transition-all border border-red-600/20 hover:border-transparent"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: FORMS & DETAILS --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* SECTION: SECURITY */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Lock size={20} /></div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Security & Password</h2>
                                <p className="text-xs text-slate-500">Update your login credentials.</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                            </div>

                            {passMessage && (
                                <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${passMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {passMessage.type === 'success' ? <Check size={14} /> : <Shield size={14} />}
                                    {passMessage.text}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPassLoading}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPassLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Lock size={16} />
                                    )}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SECTION: PREFERENCES (Placeholder for functional parity) */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl opacity-60 pointer-events-none grayscale-[0.5]">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Bell size={20} /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Notifications</h2>
                                    <p className="text-xs text-slate-500">Comming Soon: Manage your alerts.</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-slate-500 border border-white/5">Developement</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-300">Push Notifications</span>
                                </div>
                                <div className="w-10 h-6 rounded-full bg-slate-700 relative"><div className="w-4 h-4 rounded-full bg-slate-400 absolute left-1 top-1"></div></div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Moon size={18} className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-300">Dark Mode</span>
                                </div>
                                <div className="w-10 h-6 rounded-full bg-green-600 relative"><div className="w-4 h-4 rounded-full bg-white absolute right-1 top-1 shadow-sm"></div></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
