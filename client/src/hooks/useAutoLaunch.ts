import { useEffect, useState } from 'react';

export function useAutoLaunch() {
  const supported = typeof window !== 'undefined' && !!window.electronAPI;
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(!supported);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    window.electronAPI!.getAutoLaunch().then((v) => {
      if (!cancelled) {
        setEnabled(v);
        setReady(true);
      }
    }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [supported]);

  const toggle = async (v: boolean) => {
    if (!supported) return;
    const final = await window.electronAPI!.setAutoLaunch(v);
    setEnabled(final);
  };

  return { supported, enabled, ready, toggle };
}
