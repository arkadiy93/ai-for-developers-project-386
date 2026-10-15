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
