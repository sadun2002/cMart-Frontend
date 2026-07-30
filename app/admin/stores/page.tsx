'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/constants';

interface Store {
  id: number;
  businessName: string;
  subdomain: string;
  plan: string;
  active: boolean;
  suspended: boolean;
  createdAt: string;
  owner: {
    name: string;
    email: string;
  };
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchStores = async () => {
    try {
      const response = await api.get('/admin/stores');
      setStores(response.data);
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const toggleStoreStatus = async (id: number, currentSuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentSuspended ? 'reactivate' : 'suspend'} this store?`)) return;
    
    setProcessingId(id);
    try {
      await api.patch(`/admin/stores/${id}/status`, { suspend: !currentSuspended });
      toast.success(`Store successfully ${currentSuspended ? 'reactivated' : 'suspended'}`);
      fetchStores();
    } catch (error) {
      toast.error('Failed to update store status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Stores</h1>
          <p className="text-gray-500">View and manage all SaaS tenants.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No stores registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Business Name</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Domain</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{store.businessName}</td>
                    <td className="px-6 py-4">
                      <div>{store.owner?.name}</div>
                      <div className="text-xs text-gray-500">{store.owner?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`http://${store.subdomain}.localhost:3000`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        {store.subdomain}.cmart.lk
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {store.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {store.suspended ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full">Suspended</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(store.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={processingId === store.id}
                        onClick={() => toggleStoreStatus(store.id, store.suspended)}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                          store.suspended 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {processingId === store.id ? 'Processing...' : store.suspended ? 'Reactivate' : 'Suspend'}
                      </button>
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
