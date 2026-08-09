'use client';

import { useState } from 'react';
import { UserCheck, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailyEmployees = [
  { id: 'EMP-01', name: 'Kamal Perera', role: 'Cashier', dept: 'Sales', joined: '2022-01-15', status: 'Active' },
  { id: 'EMP-02', name: 'Nimal Silva', role: 'Manager', dept: 'Management', joined: '2021-06-10', status: 'Active' },
  { id: 'EMP-03', name: 'Sunil Samaranayake', role: 'Sales', dept: 'Sales', joined: '2023-02-20', status: 'Inactive' },
  { id: 'EMP-04', name: 'Dilan Jayawardena', role: 'Cashier', dept: 'Sales', joined: '2024-01-05', status: 'Active' },
  { id: 'EMP-05', name: 'Amara Pereira', role: 'Supervisor', dept: 'Management', joined: '2022-08-12', status: 'Active' },
];

const periodEmployees = [
  { period: 'Week 40 (Oct 01 - Oct 07)', activeCount: 48, newHires: 2, terminated: 0, totalSalary: 580000 },
  { period: 'Week 41 (Oct 08 - Oct 14)', activeCount: 50, newHires: 3, terminated: 1, totalSalary: 600000 },
  { period: 'Week 42 (Oct 15 - Oct 21)', activeCount: 50, newHires: 0, terminated: 0, totalSalary: 600000 },
];

const monthlyEmployees = [
  { period: 'October 2023', activeCount: 50, newHires: 5, terminated: 1, totalSalary: 2400000 },
  { period: 'November 2023', activeCount: 52, newHires: 3, terminated: 1, totalSalary: 2500000 },
  { period: 'December 2023', activeCount: 54, newHires: 4, terminated: 2, totalSalary: 2600000 },
];

const quarterlyEmployees = [
  { period: 'Q1 (Jan - Mar)', activeCount: 45, newHires: 8, terminated: 3, totalSalary: 6800000 },
  { period: 'Q2 (Apr - Jun)', activeCount: 48, newHires: 6, terminated: 3, totalSalary: 7200000 },
  { period: 'Q3 (Jul - Sep)', activeCount: 50, newHires: 5, terminated: 3, totalSalary: 7500000 },
  { period: 'Q4 (Oct - Dec)', activeCount: 54, newHires: 12, terminated: 4, totalSalary: 7800000 },
];

const yearlyEmployees = [
  { period: '2022', activeCount: 42, newHires: 18, terminated: 8, totalSalary: 25000000 },
  { period: '2023', activeCount: 54, newHires: 31, terminated: 13, totalSalary: 30000000 },
];

export default function EmployeesReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setStatusFilter('all'); setRoleFilter('all'); setDeptFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || statusFilter !== 'all' || roleFilter !== 'all' || deptFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodEmployees;
      case 'monthly': return monthlyEmployees;
      case '3-month': case '6-month': return quarterlyEmployees;
      case 'yearly': return yearlyEmployees;
      default: return dailyEmployees;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesRole = roleFilter === 'all' || r.role === roleFilter;
        const matchesDept = deptFilter === 'all' || r.dept === deptFilter;
        return matchesSearch && matchesStatus && matchesRole && matchesDept;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'name-asc') return (a.name || a.period).localeCompare(b.name || b.period);
      if (sortBy === 'salary-desc') return (b.totalSalary || 0) - (a.totalSalary || 0);
      return 0;
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Employee Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><UserCheck className="w-8 h-8 text-blue-600" /> Employee Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Staff directory, roles, and active status.</p>
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
                <tr><th className="px-6 py-4">Emp ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th><th className="px-6 py-4">Joined Date</th><th className="px-6 py-4">Status</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-center">Active Staff</th><th className="px-6 py-4 text-center">New Hires</th><th className="px-6 py-4 text-center">Terminated</th><th className="px-6 py-4 text-right">Total Salary (LKR)</th></tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.id}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.role}</td>
                    <td className="px-6 py-4 text-slate-500">{row.dept}</td>
                    <td className="px-6 py-4 text-slate-500">{row.joined}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{row.status}</span></td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.activeCount}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">+{row.newHires}</td>
                    <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-bold">{row.terminated > 0 ? `-${row.terminated}` : '-'}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.totalSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Employees" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
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
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Role</label><CustomSelect value={roleFilter} onChange={setRoleFilter} options={[{ value: 'all', label: 'All Roles' },...Array.from(new Set(dailyEmployees.map(d => d.role))).map(r => ({ value: r, label: r }))]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Department</label><CustomSelect value={deptFilter} onChange={setDeptFilter} options={[{ value: 'all', label: 'All Departments' },...Array.from(new Set(dailyEmployees.map(d => d.dept))).map(d => ({ value: d, label: d }))]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'name-asc', label: 'Name (A-Z)' },{ value: 'salary-desc', label: 'Salary (Highest)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
