'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRight,
  Terminal,
  Code,
  BookOpen,
  Settings,
  Lock,
  Database,
  Search,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

const DOCS_NAV = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: ['Introduction', 'Quickstart Guide', 'Architecture Overview']
  },
  {
    title: 'Core Concepts',
    icon: Database,
    items: ['Products & Inventory', 'Orders & Checkout', 'Customers']
  },
  {
    title: 'REST API',
    icon: Terminal,
    items: ['Authentication', 'Pagination', 'Rate Limits', 'Errors']
  },
  {
    title: 'Webhooks',
    icon: Code,
    items: ['Event Types', 'Signature Verification', 'Retries']
  },
  {
    title: 'Security',
    icon: Lock,
    items: ['API Keys', 'OAuth 2.0', 'Permissions']
  }
];

export default function DocumentationPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <SiteHeader />

      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-24 flex flex-col md:flex-row gap-8 relative">
        
        {/* Left Sidebar (Desktop only) */}
        <aside className="hidden md:block w-64 shrink-0 mt-8">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-6 custom-scrollbar">
            
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="Search docs..."
              />
            </div>

            <div className="space-y-8">
              {DOCS_NAV.map((section, idx) => (
                <div key={idx}>
                  <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3 text-sm">
                    <section.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {section.title}
                  </h4>
                  <ul className="space-y-1.5 border-l border-gray-100 dark:border-slate-800 ml-2 pl-4">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link 
                          href="#"
                          className={`block text-sm py-1 transition-colors ${
                            idx === 2 && itemIdx === 0 
                              ? 'text-blue-600 dark:text-blue-400 font-bold' 
                              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose prose-lg prose-blue dark:prose-invert max-w-3xl"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
              <span>REST API</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Authentication</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Authentication
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed mb-10">
              The cMart API uses API keys to authenticate requests. You can view and manage your API keys in the cMart Dashboard under Developer Settings.
            </p>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl mb-10 text-blue-800 dark:text-blue-200">
              <strong className="font-bold flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4" /> Keep your keys secure
              </strong>
              <p className="text-sm m-0">Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              Bearer Token
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Authentication to the API is performed via HTTP Bearer Auth. Provide your API key as the bearer token value in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm text-pink-600 dark:text-pink-400 font-mono">Authorization</code> header.
            </p>

            {/* Code Block */}
            <div className="relative group rounded-2xl overflow-hidden bg-[#0d1117] mb-10 border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400">cURL</span>
                <button 
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  title="Copy code"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto text-gray-300 m-0">
                <code className="block">
<span className="text-blue-400">curl</span> https://api.cmart.com/v1/orders \<br/>
  -H <span className="text-emerald-400">"Authorization: Bearer &lt;YOUR_API_KEY&gt;"</span>
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              Error handling
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              All API requests must be made over HTTPS. Calls made over plain HTTP will fail. API requests without authentication will also fail with a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm text-pink-600 dark:text-pink-400 font-mono">401 Unauthorized</code> response.
            </p>

            <table className="w-full text-left border-collapse mt-8 mb-12 text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-800">
                  <th className="py-3 pr-4 font-bold text-gray-900 dark:text-white">Status Code</th>
                  <th className="py-3 px-4 font-bold text-gray-900 dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-slate-400">
                <tr className="border-b border-gray-100 dark:border-slate-800/50">
                  <td className="py-3 pr-4 font-mono text-pink-600 dark:text-pink-400">401 Unauthorized</td>
                  <td className="py-3 px-4">No valid API key provided.</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-slate-800/50">
                  <td className="py-3 pr-4 font-mono text-pink-600 dark:text-pink-400">403 Forbidden</td>
                  <td className="py-3 px-4">The API key doesn't have permissions to perform the request.</td>
                </tr>
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <Link href="#" className="flex flex-col text-left group">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Previous</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Architecture Overview</span>
              </Link>
              <Link href="#" className="flex flex-col text-right group">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Next</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Pagination</span>
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Right Sidebar (Table of Contents - Desktop only) */}
        <aside className="hidden xl:block w-56 shrink-0 mt-8">
          <div className="sticky top-24">
            <h5 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4">On this page</h5>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#" className="text-blue-600 dark:text-blue-400 transition-colors">Authentication</a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Bearer Token</a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Error handling</a>
              </li>
            </ul>
          </div>
        </aside>

      </div>

      <SiteFooter />
    </div>
  );
}
