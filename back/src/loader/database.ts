import path from 'path';
import { createConnection, Connection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
import { buildConfig } from './databaseConfig';

export const initDatabase = (connectionConfig?: PostgresConnectionOptions): Promise<Connection> => {
  const config = buildConfig();

  const cache: Pick<BaseConnectionOptions, 'cache'> =
    process.env.NODE_ENV !== 'test'
      ? {
          cache: {
            type: 'ioredis',
            options: config.DB_CACHE_REDIS_URL,
          },
        }
      : {};

  return createConnection({
    type: 'postgres',
    host: config.DB_HOST,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    entities: [path.join(entitiesPath, '**', '*.ts'), path.join(entitiesPath, '**', '*.js')],
    logging: config.DB_LOGGING,
    synchronize: false,
    extra: {
      connectionLimit: 5, // default: 10
    },
    ...cache,
    ...connectionConfig,
  });
};

export const entitiesPath = path.join(__dirname, '..', 'entities');
