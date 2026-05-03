import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HandHeart, ExternalLink, Mail, Copy } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { toast } from 'sonner';

const PAYPAL_URL = 'https://paypal.me/bitardev';
const SUPPORT_EMAIL = 'contact@miqaaat.com';
const MAILTO_SUBJECT = encodeURIComponent('Miqāt — Zakat / Sadaqa inquiry');

export function SupportDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const openExternal = async (url: string) => {
    const api = window.electronAPI;
    if (api?.openExternal) {
      const r = await api.openExternal(url);
      if (!r.ok) toast.error(r.reason ?? t('support.open_failed'));
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success(t('support.email_copied'));
    } catch {
      toast.error(t('support.email_copy_failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" title={t('support.title')}>
          <HandHeart className="h-4 w-4" /> {t('support.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('support.title')}</DialogTitle>
          <DialogDescription>{t('support.desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-md border bg-card p-4">
            <h3 className="text-sm font-semibold">{t('support.donate.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('support.donate.desc')}</p>
            <Button
              size="sm"
              className="gap-2 self-start"
              onClick={() => openExternal(PAYPAL_URL)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t('support.donate.cta')}
            </Button>
          </section>

          <Separator />

          <section className="flex flex-col gap-2 rounded-md border bg-card p-4">
            <h3 className="text-sm font-semibold">{t('support.zakat.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('support.zakat.desc')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => openExternal(`mailto:${SUPPORT_EMAIL}?subject=${MAILTO_SUBJECT}`)}
              >
                <Mail className="h-3.5 w-3.5" />
                {t('support.zakat.email_cta')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 font-mono text-xs"
                onClick={copyEmail}
                title={t('support.copy_email')}
              >
                <Copy className="h-3 w-3" />
                {SUPPORT_EMAIL}
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
