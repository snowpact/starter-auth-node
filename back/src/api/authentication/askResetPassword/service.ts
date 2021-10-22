import { v4 as uuid4 } from 'uuid';
import { connectAndSendEmail } from '../../../core/mailer';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';

interface IValidationEmailServiceOptions {
  email: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
}

export default async ({
  email,
  userRepository,
  validationTokenRepository,
}: IValidationEmailServiceOptions): Promise<void> => {
  const user = await userRepository.getOneByEmail(email);
  if (!user || user.blocked || !user.enabled) {
    return;
  }

  const token = uuid4();
  validationTokenRepository.addResetPasswordToken({ userId: user.id, token });
  const urlValidationToken = token;

  try {
    connectAndSendEmail({
      to: user.email,
      html: `Url reset password : ${urlValidationToken}`,
      subject: 'Veuillez changer votre mot de passe en cliquant sur le lien',
    });
  } catch (error) {
    console.log(error);
  }
};
