import { randomUUID } from 'node:crypto';
import type { components } from '@calendar/api';
import { Router } from 'express';
import type { HttpError } from './errors.js';
import type { Store } from './store.js';

type EventTypeInput = components['schemas']['EventTypeInput'];
type ErrorDetail = components['schemas']['ErrorDetail'];

// The rules the contract documents but TypeSpec can't express, so the validator doesn't check them.
function validate({ name, durationMinutes }: EventTypeInput): ErrorDetail[] {
  const details: ErrorDetail[] = [];
  if (name.trim() === '') {
    details.push({ path: '/name', message: 'must not be blank' });
  }
  if (durationMinutes % 15 !== 0) {
    details.push({ path: '/durationMinutes', message: 'must be a multiple of 15' });
  }
  return details;
}

export function eventTypesRouter(store: Store) {
  const router = Router();

  router.get('/event-types', (_req, res) => {
    res.json(store.listEventTypes());
  });

  router.post('/event-types', (req, res, next) => {
    const input = req.body as EventTypeInput;
    const details = validate(input);
    if (details.length > 0) {
      next({
        status: 400,
        message: 'request/body has invalid fields',
        errors: details,
      } satisfies HttpError);
      return;
    }

    const eventType = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
      durationMinutes: input.durationMinutes,
    };

    store.saveEventType(eventType);
    res.status(201).json(eventType);
  });

  return router;
}
