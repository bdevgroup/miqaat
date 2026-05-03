import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppSettings } from '@/types';

const DEFAULTS: AppSettings = {
  theme: 'miqat',
  layout: 'split',
  language: 'en',
  time_format: '24h',
  calc_method: '3',
  madhab: '0',
  reciter: 'makkah',
  volume: '0.8',
  play_dua_after: 'true',
  notifications_enabled: 'false',
  compact_mode: 'false',
  timezone: '',
  widget_enabled: 'false',
  widget_position: '',
  onboarded: 'false',
  motif: 'star',
  notify_fajr: 'true',
  notify_sunrise: 'false',
  notify_dhuhr: 'true',
  notify_asr: 'true',
  notify_maghrib: 'true',
  notify_isha: 'true',
  pre_notify_minutes: '0',
  custom_fajr_angle: '18',
  custom_isha_angle: '17',
  custom_isha_interval: '0',
  radio_station: 'tarateel',
  reciter_fajr: '',
  reciter_dhuhr: '',
  reciter_asr: '',
  reciter_maghrib: '',
  reciter_isha: '',
  passed_dim_mode: 'all',
  hero_ambient: 'true',
  jumuah_enhancements: 'true',
  jumuah_kahf_alert: 'true',
  jumuah_pre_alert: 'true',
  jumuah_acceptance_alert: 'true',
  jumuah_preview: 'false',
  offset_fajr: '0',
  offset_sunrise: '0',
  offset_dhuhr: '0',
  offset_asr: '0',
  offset_maghrib: '0',
  offset_isha: '0',
  global_offset_min: '0',
  tour_completed: 'false',
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<AppSettings> => {
      const { data } = await api.get<Record<string, string>>('/settings');
      return { ...DEFAULTS, ...data } as AppSettings;
    },
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppSettings>) => {
      const { data } = await api.patch<Record<string, string>>('/settings', patch);
      return { ...DEFAULTS, ...data } as AppSettings;
    },
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data);
      // Tell the main process to recompute prayer-time timers — the new
      // settings may have changed offsets, calc method, reciter, or
      // notification toggles. No-op outside Electron.
      try { void window.electronAPI?.refreshAthanSchedule?.(); } catch { /* ignore */ }
    },
  });
}
