import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/validateEmail/service';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { HttpStatuses } from '../../../../src/core/httpStatuses';

describe('refresh service', () => {
  it('should refresh token correctly', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const user = userEntityFactory({});
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailValidationToken: user.id,
    });

    await service({
      token,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(validationTokenRepository.getEmailValidationToken).toBeCalledWith(token);
    expect(validationTokenRepository.deleteEmailValidationToken).toBeCalledWith(token);
  });
  it('should not refresh token - refresh token not found', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const user = userEntityFactory({});
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailValidationToken: undefined,
    });

    try {
      await service({
        token,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not refresh token - user not found in database', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const user = userEntityFactory({});
    const userRepository = usersRepositoryMock({ getOneById: undefined });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailValidationToken: user.id,
    });

    try {
      await service({
        token,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatuses.NOT_FOUND);
    }
  });
  it('should not refresh token - user blocked', async () => {
    const token = '9a0948fe-df90-4141-87e4-995ab7b790cf';
    const user = userEntityFactory({ blocked: true });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({
      getEmailValidationToken: user.id,
    });

    try {
      await service({
        token,
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
});
