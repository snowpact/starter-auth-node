import { IUserRepository } from '../../../repositories/user.repository';
import { IValidationTokenRepository } from '../../../repositories/validationToken.repository';
import invalidTokenError from '../../shared/errors/invalidToken.error';
import userNotFoundError from '../../shared/errors/userNotFound.error';
import { getAndCheckUserById } from '../../shared/services/getAndCheckUser.service';
import { hashPassword } from '../../shared/services/password.service';

interface ILoginServiceOptions {
  token: string;
  password: string;
  userRepository: IUserRepository;
  validationTokenRepository: IValidationTokenRepository;
}

export default async ({
  token,
  password,
  userRepository,
  validationTokenRepository,
}: ILoginServiceOptions): Promise<void> => {
  const userId = await validationTokenRepository.getResetPasswordToken(token);

  if (!userId) {
    throw invalidTokenError();
  }

  await getAndCheckUserById({
    userId,
    userRepository,
    error: userNotFoundError(),
  });

  const hashedPassword = await hashPassword(password);

  await userRepository.updateUser(userId, { password: hashedPassword });
  await validationTokenRepository.deleteResetPasswordToken(token);
};
