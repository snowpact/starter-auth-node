import { Redis } from 'ioredis';

import { buildAuthRedis } from '../../src/loader/redis';

export interface ITestRedisManager {
  connect: () => Redis;
  disconnect: () => Promise<string>;
  clear: () => Promise<string>;
}

export default (): ITestRedisManager => {
  let connection: Redis;

  return {
    connect: (): Redis => {
      connection = buildAuthRedis();
      return connection;
    },
    disconnect: (): Promise<string> => connection.quit(),
    clear: async (): Promise<string> => connection.flushall(),
  };
};
