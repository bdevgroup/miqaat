export interface SavedLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string | null;
  isCurrent: boolean;
  createdAt: number;
}

export interface PrayerTimesResponse {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source: 'local' | 'aladhan';
  cached: boolean;
  date: string;
  lat: number;
  lng: number;
  method: number;
  madhab: number;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_ORDER: PrayerName[] = [
  'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha',
];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export interface HijriDate {
  gregorian: string;
  hijriDate: string;
  day: number;
  month: number;
  monthEn: string;
  monthAr: string;
  year: number;
  source: 'local' | 'aladhan';
}

export interface QiblaResponse {
  bearing: number;
  distanceKm: number;
  makkah: { lat: number; lng: number };
}

export interface CitySearchResult {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export type ThemeMode = 'light' | 'dark' | 'paper' | 'miqat';

export interface AppSettings {
  theme: ThemeMode;
  layout: string;
  language: string;
  time_format: '12h' | '24h';
  calc_method: string;
  madhab: string;
  reciter: string;
  volume: string;
  play_dua_after: string;
  notifications_enabled: string;
  compact_mode: string;
  timezone: string;
  widget_enabled: string;
  widget_position: string;
  onboarded: string;
  motif: string;
  notify_fajr: string;
  notify_sunrise: string;
  notify_dhuhr: string;
  notify_asr: string;
  notify_maghrib: string;
  notify_isha: string;
  pre_notify_minutes: string;
  custom_fajr_angle: string;
  custom_isha_angle: string;
  custom_isha_interval: string;
  radio_station: string;
  reciter_fajr: string;
  reciter_dhuhr: string;
  reciter_asr: string;
  reciter_maghrib: string;
  reciter_isha: string;
  passed_dim_mode: 'all' | 'current';
  hero_ambient: string;
  jumuah_enhancements: string;
  jumuah_kahf_alert: string;
  jumuah_pre_alert: string;
  jumuah_acceptance_alert: string;
  jumuah_preview: string;
  /** Per-prayer minute offsets, ±60 max. Stored as strings; parse to int. */
  offset_fajr: string;
  offset_sunrise: string;
  offset_dhuhr: string;
  offset_asr: string;
  offset_maghrib: string;
  offset_isha: string;
  /** Global shift in minutes — applied to every prayer on top of the
   *  per-prayer offsets. Range ±120. Used for OS-tz mismatches (Morocco
   *  permanent UTC+1, stale Windows tzdata, manual DST corrections). */
  global_offset_min: string;
  /** First-launch product tour completion flag. 'true' once the user has
   *  finished or dismissed the driver.js walkthrough. */
  tour_completed: string;
}

export const CUSTOM_METHOD_ID = '0';

export const CALCULATION_METHODS: Array<{ id: string; name: string }> = [
  { id: '3', name: 'Muslim World League' },
  { id: '2', name: 'Islamic Society of North America (ISNA)' },
  { id: '5', name: 'Egyptian General Authority' },
  { id: '4', name: 'Umm Al-Qura University, Makkah' },
  { id: '1', name: 'University of Islamic Sciences, Karachi' },
  { id: '7', name: 'Institute of Geophysics, Tehran' },
  { id: '8', name: 'Gulf Region' },
  { id: '9', name: 'Kuwait' },
  { id: '10', name: 'Qatar' },
  { id: '11', name: 'Majlis Ugama Islam Singapura' },
  { id: '12', name: 'Union Organization Islamic de France' },
  { id: '13', name: 'Diyanet İşleri Başkanlığı (Turkey)' },
  { id: '15', name: 'Moonsighting Committee' },
  { id: CUSTOM_METHOD_ID, name: 'Custom — user-defined angles' },
];

export const MADHABS: Array<{ id: string; name: string; note?: string }> = [
  { id: '0', name: 'Shafi', note: "Shadow length 1× object" },
  { id: '0', name: 'Maliki', note: "Same Asr as Shafi" },
  { id: '0', name: 'Hanbali', note: "Same Asr as Shafi" },
  { id: '1', name: 'Hanafi', note: "Shadow length 2× object" },
];

/**
 * Custom Athan reciter row (from `/api/custom-reciters`). Audio file lives
 * on the server's disk; renderer fetches it via `${apiUrl}/api/custom-reciters/<id>/audio`.
 */
export interface CustomReciter {
  id: number;
  name: string;
  filename: string;
  duration_ms: number | null;
  size_bytes: number;
  created_at: number;
}

/** Local Athan reciters — short MP3s played once at prayer time or on demand. */
export interface Reciter {
  id: string;
  name: string;
  who: string;
  /** Arabic localised name + subtitle (used when the active locale is `ar`). */
  nameAr?: string;
  whoAr?: string;
}

// Title = mosque/source (the column users scan), subtitle = reciter name
// (the detail). Same `<source> · <reciter>` shape used by RADIO_STATIONS
// below so the two cards read consistently.
export const RECITERS: Reciter[] = [
  {
    id: 'makkah',
    name: 'Makkah · Al-Haram', who: 'Sheikh ʿAli Mulla',
    nameAr: 'مكة · الحرم', whoAr: 'الشيخ علي ملا',
  },
  {
    id: 'madina',
    name: 'Madina · An-Nabawi', who: 'Sheikh Essam Bukhari',
    nameAr: 'المدينة · النبوي', whoAr: 'الشيخ عصام بخاري',
  },
  {
    id: 'alaqsa',
    name: 'Al-Aqsa · Jerusalem', who: 'Sheikh Abu Ikrima',
    nameAr: 'الأقصى · القدس', whoAr: 'الشيخ أبو إكريمة',
  },
  {
    id: 'egypt',
    name: 'Egypt · Cairo', who: 'Sheikh Mahmoud Abd al-Hakam',
    nameAr: 'مصر · القاهرة', whoAr: 'الشيخ محمود عبد الحكم',
  },
  {
    id: 'none',
    name: 'No Athan', who: '',
    nameAr: 'بدون أذان', whoAr: '',
  },
];

/** Live radio stations — long-running streams. Passive-listening only;
 *  never fire at prayer time (no defined end, can't chain Dua).
 *
 *  Exactly one of `streamUrl` or `externalUrl` must be set:
 *  - `streamUrl`: direct HTTPS MP3/AAC URL played in-app via HTMLAudioElement
 *  - `externalUrl`: opens in the system browser (for HLS/Sucuri-protected
 *    streams like SNRT Assadissa that can't play inline). */
export interface RadioStation {
  id: string;
  name: string;
  who: string;
  /** Arabic localised name + subtitle (used when the active locale is `ar`). */
  nameAr?: string;
  whoAr?: string;
  streamUrl?: string;
  externalUrl?: string;
}

// All entries below use the same qurango.net infrastructure as the two
// stations confirmed to work end-to-end in Miqāt (mix + tarateel). Probed
// 200 via HEAD; the subset here is a curated mix of tarateel / tafseer /
// Haram imams / popular reciters. If you have additional URLs that work,
// add them here — no other code changes needed.
//
// Assadissa (Radio Mohammed VI du Saint Coran, Morocco) is deliberately
// omitted: SNRT's direct stream endpoints aren't reachable from most
// environments (geo-blocked or HLS-only, which HTMLAudioElement can't
// decode). Add your own entry here once you have a working HTTPS MP3/AAC
// URL. See docs/athan-audio.md § Live radio.
// Title = station name, subtitle = role/origin. The "Qurango stream"
// suffix was dropped from every entry — the broadcast tower icon on the
// card header already conveys "live stream", so repeating it on every row
// just adds visual noise.
export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'tarateel',
    name: 'Tarateel', who: 'Recitation · multi-reciter',
    nameAr: 'ترتيل', whoAr: 'تلاوة · متعدّد القرّاء',
    streamUrl: 'https://qurango.net/radio/tarateel',
  },
  {
    id: 'mix',
    name: 'Qurango Mix', who: 'Mp3Quran · multi-reciter',
    nameAr: 'مزيج قرآنغو', whoAr: 'Mp3Quran · متعدّد القرّاء',
    streamUrl: 'https://qurango.net/radio/mix',
  },
  {
    id: 'tafseer',
    name: 'Tafseer', who: 'Qur’an commentary',
    nameAr: 'تفسير', whoAr: 'تفسير القرآن الكريم',
    streamUrl: 'https://qurango.net/radio/tafseer',
  },
  {
    id: 'maher',
    name: 'Maher al-Muʿaiqly', who: 'Madina · imam',
    nameAr: 'ماهر المعيقلي', whoAr: 'المدينة · إمام',
    streamUrl: 'https://qurango.net/radio/maher',
  },
  {
    id: 'shuraim',
    name: 'Saud ash-Shuraim', who: 'Makkah · imam',
    nameAr: 'سعود الشريم', whoAr: 'مكة · إمام',
    streamUrl: 'https://qurango.net/radio/saud_alshuraim',
  },
  {
    id: 'ghamdi',
    name: 'Saʿd al-Ghāmidi', who: 'Saudi Arabia · reciter',
    nameAr: 'سعد الغامدي', whoAr: 'السعودية · قارئ',
    streamUrl: 'https://qurango.net/radio/saad_alghamdi',
  },
  {
    id: 'ajmy',
    name: 'Ahmad al-ʿAjmī', who: 'Saudi Arabia · reciter',
    nameAr: 'أحمد العجمي', whoAr: 'السعودية · قارئ',
    streamUrl: 'https://qurango.net/radio/ahmad_alajmy',
  },
  // External-opens-in-browser entry. SNRT's Assadissa stream is HLS +
  // Sucuri-protected and can't play inline; clicking Play opens the SNRT
  // web player. The Miqāt app keeps running in the background.
  {
    id: 'assadissa',
    name: 'Assadissa', who: 'Morocco · Radio Mohammed VI',
    nameAr: 'إذاعة السادسة', whoAr: 'المغرب · إذاعة محمد السادس للقرآن',
    externalUrl: 'https://snrtlive.ma/fr/idaat-mohammed-assadiss',
  },
];

export function findRadioStation(id: string): RadioStation | undefined {
  return RADIO_STATIONS.find((s) => s.id === id);
}
