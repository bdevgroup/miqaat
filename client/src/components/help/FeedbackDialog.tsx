import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bug, Lightbulb, MessageSquare, Send, Copy, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { toast } from 'sonner';

const SUPPORT_EMAIL = 'contact@miqaaat.com';
const APP_VERSION = '1.0.0';

type FeedbackType = 'bug' | 'feature' | 'feedback';

const TYPE_META: Record<FeedbackType, { icon: typeof Bug; subjectPrefix: string }> = {
  bug:      { icon: Bug,           subjectPrefix: '[Bug]' },
  feature:  { icon: Lightbulb,     subjectPrefix: '[Feature]' },
  feedback: { icon: MessageSquare, subjectPrefix: '[Feedback]' },
};

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const [type, setType] = useState<FeedbackType>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setType('bug');
    setSubject('');
    setMessage('');
    setEmail('');
  };

  /**
   * Build a structured plaintext body so the receiving inbox can triage at
   * a glance. Includes app version + platform so we don't have to play
   * twenty questions to reproduce.
   */
  const buildBody = (): string => {
    const platform = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    return [
      `Type: ${type}`,
      `Subject: ${subject || '(none)'}`,
      email ? `Reply-to: ${email}` : null,
      `App version: ${APP_VERSION}`,
      `Platform: ${platform}`,
      `User agent: ${ua}`,
      '',
      '--- Message ---',
      message || '(empty)',
    ].filter(Boolean).join('\n');
  };

  const buildSubject = (): string => {
    const prefix = TYPE_META[type].subjectPrefix;
    const trimmed = subject.trim();
    return trimmed ? `${prefix} ${trimmed}` : `${prefix} ${t('feedback.subject.placeholder')}`;
  };

  const submit = async () => {
    if (!message.trim()) {
      toast.error(t('feedback.error.empty_message'));
      return;
    }
    setBusy(true);
    try {
      const body = buildBody();
      const subj = buildSubject();
      const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;

      // Always copy the body to clipboard so the user has a fallback if
      // their default mail client isn't configured (rare but real on Linux
      // and freshly-set-up Windows).
      try { await navigator.clipboard.writeText(`To: ${SUPPORT_EMAIL}\nSubject: ${subj}\n\n${body}`); } catch { /* ignore */ }

      const api = window.electronAPI;
      if (api?.openExternal) {
        const r = await api.openExternal(mailto);
        if (!r.ok) {
          // Mail client missing — toast the user, the clipboard already has
          // the content so they can paste into webmail.
          toast.warning(t('feedback.success.no_mailto'), { duration: 6000 });
        } else {
          toast.success(t('feedback.success.opened'));
        }
      } else {
        window.location.href = mailto;
        toast.success(t('feedback.success.opened'));
      }
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(t('feedback.error.send_failed'));
    } finally {
      setBusy(false);
    }
  };

  const copyOnly = async () => {
    if (!message.trim()) {
      toast.error(t('feedback.error.empty_message'));
      return;
    }
    const body = buildBody();
    const subj = buildSubject();
    try {
      await navigator.clipboard.writeText(`To: ${SUPPORT_EMAIL}\nSubject: ${subj}\n\n${body}`);
      toast.success(t('feedback.success.copied'));
    } catch {
      toast.error(t('feedback.error.copy_failed'));
    }
  };

  const Icon = TYPE_META[type].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {t('feedback.title')}
          </DialogTitle>
          <DialogDescription>{t('feedback.intro')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label htmlFor="fb-type">{t('feedback.type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
              <SelectTrigger id="fb-type" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <span className="flex items-center gap-2"><Bug className="h-3.5 w-3.5" /> {t('feedback.type.bug')}</span>
                </SelectItem>
                <SelectItem value="feature">
                  <span className="flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5" /> {t('feedback.type.feature')}</span>
                </SelectItem>
                <SelectItem value="feedback">
                  <span className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> {t('feedback.type.feedback')}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-subject">{t('feedback.subject')}</Label>
            <Input
              id="fb-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('feedback.subject.placeholder')}
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-message">{t('feedback.message')}</Label>
            <textarea
              id="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.message.placeholder')}
              rows={6}
              className="resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              maxLength={4000}
            />
            <div className="text-right text-[10px] text-muted-foreground">
              {message.length}/4000
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-email">
              {t('feedback.email')}{' '}
              <span className="text-xs text-muted-foreground">({t('feedback.email.optional')})</span>
            </Label>
            <Input
              id="fb-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <p className="rounded-md border bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {t('feedback.privacy')}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyOnly}
              disabled={busy}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> {t('feedback.copy_only')}
            </Button>
            <Button onClick={submit} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {t('feedback.submit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
