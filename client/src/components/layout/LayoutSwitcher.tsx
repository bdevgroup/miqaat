import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import type { AppSettings } from '@/types';
import { LayoutGrid } from 'lucide-react';

export type LayoutKey = 'split' | 'splitarc' | 'classic' | 'hero' | 'sunarc' | 'focus';

/**
 * Layout id → i18n keys for name + description. Names are kept short so
 * the trigger button doesn't truncate at the bottom-right of the bar.
 */
export const LAYOUTS: Array<{
  id: LayoutKey;
  nameKey: string;
  descKey: string;
}> = [
  { id: 'split',    nameKey: 'layout.split.name',    descKey: 'layout.split.desc' },
  { id: 'splitarc', nameKey: 'layout.splitarc.name', descKey: 'layout.splitarc.desc' },
  { id: 'classic',  nameKey: 'layout.classic.name',  descKey: 'layout.classic.desc' },
  { id: 'hero',     nameKey: 'layout.hero.name',     descKey: 'layout.hero.desc' },
  { id: 'sunarc',   nameKey: 'layout.sunarc.name',   descKey: 'layout.sunarc.desc' },
  { id: 'focus',    nameKey: 'layout.focus.name',    descKey: 'layout.focus.desc' },
];

export function LayoutSwitcher({ settings }: { settings: AppSettings }) {
  const update = useUpdateSettings();
  const { t } = useI18n();
  const current = (settings.layout as LayoutKey) ?? 'split';
  const currentLayout = LAYOUTS.find((l) => l.id === current);
  const currentName = currentLayout ? t(currentLayout.nameKey) : 'Layout';

  return (
    <Select value={current} onValueChange={(v) => update.mutate({ layout: v })}>
      {/* Trigger renders only the short name — description lives in the
          dropdown, so it never truncates in the bar. */}
      <SelectTrigger className="h-7 w-44 gap-2 px-2 text-xs">
        <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{currentName}</span>
      </SelectTrigger>
      <SelectContent>
        {LAYOUTS.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            <div className="flex flex-col">
              <span className="text-sm">{t(l.nameKey)}</span>
              <span className="text-xs text-muted-foreground">{t(l.descKey)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
