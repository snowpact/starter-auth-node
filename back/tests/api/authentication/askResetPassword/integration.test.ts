import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import askResetPasswordRouter from '../../../../src/api/authentication/askResetPassword';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { prepareContextUser } from '../../../prepareContext/user';
import { REDIS_PREFIXES } from '../../../../src/repositories/validationToken.repository';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';
import { mockMailer } from '../../../mocks/mailer.mock';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();
mockMailer();

describe('askResetPassword route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    testApp = buildTestApp(askResetPasswordRouter({ authRedisConnection }));
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
    const { user } = await prepareContextUser({ testDb });

    const { status, body } = await request(testApp)
      .post('/api/password/ask')
      .send({ email: user.email });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_ASK_RESET_PASSWORD);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    const key = resultFromDb[0];
    const prefix = key.split(':')[0];
    expect(prefix).toMatch(REDIS_PREFIXES.RESET_PASSWORD_TOKEN);

    const storedUserId = await authRedisConnection.get(key);
    expect(storedUserId).toEqual(user.id);
  });

  test('should return success with code 200 - user not found', async () => {
    const { user } = await prepareContextUser({ testDb, saveUser: false });

    const { status, body } = await request(testApp)
      .post('/api/password/ask')
      .send({ email: user.email });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_ASK_RESET_PASSWORD);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return success with code 200 - user blocked', async () => {
    const { user } = await prepareContextUser({ testDb, blocked: true });

    const { status, body } = await request(testApp)
      .post('/api/password/ask')
      .send({ email: user.email });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_ASK_RESET_PASSWORD);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return success with code 200 - user not enabled', async () => {
    const { user } = await prepareContextUser({ testDb, enabled: false });

    const { status, body } = await request(testApp)
      .post('/api/password/ask')
      .send({ email: user.email });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_ASK_RESET_PASSWORD);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });
});
