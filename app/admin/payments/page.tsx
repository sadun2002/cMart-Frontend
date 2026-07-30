'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatLKR, formatDateTime } from '@/lib/constants';

interface Payment {
  id: number;
  amountLKR: string;
  status: string;
  payhereRef: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
  subscription: {
    plan: string;
    tenant: {
      businessName: string;
      subdomain: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments');
      setPayments(response.data);
    } catch (error) {
      toast.error('Failed to load payments history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="flex-1 p-8 space-y-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Revenue</h1>
          <p className="text-gray-500">Track all SaaS subscription payments from stores.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Store</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payment.subscription.tenant.businessName}</div>
                      <div className="text-xs text-gray-500">{payment.subscription.tenant.subdomain}.cmart.lk</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateTime(payment.paidAt || payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatLKR(Number(payment.amountLKR))}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'COMPLETED' ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Completed</span>
                      ) : payment.status === 'PENDING' ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">Pending</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full">{payment.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {payment.payhereRef || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
