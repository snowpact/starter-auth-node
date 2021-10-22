import { hashPassword } from '../../src/api/shared/services/password.service';
import { generateAccessToken } from '../../src/core/jwt/accessToken';
import { IUserEntity } from '../../src/entities/user.entity';
import { ITokenRepository } from '../../src/repositories/token.repository';
import { IValidationTokenRepository } from '../../src/repositories/validationToken.repository';
import { userEntityFactory } from '../helpers/factories/user.factory';
import { ITestDbManager } from '../helpers/testDb.helper';
import {
  prepareRefreshToken,
  prepareResetPasswordToken,
  prepareUpdateEmailToken,
  prepareValidationToken,
} from './token';

interface IPrepareContextUserOptions {
  testDb: ITestDbManager;
  tokenRepository?: ITokenRepository;
  validationTokenRepository?: IValidationTokenRepository;
  saveUser?: boolean;
  blocked?: boolean;
  enabled?: boolean;
  userId?: string;
  expiredRefreshToken?: boolean;
  addRefreshToken?: boolean;
  addEmailValidationToken?: boolean;
  addUpdateEmailToken?: boolean;
  addResetPasswordToken?: boolean;
}

interface IPrepareContextUserResponse {
  user: IUserEntity;
  clearPassword: string;
  accessToken: string;
  refreshToken: string | null;
  validationToken: string | null;
  updateEmailToken: string | null;
  resetPasswordToken: string | null;
}

export const prepareContextUser = async ({
  testDb,
  tokenRepository,
  validationTokenRepository,
  blocked = false,
  enabled = true,
  saveUser = true,
  userId = '8e339c8f-2187-46a9-8c30-aa15d3ebc330',
  expiredRefreshToken = false,
  addRefreshToken = false,
  addEmailValidationToken = false,
  addUpdateEmailToken = false,
  addResetPasswordToken = false,
}: IPrepareContextUserOptions): Promise<IPrepareContextUserResponse> => {
  const password = 'Password95';
  const hashedPassword = await hashPassword(password);
  const user = userEntityFactory({ password: hashedPassword, id: userId, blocked, enabled });

  if (saveUser) {
    await testDb.persistUser(user);
  }
  const accessToken = await generateAccessToken({ email: user.email, userId });
  const refreshToken = await prepareRefreshToken({
    email: user.email,
    userId,
    addRefreshToken,
    tokenRepository,
    expired: expiredRefreshToken,
  });
  const validationToken = await prepareValidationToken({
    userId,
    addEmailValidationToken,
    validationTokenRepository,
  });
  const updateEmailToken = await prepareUpdateEmailToken({
    userId,
    addUpdateEmailToken,
    validationTokenRepository,
  });
  const resetPasswordToken = await prepareResetPasswordToken({
    userId,
    addResetPasswordToken,
    validationTokenRepository,
  });

  return {
    user,
    clearPassword: password,
    accessToken,
    refreshToken,
    validationToken,
    updateEmailToken,
    resetPasswordToken,
  };
};
