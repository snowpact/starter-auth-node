import userRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/register/service';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import validationTokenRepositoryMock from '../../../mocks/validationToken.repository.mock';

const mailerMock = jest.fn();

describe('register service', () => {
  it('should register correctly', async () => {
    const userRepository = userRepositoryMock({});
    const validationTokenRepository = validationTokenRepositoryMock({});
    const email = 'test@gmail.com';

    await service({
      email,
      password: 'password',
      userRepository,
      validationTokenRepository,
      mailer: mailerMock,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(email);
    expect(userRepository.createUser).toBeCalled();
  });
  it('should register correctly', async () => {
    const user = userEntityFactory();
    const userRepository = userRepositoryMock({ getOneByEmail: user });
    const validationTokenRepository = validationTokenRepositoryMock({});

    expect.assertions(4);

    try {
      await service({
        email: user.email,
        password: user.password,
        userRepository,
        validationTokenRepository,
        mailer: mailerMock,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);
      expect(error.statusCode).toBe(HttpStatuses.BAD_REQUEST);
      expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
      expect(userRepository.createUser).not.toBeCalled();
    }
  });
});
