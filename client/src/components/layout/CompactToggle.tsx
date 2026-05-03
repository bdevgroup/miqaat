import { Minimize2, Maximize2 } from 'lucide-react';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import { IconAction } from './IconAction';
import type { AppSettings } from '@/types';

export function CompactToggle({ settings }: { settings: AppSettings }) {
  const update = useUpdateSettings();
  const { t } = useI18n();
  const compact = settings.compact_mode === 'true';
  return (
    <IconAction
      label={compact ? t('ui.compact.exit') : t('ui.compact.enter')}
      onClick={() => update.mutate({ compact_mode: compact ? 'false' : 'true' })}
    >
      {compact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
    </IconAction>
  );
}
