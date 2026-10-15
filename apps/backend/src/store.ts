import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// The only module that runs SQL.
export function createStore(db: DatabaseSync) {
  db.exec(schema);

  return {};
}

export type Store = ReturnType<typeof createStore>;
