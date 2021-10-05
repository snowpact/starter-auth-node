import { IUserEntity } from '../../../../entities/user.entity';
import { IUserRepository } from '../../../../repositories/user.repository';
import badCredentialsError from '../../../shared/errors/badCredentials.error';
import userBlockedError from '../../../shared/errors/userBlocked.error';
import userNotEnabledError from '../../../shared/errors/userNotEnabled.error';

export const getUser = async (
  email: string,
  userRepository: IUserRepository,
): Promise<IUserEntity> => {
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

  return user;
};
