'use client';

import { useState } from 'react';
import { 
  Globe2, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, 
  Settings, Link as LinkIcon, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function DomainPage() {
  const [primaryDomain, setPrimaryDomain] = useState('mystore.cmart.lk');
  const [customDomains, setCustomDomains] = useState([
    { id: '1', domain: 'mystore.cmart.lk', status: 'Connected', ssl: 'Active', type: 'System' }
  ]);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleConnectDomain = () => {
    if (!newDomain) {
      toast.error('Please enter a domain name');
      return;
    }
    
    // Mock connection process
    toast.loading('Verifying domain DNS records...', { id: 'domain-connect' });
    
    setTimeout(() => {
      setCustomDomains([
        ...customDomains,
        { id: Math.random().toString(), domain: newDomain, status: 'Pending Verification', ssl: 'Pending', type: 'Custom' }
      ]);
      setNewDomain('');
      setIsAdding(false);
      toast.success('Domain added successfully. DNS verification pending.', { id: 'domain-connect' });
    }, 2000);
  };

  const handleSetPrimary = (domain: string) => {
    setPrimaryDomain(domain);
    toast.success(`${domain} is now your primary domain.`);
  };

  const handleRemove = (id: string, type: string) => {
    if (type === 'System') {
      toast.error('Cannot remove the system default domain.');
      return;
    }
    if(confirm('Are you sure you want to remove this domain connection?')) {
      setCustomDomains(customDomains.filter(d => d.id !== id));
      toast.success('Domain removed');
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden overflow-y-auto">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe2 className="w-8 h-8 text-blue-600" />
            Domains
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage the web address where customers access your online store.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
            Buy New Domain
          </button>
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Connect Existing Domain
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Connect New Domain Form (Inline) */}
        {isAdding && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Connect Existing Domain</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Globe2 className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. www.myawesomestore.com" 
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleConnectDomain} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                  Verify Connection
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>You will need to update your DNS records (A Record and CNAME) at your domain registrar (e.g., GoDaddy, Namecheap) to point to our servers before the connection is successful.</p>
            </div>
          </div>
        )}

        {/* Primary Domain */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Primary Domain</h2>
              <p className="text-sm font-medium text-slate-500">This is the main address customers see in their browser.</p>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                {primaryDomain}
                <a href={`https://${primaryDomain}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> SSL Active
                </span>
                <span className="text-xs font-medium text-slate-500">Auto-renews</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold rounded-lg shadow-sm transition-colors text-sm">
              Change Primary Domain
            </button>
          </div>
        </div>

        {/* All Domains List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Domains</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {customDomains.map((d) => (
              <div key={d.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {d.status === 'Connected' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                      {d.domain}
                      {d.domain === primaryDomain && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm font-medium">
                      <span className={d.status === 'Connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {d.status}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-slate-500">SSL: {d.ssl}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {d.status === 'Pending Verification' && (
                    <button onClick={() => toast.info('Checking DNS records...')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors">
                      Verify Connection
                    </button>
                  )}
                  {d.domain !== primaryDomain && d.status === 'Connected' && (
                    <button onClick={() => handleSetPrimary(d.domain)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors">
                      Set as Primary
                    </button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Settings">
                    <Settings className="w-4 h-4" />
                  </button>
                  {d.type !== 'System' && (
                    <button onClick={() => handleRemove(d.id, d.type)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
