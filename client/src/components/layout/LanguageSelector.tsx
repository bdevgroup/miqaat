import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { LANGS } from '@/i18n/dict';
import { useI18n } from '@/i18n/useI18n';

export function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const current = LANGS.find((l) => l.id === lang);
  return (
    <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
      {/* Trigger renders only the language code — full native name lives in
          the dropdown, so the bar control never truncates. */}
      <SelectTrigger className="h-7 w-16 gap-1 px-2 text-xs">
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium uppercase tracking-wider">{current?.id ?? lang}</span>
      </SelectTrigger>
      <SelectContent align="end">
        {LANGS.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs uppercase">{l.id}</span>
              <span className="text-xs text-muted-foreground">{l.native}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
