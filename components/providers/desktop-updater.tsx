'use client';

import { useEffect } from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { ask } from '@tauri-apps/plugin-dialog';
import { open } from '@tauri-apps/plugin-shell';
import { getVersion } from '@tauri-apps/api/app';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

// Strips /api/v1 suffix to get base server URL
function getApiBaseUrl(): string {
  // Remove trailing /api/v1 if present so we can use it directly
  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return base; // e.g. http://localhost:3001
}

export function DesktopUpdater() {
  useEffect(() => {
    // Only run inside the Tauri environment
    if (typeof window === 'undefined') return;
    // @ts-ignore
    if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) return;

    // Check on startup
    checkForUpdates();

    // Check again if the user reconnects to the internet
    const handleOnline = () => checkForUpdates();
    window.addEventListener('online', handleOnline);

    // Check automatically every 4 hours if the app is left open
    const intervalId = setInterval(checkForUpdates, 4 * 60 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      // @ts-ignore
      if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) return;

      const currentVersion = await getVersion();
      const baseUrl = getApiBaseUrl();

      // Call our backend: GET /api/v1/api/releases/latest/windows/x86_64/<current_version>
      // Tauri sends target as "windows", arch as "x86_64" — we combine as "windows-x86_64" on backend
      const response = await axios.get(
        `${baseUrl}/api/v1/api/releases/latest/windows/x86_64/${currentVersion}`,
        {
          timeout: 10000,
          validateStatus: (status) => status < 500, // Don't throw on 204
        }
      );

      if (response.status === 204 || !response.data?.version) {
        // No update available
        console.log('[Updater] No update available. Current:', currentVersion);
        return;
      }

      const latest = response.data;
      console.log('[Updater] Update found:', latest.version, '(current:', currentVersion + ')');

      const shouldUpdate = await ask(
        `cMart POS v${latest.version} is now available!\n\nRelease notes:\n${latest.notes || 'Bug fixes and improvements.'}\n\nDo you want to download the new version now?`,
        {
          title: '🎉 Update Available',
          kind: 'info',
          okLabel: 'Yes, download now',
          cancelLabel: 'Remind me later',
        }
      );

      if (shouldUpdate) {
        // Get the download URL
        const platformKey = 'windows-x86_64';
        const downloadUrl = latest.platforms?.[platformKey]?.url || latest.url;

        if (downloadUrl) {
          // Open the download URL in the browser so the user can download and install
          await open(downloadUrl);
        } else {
          console.error('[Updater] No download URL found in response:', latest);
        }
      }
    } catch (error) {
      // Silently fail — don't bother the user if update check fails
      console.warn('[Updater] Update check failed:', error);
    }
  };

  return null;
}
