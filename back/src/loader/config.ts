export interface IAppConfig {
  NODE_ENV: string;
  PORT: number;
  AUTH_REDIS_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_LIFE: number;
  REFRESH_TOKEN_LIFE: number;
}

const REQUIRED_VARIABLES: string[] = [
  'AUTH_REDIS_URL',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'ACCESS_TOKEN_LIFE',
  'REFRESH_TOKEN_LIFE',
];

function checkRequiredVariables(config: NodeJS.ProcessEnv): void {
  REQUIRED_VARIABLES.forEach((key): void => {
    if (!config[key] || config[key] === '') {
      throw new Error(`${key} env variable is required`);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseConfig(config: any): IAppConfig {
  return {
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: config.PORT ?? 8080,
    AUTH_REDIS_URL: config.AUTH_REDIS_URL,
    ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: config.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE: parseInt(config.ACCESS_TOKEN_LIFE),
    REFRESH_TOKEN_LIFE: parseInt(config.REFRESH_TOKEN_LIFE),
  };
}

function buildConfig(config = process.env): IAppConfig {
  checkRequiredVariables(config);
  return parseConfig(config);
}

export default buildConfig();
