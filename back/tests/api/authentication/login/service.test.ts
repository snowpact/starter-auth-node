import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/login/service';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import tokenRepositoryMock from '../../../mocks/token.repository.mock';

describe('login service', () => {
  it('should login correctly', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneByEmail: user });
    const tokenRepository = tokenRepositoryMock({});

    const response = await service({
      email: user.email,
      password,
      userRepository,
      tokenRepository,
    });

    expect(response.accessToken).toBeDefined();
    expect(response.refreshToken).toBeDefined();
    expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
  });

  it('should throw 401 - email not found', async () => {
    const userRepository = usersRepositoryMock({});
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);

    try {
      await service({
        email: 'email@gmail.com',
        password: 'password',
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.BAD_CREDENTIALS);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });

  it('should throw 401 - bad password', async () => {
    const goodPassword = 'good_password';
    const badPassword = 'bad_password';
    const user = userEntityFactory({ password: goodPassword });
    const userRepository = usersRepositoryMock({ getOneByEmail: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);

    try {
      await service({
        email: user.email,
        password: badPassword,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.BAD_CREDENTIALS);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });

  it('should throw 401 - user blocked', async () => {
    const user = userEntityFactory({ blocked: true });
    const userRepository = usersRepositoryMock({ getOneByEmail: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);

    try {
      await service({
        email: user.email,
        password: user.password,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });

  it('should throw 401 - user not enabled', async () => {
    const user = userEntityFactory({ enabled: false });
    const userRepository = usersRepositoryMock({ getOneByEmail: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);

    try {
      await service({
        email: user.email,
        password: user.password,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
});
