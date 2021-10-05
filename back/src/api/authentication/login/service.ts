import { compare } from 'bcrypt';
import { ITokensRepository } from '../../../repositories/tokens.repository';
import { IUserRepository } from '../../../repositories/user.repository';
import badCredentialsError from '../../shared/errors/badCredentials.error';
import { generateAccessToken } from '../../shared/services/jwt/accessToken.service';
import { generateRefreshToken } from '../../shared/services/jwt/refreshToken.service';
import { getUser } from './services/getUser.service';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
  tokensRepository: ITokensRepository;
}

interface ILoginServiceResponse {
  accessToken: string;
  refreshToken: string;
}

export default async ({
  email,
  password,
  userRepository,
  tokensRepository,
}: ILoginServiceOptions): Promise<ILoginServiceResponse> => {
  const user = await getUser(email, userRepository);
  const isGoodPassword = await compare(password, user.password);
  if (!isGoodPassword) {
    throw badCredentialsError();
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
  await tokensRepository.storeRefreshToken({ refreshToken, userId: user.id });

  return { accessToken, refreshToken };
};
