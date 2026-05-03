import { useCallback, useEffect, useMemo } from 'react';
import { translate, LANGS, type Lang } from './dict';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

export function useI18n() {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();

  const lang = (settings?.language as Lang) ?? 'en';
  const dir = LANGS.find((l) => l.id === lang)?.dir ?? 'ltr';

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dir);
  }, [lang, dir]);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return useMemo(
    () => ({
      t, lang, dir,
      setLang: (l: Lang) => update.mutate({ language: l }),
    }),
    [t, lang, dir, update],
  );
}
