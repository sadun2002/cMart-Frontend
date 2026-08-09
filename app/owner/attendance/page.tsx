'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, CheckCircle, Clock, Calendar, ShieldAlert,
  Maximize, Minimize, Fingerprint, History, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';

// Dummy data for initial employees and punches
const DUMMY_EMPLOYEES = [
  { id: 1, name: 'Kamal Perera', role: 'Cashier' },
  { id: 2, name: 'Nimal Silva', role: 'Store Manager' },
  { id: 3, name: 'Sunil Fernando', role: 'Sales Rep' },
  { id: 4, name: 'Amara Wijesinghe', role: 'Cashier' },
];

export default function AttendancePage() {
  const [isKioskMode, setIsKioskMode] = useState(false);
  
  // Real-time clock for Kiosk Mode
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance state
  const [punches, setPunches] = useState<any[]>([
    { id: 101, employeeId: 1, name: 'Kamal Perera', type: 'Check In', time: new Date(new Date().setHours(8, 5, 0)), status: 'On Time' },
    { id: 102, employeeId: 2, name: 'Nimal Silva', type: 'Check In', time: new Date(new Date().setHours(8, 15, 0)), status: 'Late' },
  ]);

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
    const randomEmp = DUMMY_EMPLOYEES[Math.floor(Math.random() * DUMMY_EMPLOYEES.length)];
    const existingPunch = punches.find(p => p.employeeId === randomEmp.id);
    const type = existingPunch && existingPunch.type === 'Check In' ? 'Check Out' : 'Check In';
    
    const newPunch = {
      id: Date.now(),
      employeeId: randomEmp.id,
      name: randomEmp.name,
      type,
      time: new Date(),
      status: type === 'Check In' ? 'Late' : 'Completed' // simplified logic
    };

    setPunches(prev => [newPunch, ...prev]);

    // Play a beep sound if possible (audio might be blocked without user interaction, but we'll try)
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
    const total = DUMMY_EMPLOYEES.length;
    const present = new Set(punches.filter(p => p.type === 'Check In').map(p => p.employeeId)).size;
    const absent = total - present;
    const late = punches.filter(p => p.type === 'Check In' && p.status === 'Late').length;

    return { total, present, absent, late };
  }, [punches]);

  // Format time beautifully
  const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden relative">
      
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
                className="absolute top-8 right-8 p-3 bg-slate-200/50 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-full backdrop-blur-md transition-all"
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

              {/* Temporary Button to simulate hardware punch */}
              <button 
                onClick={simulatePunch}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all text-sm font-bold tracking-widest uppercase"
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
                    {punches.slice(0, 15).map((punch, idx) => (
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
                              <Clock className="w-3 h-3" /> {punch.time.toLocaleTimeString()}
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
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
              >
                <Fingerprint className="w-5 h-5" />
                Simulate Punch
              </button>
              <button 
                onClick={toggleKioskMode}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Maximize className="w-5 h-5" />
                Enter Kiosk Mode
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard 
              title="Total Employees" 
              value={kpis.total} 
              icon={Users} 
              iconColorClass="text-blue-600" 
              iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
            />
            <KpiCard 
              title="Present Today" 
              value={kpis.present} 
              icon={CheckCircle} 
              iconColorClass="text-emerald-600" 
              iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
            />
            <KpiCard 
              title="Late Arrivals" 
              value={kpis.late} 
              icon={Clock} 
              iconColorClass="text-orange-600" 
              iconBgClass="bg-orange-50 dark:bg-orange-500/10" 
            />
            <KpiCard 
              title="Absent" 
              value={kpis.absent} 
              icon={ShieldAlert} 
              iconColorClass="text-red-600" 
              iconBgClass="bg-red-50 dark:bg-red-500/10" 
            />
          </div>

          {/* ATTENDANCE LOG */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-0">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Today's Logs
              </h2>
            </div>
            
            <div className="flex-1 overflow-auto">
              {punches.length === 0 ? (
                <div className="font-sans h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No punches yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Employees haven't checked in or out today.
                  </p>
                </div>
              ) : (
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
                    {punches.map((punch) => (
                      <tr key={punch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {punch.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{punch.name}</span>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {DUMMY_EMPLOYEES.find(e => e.id === punch.employeeId)?.role || 'Employee'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {punch.time.toLocaleTimeString()}
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
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
