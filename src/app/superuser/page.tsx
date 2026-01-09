'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- ICONS ---
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const IconStore = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>;
const IconData = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-9.75v3.75m3.75 12.75v7.5m9-7.5v7.5" /></svg>;
const IconExit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconPower = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>;

// --- SERVER ACTIONS ---
import { getAllProfiles, getUserRole } from '@/app/actions/auth-access';
import { createUserAccount, resetUserPassword } from '@/app/actions/user-management';

// ... (Imports remain the same)

// Just update the component logic
export default function SuperuserPage() {
    // ... (Existing Supabase setup) 
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    const [userRole, setUserRole] = useState<'superuser' | 'admin' | null>(null);
    const [activeTab, setActiveTab] = useState<'Users' | 'Outlets' | 'Data'>('Users');
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);

    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
    const [newOutlet, setNewOutlet] = useState({ name: '', region: '' });

    // ... (useEffect / checkAccess / fetchAllData / fetchOutlets ... remain same)
    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        // Securely Fetch Role (Bypasses RLS)
        const role = await getUserRole();

        if (role === 'superuser' || role === 'admin') {
            setUserRole(role);
            fetchAllData();
        } else {
            router.push('/');
        }
    };
    const fetchAllData = () => { fetchUsers(); fetchOutlets(); fetchRecentSales(); };
    const fetchUsers = async () => {
        // Securely Fetch Users via Server Action (Bypasses RLS)
        const result = await getAllProfiles();
        if (result.error) {
            console.error("Fetch Users Error:", result.error);
            alert("Error fetching users: " + result.error);
        } else if (result.data) {
            setUsers(result.data);
        }
    };
    const fetchOutlets = async () => {
        const { data } = await supabase.from('outlets').select('*').order('name');
        if (data) setOutlets(data);
    };
    const fetchRecentSales = async () => {
        const { data } = await supabase.from('sales_reports').select('*, outlets(name)').order('created_at', { ascending: false }).limit(50);
        if (data) setRecentSales(data);
    };

    const isSuperuser = userRole === 'superuser';

    // --- USER MANAGEMENT HANDLERS ---
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createUserAccount(newUser.email, newUser.password, newUser.role);
            if (result.success) {
                alert(result.message);
                setShowAddUser(false);
                setNewUser({ email: '', password: '', role: 'user' });
                fetchUsers();
            } else {
                alert("Error: " + result.message);
            }
        } catch (err: any) {
            alert("System Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId: string, email: string) => {
        const newPass = prompt(`Enter NEW password for ${email}:`);
        if (!newPass) return;
        if (newPass.length < 6) { alert("Password must be at least 6 chars"); return; }

        setLoading(true);
        const result = await resetUserPassword(userId, newPass);
        setLoading(false);
        alert(result.message);
    };

    const handleAddOutlet = async () => { /* ... existing logic ... */ };
    const toggleOutletStatus = async (outletId: string, currentStatus: boolean) => { /* ... existing logic ... */ };

    if (!userRole) return <div className="p-10">Loading access...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 selection:bg-green-100">
            {/* ... SIDEBAR (No Changes) ... */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen shadow-sm z-10">
                <div className="p-8 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">K</div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-900">Admin Panel</h1>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isSuperuser ? 'text-green-600' : 'text-blue-600'}`}>
                            {userRole}
                        </p>
                    </div>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                    {isSuperuser && <NavButton active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} icon={<IconUsers />} label="User Management" />}
                    <NavButton active={activeTab === 'Outlets'} onClick={() => setActiveTab('Outlets')} icon={<IconStore />} label="Outlets & Regions" />
                    {isSuperuser && <NavButton active={activeTab === 'Data'} onClick={() => setActiveTab('Data')} icon={<IconData />} label="Data Integrity" />}
                </nav>
                <div className="p-6 border-t border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm w-full transition-all">
                        <IconExit /> Logout to Dash
                    </Link>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-10 gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                            {activeTab === 'Users' && 'User Management'}
                            {activeTab === 'Outlets' && 'Store Operations'}
                            {activeTab === 'Data' && 'Data Maintenance'}
                        </h2>

                        {/* Mobile Add User Button (Small) */}
                        {activeTab === 'Users' && isSuperuser && (
                            <button onClick={() => setShowAddUser(true)} className="md:hidden p-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500">
                                <IconPlus />
                            </button>
                        )}
                    </div>

                    {/* MOBILE NAVIGATION TABS */}
                    <div className="flex md:hidden w-full overflow-x-auto pb-2 gap-2 border-b border-gray-100 no-scrollbar">
                        {isSuperuser && (
                            <button onClick={() => setActiveTab('Users')} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Users' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-gray-100'}`}>
                                Users
                            </button>
                        )}
                        <button onClick={() => setActiveTab('Outlets')} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Outlets' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-gray-100'}`}>
                            Stores
                        </button>
                        {isSuperuser && (
                            <button onClick={() => setActiveTab('Data')} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Data' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-gray-100'}`}>
                                Data
                            </button>
                        )}
                    </div>

                    {/* DESKTOP ADD USER BUTTON */}
                    {activeTab === 'Users' && isSuperuser && (
                        <button onClick={() => setShowAddUser(true)} className="hidden md:flex px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all items-center gap-2">
                            <IconPlus /> Add User
                        </button>
                    )}
                </header>

                {/* --- USERS TAB --- */}
                {activeTab === 'Users' && isSuperuser && (
                    <div className="space-y-6">
                        {/* ADD USER MODAL */}
                        {showAddUser && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <h3 className="text-2xl font-black mb-6">Create New User</h3>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">EMAIL</label>
                                            <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" placeholder="staff@krispykreme.com" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">PASSWORD</label>
                                            <input required type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" placeholder="Initial Password" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">ROLE</label>
                                            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl font-bold">
                                                <option value="user">User (View Only)</option>
                                                <option value="admin">Admin (Can Upload)</option>
                                                <option value="superuser">Superuser (Full Access)</option>
                                            </select>
                                        </div>
                                        <div className="pt-4 flex gap-3">
                                            <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
                                            <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg">{loading ? 'Creating...' : 'Create Account'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 border-b border-gray-100 font-bold text-slate-700">
                                    <tr>
                                        <th className="px-8 py-5">User Email</th>
                                        <th className="px-6 py-5">Role</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-slate-900">{u.email}</td>
                                            <td className="px-6 py-5 uppercase font-bold text-[10px] text-slate-500">
                                                <span className={`px-2 py-1 rounded bg-slate-100 ${u.role === 'superuser' ? 'text-green-700 bg-green-100' : ''}`}>{u.role}</span>
                                            </td>
                                            <td className="px-6 py-5"><span className="text-green-600 font-bold text-[10px] uppercase bg-green-50 px-2 py-1 rounded-full border border-green-100">Active</span></td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleResetPassword(u.id, u.email)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-bold text-xs hover:underline"
                                                >
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Outlets and Data tabs would follow here (omitted for brevity as they were unchanged in logic, but contextually this replaces the whole return) */}
                {activeTab === 'Outlets' && (
                    /* ... Existing Outlets Code ... */
                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Form */}
                        <div className="w-full xl:w-1/3 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-fit">
                            <h3 className="font-bold text-slate-900 mb-6 text-lg">Add New Store</h3>
                            <div className="space-y-5">
                                <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="Store Code (e.g. BUT)" value={newOutlet.name} onChange={e => setNewOutlet({ ...newOutlet, name: e.target.value })} />
                                <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-green-500 outline-none" value={newOutlet.region} onChange={e => setNewOutlet({ ...newOutlet, region: e.target.value })}>
                                    <option value="">Select Region...</option>
                                    <option value="Kedah">Kedah</option>
                                    <option value="Perak">Perak</option>
                                    <option value="Penang">Penang</option>
                                </select>
                                <button onClick={handleAddOutlet} disabled={loading} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">{loading ? 'Creating...' : 'Create Outlet'}</button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 font-bold">Store</th>
                                        <th className="px-6 py-5 font-bold">Region</th>
                                        <th className="px-6 py-5 text-center font-bold">Status</th>
                                        <th className="px-6 py-5 text-right font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {outlets.map((o) => (
                                        <tr key={o.id} className={`hover:bg-gray-50 transition-colors ${!o.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                            <td className="px-8 py-5 font-bold text-slate-900">{o.name}</td>
                                            <td className="px-6 py-5 text-slate-500">{o.region}</td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${o.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {o.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => toggleOutletStatus(o.id, o.is_active)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto ${o.is_active
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                                        }`}
                                                >
                                                    <IconPower /> {o.is_active ? 'Disable Store' : 'Enable Store'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Data' && isSuperuser && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100 font-bold">
                                <tr><th className="px-8 py-5">Date</th><th className="px-6 py-5">Outlet</th><th className="px-6 py-5 font-bold">Sales</th><th className="px-6 py-5 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentSales.map((r) => (
                                    <tr key={r.id} className="hover:bg-red-50/20 transition-colors">
                                        <td className="px-8 py-5 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-5"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-bold">{r.outlets?.name}</span></td>
                                        <td className="px-6 py-5 font-bold">RM {r.total_sales.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-bold text-red-500 cursor-pointer" onClick={() => { if (confirm("Delete?")) supabase.from('sales_reports').delete().eq('id', r.id).then(() => fetchRecentSales()) }}>Delete</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>
        </div>
    );
}


function NavButton({ active, onClick, icon, label }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${active ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'}`}>
            <span>{icon}</span>{label}
        </button>
    );
}