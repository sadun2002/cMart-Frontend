'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { toast } from 'sonner';
import { UpdateNotification } from './update-notification';

export function DesktopUpdater() {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({
    currentVersion: '',
    newVersion: '',
    notes: '',
  });
  const [downloadProgress, setDownloadProgress] = useState<number>(-1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [laterCount, setLaterCount] = useState(0);

  // Store the Tauri update object so we can call downloadAndInstall on it later
  const updateRef = useRef<Update | null>(null);

  const checkForUpdates = useCallback(async (isManualCheck = false) => {
    try {
      // @ts-ignore
      if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) return;

      const currentVersion = await getVersion();

      // Check if we should suppress the check for auto-checks
      if (!isManualCheck) {
        // Only suppress if later count < 3 and dismissed within 24 hours
        const count = parseInt(localStorage.getItem('cmart-update-later-count') || '0', 10);
        setLaterCount(count);

        if (count < 3) {
          const lastChecked = localStorage.getItem('cmart-update-dismissed');
          if (lastChecked) {
            const timestamp = parseInt(lastChecked, 10);
            const hoursSinceLastCheck = (Date.now() - timestamp) / (1000 * 60 * 60);
            // TEMPORARILY DISABLED FOR TESTING:
            // Don't check automatically if dismissed within the last 24 hours
            // if (hoursSinceLastCheck < 24) return;
          }
        }
      }

      // Use Tauri's native updater API
      const update = await check();

      if (!update) {
        console.log('[Updater] No update available. Current:', currentVersion);
        return;
      }

      console.log('[Updater] Update found:', update.version, '(current:', currentVersion + ')');
      
      updateRef.current = update;

      setUpdateInfo({
        currentVersion,
        newVersion: update.version,
        notes: update.body || 'Bug fixes and performance improvements.',
      });
      setIsUpdateOpen(true);
    } catch (error: any) {
      console.warn('[Updater] Update check failed:', error);
      toast.error('Updater Error: ' + (error?.message || String(error)), { duration: 10000 });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) return;

    setLaterCount(parseInt(localStorage.getItem('cmart-update-later-count') || '0', 10));

    const startupTimeout = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    const handleOnline = () => checkForUpdates();
    window.addEventListener('online', handleOnline);

    const intervalId = setInterval(() => checkForUpdates(), 4 * 60 * 60 * 1000);

    return () => {
      clearTimeout(startupTimeout);
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  }, [checkForUpdates]);

  const handleUpdate = async () => {
    if (!updateRef.current) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      let downloaded = 0;
      let contentLength = 0;

      await updateRef.current.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              const percentage = (downloaded / contentLength) * 100;
              setDownloadProgress(percentage > 100 ? 100 : percentage);
            }
            break;
          case 'Finished':
            setDownloadProgress(100);
            break;
        }
      });

      console.log('Update downloaded successfully');
      
      // Reset later count on successful update download
      localStorage.removeItem('cmart-update-later-count');
      localStorage.removeItem('cmart-update-dismissed');
      
      // Stop downloading state and show restart buttons
      setIsDownloading(false);
      setIsDownloaded(true);
    } catch (error: any) {
      console.error('Failed to install update:', error);
      toast.error('Download Error: ' + (error?.message || String(error)), { duration: 10000 });
      setIsDownloading(false);
      setDownloadProgress(-1);
    }
  };

  const handleLater = () => {
    const newCount = laterCount + 1;
    setLaterCount(newCount);
    localStorage.setItem('cmart-update-later-count', newCount.toString());
    
    if (newCount < 3) {
      localStorage.setItem('cmart-update-dismissed', Date.now().toString());
    }
    
    setIsUpdateOpen(false);
  };

  const handleRestartNow = async () => {
    await relaunch();
  };

  const handleRestartLater = () => {
    setIsUpdateOpen(false);
  };

  return (
    <UpdateNotification
      isOpen={isUpdateOpen}
      currentVersion={updateInfo.currentVersion}
      newVersion={updateInfo.newVersion}
      releaseNotes={updateInfo.notes}
      downloadProgress={downloadProgress}
      laterCount={laterCount}
      isDownloading={isDownloading}
      isDownloaded={isDownloaded}
      onUpdate={handleUpdate}
      onLater={handleLater}
      onRestartNow={handleRestartNow}
      onRestartLater={handleRestartLater}
    />
  );
}
