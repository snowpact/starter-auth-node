import { v4 as uuid4 } from 'uuid';
import { connectAndSendEmail } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import userAlreadyEnabledError from '../../shared/errors/userAlreadyEnabled.error';
import userBlockedError from '../../shared/errors/userBlocked.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';

interface IValidationEmailServiceOptions {
  userId: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
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
}: IValidationEmailServiceOptions): Promise<void> => {
  const user = await getAndCheckUser(userId, userRepository);

  const token = uuid4();
  await validationTokenRepository.addEmailValidationToken({ userId: user.id, token });
  const urlValidationToken = token;

  try {
    connectAndSendEmail({
      to: user.email,
      html: `Url email validation : ${urlValidationToken}`,
      subject: 'Veuillez valider votre email en cliquant sur le lien',
    });
  } catch (error) {
    console.log(error);
  }
};
