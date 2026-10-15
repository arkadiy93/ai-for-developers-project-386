import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import type { components } from '@calendar/api';
import type { BookedTime } from './slots.js';

type EventType = components['schemas']['EventType'];

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// The only module that runs SQL.
export function createStore(db: DatabaseSync) {
  db.exec(schema);

  const selectEventTypes = db.prepare(
    `SELECT id, name, description, duration_minutes AS durationMinutes
     FROM event_types ORDER BY name COLLATE NOCASE, id`,
  );
  const selectEventType = db.prepare(
    `SELECT id, name, description, duration_minutes AS durationMinutes
     FROM event_types WHERE id = ?`,
  );
  const selectBookingsEndingAfter = db.prepare(
    `SELECT start, end FROM bookings WHERE end > ? ORDER BY start`,
  );
  const insertEventType = db.prepare(
    `INSERT INTO event_types (id, name, description, duration_minutes)
     VALUES (:id, :name, :description, :durationMinutes)`,
  );
  const updateEventType = db.prepare(
    `UPDATE event_types
     SET name = :name, description = :description, duration_minutes = :durationMinutes
     WHERE id = :id`,
  );
  const deleteEventType = db.prepare(`DELETE FROM event_types WHERE id = ?`);

  return {
    listEventTypes(): EventType[] {
      return selectEventTypes.all() as unknown as EventType[];
    },

    getEventType(id: string): EventType | undefined {
      return selectEventType.get(id) as unknown as EventType | undefined;
    },

    saveEventType(eventType: EventType) {
      insertEventType.run(eventType);
    },

    /** False when there is no Event Type with that id. */
    updateEventType(eventType: EventType): boolean {
      return updateEventType.run(eventType).changes > 0;
    },

    /** False when there is no Event Type with that id. Its Bookings remain (ADR 0004). */
    deleteEventType(id: string): boolean {
      return deleteEventType.run(id).changes > 0;
    },

    listBookingsEndingAfter(after: Date): BookedTime[] {
      return selectBookingsEndingAfter.all(after.toISOString()) as unknown as BookedTime[];
    },
  };
}

export type Store = ReturnType<typeof createStore>;
