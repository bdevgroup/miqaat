import { CheckCircle2, CloudOff, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

/**
 * Discreet "verified" badge — replaces the previous "SOURCE: ALADHAN · CACHED"
 * tracking-wide caps that read as engineer output to non-technical users.
 * Hover/focus reveals the underlying detail (provider + cache state).
 */
export function PrayerSourceBadge({
  source,
  cached,
  className,
}: {
  source: 'local' | 'aladhan';
  cached: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const verified = source === 'aladhan';
  const Icon = verified ? CheckCircle2 : CloudOff;
  const label = verified ? t('source.verified') : t('source.offline');
  const detail = cached ? t('source.cached') : t('source.fresh');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border bg-card/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent/40',
            className,
          )}
          aria-label={`${label} · ${detail}`}
        >
          <Icon
            className={cn(
              'h-3 w-3',
              verified ? 'text-emerald-500/80' : 'text-amber-500/80',
            )}
          />
          <span>{label}</span>
          <Info className="h-3 w-3 opacity-50" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{label}</span>
          <span className="opacity-80">
            {verified ? t('source.verified.detail') : t('source.offline.detail')}
          </span>
          <span className="opacity-60">
            {detail}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
