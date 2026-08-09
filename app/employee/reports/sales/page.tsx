'use client';

import { useState } from 'react';
import { Receipt, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

// Mock data structured by periods
const dailySales = [
  { id: 'INV-1001', time: '09:15 AM', customer: 'John Doe', items: '2x Wireless Mouse', payMethod: 'Cash', total: 3000 },
  { id: 'INV-1002', time: '10:30 AM', customer: 'Jane Smith', items: '1x Keyboard', payMethod: 'Card', total: 4500 },
  { id: 'INV-1003', time: '12:00 PM', customer: 'Walk-in', items: '1x USB Hub', payMethod: 'Cash', total: 1500 },
  { id: 'INV-1004', time: '02:45 PM', customer: 'Kamal Perera', items: '1x HD Monitor', payMethod: 'Credit', total: 25000 },
];

const weeklySales = [
  { week: 'Week 40 (Oct 01 - Oct 07)', invoiceCount: 142, avgOrderValue: 3200, grossSales: 454400, discount: 14400, netSales: 440000 },
  { week: 'Week 41 (Oct 08 - Oct 14)', invoiceCount: 155, avgOrderValue: 3500, grossSales: 542500, discount: 12500, netSales: 530000 },
  { week: 'Week 42 (Oct 15 - Oct 21)', invoiceCount: 128, avgOrderValue: 3100, grossSales: 396800, discount: 9800, netSales: 387000 },
];

const monthlySales = [
  { month: 'October 2023', invoiceCount: 620, avgOrderValue: 3300, grossSales: 2046000, discount: 46000, netSales: 2000000 },
  { month: 'November 2023', invoiceCount: 680, avgOrderValue: 3450, grossSales: 2346000, discount: 56000, netSales: 2290000 },
  { month: 'December 2023', invoiceCount: 750, avgOrderValue: 3600, grossSales: 2700000, discount: 68000, netSales: 2632000 },
];

const quarterlySales = [
  { period: 'Q1 (Jan - Mar)', invoiceCount: 1850, avgOrderValue: 3200, grossSales: 5920000, discount: 120000, netSales: 5800000 },
  { period: 'Q2 (Apr - Jun)', invoiceCount: 1940, avgOrderValue: 3350, grossSales: 6499000, discount: 149000, netSales: 6350000 },
  { period: 'Q3 (Jul - Sep)', invoiceCount: 2100, avgOrderValue: 3400, grossSales: 7140000, discount: 180000, netSales: 6960000 },
  { period: 'Q4 (Oct - Dec)', invoiceCount: 2050, avgOrderValue: 3500, grossSales: 7175000, discount: 175000, netSales: 7000000 },
];

const yearlySales = [
  { year: '2022', invoiceCount: 7800, avgOrderValue: 3100, grossSales: 24180000, discount: 580000, netSales: 23600000 },
  { year: '2023', invoiceCount: 8400, avgOrderValue: 3400, grossSales: 28560000, discount: 660000, netSales: 27900000 },
];

export default function SalesReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Period state
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  // Other filters
  const [payMethodFilter, setPayMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily');
    setSelectedDate('2023-10-01');
    setSelectedWeek('2023-W40');
    setSelectedMonth('2023-10');
    setSelectedYear('2023');
    setPayMethodFilter('all');
    setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || payMethodFilter !== 'all' || sortBy !== 'default';

  // Get data depending on period
  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return weeklySales;
      case 'monthly': return monthlySales;
      case '3-month':
      case '6-month': return quarterlySales;
      case 'yearly': return yearlySales;
      default: return dailySales;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesPay = payMethodFilter === 'all' || r.payMethod === payMethodFilter;
        return matchesSearch && matchesPay;
      }
      // General search for other periods
      const valStr = Object.values(r).join(' ').toLowerCase();
      return valStr.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'amount-desc') {
        return (b.total || b.netSales) - (a.total || a.netSales);
      }
      if (sortBy === 'amount-asc') {
        return (a.total || a.netSales) - (b.total || b.netSales);
      }
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Sales Report as ${format.toUpperCase()}`);
  const handlePrint = () => window.print();

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-600" /> Sales Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Detailed view of daily sales, invoices, and revenue.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"><Printer className="w-4 h-4" /> Print</button>
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
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4">Pay Method</th>
                  <th className="px-6 py-4 text-right">Total (LKR)</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Period / Range</th>
                  <th className="px-6 py-4 text-center">Invoice Count</th>
                  <th className="px-6 py-4 text-right">Avg Order Value (LKR)</th>
                  <th className="px-6 py-4 text-right">Gross Sales (LKR)</th>
                  <th className="px-6 py-4 text-right">Discounts (LKR)</th>
                  <th className="px-6 py-4 text-right">Net Sales (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.id}</td>
                    <td className="px-6 py-4 text-slate-500">{row.time}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.customer}</td>
                    <td className="px-6 py-4 text-slate-500">{row.items}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold">{row.payMethod}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.week || row.month || row.period || row.year}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.invoiceCount}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-red-500 font-bold">-{row.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-black">{row.netSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Sales"
        onClear={() => { clearFilters(); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
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
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</label>
            <CustomSelect value={payMethodFilter} onChange={setPayMethodFilter} options={[
              { value: 'all', label: 'All Methods' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Credit', label: 'Credit' },
            ]} />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
          <CustomSelect value={sortBy} onChange={setSortBy} options={[
            { value: 'default', label: 'Default' },
            { value: 'amount-desc', label: 'Revenue (Highest First)' },
            { value: 'amount-asc', label: 'Revenue (Lowest First)' },
          ]} />
        </div>
      </FilterPanel>
    </div>
  );
}
