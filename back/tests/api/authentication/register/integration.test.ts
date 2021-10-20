import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';
import { compare } from 'bcrypt';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import registerRouter from '../../../../src/api/authentication/register';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import UserRepository from '../../../../src/repositories/user.repository';
import { mockMailer } from '../../../mocks/mailer.mock';
import { REDIS_PREFIXES } from '../../../../src/repositories/validationToken.repository';
import { prepareContextUser } from '../../../prepareContext/user';
import { ResponseCodes } from '../../../../src/api/shared/enums/responseCodes.enum';

const redisHelper = buildRedisHelper();
const testDb = testDbManager();
mockMailer();

describe('register route', () => {
  let testApp: Express;
  let authRedisConnection: Redis;

  beforeAll(async () => {
    await testDb.connect();
    authRedisConnection = redisHelper.connect();
    testApp = buildTestApp(registerRouter({ authRedisConnection }));
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
    const newUserEmail = `new.${user.email}`;

    await testDb.persistUser(user);
    const { status, body } = await request(testApp)
      .post('/api/register')
      .send({ email: newUserEmail, password: clearPassword });

    expect(status).toBe(HttpStatuses.OK);
    expect(body.code).toEqual(ResponseCodes.USER_CREATED);

    const storedUser = await testDb
      .getConnection()
      .getCustomRepository(UserRepository)
      .getOneByEmail(newUserEmail);

    expect(storedUser).toBeDefined();
    if (storedUser) {
      const isGoodPassword = await compare(clearPassword, storedUser.password);
      expect(isGoodPassword).toBeTruthy();
      expect(storedUser.enabled).toBeFalsy();
    }
    const resultFromDb = await authRedisConnection.keys('*');
    expect(resultFromDb).toHaveLength(1);
    const key = resultFromDb[0];
    const prefix = key.split(':')[0];
    expect(prefix).toMatch(REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN);

    const storedUserId = await authRedisConnection.get(key);
    expect(storedUserId).toEqual(storedUser?.id);
  });

  test('should return error with code 400 - user already exist', async () => {
    const { user, clearPassword } = await prepareContextUser({ testDb });

    const { status, body } = await request(testApp)
      .post('/api/register')
      .send({ email: user.email, password: clearPassword });

    expect(body.code).toEqual(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);
    expect(status).toBe(HttpStatuses.BAD_REQUEST);
  });
});
