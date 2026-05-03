import { useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import type { ThemeMode } from '@/types';

const CLASSES: Record<ThemeMode, string> = {
  light: '',
  dark: 'dark',
  paper: 'paper',
  miqat: 'miqat',
};

export function useApplyTheme(): { theme: ThemeMode; setTheme: (t: ThemeMode) => void } {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const theme = (settings?.theme ?? 'miqat') as ThemeMode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'paper', 'miqat');
    const cls = CLASSES[theme];
    if (cls) root.classList.add(cls);
  }, [theme]);

  return {
    theme,
    setTheme: (t: ThemeMode) => update.mutate({ theme: t }),
  };
}
