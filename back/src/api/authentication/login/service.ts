import { compare } from 'bcrypt';
import { IUserRepository } from '../../../repositories/user.repository';
import badCredentialsError from '../../shared/errors/badCredentials.error';
import userBlockedError from '../../shared/errors/userBlocked.error';
import userNotEnabledError from '../../shared/errors/userNotEnabled.error';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
}

export default async ({ email, password, userRepository }: ILoginServiceOptions): Promise<void> => {
  const user = await userRepository.getOneByEmail(email);

  if (!user) {
    throw badCredentialsError();
  }

  if (user.blocked) {
    throw userBlockedError();
  }

  if (!user.enabled) {
    throw userNotEnabledError();
  }

  const isGoodPassword = await compare(password, user.password);
  if (!isGoodPassword) {
    throw badCredentialsError();
  }

  // TODO : If password match, return JWT token + refresh token with response 200
};
