import { configBuilder } from '../configBuilder';

export interface ISesMailerConfig {
  FROM_EMAIL: string;
  SMTP_ENDPOINT: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
}

export const buildConfig = (): ISesMailerConfig => {
  return configBuilder<ISesMailerConfig>({
    requiredVariables: [
      'FROM_EMAIL',
      'SMTP_ENDPOINT',
      'SMTP_PORT',
      'SMTP_USERNAME',
      'SMTP_PASSWORD',
    ],
    parseFunction: (config) => ({
      FROM_EMAIL: config.FROM_EMAIL,
      SMTP_ENDPOINT: config.SMTP_ENDPOINT,
      SMTP_PORT: config.SMTP_PORT,
      SMTP_USERNAME: config.SMTP_USERNAME,
      SMTP_PASSWORD: config.SMTP_PASSWORD,
    }),
  })();
};
