import { Moon, Sun, BookOpen, Sunrise } from 'lucide-react';
import { useApplyTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/i18n/useI18n';
import { IconAction } from './IconAction';
import type { ThemeMode } from '@/types';

const ICONS: Record<ThemeMode, typeof Moon> = {
  miqat: Sunrise,
  light: Sun,
  dark: Moon,
  paper: BookOpen,
};
const NEXT: Record<ThemeMode, ThemeMode> = {
  miqat: 'light',
  light: 'dark',
  dark: 'paper',
  paper: 'miqat',
};

export function ThemeToggle() {
  const { theme, setTheme } = useApplyTheme();
  const { t } = useI18n();
  const Icon = ICONS[theme];
  const nextLabel = t(`settings.theme.${NEXT[theme]}`);
  return (
    <IconAction
      label={`${t('ui.theme.switch')} → ${nextLabel}`}
      onClick={() => setTheme(NEXT[theme])}
    >
      <Icon className="h-4 w-4" />
    </IconAction>
  );
}
