import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import updateEmailRouter from '../../../../src/api/authentication/updateEmail';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { prepareContextUser } from '../../../prepareContext/user';
import {
  getValidationTokenRepository,
  IValidationTokenRepository,
} from '../../../../src/repositories/validationToken.repository';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();

describe('update email route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  let validationTokenRepository: IValidationTokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    validationTokenRepository = getValidationTokenRepository(authRedisConnection);
    testApp = buildTestApp(updateEmailRouter({ authRedisConnection }));
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
    const { updateEmailToken, clearPassword } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
    });

    const newEmail = 'newemail@gmail.com';

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: updateEmailToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_EMAIL_UPDATED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);
  });

  test('should return error with code 404 - user not found', async () => {
    const { clearPassword, updateEmailToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
      saveUser: false,
    });

    const newEmail = 'newemail@gmail.com';

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: updateEmailToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.NOT_FOUND);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error with code 401 - user blocked', async () => {
    const { clearPassword, updateEmailToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
      blocked: true,
    });

    const newEmail = 'newemail@gmail.com';

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: updateEmailToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error with code 401 - user not enabled', async () => {
    const { clearPassword, updateEmailToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
      enabled: false,
    });

    const newEmail = 'newemail@gmail.com';

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: updateEmailToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error with code 401 - bad token', async () => {
    const { clearPassword } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
    });
    const badToken = 'b605b1d6-9add-4905-863d-de17a0c05ac5';

    const newEmail = 'newemail@gmail.com';

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: badToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error with code 400 - email already taken', async () => {
    const { clearPassword, updateEmailToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addUpdateEmailToken: true,
      userId: 'edd63929-5172-4577-b3a3-112545627d84',
    });
    const { user: secondUser } = await prepareContextUser({
      testDb,
      userId: '37a7a4e7-ef5b-41d5-a25a-d723103df52a',
    });

    const newEmail = secondUser.email;

    const { status, body } = await request(testApp)
      .post('/api/email')
      .send({ token: updateEmailToken, email: newEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.BAD_REQUEST);
    expect(body.code).toEqual(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });
});
