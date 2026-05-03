import { useEffect, useState } from 'react';

export function useUpdater() {
  const supported = typeof window !== 'undefined' && !!window.electronAPI?.getUpdateStatus;
  const [status, setStatus] = useState<UpdaterStatus>({ kind: 'idle' });

  useEffect(() => {
    if (!supported) return;
    let unsubscribe: (() => void) | undefined;
    window.electronAPI!.getUpdateStatus().then(setStatus).catch(() => {});
    unsubscribe = window.electronAPI!.onUpdateStatus((s) => setStatus(s));
    return () => { unsubscribe?.(); };
  }, [supported]);

  return {
    supported,
    status,
    checkForUpdates: () => window.electronAPI?.checkForUpdates(),
    installUpdate: () => window.electronAPI?.installUpdate(),
  };
}
