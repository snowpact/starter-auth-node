import { compare } from 'bcrypt';
import { ITokenRepository } from '../../../repositories/token.repository';
import { IUserRepository } from '../../../repositories/user.repository';
import badCredentialsError from '../../shared/errors/badCredentials.error';
import { generateAccessToken } from '../../../core/jwt/accessToken';
import { generateRefreshToken } from '../../../core/jwt/refreshToken';
import { getAndCheckUserByEmail } from '../../shared/services/getAndCheckUser.service';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
  tokenRepository: ITokenRepository;
}

interface ILoginServiceResponse {
  accessToken: string;
  refreshToken: string;
}

export default async ({
  email,
  password,
  userRepository,
  tokenRepository,
}: ILoginServiceOptions): Promise<ILoginServiceResponse> => {
  const user = await getAndCheckUserByEmail({
    email,
    userRepository,
    error: badCredentialsError(),
  });
  const isGoodPassword = await compare(password, user.password);
  if (!isGoodPassword) {
    throw badCredentialsError();
  }

  const accessToken = await generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
  await tokenRepository.storeRefreshToken({ refreshToken, userId: user.id });

  return { accessToken, refreshToken };
};
