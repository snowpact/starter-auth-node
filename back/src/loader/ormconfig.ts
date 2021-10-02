import path from 'path';
import { ConnectionOptions } from 'typeorm';

import { buildConfig } from './databaseConfig';

const config = buildConfig();

const socketPath = config.INSTANCE_CONNECTION_NAME
  ? `/cloudsql/${config.INSTANCE_CONNECTION_NAME}`
  : undefined;

const buildPath = (ext: string): string => path.resolve(__dirname, '..', 'migrations', `*.${ext}`);

const entitiesPath = path.join(__dirname, '..', 'entities');

const options: ConnectionOptions = {
  type: 'postgres',
  host: socketPath ? socketPath : config.DB_HOST,
  port: socketPath ? undefined : config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  entities: [path.join(entitiesPath, '**', '*.ts'), path.join(entitiesPath, '**', '*.js')],
  synchronize: false,
  logging: true,
  migrations: [buildPath('ts'), buildPath('js')],
  cli: {
    migrationsDir: './src/migrations',
  },
};

export = options;
