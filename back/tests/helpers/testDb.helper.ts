import { Connection } from 'typeorm';
import UserEntity, { IUserEntity } from '../../src/entities/user.entity';
import { initDatabase } from '../../src/loader/database';

export interface ITestDbManager {
  getConnection: () => Connection;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  persistUser: (user: Partial<IUserEntity>) => Promise<Partial<IUserEntity>>;
  clear: () => Promise<void>;
}

const ENTITIES = [UserEntity];

export const testDbManager = (): ITestDbManager => {
  let connection: Connection;

  return {
    getConnection: (): Connection => connection,
    connect: async (): Promise<void> => {
      connection = await initDatabase();
    },
    disconnect: async (): Promise<void> => {
      await connection.close();
    },
    persistUser: async (args: Partial<IUserEntity>): Promise<Partial<IUserEntity>> =>
      connection.manager.save(UserEntity, args),
    clear: async (): Promise<void> => {
      await Promise.all(
        ENTITIES.map(async (entity) => {
          await connection.manager.clear(entity);
        }),
      );
    },
  };
};
