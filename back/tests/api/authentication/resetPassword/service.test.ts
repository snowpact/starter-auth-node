import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/resetPassword/service';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { HttpStatuses } from '../../../../src/core/httpStatuses';

describe('reset password service', () => {
  it('should reset password correctly', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const password = 'password';
    const user = userEntityFactory();
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getResetPasswordToken: user.id,
    });

    await service({
      token,
      password,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(userRepository.updateUser).toBeCalled();
    expect(validationTokenRepository.getResetPasswordToken).toBeCalledWith(token);
    expect(validationTokenRepository.deleteResetPasswordToken).toBeCalledWith(token);
  });
  it('should not reset password - bad token', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const password = 'password';
    const user = userEntityFactory();
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getResetPasswordToken: undefined,
    });

    expect.assertions(2);
    try {
      await service({
        token,
        password,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not reset password - user not found', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const password = 'password';
    const userRepository = usersRepositoryMock({ getOneById: undefined });
    const validationTokenRepository = validationTokenRepositoryMock({
      getResetPasswordToken: token,
    });

    expect.assertions(2);
    try {
      await service({
        token,
        password,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toEqual(HttpStatuses.NOT_FOUND);
    }
  });
  it('should not reset password - user blocked', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const password = 'password';
    const user = userEntityFactory({ blocked: true });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getResetPasswordToken: token,
    });

    expect.assertions(2);
    try {
      await service({
        token,
        password,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not reset password - user not enabled', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const password = 'password';
    const user = userEntityFactory({ enabled: false });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getResetPasswordToken: token,
    });

    expect.assertions(2);
    try {
      await service({
        token,
        password,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
});
