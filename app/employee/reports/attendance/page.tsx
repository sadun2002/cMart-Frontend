'use client';

import { useState } from 'react';
import { Clock, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

const dailyAttendance = [
  { name: 'Kamal Perera', dept: 'Sales', checkIn: '08:05 AM', checkOut: '05:00 PM', hours: '8h 55m', status: 'Present' },
  { name: 'Nimal Silva', dept: 'Management', checkIn: '08:15 AM', checkOut: '05:30 PM', hours: '9h 15m', status: 'Late' },
  { name: 'Sunil Samaranayake', dept: 'Sales', checkIn: '-', checkOut: '-', hours: '-', status: 'Absent' },
  { name: 'Dilan Jayawardena', dept: 'Sales', checkIn: '08:30 AM', checkOut: '05:00 PM', hours: '8h 30m', status: 'Late' },
  { name: 'Amara Pereira', dept: 'Management', checkIn: '08:00 AM', checkOut: '05:00 PM', hours: '9h 00m', status: 'Present' },
];

const periodAttendance = [
  { period: 'Week 40 (Oct 01 - Oct 07)', totalStaff: 50, presentDays: 225, lateDays: 18, absentDays: 7, attendanceRate: '90%' },
  { period: 'Week 41 (Oct 08 - Oct 14)', totalStaff: 50, presentDays: 230, lateDays: 15, absentDays: 5, attendanceRate: '92%' },
  { period: 'Week 42 (Oct 15 - Oct 21)', totalStaff: 50, presentDays: 220, lateDays: 20, absentDays: 10, attendanceRate: '88%' },
];

const monthlyAttendance = [
  { period: 'October 2023', totalStaff: 50, presentDays: 950, lateDays: 65, absentDays: 35, attendanceRate: '90.5%' },
  { period: 'November 2023', totalStaff: 52, presentDays: 1010, lateDays: 58, absentDays: 32, attendanceRate: '91.8%' },
  { period: 'December 2023', totalStaff: 54, presentDays: 1050, lateDays: 70, absentDays: 40, attendanceRate: '90.5%' },
];

const quarterlyAttendance = [
  { period: 'Q1 (Jan - Mar)', totalStaff: 45, presentDays: 2700, lateDays: 180, absentDays: 120, attendanceRate: '90%' },
  { period: 'Q2 (Apr - Jun)', totalStaff: 48, presentDays: 2880, lateDays: 165, absentDays: 95, attendanceRate: '92%' },
  { period: 'Q3 (Jul - Sep)', totalStaff: 50, presentDays: 3000, lateDays: 200, absentDays: 100, attendanceRate: '91%' },
  { period: 'Q4 (Oct - Dec)', totalStaff: 54, presentDays: 3240, lateDays: 195, absentDays: 105, attendanceRate: '91.5%' },
];

const yearlyAttendance = [
  { period: '2022', totalStaff: 42, presentDays: 10080, lateDays: 650, absentDays: 420, attendanceRate: '90.4%' },
  { period: '2023', totalStaff: 54, presentDays: 12960, lateDays: 740, absentDays: 460, attendanceRate: '91.5%' },
];

export default function AttendanceReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const clearFilters = () => {
    setReportPeriod('daily'); setSelectedDate('2023-10-01'); setSelectedWeek('2023-W40'); setSelectedMonth('2023-10'); setSelectedYear('2023');
    setStatusFilter('all'); setDeptFilter('all'); setSortBy('default');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || statusFilter !== 'all' || deptFilter !== 'all' || sortBy !== 'default';

  const getRawData = () => {
    switch (reportPeriod) {
      case 'weekly': return periodAttendance;
      case 'monthly': return monthlyAttendance;
      case '3-month': case '6-month': return quarterlyAttendance;
      case 'yearly': return yearlyAttendance;
      default: return dailyAttendance;
    }
  };

  const filtered = getRawData()
    .filter((r: any) => {
      if (reportPeriod === 'daily') {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesDept = deptFilter === 'all' || r.dept === deptFilter;
        return matchesSearch && matchesStatus && matchesDept;
      }
      return Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Attendance Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Clock className="w-8 h-8 text-blue-600" /> Attendance Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Employee check-in/out times, late arrivals, and absences.</p>
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
                <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Department</th><th className="px-6 py-4">Check In</th><th className="px-6 py-4">Check Out</th><th className="px-6 py-4">Hours</th><th className="px-6 py-4">Status</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Period / Range</th><th className="px-6 py-4 text-center">Total Staff</th><th className="px-6 py-4 text-center">Present Days</th><th className="px-6 py-4 text-center">Late Days</th><th className="px-6 py-4 text-center">Absent Days</th><th className="px-6 py-4 text-center">Attendance Rate</th></tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-slate-500">{row.dept}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.checkIn}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.checkOut}</td>
                    <td className="px-6 py-4 text-slate-500">{row.hours}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : row.status === 'Late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{row.status}</span></td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.period}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.totalStaff}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{row.presentDays}</td>
                    <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400 font-bold">{row.lateDays}</td>
                    <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-bold">{row.absentDays}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{row.attendanceRate}</span></td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Attendance" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Report Period</label>
          <CustomSelect value={reportPeriod} onChange={setReportPeriod} options={[{ value: 'daily', label: 'Daily' },{ value: 'weekly', label: 'Weekly' },{ value: 'monthly', label: 'Monthly' },{ value: '3-month', label: '3-Months' },{ value: '6-month', label: '6-Months' },{ value: 'yearly', label: 'Yearly' }]} /></div>
        {reportPeriod === 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Date</label><input type="date" max={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white" /></div>)}
        {reportPeriod !== 'daily' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Year</label><CustomSelect value={selectedYear} onChange={setSelectedYear} options={getYearOptions()} /></div>)}
        {reportPeriod === 'weekly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Week</label><CustomSelect value={selectedWeek} onChange={setSelectedWeek} options={getWeekOptions(selectedYear)} /></div>)}
        {reportPeriod === 'monthly' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Month</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getMonthOptions(selectedYear)} /></div>)}
        {reportPeriod === '3-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Quarter</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getQuarterOptions(selectedYear)} /></div>)}
        {reportPeriod === '6-month' && (<div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Select Half</label><CustomSelect value={selectedMonth} onChange={setSelectedMonth} options={getHalfYearOptions(selectedYear)} /></div>)}
        {reportPeriod === 'daily' && (<>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Status</label><CustomSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All Statuses' },{ value: 'Present', label: 'Present' },{ value: 'Late', label: 'Late' },{ value: 'Absent', label: 'Absent' }]} /></div>
          <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Department</label><CustomSelect value={deptFilter} onChange={setDeptFilter} options={[{ value: 'all', label: 'All Departments' },...Array.from(new Set(dailyAttendance.map(d => d.dept))).map(d => ({ value: d, label: d }))]} /></div>
        </>)}
        <div className="space-y-3"><label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label><CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'default', label: 'Default' },{ value: 'name-asc', label: 'Name (A-Z)' }]} /></div>
      </FilterPanel>
    </div>
  );
}
