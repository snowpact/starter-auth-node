import { v4 as uuid4 } from 'uuid';
import { ILogger } from '../../../core/logger';
import { MailerFunction } from '../../../core/mailer';
import { IUserEntity } from '../../../entities/user.entity';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import userAlreadyExistError from '../../shared/errors/userAlreadyExist.error';
import { hashPassword } from '../../shared/services/password.service';
import { saveAndSendValidationEmailToken } from '../../shared/services/validationToken.service';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
  mailer: MailerFunction;
  logger: ILogger;
}

export default async ({
  email,
  password,
  userRepository,
  validationTokenRepository,
  mailer,
  logger,
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

  await saveAndSendValidationEmailToken({ user, validationTokenRepository, mailer, logger });
};
