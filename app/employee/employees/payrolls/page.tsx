'use client';

import { useState, useMemo } from 'react';
import { 
  Banknote, Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, 
  Maximize, Minimize, List, LayoutGrid, X, Download, User as UserIcon, 
  Eye, FileText, Printer, Mail, Plus, ChevronDown, CalendarDays, Wallet, Trash2
} from 'lucide-react';
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
            <div className="p-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none"
              />
            </div>
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
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
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
          <button onClick={() => toast.success('Payslip sent via Email!')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors" title="Email Payslip">
            <Mail className="w-5 h-5" />
          </button>
          <button onClick={() => toast.success('Downloading PDF...')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors" title="Download PDF">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => toast.success('Printing...')} className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors" title="Print Payslip">
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
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                Earnings Breakdown
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Basic Salary</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Fixed Allowances</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.allowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Overtime (OT)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.ot.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Bonus & Commission</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.bonus + payroll.commission).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-slate-900 dark:text-white">Total Earnings (Gross)</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">Rs. {totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Deductions Breakdown
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">EPF (8% Employee Contribution)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.epf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Tax (PAYE)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Other Deductions (Leave/No Pay)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.deduction - payroll.epf - payroll.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black text-slate-900 dark:text-white">Total Deductions</span>
                  <span className="text-xl font-black text-red-600 dark:text-red-400">Rs. {totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action & Summary */}
          <div className="col-span-1 space-y-6">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-lg text-white">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Payment Summary</h4>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Gross Salary</span>
                  <span className="font-bold">Rs. {totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <span>Deductions</span>
                  <span className="font-bold">- Rs. {totalDeductions.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-800 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black">Net Salary</span>
                  <span className="text-2xl font-black text-blue-400">Rs. {payroll.netSalary.toLocaleString()}</span>
                </div>
              </div>

              {payroll.status !== 'Paid' ? (
                <div className="space-y-4">
                  <div className="h-px bg-slate-800 w-full" />
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Action Required
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Payment Method</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none text-white mb-4">
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <button onClick={() => toast.success('Salary Paid Successfully!')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5" /> Pay Salary Now
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-500">Payment Completed</p>
                    <p className="text-xs text-emerald-400/80 mt-0.5">Paid on {payroll.paymentDate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Employer Contributions</h4>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-medium text-slate-600 dark:text-slate-300">ETF (3%)</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {payroll.etf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="font-medium text-slate-600 dark:text-slate-300">EPF (12%)</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {(payroll.epf * 1.5).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
                These are employer contributions and do not affect the employee's net salary.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PayrollManagementPage() {
  const [payrolls, setPayrolls] = useState(mockPayrolls);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<any>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

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

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Auto-calculate statutory deductions if needed, here just mock
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden relative">
      
      {/* ──────────────── HEADER ──────────────── */}
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Generate Payroll
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search payrolls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 sm:ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'All' || monthFilter !== 'All' || roleFilter !== 'All') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => setIsFullscreen(true)}
            title="Full Screen"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800`}
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE / GRID ──────────────── */}
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
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[130px_200px_100px_120px_120px_120px_130px_120px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Ref ID</div>
                <div>Employee</div>
                <div>Month</div>
                <div className="text-right">Basic (Rs)</div>
                <div className="text-right">Earn. (Rs)</div>
                <div className="text-right">Ded. (Rs)</div>
                <div className="text-right text-blue-600 dark:text-blue-400">Net Salary</div>
                <div className="text-right">Status</div>
                <div className="text-center">Action</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredPayrolls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <Banknote className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-lg text-slate-500">No payroll records found.</p>
                  </div>
                ) : (
                  <>
                  {filteredPayrolls.map((payroll) => {
                    const extraEarnings = payroll.allowance + payroll.ot + payroll.bonus + payroll.commission;
                    return (
                      <div key={payroll.id} onClick={() => setViewingPayroll(payroll)} className="cursor-pointer grid grid-cols-[130px_200px_100px_120px_120px_120px_130px_120px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{payroll.id}</div>

                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{payroll.employee}</h3>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate mt-0.5">
                              {payroll.role}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {payroll.month}
                        </div>

                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">
                          {payroll.basicSalary.toLocaleString()}
                        </div>
                        
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                          +{extraEarnings.toLocaleString()}
                        </div>

                        <div className="text-sm font-semibold text-red-600 dark:text-red-400 text-right">
                          -{payroll.deduction.toLocaleString()}
                        </div>

                        <div className="text-base font-black text-blue-600 dark:text-blue-400 text-right">
                          {payroll.netSalary.toLocaleString()}
                        </div>

                        <div className="flex justify-end">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                            payroll.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            payroll.status === 'Overdue' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                            'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {payroll.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(payroll.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Payroll">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </>
                )}
              </div>
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
                      <button onClick={(e) => { e.stopPropagation(); setViewingPayroll(payroll); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        View Details
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(payroll.id); }} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-500 hover:text-red-600 rounded-xl transition-colors">
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
            <CustomSelect options={STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month</label>
            <CustomSelect options={['All', ...MONTHS].map(t => ({ label: t, value: t }))} value={monthFilter} onChange={setMonthFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <CustomSelect options={ROLES.map(t => ({ label: t, value: t }))} value={roleFilter} onChange={setRoleFilter} />
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
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-blue-500" />
                  Generate Payroll
                </h2>
                <button onClick={() => setIsGeneratePanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="generatePayrollForm" onSubmit={handleGeneratePayroll} className="space-y-6">
                  
                  {/* Basic Details */}
                  <div className="space-y-4">
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
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Earnings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Earnings (Rs.)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Basic Salary *</label>
                        <input required type="number" min="0" value={generateFormData.basicSalary} onChange={e => setGenerateFormData({...generateFormData, basicSalary: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fixed Allowance</label>
                        <input type="number" min="0" value={generateFormData.allowance} onChange={e => setGenerateFormData({...generateFormData, allowance: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Overtime (OT)</label>
                        <input type="number" min="0" value={generateFormData.ot} onChange={e => setGenerateFormData({...generateFormData, ot: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bonus / Comm.</label>
                        <input type="number" min="0" value={generateFormData.bonus} onChange={e => setGenerateFormData({...generateFormData, bonus: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Deductions & Payment */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Deductions & Payment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">EPF Deduction (Rs.)</label>
                        <input type="number" min="0" value={generateFormData.epf} onChange={e => setGenerateFormData({...generateFormData, epf: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Other Deductions (Leave/Advances) Rs.</label>
                        <input type="number" min="0" value={generateFormData.deduction} onChange={e => setGenerateFormData({...generateFormData, deduction: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                      <select 
                        value={generateFormData.paymentMethod}
                        onChange={e => setGenerateFormData({...generateFormData, paymentMethod: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                      >
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                  </div>

                </form>
              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto shrink-0 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsGeneratePanelOpen(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="generatePayrollForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
