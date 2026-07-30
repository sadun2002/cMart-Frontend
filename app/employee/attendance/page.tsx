'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle2, XCircle, LogIn, LogOut, CalendarDays } from 'lucide-react';
import { employeeAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function EmployeeAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getMyAttendance();
      setAttendance(res.data);
    } catch (err) {
      toast.error('Failed to load attendance data');
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

  const todayStr = new Date().toDateString();
  const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === todayStr);
  
  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = todayAttendance?.checkOut;

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 animate-pulse">Loading attendance...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Time & Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Punch in for your shift and view history</p>
        </div>
      </div>

      {/* Live Clock + Shift Status */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-3xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Clock */}
            <div className="text-center md:text-left space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">Current Time</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tabular-nums">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Status */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-inner ${
                isCheckedIn
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : isCheckedOut
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              }`}>
                {isCheckedIn ? <CheckCircle2 className="w-4 h-4" /> : isCheckedOut ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {isCheckedIn ? 'ON SHIFT' : isCheckedOut ? 'SHIFT ENDED' : 'OFF SHIFT'}
              </span>
              {todayAttendance?.checkIn && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                  Punched in at {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center md:justify-end">
              <Button
                size="lg"
                className="flex-1 md:w-auto font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/20 rounded-xl h-11 px-6"
                disabled={isCheckedIn || isCheckedOut}
                onClick={handleCheckIn}
              >
                <LogIn className="w-4 h-4" />
                PUNCH IN
              </Button>
              <Button
                size="lg"
                className="flex-1 md:w-auto font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/20 rounded-xl h-11 px-6"
                disabled={!isCheckedIn}
                onClick={handleCheckOut}
              >
                <LogOut className="w-4 h-4" />
                PUNCH OUT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift History */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-3xl">
        <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Shift History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Punch In</TableHead>
                <TableHead>Punch Out</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No attendance records found.</TableCell></TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--:--'}</TableCell>
                    <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--:--'}</TableCell>
                    <TableCell>{record.hoursWorked ? `${record.hoursWorked.toFixed(2)} hrs` : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'PRESENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        record.status === 'LATE' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
