'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { DownloadCloud, Plus, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminReleasesPage() {
  const { user } = useAuthStore();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingExe, setUploadingExe] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  // Form states
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState('windows-x86_64');
  const [exeUrl, setExeUrl] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const res = await api.get('/admin/releases');
      setReleases(res.data);
    } catch (error) {
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'exe' | 'sig') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (type === 'exe') setUploadingExe(true);
      else setUploadingSig(true);

      const res = await api.post('/admin/releases/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (type === 'exe') {
        setExeUrl(res.data.url);
        toast.success('Executable uploaded');
      } else {
        // If it's a .sig file, we should read its text content
        const text = await file.text();
        setSignature(text.trim());
        toast.success('Signature extracted');
      }
    } catch (error) {
      toast.error(`Failed to upload ${type.toUpperCase()}`);
    } finally {
      if (type === 'exe') setUploadingExe(false);
      else setUploadingSig(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !exeUrl || !signature) {
      return toast.error('Version, EXE URL, and Signature are required');
    }

    setSubmitting(true);
    try {
      await api.post('/admin/releases', {
        version,
        notes,
        target,
        url: exeUrl,
        signature,
      });
      toast.success('Release published successfully!');
      setShowModal(false);
      setVersion('');
      setNotes('');
      setExeUrl('');
      setSignature('');
      fetchReleases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish release');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Desktop Releases</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Manage Tauri app updates and versions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Release
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/50">
              <th className="p-4">Version</th>
              <th className="p-4">Target</th>
              <th className="p-4">Published</th>
              <th className="p-4">Downloads</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {releases.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No releases found.</td>
              </tr>
            ) : (
              releases.map((release) => (
                <tr key={release.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{release.version}</td>
                  <td className="p-4 text-gray-500">{release.target}</td>
                  <td className="p-4 text-gray-500">{new Date(release.pub_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <a href={`${api.defaults.baseURL}/api/releases/${release.id}/download`} className="text-blue-600 hover:underline flex items-center gap-1"><DownloadCloud className="w-4 h-4"/> Download EXE</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Publish New Release</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Version (e.g. 0.2.0)</label>
                  <input required value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Target</label>
                  <input required value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Release Notes</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Upload Installer (.exe)</label>
                <input type="file" accept=".exe,.msi" onChange={e => handleFileUpload(e, 'exe')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploadingExe && <div className="text-xs text-blue-600 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading...</div>}
                {exeUrl && <div className="text-xs text-green-600 mt-2">✓ Uploaded successfully</div>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Upload Signature (.sig)</label>
                <input type="file" accept=".sig" onChange={e => handleFileUpload(e, 'sig')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploadingSig && <div className="text-xs text-blue-600 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Extracting signature...</div>}
                {signature && <div className="text-xs text-green-600 mt-2 truncate">✓ Extracted: {signature.substring(0, 20)}...</div>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting || uploadingExe || uploadingSig || !exeUrl || !signature} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 transition-all">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Publish Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
