import { generateRefreshToken } from '../../src/core/jwt/refreshToken';
import { ITokenRepository } from '../../src/repositories/token.repository';
import { IValidationTokenRepository } from '../../src/repositories/validationToken.repository';

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

interface IPrepareResetPasswordTokenOptions {
  userId: string;
  addResetPasswordToken: boolean;
  validationTokenRepository?: IValidationTokenRepository;
}

export const prepareRefreshToken = async ({
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

export const prepareValidationToken = async ({
  userId,
  addEmailValidationToken,
  validationTokenRepository,
}: IPrepareValidationTokenOptions): Promise<string | null> => {
  if (!addEmailValidationToken || !validationTokenRepository) {
    return null;
  }
  const token = 'eefe26bb-9c3e-40f4-b212-b72f0ad9a807';
  await validationTokenRepository.addEmailValidationToken({ token, userId });

  return token;
};

export const prepareUpdateEmailToken = async ({
  userId,
  addUpdateEmailToken,
  validationTokenRepository,
}: IPrepareUpdateEmailTokenOptions): Promise<string | null> => {
  if (!addUpdateEmailToken || !validationTokenRepository) {
    return null;
  }
  const token = 'a09dbf80-75d6-434c-a5b4-556616874082';
  await validationTokenRepository.addEmailUpdateToken({ userId, token });

  return token;
};

export const prepareResetPasswordToken = async ({
  userId,
  addResetPasswordToken,
  validationTokenRepository,
}: IPrepareResetPasswordTokenOptions): Promise<string | null> => {
  if (!addResetPasswordToken || !validationTokenRepository) {
    return null;
  }
  const token = 'ef66eac9-774f-45dc-9e00-64ce93417b98';
  await validationTokenRepository.addResetPasswordToken({ userId, token });

  return token;
};
