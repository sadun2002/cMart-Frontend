'use client';

import { useState } from 'react';
import { Users, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

// Mock data structured by periods
const dailyCustomers = [
  { id: 'CUS-001', name: 'John Doe', phone: '0779998888', city: 'Colombo', visits: 1, spent: 4500, group: 'VIP' },
  { id: 'CUS-002', name: 'Jane Smith', phone: '0712223333', city: 'Kandy', visits: 1, spent: 1250, group: 'Regular' },
  { id: 'CUS-003', name: 'Kamal Perera', phone: '0774445555', city: 'Colombo', visits: 2, spent: 9850, group: 'VIP' },
];

const periodCustomers = [
  { period: 'Week 40 (Oct 01 - Oct 07)', activeCount: 85, newRegistrations: 12, totalVisits: 142, totalSpent: 345000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', activeCount: 94, newRegistrations: 15, totalVisits: 155, totalSpent: 480000 },
  { period: 'Week 42 (Oct 15 - Oct 21)', activeCount: 78, newRegistrations: 9, totalVisits: 128, totalSpent: 290000 },
];

const monthlyCustomers = [
  { period: 'October 2023', activeCount: 320, newRegistrations: 52, totalVisits: 620, totalSpent: 2000000 },
  { period: 'November 2023', activeCount: 350, newRegistrations: 60, totalVisits: 680, totalSpent: 2290000 },
  { period: 'December 2023', activeCount: 380, newRegistrations: 68, totalVisits: 750, totalSpent: 2632000 },
];

const quarterlyCustomers = [
  { period: 'Q1 (Jan - Mar)', activeCount: 950, newRegistrations: 140, totalVisits: 1850, totalSpent: 5800000 },
  { period: 'Q2 (Apr - Jun)', activeCount: 1020, newRegistrations: 165, totalVisits: 1940, totalSpent: 6350000 },
  { period: 'Q3 (Jul - Sep)', activeCount: 1100, newRegistrations: 180, totalVisits: 2100, totalSpent: 6960000 },
  { period: 'Q4 (Oct - Dec)', activeCount: 1080, newRegistrations: 175, totalVisits: 2050, totalSpent: 7000000 },
];

const yearlyCustomers = [
  { period: '2022', activeCount: 3800, newRegistrations: 580, totalVisits: 7800, totalSpent: 23600000 },
  { period: '2023', activeCount: 4200, newRegistrations: 660, totalVisits: 8400, totalSpent: 27900000 },
];

export default function CustomersReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Period state
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [groupFilter, setGroupFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily');
    setSelectedDate('2023-10-01');
    setSelectedWeek('2023-W40');
    setSelectedMonth('2023-10');
    setSelectedYear('2023');
    setGroupFilter('all');
    setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || groupFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodCustomers;
      case 'monthly': return monthlyCustomers;
      case '3-month':
      case '6-month': return quarterlyCustomers;
      case 'yearly': return yearlyCustomers;
      default: return dailyCustomers;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesGroup = groupFilter === 'all' || r.group === groupFilter;
        return matchesSearch && matchesGroup;
      }
      const valStr = Object.values(r).join(' ').toLowerCase();
      return valStr.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'spent-desc') return (b.spent || b.totalSpent) - (a.spent || a.totalSpent);
      if (sortBy === 'spent-asc') return (a.spent || a.totalSpent) - (b.spent || b.totalSpent);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Customer Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Customer Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Customer loyalty, total spent, and visit frequency.</p>
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
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Group</th>
                  <th className="px-6 py-4 text-center">Visits</th>
                  <th className="px-6 py-4 text-right">Spent (LKR)</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Period / Range</th>
                  <th className="px-6 py-4 text-center">Active Customers</th>
                  <th className="px-6 py-4 text-center">New Registrations</th>
                  <th className="px-6 py-4 text-center">Total Visits</th>
                  <th className="px-6 py-4 text-right">Total Spent (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.id}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{row.city}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase ${row.group === 'VIP' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{row.group}</span></td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300 font-bold">{row.visits}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.activeCount}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">+{row.newRegistrations}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.totalVisits}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Customers" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
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
            <label className="text-sm font-bold text-slate-900 dark:text-white">Customer Group</label>
            <CustomSelect value={groupFilter} onChange={setGroupFilter} options={[{ value: 'all', label: 'All Groups' }, { value: 'VIP', label: 'VIP' }, { value: 'Regular', label: 'Regular' }]} />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
          <CustomSelect value={sortBy} onChange={setSortBy} options={[
            { value: 'default', label: 'Default' },
            { value: 'spent-desc', label: 'Spent (Highest First)' },
            { value: 'spent-asc', label: 'Spent (Lowest First)' },
          ]} />
        </div>
      </FilterPanel>
    </div>
  );
}
