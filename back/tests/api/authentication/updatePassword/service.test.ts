import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/updatePassword/service';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { HttpStatuses } from '../../../../src/core/httpStatuses';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import tokenRepositoryMock from '../../../mocks/token.repository.mock';

const mailerMock = jest.fn();

describe('update password service', () => {
  it('should update password correctly', async () => {
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const hashedPassword = await hashPassword(oldPassword);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const tokenRepository = tokenRepositoryMock({});
    await service({
      userId: user.id,
      oldPassword,
      newPassword,
      userRepository,
      tokenRepository,
      mailer: mailerMock,
    });

    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(userRepository.updateUser).toBeCalled();
    expect(tokenRepository.deleteAllRefreshTokensForUser).toBeCalledWith(user.id);
  });
  it('should not update password - user not found', async () => {
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const hashedPassword = await hashPassword(oldPassword);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: undefined });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);
    try {
      await service({
        userId: user.id,
        oldPassword,
        newPassword,
        userRepository,
        tokenRepository,
        mailer: mailerMock,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toEqual(HttpStatuses.NOT_FOUND);
    }
  });
  it('should not update password - user blocked', async () => {
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const hashedPassword = await hashPassword(oldPassword);
    const user = userEntityFactory({ password: hashedPassword, blocked: true });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);
    try {
      await service({
        userId: user.id,
        oldPassword,
        newPassword,
        userRepository,
        tokenRepository,
        mailer: mailerMock,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update password - user not enabled', async () => {
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const hashedPassword = await hashPassword(oldPassword);
    const user = userEntityFactory({ password: hashedPassword, enabled: false });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);
    try {
      await service({
        userId: user.id,
        oldPassword,
        newPassword,
        userRepository,
        tokenRepository,
        mailer: mailerMock,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not update password - bad old password', async () => {
    const badOldPassword = 'badOldPassword';
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const hashedPassword = await hashPassword(oldPassword);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const tokenRepository = tokenRepositoryMock({});

    expect.assertions(2);
    try {
      await service({
        userId: user.id,
        oldPassword: badOldPassword,
        newPassword,
        userRepository,
        tokenRepository,
        mailer: mailerMock,
      });
    } catch (error: any) {
      expect(error.code).toEqual(ErrorCodes.BAD_CREDENTIALS);
      expect(error.statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
    }
  });
});
