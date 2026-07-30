'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, TrendingUp, Receipt, LogIn, LogOut, ShoppingCart, Calendar, Timer } from 'lucide-react';
import { employeeAPI } from '@/lib/api';
import { toast } from 'sonner';
import { formatLKR, formatDateTime } from '@/lib/constants';

export default function EmployeeDashboard() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, salesRes] = await Promise.all([
        employeeAPI.getMyAttendance(),
        employeeAPI.getMySales(),
      ]);
      setAttendance(attRes.data);
      setSales(salesRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await employeeAPI.checkIn();
      toast.success('Punched In successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to punch in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeAPI.checkOut();
      toast.success('Punched Out successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to punch out');
    }
  };

  const todayStr = time.toDateString();
  const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === todayStr);
  
  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = todayAttendance?.checkOut;

  const todaysSales = sales.filter(s => new Date(s.createdAt).toDateString() === todayStr);
  const totalSalesAmount = todaysSales.reduce((acc, curr) => acc + curr.amountLKR, 0);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">Loading shift data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Shift Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Track attendance and performance</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 relative z-10">
        {/* ── Time Clock Card ── */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
          <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Time Clock
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-5xl font-black text-gray-900 dark:text-white font-mono tracking-wider tabular-nums">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-bold shadow-inner ${
                isCheckedIn
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : isCheckedOut
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              }`}>
                {isCheckedIn ? <CheckCircle2 className="w-4 h-4" /> : isCheckedOut ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {isCheckedIn ? 'ON SHIFT' : isCheckedOut ? 'SHIFT ENDED' : 'OFF SHIFT'}
              </span>
            </div>

            <div className="flex gap-4 max-w-xs mx-auto">
              <Button
                size="lg"
                className="flex-1 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20 rounded-xl h-11"
                disabled={isCheckedIn || isCheckedOut}
                onClick={handleCheckIn}
              >
                <LogIn className="w-4 h-4" />
                PUNCH IN
              </Button>
              <Button
                size="lg"
                className="flex-1 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-red-900/20 rounded-xl h-11"
                disabled={!isCheckedIn}
                onClick={handleCheckOut}
              >
                <LogOut className="w-4 h-4" />
                PUNCH OUT
              </Button>
            </div>

            {todayAttendance && (
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-sm text-gray-500 dark:text-slate-400 flex justify-between px-4">
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-green-500" />
                  In: {todayAttendance.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
                <span className="flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Out: {todayAttendance.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Performance Card ── */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
          <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Today&apos;s Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Sales</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatLKR(totalSalesAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Transactions</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{todaysSales.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Recent Transactions
              </h3>
              <div className="space-y-2">
                {todaysSales.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-slate-500">No sales processed today.</p>
                  </div>
                ) : (
                  todaysSales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all hover:shadow-md">
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">Order #{sale.id}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{formatDateTime(sale.createdAt)}</div>
                      </div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">{formatLKR(sale.amountLKR)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {[
          { label: 'Total Attendance', value: attendance.length.toString(), icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'This Week Sales', value: formatLKR(sales.filter(s => {
            const d = new Date(s.createdAt);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return d >= weekAgo;
          }).reduce((acc, curr) => acc + curr.amountLKR, 0)), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Current Shift', value: isCheckedIn ? 'Active' : isCheckedOut ? 'Ended' : 'Not started', icon: Clock, color: isCheckedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400', bg: isCheckedIn ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-slate-800' },
          { label: 'Days Active', value: new Set(attendance.map(a => new Date(a.date).toDateString())).size.toString(), icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}