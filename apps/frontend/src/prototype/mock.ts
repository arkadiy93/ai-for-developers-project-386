// PROTOTYPE: throwaway in-memory data for the screens prototype. Not production code.

export type EventType = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

export type Booking = {
  id: string;
  eventTypeName: string;
  guestName: string;
  guestEmail: string;
  start: Date;
  end: Date;
};

export type ScreenState = 'ready' | 'loading' | 'empty' | 'error' | 'slot-taken';

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

// Fixed "now" so every variant shows the same picture (UTC).
export const NOW = new Date(Date.UTC(2026, 9, 15, 11, 7));
const TODAY = new Date(Date.UTC(2026, 9, 15));

export const initialEventTypes: EventType[] = [
  {
    id: '3f6c1e2a-0001',
    name: 'Intro call',
    description: 'A quick hello to see if we are a good fit.',
    durationMinutes: 15,
  },
  {
    id: '3f6c1e2a-0002',
    name: 'Consultation',
    description: 'A focused session on one problem you bring.',
    durationMinutes: 45,
  },
  {
    id: '3f6c1e2a-0003',
    name: 'Deep dive',
    description: 'Two hours of pairing on your codebase.',
    durationMinutes: 120,
  },
];

function at(dayOffset: number, h: number, m: number, minutes: number) {
  const start = new Date(TODAY.getTime() + dayOffset * DAY + (h * 60 + m) * MIN);
  return { start, end: new Date(start.getTime() + minutes * MIN) };
}

export const initialBookings: Booking[] = [
  {
    id: 'b1',
    eventTypeName: 'Consultation',
    guestName: 'Ana Silva',
    guestEmail: 'ana@example.com',
    ...at(0, 13, 0, 45),
  },
  {
    id: 'b2',
    eventTypeName: 'Intro call',
    guestName: 'Ben Okafor',
    guestEmail: 'ben@example.com',
    ...at(0, 16, 30, 15),
  },
  {
    id: 'b3',
    eventTypeName: 'Deep dive',
    guestName: 'Chen Wei',
    guestEmail: 'chen@example.com',
    ...at(1, 9, 0, 120),
  },
  {
    id: 'b4',
    eventTypeName: 'Strategy call',
    guestName: 'Dana Levi',
    guestEmail: 'dana@example.com',
    ...at(1, 14, 15, 30),
  },
  {
    id: 'b5',
    eventTypeName: 'Intro call',
    guestName: 'Eli Novak',
    guestEmail: 'eli@example.com',
    ...at(3, 10, 0, 15),
  },
  {
    id: 'b6',
    eventTypeName: 'Consultation',
    guestName: 'Fatima Noor',
    guestEmail: 'fatima@example.com',
    ...at(6, 11, 30, 45),
  },
  {
    id: 'b7',
    eventTypeName: 'Deep dive',
    guestName: 'Gus Moreau',
    guestEmail: 'gus@example.com',
    ...at(9, 15, 0, 120),
  },
];

export const windowDays: Date[] = Array.from(
  { length: 14 },
  (_, i) => new Date(TODAY.getTime() + i * DAY),
);

export function slotsFor(day: Date, durationMinutes: number, bookings = initialBookings): Date[] {
  const slots: Date[] = [];
  for (let m = 9 * 60; m + durationMinutes <= 18 * 60; m += 15) {
    const start = new Date(day.getTime() + m * MIN);
    const end = new Date(start.getTime() + durationMinutes * MIN);
    if (start <= NOW) continue;
    if (bookings.some((b) => start < b.end && b.start < end)) continue;
    slots.push(start);
  }
  return slots;
}

export function isBusy(start: Date, bookings = initialBookings) {
  const end = new Date(start.getTime() + 15 * MIN);
  return bookings.find((b) => start < b.end && b.start < end);
}

export const fmtTime = (d: Date) => d.toISOString().slice(11, 16);
export const fmtDay = (d: Date) =>
  d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
export const fmtDuration = (m: number) =>
  m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60} min`;
export const sameDay = (a: Date, b: Date) =>
  a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
