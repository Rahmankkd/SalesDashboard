'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { parseWhatsAppReport } from '@/lib/parser';


// --- ICONS ---
const IconUpload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconHistory = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCsv = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

export default function AdminPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [uploadMode, setUploadMode] = useState<'Current' | 'History' | 'Bulk'>('Current');
    const [manualDate, setManualDate] = useState('');
    const [rawText, setRawText] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvPreview, setCsvPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [selectedOutletId, setSelectedOutletId] = useState('');
    const [isDataValid, setIsDataValid] = useState(false);
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [todaysReports, setTodaysReports] = useState<any[]>([]);
    const [showVarianceModal, setShowVarianceModal] = useState(false);
    const [varianceResolved, setVarianceResolved] = useState(false);

    const [parsedData, setParsedData] = useState({
        outletName: '',
        reportDate: null as string | null,
        sales: 0,              // Total Net Sales (reported)
        daily_net_sales: 0,    // Daily Net Sales
        event_sales: 0,        // Event Net Sales
        bulk_sales: 0,         // Bulk Net Sales
        target: 0,
        variance: 0,
        tc: 0,
        sales_mtd: 0,
        beverages: 0,
        food_panda: 0,
        grab_food: 0,
        shopee_food: 0,
        combos: {} as Record<string, number>
    });

    useEffect(() => {
        fetchOutlets();
        fetchRecentReports();
        fetchTodaysReports();
    }, []);

    const fetchOutlets = async () => {
        const { data } = await supabase.from('outlets').select('*').eq('is_active', true).order('name');
        if (data) setOutlets(data);
    };

    const fetchRecentReports = async () => {
        const { data } = await supabase
            .from('sales_reports')
            .select('*, outlets(name)')
            .order('date', { ascending: false })
            .limit(10);
        if (data) setRecentReports(data);
    };

    const fetchTodaysReports = async () => {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const { data } = await supabase
            .from('sales_reports')
            .select('outlet_id, date')
            .gte('date', `${todayStr}T00:00:00`)
            .lt('date', `${todayStr}T23:59:59`);

        console.log('fetchTodaysReports - Query for date:', todayStr);
        console.log('fetchTodaysReports - Found reports:', data);

        if (data) setTodaysReports(data);
    };

    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCsvFile(file);
            parseCsv(file);
        }
    };

    const parseCsv = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const previewData: any[] = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length < 3) continue;
                const dateStr = cols[0];
                const outletName = cols[1];
                const sales = parseFloat(cols[2]) || 0;
                const tc = parseFloat(cols[3]) || 0;
                const target = parseFloat(cols[4]) || 0;
                const matchedOutlet = outlets.find(o => o.name === outletName);
                previewData.push({
                    date: dateStr,
                    outlet_name: outletName,
                    outlet_id: matchedOutlet ? matchedOutlet.id : null,
                    total_sales: sales,
                    transaction_count: tc,
                    target: target,
                    variance: sales - target,
                    isValid: !!matchedOutlet && !isNaN(sales) && !!dateStr
                });
            }
            setCsvPreview(previewData);
            setIsDataValid(previewData.length > 0 && previewData.every(r => r.isValid));
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        if (uploadMode === 'Bulk') return;
        if (!rawText.trim()) { setIsDataValid(false); return; }

        // 1. Extract Outlet Name (Not in shared parser yet)
        const outletMatch = rawText.match(/\*([A-Z]{3})\*/);
        const detectedName = outletMatch ? outletMatch[1] : '';
        if (detectedName && outlets.length > 0) {
            const match = outlets.find(o => o.name === detectedName);
            if (match) setSelectedOutletId(match.id);
        }

        // 2. Use Shared Parser
        const data = parseWhatsAppReport(rawText);

        // 3. Handle Date Override
        let finalDate = data.reportDate;
        if (uploadMode === 'History' && manualDate) {
            finalDate = manualDate;
        }

        setParsedData({
            outletName: detectedName || 'Unknown',
            reportDate: finalDate,
            sales: data.sales,              // Total Net Sales (reported)
            daily_net_sales: data.daily_net_sales,
            event_sales: data.event_sales,
            bulk_sales: data.bulk_sales,
            target: data.target,
            variance: data.variance,
            tc: data.tc,
            sales_mtd: data.sales_mtd, // Now contains Combo PCS Count
            beverages: data.beverages,
            food_panda: data.food_panda,
            grab_food: data.grab_food,
            shopee_food: data.shopee_food,
            combos: data.combo_details // Detailed JSON
        });


        setIsDataValid(!!data.sales && (uploadMode === 'History' ? !!manualDate : !!finalDate));

        // Check for variance and reset resolution state when data changes
        const calculated = data.daily_net_sales + data.event_sales + data.bulk_sales;
        const variance = data.sales - calculated;
        const hasVariance = Math.abs(variance) > 0.01;

        if (hasVariance !== showVarianceModal) {
            setShowVarianceModal(hasVariance);
            setVarianceResolved(false); // Reset resolution state when new variance detected
        }
    }, [rawText, outlets, uploadMode, manualDate]);

    const handleUpload = async () => {
        if (!isDataValid && uploadMode !== 'Bulk') {
            alert("Please check data. Sales amount or Date is missing.");
            return;
        }

        // Check if variance exists and not resolved
        const calculated = parsedData.daily_net_sales + parsedData.event_sales + parsedData.bulk_sales;
        const variance = parsedData.sales - calculated;
        const hasVariance = Math.abs(variance) > 0.01;

        if (hasVariance && !varianceResolved) {
            alert("⚠️ Please resolve the sales variance before uploading.");
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        try {
            if (uploadMode === 'Bulk') {
                // UPSERT BULK LOGIC
                const upsertRows = csvPreview.map(row => ({
                    date: new Date(row.date).toISOString(),
                    user_id: userId,
                    outlet_id: row.outlet_id,
                    total_sales: row.total_sales,
                    transaction_count: row.transaction_count,
                    target: row.target,
                    variance: row.variance,
                    raw_message: "Bulk CSV Upload"
                }));

                const { error } = await supabase.from('sales_reports').upsert(upsertRows, { onConflict: 'date, outlet_id' });
                if (error) throw error;
                alert(`✅ Bulk Processing Complete! Duplicates were updated.`);
            } else {
                // SINGLE UPSERT LOGIC
                const finalDate = parsedData.reportDate ? new Date(parsedData.reportDate).toISOString() : new Date().toISOString();
                const dateOnly = finalDate.split('T')[0];

                const payload = {
                    date: finalDate,
                    user_id: userId,
                    outlet_id: selectedOutletId,
                    raw_message: rawText,
                    total_sales: parsedData.sales,
                    target: parsedData.target,
                    variance: parsedData.variance,
                    transaction_count: parsedData.tc,
                    sales_mtd: parsedData.sales_mtd, // Combo Count
                    beverages: parsedData.beverages,
                    food_panda: parsedData.food_panda,
                    grab_food: parsedData.grab_food,
                    shopee_food: parsedData.shopee_food,
                    combo_details: parsedData.combos // New JSONB Column (ensure column exists in DB)
                };

                const { error } = await supabase.from('sales_reports').upsert(payload, { onConflict: 'date, outlet_id' });

                if (error) throw error;
                alert(`✅ Report Processed Successfully!`);
                if (uploadMode === 'Current') setRawText('');
            }
            fetchRecentReports();
            fetchTodaysReports();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen p-4 md:p-8">
            {/* VARIANCE RESOLUTION MODAL */}
            {showVarianceModal && !varianceResolved && uploadMode !== 'Bulk' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-black text-white mb-2">Sales Variance Detected</h2>
                            <p className="text-slate-400 text-sm">The calculated total doesn't match the reported total. Which value is correct?</p>
                        </div>

                        {(() => {
                            const calculated = parsedData.daily_net_sales + parsedData.event_sales + parsedData.bulk_sales;
                            const reported = parsedData.sales;
                            const variance = reported - calculated;

                            const handleChoice = (useCalculated: boolean) => {
                                setParsedData(prev => ({
                                    ...prev,
                                    sales: useCalculated ? calculated : reported
                                }));
                                setVarianceResolved(true);
                                setShowVarianceModal(false);
                            };

                            return (
                                <>
                                    <div className="bg-slate-950/50 rounded-xl p-4 mb-6 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Daily + Event + Bulk</span>
                                            <span className="font-mono text-blue-400 font-bold">RM {calculated.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Total Net Sales (Reported)</span>
                                            <span className="font-mono text-green-400 font-bold">RM {reported.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-t border-red-500/30 pt-2">
                                            <span className="text-red-400 font-bold">Variance</span>
                                            <span className="font-mono text-red-400 font-bold">{variance > 0 ? '+' : ''}RM {variance.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleChoice(true)}
                                            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-between"
                                        >
                                            <span>Use Calculated Total</span>
                                            <span className="font-mono">RM {calculated.toLocaleString()}</span>
                                        </button>
                                        <button
                                            onClick={() => handleChoice(false)}
                                            className="w-full py-4 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-between"
                                        >
                                            <span>Use Reported Total</span>
                                            <span className="font-mono">RM {reported.toLocaleString()}</span>
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* HEADER */}
                <div className="md:flex md:justify-between md:items-end pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Admin <span className="text-blue-500">Panel</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Sales Ingestion System</p>
                    </div>

                    <div className="flex flex-col w-full md:w-auto md:items-end gap-2 mt-4 md:mt-0">
                        <div className="bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg flex w-full md:w-auto overflow-x-auto">
                            <button onClick={() => setUploadMode('Current')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${uploadMode === 'Current' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><IconUpload /> Current</button>
                            <button onClick={() => setUploadMode('History')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${uploadMode === 'History' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><IconHistory /> History</button>
                            <button onClick={() => setUploadMode('Bulk')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${uploadMode === 'Bulk' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><IconCsv /> Bulk CSV</button>
                        </div>
                        {/* MISSING REPORTS CHECK */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Missing Today:</span>
                            <div className="flex -space-x-2">
                                {outlets.filter(o => !todaysReports.some(r => r.outlet_id === o.id)).length === 0
                                    ? <span className="text-green-500 text-xs font-bold">All Clear!</span>
                                    : outlets.filter(o => !todaysReports.some(r => r.outlet_id === o.id)).map(o => (
                                        <span key={o.id} className="w-6 h-6 rounded-full bg-red-900/80 border border-red-500 flex items-center justify-center text-[10px] text-red-200 font-bold shrink-0" title={o.name}>{o.name.substring(0, 2)}</span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className={`border rounded-3xl p-1 shadow-2xl transition-colors duration-500 backdrop-blur-xl ${uploadMode === 'Bulk' ? 'bg-green-900/20 border-green-500/20' : uploadMode === 'History' ? 'bg-purple-900/20 border-purple-500/20' : 'bg-white/5 border-white/10'}`}>
                            <div className="bg-slate-900/40 rounded-2xl p-6 h-full">
                                {uploadMode === 'Bulk' ? (
                                    <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                        <label className="mt-4 text-green-400 font-bold cursor-pointer text-lg"><IconCsv /> Click to Select CSV File<input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" /></label>
                                        {csvFile && <div className="mt-4 text-green-200 bg-green-900/40 border border-green-500/30 px-4 py-2 rounded-lg font-mono">{csvFile.name}</div>}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4 px-2">
                                            <label className={`text-xs font-bold uppercase tracking-widest ${uploadMode === 'History' ? 'text-purple-400' : 'text-blue-400'}`}>Report Data</label>
                                        </div>
                                        <textarea className="w-full h-96 bg-transparent border-0 text-slate-200 font-mono text-sm focus:ring-0 resize-none leading-relaxed" placeholder="Paste report here..." value={rawText} onChange={(e) => setRawText(e.target.value)} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {uploadMode === 'History' && (
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl">
                                <label className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><IconCalendar /> Set Historical Date</label>
                                <input type="date" className="w-full p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white outline-none" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                            </div>
                        )}

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                            {uploadMode !== 'Bulk' && (
                                <div className="relative mb-6">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Outlet</label>
                                    <select className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none appearance-none" value={selectedOutletId} onChange={(e) => setSelectedOutletId(e.target.value)}>
                                        <option value="">-- Choose Outlet --</option>
                                        {outlets.map((o) => <option key={o.id} value={o.id} className="bg-slate-900">{o.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Date</span> <span className="font-mono text-white font-bold">{parsedData.reportDate || '-'}</span></div>

                                {(() => {
                                    const calculated = parsedData.daily_net_sales + parsedData.event_sales + parsedData.bulk_sales;
                                    const reported = parsedData.sales;
                                    const variance = reported - calculated;
                                    const hasVariance = Math.abs(variance) > 0.01;

                                    return (
                                        <>
                                            {/* Sales Breakdown */}
                                            <div className="border-t border-white/10 pt-3">
                                                <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-500 uppercase">Daily Net Sales</span> <span className="font-mono text-slate-300">RM {parsedData.daily_net_sales.toLocaleString()}</span></div>
                                                <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-500 uppercase">Event Net Sales</span> <span className="font-mono text-slate-300">RM {parsedData.event_sales.toLocaleString()}</span></div>
                                                <div className="flex justify-between text-[10px] mb-2"><span className="text-slate-500 uppercase">Bulk Net Sales</span> <span className="font-mono text-slate-300">RM {parsedData.bulk_sales.toLocaleString()}</span></div>
                                                <div className="flex justify-between border-t border-white/5 pt-2"><span className="text-slate-400 text-xs font-bold">Calculated Total</span> <span className="font-mono text-blue-400 font-bold">RM {calculated.toLocaleString()}</span></div>
                                            </div>

                                            {/* Total & Variance Check */}
                                            <div className={`border ${hasVariance ? 'border-red-500/30 bg-red-900/20' : 'border-white/10'} rounded-xl p-3`}>
                                                <div className="flex justify-between mb-1"><span className="text-slate-400 text-xs">Total Net Sales (Reported)</span> <span className="font-mono text-green-400 font-bold">RM {reported.toLocaleString()}</span></div>
                                                {hasVariance && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-500/30">
                                                        <span className="text-red-400 text-xl">⚠️</span>
                                                        <div className="flex-1">
                                                            <p className="text-red-400 text-[10px] font-bold uppercase">Variance Detected</p>
                                                            <p className="text-red-300 text-xs font-mono">{variance > 0 ? '+' : ''}RM {variance.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Beverages</span> <span className="font-mono text-purple-400 font-bold">RM {parsedData.beverages.toLocaleString()}</span></div>
                                {Object.entries(parsedData.combos).map(([k, v]) => (
                                    <div key={k} className="flex justify-between"><span className="text-slate-400 text-xs">{k}</span> <span className="font-mono text-blue-300 font-bold">{v}</span></div>
                                ))}
                                <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-slate-400 text-xs">TC</span> <span className="font-mono text-white">{parsedData.tc}</span></div>
                            </div>

                            <button onClick={handleUpload} disabled={loading || !isDataValid} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-700 opacity-50' : isDataValid ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                                {loading ? 'Processing...' : 'UPLOAD & SYNC'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}