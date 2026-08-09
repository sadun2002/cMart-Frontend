'use client';

import { useState } from 'react';
import { Truck, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailySuppliers = [
  { id: 'SUP-01', name: 'Acme Corp', contact: '0112345678', orders: 15, outstanding: 45000, status: 'Active', category: 'Electronics' },
  { id: 'SUP-02', name: 'Global Tech', contact: '0771234567', orders: 8, outstanding: 0, status: 'Active', category: 'Electronics' },
  { id: 'SUP-03', name: 'Fresh Mart', contact: '0113456789', orders: 22, outstanding: 12000, status: 'Active', category: 'Groceries' },
  { id: 'SUP-04', name: 'Lanka Imports', contact: '0112211223', orders: 4, outstanding: 0, status: 'Inactive', category: 'Groceries' },
  { id: 'SUP-05', name: 'Sunrise Traders', contact: '0777654321', orders: 11, outstanding: 78000, status: 'Active', category: 'Wholesale' },
];

const periodSuppliers = [
  { period: 'Week 40 (Oct 01 - Oct 07)', activeSuppliers: 12, ordersPlaced: 15, totalPurchases: 345000, totalOutstanding: 135000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', activeSuppliers: 14, ordersPlaced: 18, totalPurchases: 480000, totalOutstanding: 95000 },
  { period: 'Week 42 (Oct 15 - Oct 21)', activeSuppliers: 10, ordersPlaced: 12, totalPurchases: 290000, totalOutstanding: 80000 },
];

const monthlySuppliers = [
  { period: 'October 2023', activeSuppliers: 18, ordersPlaced: 58, totalPurchases: 1450000, totalOutstanding: 135000 },
  { period: 'November 2023', activeSuppliers: 20, ordersPlaced: 65, totalPurchases: 1820000, totalOutstanding: 95000 },
  { period: 'December 2023', activeSuppliers: 22, ordersPlaced: 72, totalPurchases: 2150000, totalOutstanding: 80000 },
];

const quarterlySuppliers = [
  { period: 'Q1 (Jan - Mar)', activeSuppliers: 20, ordersPlaced: 180, totalPurchases: 4800000, totalOutstanding: 320000 },
  { period: 'Q2 (Apr - Jun)', activeSuppliers: 22, ordersPlaced: 195, totalPurchases: 5200000, totalOutstanding: 280000 },
  { period: 'Q3 (Jul - Sep)', activeSuppliers: 24, ordersPlaced: 210, totalPurchases: 5800000, totalOutstanding: 250000 },
  { period: 'Q4 (Oct - Dec)', activeSuppliers: 23, ordersPlaced: 205, totalPurchases: 5650000, totalOutstanding: 310000 },
];

const yearlySuppliers = [
  { period: '2022', activeSuppliers: 28, ordersPlaced: 740, totalPurchases: 21000000, totalOutstanding: 450000 },
  { period: '2023', activeSuppliers: 32, ordersPlaced: 820, totalPurchases: 24500000, totalOutstanding: 310000 },
];

export default function SuppliersReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setStatusFilter('all'); setCategoryFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || statusFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodSuppliers;
      case 'monthly': return monthlySuppliers;
      case '3-month': case '6-month': return quarterlySuppliers;
      case 'yearly': return yearlySuppliers;
      default: return dailySuppliers;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCat;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'amount-desc') return (b.outstanding || b.totalOutstanding) - (a.outstanding || a.totalOutstanding);
      if (sortBy === 'amount-asc') return (a.outstanding || a.totalOutstanding) - (b.outstanding || b.totalOutstanding);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Supplier Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Truck className="w-8 h-8 text-blue-600" /> Supplier Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Supplier details, outstanding balances, and order history.</p>
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
                <tr>
                  <th className="px-6 py-4">Supplier ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Orders</th><th className="px-6 py-4 text-right">Outstanding (LKR)</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-center">Active Suppliers</th><th className="px-6 py-4 text-center">Orders Placed</th><th className="px-6 py-4 text-right">Total Purchases (LKR)</th><th className="px-6 py-4 text-right">Outstanding (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.id}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.contact}</td>
                    <td className="px-6 py-4 text-slate-500">{row.category}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{row.status}</span></td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{row.orders}</td>
                    <td className="px-6 py-4 text-right font-black"><span className={row.outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>{row.outstanding > 0 ? row.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'Cleared'}</span></td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.activeSuppliers}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.ordersPlaced}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.totalPurchases.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-bold">{row.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Suppliers" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={setReportPeriod} options={[{ value: 'daily', label: 'Daily' },{ value: 'weekly', label: 'Weekly' },{ value: 'monthly', label: 'Monthly' },{ value: '3-month', label: '3-Months' },{ value: '6-month', label: '6-Months' },{ value: 'yearly', label: 'Yearly' }]} /></div>
        {reportPeriod === 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label><input type="date" max={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white" /></div>)}
        {reportPeriod !== 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label><CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} /></div>)}
        {reportPeriod === 'weekly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label><CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} /></div>)}
        {reportPeriod === 'monthly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} /></div>)}
        {reportPeriod === '3-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} /></div>)}
        {reportPeriod === '6-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} /></div>)}
        {reportPeriod === 'daily' && (<>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Status</label><CustomSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All' },{ value: 'Active', label: 'Active' },{ value: 'Inactive', label: 'Inactive' }]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Category</label><CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All Categories' },...Array.from(new Set(dailySuppliers.map(d => d.category))).map(c => ({ value: c, label: c }))]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'amount-desc', label: 'Outstanding (Highest)' },{ value: 'amount-asc', label: 'Outstanding (Lowest)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
