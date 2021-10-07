import { IAppError } from '../../../core/buildError';
import { IUserEntity } from '../../../entities/user.entity';
import { IUserRepository } from '../../../repositories/user.repository';
import badCredentialsError from '../errors/badCredentials.error';
import userBlockedError from '../errors/userBlocked.error';
import userNotEnabledError from '../errors/userNotEnabled.error';

interface IGetAndCheckUserByEmailOptions {
  email: string;
  userRepository: IUserRepository;
  error?: IAppError;
}

interface IGetAndCheckUserByIdOptions {
  userId: string;
  userRepository: IUserRepository;
  error?: IAppError;
}

const checkUser = (user?: IUserEntity, error = badCredentialsError()): IUserEntity => {
  if (!user) {
    throw error;
  }

  if (user.blocked) {
    throw userBlockedError();
  }

  if (!user.enabled) {
    throw userNotEnabledError();
  }

  return user;
};

export const getAndCheckUserByEmail = async ({
  email,
  userRepository,
  error = badCredentialsError(),
}: IGetAndCheckUserByEmailOptions): Promise<IUserEntity> => {
  const user = await userRepository.getOneByEmail(email);

  return checkUser(user, error);
};

export const getAndCheckUserById = async ({
  userId,
  userRepository,
  error = badCredentialsError(),
}: IGetAndCheckUserByIdOptions): Promise<IUserEntity> => {
  const user = await userRepository.getOneById(userId);

  return checkUser(user, error);
};
