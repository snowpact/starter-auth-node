import { Redis } from 'ioredis';

const enum TTL_VALIDATION_TOKEN {
  TWO_HOURS_IN_SECONDS = 7400,
  ONE_DAY_IN_SECONDS = 86400,
}

export enum REDIS_PREFIXES {
  EMAIL_UPDATE_TOKEN = 'emailUpdateToken',
  EMAIL_VALIDATION_TOKEN = 'emailValidationToken',
  RESET_PASSWORD_TOKEN = 'resetPasswordToken',
}

export interface IAddTokenOptions {
  token: string;
  userId: string;
}

export interface IValidationTokenRepository {
  addEmailValidationToken: (validationTokenOptions: IAddTokenOptions) => Promise<'OK'>;
  getEmailValidationToken: (token: string) => Promise<string | null>;
  deleteEmailValidationToken: (token: string) => Promise<number>;

  addEmailUpdateToken: (updateEmailTokenOptions: IAddTokenOptions) => Promise<'OK'>;
  getEmailUpdateToken: (token: string) => Promise<string | null>;
  deleteEmailUpdateToken: (token: string) => Promise<number>;

  addResetPasswordToken: (resetPasswordTokenOptions: IAddTokenOptions) => Promise<'OK'>;
  getResetPasswordToken: (token: string) => Promise<string | null>;
  deleteResetPasswordToken: (token: string) => Promise<number>;
}

export class ValidationTokenRepository implements IValidationTokenRepository {
  constructor(private authenticationRedisConnection: Redis) {}

  private addToken(
    { token, userId }: IAddTokenOptions,
    prefix: REDIS_PREFIXES,
    ttl: TTL_VALIDATION_TOKEN,
  ): Promise<'OK'> {
    return this.authenticationRedisConnection.setex(this.keyWithPrefix(prefix, token), ttl, userId);
  }

  private getToken(token: string, prefix: REDIS_PREFIXES): Promise<string | null> {
    return this.authenticationRedisConnection.get(this.keyWithPrefix(prefix, token));
  }

  private deleteToken(token: string, prefix: REDIS_PREFIXES): Promise<number> {
    return this.authenticationRedisConnection.del(this.keyWithPrefix(prefix, token));
  }

  private keyWithPrefix(prefix: REDIS_PREFIXES, ...args: (number | string)[]): string {
    return [prefix, ...args].join(':');
  }

  public addEmailValidationToken(validationTokenOptions: IAddTokenOptions): Promise<'OK'> {
    return this.addToken(
      validationTokenOptions,
      REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN,
      TTL_VALIDATION_TOKEN.ONE_DAY_IN_SECONDS,
    );
  }
  public getEmailValidationToken(token: string): Promise<string | null> {
    return this.getToken(token, REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN);
  }
  public deleteEmailValidationToken(token: string): Promise<number> {
    return this.deleteToken(token, REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN);
  }

  public addEmailUpdateToken(updateEmailTokenOptions: IAddTokenOptions): Promise<'OK'> {
    return this.addToken(
      updateEmailTokenOptions,
      REDIS_PREFIXES.EMAIL_UPDATE_TOKEN,
      TTL_VALIDATION_TOKEN.ONE_DAY_IN_SECONDS,
    );
  }
  public getEmailUpdateToken(token: string): Promise<string | null> {
    return this.getToken(token, REDIS_PREFIXES.EMAIL_UPDATE_TOKEN);
  }
  public deleteEmailUpdateToken(token: string): Promise<number> {
    return this.deleteToken(token, REDIS_PREFIXES.EMAIL_UPDATE_TOKEN);
  }

  public addResetPasswordToken(resetPasswordTokenOptions: IAddTokenOptions): Promise<'OK'> {
    return this.addToken(
      resetPasswordTokenOptions,
      REDIS_PREFIXES.RESET_PASSWORD_TOKEN,
      TTL_VALIDATION_TOKEN.TWO_HOURS_IN_SECONDS,
    );
  }
  public getResetPasswordToken(token: string): Promise<string | null> {
    return this.getToken(token, REDIS_PREFIXES.RESET_PASSWORD_TOKEN);
  }
  public deleteResetPasswordToken(token: string): Promise<number> {
    return this.deleteToken(token, REDIS_PREFIXES.RESET_PASSWORD_TOKEN);
  }
}

export const getValidationTokenRepository = (redisConnection: Redis): IValidationTokenRepository =>
  new ValidationTokenRepository(redisConnection);
