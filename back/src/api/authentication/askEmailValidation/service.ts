import { MailerFunction } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import userAlreadyEnabledError from '../../shared/errors/userAlreadyEnabled.error';
import userBlockedError from '../../shared/errors/userBlocked.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { saveAndSendValidationEmailToken } from '../../shared/services/validationToken.service';

interface IValidationEmailServiceOptions {
  userId: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
  mailer: MailerFunction;
}

const getAndCheckUser = async (
  userId: string,
  userRepository: IUserRepository,
): Promise<IUserEntity> => {
  const user = await userRepository.getOneById(userId);
  if (!user) {
    throw userNotFoundError();
  }
  if (user.blocked) {
    throw userBlockedError();
  }
  if (user.enabled) {
    throw userAlreadyEnabledError();
  }

  return user;
};

export default async ({
  userId,
  userRepository,
  validationTokenRepository,
  mailer,
}: IValidationEmailServiceOptions): Promise<void> => {
  const user = await getAndCheckUser(userId, userRepository);

  await saveAndSendValidationEmailToken(user, validationTokenRepository, mailer);
};
