import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import type { components } from '@calendar/api';

type EventType = components['schemas']['EventType'];

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// The only module that runs SQL.
export function createStore(db: DatabaseSync) {
  db.exec(schema);

  const selectEventTypes = db.prepare(
    `SELECT id, name, description, duration_minutes AS durationMinutes
     FROM event_types ORDER BY name COLLATE NOCASE, id`,
  );
  const insertEventType = db.prepare(
    `INSERT INTO event_types (id, name, description, duration_minutes)
     VALUES (:id, :name, :description, :durationMinutes)`,
  );

  return {
    listEventTypes(): EventType[] {
      return selectEventTypes.all() as unknown as EventType[];
    },

    saveEventType(eventType: EventType) {
      insertEventType.run(eventType);
    },
  };
}

export type Store = ReturnType<typeof createStore>;
