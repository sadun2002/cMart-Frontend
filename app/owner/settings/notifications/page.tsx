'use client';

import { Bell } from 'lucide-react';

const notificationGroups = [
  {
    label: 'Sales & Orders',
    items: [
      { key: 'newOrder', label: 'New Order Received', default: true },
      { key: 'orderCompleted', label: 'Order Completed', default: true },
      { key: 'paymentFailed', label: 'Payment Failed', default: false },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { key: 'lowStock', label: 'Low Stock Alert', default: true },
      { key: 'outOfStock', label: 'Out of Stock', default: true },
      { key: 'restockConfirmed', label: 'Restock Confirmed', default: false },
    ],
  },
  {
    label: 'Employees',
    items: [
      { key: 'employeeCheckIn', label: 'Employee Check In/Out', default: true },
      { key: 'newEmployee', label: 'New Employee Added', default: false },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'backupComplete', label: 'Backup Complete', default: true },
      { key: 'updateAvailable', label: 'Update Available', default: false },
    ],
  },
];

export default function NotificationsPage() {
  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Bell className="w-7 h-7 text-gray-900 dark:text-white" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configure which notifications you receive</p>
        </div>
      </div>

      {notificationGroups.map((group) => (
        <div key={group.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{group.label}</h3>
          {group.items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <label htmlFor={item.key} className="text-sm text-gray-700 dark:text-slate-300 cursor-pointer">{item.label}</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id={item.key} defaultChecked={item.default} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}