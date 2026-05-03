import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FolderOpen, Copy, Download, FileSearch } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Diagnostics panel — opens the Electron log folder, fetches a one-shot
 * server snapshot (today's settings, cache rows, computed canonical times,
 * offset-applied result), and copies it to the clipboard so the user can
 * paste it into a bug report.
 *
 * The snapshot endpoint also writes a structured entry to the main log file,
 * so re-opening the issue + clicking the button + sending the log captures
 * a complete debugging trace.
 */
export function DiagnosticsPanel() {
  const [logPath, setLogPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (window.electronAPI?.getLogPath) {
      window.electronAPI.getLogPath()
        .then((p) => { if (!cancelled) setLogPath(p); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, []);

  const openFolder = async () => {
    if (!window.electronAPI?.openLogsFolder) {
      toast.error('Logs only available in the desktop app');
      return;
    }
    try {
      await window.electronAPI.openLogsFolder();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const copySnapshot = async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/debug/snapshot');
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      console.info('[diagnostics] snapshot copied to clipboard:', data);
      toast.success('Snapshot copied to clipboard');
    } catch (err) {
      console.error('[diagnostics] snapshot failed:', err);
      toast.error('Snapshot failed — see logs');
    } finally {
      setBusy(false);
    }
  };

  const downloadSnapshot = async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/debug/snapshot');
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miqaat-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Snapshot downloaded');
    } catch (err) {
      toast.error('Snapshot failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card/40 p-3">
      <div className="flex items-center gap-2">
        <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-sm font-medium">Diagnostics</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        If something looks wrong (times off, no audio, etc.), grab a snapshot
        and the log file, then send them with your bug report.
      </p>

      {logPath && (
        <div className="rounded-md bg-muted/50 px-2 py-1.5 font-mono text-[10px] text-muted-foreground break-all">
          {logPath}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={openFolder}
          disabled={!window.electronAPI?.openLogsFolder}
        >
          <FolderOpen className="h-3 w-3" /> Open logs folder
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={copySnapshot}
          disabled={busy}
        >
          <Copy className="h-3 w-3" /> Copy diagnostic snapshot
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={downloadSnapshot}
          disabled={busy}
        >
          <Download className="h-3 w-3" /> Download snapshot (.json)
        </Button>
      </div>
    </div>
  );
}
