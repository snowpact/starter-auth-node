import { Redis } from 'ioredis';

// const TWO_HOURS_IN_SECONDS = 7400;
const ONE_DAY_IN_SECONDS = 86400;

export enum REDIS_PREFIXES {
  EMAIL_UPDATE_TOKEN = 'emailUpdateToken',
  EMAIL_VALIDATION_TOKEN = 'emailValidationToken',
  RESET_PASSWORD_TOKEN = 'resetPasswordToken',
}

export interface IValidationTokenOptions {
  validationToken: string;
  userId: string;
}

export interface IValidationTokenRepository {
  addEmailValidationToken: (validationTokenOptions: IValidationTokenOptions) => Promise<'OK'>;
  getEmailValidationToken: (token: string) => Promise<string | null>;
  deleteEmailValidationToken: (token: string) => Promise<number>;

  addEmailUpdateToken: (userId: string, token: string) => Promise<'OK'>;
  getEmailUpdateToken: (token: string) => Promise<string | null>;
  deleteEmailUpdateToken: (token: string) => Promise<number>;
}

export class ValidationTokenRepository implements IValidationTokenRepository {
  constructor(private authenticationRedisConnection: Redis) {}

  private keyWithPrefix(prefix: REDIS_PREFIXES, ...args: (number | string)[]): string {
    return [prefix, ...args].join(':');
  }

  public addEmailValidationToken({
    validationToken,
    userId,
  }: IValidationTokenOptions): Promise<'OK'> {
    return this.authenticationRedisConnection.setex(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN, validationToken),
      ONE_DAY_IN_SECONDS,
      userId,
    );
  }

  public getEmailValidationToken(validationToken: string): Promise<string | null> {
    return this.authenticationRedisConnection.get(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN, validationToken),
    );
  }

  public deleteEmailValidationToken(validationToken: string): Promise<number> {
    return this.authenticationRedisConnection.del(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_VALIDATION_TOKEN, validationToken),
    );
  }

  public addEmailUpdateToken(userId: string, token: string): Promise<'OK'> {
    return this.authenticationRedisConnection.setex(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_UPDATE_TOKEN, token),
      ONE_DAY_IN_SECONDS,
      userId,
    );
  }
  public getEmailUpdateToken(token: string): Promise<string | null> {
    return this.authenticationRedisConnection.get(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_UPDATE_TOKEN, token),
    );
  }

  public deleteEmailUpdateToken(token: string): Promise<number> {
    return this.authenticationRedisConnection.del(
      this.keyWithPrefix(REDIS_PREFIXES.EMAIL_UPDATE_TOKEN, token),
    );
  }
}

export const getValidationTokenRepository = (redisConnection: Redis): IValidationTokenRepository =>
  new ValidationTokenRepository(redisConnection);
