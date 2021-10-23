import { compare } from 'bcrypt';
import { MailerFunction } from '../../../core/mailer';
import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import badCredentialsError from '../../shared/errors/badCredentials.error';
import invalidTokenError from '../../shared/errors/invalidToken.error';
import userAlreadyExistError from '../../shared/errors/userAlreadyExist.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { getAndCheckUserById } from '../../shared/services/getAndCheckUser.service';
import { saveAndSendValidationEmailToken } from '../../shared/services/validationToken.service';

interface ILoginServiceOptions {
  token: string;
  password: string;
  email: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
  mailer: MailerFunction;
}

export default async ({
  token,
  password,
  email,
  userRepository,
  validationTokenRepository,
  mailer,
}: ILoginServiceOptions): Promise<void> => {
  const userId = await validationTokenRepository.getEmailUpdateToken(token);

  if (!userId) {
    throw invalidTokenError();
  }

  const user = await getAndCheckUserById({
    userId,
    userRepository,
    error: userNotFoundError(),
  });

  const isGoodPassword = await compare(password, user.password);
  if (!isGoodPassword) {
    throw badCredentialsError();
  }

  const existingUser = await userRepository.getOneByEmail(email);
  if (existingUser) {
    throw userAlreadyExistError();
  }

  await userRepository.updateUser(userId, { email, enabled: false });
  await validationTokenRepository.deleteEmailUpdateToken(token);

  await saveAndSendValidationEmailToken(user, validationTokenRepository, mailer);
};
