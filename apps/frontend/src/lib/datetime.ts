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
