import { v4 as uuid4 } from 'uuid';
import { ILogger } from '../../../core/logger';
import { MailerFunction } from '../../../core/mailer';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { getAndCheckUserById } from '../../shared/services/getAndCheckUser.service';

interface IValidationEmailServiceOptions {
  userId: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
  mailer: MailerFunction;
  logger: ILogger;
}

export default async ({
  userId,
  userRepository,
  validationTokenRepository,
  mailer,
  logger,
}: IValidationEmailServiceOptions): Promise<void> => {
  const user = await getAndCheckUserById({
    userId,
    userRepository,
    error: userNotFoundError(),
  });

  const token = uuid4();
  validationTokenRepository.addEmailUpdateToken({ userId, token });
  const urlValidationToken = token;

  try {
    await mailer({
      to: user.email,
      html: `Url email update : ${urlValidationToken}`,
      subject: 'Veuillez changer votre email en cliquant sur le lien',
    });
  } catch (error) {
    logger.warn({ message: 'Mail could not be sent', context: error });
  }
};
