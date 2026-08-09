'use client';

import { useState } from 'react';
import { DollarSign, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailyFinancial = [
  { id: 'TXN-101', date: '2023-10-01', type: 'Revenue', category: 'In-Store Sales', description: 'Daily POS revenue', amount: 125000, balance: 3250000 },
  { id: 'TXN-102', date: '2023-10-01', type: 'Expense', category: 'Rent', description: 'Monthly rent payment', amount: -150000, balance: 3100000 },
  { id: 'TXN-103', date: '2023-10-01', type: 'Revenue', category: 'Online Sales', description: 'Online store revenue', amount: 45000, balance: 3145000 },
  { id: 'TXN-104', date: '2023-10-01', type: 'Expense', category: 'Utilities', description: 'Electricity bill', amount: -22000, balance: 3123000 },
  { id: 'TXN-105', date: '2023-10-01', type: 'Expense', category: 'Salaries', description: 'Staff salaries', amount: -580000, balance: 2543000 },
];

const periodFinancial = [
  { period: 'Week 40 (Oct 01 - Oct 07)', totalRevenue: 890000, totalExpenses: 420000, netProfit: 470000, profitMargin: '52.8%' },
  { period: 'Week 41 (Oct 08 - Oct 14)', totalRevenue: 1050000, totalExpenses: 380000, netProfit: 670000, profitMargin: '63.8%' },
  { period: 'Week 42 (Oct 15 - Oct 21)', totalRevenue: 780000, totalExpenses: 350000, netProfit: 430000, profitMargin: '55.1%' },
];

const monthlyFinancial = [
  { period: 'October 2023', totalRevenue: 3800000, totalExpenses: 1650000, netProfit: 2150000, profitMargin: '56.6%' },
  { period: 'November 2023', totalRevenue: 4200000, totalExpenses: 1800000, netProfit: 2400000, profitMargin: '57.1%' },
  { period: 'December 2023', totalRevenue: 5100000, totalExpenses: 2100000, netProfit: 3000000, profitMargin: '58.8%' },
];

const quarterlyFinancial = [
  { period: 'Q1 (Jan - Mar)', totalRevenue: 10500000, totalExpenses: 4800000, netProfit: 5700000, profitMargin: '54.3%' },
  { period: 'Q2 (Apr - Jun)', totalRevenue: 11800000, totalExpenses: 5200000, netProfit: 6600000, profitMargin: '55.9%' },
  { period: 'Q3 (Jul - Sep)', totalRevenue: 12500000, totalExpenses: 5500000, netProfit: 7000000, profitMargin: '56.0%' },
  { period: 'Q4 (Oct - Dec)', totalRevenue: 13100000, totalExpenses: 5550000, netProfit: 7550000, profitMargin: '57.6%' },
];

const yearlyFinancial = [
  { period: '2022', totalRevenue: 42000000, totalExpenses: 20000000, netProfit: 22000000, profitMargin: '52.4%' },
  { period: '2023', totalRevenue: 48000000, totalExpenses: 21000000, netProfit: 27000000, profitMargin: '56.3%' },
];

export default function FinancialReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setTypeFilter('all'); setCategoryFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || typeFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodFinancial;
      case 'monthly': return monthlyFinancial;
      case '3-month': case '6-month': return quarterlyFinancial;
      case 'yearly': return yearlyFinancial;
      default: return dailyFinancial;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.description.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || r.type === typeFilter;
        const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
        return matchesSearch && matchesType && matchesCat;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'amount-desc') return Math.abs(b.amount || b.netProfit) - Math.abs(a.amount || a.netProfit);
      if (sortBy === 'amount-asc') return Math.abs(a.amount || a.netProfit) - Math.abs(b.amount || b.netProfit);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Financial Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><DollarSign className="w-8 h-8 text-blue-600" /> Financial Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Revenue, expenses, profit margins, and cash flow analysis.</p>
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
                <tr><th className="px-6 py-4">Txn ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Description</th><th className="px-6 py-4 text-right">Amount (LKR)</th><th className="px-6 py-4 text-right">Balance (LKR)</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-right">Revenue (LKR)</th><th className="px-6 py-4 text-right">Expenses (LKR)</th><th className="px-6 py-4 text-right">Net Profit (LKR)</th><th className="px-6 py-4 text-center">Margin</th></tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.id}</td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.type === 'Revenue' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{row.type}</span></td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.category}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.description}</td>
                    <td className="px-6 py-4 text-right font-black"><span className={row.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{row.amount >= 0 ? '+' : ''}{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-black">{row.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-bold">{row.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{row.profitMargin}</span></td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Financial" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={setReportPeriod} options={[{ value: 'daily', label: 'Daily' },{ value: 'weekly', label: 'Weekly' },{ value: 'monthly', label: 'Monthly' },{ value: '3-month', label: '3-Months' },{ value: '6-month', label: '6-Months' },{ value: 'yearly', label: 'Yearly' }]} /></div>
        {reportPeriod === 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label><input type="date" max={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white" /></div>)}
        {reportPeriod !== 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label><CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} /></div>)}
        {reportPeriod === 'weekly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label><CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} /></div>)}
        {reportPeriod === 'monthly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} /></div>)}
        {reportPeriod === '3-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} /></div>)}
        {reportPeriod === '6-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} /></div>)}
        {reportPeriod === 'daily' && (<>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Type</label><CustomSelect value={typeFilter} onChange={setTypeFilter} options={[{ value: 'all', label: 'All Types' },{ value: 'Revenue', label: 'Revenue' },{ value: 'Expense', label: 'Expense' }]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Category</label><CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All Categories' },...Array.from(new Set(dailyFinancial.map(d => d.category))).map(c => ({ value: c, label: c }))]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'amount-desc', label: 'Amount (Highest)' },{ value: 'amount-asc', label: 'Amount (Lowest)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
