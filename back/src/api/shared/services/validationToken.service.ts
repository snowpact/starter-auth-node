import { v4 as uuid4 } from 'uuid';
import { ILogger } from '../../../core/logger';
import { MailerFunction } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';

interface ISaveAndSendValidationEmailTokenOptions {
  user: IUserEntity;
  validationTokenRepository: IValidationTokenRepository;
  mailer: MailerFunction;
  logger: ILogger;
}

export const saveAndSendValidationEmailToken = async ({
  user,
  validationTokenRepository,
  mailer,
  logger,
}: ISaveAndSendValidationEmailTokenOptions): Promise<void> => {
  const token = uuid4();
  await validationTokenRepository.addEmailValidationToken({ userId: user.id, token });
  const urlValidationToken = token;

  try {
    await mailer({
      to: user.email,
      html: `Url email validation : ${urlValidationToken}`,
      subject: 'Veuillez valider votre email en cliquant sur le lien',
    });
  } catch (error) {
    logger.warn({ message: 'Mail could not be sent', context: error });
  }
};
