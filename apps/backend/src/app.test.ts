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
