import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('unknown /api route', () => {
  it('returns 404', async () => {
    const res = await request(createApp()).get('/api/unknown');

    expect(res.status).toBe(404);
  });
});
