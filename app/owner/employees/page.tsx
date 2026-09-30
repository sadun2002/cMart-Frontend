'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit2, Trash2, Mail, Phone, Calendar, Shield, MapPin, 
  Building2, UserCircle, Briefcase, ChevronDown, CheckCircle, XCircle, Filter, 
  X, List, LayoutGrid, Maximize, Minimize, KeyRound, Clock, UserPlus,
  BarChart3, CheckCircle2, UserCheck, ShieldAlert, Sparkles, TrendingUp, ArrowRight, Layers, UserX
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { TableEmptyState } from '@/components/ui/table-empty-state';

import { DEFAULT_ROLES } from '@/lib/roles';
import { AddEmployeePanel } from './components/AddEmployeePanel';

interface EmployeeOverviewDashboardProps {
  employees: any[];
  kpis: { total: number; active: number; recent: number; inactive: number };
  setActiveTab: (tab: 'overview' | 'table') => void;
  openAddPanel: () => void;
  setStatusFilter: (filter: string) => void;
  formatDate: (dateStr: string) => string;
}

function EmployeeOverviewDashboard({
  employees,
  kpis,
  setActiveTab,
  openAddPanel,
  setStatusFilter,
  formatDate,
}: EmployeeOverviewDashboardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role breakdown chart data
  const chartData = useMemo(() => {
    const roleMap = new Map<string, number>();
    employees.forEach(e => {
      const r = e.role || 'Cashier';
      roleMap.set(r, (roleMap.get(r) || 0) + 1);
    });
    return Array.from(roleMap.entries()).map(([name, count]) => ({
      name,
      staff: count
    })).sort((a, b) => b.staff - a.staff);
  }, [employees]);

  // Active Team Members
  const topEmployees = useMemo(() => {
    return [...employees].slice(0, 5);
  }, [employees]);

  // Recent Staff Onboarded
  const recentStaff = useMemo(() => {
    return [...employees]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [employees]);

  const activePercent = kpis.total > 0 ? Math.round((kpis.active / kpis.total) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Employees" 
          value={kpis.total.toString()} 
          icon={Users} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Accounts" 
          value={kpis.active.toString()} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Inactive Accounts" 
          value={kpis.inactive.toString()} 
          icon={XCircle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
        <KpiCard 
          title="New (7 Days)" 
          value={kpis.recent.toString()} 
          icon={UserPlus} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + KEY TEAM MEMBERS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Staff Role & Responsibility Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Staff allocation across cashiers, managers, and store support roles
              </p>
            </div>
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
              chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No employee role data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(v: any) => [`${v} Members`, 'Staff Count']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="staff" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(v: any) => [`${v} Members`, 'Staff Count']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="staff" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Overall Account Health</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {activePercent}% Active Staff ({kpis.active} of {kpis.total} accounts)
            </span>
          </div>
        </div>

        {/* Right: Key Team Members (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Team Members
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Staff ({employees.length})
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topEmployees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No employees registered yet.
              </div>
            ) : (
              topEmployees.map((emp, i) => (
                <div
                  key={emp.id || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view in table"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {emp.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {emp.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {emp.role || 'CASHIER'} • {emp.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    emp.active !== false 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {emp.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Employee Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Account Status & Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Account Status & Security
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Access
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <div 
              onClick={() => {
                setStatusFilter('active');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active Accounts
                </span>
                <span>{kpis.active} Accounts ({activePercent}%)</span>
              </div>
              <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${activePercent}%` }} />
              </div>
            </div>

            <div 
              onClick={() => {
                setStatusFilter('inactive');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-slate-500" />
                  Inactive / Suspended
                </span>
                <span>{kpis.inactive} Accounts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Access disabled from POS terminal
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Role-Based POS Security
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                All staff logins are isolated to authorized POS terminals with custom permission overrides.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Employee Table →
            </button>
          </div>
        </div>

        {/* Card 2: Recent Staff Onboarding */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Recent Onboarding
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              {kpis.recent} New
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentStaff.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No recent staff registered.
              </div>
            ) : (
              recentStaff.map((emp, i) => (
                <div
                  key={emp.id || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {emp.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Joined {formatDate(emp.createdAt)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    {emp.role || 'Cashier'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Employee Table →
            </button>
          </div>
        </div>

        {/* Card 3: Quick Add Staff Action */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Staff Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Ready
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Cashier & Staff Access
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Create dedicated PIN codes and logins for cashiers to track sales and commissions per staff member.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Add New Staff Member
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mb-3">
                Register a new cashier or assistant to your store POS.
              </p>
              <button
                type="button"
                onClick={openAddPanel}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Employee Account
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Employee Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | string | null>(null);
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getEmployees();
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      await storeOwnerAPI.createEmployee(data);
      toast.success('Employee account created successfully!');
      setIsPanelOpen(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddPanel = () => {
    setIsPanelOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        (e.role && e.role.toLowerCase().includes(q));
        
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = e.active !== false;
      if (statusFilter === 'inactive') matchesStatus = e.active === false;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.active !== false).length;
    const recent = employees.filter(e => {
      if (!e.createdAt) return false;
      const days = (new Date().getTime() - new Date(e.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    const inactive = total - active;
    return { total, active, recent, inactive };
  }, [employees]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`font-sans flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Employee Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and manage your cashier and staff accounts.</p>
          </div>
          
          <button 
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Employee Overview | Employee Table) */}
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
            Employee Overview
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
            Employee Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search employees..."
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
            title="Filter & Sort"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {statusFilter !== 'all' && (
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
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            className="flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB CONTENT: OVERVIEW OR TABLE ──────────────── */}
      {activeTab === 'overview' ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <EmployeeOverviewDashboard
            employees={employees}
            kpis={kpis}
            setActiveTab={setActiveTab}
            openAddPanel={openAddPanel}
            setStatusFilter={setStatusFilter}
            formatDate={formatDate}
          />
        </div>
      ) : (
        /* ──────────────── DATA TABLE (CARD LIST OR GRID) ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="font-medium text-sm">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <TableEmptyState
              icon={Shield}
              title="No employees found"
              description="You haven't added any staff accounts yet, or none match your search. Click below to add your first employee."
              actionLabel="Add First Employee"
              onAction={openAddPanel}
            />
          ) : viewMode === 'list' ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(180px,1.4fr)_minmax(120px,1fr)_100px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Employee & Role</div>
                <div>Contact Email</div>
                <div>Activity Info</div>
                <div>Status</div>
                <div className="text-right pr-2">Actions</div>
              </div>

              {/* Table Body */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 no-scrollbar">
                {filteredEmployees.map((e) => {
                  const isExpanded = expandedEmployeeId === e.id;
                  return (
                    <div key={e.id} className="flex flex-col">
                      <div 
                        onClick={() => setExpandedEmployeeId(prev => prev === e.id ? null : e.id)}
                        className={`grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(180px,1.4fr)_minmax(120px,1fr)_100px] gap-4 p-4 sm:px-5 items-center transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-blue-50/60 dark:bg-blue-900/15' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Col 1: Employee & Role */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200/50 dark:border-blue-700/50">
                            {e.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{e.name}</p>
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                              <Shield className="w-3 h-3 shrink-0" /> {e.role || 'CASHIER'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Col 2: Contact */}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{e.email || 'N/A'}</span>
                          </p>
                        </div>

                        {/* Col 3: Activity */}
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 truncate">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Joined: {formatDate(e.createdAt)}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Last Login: {e.lastLogin ? formatDate(e.lastLogin) : 'Never'}
                          </p>
                        </div>

                        {/* Col 4: Status */}
                        <div>
                          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                            e.active !== false 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${e.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                            {e.active !== false ? 'Active' : 'Inactive'}
                          </div>
                        </div>

                        {/* Col 5: Actions */}
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e_btn) => {
                              e_btn.stopPropagation();
                              setExpandedEmployeeId(prev => prev === e.id ? null : e.id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'Expand Details'}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detail Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-6"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    Staff Profile: {e.name}
                                  </h4>
                                  <p className="text-xs text-slate-500">Security permissions, system activity, and account status</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  e.active !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {e.active !== false ? 'Account Active' : 'Account Disabled'}
                                </span>
                              </div>

                              {/* 4 Summary Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Role</span>
                                  <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    {e.role || 'CASHIER'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">POS & store permissions</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Login Contact</span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                    {e.email || 'N/A'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">Authorized SSO email</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Onboarding Date</span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {formatDate(e.createdAt)}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">Account activation date</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recent Login</span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                                    {e.lastLogin ? formatDate(e.lastLogin) : 'Never'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">Last terminal session</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Grid View */
            <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEmployees.map(e => (
                  <div 
                    key={e.id} 
                    className="bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer relative"
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                        e.active !== false
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {e.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-black text-2xl mb-4">
                      {e.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-16">{e.name}</h3>
                    <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {e.role || 'CASHIER'}
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 opacity-70" />
                        <span className="truncate">{e.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(e.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Login</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{e.lastLogin ? formatDate(e.lastLogin) : 'Never'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <AddEmployeePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* ──────────────── FILTER FLYOUT ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Employees"
        onClear={() => { setStatusFilter('all'); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Account Status</label>
          <CustomSelect
            icon={UserCheck}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Employees' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' }
            ]}
          />
        </div>
      </FilterPanel>

    </div>
  );
}
