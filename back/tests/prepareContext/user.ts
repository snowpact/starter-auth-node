import { hashPassword } from '../../src/api/shared/services/password.service';
import { generateAccessToken } from '../../src/core/jwt/accessToken';
import { generateRefreshToken } from '../../src/core/jwt/refreshToken';
import { IUserEntity } from '../../src/entities/user.entity';
import { ITokenRepository } from '../../src/repositories/token.repository';
import { IValidationTokenRepository } from '../../src/repositories/validationToken.repository';
import { userEntityFactory } from '../helpers/factories/user.factory';
import { ITestDbManager } from '../helpers/testDb.helper';

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
}

interface IPrepareContextUserResponse {
  user: IUserEntity;
  clearPassword: string;
  accessToken: string;
  refreshToken: string | null;
  validationToken: string | null;
  updateEmailToken: string | null;
}

interface IPrepareRefreshTokenOptions {
  userId: string;
  email: string;
  addRefreshToken: boolean;
  tokenRepository?: ITokenRepository;
  expired: boolean;
}

interface IPrepareValidationTokenOptions {
  userId: string;
  addEmailValidationToken: boolean;
  validationTokenRepository?: IValidationTokenRepository;
}

interface IPrepareUpdateEmailTokenOptions {
  userId: string;
  addUpdateEmailToken: boolean;
  validationTokenRepository?: IValidationTokenRepository;
}

const prepareRefreshToken = async ({
  email,
  userId,
  addRefreshToken,
  tokenRepository,
  expired,
}: IPrepareRefreshTokenOptions): Promise<string | null> => {
  if (!addRefreshToken || !tokenRepository) {
    return null;
  }
  const refreshToken = generateRefreshToken({ email, userId });
  if (!expired) {
    await tokenRepository.storeRefreshToken({ refreshToken, userId });
  }

  return refreshToken;
};

const prepareValidationToken = async ({
  userId,
  addEmailValidationToken,
  validationTokenRepository,
}: IPrepareValidationTokenOptions): Promise<string | null> => {
  if (!addEmailValidationToken || !validationTokenRepository) {
    return null;
  }
  const token = 'cdd994fb-06f1-48ff-ac4a-7a3cd4e34406';
  await validationTokenRepository.addEmailValidationToken({ token, userId });

  return token;
};

const prepareUpdateEmailToken = async ({
  userId,
  addUpdateEmailToken,
  validationTokenRepository,
}: IPrepareUpdateEmailTokenOptions): Promise<string | null> => {
  if (!addUpdateEmailToken || !validationTokenRepository) {
    return null;
  }
  const token = 'cdd994fb-06f1-48ff-ac4a-7a3cd4e34406';
  await validationTokenRepository.addEmailUpdateToken({ userId, token });

  return token;
};

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

  return {
    user,
    clearPassword: password,
    accessToken,
    refreshToken,
    validationToken,
    updateEmailToken,
  };
};
