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

  const socketPath = config.INSTANCE_CONNECTION_NAME
    ? `/cloudsql/${config.INSTANCE_CONNECTION_NAME}`
    : undefined;

  const dbEnvConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: socketPath ? socketPath : config.DB_HOST,
    port: socketPath ? undefined : config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    entities: [path.join(entitiesPath, '**', '*.ts'), path.join(entitiesPath, '**', '*.js')],
    logging: config.DB_LOGGING,
    synchronize: false,
    extra: {
      connectionLimit: 10, // default: 10
      socketPath,
    },
    ...cache,
    ...connectionConfig,
  };

  return createConnection(dbEnvConfig);
};

export const entitiesPath = path.join(__dirname, '..', 'entities');
