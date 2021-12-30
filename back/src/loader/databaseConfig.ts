import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { configBuilder } from '../core/configBuilder';

export interface IDatabaseConfig {
  DB_LOGGING: LoggerOptions;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_CACHE_REDIS_URL?: string;
  INSTANCE_CONNECTION_NAME?: string;
}

function parseBoolean(val: string): boolean | undefined {
  const booleanStringMap: Record<string, boolean> = {
    true: true,
    false: false,
  };
  return booleanStringMap[val] ?? undefined;
}

function parseNumber(val: string): number {
  return parseInt(val, 10);
}

const defaultRequiredVariables: (keyof IDatabaseConfig)[] = [
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'DB_CACHE_REDIS_URL',
];

export const buildConfig = configBuilder<IDatabaseConfig>({
  requiredVariables: defaultRequiredVariables,
  parseFunction: (config: { [key in keyof IDatabaseConfig]: string }) => ({
    ...config,
    DB_LOGGING: parseBoolean(config.DB_LOGGING) ?? (config.DB_LOGGING as LoggerOptions),
    DB_PORT: parseNumber(config.DB_PORT),
  }),
});
