import { PanelRightOpen } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { IconAction } from './IconAction';

export function WidgetToggle() {
  const { t } = useI18n();
  if (typeof window === 'undefined' || !window.electronAPI?.toggleWidget) return null;
  return (
    <IconAction
      label={t('ui.widget.toggle')}
      onClick={() => window.electronAPI?.toggleWidget?.()}
    >
      <PanelRightOpen className="h-4 w-4" />
    </IconAction>
  );
}
