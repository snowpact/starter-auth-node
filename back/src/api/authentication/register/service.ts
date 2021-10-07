import { v4 as uuid4 } from 'uuid';
import { connectAndSendEmail } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import userAlreadyExistError from '../../shared/errors/userAlreadyExist.error';
import { hashPassword } from '../../shared/services/password.service';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
}

export default async ({
  email,
  password,
  userRepository,
  validationTokenRepository,
}: ILoginServiceOptions): Promise<void> => {
  const existingUser = await userRepository.getOneByEmail(email);

  if (existingUser) {
    throw userAlreadyExistError();
  }

  const hashedPassword = await hashPassword(password);

  const user: IUserEntity = {
    id: uuid4(),
    email,
    password: hashedPassword,
    blocked: false,
    enabled: false,
  };

  await userRepository.createUser(user);

  const validationToken = uuid4();
  await validationTokenRepository.addEmailValidationToken({ userId: user.id, validationToken });
  const urlValidationToken = validationToken;

  try {
    connectAndSendEmail({
      to: email,
      html: `Url email validation : ${urlValidationToken}`,
      subject: 'Veuillez valider votre email en cliquant sur le lien',
    });
  } catch (error) {
    console.log(error);
  }
};
