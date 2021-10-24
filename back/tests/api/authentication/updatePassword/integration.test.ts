import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';
import { compare } from 'bcrypt';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import updatePasswordRouter from '../../../../src/api/authentication/updatePassword';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { prepareContextUser } from '../../../prepareContext/user';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';
import UserRepository from '../../../../src/repositories/user.repository';
import {
  getTokenRepository,
  ITokenRepository,
} from '../../../../src/repositories/token.repository';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { mockMailer } from '../../../mocks/mailer.mock';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();
mockMailer();

describe('update password route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;
  let tokenRepository: ITokenRepository;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    tokenRepository = getTokenRepository(authRedisConnection);
    testApp = buildTestApp(updatePasswordRouter({ authRedisConnection }));
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
    const { user, clearPassword, accessToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .patch('/api/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: clearPassword, newPassword: newPassword });

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
      const isGoodPassword = await compare(newPassword, storedUser.password);
      expect(isGoodPassword).toBeTruthy();
      expect(storedUser.enabled).toBeTruthy();
    }
  });

  test('should return error - user not found', async () => {
    const { clearPassword, accessToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
      saveUser: false,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .patch('/api/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: clearPassword, newPassword: newPassword });

    expect(status).toBe(HttpStatuses.NOT_FOUND);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_FOUND);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
  });

  test('should return error - user blocked', async () => {
    const { user, clearPassword, accessToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
      blocked: true,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .patch('/api/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: clearPassword, newPassword: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);

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

  test('should return error - user not enabled', async () => {
    const { user, clearPassword, accessToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
      enabled: false,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .patch('/api/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: clearPassword, newPassword: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);

    const storedUser = await testDb
      .getConnection()
      .getCustomRepository(UserRepository)
      .getOneById(user.id);

    expect(storedUser).toBeDefined();
    if (storedUser) {
      const isGoodPassword = await compare(clearPassword, storedUser.password);
      expect(isGoodPassword).toBeTruthy();
      expect(storedUser.enabled).toBeFalsy();
    }
  });

  test('should return error - bad password', async () => {
    const { user, clearPassword, accessToken } = await prepareContextUser({
      testDb,
      tokenRepository,
      addRefreshToken: true,
    });

    const newPassword = 'Password95';

    const { status, body } = await request(testApp)
      .patch('/api/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: `${clearPassword}12`, newPassword: newPassword });

    expect(status).toBe(HttpStatuses.UNAUTHORIZED);
    expect(body.code).toEqual(ErrorCodes.BAD_CREDENTIALS);

    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);

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
});
