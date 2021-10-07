import { IUserEntity } from '../../src/entities/user.entity';
import { IUserRepository } from '../../src/repositories/user.repository';

interface IUserMockOptions {
  getOneByEmail?: IUserEntity;
  getOneById?: IUserEntity;
}

export default (options: IUserMockOptions): IUserRepository => ({
  createUser: jest.fn().mockResolvedValue(undefined),
  getOneByEmail: jest.fn().mockResolvedValue(options.getOneByEmail),
  getOneById: jest.fn().mockResolvedValue(options.getOneById),
});
