import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import loginRouter from '../../../../src/api/authentication/login';
import buildTestApp from '../../../helpers/testApp.helper';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';

const redisHelper = buildRedisHelper();

describe('login route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;

  beforeAll(async () => {
    authRedisConnection = redisHelper.connect();
    testApp = buildTestApp(loginRouter({ authRedisConnection }));
  });

  beforeEach(async () => {
    await redisHelper.clear();
  });

  afterAll(async () => {
    await redisHelper.disconnect();
  });

  test('web', async () => {
    const { status, body } = await request(testApp).post('/api/login');

    expect(status).toBe(HttpStatuses.OK);
    expect(body).toEqual({ response: 'OK' });
  });
});