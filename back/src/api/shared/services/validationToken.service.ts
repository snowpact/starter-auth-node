import { v4 as uuid4 } from 'uuid';
import { MailerFunction } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';

export const saveAndSendValidationEmailToken = async (
  user: IUserEntity,
  validationTokenRepository: IValidationTokenRepository,
  mailer: MailerFunction,
): Promise<void> => {
  const token = uuid4();
  await validationTokenRepository.addEmailValidationToken({ userId: user.id, token });
  const urlValidationToken = token;

  try {
    mailer({
      to: user.email,
      html: `Url email validation : ${urlValidationToken}`,
      subject: 'Veuillez valider votre email en cliquant sur le lien',
    });
  } catch (error) {
    console.log(error);
  }
};
