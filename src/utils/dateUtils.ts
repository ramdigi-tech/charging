export const JAKARTA_TIMEZONE = 'Asia/Jakarta';
export const MAKASSAR_TIMEZONE = 'Asia/Makassar';
export const JAYAPURA_TIMEZONE = 'Asia/Jayapura';

export type TimezoneType = 'WIB' | 'WITA' | 'WIT';

export const TIMEZONE_MAP: Record<TimezoneType, string> = {
  'WIB': JAKARTA_TIMEZONE,
  'WITA': MAKASSAR_TIMEZONE,
  'WIT': JAYAPURA_TIMEZONE
};

export const TIMEZONE_LABELS: Record<TimezoneType, string> = {
  'WIB': 'Waktu Indonesia Barat',
  'WITA': 'Waktu Indonesia Tengah',
  'WIT': 'Waktu Indonesia Timur'
};

export const getTimezone = (): TimezoneType => {
  const saved = localStorage.getItem('timezone');
  return (saved as TimezoneType) || 'WIB';
};

export const setTimezone = (timezone: TimezoneType): void => {
  localStorage.setItem('timezone', timezone);
};

export const getCurrentTimezoneString = (): string => {
  return TIMEZONE_MAP[getTimezone()];
};

export const formatJakartaTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: getCurrentTimezoneString(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

export const formatJakartaDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: getCurrentTimezoneString(),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatJakartaDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: getCurrentTimezoneString(),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatJakartaTimeOnly = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: getCurrentTimezoneString(),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export const getJakartaDate = (): Date => {
  return new Date();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  const d2 = new Date(date2.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  return d1.toDateString() === d2.toDateString();
};

export const getWeekStart = (date: Date): Date => {
  const jakartaDate = new Date(date.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  const day = jakartaDate.getDay();
  const diff = jakartaDate.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(jakartaDate.setDate(diff));
};

export const getMonthStart = (date: Date): Date => {
  const jakartaDate = new Date(date.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  return new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), 1);
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const tz = getCurrentTimezoneString();
  const startFormat = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(startDate);

  const endFormat = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(endDate);

  // Jika tahun dan bulan sama, tampilkan format singkat
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  if (startYear === endYear && startMonth === endMonth) {
    const monthYear = new Intl.DateTimeFormat('id-ID', {
      timeZone: tz,
      month: 'long',
      year: 'numeric'
    }).format(startDate);

    const startDay = new Intl.DateTimeFormat('id-ID', {
      timeZone: tz,
      weekday: 'long'
    }).format(startDate);

    const endDay = new Intl.DateTimeFormat('id-ID', {
      timeZone: tz,
      weekday: 'long'
    }).format(endDate);

    return `${startDay}, ${startDate.getDate()} – ${endDay}, ${endDate.getDate()} ${monthYear}`;
  }

  return `${startFormat} – ${endFormat}`;
};

export const formatSingleDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: getCurrentTimezoneString(),
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

export const getMonthEnd = (date: Date): Date => {
  const jakartaDate = new Date(date.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  return new Date(jakartaDate.getFullYear(), jakartaDate.getMonth() + 1, 0);
};

export const getYearStart = (date: Date): Date => {
  const jakartaDate = new Date(date.toLocaleString("en-US", {timeZone: getCurrentTimezoneString()}));
  return new Date(jakartaDate.getFullYear(), 0, 1);
};