import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import loginRouter from '../../../../src/api/authentication/login';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { REDIS_PREFIXES } from '../../../../src/repositories/token.repository';
import config from '../../../../src/loader/config';
import { prepareContextUser } from '../../../prepareContext/user';

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
    const { user, clearPassword } = await prepareContextUser({ testDb });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: clearPassword });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    expect(resultFromDb[0]).toMatch(`${REDIS_PREFIXES.REFRESH_TOKEN}:${user.id}`);

    const tokens = await authRedisConnection.hgetall(`${REDIS_PREFIXES.REFRESH_TOKEN}:${user.id}`);
    expect(tokens[body.refreshToken]).toBeDefined();

    const ttl = await authRedisConnection.ttl(resultFromDb[0]);
    expect(ttl).toBeLessThanOrEqual(config.REFRESH_TOKEN_LIFE);
  });

  test('should return error with code 404 - user not found', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb, saveUser: false });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: clearPassword });

    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - user blocked', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb, blocked: true });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: clearPassword });

    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - user disabled', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb, enabled: false });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: clearPassword });

    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - incorrect password', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: user.email, password: `bad_${clearPassword}` });

    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return error with code 401 - incorrect email', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb });

    const { status, body } = await request(testApp)
      .post('/api/login')
      .send({ email: `bad.${user.email}`, password: clearPassword });

    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });
});
