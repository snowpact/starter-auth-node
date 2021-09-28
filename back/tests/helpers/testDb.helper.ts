import { Connection } from 'typeorm';
import { initDatabase } from '../../src/loader/database';

export interface ITestDbManager {
  getConnection: () => Connection;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clear: () => Promise<void>;
}

// const ENTITIES  = [];

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
    clear: async (): Promise<void> => {
      await Promise.all(
        [console.log('test')],

        // ENTITIES.map(async (entity) => {
        //   await connection.manager.query('SET FOREIGN_KEY_CHECKS = 0;'); // FOREIGN_KEY_CHECKS is reactivated after execution next command
        //   await connection.manager.clear(entity);
        // }),
      );
    },
  };
};
