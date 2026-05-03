import type { Lang } from '@/i18n/dict';
import type { Reciter, RadioStation } from '@/types';

/**
 * Pick the locale-appropriate `(name, who)` pair for a Reciter or
 * RadioStation. Falls back to the canonical (Latin) name when no Arabic
 * variant is provided — keeps the helper safe to use across the codebase
 * even if a future entry forgets `nameAr`.
 */
export function pickName(
  entry: Pick<Reciter, 'name' | 'who' | 'nameAr' | 'whoAr'> | undefined,
  lang: Lang,
): { name: string; who: string } {
  if (!entry) return { name: '', who: '' };
  if (lang === 'ar') {
    return {
      name: entry.nameAr ?? entry.name,
      who: entry.whoAr ?? entry.who,
    };
  }
  return { name: entry.name, who: entry.who };
}

export function pickStationName(
  entry: RadioStation | undefined,
  lang: Lang,
): { name: string; who: string } {
  return pickName(entry, lang);
}
