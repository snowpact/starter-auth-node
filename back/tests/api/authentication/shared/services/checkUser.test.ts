import { ErrorCodes } from '../../../../../src/api/shared/enums/errorCodes.enum';
import userNotFoundError from '../../../../../src/api/shared/errors/userNotFound.error';
import { checkUser } from '../../../../../src/api/shared/services/getAndCheckUser.service';
import { HttpStatuses } from '../../../../../src/core/httpStatuses';
import { userEntityFactory } from '../../../../helpers/factories/user.factory';

describe('check user service', () => {
  it('should not throw an error', async () => {
    const user = userEntityFactory();

    checkUser({ user });
  });
  it('should throw an error - user not found', async () => {
    expect.assertions(2);
    try {
      checkUser({ error: userNotFoundError() });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatuses.NOT_FOUND);
    }
  });
  it('should throw an error - user blocked', async () => {
    const user = userEntityFactory({ blocked: true });
    expect.assertions(2);
    try {
      checkUser({ user });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should throw an error - user not enabled', async () => {
    const user = userEntityFactory({ enabled: false });
    expect.assertions(2);
    try {
      checkUser({ user });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
});
