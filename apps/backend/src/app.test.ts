import { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

function testApp() {
  return createApp({
    db: new DatabaseSync(':memory:'),
    now: () => new Date('2026-10-15T10:00:00.000Z'),
  });
}

describe('unknown /api route', () => {
  it('returns 404 NOT_FOUND for an undocumented path', async () => {
    const res = await request(testApp()).get('/api/unknown');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND', message: expect.any(String) });
  });
});

describe('malformed request', () => {
  it('answers a too-large body with a 400 VALIDATION_ERROR, not a server error', async () => {
    const res = await request(testApp())
      .post('/api/unknown')
      .send({ padding: 'x'.repeat(200_000) });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('event types', () => {
  const intro = { name: 'Intro call', description: 'A quick hello.', durationMinutes: 15 };
  const deepDive = { name: 'Deep dive', description: '', durationMinutes: 90 };

  it('starts empty', async () => {
    const res = await request(testApp()).get('/api/event-types');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates event types and lists them sorted by name', async () => {
    const app = testApp();

    const created = await request(app).post('/api/event-types').send(intro);
    await request(app).post('/api/event-types').send(deepDive).expect(201);
    const res = await request(app).get('/api/event-types');

    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: expect.any(String), ...intro });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: expect.any(String), ...deepDive },
      { id: created.body.id, ...intro },
    ]);
  });

  it.each([
    ['a whitespace-only name', { name: '   ' }, '/name'],
    ['a duration that is not a multiple of 15', { durationMinutes: 20 }, '/durationMinutes'],
    ['a duration of 0', { durationMinutes: 0 }, '/durationMinutes'],
    ['a duration over 9 hours', { durationMinutes: 555 }, '/durationMinutes'],
    ['an over-long description', { description: 'x'.repeat(501) }, '/description'],
  ])('rejects %s with a 400 on that field', async (_case, override, path) => {
    const app = testApp();

    const res = await request(app)
      .post('/api/event-types')
      .send({ ...intro, ...override });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [{ path, message: expect.any(String) }],
    });
    expect((await request(app).get('/api/event-types')).body).toEqual([]);
  });

  it('trims surrounding whitespace before saving', async () => {
    const app = testApp();

    const created = await request(app)
      .post('/api/event-types')
      .send({ ...intro, name: '  Intro call ', description: ' A quick hello.\n' });
    const res = await request(app).get('/api/event-types');

    expect(created.body).toMatchObject({ name: 'Intro call', description: 'A quick hello.' });
    expect(res.body).toEqual([created.body]);
  });

  it('returns 405 METHOD_NOT_ALLOWED for an undocumented method', async () => {
    const res = await request(testApp()).patch('/api/event-types').send(intro);

    expect(res.status).toBe(405);
    expect(res.body).toMatchObject({ code: 'METHOD_NOT_ALLOWED', message: expect.any(String) });
  });
});

describe('slots', () => {
  const workshop = { name: 'Workshop', description: '', durationMinutes: 60 };

  async function createWorkshop(app: ReturnType<typeof testApp>) {
    const res = await request(app).post('/api/event-types').send(workshop).expect(201);
    return res.body.id as string;
  }

  it('returns the 14 days of the Booking Window in order, each with its starts in order', async () => {
    const app = testApp();
    const id = await createWorkshop(app);

    const res = await request(app).get(`/api/event-types/${id}/slots`);

    expect(res.status).toBe(200);
    expect(res.body.days.map((d: { date: string }) => d.date)).toEqual([
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
    ]);
    const tomorrow = res.body.days[1].starts;
    expect(tomorrow).toHaveLength(33);
    expect(tomorrow[0]).toEqual({ start: '2026-10-16T09:00:00.000Z', available: true });
    expect(tomorrow[1]).toEqual({ start: '2026-10-16T09:15:00.000Z', available: true });
    expect(tomorrow.at(-1)).toEqual({ start: '2026-10-16T17:00:00.000Z', available: true });
  });

  it('marks the starts already past today unavailable, using the injected clock', async () => {
    const app = testApp();
    const id = await createWorkshop(app);

    const res = await request(app).get(`/api/event-types/${id}/slots`);

    const today = res.body.days[0].starts;
    expect(today.slice(3, 6)).toEqual([
      { start: '2026-10-15T09:45:00.000Z', available: false },
      { start: '2026-10-15T10:00:00.000Z', available: false },
      { start: '2026-10-15T10:15:00.000Z', available: true },
    ]);
  });

  it('returns 404 EVENT_TYPE_NOT_FOUND for an unknown id', async () => {
    const res = await request(testApp()).get(
      '/api/event-types/2c1f6a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b/slots',
    );

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'EVENT_TYPE_NOT_FOUND', message: expect.any(String) });
  });
});
