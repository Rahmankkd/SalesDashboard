'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// --- ICONS ---
const IconChart = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
const IconTrendingUp = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const IconUsers = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconBeaker = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [isManualCompare, setIsManualCompare] = useState(false);
  const [showLowBevOnly, setShowLowBevOnly] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedOutlet, setSelectedOutlet] = useState('All');

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [compareRange, setCompareRange] = useState({
    start: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [topOutlets, setTopOutlets] = useState<any[]>([]);
  const [totals, setTotals] = useState({ sales: 0, comparison: 0, variance: 0, beverages: 0 });
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => { fetchOutlets(); }, []);
  useEffect(() => {
    if (dateRange.end && (compareRange.end || !isManualCompare)) fetchReportData();
  }, [dateRange, compareRange, isManualCompare, selectedRegion, selectedOutlet, outlets]);

  const fetchOutlets = async () => {
    const { data } = await supabase.from('outlets').select('*').eq('is_active', true).order('name');
    if (data) setOutlets(data);
  };

  const fetchReportData = async () => {
    if (outlets.length === 0) return;
    setLoading(true);
    setAnimateChart(false);

    let finalCompStart = compareRange.start;
    let finalCompEnd = compareRange.end;

    if (!isManualCompare) {
      const lyStartObj = new Date(dateRange.start); lyStartObj.setDate(lyStartObj.getDate() - 364);
      const lyEndObj = new Date(dateRange.end); lyEndObj.setDate(lyEndObj.getDate() - 364);
      finalCompStart = lyStartObj.toISOString().split('T')[0];
      finalCompEnd = lyEndObj.toISOString().split('T')[0];
    }

    const { data: currentData } = await supabase.from('sales_reports').select('*, outlets(name, region, is_active)').gte('date', `${dateRange.start}T00:00:00`).lte('date', `${dateRange.end}T23:59:59`);
    const { data: pastData } = await supabase.from('sales_reports').select('*, outlets(name, region, is_active)').gte('date', `${finalCompStart}T00:00:00`).lte('date', `${finalCompEnd}T23:59:59`);

    const activeIds = outlets.map(o => o.id);
    let fCurrent = (currentData || []).filter(r => activeIds.includes(r.outlet_id));
    let fLy = (pastData || []).filter(r => activeIds.includes(r.outlet_id));

    if (selectedOutlet !== 'All') {
      fCurrent = fCurrent.filter(r => r.outlet_id === selectedOutlet);
      fLy = fLy.filter(r => r.outlet_id === selectedOutlet);
    } else if (selectedRegion !== 'All') {
      fCurrent = fCurrent.filter(r => r.outlets?.region === selectedRegion);
      fLy = fLy.filter(r => r.outlets?.region === selectedRegion);
    }

    processChartData(fCurrent, fLy, finalCompStart);
    setLoading(false);
    setTimeout(() => setAnimateChart(true), 100);
  };

  const processChartData = (current: any[], lastYear: any[], compStart: string) => {
    let grouped: any = {};
    let sumSales = 0, sumComp = 0, sumBev = 0;

    const startObj = new Date(dateRange.start);
    const endObj = new Date(dateRange.end);
    const compStartObj = new Date(compStart);
    const diffDays = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const currentD = new Date(startObj); currentD.setDate(currentD.getDate() + i);
      const compareD = new Date(compStartObj); compareD.setDate(compareD.getDate() + i);
      const key = currentD.toISOString().split('T')[0];

      grouped[key] = {
        label: currentD.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        compareDate: compareD.toISOString().split('T')[0],
        current: 0,
        comparison: 0,
        currentTC: 0,
        comparisonTC: 0,
        beverages: 0
      };
    }

    current.forEach(r => {
      const key = r.date.split('T')[0];
      if (grouped[key]) {
        grouped[key].current += r.total_sales;
        grouped[key].currentTC += (r.transaction_count || 0);
        grouped[key].beverages += (r.beverages || 0);
        sumSales += r.total_sales;
        sumBev += (r.beverages || 0);
      }
    });

    lastYear.forEach(r => {
      const rDate = r.date.split('T')[0];
      const matchKey = Object.keys(grouped).find(k => grouped[k].compareDate === rDate);
      if (matchKey) {
        grouped[matchKey].comparison += r.total_sales;
        grouped[matchKey].comparisonTC += (r.transaction_count || 0);
        sumComp += r.total_sales;
      }
    });

    setChartData(Object.values(grouped));

    // Calculate Top Outlets
    const outletSales: Record<string, number> = {};
    current.forEach(r => {
      const name = r.outlets?.name || 'Unknown';
      outletSales[name] = (outletSales[name] || 0) + r.total_sales;
    });
    const sortedOutlets = Object.entries(outletSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    setTopOutlets(sortedOutlets);

    setTotals({ sales: sumSales, comparison: sumComp, variance: sumSales - sumComp, beverages: sumBev });
  };

  const formatExact = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const maxValue = chartData.reduce((max, item) => Math.max(max, item.current, item.comparison), 0) * 1.1 || 1000;
  const avgBevPercent = totals.sales > 0 ? (totals.beverages / totals.sales) * 100 : 0;

  const filteredTableData = showLowBevOnly
    ? chartData.filter(row => row.current > 0 && (row.beverages / row.current) * 100 < 10)
    : chartData;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* --- MAIN HEADER --- */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales <span className="text-green-600">Performance</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regional Performance Overview</p>
        </div>

        {/* --- FILTERS (Now including Low Bev toggle) --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col xl:flex-row gap-6">
          <div className="md:col-span-1">
            <DateRangePicker
              label="Current Period"
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={(range) => setDateRange({ start: range.start, end: range.end })}
            />
          </div>

          <div className={`md:col-span-1 transition-opacity ${!isManualCompare ? 'opacity-50' : 'opacity-100'}`}>
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><IconCalendar /> Last Year</label>
                <button onClick={() => setIsManualCompare(!isManualCompare)} className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors">
                  {isManualCompare ? 'Manual' : 'Auto'}
                </button>
              </div>
              <DateRangePicker
                startDate={compareRange.start}
                endDate={compareRange.end}
                onChange={(range) => setCompareRange({ start: range.start, end: range.end })}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Region</p>
              <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedOutlet('All'); }} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                <option value="All">All Regions</option>
                {Array.from(new Set(outlets.map(o => o.region))).map(r => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Outlet</p>
              <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                <option value="All">All Outlets</option>
                {outlets.filter(o => selectedRegion === 'All' || o.region === selectedRegion).map(o => (<option key={o.id} value={o.id}>{o.name}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* --- METRICS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><IconTrendingUp /> Total Sales</p>
            <h2 className="text-3xl font-black text-slate-900">RM {formatExact(totals.sales)}</h2>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className={`px-2 py-1 rounded text-[10px] font-black ${totals.variance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {totals.comparison > 0 ? ((totals.variance / totals.comparison) * 100).toFixed(1) + '%' : '0.0%'}
              </div>
              <p className="text-[11px] font-black text-slate-400">{formatExact(totals.variance)} VAR</p>
            </div>
          </div>



          {/* --- TOP PERFORMERS (New) --- */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">Top Outlets</p>
            <div className="flex-1 min-h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOutlets} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '10px' }} formatter={(val: any) => [`RM ${Number(val).toLocaleString()}`, '']} />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#F1F5F9' }}>
                    {topOutlets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- STACKED CHART (Audited) --- */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Trend View</h3>
              <div className="flex gap-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-[8px] font-bold">TOTAL</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full"></div><span className="text-[8px] font-bold">LY</span></div>
              </div>
            </div>
            <div className="h-32 w-full flex items-end gap-[1px]">
              {chartData.map((item, i) => {
                const totalHeight = (item.current / maxValue) * 100;
                const bevHeight = item.current > 0 ? (item.beverages / item.current) * 100 : 0;
                const lyHeight = (item.comparison / maxValue) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-2xl z-50 pointer-events-none min-w-[140px]">
                      <p className="font-bold border-b border-white/20 pb-1 mb-1 text-center">{item.label}</p>
                      <p className="text-blue-300 font-bold">Total: RM {formatExact(item.current)}</p>
                      <p className="text-purple-400 font-bold">└ Bev: RM {formatExact(item.beverages)}</p>
                      <p className="text-amber-300">LY: RM {formatExact(item.comparison)}</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-[1px] h-full">
                      {/* LY (Amber) */}
                      <div style={{ height: animateChart ? `${lyHeight}%` : '0%' }} className="w-1/2 bg-amber-400/60 rounded-t-sm transition-all duration-700"></div>

                      {/* Current (Blue) */}
                      <div style={{ height: animateChart ? `${totalHeight}%` : '0%' }} className="w-1/2 bg-blue-500 rounded-t-sm transition-all duration-700"></div>
                    </div>
                    <div className="text-[8px] font-black text-slate-300 mt-2 text-center uppercase">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- DETAILED TABLE --- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 border-r border-slate-50">Date Period</th>
                  <th className="px-4 py-4 text-right text-blue-700">Current Sales</th>
                  <th className="px-4 py-4 text-right text-amber-700">Last Year</th>
                  <th className="px-4 py-4 text-right border-r border-slate-50">Sales Var</th>
                  <th className="px-4 py-4 text-center font-black">TC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTableData.map((row, i) => {
                  const salesVar = row.current - row.comparison;
                  const dailyBevPercent = row.current > 0 ? (row.beverages / row.current) * 100 : 0;
                  return (
                    <tr key={i} className={`transition-colors ${showLowBevOnly ? 'bg-orange-50/20' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <p className="font-bold text-slate-800 text-xs">{row.label}</p>
                        <p className="text-[9px] text-slate-400 font-medium">vs {row.compareDate}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-blue-700 text-xs">RM {formatExact(row.current)}</td>
                      <td className="px-4 py-4 text-right font-black text-amber-600 text-xs">RM {formatExact(row.comparison)}</td>
                      <td className={`px-4 py-4 text-right font-black border-r border-slate-50 text-xs ${salesVar < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {salesVar > 0 ? '+' : ''}{formatExact(salesVar)}
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-slate-600 text-xs">{row.currentTC.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div >
  );
}