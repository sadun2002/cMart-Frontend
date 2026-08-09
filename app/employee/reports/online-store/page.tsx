'use client';

import { useState } from 'react';
import { Globe, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailyOrders = [
  { id: 'ORD-501', time: '09:30 AM', customer: 'Kamal Perera', city: 'Colombo', items: '2x Wireless Mouse, 1x USB Hub', status: 'Delivered', total: 8000 },
  { id: 'ORD-502', time: '11:15 AM', customer: 'Sunil Fernando', city: 'Kandy', items: '1x HD Monitor', status: 'Pending', total: 25000 },
  { id: 'ORD-503', time: '01:45 PM', customer: 'Nimali De Silva', city: 'Galle', items: '3x Coconut Oil 1L', status: 'Delivered', total: 1500 },
  { id: 'ORD-504', time: '03:20 PM', customer: 'Ravi Bandara', city: 'Colombo', items: '1x Mechanical Keyboard', status: 'Processing', total: 8500 },
];

const periodOrders = [
  { period: 'Week 40 (Oct 01 - Oct 07)', orderCount: 45, delivered: 38, pending: 5, cancelled: 2, revenue: 345000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', orderCount: 52, delivered: 44, pending: 6, cancelled: 2, revenue: 480000 },
  { period: 'Week 42 (Oct 15 - Oct 21)', orderCount: 38, delivered: 32, pending: 4, cancelled: 2, revenue: 290000 },
];

const monthlyOrders = [
  { period: 'October 2023', orderCount: 180, delivered: 155, pending: 18, cancelled: 7, revenue: 1450000 },
  { period: 'November 2023', orderCount: 210, delivered: 185, pending: 15, cancelled: 10, revenue: 1820000 },
  { period: 'December 2023', orderCount: 250, delivered: 220, pending: 20, cancelled: 10, revenue: 2150000 },
];

const quarterlyOrders = [
  { period: 'Q1 (Jan - Mar)', orderCount: 520, delivered: 450, pending: 45, cancelled: 25, revenue: 4200000 },
  { period: 'Q2 (Apr - Jun)', orderCount: 580, delivered: 510, pending: 42, cancelled: 28, revenue: 4800000 },
  { period: 'Q3 (Jul - Sep)', orderCount: 640, delivered: 560, pending: 50, cancelled: 30, revenue: 5400000 },
  { period: 'Q4 (Oct - Dec)', orderCount: 620, delivered: 545, pending: 48, cancelled: 27, revenue: 5200000 },
];

const yearlyOrders = [
  { period: '2022', orderCount: 2100, delivered: 1850, pending: 150, cancelled: 100, revenue: 18500000 },
  { period: '2023', orderCount: 2400, delivered: 2100, pending: 185, cancelled: 115, revenue: 22000000 },
];

export default function OnlineStoreReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setStatusFilter('all'); setCityFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || statusFilter !== 'all' || cityFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodOrders;
      case 'monthly': return monthlyOrders;
      case '3-month': case '6-month': return quarterlyOrders;
      case 'yearly': return yearlyOrders;
      default: return dailyOrders;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesCity = cityFilter === 'all' || r.city === cityFilter;
        return matchesSearch && matchesStatus && matchesCity;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'amount-desc') return (b.total || b.revenue) - (a.total || a.revenue);
      if (sortBy === 'amount-asc') return (a.total || a.revenue) - (b.total || b.revenue);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Online Store Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Globe className="w-8 h-8 text-blue-600" /> Online Store Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">E-commerce orders, delivery status, and online revenue.</p>
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
                <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">City</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Total (LKR)</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-center">Total Orders</th><th className="px-6 py-4 text-center">Delivered</th><th className="px-6 py-4 text-center">Pending</th><th className="px-6 py-4 text-center">Cancelled</th><th className="px-6 py-4 text-right">Revenue (LKR)</th></tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.id}</td>
                    <td className="px-6 py-4 text-slate-500">{row.time}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.customer}</td>
                    <td className="px-6 py-4 text-slate-500">{row.city}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : row.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : row.status === 'Processing' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{row.status}</span></td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.orderCount}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{row.delivered}</td>
                    <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400 font-bold">{row.pending}</td>
                    <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-bold">{row.cancelled}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Online Orders" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={setReportPeriod} options={[{ value: 'daily', label: 'Daily' },{ value: 'weekly', label: 'Weekly' },{ value: 'monthly', label: 'Monthly' },{ value: '3-month', label: '3-Months' },{ value: '6-month', label: '6-Months' },{ value: 'yearly', label: 'Yearly' }]} /></div>
        {reportPeriod === 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label><input type="date" max={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white" /></div>)}
        {reportPeriod !== 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label><CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} /></div>)}
        {reportPeriod === 'weekly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label><CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} /></div>)}
        {reportPeriod === 'monthly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} /></div>)}
        {reportPeriod === '3-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} /></div>)}
        {reportPeriod === '6-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} /></div>)}
        {reportPeriod === 'daily' && (<>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Order Status</label><CustomSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All Statuses' },{ value: 'Delivered', label: 'Delivered' },{ value: 'Pending', label: 'Pending' },{ value: 'Processing', label: 'Processing' },{ value: 'Cancelled', label: 'Cancelled' }]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">City</label><CustomSelect value={cityFilter} onChange={setCityFilter} options={[{ value: 'all', label: 'All Cities' },...Array.from(new Set(dailyOrders.map(d => d.city))).map(c => ({ value: c, label: c }))]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'amount-desc', label: 'Revenue (Highest)' },{ value: 'amount-asc', label: 'Revenue (Lowest)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
