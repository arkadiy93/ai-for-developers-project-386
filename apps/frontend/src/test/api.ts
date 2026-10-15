import { vi } from 'vitest';
import type { ApiError, EventType } from '@/lib/api';

type Handler = (request: Request) => Response | Promise<Response>;

/**
 * Stubs `fetch` with one handler per `"<METHOD> <path>"`, for example `"GET /api/event-types"`.
 * An unstubbed request fails the test.
 */
export function stubApi(routes: Record<string, Handler>) {
  const fetch = vi.fn(async (request: Request) => {
    const key = `${request.method} ${new URL(request.url).pathname}`;
    const handler = routes[key];
    if (!handler) {
      throw new Error(`Unexpected request: ${key}`);
    }
    return handler(request);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** A response that never arrives, to hold the UI in its loading state. */
export function pending(): Promise<Response> {
  return new Promise(() => {});
}

export const serverError: ApiError = { code: 'INTERNAL', message: 'Internal server error' };

export const deepDive: EventType = {
  id: '6f1c2a7e-2f3b-4c1d-9a8e-1b2c3d4e5f60',
  name: 'Deep dive',
  description: 'Walk through your project in detail.',
  durationMinutes: 90,
};

export const intro: EventType = {
  id: '0b8d7c6e-5f4a-4b3c-8d2e-1f0a9b8c7d6e',
  name: 'Intro call',
  description: 'A quick hello.',
  durationMinutes: 15,
};

export const workshop: EventType = {
  id: '9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b',
  name: 'Workshop',
  description: 'A long working session.',
  durationMinutes: 60,
};
