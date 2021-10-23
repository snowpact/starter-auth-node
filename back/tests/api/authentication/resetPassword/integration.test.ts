import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';
import { compare } from 'bcrypt';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import resetPasswordRouter from '../../../../src/api/authentication/resetPassword';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { prepareContextUser } from '../../../prepareContext/user';
import {
  getValidationTokenRepository,
  IValidationTokenRepository,
} from '../../../../src/repositories/validationToken.repository';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import UserRepository from '../../../../src/repositories/user.repository';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();

describe('reset password route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  let validationTokenRepository: IValidationTokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    validationTokenRepository = getValidationTokenRepository(authRedisConnection);
    testApp = buildTestApp(resetPasswordRouter({ authRedisConnection }));
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
    const { resetPasswordToken, user, clearPassword } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addResetPasswordToken: true,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .post('/api/password/reset')
      .send({ token: resetPasswordToken, password: newPassword });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_PASSWORD_UPDATED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(0);

    const storedUser = await testDb
      .getConnection()
      .getCustomRepository(UserRepository)
      .getOneById(user.id);

    expect(storedUser).toBeDefined();
    if (storedUser) {
      const isGoodPassword = await compare(clearPassword, storedUser.password);
      expect(isGoodPassword).toBeTruthy();
      expect(storedUser.enabled).toBeTruthy();
    }
  });

  test('should return error - invalid token', async () => {
    await prepareContextUser({
      testDb,
      validationTokenRepository,
      addResetPasswordToken: true,
    });

    const newPassword = 'Password95';
    const invalidToken = '268abbfd-630d-4506-b114-b1f71615650b';

    const { status, body } = await request(testApp)
      .post('/api/password/reset')
      .send({ token: invalidToken, password: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error - user blocked', async () => {
    const { resetPasswordToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addResetPasswordToken: true,
      blocked: true,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .post('/api/password/reset')
      .send({ token: resetPasswordToken, password: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error - user not enabled', async () => {
    const { resetPasswordToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addResetPasswordToken: true,
      enabled: false,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .post('/api/password/reset')
      .send({ token: resetPasswordToken, password: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error - user not found', async () => {
    const { resetPasswordToken } = await prepareContextUser({
      testDb,
      validationTokenRepository,
      addResetPasswordToken: true,
      saveUser: false,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .post('/api/password/reset')
      .send({ token: resetPasswordToken, password: newPassword });

    expect(status).toBe(HttpStatuses.NOT_FOUND);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });
});
