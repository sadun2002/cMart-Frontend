'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Banknote, Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, 
  Maximize, Minimize, List, LayoutGrid, X, Download, User as UserIcon, 
  Eye, FileText, Printer, Mail, Plus, ChevronDown, ChevronUp, CalendarDays, Wallet, Trash2, CreditCard,
  BarChart3, PieChart, Activity, ShieldCheck, ArrowRight, TrendingUp, Users, Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

// Mock Data
const mockPayrolls = [
  { id: 'PAY-2608-01', employee: 'Kamal Perera', role: 'HR', basicSalary: 80000, allowance: 5000, ot: 0, bonus: 0, commission: 0, deduction: 8800, netSalary: 76200, status: 'Paid', paymentDate: '2026-08-01', month: '2026-07', epf: 6400, etf: 2400, tax: 0 },
  { id: 'PAY-2608-02', employee: 'Nimal Silva', role: 'Stock Keeper', basicSalary: 45000, allowance: 2000, ot: 5000, bonus: 0, commission: 0, deduction: 4950, netSalary: 47050, status: 'Paid', paymentDate: '2026-08-01', month: '2026-07', epf: 3600, etf: 1350, tax: 0 },
  { id: 'PAY-2608-03', employee: 'Sunil Fernando', role: 'Cashier', basicSalary: 40000, allowance: 2000, ot: 2000, bonus: 1000, commission: 0, deduction: 4400, netSalary: 40600, status: 'Pending', paymentDate: '-', month: '2026-07', epf: 3200, etf: 1200, tax: 0 },
  { id: 'PAY-2608-04', employee: 'Saman Kumara', role: 'Delivery', basicSalary: 35000, allowance: 5000, ot: 8000, bonus: 0, commission: 3000, deduction: 3850, netSalary: 47150, status: 'Pending', paymentDate: '-', month: '2026-07', epf: 2800, etf: 1050, tax: 0 },
  { id: 'PAY-2608-05', employee: 'Ruwan Kumara', role: 'Manager', basicSalary: 120000, allowance: 10000, ot: 0, bonus: 20000, commission: 0, deduction: 23200, netSalary: 126800, status: 'Overdue', paymentDate: '-', month: '2026-06', epf: 9600, etf: 3600, tax: 10000 },
];

const EMPLOYEES = ['Kamal Perera', 'Nimal Silva', 'Sunil Fernando', 'Saman Kumara', 'Ruwan Kumara', 'Ajantha Mendis', 'Kasun Kalhara'];
const STATUSES = ['All', 'Paid', 'Pending', 'Overdue'];
const ROLES = ['All', 'HR', 'Manager', 'Cashier', 'Stock Keeper', 'Delivery'];
const MONTHS = ['2026-08', '2026-07', '2026-06', '2026-05', '2026-04'];

function SearchableSelect({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer flex justify-between items-center"
      >
        <span className={value ? 'text-slate-900 dark:text-white truncate mr-2' : 'text-slate-400 truncate mr-2'}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
            {options.length > 5 && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none text-slate-900 dark:text-white"
                />
              </div>
            )}
            <div className="overflow-y-auto p-1 flex-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">No results found</div>
              ) : (
                filteredOptions.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PayrollDetailsView({ payroll, onBack }: { payroll: any, onBack: () => void }) {
  if (!payroll) return null;

  const totalEarnings = payroll.basicSalary + payroll.allowance + payroll.ot + payroll.bonus + payroll.commission;
  const totalDeductions = payroll.deduction;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Salary Slip: {payroll.month}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                payroll.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                payroll.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
                {payroll.status}
              </span>
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Ref: {payroll.id}</p>
          </div>
        </div>
        <div className="flex gap-2 mr-12 sm:mr-16 lg:mr-20">
          <button onClick={() => toast.success('Payslip sent via Email!')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer" title="Email Payslip">
            <Mail className="w-5 h-5" />
          </button>
          <button onClick={() => toast.success('Downloading PDF...')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer" title="Download PDF">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => toast.success('Printing...')} className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors cursor-pointer" title="Print Payslip">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Employee Info Card */}
          <div className="col-span-1 lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{payroll.employee}</h3>
                <p className="font-bold text-slate-500 uppercase tracking-wider">{payroll.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-center sm:text-right">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Date</p>
                <p className="font-bold text-slate-900 dark:text-white">{payroll.paymentDate}</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Salary</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">Rs. {payroll.netSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Earnings Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Basic Salary</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Allowances</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.allowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Overtime (OT)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.ot.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Bonus & Commissions</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.bonus + payroll.commission).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-6 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Total Earnings</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">Rs. {totalEarnings.toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Deductions & Statutory
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">EPF Employee (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.epf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Income Tax (PAYE)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Other Deductions</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.deduction - payroll.epf - payroll.tax).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-6 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Total Deductions</span>
              <span className="text-lg font-black text-red-600 dark:text-red-400">Rs. {totalDeductions.toLocaleString()}</span>
            </div>
          </div>

          {/* Employer Contributions & Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Employer Contributions
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">EPF Employer (12%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.basicSalary * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">ETF Employer (3%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.etf.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Cost to Company</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Rs. {(totalEarnings + (payroll.basicSalary * 0.15)).toLocaleString()}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ──────────────── OVERVIEW DASHBOARD COMPONENT ────────────────
function PayrollsOverviewDashboard({
  payrolls,
  kpis,
  setActiveTab,
  onViewPayroll,
  onFilterRole,
  onFilterStatus,
}: {
  payrolls: any[];
  kpis: {
    totalSalary: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  setActiveTab: (tab: 'overview' | 'table') => void;
  onViewPayroll: (p: any) => void;
  onFilterRole: (role: string) => void;
  onFilterStatus: (status: string) => void;
}) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Net salary and staff count by department / role
  const roleSalaryStats = useMemo(() => {
    const rolesMap: { [key: string]: { totalSalary: number; count: number } } = {};
    payrolls.forEach(p => {
      const r = p.role || 'Other';
      if (!rolesMap[r]) {
        rolesMap[r] = { totalSalary: 0, count: 0 };
      }
      rolesMap[r].totalSalary += Number(p.netSalary || 0);
      rolesMap[r].count += 1;
    });

    return Object.entries(rolesMap).map(([name, data]) => ({
      name,
      salary: data.totalSalary,
      count: data.count
    })).sort((a, b) => b.salary - a.salary);
  }, [payrolls]);

  // Payment Status Breakdown
  const statusStats = useMemo(() => {
    const paidList = payrolls.filter(p => p.status === 'Paid');
    const pendingList = payrolls.filter(p => p.status === 'Pending');
    const overdueList = payrolls.filter(p => p.status === 'Overdue');
    const totalSum = payrolls.reduce((s, p) => s + Number(p.netSalary || 0), 0) || 1;

    return [
      {
        status: 'Paid',
        count: paidList.length,
        sum: paidList.reduce((s, p) => s + Number(p.netSalary || 0), 0),
        color: 'bg-emerald-500',
        text: 'text-emerald-500'
      },
      {
        status: 'Pending',
        count: pendingList.length,
        sum: pendingList.reduce((s, p) => s + Number(p.netSalary || 0), 0),
        color: 'bg-amber-500',
        text: 'text-amber-500'
      },
      {
        status: 'Overdue',
        count: overdueList.length,
        sum: overdueList.reduce((s, p) => s + Number(p.netSalary || 0), 0),
        color: 'bg-red-500',
        text: 'text-red-500'
      }
    ].map(item => ({
      ...item,
      percent: (item.sum / totalSum) * 100
    }));
  }, [payrolls]);

  // Deductions summary
  const deductionsSummary = useMemo(() => {
    const totalEpf = payrolls.reduce((s, p) => s + Number(p.epf || 0), 0);
    const totalEtf = payrolls.reduce((s, p) => s + Number(p.etf || 0), 0);
    const totalTax = payrolls.reduce((s, p) => s + Number(p.tax || 0), 0);
    const totalDeductions = payrolls.reduce((s, p) => s + Number(p.deduction || 0), 0);
    const otherDeductions = Math.max(0, totalDeductions - totalEpf - totalTax);

    return [
      { name: 'EPF (Employee 8%)', amount: totalEpf, color: 'bg-blue-500' },
      { name: 'ETF (Employer 3%)', amount: totalEtf, color: 'bg-indigo-500' },
      { name: 'PAYE Tax', amount: totalTax, color: 'bg-rose-500' },
      { name: 'Other Deductions', amount: otherDeductions, color: 'bg-amber-500' },
    ];
  }, [payrolls]);

  // Top Disbursements (Ranked 1 to 5)
  const topDisbursements = useMemo(() => {
    return [...payrolls].sort((a, b) => b.netSalary - a.netSalary).slice(0, 5);
  }, [payrolls]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Salary (Jul)" 
          value={`Rs. ${(kpis.totalSalary/1000).toFixed(1)}k`} 
          icon={Banknote} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Total Paid" 
          value={`Rs. ${(kpis.paid/1000).toFixed(1)}k`} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Pending" 
          value={`Rs. ${(kpis.pending/1000).toFixed(1)}k`} 
          icon={Clock} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="Overdue Payments" 
          value={kpis.overdue} 
          icon={AlertTriangle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + TOP DISBURSEMENTS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Salary Expenditure by Role / Department
            </h2>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              roleSalaryStats.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No payroll records available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={roleSalaryStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString()}`, 'Total Net Salary']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Bar dataKey="salary" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Salary (Rs)" />
                    </BarChart>
                  ) : (
                    <LineChart data={roleSalaryStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString()}`, 'Total Net Salary']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Line type="monotone" dataKey="salary" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Salary (Rs)" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Roles Tracked: {roleSalaryStats.length}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Total Payroll: Rs. {payrolls.reduce((s, p) => s + Number(p.netSalary || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Top 5 Highest Disbursements Card (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Highest Disbursements
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Top 5
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {topDisbursements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No payroll records available.
              </div>
            ) : (
              topDisbursements.map((p, i) => {
                const rankColors = [
                  'bg-amber-500 text-white',
                  'bg-slate-400 text-white',
                  'bg-orange-700 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={p.id || i}
                    onClick={() => onViewPayroll(p)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view payslip"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {p.employee}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {p.role} • {p.month}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                      Rs. {p.netSalary.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Payroll Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS & BREAKDOWN WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Payment Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Payment Status Breakdown
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Overview
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">
            {statusStats.map((item) => (
              <div
                key={item.status}
                onClick={() => {
                  onFilterStatus(item.status);
                  setActiveTab('table');
                }}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group space-y-1.5"
                title={`Filter by ${item.status}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {item.status} ({item.count})
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    Rs. {item.sum.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 8 : 0, item.percent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.percent.toFixed(0)}% of total salary</span>
                  <span className="text-indigo-500 font-bold group-hover:underline">Filter →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Payroll Table →
            </button>
          </div>
        </div>

        {/* Card 2: Deductions & Statutory Contributions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Statutory & Deductions
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Tax & Funds
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {deductionsSummary.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    Rs. {item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(10, (item.amount / 30000) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Payroll Table →
            </button>
          </div>
        </div>

        {/* Card 3: Recent Payroll Slips Stream */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Recent Salary Slips
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Live
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {payrolls.map((p) => (
              <div
                key={p.id}
                onClick={() => onViewPayroll(p)}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-800/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.employee}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {p.month}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{p.role} &bull; {p.paymentDate}</span>
                  <span className="font-black text-purple-600 dark:text-purple-400">Rs. {p.netSalary.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Payroll Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PayrollManagementPage() {
  const [payrolls, setPayrolls] = useState(mockPayrolls);
  const [search, setSearch] = useState('');
  
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<any>(null);
  
  // Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setPayrolls(payrolls.filter(p => p.id !== deleteConfirmId));
      toast.success('Payroll deleted successfully');
      setDeleteConfirmId(null);
    }
  };

  // Generate Payroll Panel State
  const [isGeneratePanelOpen, setIsGeneratePanelOpen] = useState(false);
  const [generateFormData, setGenerateFormData] = useState({
    employee: '',
    month: MONTHS[0],
    basicSalary: 0,
    allowance: 0,
    ot: 0,
    bonus: 0,
    epf: 0,
    deduction: 0,
    paymentMethod: 'BANK_TRANSFER'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    earnings: false,
    deductions: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        earnings: false,
        deductions: false,
        [section]: true
      };
    });
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const epf = Number(generateFormData.epf) || 0;
      const etf = generateFormData.basicSalary * 0.03;
      const totalDeductions = Number(generateFormData.deduction) + epf;
      const totalEarnings = Number(generateFormData.basicSalary) + Number(generateFormData.allowance) + Number(generateFormData.ot) + Number(generateFormData.bonus);
      const netSalary = totalEarnings - totalDeductions;

      const newPayroll = {
        id: `PAY-2608-0${payrolls.length + 1}`,
        employee: generateFormData.employee,
        role: 'Employee',
        basicSalary: Number(generateFormData.basicSalary),
        allowance: Number(generateFormData.allowance),
        ot: Number(generateFormData.ot),
        bonus: Number(generateFormData.bonus),
        commission: 0,
        deduction: totalDeductions,
        netSalary: netSalary,
        status: 'Pending',
        paymentDate: '-',
        month: generateFormData.month,
        epf: epf,
        etf: etf,
        tax: 0
      };
      
      setPayrolls([newPayroll, ...payrolls]);
      toast.success('Payroll generated successfully');
      
      setIsSubmitting(false);
      setIsGeneratePanelOpen(false);
      setGenerateFormData({
        employee: '',
        month: MONTHS[0],
        basicSalary: 0,
        allowance: 0,
        ot: 0,
        bonus: 0,
        epf: 0,
        deduction: 0,
        paymentMethod: 'BANK_TRANSFER'
      });
    }, 800);
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = p.employee.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesMonth = monthFilter === 'All' || p.month === monthFilter;
      const matchesRole = roleFilter === 'All' || p.role === roleFilter;
      return matchesSearch && matchesStatus && matchesMonth && matchesRole;
    });
  }, [payrolls, search, statusFilter, monthFilter, roleFilter]);

  const kpis = useMemo(() => {
    const currentMonth = '2026-07';
    const thisMonthPayrolls = payrolls.filter(p => p.month === currentMonth);
    
    return {
      totalSalary: thisMonthPayrolls.reduce((sum, p) => sum + p.netSalary, 0),
      paid: payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netSalary, 0),
      pending: payrolls.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.netSalary, 0),
      overdue: payrolls.filter(p => p.status === 'Overdue').length,
    };
  }, [payrolls]);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Banknote className="w-8 h-8 text-blue-600" />
              Payroll Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage employee salaries, generate payrolls, and track payments.</p>
          </div>

          <button 
            onClick={() => setIsGeneratePanelOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Generate Payroll
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Payroll Overview | Payroll Table) */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Payroll Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          <button 
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Payroll Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search payrolls..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('table');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Filter Button */}
          <button 
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-3 sm:px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-1.5 font-bold text-xs cursor-pointer relative"
            title="Filter"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'All' || monthFilter !== 'All' || roleFilter !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* View Mode Toggles */}
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Fullscreen Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── CONTENT AREA (OVERVIEW OR TABLE/GRID) ──────────────── */}
      {activeTab === 'overview' ? (
        <PayrollsOverviewDashboard 
          payrolls={payrolls}
          kpis={kpis}
          setActiveTab={setActiveTab}
          onViewPayroll={setViewingPayroll}
          onFilterRole={(role) => setRoleFilter(role)}
          onFilterStatus={(status) => setStatusFilter(status)}
        />
      ) : (
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
          
          {isFullscreen && (
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
            >
              <Minimize className="w-5 h-5" />
            </button>
          )}

          {viewingPayroll ? (
            <PayrollDetailsView payroll={viewingPayroll} onBack={() => setViewingPayroll(null)} />
          ) : viewMode === 'list' ? (
            <div className="flex-1 flex flex-col overflow-hidden w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(200px,1.8fr)_minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(140px,1.2fr)_120px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Payroll Ref & Staff</div>
                <div>Period</div>
                <div className="text-right">Earnings & Deductions</div>
                <div className="text-right">Net Salary</div>
                <div className="text-right pr-2">Status & Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPayrolls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <Banknote className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-lg text-slate-500">No payroll records found.</p>
                  </div>
                ) : (
                  filteredPayrolls.map((payroll) => {
                    const extraEarnings = payroll.allowance + payroll.ot + payroll.bonus + payroll.commission;
                    return (
                      <div key={payroll.id} onClick={() => setViewingPayroll(payroll)} className="cursor-pointer grid grid-cols-[minmax(200px,1.8fr)_minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(140px,1.2fr)_120px] gap-4 p-4 sm:px-5 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                        
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{payroll.employee}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400 truncate">{payroll.id}</span>
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider truncate">· {payroll.role}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {payroll.month}
                        </div>

                        <div className="text-right min-w-0 space-y-0.5">
                          <div className="text-xs text-slate-600 dark:text-slate-400">Basic: Rs. {payroll.basicSalary.toLocaleString()}</div>
                          <div className="text-[11px] font-medium text-emerald-600">+Rs. {extraEarnings.toLocaleString()}</div>
                          {payroll.deduction > 0 && (
                            <div className="text-[11px] font-medium text-rose-500">-Rs. {payroll.deduction.toLocaleString()}</div>
                          )}
                        </div>

                        <div className="text-sm font-black text-blue-600 dark:text-blue-400 text-right">
                          Rs. {payroll.netSalary.toLocaleString()}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            payroll.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            payroll.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400' :
                            'bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {payroll.status}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(payroll.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer" title="Delete Payroll">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
              {filteredPayrolls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Banknote className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No payroll records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPayrolls.map((payroll) => (
                    <div key={payroll.id} onClick={() => setViewingPayroll(payroll)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[240px]">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          payroll.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          payroll.status === 'Overdue' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {payroll.status}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col mb-4">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{payroll.employee}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3">
                          {payroll.role} &bull; {payroll.month}
                        </p>
                        
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Basic</span>
                            <span className="font-bold">Rs. {payroll.basicSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Net Salary</span>
                            <span className="font-black text-blue-600 dark:text-blue-400">Rs. {payroll.netSalary.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setViewingPayroll(payroll); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                          View Details
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(payroll.id); }} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Payrolls" 
        onClear={() => {
          setStatusFilter('All');
          setMonthFilter('All');
          setRoleFilter('All');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="font-sans space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <CustomSelect icon={CheckCircle} options={STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month</label>
            <CustomSelect icon={CalendarDays} options={['All', ...MONTHS].map(t => ({ label: t, value: t }))} value={monthFilter} onChange={setMonthFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <CustomSelect icon={ShieldCheck} options={ROLES.map(t => ({ label: t, value: t }))} value={roleFilter} onChange={setRoleFilter} />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE OUT PANEL FOR GENERATE PAYROLL ──────────────── */}
      <AnimatePresence>
        {isGeneratePanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsGeneratePanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between h-[89px] px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Generate Payroll
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Process monthly employee compensation and payslips</p>
                  </div>
                </div>
                <button onClick={() => setIsGeneratePanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="generatePayrollForm" onSubmit={handleGeneratePayroll} className="space-y-4">
                  
                  {/* Section 1: Basic Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("basic")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        Basic Details
                      </span>
                      {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.basic && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Employee *</label>
                              <SearchableSelect 
                                value={generateFormData.employee} 
                                onChange={v => setGenerateFormData({...generateFormData, employee: v})} 
                                options={EMPLOYEES} 
                                placeholder="Select Employee" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Salary Month *</label>
                              <select 
                                value={generateFormData.month}
                                onChange={e => setGenerateFormData({...generateFormData, month: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                              >
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 2: Earnings */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("earnings")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.earnings ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-blue-600" />
                        Earnings (Rs.)
                      </span>
                      {openSections.earnings ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.earnings && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Basic Salary *</label>
                                <input required type="number" min="0" value={generateFormData.basicSalary} onChange={e => setGenerateFormData({...generateFormData, basicSalary: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fixed Allowance</label>
                                <input type="number" min="0" value={generateFormData.allowance} onChange={e => setGenerateFormData({...generateFormData, allowance: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Overtime (OT)</label>
                                <input type="number" min="0" value={generateFormData.ot} onChange={e => setGenerateFormData({...generateFormData, ot: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bonus / Comm.</label>
                                <input type="number" min="0" value={generateFormData.bonus} onChange={e => setGenerateFormData({...generateFormData, bonus: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 3: Deductions & Payment */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("deductions")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.deductions ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Deductions & Payment
                      </span>
                      {openSections.deductions ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.deductions && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">EPF Deduction (Rs.)</label>
                                <input type="number" min="0" value={generateFormData.epf} onChange={e => setGenerateFormData({...generateFormData, epf: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Other Deductions (Rs.)</label>
                                <input type="number" min="0" value={generateFormData.deduction} onChange={e => setGenerateFormData({...generateFormData, deduction: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                              <select 
                                value={generateFormData.paymentMethod}
                                onChange={e => setGenerateFormData({...generateFormData, paymentMethod: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                              >
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CASH">Cash</option>
                                <option value="CHEQUE">Cheque</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </form>
              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto shrink-0 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsGeneratePanelOpen(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="generatePayrollForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : 'Generate & Pay'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────────── DELETE CONFIRMATION DIALOG ──────────────── */}
      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        title="Delete Payroll"
        message="Are you sure you want to delete this payroll? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
