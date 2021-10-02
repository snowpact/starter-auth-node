import { v4 as uuid4 } from 'uuid';
import { IUserRepository } from '../../../repositories/user.repository';
import userAlreadyExistError from '../../shared/errors/userAlreadyExist.error';
import { hashPassword } from '../../shared/services/password.service';

interface ILoginServiceOptions {
  email: string;
  password: string;
  userRepository: IUserRepository;
}

export default async ({ email, password, userRepository }: ILoginServiceOptions): Promise<void> => {
  const user = await userRepository.getOneByEmail(email);

  if (user) {
    throw userAlreadyExistError();
  }

  const hashedPassword = await hashPassword(password);

  await userRepository.createUser({
    id: uuid4(),
    email,
    password: hashedPassword,
    blocked: false,
    enabled: false,
  });

  // create user in database
  // TODO : Send email with validation link
};
