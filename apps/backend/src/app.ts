import { createRequire } from 'node:module';
import type { DatabaseSync } from 'node:sqlite';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { errorHandler, notFoundHandler } from './errors.js';
import { createStore } from './store.js';

const apiSpec = createRequire(import.meta.url).resolve('@calendar/api/openapi.yaml');

export interface AppDeps {
  db: DatabaseSync;
  /** The clock. Defaults to the system clock once a route reads it. */
  now?: () => Date;
}

export function createApp({ db }: AppDeps) {
  createStore(db);

  const app = express();

  app.use(express.json());
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests: true,
      validateResponses: true,
    }),
  );

  // A documented route with no handler yet still answers with the envelope.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
