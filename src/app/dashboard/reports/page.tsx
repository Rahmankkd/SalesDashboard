'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';

// COLORS for Charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- STATE ---
    const [loading, setLoading] = useState(false);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedOutlet, setSelectedOutlet] = useState('All');

    // Chart Data
    const [trendData, setTrendData] = useState<any[]>([]);
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [regionData, setRegionData] = useState<any[]>([]);

    useEffect(() => {
        fetchOutlets();
    }, []);

    useEffect(() => {
        if (outlets.length > 0) fetchReportData();
    }, [dateRange, selectedRegion, selectedOutlet, outlets]);

    // --- FETCHERS ---
    const fetchOutlets = async () => {
        const { data } = await supabase.from('outlets').select('*').eq('is_active', true).order('name');
        if (data) setOutlets(data);
    };

    const fetchReportData = async () => {
        setLoading(true);

        // Build Query
        let query = supabase
            .from('sales_reports')
            .select('*, outlets(name, region)')
            .gte('date', `${dateRange.start}T00:00:00`)
            .lte('date', `${dateRange.end}T23:59:59`);

        const { data } = await query;
        if (!data) { setLoading(false); return; }

        // Client-side Filtering for more flexibility
        let filtered = data.filter((r: any) => r.outlets); // Ensure outlet exists

        if (selectedRegion !== 'All') {
            filtered = filtered.filter((r: any) => r.outlets.region === selectedRegion);
        }
        if (selectedOutlet !== 'All') {
            filtered = filtered.filter((r: any) => r.outlet_id === selectedOutlet);
        }

        setRecords(filtered);
        processCharts(filtered);
        setLoading(false);
    };

    const processCharts = (data: any[]) => {
        // 1. Trend Data (Sum Bev by Date)
        const byDate: Record<string, number> = {};
        data.forEach(r => {
            const d = r.date.split('T')[0];
            byDate[d] = (byDate[d] || 0) + (r.beverages || 0);
        });
        const trend = Object.entries(byDate)
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => a.date.localeCompare(b.date));
        setTrendData(trend);

        // 2. Ranking Data (Sum Bev by Outlet)
        const byOutlet: Record<string, number> = {};
        data.forEach(r => {
            const name = r.outlets.name;
            byOutlet[name] = (byOutlet[name] || 0) + (r.beverages || 0);
        });
        const ranking = Object.entries(byOutlet)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10); // Top 10
        setRankingData(ranking);

        // 3. Region Data (Sum Bev by Region)
        const byRegion: Record<string, number> = {};
        data.forEach(r => {
            const reg = r.outlets.region;
            byRegion[reg] = (byRegion[reg] || 0) + (r.beverages || 0);
        });
        const region = Object.entries(byRegion)
            .map(([name, value]) => ({ name, value }));
        setRegionData(region);
    };

    const downloadCSV = () => {
        const headers = ['Date', 'Outlet', 'Bev (RM)', 'Combo (PCS)'];
        const csvRows = [headers.join(',')];

        records.forEach(r => {
            const comboCount = r.combo_details
                ? Object.values(r.combo_details).reduce((a: any, b: any) => a + b, 0)
                : 0;

            const row = [
                r.date.split('T')[0],
                `"${r.outlets.name}"`, // Quote to handle commas in names
                r.beverages || 0,
                comboCount
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${dateRange.start}_${dateRange.end}.csv`;
        a.click();
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Beverages & <span className="text-blue-600">Combo</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Deep Dive Analytics</p>
                    </div>
                    <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
                        <Download size={18} /> Export CSV
                    </button>
                </div>

                {/* --- FILTERS --- */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-6">
                    {/* Date Range */}
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Calendar size={14} /> Date Range
                        </label>
                        <div className="flex items-center gap-2">
                            <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none flex-1" />
                            <span className="text-slate-300 font-bold">-</span>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none flex-1" />
                        </div>
                    </div>

                    {/* Regions & Outlets */}
                    <div className="flex-[2] flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Filter size={14} /> Region
                            </label>
                            <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedOutlet('All'); }} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                                <option value="All">All Regions</option>
                                {Array.from(new Set(outlets.map(o => o.region))).map(r => (<option key={r} value={r}>{r}</option>))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Filter size={14} /> Outlet
                            </label>
                            <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                                <option value="All">All Outlets</option>
                                {outlets.filter(o => selectedRegion === 'All' || o.region === selectedRegion).map(o => (<option key={o.id} value={o.id}>{o.name}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- CHARTS ROW 1 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* TREND CHART */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                        <h3 className="text-sm font-bold text-slate-900 mb-6">Beverage Sales Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `RM ${(val / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val: any) => [`RM ${Number(val).toLocaleString()}`, 'Bev Sales']}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* PIE CHART */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Bev Sales by Region</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={regionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {regionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: any) => `RM ${Number(val).toLocaleString()}`} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* --- CHARTS ROW 2 --- */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                    <h3 className="text-sm font-bold text-slate-900 mb-6">Top Outlets (Beverages)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={rankingData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fontWeight: 600, fill: '#1E293B' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#F1F5F9' }} formatter={(val: any) => [`RM ${Number(val).toLocaleString()}`, 'Bev Sales']} />
                            <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Outlet</th>
                                    <th className="px-6 py-4 text-right">Bev (RM)</th>
                                    <th className="px-6 py-4 text-center">Combo (PCS)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.slice(0, 100).map((r, i) => {
                                    const comboCount = r.combo_details
                                        ? Object.values(r.combo_details).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
                                        : 0;

                                    return (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">{new Date(r.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{r.outlets.name}</td>
                                            <td className="px-6 py-4 text-right font-bold text-purple-600">RM {(r.beverages || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center font-bold text-blue-600">{comboCount} PCS</td>
                                        </tr>
                                    );
                                })}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No records found for selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {records.length > 100 && (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium bg-slate-50 border-t border-slate-100">
                            Showing top 100 records. Export CSV to see all {records.length} records.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
