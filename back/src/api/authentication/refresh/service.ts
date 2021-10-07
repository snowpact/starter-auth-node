import { ITokenRepository } from '../../../repositories/token.repository';
import { IUserRepository } from '../../../repositories/user.repository';
import { generateRefreshToken } from '../../../core/jwt/refreshToken';
import { generateAccessToken } from '../../../core/jwt/accessToken';
import { getAndCheckUserById } from '../../shared/services/getAndCheckUser.service';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { checkAccessAndRefreshToken } from './services/checkAccessAndRefreshToken.service';

interface ILoginServiceOptions {
  accessToken?: string;
  refreshToken: string;
  userRepository: IUserRepository;
  tokenRepository: ITokenRepository;
}

interface IRefreshServiceResponse {
  accessToken: string;
  refreshToken: string;
}

export default async ({
  accessToken,
  refreshToken,
  userRepository,
  tokenRepository,
}: ILoginServiceOptions): Promise<IRefreshServiceResponse> => {
  const { userId } = await checkAccessAndRefreshToken({
    refreshToken,
    accessToken,
    tokenRepository,
  });

  const user = await getAndCheckUserById({ userId, userRepository, error: userNotFoundError() });

  const newAccessToken = await generateAccessToken({ userId, email: user.email });
  const newRefreshToken = generateRefreshToken({ userId, email: user.email });
  tokenRepository.refreshTokens({ newRefreshToken, userId });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
