import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const formatInUserTimezone = (
  isoDate: string,
  pattern = 'dd.MM.yyyy HH:mm',
  timeZone?: string,
) => {
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = parseISO(isoDate);
  const zonedDate = toZonedTime(date, zone);

  return format(zonedDate, pattern);
};

export function getDeviceIanaTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Calendar date `yyyy-MM-dd` for “now” in the given IANA zone (defaults to device). */
export function getTodayYYYYMMDDInTimeZone(
  timeZone = getDeviceIanaTimeZone(),
): string {
  return formatInUserTimezone(new Date().toISOString(), 'yyyy-MM-dd', timeZone);
}
