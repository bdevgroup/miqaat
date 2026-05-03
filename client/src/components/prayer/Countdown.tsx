import { useTick } from '@/contexts/TickContext';
import { diffHumanHMS, UNIT_SUFFIX } from '@/lib/time';
import { useI18n } from '@/i18n/useI18n';

export function Countdown({ toIso, className }: { toIso: string | null; className?: string }) {
  const now = useTick();
  const { lang } = useI18n();
  if (!toIso) return <span className={className}>—</span>;
  // dir="ltr" so the unit-suffixed digits never get visually reordered when
  // the page is RTL — a countdown like "1h 21m 06s" must always read L→R.
  return (
    <span className={className} dir="ltr">
      {diffHumanHMS(toIso, now, UNIT_SUFFIX[lang])}
    </span>
  );
}
