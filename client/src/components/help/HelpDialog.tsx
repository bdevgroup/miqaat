import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle, MapPin, Volume2, Calendar, Compass, Globe,
  Bell, ScrollText, Settings as SettingsIcon, FileSearch, Sparkles,
  ExternalLink, MessageSquarePlus,
} from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { runTour } from '@/lib/tour';
import { useUpdateSettings } from '@/hooks/useSettings';
import { FeedbackDialog } from './FeedbackDialog';

const SUPPORT_EMAIL = 'contact@miqaaat.com';
// Docs site is not live yet — point users at the GitHub repo's README,
// which is real and will redirect to docs once miqaaat.com/docs ships.
const DOCS_URL = 'https://github.com/bdevgroup/miqaat#readme';

interface FeatureSection {
  icon: typeof HelpCircle;
  titleKey: string;
  bodyKey: string;
}

const SECTIONS: FeatureSection[] = [
  { icon: MapPin,      titleKey: 'help.location.title',    bodyKey: 'help.location.body' },
  { icon: Volume2,     titleKey: 'help.athan.title',       bodyKey: 'help.athan.body' },
  { icon: SettingsIcon, titleKey: 'help.calc.title',        bodyKey: 'help.calc.body' },
  { icon: Bell,        titleKey: 'help.notif.title',       bodyKey: 'help.notif.body' },
  { icon: ScrollText,  titleKey: 'help.adjust.title',      bodyKey: 'help.adjust.body' },
  { icon: Compass,     titleKey: 'help.qibla.title',       bodyKey: 'help.qibla.body' },
  { icon: Calendar,    titleKey: 'help.monthly.title',     bodyKey: 'help.monthly.body' },
  { icon: Sparkles,    titleKey: 'help.jumuah.title',      bodyKey: 'help.jumuah.body' },
  { icon: Globe,       titleKey: 'help.theme.title',       bodyKey: 'help.theme.body' },
  { icon: FileSearch,  titleKey: 'help.diagnostics.title', bodyKey: 'help.diagnostics.body' },
  { icon: HelpCircle,  titleKey: 'help.privacy.title',     bodyKey: 'help.privacy.body' },
];

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { t } = useI18n();
  const update = useUpdateSettings();

  const startTour = () => {
    setOpen(false);
    // Small delay so the dialog animates closed before the tour spotlight
    // tries to highlight elements behind it.
    setTimeout(() => {
      runTour(t, {
        onDone: () => update.mutate({ tour_completed: 'true' }),
      });
    }, 220);
  };

  const openExternal = (url: string) => {
    const api = window.electronAPI;
    if (api?.openExternal) void api.openExternal(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-tour="help">
          <HelpCircle className="h-4 w-4" /> {t('ui.help')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-4 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('help.title')}
          </DialogTitle>
          <DialogDescription>{t('help.intro')}</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1 text-sm">
            <div className="font-medium">{t('help.tour.cta.title')}</div>
            <div className="text-xs text-muted-foreground">{t('help.tour.cta.body')}</div>
          </div>
          <Button size="sm" onClick={startTour}>{t('help.tour.cta.button')}</Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <ul className="flex flex-col gap-3">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.titleKey} className="flex gap-3 rounded-md border bg-card/40 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">{t(s.titleKey)}</div>
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                      {t(s.bodyKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Separator className="shrink-0" />

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setOpen(false);
              setTimeout(() => setFeedbackOpen(true), 180);
            }}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {t('help.feedback.button')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => openExternal(DOCS_URL)}
          >
            <ExternalLink className="h-3 w-3" />
            {t('help.docs')}
          </Button>
          <span className="basis-full text-center text-[10px] text-muted-foreground">
            {t('help.contact')}{' '}
            <button
              onClick={() => openExternal(`mailto:${SUPPORT_EMAIL}`)}
              className="font-medium text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </button>
          </span>
        </div>
      </DialogContent>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </Dialog>
  );
}
