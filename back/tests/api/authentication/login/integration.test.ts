import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import loginRouter from '../../../../src/api/authentication/login';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import { REDIS_PREFIXES } from '../../../../src/repositories/tokens.repository';
import config from '../../../../src/loader/config';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();

describe('login route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    testApp = buildTestApp(loginRouter({ authRedisConnection }));
  });

  beforeEach(async () => {
    await testDb.clear();
    await redisHelper.clear();
  });

  afterAll(async () => {
    await testDb.disconnect();
    await redisHelper.disconnect();
  });

  test('should return success with code 200', async () => {
    const userId = '8e339c8f-2187-46a9-8c30-aa15d3ebc330';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, id: userId });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    expect(resultFromDb[0]).toMatch(`${REDIS_PREFIXES.REFRESH_TOKEN}:${userId}`);

    const ttl = await authRedisConnection.ttl(resultFromDb[0]);

    expect(ttl).toBeLessThanOrEqual(config.REFRESH_TOKEN_LIFE);
  });

  test('should return error with code 401 - user blocked', async () => {
    const user = userEntityFactory({ blocked: true });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: user.password });

    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - user disabled', async () => {
    const user = userEntityFactory({ enabled: false });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: user.password });

    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - incorrect password', async () => {
    const goodPassword = 'good_password';
    const badPassword = 'bad_password';
    const user = userEntityFactory({ password: goodPassword });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: badPassword });

    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - incorrect email', async () => {
    const goodEmail = 'good.email@gmail.com';
    const badEmail = 'bad.email@gmail.com';
    const user = userEntityFactory({ email: goodEmail });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: badEmail, password: user.password });

    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });
});
