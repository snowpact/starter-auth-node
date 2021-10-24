import { compare } from 'bcrypt';
import { MailerFunction } from '../../../core/mailer';
import { ITokenRepository } from '../../../repositories/token.repository';
import { IUserRepository } from '../../../repositories/user.repository';
import badCredentialsError from '../../shared/errors/badCredentials.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { getAndCheckUserById } from '../../shared/services/getAndCheckUser.service';
import { hashPassword } from '../../shared/services/password.service';

interface IValidationEmailServiceOptions {
  userId: string;
  oldPassword: string;
  newPassword: string;
  userRepository: IUserRepository;
  tokenRepository: ITokenRepository;
  mailer: MailerFunction;
}

export default async ({
  userId,
  oldPassword,
  newPassword,
  userRepository,
  tokenRepository,
  mailer,
}: IValidationEmailServiceOptions): Promise<void> => {
  const user = await getAndCheckUserById({ userId, userRepository, error: userNotFoundError() });

  const isGoodPassword = await compare(oldPassword, user.password);
  if (!isGoodPassword) {
    throw badCredentialsError();
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.updateUser(userId, { password: hashedPassword });

  await tokenRepository.deleteAllRefreshTokensForUser(userId);

  try {
    mailer({
      to: user.email,
      html: `Votre mot de passe a bien été modifié`,
      subject: 'Mot de passe modifié',
    });
  } catch (error) {
    console.log(error);
  }
};
