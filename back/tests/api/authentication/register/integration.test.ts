import { Express } from 'express';
import { Redis } from 'ioredis';
import request from 'supertest';
import { compare } from 'bcrypt';

import { testDbManager } from '../../../helpers/testDb.helper';
import buildTestApp from '../../../helpers/testApp.helper';
import registerRouter from '../../../../src/api/authentication/register';
import buildRedisHelper from '../../../helpers/testRedis.helper';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import UserRepository from '../../../../src/repositories/user.repository';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import { mockMailer } from '../../../mocks/mailer.mock';

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
    const email1 = 'email1@gmail.com';
    const email2 = 'email2@gmail.com';
    const password = 'Password95';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, email: email1 });

    await testDb.persistUser(user);
    const { status, body } = await request(testApp)
      .post('/api/register')
      .send({ email: email2, password });

    expect(status).toBe(HttpStatuses.OK);
    expect(body).toEqual({ response: 'OK' });

    const storedUser = await testDb
      .getConnection()
      .getCustomRepository(UserRepository)
      .getOneByEmail(email2);

    expect(storedUser).toBeDefined();
    if (storedUser) {
      const isGoodPassword = await compare(password, storedUser.password);
      expect(isGoodPassword).toBeTruthy();
    }
  });

  test('should return error with code 400 - user already exist', async () => {
    const user = userEntityFactory({ password: 'Password95' });

    await testDb.persistUser(user);

    const { status, body } = await request(testApp)
      .post('/api/register')
      .send({ email: user.email, password: user.password });

    expect(body.code).toEqual(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);
    expect(status).toBe(HttpStatuses.BAD_REQUEST);
  });
});
