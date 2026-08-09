'use client';

import { useState } from 'react';
import { BarChart3, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailyAnalytics = [
  { metric: 'Total Visitors', value: 1250, change: '+12%', trend: 'up', category: 'Traffic' },
  { metric: 'Page Views', value: 4580, change: '+8%', trend: 'up', category: 'Traffic' },
  { metric: 'Bounce Rate', value: 32, change: '-5%', trend: 'down', category: 'Engagement' },
  { metric: 'Avg. Session Duration', value: 4.2, change: '+15%', trend: 'up', category: 'Engagement' },
  { metric: 'Conversion Rate', value: 3.8, change: '+0.5%', trend: 'up', category: 'Conversion' },
  { metric: 'Cart Abandonment', value: 68, change: '+2%', trend: 'up', category: 'Conversion' },
  { metric: 'Revenue per Visitor', value: 450, change: '+18%', trend: 'up', category: 'Revenue' },
  { metric: 'Avg. Order Value', value: 3500, change: '+10%', trend: 'up', category: 'Revenue' },
];

const periodAnalytics = [
  { period: 'Week 40 (Oct 01 - Oct 07)', visitors: 8500, pageViews: 32000, conversions: 320, revenue: 1120000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', visitors: 9200, pageViews: 35500, conversions: 365, revenue: 1277500 },
  { period: 'Week 42 (Oct 15 - Oct 21)', visitors: 7800, pageViews: 28000, conversions: 285, revenue: 997500 },
];

const monthlyAnalytics = [
  { period: 'October 2023', visitors: 35000, pageViews: 128000, conversions: 1330, revenue: 4655000 },
  { period: 'November 2023', visitors: 42000, pageViews: 155000, conversions: 1680, revenue: 5880000 },
  { period: 'December 2023', visitors: 55000, pageViews: 198000, conversions: 2200, revenue: 7700000 },
];

const quarterlyAnalytics = [
  { period: 'Q1 (Jan - Mar)', visitors: 95000, pageViews: 350000, conversions: 3800, revenue: 13300000 },
  { period: 'Q2 (Apr - Jun)', visitors: 108000, pageViews: 400000, conversions: 4320, revenue: 15120000 },
  { period: 'Q3 (Jul - Sep)', visitors: 120000, pageViews: 445000, conversions: 4800, revenue: 16800000 },
  { period: 'Q4 (Oct - Dec)', visitors: 132000, pageViews: 481000, conversions: 5210, revenue: 18235000 },
];

const yearlyAnalytics = [
  { period: '2022', visitors: 380000, pageViews: 1400000, conversions: 15200, revenue: 53200000 },
  { period: '2023', visitors: 455000, pageViews: 1676000, conversions: 18130, revenue: 63455000 },
];

export default function AnalyticsReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [trendFilter, setTrendFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setCategoryFilter('all'); setTrendFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || categoryFilter !== 'all' || trendFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodAnalytics;
      case 'monthly': return monthlyAnalytics;
      case '3-month': case '6-month': return quarterlyAnalytics;
      case 'yearly': return yearlyAnalytics;
      default: return dailyAnalytics;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.metric.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
        const matchesTrend = trendFilter === 'all' || r.trend === trendFilter;
        return matchesSearch && matchesCat && matchesTrend;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'value-desc') return (b.value || b.revenue) - (a.value || a.revenue);
      if (sortBy === 'value-asc') return (a.value || a.revenue) - (b.value || b.revenue);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Analytics Report as ${format.toUpperCase()}`);

  const formatValue = (metric: string, value: number) => {
    if (metric.includes('Rate') || metric.includes('Bounce') || metric.includes('Abandonment')) return `${value}%`;
    if (metric.includes('Duration')) return `${value} min`;
    if (metric.includes('Revenue') || metric.includes('Order Value')) return value.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return value.toLocaleString();
  };

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><BarChart3 className="w-8 h-8 text-blue-600" /> Analytics Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Traffic, engagement, conversion rates, and performance metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={() => handleDownload('csv')} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => handleDownload('excel')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-md"><Download className="w-4 h-4" /> Excel</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Search className="h-5 w-5" /></div>
          <input type="text" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none" />
        </div>
        <button onClick={() => setIsFilterOpen(true)} className="flex items-center justify-center px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative sm:ml-auto" title="Filter & Sort">
          <Filter className="w-5 h-5" /><span>Filters</span>
          {hasActiveFilters && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
              {reportPeriod === 'daily' ? (
                <tr><th className="px-6 py-4">Metric</th><th className="px-6 py-4">Category</th><th className="px-6 py-4 text-right">Value</th><th className="px-6 py-4 text-center">Change</th><th className="px-6 py-4 text-center">Trend</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-center">Visitors</th><th className="px-6 py-4 text-center">Page Views</th><th className="px-6 py-4 text-center">Conversions</th><th className="px-6 py-4 text-right">Revenue (LKR)</th></tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.metric}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{row.category}</span></td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{formatValue(row.metric, row.value)}</td>
                    <td className="px-6 py-4 text-center font-bold"><span className={row.change.startsWith('+') && !row.metric.includes('Bounce') && !row.metric.includes('Abandonment') ? 'text-emerald-600 dark:text-emerald-400' : row.change.startsWith('-') && (row.metric.includes('Bounce') || row.metric.includes('Abandonment')) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{row.change}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase ${row.trend === 'up' && !row.metric.includes('Bounce') && !row.metric.includes('Abandonment') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : row.trend === 'down' && (row.metric.includes('Bounce') || row.metric.includes('Abandonment')) ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>▲ {row.trend}</span></td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.visitors.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.pageViews.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{row.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Showing {filtered.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed font-medium">Prev</button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Analytics" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={setReportPeriod} options={[{ value: 'daily', label: 'Daily' },{ value: 'weekly', label: 'Weekly' },{ value: 'monthly', label: 'Monthly' },{ value: '3-month', label: '3-Months' },{ value: '6-month', label: '6-Months' },{ value: 'yearly', label: 'Yearly' }]} /></div>
        {reportPeriod === 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label><input type="date" max={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white" /></div>)}
        {reportPeriod !== 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label><CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} /></div>)}
        {reportPeriod === 'weekly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label><CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} /></div>)}
        {reportPeriod === 'monthly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} /></div>)}
        {reportPeriod === '3-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} /></div>)}
        {reportPeriod === '6-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} /></div>)}
        {reportPeriod === 'daily' && (<>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Category</label><CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All Categories' },{ value: 'Traffic', label: 'Traffic' },{ value: 'Engagement', label: 'Engagement' },{ value: 'Conversion', label: 'Conversion' },{ value: 'Revenue', label: 'Revenue' }]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Trend</label><CustomSelect value={trendFilter} onChange={setTrendFilter} options={[{ value: 'all', label: 'All Trends' },{ value: 'up', label: 'Trending Up' },{ value: 'down', label: 'Trending Down' }]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'value-desc', label: 'Value (Highest)' },{ value: 'value-asc', label: 'Value (Lowest)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
