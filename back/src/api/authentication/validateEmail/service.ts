import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import invalidTokenError from '../../shared/errors/invalidToken.error';
import userBlockedError from '../../shared/errors/userBlocked.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';

interface IValidationEmailServiceOptions {
  token: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
}

export default async ({
  token,
  userRepository,
  validationTokenRepository,
}: IValidationEmailServiceOptions): Promise<void> => {
  const userId = await validationTokenRepository.getEmailValidationToken(token);
  if (!userId) {
    throw invalidTokenError();
  }

  const user = await userRepository.getOneById(userId);

  if (!user) {
    throw userNotFoundError();
  }
  if (user.blocked) {
    throw userBlockedError();
  }

  await userRepository.validateUserAccount(user.id);
  await validationTokenRepository.deleteEmailValidationToken(token);
};
