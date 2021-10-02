import usersRepositoryMock from '../../../mocks/users.repository.mock';
// import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/register/service';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';

describe('getUser service', () => {
  it('should register correctly', async () => {
    const userRepository = usersRepositoryMock({});
    const email = 'test@gmail.com';

    await service({
      email,
      password: 'password',
      userRepository,
    });

    expect(userRepository.getOneByEmail).toBeCalledWith(email);
    expect(userRepository.createUser).toBeCalled();
  });
  it('should register correctly', async () => {
    const user = userEntityFactory();
    const userRepository = usersRepositoryMock({ getOneByEmail: user });

    expect.assertions(4);

    try {
      await service({
        email: user.email,
        password: user.password,
        userRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.EMAIL_ALREADY_EXIST_BAD_REQUEST);
      expect(error.statusCode).toBe(HttpStatuses.BAD_REQUEST);
      expect(userRepository.getOneByEmail).toBeCalledWith(user.email);
      expect(userRepository.createUser).not.toBeCalled();
    }
  });
});
