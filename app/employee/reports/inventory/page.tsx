'use client';

import { useState } from 'react';
import { Warehouse, Download, Printer, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { getYearOptions, getMonthOptions, getWeekOptions, getQuarterOptions, getHalfYearOptions } from '@/lib/report-filter-options';

// Mock data structured by periods
const dailyInventory = [
  { sku: 'SKU-001', name: 'Wireless Mouse', category: 'Electronics', stock: 45, unitPrice: 1500, value: 67500 },
  { sku: 'SKU-002', name: 'Mechanical Keyboard', category: 'Electronics', stock: 12, unitPrice: 8500, value: 102000 },
  { sku: 'SKU-003', name: 'HD Monitor', category: 'Electronics', stock: 5, unitPrice: 25000, value: 125000 },
  { sku: 'SKU-004', name: 'Rice 5kg', category: 'Groceries', stock: 200, unitPrice: 450, value: 90000 },
  { sku: 'SKU-05', name: 'USB Hub', category: 'Electronics', stock: 3, unitPrice: 5000, value: 15000 },
];

const periodInventory = [
  { sku: 'SKU-001', name: 'Wireless Mouse', opening: 50, received: 10, sold: 12, adjustments: -3, closing: 45, unitPrice: 1500, value: 67500 },
  { sku: 'SKU-002', name: 'Mechanical Keyboard', opening: 10, received: 5, sold: 3, adjustments: 0, closing: 12, unitPrice: 8500, value: 102000 },
  { sku: 'SKU-003', name: 'HD Monitor', opening: 7, received: 0, sold: 2, adjustments: 0, closing: 5, unitPrice: 25000, value: 125000 },
  { sku: 'SKU-004', name: 'Rice 5kg', opening: 150, received: 100, sold: 50, adjustments: 0, closing: 200, unitPrice: 450, value: 90000 },
  { sku: 'SKU-005', name: 'USB Hub', opening: 5, received: 0, sold: 2, adjustments: 0, closing: 3, unitPrice: 5000, value: 15000 },
];

export default function InventoryReportPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Period state
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2023-10-01');
  const [selectedWeek, setSelectedWeek] = useState('2023-W40');
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  const clearFilters = () => {
    setReportPeriod('daily');
    setSelectedDate('2023-10-01');
    setSelectedWeek('2023-W40');
    setSelectedMonth('2023-10');
    setSelectedYear('2023');
    setCategoryFilter('all');
    setSortBy('name-asc');
  };

  const hasActiveFilters = reportPeriod !== 'daily' || selectedDate !== '2023-10-01' || categoryFilter !== 'all' || sortBy !== 'name-asc';

  const getRawData = () => {
    if (reportPeriod === 'daily') return dailyInventory;
    return periodInventory;
  };

  const filtered = getRawData()
    .filter((r: any) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || (r.category && r.category === categoryFilter) || (!r.category && categoryFilter === 'all');
      return matchesSearch && matchesCat;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'stock-desc') return (b.stock || b.closing) - (a.stock || a.closing);
      if (sortBy === 'stock-asc') return (a.stock || a.closing) - (b.stock || b.closing);
      if (sortBy === 'value-desc') return b.value - a.value;
      return a.name.localeCompare(b.name);
    });

  const handleDownload = (format: 'csv' | 'excel') => toast.success(`Downloading Inventory Report as ${format.toUpperCase()}`);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-blue-600" /> Inventory Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Current stock levels, valuation, and low stock items.</p>
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
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4 text-right">Unit Price (LKR)</th>
                  <th className="px-6 py-4 text-right">Valuation (LKR)</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Item ID</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-center">Opening Stock</th>
                  <th className="px-6 py-4 text-center">Stock Received</th>
                  <th className="px-6 py-4 text-center">Quantity Sold</th>
                  <th className="px-6 py-4 text-center">Adjustments</th>
                  <th className="px-6 py-4 text-center">Closing Stock</th>
                  <th className="px-6 py-4 text-right">Unit Price (LKR)</th>
                  <th className="px-6 py-4 text-right">Total Value (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
              {reportPeriod === 'daily' ? (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.sku}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.stock > 10 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{row.stock} in stock</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                filtered.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{row.sku}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{row.opening}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">+{row.received}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">-{row.sold}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{row.adjustments !== 0 ? (row.adjustments > 0 ? `+${row.adjustments}` : row.adjustments) : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.closing > 10 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{row.closing} in stock</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-black">{row.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Inventory" onClear={() => { clearFilters(); setIsFilterOpen(false); }} onApply={() => setIsFilterOpen(false)}>
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
            <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
            <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Groceries', label: 'Groceries' },
            ]} />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
          <CustomSelect value={sortBy} onChange={setSortBy} options={[
            { value: 'name-asc', label: 'Product Name (A-Z)' },
            { value: 'stock-desc', label: 'Stock (Highest First)' },
            { value: 'stock-asc', label: 'Stock (Lowest First)' },
            { value: 'value-desc', label: 'Value (Highest First)' },
          ]} />
        </div>
      </FilterPanel>
    </div>
  );
}
