import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import validateEmailRouter from '../../../../src/api/authentication/validateEmail';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { prepareContextUser } from '../../../prepareContext/user';
import {
  getValidationTokenRepository,
  IValidationTokenRepository,
  REDIS_PREFIXES,
} from '../../../../src/repositories/validationToken.repository';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();

describe('validate email route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  let validationTokenRepository: IValidationTokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    validationTokenRepository = getValidationTokenRepository(authRedisConnection);
    testApp = buildTestApp(validateEmailRouter({ authRedisConnection }));
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
    const { validationToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addEmailValidationToken: true,
      enabled: false,
    });

    const { status, body } = await request(testApp)
      .post('/api/validate/email')
      .send({ token: validationToken });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_EMAIL_VALIDATED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return success with code 401 - invalid validation token', async () => {
    const { validationToken, user } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addEmailValidationToken: true,
    });
    const badValidationToken = 'b605b1d6-9add-4905-863d-de17a0c05ac5';

    const { status, body } = await request(testApp)
      .post('/api/validate/email')
      .send({ token: badValidationToken });

    expect(body.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);

    if (!validationToken) {
      return;
    }
    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    expect(resultFromDb[0]).toMatch(`${REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN}:${validationToken}`);

    const userId = await authRedisConnection.get(
      `${REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN}:${validationToken}`,
    );
    expect(userId).toEqual(user.id);
  });

  test('should return success with code 404 - user not found', async () => {
    const { validationToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addEmailValidationToken: true,
      saveUser: false,
      enabled: false,
    });

    const { status, body } = await request(testApp)
      .post('/api/validate/email')
      .send({ token: validationToken });

    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);
    expect(status).toBe(HttpStatuses.NOT_FOUND);
  });

  test('should return success with code 401 - user blocked', async () => {
    const { validationToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addEmailValidationToken: true,
      blocked: true,
      enabled: false,
    });

    const { status, body } = await request(testApp)
      .post('/api/validate/email')
      .send({ token: validationToken });

    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
  });
});
