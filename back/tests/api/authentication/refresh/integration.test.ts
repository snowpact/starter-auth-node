import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import refreshRouter from '../../../../src/api/authentication/refresh';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import {
  getTokenRepository,
  ITokenRepository,
  REDIS_PREFIXES,
} from '../../../../src/repositories/token.repository';
import config from '../../../../src/loader/config';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { prepareContextUser } from '../../../prepareContext/user';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();

describe('refresh route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  let tokenRepository: ITokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    tokenRepository = getTokenRepository(authRedisConnection);
    testApp = buildTestApp(refreshRouter({ authRedisConnection }));
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
    const { user, accessToken, refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${accessToken}`);

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

  test('should return success with code 401 - invalid access token', async () => {
    const { refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
    });
    const badAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${badAccessToken}`);

    expect(body.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return success with code 401 - expired refresh token', async () => {
    const { accessToken, refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
      expiredRefreshToken: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(body.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return success with code 404 - user not found', async () => {
    const { accessToken, refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      saveUser: false,
      addRefreshToken: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);
    expect(status).toBe(HttpStatuses.NOT_FOUND);
  });

  test('should return success with code 401 - user blocked', async () => {
    const { accessToken, refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      blocked: true,
      addRefreshToken: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });

  test('should return success with code 401 - user account not enabled', async () => {
    const { accessToken, refreshToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      enabled: false,
      addRefreshToken: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/refresh')
      .send({ refreshToken })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });
});
