'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // USE PASSWORD LOGIN (Instant Access for Superuser)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage("Error: " + error.message);
            setLoading(false);
        } else {
            // SUCCESS: Redirect immediately to Dashboard (RBAC handled by Middleware/Sidebar)
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-slate-950 to-black p-4 font-sans">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">

                {/* LOGO AREA */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.6)] mb-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
                        <span className="text-4xl font-extrabold text-white font-mono">KK</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sales Portal</h1>
                    <p className="text-slate-400 text-sm mt-2">REGIONAL SALES PERFORMANCE</p>
                </div>

                {/* ERROR MESSAGE */}
                {message && (
                    <div className="p-4 mb-6 rounded-xl text-sm font-bold bg-red-500/20 text-red-200 border border-red-500/30">
                        ⚠️ {message}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                            placeholder="email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all transform active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? "Authenticating..." : "Access Dashboard"}
                    </button>
                </form>

                <div className="mt-8 text-center flex flex-col gap-1">
                    <p className="text-xs text-slate-500">Authorized Personnel Only</p>
                    <p className="text-[10px] text-slate-600 font-mono">v1.7 (Grid Filters)</p>
                    {/* DEBUG INFO */}
                    <div className="mt-2 text-[9px] text-slate-700 font-mono flex flex-col gap-1 items-center opacity-50">
                        {typeof window !== 'undefined' && (
                            <>
                                <span>SW Status: {localStorage.getItem('sw_status') || 'Checking...'}</span>
                                <span>Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}