'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Plus, Package, Store } from 'lucide-react';
import Link from 'next/link';
import { ComponentPreview } from '@/app/owner/settings/customize/ComponentPreview';
import { DashboardComponent } from '@/lib/dashboard-components';

const ADMIN_KPIS = [
  {
    comp: { id: 'kpi-today-sales', label: 'Total MRR', description: '', category: 'kpi', icon: 'DollarSign', size: 'medium' } as DashboardComponent,
    data: { value: 'LKR 1.45M', change: '+12.5%', up: true, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' }
  },
  {
    comp: { id: 'kpi-active-employees', label: 'Active Stores', description: '', category: 'kpi', icon: 'Store', size: 'medium' } as DashboardComponent,
    data: { value: '142', change: '+18 today', up: true, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
  },
  {
    comp: { id: 'kpi-total-sales-all', label: 'Total Subscriptions', description: '', category: 'kpi', icon: 'CreditCard', size: 'medium' } as DashboardComponent,
    data: { value: '3,254', change: '+5.2%', up: true, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' }
  },
  {
    comp: { id: 'kpi-total-customers', label: 'Platform Users', description: '', category: 'kpi', icon: 'Users', size: 'medium' } as DashboardComponent,
    data: { value: '18,590', change: '+124 today', up: true, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' }
  },
  {
    comp: { id: 'kpi-today-orders', label: 'Support Tickets', description: '', category: 'kpi', icon: 'MessageSquare', size: 'medium' } as DashboardComponent,
    data: { value: '28 Open', change: '-5 today', up: true, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' }
  },
  {
    comp: { id: 'kpi-new-customers', label: 'New Signups', description: '', category: 'kpi', icon: 'UserPlus', size: 'medium' } as DashboardComponent,
    data: { value: '45', change: '+12 this week', up: true, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' }
  },
  {
    comp: { id: 'kpi-inventory-value', label: 'Active Themes', description: '', category: 'kpi', icon: 'Palette', size: 'medium' } as DashboardComponent,
    data: { value: '24', change: '+2 this month', up: true, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' }
  },
  {
    comp: { id: 'kpi-pending-online-orders', label: 'Pending Approvals', description: '', category: 'kpi', icon: 'Clock', size: 'medium' } as DashboardComponent,
    data: { value: '12', change: '-3 today', up: false, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' }
  }
];

const ADMIN_WIDGETS = [
  {
    comp: { id: 'chart-sales-30d-line', label: 'Platform Revenue Growth (30D)', description: '', category: 'charts', icon: 'TrendingUp', size: 'large' } as DashboardComponent,
    data: [
      { day: 'Week 1', sales: 450000 },
      { day: 'Week 2', sales: 520000 },
      { day: 'Week 3', sales: 680000 },
      { day: 'Week 4', sales: 850000 },
    ],
    colSpan: 'lg:col-span-2'
  },
  {
    comp: { id: 'list-top5-customers', label: 'Top Growing Stores', description: '', category: 'lists', icon: 'Store', size: 'medium' } as DashboardComponent,
    data: [
      { name: 'TechZone LK', value: 'ENTERPRISE', badge: 'Active' },
      { name: 'FreshMart Galle', value: 'PRO', badge: 'Active' },
      { name: 'Kandy Books', value: 'FREE', badge: 'Pending' },
      { name: 'Fashion Hub', value: 'PRO', badge: 'Active' },
      { name: 'Electro World', value: 'ENTERPRISE', badge: 'Active' }
    ],
    colSpan: 'lg:col-span-1'
  },
  {
    comp: { id: 'chart-sales-bar-day', label: 'Store Signups (Last 7 Days)', description: '', category: 'charts', icon: 'BarChart2', size: 'large' } as DashboardComponent,
    data: [
      { day: 'Mon', sales: 5 },
      { day: 'Tue', sales: 12 },
      { day: 'Wed', sales: 8 },
      { day: 'Thu', sales: 15 },
      { day: 'Fri', sales: 22 },
      { day: 'Sat', sales: 18 },
      { day: 'Sun', sales: 7 },
    ],
    colSpan: 'lg:col-span-1'
  },
  {
    comp: { id: 'chart-sales-by-category-pie', label: 'Subscription Distribution', description: '', category: 'charts', icon: 'PieChart', size: 'medium' } as DashboardComponent,
    data: [
      { name: 'Enterprise', value: 350 },
      { name: 'Pro', value: 850 },
      { name: 'Free', value: 2054 },
    ],
    colSpan: 'lg:col-span-1'
  },
  {
    comp: { id: 'alert-system-notifications', label: 'System Alerts & Maintenance', description: '', category: 'alerts', icon: 'AlertTriangle', size: 'medium' } as DashboardComponent,
    data: [
      { item: 'Database Backup', detail: 'Scheduled for tonight 02:00 AM', badge: 'Maintenance', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400' },
      { item: 'Server Load High', detail: 'Node 3 is at 85% CPU capacity', badge: 'Warning', color: 'text-orange-600 bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400' },
    ],
    colSpan: 'lg:col-span-1'
  }
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="font-sans p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-3xl p-6 lg:p-8 shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-black text-white">
              cMart Platform Overview
            </h1>
            <p className="text-indigo-100 text-sm">
              Super Admin Dashboard & Analytics
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
              <Shield className="w-3 h-3" />
              All Systems Operational
            </span>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Quick Actions</p>
            <div className="flex gap-3">
              <Link href="/admin/stores" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] transition-all">
                <Store className="w-4 h-4" />
                Manage Stores
              </Link>
              <Link href="/admin/stores/new" className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-5 py-2.5 rounded-xl text-sm border border-white/20 hover:bg-white/25 transition-all">
                <Plus className="w-4 h-4" />
                Add Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {ADMIN_KPIS.map((kpi, idx) => (
          <ComponentPreview 
            key={idx} 
            comp={kpi.comp as any} 
            isEnabled={true} 
            layout="grid" 
            isDashboardView={true} 
            overrideData={kpi.data} 
          />
        ))}
      </div>

      {/* Filter Section for Widgets */}
      <div className="flex justify-end pt-2 pb-2">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          {['24h', '7d', '30d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                timeRange === range 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_WIDGETS.map((widget, idx) => (
          <div key={idx} className={widget.colSpan}>
            <ComponentPreview 
              comp={widget.comp as any} 
              isEnabled={true} 
              layout="grid" 
              isDashboardView={true} 
              overrideData={widget.data} 
            />
          </div>
        ))}
      </div>

    </div>
  );
}
