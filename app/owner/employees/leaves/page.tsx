'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, CalendarCheck, Clock, XCircle, Search, Filter,
  CheckCircle, MoreHorizontal, FileText, UserCircle, Maximize, Minimize, List, LayoutGrid, X, AlertCircle, Download, User as UserIcon, Users, Trash2, Edit2, Plus, ChevronDown, ChevronUp, FileUp,
  BarChart3, PieChart, Activity, Check, ArrowRight, ShieldCheck
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
import { toast } from 'sonner';

// Mock Data
const mockLeaves = [
  { id: 'LR-1001', employee: 'Kamal Perera', role: 'HR', type: 'Annual Leave', startDate: '2026-08-10', endDate: '2026-08-12', days: 3, reason: 'Family trip out of town.', appliedDate: '2026-08-01', status: 'Pending', approvedBy: null },
  { id: 'LR-1002', employee: 'Nimal Silva', role: 'Stock Keeper', type: 'Sick Leave', startDate: '2026-08-01', endDate: '2026-08-02', days: 2, reason: 'Viral fever.', appliedDate: '2026-08-01', status: 'Approved', approvedBy: 'Admin' },
  { id: 'LR-1003', employee: 'Sunil Fernando', role: 'Cashier', type: 'Casual Leave', startDate: '2026-07-28', endDate: '2026-07-28', days: 1, reason: 'Personal work.', appliedDate: '2026-07-25', status: 'Approved', approvedBy: 'Admin' },
  { id: 'LR-1004', employee: 'Saman Kumara', role: 'Delivery', type: 'Half Day Leave', startDate: '2026-08-03', endDate: '2026-08-03', days: 0.5, reason: 'Doctor appointment.', appliedDate: '2026-08-01', status: 'Rejected', approvedBy: 'Admin' },
  { id: 'LR-1005', employee: 'Ruwan Kumara', role: 'Manager', type: 'Annual Leave', startDate: '2026-08-01', endDate: '2026-08-05', days: 5, reason: 'Vacation.', appliedDate: '2026-07-20', status: 'Approved', approvedBy: 'Admin' },
];

const LEAVE_TYPES = ['All', 'Annual Leave', 'Casual Leave', 'Sick Leave', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave', 'Half Day Leave', 'Other'];
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];
const EMPLOYEES = ['Kamal Perera', 'Nimal Silva', 'Sunil Fernando', 'Saman Kumara', 'Ruwan Kumara', 'Ajantha Mendis', 'Kasun Kalhara'];

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

function LeaveRequestDetailsView({ request, onBack }: { request: any, onBack: () => void }) {
  if (!request) return null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Leave Request Details
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
              request.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
              {request.status}
            </span>
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Req ID: {request.id}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-900">
        {/* Employee Info & Balances */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{request.employee}</h3>
              <p className="text-sm text-slate-500">{request.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Rem.</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">12</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual Rem.</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">5</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick Rem.</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">7</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Used</p>
              <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">14</p>
            </div>
          </div>
        </div>

        {/* Leave Details */}
        <div className="max-w-4xl mx-auto w-full">
          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Request Information
          </h4>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Type</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.type}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.days} Day{request.days > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.startDate} to {request.endDate}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied Date</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.appliedDate}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for Leave</p>
              <p className="font-medium text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {request.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Status / Actions */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            {request.status === 'Pending' ? (
              <div className="flex items-center gap-3 ml-auto">
                <button 
                  onClick={() => {
                    request.status = 'Rejected';
                    request.approvedBy = 'Admin';
                    toast.error('Leave rejected');
                    onBack();
                  }}
                  className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    request.status = 'Approved';
                    request.approvedBy = 'Admin';
                    toast.success('Leave approved');
                    onBack();
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Approve Leave
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CheckCircle className={`w-5 h-5 ${request.status === 'Approved' ? 'text-emerald-500' : 'text-red-500'}`} />
                Processed by: <span className="font-bold text-slate-900 dark:text-white">{request.approvedBy || 'System Admin'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────── OVERVIEW DASHBOARD COMPONENT ────────────────
function LeavesOverviewDashboard({
  leaves,
  kpis,
  setActiveTab,
  onViewRequest,
  onFilterType,
  onFilterStatus,
}: {
  leaves: any[];
  kpis: {
    totalEmployees: number;
    onLeaveToday: number;
    pendingRequests: number;
    approvedThisMonth: number;
  };
  setActiveTab: (tab: 'overview' | 'table') => void;
  onViewRequest: (req: any) => void;
  onFilterType: (type: string) => void;
  onFilterStatus: (status: string) => void;
}) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Distribution by Leave Type
  const leaveTypeStats = useMemo(() => {
    const counts: { [key: string]: { count: number; days: number } } = {};
    leaves.forEach(l => {
      if (!counts[l.type]) {
        counts[l.type] = { count: 0, days: 0 };
      }
      counts[l.type].count += 1;
      counts[l.type].days += Number(l.days || 1);
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      requests: data.count,
      days: data.days
    })).sort((a, b) => b.days - a.days);
  }, [leaves]);

  // Status Breakdown
  const statusStats = useMemo(() => {
    const total = leaves.length || 1;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;

    return [
      { status: 'Approved', count: approved, percent: (approved / total) * 100, color: 'bg-emerald-500', text: 'text-emerald-500' },
      { status: 'Pending', count: pending, percent: (pending / total) * 100, color: 'bg-amber-500', text: 'text-amber-500' },
      { status: 'Rejected', count: rejected, percent: (rejected / total) * 100, color: 'bg-red-500', text: 'text-red-500' },
    ];
  }, [leaves]);

  // Top 5 Active / Recent Requests
  const recentRequests = useMemo(() => {
    return [...leaves].slice(0, 5);
  }, [leaves]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Employees" 
          value={kpis.totalEmployees} 
          icon={UserIcon} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="On Leave Today" 
          value={kpis.onLeaveToday} 
          icon={CalendarCheck} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Pending Requests" 
          value={kpis.pendingRequests} 
          icon={Clock} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="Approved This Month" 
          value={kpis.approvedThisMonth} 
          icon={CheckCircle} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + RECENT REQUESTS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Leave Requests & Days Taken by Type
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
              leaveTypeStats.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No leave records available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={leaveTypeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        formatter={(v: any, name: any) => [v, name === 'days' ? 'Days Taken' : 'Requests']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Bar dataKey="days" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Days" />
                      <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} name="Requests" />
                    </BarChart>
                  ) : (
                    <LineChart data={leaveTypeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        formatter={(v: any, name: any) => [v, name === 'days' ? 'Days Taken' : 'Requests']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Line type="monotone" dataKey="days" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Days" />
                      <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Requests" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total Categories: {leaveTypeStats.length}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Total Days</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Requests</span>
            </div>
          </div>
        </div>

        {/* Right: Active & Pending Requests Card (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Recent Applications
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {leaves.length} Total
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No leave requests found.
              </div>
            ) : (
              recentRequests.map((req, i) => (
                <div
                  key={req.id || i}
                  onClick={() => onViewRequest(req)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view details"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
                      {req.employee.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {req.employee}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {req.type} • {req.days} Day{req.days > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    req.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {req.status}
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
              View All in Leave Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS & BREAKDOWN WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Leave Approval Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Approval Status
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
                    {item.status}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.count} Requests
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 8 : 0, item.percent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.percent.toFixed(0)}% of total requests</span>
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
              View All in Leave Table →
            </button>
          </div>
        </div>

        {/* Card 2: Leave Days by Type */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Duration by Leave Type
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Days
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {leaveTypeStats.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  onFilterType(item.name);
                  setActiveTab('table');
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.days} Day{item.days > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(10, (item.days / 15) * 100))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.requests} application{item.requests > 1 ? 's' : ''}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Select →</span>
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
              View All in Leave Table →
            </button>
          </div>
        </div>

        {/* Card 3: Staff Currently On Leave / Pending Approval */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Leave Timeline
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Live
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {leaves.map((l) => (
              <div
                key={l.id}
                onClick={() => onViewRequest(l)}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-800/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {l.employee}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {l.startDate}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                  "{l.reason}"
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">{l.type}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{l.days} Day{l.days > 1 ? 's' : ''}</span>
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
              View All in Leave Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedLeaveId, setExpandedLeaveId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Apply Leave Panel State
  const [isApplyPanelOpen, setIsApplyPanelOpen] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    employee: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    employee: true,
    leave: false,
    additional: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        employee: false,
        leave: false,
        additional: false,
        [section]: true
      };
    });
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic date validation
    if (new Date(applyFormData.endDate) < new Date(applyFormData.startDate)) {
      toast.error('End Date cannot be before Start Date');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newLeave = {
        id: `LR-100${leaves.length + 1}`,
        employee: applyFormData.employee,
        role: 'Unknown',
        type: applyFormData.type,
        startDate: applyFormData.startDate,
        endDate: applyFormData.endDate,
        days: (new Date(applyFormData.endDate).getTime() - new Date(applyFormData.startDate).getTime()) / (1000 * 3600 * 24) + 1,
        reason: applyFormData.reason,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        approvedBy: null
      };
      
      setLeaves([newLeave, ...leaves]);
      toast.success('Leave applied successfully');
      
      setIsSubmitting(false);
      setIsApplyPanelOpen(false);
      setApplyFormData({
        employee: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
    }, 800);
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const q = search.toLowerCase();
      const matchesSearch = l.employee.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
      const matchesType = typeFilter === 'All' || l.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesRole = roleFilter === 'All' || l.role === roleFilter;
      return matchesSearch && matchesType && matchesStatus && matchesRole;
    });
  }, [leaves, search, typeFilter, statusFilter, roleFilter]);

  const kpis = useMemo(() => {
    return {
      totalEmployees: 45, // Mock value
      onLeaveToday: leaves.filter(l => l.status === 'Approved' && l.startDate <= '2026-08-01' && l.endDate >= '2026-08-01').length,
      pendingRequests: leaves.filter(l => l.status === 'Pending').length,
      approvedThisMonth: leaves.filter(l => l.status === 'Approved' && l.appliedDate.startsWith('2026-08')).length,
    };
  }, [leaves]);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-blue-600" />
              Leave Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage employee leave requests, balances, and history.</p>
          </div>

          <button 
            onClick={() => setIsApplyPanelOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Apply Leave
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Leave Overview | Leave Table) */}
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
            Leave Overview
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
            Leave Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search leaves..."
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
            {(statusFilter !== 'All' || typeFilter !== 'All' || roleFilter !== 'All') && (
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
        <LeavesOverviewDashboard 
          leaves={leaves}
          kpis={kpis}
          setActiveTab={setActiveTab}
          onViewRequest={setViewingRequest}
          onFilterType={(type) => setTypeFilter(type)}
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

          {viewingRequest ? (
            <LeaveRequestDetailsView request={viewingRequest} onBack={() => setViewingRequest(null)} />
          ) : viewMode === 'list' ? (
            <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(180px,1fr)] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Req ID & Employee</div>
                <div>Leave Type & Reason</div>
                <div>Duration & Dates</div>
                <div>Applied Date</div>
                <div className="text-right">Status & Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-medium">Loading leaves...</p>
                  </div>
                ) : filteredLeaves.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <CalendarDays className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-lg text-slate-500">No leave requests found.</p>
                  </div>
                ) : (
                  <>
                  {filteredLeaves.map((leave) => {
                    const isExpanded = expandedLeaveId === leave.id;
                    return (
                      <div key={leave.id} className="transition-colors">
                        <div 
                          onClick={() => setExpandedLeaveId(isExpanded ? null : leave.id)}
                          className={`grid grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(180px,1fr)] gap-4 p-4 sm:px-5 items-center transition-colors cursor-pointer group ${
                            isExpanded ? 'bg-blue-50/60 dark:bg-blue-900/15' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Col 1: Req ID & Employee */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                              <UserCircle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{leave.employee}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                  {leave.id}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                {leave.role}
                              </p>
                            </div>
                          </div>

                          {/* Col 2: Leave Type & Reason */}
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{leave.type}</span>
                            <span className="text-xs text-slate-500 truncate mt-0.5">{leave.reason || 'No reason provided'}</span>
                          </div>

                          {/* Col 3: Duration & Dates */}
                          <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{leave.days} Day{leave.days > 1 ? 's' : ''}</span>
                            </div>
                            <span className="text-xs text-slate-500 truncate mt-0.5">{leave.startDate} → {leave.endDate}</span>
                          </div>

                          {/* Col 4: Applied Date */}
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{leave.appliedDate}</span>
                            <span className="text-xs text-slate-400">{leave.approvedBy ? `By ${leave.approvedBy}` : 'Awaiting Review'}</span>
                          </div>

                          {/* Col 5: Status & Actions */}
                          <div className="flex items-center justify-end gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                              leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40' :
                              leave.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-800/40' :
                              'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
                            }`}>
                              {leave.status}
                            </span>

                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                toast.success('Leave request deleted'); 
                                setLeaves(prev => prev.filter(l => l.id !== leave.id));
                              }} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors cursor-pointer" 
                              title="Delete Request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingRequest(leave);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors cursor-pointer"
                              title="View Full Dossier"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedLeaveId(isExpanded ? null : leave.id);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                              title="Toggle Quick Info"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Expandable Detail Drawer */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-6"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leave Category</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{leave.type}</p>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{leave.reason || 'No description provided'}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule & Days</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{leave.days} Day{leave.days > 1 ? 's' : ''}</p>
                                  <p className="text-xs text-slate-500 mt-1">{leave.startDate} to {leave.endDate}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit & Review</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Applied: {leave.appliedDate}</p>
                                  <p className="text-xs text-slate-500 mt-1">Approver: {leave.approvedBy || 'Pending decision'}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Quick dossier actions</p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <button
                                      onClick={() => setViewingRequest(leave)}
                                      className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      Full Dossier
                                    </button>
                                    {leave.status === 'Pending' && (
                                      <button
                                        onClick={() => {
                                          setLeaves(prev => prev.map(l => l.id === leave.id ? { ...l, status: 'Approved', approvedBy: 'Admin' } : l));
                                          toast.success(`Leave request ${leave.id} approved`);
                                        }}
                                        className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                                        title="Quick Approve"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading leaves...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <CalendarDays className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No leave requests found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLeaves.map((leave) => (
                    <div key={leave.id} onClick={() => setViewingRequest(leave)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[240px]">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          leave.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col mb-4">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{leave.employee}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3">
                          {leave.role}
                        </p>
                        
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Leave Type</span>
                            <span className="font-bold">{leave.type}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Duration</span>
                            <span className="font-bold">{leave.days} Day{leave.days > 1 ? 's' : ''} ({leave.startDate})</span>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <CalendarDays className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Applied: {leave.appliedDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setViewingRequest(leave); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                          View Details
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toast.success('Deleted'); }} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-xl transition-colors cursor-pointer">
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
        title="Filter Leaves" 
        onClear={() => {
          setTypeFilter('All');
          setStatusFilter('All');
          setRoleFilter('All');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="font-sans space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
            <CustomSelect icon={CalendarDays} options={LEAVE_TYPES.map(t => ({ label: t, value: t }))} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <CustomSelect icon={CheckCircle} options={STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <CustomSelect icon={ShieldCheck} options={['All', 'Admin', 'HR', 'Manager', 'Cashier', 'Stock Keeper', 'Delivery'].map(t => ({ label: t, value: t }))} value={roleFilter} onChange={setRoleFilter} />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE OUT PANEL FOR APPLY LEAVE ──────────────── */}
      <AnimatePresence>
        {isApplyPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsApplyPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between h-[89px] px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Apply Leave
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Record staff absence and time-off request</p>
                  </div>
                </div>
                <button onClick={() => setIsApplyPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="applyLeaveForm" onSubmit={handleApplyLeave} className="space-y-4">
                  
                  {/* Section 1: Employee Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("employee")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.employee ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        Employee Details
                      </span>
                      {openSections.employee ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.employee && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Employee *</label>
                              <SearchableSelect 
                                value={applyFormData.employee} 
                                onChange={v => setApplyFormData({...applyFormData, employee: v})} 
                                options={EMPLOYEES} 
                                placeholder="Select Employee" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 2: Leave Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("leave")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.leave ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        Leave Details
                      </span>
                      {openSections.leave ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.leave && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Leave Type *</label>
                              <SearchableSelect 
                                value={applyFormData.type} 
                                onChange={v => setApplyFormData({...applyFormData, type: v})} 
                                options={LEAVE_TYPES.filter(t => t !== 'All')} 
                                placeholder="Select Leave Type" 
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                                <input 
                                  required 
                                  type="date" 
                                  value={applyFormData.startDate} 
                                  onChange={e => setApplyFormData({...applyFormData, startDate: e.target.value})} 
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">End Date *</label>
                                <input 
                                  required 
                                  type="date" 
                                  value={applyFormData.endDate} 
                                  onChange={e => setApplyFormData({...applyFormData, endDate: e.target.value})} 
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white" 
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 3: Additional Info */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("additional")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.additional ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Additional Info
                      </span>
                      {openSections.additional ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.additional && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Reason *</label>
                              <textarea 
                                required
                                value={applyFormData.reason} 
                                onChange={e => setApplyFormData({...applyFormData, reason: e.target.value})} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-slate-900 dark:text-white" 
                                rows={3} 
                                placeholder="Please provide a reason for the leave..." 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Attachments (Optional)</label>
                              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                  <FileUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Click to upload medical certificate or other documents</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                              </div>
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
                  onClick={() => setIsApplyPanelOpen(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="applyLeaveForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
