'use client';

import { useState, useMemo, useEffect } from 'react';
import { storeOwnerAPI } from '@/lib/api';
import { 
  Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, 
  Maximize, Minimize, List, LayoutGrid, X, Download, User as UserIcon, 
  Eye, FileText, Printer, ChevronDown, ShoppingBag, Globe, Truck, MapPin, CreditCard, CalendarDays, Edit, Package, Trash2, Ban, Mail, Phone, Users, Banknote, Copy,
  BarChart3, PieChart, Activity, ShieldCheck, ArrowRight, TrendingUp
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
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { toast } from 'sonner';

// Mock Data for Online Customers
const mockOnlineCustomers = [
  { 
    id: 'WEB-CUS-1001', 
    name: 'Sahan Dissanayake', 
    phone: '071 234 5678',
    email: 'sahan@example.com',
    address: '15/2, Beach Road, Negombo',
    registeredDate: '2026-01-15',
    lastLogin: '2026-08-01T10:30:00',
    totalOrders: 12,
    totalSpent: 45000,
    status: 'Active' 
  },
  { 
    id: 'WEB-CUS-1002', 
    name: 'Nipuni Fernando', 
    phone: '077 987 6543',
    email: 'nipuni@example.com',
    address: '45, Kandy Road, Kadawatha',
    registeredDate: '2026-03-22',
    lastLogin: '2026-07-28T14:15:00',
    totalOrders: 3,
    totalSpent: 12500,
    status: 'Active' 
  },
  { 
    id: 'WEB-CUS-1003', 
    name: 'Kasun Kalhara', 
    phone: '070 111 2222',
    email: 'kasun@example.com',
    address: '128/A, Highlevel Road, Nugegoda',
    registeredDate: '2026-06-10',
    lastLogin: '2026-08-02T09:45:00',
    totalOrders: 5,
    totalSpent: 28000,
    status: 'Suspended' 
  },
  { 
    id: 'WEB-CUS-1004', 
    name: 'Ayesha Silva', 
    phone: '076 555 4444',
    email: 'ayesha@example.com',
    address: '7th Lane, Kollupitiya, Colombo 03',
    registeredDate: '2026-07-05',
    lastLogin: '2026-07-20T16:20:00',
    totalOrders: 1,
    totalSpent: 4500,
    status: 'Inactive' 
  },
  { 
    id: 'WEB-CUS-1005', 
    name: 'Tharindu Peiris', 
    phone: '071 888 9999',
    email: 'tharindu@example.com',
    address: 'No 10, Galle Road, Mount Lavinia',
    registeredDate: '2026-07-25',
    lastLogin: '2026-08-03T08:10:00',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active' 
  },
];

const ACCOUNT_STATUSES = ['All', 'Active', 'Inactive', 'Suspended'];

// ──────────────── OVERVIEW DASHBOARD COMPONENT ────────────────
function WebCustomersOverviewDashboard({
  customers,
  kpis,
  setActiveTab,
  onViewCustomer,
  onFilterStatus,
}: {
  customers: any[];
  kpis: {
    totalRegistered: number;
    activeAccounts: number;
    totalRevenue: number;
    recentSignups: number;
  };
  setActiveTab: (tab: 'overview' | 'table') => void;
  onViewCustomer: (c: any) => void;
  onFilterStatus: (s: string) => void;
}) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Spending brackets
  const spendingBrackets = useMemo(() => {
    const brackets = [
      { name: '> Rs.30k', min: 30000, max: Infinity, count: 0, totalSpent: 0 },
      { name: 'Rs.10k-30k', min: 10000, max: 29999, count: 0, totalSpent: 0 },
      { name: 'Rs.5k-10k', min: 5000, max: 9999, count: 0, totalSpent: 0 },
      { name: '< Rs.5k', min: 1, max: 4999, count: 0, totalSpent: 0 },
      { name: 'No Orders', min: 0, max: 0, count: 0, totalSpent: 0 },
    ];

    customers.forEach(c => {
      const spent = Number(c.totalSpent || 0);
      const b = brackets.find(br => spent >= br.min && spent <= br.max);
      if (b) {
        b.count += 1;
        b.totalSpent += spent;
      }
    });

    return brackets;
  }, [customers]);

  // Account Status Breakdown
  const statusStats = useMemo(() => {
    const total = customers.length || 1;
    const active = customers.filter(c => c.status === 'Active').length;
    const inactive = customers.filter(c => c.status === 'Inactive').length;
    const suspended = customers.filter(c => c.status === 'Suspended').length;

    return [
      { status: 'Active', count: active, percent: (active / total) * 100, color: 'bg-emerald-500' },
      { status: 'Inactive', count: inactive, percent: (inactive / total) * 100, color: 'bg-amber-500' },
      { status: 'Suspended', count: suspended, percent: (suspended / total) * 100, color: 'bg-red-500' },
    ];
  }, [customers]);

  // Top Web Customers by Spending
  const topCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [customers]);

  // Order Frequency Brackets
  const orderFrequencyStats = useMemo(() => {
    const frequent = customers.filter(c => c.totalOrders > 5).length;
    const repeat = customers.filter(c => c.totalOrders >= 2 && c.totalOrders <= 5).length;
    const onetime = customers.filter(c => c.totalOrders === 1).length;
    const zero = customers.filter(c => c.totalOrders === 0).length;
    const total = customers.length || 1;

    return [
      { name: 'Frequent (>5 Orders)', count: frequent, percent: (frequent / total) * 100, color: 'bg-blue-500' },
      { name: 'Repeat (2-5 Orders)', count: repeat, percent: (repeat / total) * 100, color: 'bg-indigo-500' },
      { name: 'First-time (1 Order)', count: onetime, percent: (onetime / total) * 100, color: 'bg-emerald-500' },
      { name: 'Prospective (0 Orders)', count: zero, percent: (zero / total) * 100, color: 'bg-slate-400' },
    ];
  }, [customers]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Registered" 
          value={kpis.totalRegistered} 
          icon={UserIcon} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Accounts" 
          value={kpis.activeAccounts} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Online Revenue" 
          value={`Rs. ${(kpis.totalRevenue/1000).toFixed(1)}k`} 
          icon={Banknote} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="New Signups (7d)" 
          value={kpis.recentSignups} 
          icon={Clock} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + TOP CUSTOMERS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Customer Value Tiers & Spending Distribution
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
              spendingBrackets.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No online customer records available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={spendingBrackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        formatter={(v: any, name: any) => [name === 'totalSpent' ? `Rs. ${Number(v).toLocaleString()}` : v, name === 'totalSpent' ? 'Total Spent' : 'Customer Count']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="count" />
                    </BarChart>
                  ) : (
                    <LineChart data={spendingBrackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        formatter={(v: any, name: any) => [name === 'totalSpent' ? `Rs. ${Number(v).toLocaleString()}` : v, name === 'totalSpent' ? 'Total Spent' : 'Customer Count']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="count" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Customer Segments: {spendingBrackets.length}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Total Accounts: {customers.length}
            </span>
          </div>
        </div>

        {/* Right: Top Web Customers Card (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Top Web Customers
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              By Spend
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {topCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No customer accounts found.
              </div>
            ) : (
              topCustomers.map((c, i) => {
                const rankColors = [
                  'bg-amber-500 text-white',
                  'bg-slate-400 text-white',
                  'bg-orange-700 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={c.id || i}
                    onClick={() => onViewCustomer(c)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view profile"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''} &bull; {c.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                      Rs. {Number(c.totalSpent || 0).toLocaleString()}
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
              View All in Customers Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS & BREAKDOWN WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Account Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Account Status Breakdown
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Access
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
                    {item.count} Accounts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 8 : 0, item.percent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.percent.toFixed(0)}% of registered users</span>
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
              View All in Customers Table →
            </button>
          </div>
        </div>

        {/* Card 2: Order Frequency Segments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Order Frequency Segments
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Loyalty
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            {orderFrequencyStats.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.count} users
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 8 : 0, item.percent))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  {item.percent.toFixed(0)}% of total user base
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
              View All in Customers Table →
            </button>
          </div>
        </div>

        {/* Card 3: Recent Activity & Signups */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Member Directory
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Live
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => onViewCustomer(c)}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-800/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.id}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {c.email} &bull; {c.phone}
                </div>
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Reg: {c.registeredDate}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{c.totalOrders} Orders</span>
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
              View All in Customers Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OnlineCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Customer Details Panel State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [blockConfirmId, setBlockConfirmId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoadingData(true);
      const res: any = await storeOwnerAPI.getOnlineCustomers();
      const data = res.data || res;
      const formatted = data.map((c: any) => {
        const defaultAddr = c.addresses?.[0];
        
        let displayStatus = 'Suspended';
        if (c.active) {
          if (c.lastLogin) {
            const daysSinceLogin = Math.floor((Date.now() - new Date(c.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
            displayStatus = daysSinceLogin <= 30 ? 'Active' : 'Inactive';
          } else {
            const daysSinceReg = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            displayStatus = daysSinceReg <= 30 ? 'Active' : 'Inactive';
          }
        }

        return {
          realId: c.id,
          id: `WEB-CUS-${c.id}`,
          name: c.name,
          phone: defaultAddr?.phone || c.phone || 'N/A',
          email: c.email || 'N/A',
          address: defaultAddr ? `${defaultAddr.street}, ${defaultAddr.city}` : 'N/A',
          registeredDate: new Date(c.createdAt).toLocaleDateString(),
          lastLogin: c.lastLogin ? new Date(c.lastLogin).toLocaleString() : 'N/A',
          totalOrders: c.onlineOrders?.length || 0,
          totalSpent: c.onlineOrders?.filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED' && o.status !== 'RETURNED').reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0,
          status: displayStatus
        };
      });
      setCustomers(formatted);
    } catch (error) {
      // Fallback mock
      setCustomers(mockOnlineCustomers);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsPanelOpen(true);
  };

  const handleToggleSuspendStatus = async (duration?: string) => {
    const targetId = blockConfirmId || selectedCustomer?.id;
    const targetCustomer = customers.find(c => c.id === targetId);
    if (!targetCustomer) return;

    const newActiveState = targetCustomer.status === 'Suspended';

    setIsUpdating(true);
    try {
      if (targetCustomer.realId) {
        await storeOwnerAPI.updateOnlineCustomerStatus(targetCustomer.realId, { active: newActiveState });
      }

      setCustomers(customers.map(c => {
        if (c.id === targetId) {
          return {
            ...c,
            status: newActiveState ? 'Active' : 'Suspended'
          };
        }
        return c;
      }));

      if (selectedCustomer && selectedCustomer.id === targetId) {
        setSelectedCustomer({
          ...selectedCustomer,
          status: newActiveState ? 'Active' : 'Suspended'
        });
      }

      toast.success(newActiveState ? 'Customer account activated' : `Customer suspended ${duration ? `for ${duration}` : ''}`);
    } catch (error) {
      toast.error('Failed to update customer status');
    } finally {
      setIsUpdating(false);
      setBlockConfirmId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = (c.name || '').toLowerCase().includes(q) || 
                            (c.id || '').toLowerCase().includes(q) || 
                            (c.email || '').toLowerCase().includes(q) || 
                            (c.phone || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const kpis = useMemo(() => {
    return {
      totalRegistered: customers.length,
      activeAccounts: customers.filter(c => c.status === 'Active').length,
      totalRevenue: customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0),
      recentSignups: customers.filter(c => {
        const d = new Date(c.registeredDate);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }).length,
    };
  }, [customers]);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              Website Customers
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage registered website users, track their behavior and manage account access.</p>
          </div>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Customer Overview | Customer Table) */}
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
            Customer Overview
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
            Customer Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by name, ID, email..."
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
            {statusFilter !== 'All' && (
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
        <WebCustomersOverviewDashboard 
          customers={customers}
          kpis={kpis}
          setActiveTab={setActiveTab}
          onViewCustomer={openCustomerDetails}
          onFilterStatus={(s) => setStatusFilter(s)}
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

          {filteredCustomers.length === 0 ? (
            <TableEmptyState
              icon={Users}
              title="No online customers found"
              description={
                search || statusFilter !== 'All'
                  ? "No online store customers match your current search and filter criteria. Try adjusting or clearing your filters."
                  : "No customer accounts have registered on your online storefront yet. Once customers sign up or place orders online, their profiles will appear here."
              }
              actionLabel={search || statusFilter !== 'All' ? "Clear Filters" : undefined}
              onAction={
                search || statusFilter !== 'All'
                  ? () => {
                      setSearch('');
                      setStatusFilter('All');
                    }
                  : undefined
              }
            />
          ) : viewMode === 'list' ? (
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-500">Customer ID</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Customer Info</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Contact & Address</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Registered / Last Login</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Lifetime Value</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => openCustomerDetails(customer)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-bold text-slate-500 text-sm">{customer.id}</td>
                      
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="font-black text-slate-900 dark:text-white text-sm">{customer.name}</div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(customer.email); toast.success('Email copied'); }} className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-500 transition-all cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 group/copy">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(customer.phone); toast.success('Phone copied'); }} className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-500 transition-all cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {customer.address && (
                            <span className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {customer.address}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                          <span>Reg: {customer.registeredDate}</span>
                          <span>Login: {new Date(customer.lastLogin).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="font-black text-blue-600 dark:text-blue-400">Rs. {customer.totalSpent.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-500">{customer.totalOrders} Orders</span>
                        </div>
                      </td>
                      
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          customer.status === 'Suspended' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {customer.status === 'Suspended' ? (
                            <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); handleToggleSuspendStatus(); }} className={`p-2 rounded-lg transition-colors text-emerald-500 hover:bg-emerald-50 cursor-pointer`} title="Activate Account">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className="relative group/dropdown">
                              <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 cursor-pointer" title="Suspend Account">
                                <Ban className="w-5 h-5" />
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                                <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('7 Days'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 7 Days</button>
                                <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('1 Month'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 1 Month</button>
                                <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('1 Year'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 1 Year</button>
                                <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('Lifetime'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium cursor-pointer">Lifetime Suspend</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} onClick={() => openCustomerDetails(customer)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[260px]">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                          {customer.name.charAt(0)}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          customer.status === 'Suspended' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col mb-4">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{customer.name}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3">
                          {customer.id}
                        </p>
                        
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Total Orders</span>
                            <span className="font-bold">{customer.totalOrders}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-medium">Total Spent</span>
                            <span className="font-black text-blue-600 dark:text-blue-400">Rs. {customer.totalSpent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        {customer.status === 'Suspended' ? (
                          <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); handleToggleSuspendStatus(); }} className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer">
                            Activate
                          </button>
                        ) : (
                          <div className="flex-1 relative group/dropdown">
                            <button onClick={(e) => { e.stopPropagation(); }} className="w-full py-2 rounded-xl text-xs font-bold transition-colors bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer">
                              Suspend
                            </button>
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                              <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('7 Days'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">7 Days</button>
                              <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('1 Month'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">1 Month</button>
                              <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('1 Year'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">1 Year</button>
                              <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); setTimeout(() => handleToggleSuspendStatus('Lifetime'), 0); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium cursor-pointer">Lifetime</button>
                            </div>
                          </div>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); openCustomerDetails(customer); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Customers" 
        onClear={() => {
          setStatusFilter('All');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="font-sans space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Status</label>
            <CustomSelect icon={ShieldCheck} options={ACCOUNT_STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── CUSTOMER DETAILS SLIDE OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between h-[89px] px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Account Details
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{selectedCustomer.id} • Registered Customer Profile</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Profile Overview */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl shrink-0">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedCustomer.name}</h3>
                    <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      selectedCustomer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      selectedCustomer.status === 'Suspended' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" /> Contact Info
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Activity & Value */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" /> Lifetime Value
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Total Orders</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Registered Date</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.registeredDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Last Login</span>
                      <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedCustomer.lastLogin).toLocaleDateString()} {new Date(selectedCustomer.lastLogin).toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Total Spent</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">Rs. {selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Quick Actions</h4>
                  {selectedCustomer.status === 'Suspended' ? (
                    <button 
                      onClick={() => handleToggleSuspendStatus()}
                      className="w-full flex items-center justify-center gap-2 py-3 border rounded-xl font-bold transition-colors border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Activate Account
                    </button>
                  ) : (
                    <div className="relative group/dropdown w-full">
                      <button 
                        className="w-full flex items-center justify-center gap-2 py-3 border rounded-xl font-bold transition-colors border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 cursor-pointer"
                      >
                        <Ban className="w-5 h-5" />
                        Suspend Account
                      </button>
                      <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                        <button onClick={() => { setBlockConfirmId(selectedCustomer.id); setTimeout(() => handleToggleSuspendStatus('7 Days'), 0); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 7 Days</button>
                        <button onClick={() => { setBlockConfirmId(selectedCustomer.id); setTimeout(() => handleToggleSuspendStatus('1 Month'), 0); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 1 Month</button>
                        <button onClick={() => { setBlockConfirmId(selectedCustomer.id); setTimeout(() => handleToggleSuspendStatus('1 Year'), 0); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">Suspend for 1 Year</button>
                        <button onClick={() => { setBlockConfirmId(selectedCustomer.id); setTimeout(() => handleToggleSuspendStatus('Lifetime'), 0); }} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-black border-t border-slate-100 dark:border-slate-700 cursor-pointer">Lifetime Suspend</button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
