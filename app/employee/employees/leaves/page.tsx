'use client';

import { useState, useMemo } from 'react';
import { 
  CalendarDays, CalendarCheck, Clock, XCircle, Search, Filter,
  CheckCircle, MoreHorizontal, FileText, UserCircle, Maximize, Minimize, List, LayoutGrid, X, AlertCircle, Download, User as UserIcon, Trash2, Edit, Plus, ChevronDown, FileUp
} from 'lucide-react';
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
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.days} Days</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.startDate}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-1">{request.endDate}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</p>
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group shadow-sm">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">medical_cert.pdf</span>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Actions / Notes */}
        <div className="max-w-4xl mx-auto w-full pb-8">
          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Manager Actions
          </h4>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manager Notes</p>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 mb-4 font-medium text-slate-700 dark:text-slate-300 transition-all outline-none"
              rows={3}
              placeholder="Add comments before approving/rejecting..."
              defaultValue={request.status !== 'Pending' ? "Leave balance checked. Approved." : ""}
              disabled={request.status !== 'Pending'}
            />
            {request.status === 'Pending' ? (
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20">
                  <CheckCircle className="w-4 h-4" /> Approve Leave
                </button>
                <button className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20">
                  <XCircle className="w-4 h-4" /> Reject Leave
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

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden relative">
      
      {/* ──────────────── HEADER ──────────────── */}
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Apply Leave
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search leaves..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 sm:ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter & Sort"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {statusFilter !== 'All' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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

        {viewingRequest ? (
          <LeaveRequestDetailsView request={viewingRequest} onBack={() => setViewingRequest(null)} />
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[150px_250px_150px_150px_150px_120px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Req ID</div>
                <div>Employee</div>
                <div>Leave Type</div>
                <div>Duration</div>
                <div>Applied On</div>
                <div className="text-right">Status</div>
                <div className="text-center">Action</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
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
                  {filteredLeaves.map((leave) => (
                    <div key={leave.id} onClick={() => setViewingRequest(leave)} className="cursor-pointer grid grid-cols-[150px_250px_150px_150px_150px_120px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      
                      {/* Req ID */}
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{leave.id}</div>

                      {/* Employee Name */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{leave.employee}</h3>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate mt-0.5">
                            {leave.role}
                          </p>
                        </div>
                      </div>

                      {/* Leave Type */}
                      <div className="flex flex-col justify-center min-w-0 space-y-1">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{leave.type}</span>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col justify-center min-w-0 space-y-1">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">{leave.days} Day{leave.days > 1 ? 's' : ''}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{leave.startDate}</span>
                      </div>

                      {/* Applied On */}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-sm text-slate-500 font-medium">{leave.appliedDate}</span>
                      </div>

                      {/* Status */}
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                          leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          leave.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {leave.status}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); toast.success('Deleted'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>
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
                      <button onClick={(e) => { e.stopPropagation(); setViewingRequest(leave); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        View Details
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.success('Deleted'); }} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-xl transition-colors">
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
            <CustomSelect options={LEAVE_TYPES.map(t => ({ label: t, value: t }))} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <CustomSelect options={STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <CustomSelect options={['All', 'Admin', 'HR', 'Manager', 'Cashier', 'Stock Keeper', 'Delivery'].map(t => ({ label: t, value: t }))} value={roleFilter} onChange={setRoleFilter} />
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
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Apply Leave for Employee
                </h2>
                <button onClick={() => setIsApplyPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="applyLeaveForm" onSubmit={handleApplyLeave} className="space-y-6">
                  
                  {/* Employee Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Employee Details
                    </h3>
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

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Leave Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> Leave Details
                    </h3>
                    <div className="space-y-4">
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
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">End Date *</label>
                          <input 
                            required 
                            type="date" 
                            value={applyFormData.endDate} 
                            onChange={e => setApplyFormData({...applyFormData, endDate: e.target.value})} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Additional Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Reason *</label>
                        <textarea 
                          required
                          value={applyFormData.reason} 
                          onChange={e => setApplyFormData({...applyFormData, reason: e.target.value})} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-slate-900 dark:text-white" 
                          rows={3} 
                          placeholder="Please provide a reason for the leave..." 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Attachments (Optional)</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <FileUp className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Click to upload medical certificate or other documents</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto shrink-0 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsApplyPanelOpen(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="applyLeaveForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
