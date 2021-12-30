import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/updateEmail/service';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { buildLoggerMock } from '../../../helpers/logger.mock';

const mailerMock = jest.fn();

describe('update email service', () => {
  it('should update email correctly', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    await service({
      token,
      email,
      password,
      userRepository,
      validationTokenRepository,
      mailer: mailerMock,
      logger: buildLoggerMock(),
    });

    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(userRepository.updateUser).toBeCalledWith(user.id, { email, enabled: false });
    expect(validationTokenRepository.getEmailUpdateToken).toBeCalledWith(token);
    expect(validationTokenRepository.deleteEmailUpdateToken).toBeCalledWith(token);
  });
  it('should not update email - bad token', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: undefined,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update email - user not found', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: undefined });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toEqual(HttpStatuses.NOT_FOUND);
    }
  });
  it('should not update email - bad password', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const badPassword = 'badPassword';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password: badPassword,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update email - user blocked', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, blocked: true });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update email - user not enabled', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, enabled: false });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update email - email already exist', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const email = 'email@gmail.com';
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user, getOneByEmail: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailUpdateToken: user.id,
    });

    expect.assertions(2);

    try {
      await service({
        token,
        email,
        password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
        logger: buildLoggerMock(),
      });
      console.log('testos');
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);
      expect(error.statusCode).toEqual(HttpStatuses.BAD_REQUEST);
    }
  });
});
