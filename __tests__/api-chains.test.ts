import request from 'supertest';
import express from 'express';
import { chainsEndpoint } from '../api-chains';

describe('API /api/chains', () => {
  const app = express();
  app.get('/api/chains', chainsEndpoint);

  it('should return supported chains', async () => {
    const res = await request(app).get('/api/chains');
    expect(res.status).toBe(200);
    expect(res.body.chains).toBeDefined();
    expect(typeof res.body.chains).toBe('object');
  });
});
