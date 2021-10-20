import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import askUpdateEmailRouter from '../../../../src/api/authentication/askUpdateEmail';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { prepareContextUser } from '../../../prepareContext/user';
import {
  // getValidationTokenRepository,
  // IValidationTokenRepository,
  REDIS_PREFIXES,
} from '../../../../src/repositories/validationToken.repository';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { mockMailer } from '../../../mocks/mailer.mock';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();
mockMailer();

describe('askUpdateEmail route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  // let validationTokenRepository: IValidationTokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    // validationTokenRepository = getValidationTokenRepository(authRedisConnection);
    testApp = buildTestApp(askUpdateEmailRouter({ authRedisConnection }));
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
    const { user, accessToken } = await prepareContextUser({
      testDb,
    });

    const { status, body } = await request(testApp)
      .post('/api/email/ask')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_ASK_UPDATE_EMAIL);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    const key = resultFromDb[0];
    const prefix = key.split(':')[0];
    expect(prefix).toMatch(REDIS_PREFIXES.EMAIL_UPDATE_TOKEN);

    const storedUserId = await authRedisConnection.get(key);
    expect(storedUserId).toEqual(user.id);
  });

  test('should return error with code 404, user not found', async () => {
    const { accessToken } = await prepareContextUser({
      testDb,
      saveUser: false,
    });

    const { status, body } = await request(testApp)
      .post('/api/email/ask')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(status).toBe(HttpStatuses.NOT_FOUND);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return error with code 401, user blocked', async () => {
    const { accessToken } = await prepareContextUser({
      testDb,
      blocked: true,
    });

    const { status, body } = await request(testApp)
      .post('/api/email/ask')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return error with code 401, user email not enabled', async () => {
    const { accessToken } = await prepareContextUser({
      testDb,
      enabled: false,
    });

    const { status, body } = await request(testApp)
      .post('/api/email/ask')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });
});
