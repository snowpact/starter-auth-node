import userRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/askUpdateEmail/service';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';
import { mockMailer } from '../../../mocks/mailer.mock';

mockMailer();

describe('askUpdateEmail service', () => {
  it('should ask for update email correctly', async () => {
    const user = userEntityFactory();
    const userRepository = userRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    await service({
      userId: user.id,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(validationTokenRepository.addEmailUpdateToken).toBeCalled();
  });
  it('should return error - user not found', async () => {
    const userRepository = userRepositoryMock({ getOneById: undefined });
    const validationTokenRepository = validationTokenRepositoryMock({});

    expect.assertions(4);
    try {
      await service({
        userId: '12',
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatuses.NOT_FOUND);
      expect(userRepository.getOneById).toBeCalledWith('12');
      expect(validationTokenRepository.addEmailUpdateToken).not.toBeCalled();
    }
  });
  it('should return error - user blocked', async () => {
    const user = userEntityFactory({ blocked: true });
    const userRepository = userRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    expect.assertions(4);
    try {
      await service({
        userId: '12',
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
      expect(userRepository.getOneById).toBeCalledWith('12');
      expect(validationTokenRepository.addEmailUpdateToken).not.toBeCalled();
    }
  });
  it('should return error - user not enabled', async () => {
    const user = userEntityFactory({ enabled: false });
    const userRepository = userRepositoryMock({ getOneById: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    expect.assertions(4);
    try {
      await service({
        userId: '12',
        userRepository,
        validationTokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
      expect(userRepository.getOneById).toBeCalledWith('12');
      expect(validationTokenRepository.addEmailUpdateToken).not.toBeCalled();
    }
  });
});
