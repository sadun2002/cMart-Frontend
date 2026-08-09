'use client';

import { useState } from 'react';
import { ShoppingCart, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

// Mock data structured by periods
const dailyPurchases = [
  { id: 'PO-2001', time: '10:00 AM', supplier: 'Acme Corp', items: '20x Wireless Mouse', status: 'Received', total: 30000 },
  { id: 'PO-2002', time: '11:30 AM', supplier: 'Global Tech', items: '10x Mechanical Keyboard', status: 'Pending', total: 85000 },
  { id: 'PO-2003', time: '02:00 PM', supplier: 'Fresh Mart', items: '500kg Rice', status: 'Received', total: 45000 },
  { id: 'PO-2004', time: '04:15 PM', supplier: 'Acme Corp', items: '10x USB Hub', status: 'Pending', total: 10000 },
];

const periodPurchases = [
  { period: 'Week 40 (Oct 01 - Oct 07)', orderCount: 15, receivedCount: 12, pendingCount: 3, totalAmount: 345000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', orderCount: 18, receivedCount: 15, pendingCount: 3, totalAmount: 480000 },
  { period: 'Week 42 (Oct 15 - Oct 21)', orderCount: 12, receivedCount: 10, pendingCount: 2, totalAmount: 290000 },
];

const monthlyPurchases = [
  { period: 'October 2023', orderCount: 58, receivedCount: 52, pendingCount: 6, totalAmount: 1450000 },
  { period: 'November 2023', orderCount: 65, receivedCount: 60, pendingCount: 5, totalAmount: 1820000 },
  { period: 'December 2023', orderCount: 72, receivedCount: 68, pendingCount: 4, totalAmount: 2150000 },
];

const quarterlyPurchases = [
  { period: 'Q1 (Jan - Mar)', orderCount: 180, receivedCount: 170, pendingCount: 10, totalAmount: 4800000 },
  { period: 'Q2 (Apr - Jun)', orderCount: 195, receivedCount: 185, pendingCount: 10, totalAmount: 5200000 },
  { period: 'Q3 (Jul - Sep)', orderCount: 210, receivedCount: 200, pendingCount: 10, totalAmount: 5800000 },
  { period: 'Q4 (Oct - Dec)', orderCount: 205, receivedCount: 195, pendingCount: 10, totalAmount: 5650000 },
];

const yearlyPurchases = [
  { period: '2022', orderCount: 740, receivedCount: 710, pendingCount: 30, totalAmount: 21000000 },
  { period: '2023', orderCount: 820, receivedCount: 790, pendingCount: 30, totalAmount: 24500000 },
];

export default function PurchaseReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Period state
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily');
    setSelectedDate('2023-10-01');
    setSelectedWeek('2023-W40');
    setSelectedMonth('2023-10');
    setSelectedYear('2023');
    setStatusFilter('all');
    setSupplierFilter('all');
    setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || statusFilter !== 'all' || supplierFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodPurchases;
      case 'monthly': return monthlyPurchases;
      case '3-month':
      case '6-month': return quarterlyPurchases;
      case 'yearly': return yearlyPurchases;
      default: return dailyPurchases;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.supplier.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSupplier = supplierFilter === 'all' || r.supplier === supplierFilter;
        return matchesSearch && matchesStatus && matchesSupplier;
      }
      const valStr = Object.values(r).join(' ').toLowerCase();
      return valStr.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'amount-desc') return (b.total || b.totalAmount) - (a.total || a.totalAmount);
      if (sortBy === 'amount-asc') return (a.total || a.totalAmount) - (b.total || b.totalAmount);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Purchase Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" /> Purchase Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Supplier purchases, outstanding balances, and order history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={() => handleDownload('csv')} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => handleDownload('excel')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-md"><Download className="w-4 h-4" /> Excel</button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative sm:ml-auto"
          title="Filter & Sort"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
              {reportPeriod === 'daily' ? (
                <tr>
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Order Time</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount (LKR)</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Period / Range</th>
                  <th className="px-6 py-4 text-center">Orders Count</th>
                  <th className="px-6 py-4 text-center">Received Orders</th>
                  <th className="px-6 py-4 text-center">Pending Orders</th>
                  <th className="px-6 py-4 text-right">Total Value (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.id}</td>
                    <td className="px-6 py-4 text-slate-500">{row.time}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.supplier}</td>
                    <td className="px-6 py-4 text-slate-500">{row.items}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.status === 'Received' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.orderCount}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{row.receivedCount}</td>
                    <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400 font-bold">{row.pendingCount}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Purchases" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        {/* Report Period Filter */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={(val) => setReportPeriod(val)} options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: '3-month', label: '3-Months' },
            { value: '6-month', label: '6-Months' },
            { value: 'yearly', label: 'Yearly' },
          ]} />
        </div>

        {/* Dynamic Period sub-selection */}
        {reportPeriod === 'daily' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label>
            <input
              type="date" max={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
            />
          </div>
        )}

        {reportPeriod !== 'daily' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label>
            <CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} />
          </div>
        )}

        {reportPeriod === 'weekly' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label>
            <CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} />
          </div>
        )}

        {reportPeriod === 'monthly' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label>
            <CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} />
          </div>
        )}

        {reportPeriod === '3-month' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label>
            <CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} />
          </div>
        )}

        {reportPeriod === '6-month' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label>
            <CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} />
          </div>
        )}

        {reportPeriod === 'daily' && (
          <>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Status</label>
              <CustomSelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Received', label: 'Received' },
                { value: 'Pending', label: 'Pending' },
              ]} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Supplier</label>
              <CustomSelect value={supplierFilter} onChange={setSupplierFilter} options={[
                { value: 'all', label: 'All Suppliers' },
                ...Array.from(new Set(dailyPurchases.map(d => d.supplier))).map(s => ({ value: s, label: s }))
              ]} />
            </div>
          </>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
          <CustomSelect value={sortBy} onChange={setSortBy} options={[
            { value: 'default', label: 'Default' },
            { value: 'amount-desc', label: 'Amount (Highest First)' },
            { value: 'amount-asc', label: 'Amount (Lowest First)' },
          ]} />
        </div>
      </FilterPanel>
    </div>
  );
}
