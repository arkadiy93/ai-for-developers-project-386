const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/** "Thu, Oct 15" for the plain date "2026-10-15" or a UTC datetime on that day. */
export function formatDay(date: string) {
  return dayFormat.format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

/** "09:30" for a UTC datetime. */
export function formatTime(datetime: string) {
  return datetime.slice(11, 16);
}

const shortDayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

/** The UTC date "2026-10-16" of a datetime. */
export function utcDate(datetime: string) {
  return datetime.slice(0, 10);
}

/** "Today" for today's UTC date, otherwise "Fri 16 Oct", for a plain date or a UTC datetime. */
export function formatRelativeDay(date: string, now = new Date()) {
  if (utcDate(date) === utcDate(now.toISOString())) {
    return 'Today';
  }
  return shortDayFormat.format(new Date(`${utcDate(date)}T00:00:00Z`));
}
