import userRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/askResetPassword/service';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';
import { mockMailer } from '../../../mocks/mailer.mock';

mockMailer();

describe('askResetPassword service', () => {
  it('should ask for reset password correctly', async () => {
    const user = userEntityFactory();
    const userRepository = userRepositoryMock({ getOneByEmail: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    await service({
      email: user.email,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
    expect(validationTokenRepository.addResetPasswordToken).toBeCalled();
  });
  it('should return success - user not found', async () => {
    const user = userEntityFactory();
    const userRepository = userRepositoryMock({ getOneByEmail: undefined });
    const validationTokenRepository = validationTokenRepositoryMock({});

    await service({
      email: user.email,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
    expect(validationTokenRepository.addResetPasswordToken).not.toBeCalled();
  });
  it('should return success - user blocked', async () => {
    const user = userEntityFactory({ blocked: true });
    const userRepository = userRepositoryMock({ getOneByEmail: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    await service({
      email: user.email,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
    expect(validationTokenRepository.addResetPasswordToken).not.toBeCalled();
  });
  it('should return success - user not enabled', async () => {
    const user = userEntityFactory({ enabled: false });
    const userRepository = userRepositoryMock({ getOneByEmail: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    await service({
      email: user.email,
      userRepository,
      validationTokenRepository,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
    expect(validationTokenRepository.addResetPasswordToken).not.toBeCalled();
  });
});
