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
  expiredRefreshToken?: boolean;
}

interface IPrepareContextUserResponse {
  user: IUserEntity;
  clearPassword: string;
  accessToken: string;
  refreshToken: string | null;
  validationToken: string | null;
}

interface IPrepareRefreshTokenOptions {
  userId: string;
  email: string;
  tokenRepository?: ITokenRepository;
  expired: boolean;
}

interface IPrepareValidationTokenOptions {
  userId: string;
  validationTokenRepository?: IValidationTokenRepository;
}

const prepareRefreshToken = async ({
  email,
  userId,
  tokenRepository,
  expired,
}: IPrepareRefreshTokenOptions): Promise<string | null> => {
  if (!tokenRepository) {
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
  validationTokenRepository,
}: IPrepareValidationTokenOptions): Promise<string | null> => {
  if (!validationTokenRepository) {
    return null;
  }
  const validationToken = 'cdd994fb-06f1-48ff-ac4a-7a3cd4e34406';
  await validationTokenRepository.addEmailValidationToken({ validationToken, userId });

  return validationToken;
};

export const prepareContextUser = async ({
  testDb,
  tokenRepository,
  validationTokenRepository,
  blocked = false,
  enabled = true,
  saveUser = true,
  expiredRefreshToken = false,
}: IPrepareContextUserOptions): Promise<IPrepareContextUserResponse> => {
  const userId = '8e339c8f-2187-46a9-8c30-aa15d3ebc330';
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
    tokenRepository,
    expired: expiredRefreshToken,
  });
  const validationToken = await prepareValidationToken({ userId, validationTokenRepository });

  return {
    user,
    clearPassword: password,
    accessToken,
    refreshToken,
    validationToken,
  };
};
