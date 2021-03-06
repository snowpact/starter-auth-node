import { EntityRepository, Repository } from 'typeorm';
import UserEntity, { IUserEntity } from '../entities/user.entity';

export interface IUserRepository {
  getOneByEmail(email: string): Promise<IUserEntity | undefined>;
  getOneById(id: string): Promise<IUserEntity | undefined>;
  createUser(user: IUserEntity): Promise<void>;
  updateUser(userId: string, user: Partial<IUserEntity>): Promise<void>;
  validateUserAccount(id: string): Promise<void>;
}

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> implements IUserRepository {
  async createUser(user: IUserEntity): Promise<void> {
    await this.createQueryBuilder('user').insert().into(UserEntity).values(user).execute();
  }
  async updateUser(userId: string, user: Partial<IUserEntity>): Promise<void> {
    await this.createQueryBuilder('user').update().set(user).where({ id: userId }).execute();
  }
  getOneByEmail(email: string): Promise<IUserEntity | undefined> {
    return this.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
  }
  getOneById(id: string): Promise<IUserEntity | undefined> {
    return this.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
  }
  async validateUserAccount(id: string): Promise<void> {
    await this.createQueryBuilder('user')
      .update(UserEntity)
      .set({ enabled: true })
      .where({ id })
      .execute();
  }
}
