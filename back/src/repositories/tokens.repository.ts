import { Redis } from 'ioredis';
import config from '../loader/config';

export enum REDIS_PREFIXES {
  REFRESH_TOKEN = 'refreshToken',
}

export interface IStoreRefreshTokenOptions {
  refreshToken: string;
  userId: string;
}

export interface IRefreshTokensOptions {
  userId: string;
  newRefreshToken: string;
  tokensToRemove?: string[];
}

export interface IRemoveRefreshTokensOptions {
  refreshToken: string;
  userId: string;
}

export interface ITokensRepository {
  storeRefreshToken: (opt: IStoreRefreshTokenOptions) => Promise<[Error | null, any][]>;
  removeRT: (refreshToken: IRemoveRefreshTokensOptions) => Promise<number | null>;
  refreshTokens: (opt: IRefreshTokensOptions) => Promise<[Error | null, any][]>;
  getAllRefreshTokensForUser: (userId: number) => Promise<string[]>;
  deleteTokensForUser: (userId: number, tokensToRemove: string[]) => Promise<number>;
}

export class TokensRepository implements ITokensRepository {
  constructor(private authenticationRedisConnection: Redis) {}

  private keyWithPrefix(prefix: REDIS_PREFIXES, ...args: (number | string)[]): string {
    return [prefix, ...args].join(':');
  }

  public storeRefreshToken({
    refreshToken,
    userId,
  }: IStoreRefreshTokenOptions): Promise<[Error | null, any][]> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);

    return this.authenticationRedisConnection
      .multi()
      .set(key, refreshToken)
      .expire(key, config.REFRESH_TOKEN_LIFE)
      .exec();
  }

  public async removeRT({
    userId,
    refreshToken,
  }: IRemoveRefreshTokensOptions): Promise<number | null> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);

    const [hget] = await this.authenticationRedisConnection
      .multi()
      .hget(key, refreshToken)
      .hdel(key, refreshToken)
      .exec();

    return hget[1] ? Number.parseInt(hget[1], 10) : null;
  }

  public refreshTokens({
    userId,
    newRefreshToken,
  }: IRefreshTokensOptions): Promise<[Error | null, any][]> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
    return this.authenticationRedisConnection
      .multi()
      .set(key, newRefreshToken)
      .expire(key, config.REFRESH_TOKEN_LIFE)
      .exec();
  }

  public async deleteTokensForUser(userId: number, tokensToRemove: string[]): Promise<number> {
    if (tokensToRemove.length > 0) {
      const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
      const result = await this.authenticationRedisConnection.hdel(key, ...tokensToRemove);

      return result;
    }

    return Promise.resolve(0);
  }

  public async getAllRefreshTokensForUser(userId: number): Promise<string[]> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
    const refreshTokens = await this.authenticationRedisConnection.hkeys(key);

    return refreshTokens;
  }
}

export const getTokensRepository = (redisConnection: Redis): ITokensRepository =>
  new TokensRepository(redisConnection);
