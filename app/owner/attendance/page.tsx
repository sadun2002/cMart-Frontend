'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, CheckCircle, Clock, Calendar, ShieldAlert,
  Maximize, Minimize, Fingerprint, History, UserCheck,
  Search, Filter, List, LayoutGrid, X, ArrowRight, BarChart3,
  TrendingUp, CheckCircle2, UserX, SlidersHorizontal, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { storeOwnerAPI } from '@/lib/api';


interface AttendanceOverviewDashboardProps {
  kpis: { total: number; present: number; absent: number; late: number };
  punches: any[];
  employees: any[];
  setActiveTab: (tab: 'overview' | 'table') => void;
  simulatePunch: () => void;
  setStatusFilter: (status: string) => void;
}

function AttendanceOverviewDashboard({
  kpis,
  punches,
  employees,
  setActiveTab,
  simulatePunch,
  setStatusFilter,
}: AttendanceOverviewDashboardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hourly punch breakdown chart data
  const chartData = useMemo(() => {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const map = new Map<string, number>();
    hours.forEach(h => map.set(h, 0));

    punches.forEach(p => {
      const d = new Date(p.time);
      const h = String(d.getHours()).padStart(2, '0') + ':00';
      if (map.has(h)) {
        map.set(h, (map.get(h) || 0) + 1);
      } else {
        map.set(h, 1);
      }
    });

    return hours.map(h => ({
      hour: h,
      punches: map.get(h) || 0
    }));
  }, [punches]);

  // Recent punches (Latest 5)
  const recentPunches = useMemo(() => {
    return [...punches].slice(0, 5);
  }, [punches]);

  // Employee Presence Roster
  const roster = useMemo(() => {
    return employees.map(emp => {
      const empPunches = punches.filter(p => p.employeeId === emp.id);
      const latestPunch = empPunches[0] || null;
      const isPresent = latestPunch && latestPunch.type === 'Check In';
      const status = isPresent 
        ? (latestPunch.status === 'Late' ? 'Late' : 'Present')
        : (latestPunch ? 'Checked Out' : 'Absent');

      return {
        ...emp,
        latestPunch,
        isPresent,
        status
      };
    });
  }, [employees, punches]);

  const presentPercent = kpis.total > 0 ? Math.round((kpis.present / kpis.total) * 100) : 0;
  const onTimeCount = Math.max(0, kpis.present - kpis.late);
  const onTimePercent = kpis.present > 0 ? Math.round((onTimeCount / kpis.present) * 100) : 0;

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
          title="Present Today" 
          value={kpis.present.toString()} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Late Arrivals" 
          value={kpis.late.toString()} 
          icon={Clock} 
          iconColorClass="text-orange-600" 
          iconBgClass="bg-orange-50 dark:bg-orange-500/10" 
        />
        <KpiCard 
          title="Absent" 
          value={kpis.absent.toString()} 
          icon={ShieldAlert} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + STAFF PRESENCE TODAY (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Hourly Attendance & Punch Flow
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Staff check-in and check-out distribution during today's operating hours
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
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(v: any) => [`${v} Punches`, 'Activity']} 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="punches" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(v: any) => [`${v} Punches`, 'Activity']} 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="punches" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Overall Presence Rate Today</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {presentPercent}% ({kpis.present} of {kpis.total} employees present)
            </span>
          </div>
        </div>

        {/* Right: Active Employees Today (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Staff Status Today
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {kpis.present} Present
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {roster.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                <Users className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No staff members</p>
                <p className="text-xs text-slate-400 mt-1">Add staff in Employee Management to monitor attendance.</p>
              </div>
            ) : (
              roster.map((emp, i) => {
                const statusColors = 
                  emp.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30' :
                  emp.status === 'Late' ? 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30' :
                  emp.status === 'Checked Out' ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30' :
                  'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700';

                return (
                  <div
                    key={emp.id || i}
                    onClick={() => setActiveTab('table')}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view logs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {emp.role} {emp.latestPunch ? `• ${new Date(emp.latestPunch.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors}`}>
                      {emp.status}
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
              View All in Attendance Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS & ACTIVITY WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Shift & Punctuality Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Punctuality Insights
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Shift Metrics
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">
            {/* On Time Ratio */}
            <div 
              onClick={() => {
                setStatusFilter('On Time');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  On Time Arrivals
                </span>
                <span>{onTimeCount} of {kpis.present || 1} ({onTimePercent}%)</span>
              </div>
              <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${onTimePercent}%` }} />
              </div>
            </div>

            {/* Late Arrivals */}
            <div 
              onClick={() => {
                setStatusFilter('Late');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 cursor-pointer hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  Late Arrivals
                </span>
                <span>{kpis.late} Employees</span>
              </div>
              <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-1">
                Punched in after grace period
              </p>
            </div>

            {/* Absent Rate */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-slate-500" />
                  Absent / Not Punched
                </span>
                <span>{kpis.absent} Employees</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                No active punches recorded today
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Attendance Table →
            </button>
          </div>
        </div>

        {/* Card 2: Live Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Recent Punches
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Live Feed
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentPunches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No punches recorded yet today.
              </div>
            ) : (
              recentPunches.map((punch, i) => (
                <div
                  key={punch.id || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {punch.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(punch.time).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      punch.type === 'Check In' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                        : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                    }`}>
                      {punch.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      punch.status === 'Late' 
                        ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    }`}>
                      {punch.status}
                    </span>
                  </div>
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
              View All in Attendance Table →
            </button>
          </div>
        </div>

        {/* Card 3: Quick Action & Terminal Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Terminal & Kiosk Status
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Online
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Biometric & Card Terminal
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Connected and syncing check-ins automatically in real-time.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Fast Punch Simulation
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mb-3">
                Simulate an immediate hardware biometric tap for quick testing.
              </p>
              <button
                type="button"
                onClick={simulatePunch}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                Trigger Sample Punch
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Attendance Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Real-time clock for Kiosk Mode
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance state
  const [employees, setEmployees] = useState<any[]>([]);
  const [punches, setPunches] = useState<any[]>([]);

  // Load attendance records
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cmart_attendance_punches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPunches(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load punches', e);
    }
  }, []);

  // Fetch real employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await storeOwnerAPI.getEmployees();
        if (res && res.data && Array.isArray(res.data)) {
          setEmployees(res.data);
        }
      } catch (err) {
        console.error('Failed to load employees for attendance', err);
      }
    };
    fetchEmployees();

    const handleReset = () => {
      setPunches([]);
      setEmployees([]);
    };
    window.addEventListener('cmart_database_reset', handleReset);
    return () => window.removeEventListener('cmart_database_reset', handleReset);
  }, []);

  // Fullscreen handling
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleKioskMode = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsKioskMode(true);
      } catch (err) {
        toast.error('Could not enable fullscreen mode.');
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsKioskMode(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsKioskMode(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Simulate a punch
  const simulatePunch = () => {
    if (employees.length === 0) {
      toast.info('No employees registered. Add employees first in Employee Management.');
      return;
    }
    const randomEmp = employees[Math.floor(Math.random() * employees.length)];
    const existingPunch = punches.find(p => p.employeeId === randomEmp.id);
    const type = existingPunch && existingPunch.type === 'Check In' ? 'Check Out' : 'Check In';
    
    const newPunch = {
      id: Date.now(),
      employeeId: randomEmp.id,
      name: randomEmp.name,
      type,
      time: new Date(),
      status: type === 'Check In' ? 'Late' : 'Completed'
    };

    setPunches(prev => {
      const updated = [newPunch, ...prev];
      try {
        localStorage.setItem('cmart_attendance_punches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save punch', e);
      }
      return updated;
    });

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio playback failed', e);
    }
    
    if (!isKioskMode) {
      toast.success(`${randomEmp.name} punched ${type.toLowerCase()} successfully`);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = employees.length;
    const present = new Set(punches.filter(p => p.type === 'Check In').map(p => p.employeeId)).size;
    const absent = Math.max(0, total - present);
    const late = punches.filter(p => p.type === 'Check In' && p.status === 'Late').length;

    return { total, present, absent, late };
  }, [punches, employees]);

  // Filtered punches
  const filteredPunches = useMemo(() => {
    return punches.filter(p => {
      const q = search.toLowerCase();
      const empRole = employees.find(e => e.id === p.employeeId)?.role || '';
      const matchesSearch = 
        !search ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.status && p.status.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q)) ||
        empRole.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === 'all' || p.type?.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [punches, search, statusFilter, typeFilter, employees]);

  // Format time beautifully
  const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={containerRef} className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden relative ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── KIOSK MODE OVERLAY ──────────────── */}
      <AnimatePresence>
        {isKioskMode && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#F4F7F6] dark:bg-slate-900 flex overflow-hidden"
          >
            {/* Main Clock Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
              <button 
                onClick={toggleKioskMode}
                className="absolute top-8 right-8 p-3 bg-slate-200/50 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                title="Exit Kiosk Mode"
              >
                <Minimize className="w-6 h-6" />
              </button>
              
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-8">
                  <div className="p-6 bg-blue-600/20 rounded-full">
                    <Fingerprint className="w-24 h-24 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-2xl">
                  {timeString}
                </h1>
                <p className="text-3xl font-medium text-slate-600 dark:text-slate-400">
                  {dateString}
                </p>
                <div className="pt-12">
                  <p className="text-slate-500 text-lg">Please place your finger on the scanner or tap your card.</p>
                </div>
              </div>

              {/* Button to simulate punch in kiosk */}
              <button 
                onClick={simulatePunch}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all text-sm font-bold tracking-widest uppercase cursor-pointer"
              >
                Simulate Hardware Punch
              </button>
            </div>

            {/* Side Panel for Real-time Punches */}
            <div className="w-96 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-2xl">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-widest">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recent Punches
              </h3>
              
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto space-y-4 pr-2 pb-12" style={{ scrollbarWidth: 'none' }}>
                  <AnimatePresence>
                    {punches.slice(0, 15).map((punch) => (
                      <motion.div 
                        key={punch.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.4 }}
                        className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-sm dark:shadow-none"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{punch.name}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {new Date(punch.time).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            punch.type === 'Check In' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                            'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          }`}>
                            {punch.type}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── STANDARD MANAGER VIEW ──────────────── */}
      {!isKioskMode && (
        <>
          {/* HEADER */}
          {!isFullscreen && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                  Attendance
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Monitor employee check-ins and check-outs.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={simulatePunch}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
                >
                  <Fingerprint className="w-5 h-5" />
                  Simulate Punch
                </button>
                <button 
                  onClick={toggleKioskMode}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
                >
                  <Maximize className="w-5 h-5" />
                  Enter Kiosk Mode
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Left: Mode Toggle (Attendance Overview | Attendance Table) */}
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
                Attendance Overview
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
                Attendance Table
              </button>
            </div>

            {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
              {/* Integrated Search Bar on Left */}
              <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Search punches..."
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
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center px-3 sm:px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-1.5 font-bold text-xs cursor-pointer relative"
                title="Filter & Sort"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {(statusFilter !== 'all' || typeFilter !== 'all') && (
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

          {/* Quick Filter Bar when filter is open */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    {['all', 'on time', 'late', 'completed'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                          statusFilter === st 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Type:</span>
                    {['all', 'check in', 'check out'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                          typeFilter === t 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {(statusFilter !== 'all' || typeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
                      }}
                      className="text-xs text-rose-500 hover:underline font-bold ml-auto cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────── TAB CONTENT: OVERVIEW OR TABLE ──────────────── */}
          {activeTab === 'overview' ? (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <AttendanceOverviewDashboard
                kpis={kpis}
                punches={punches}
                employees={employees}
                setActiveTab={setActiveTab}
                simulatePunch={simulatePunch}
                setStatusFilter={setStatusFilter}
              />
            </div>
          ) : (
            /* ──────────────── DATA TABLE (CARD LIST) ──────────────── */
            <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Today's Attendance Logs ({filteredPunches.length})
                </h2>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar">
                {filteredPunches.length === 0 ? (
                  <TableEmptyState
                    icon={Fingerprint}
                    title="No attendance records match"
                    description="Employees haven't checked in or out yet, or no records match your filter criteria."
                    actionLabel="Simulate Check-In"
                    onAction={simulatePunch}
                  />
                ) : viewMode === 'list' ? (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Employee Name</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Time</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Type</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredPunches.map((punch) => (
                        <tr key={punch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                {punch.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{punch.name}</span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {employees.find(e => e.id === punch.employeeId)?.role || 'Employee'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {new Date(punch.time).toLocaleTimeString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              punch.type === 'Check In' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                            }`}>
                              {punch.type}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                              punch.status === 'Late' 
                                ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                            }`}>
                              {punch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPunches.map((punch) => (
                      <div
                        key={punch.id}
                        className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                            {punch.name.charAt(0)}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            punch.status === 'Late' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                          }`}>
                            {punch.status}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{punch.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {employees.find(e => e.id === punch.employeeId)?.role || 'Staff'}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{punch.type}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(punch.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
