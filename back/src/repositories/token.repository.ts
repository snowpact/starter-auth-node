import { Redis } from 'ioredis';
import config from '../loader/config';

export enum REDIS_PREFIXES {
  REFRESH_TOKEN = 'refreshToken',
}

export interface IStoreRefreshTokenOptions {
  refreshToken: string;
  userId: string;
}

export interface IRefreshTokenOptions {
  userId: string;
  newRefreshToken: string;
}

export interface IRemoveRefreshTokenOptions {
  refreshToken: string;
  userId: string;
}

export interface ITokenRepository {
  storeRefreshToken: (opt: IStoreRefreshTokenOptions) => Promise<[Error | null, any][]>;
  removeRT: (refreshToken: IRemoveRefreshTokenOptions) => Promise<number | null>;
  refreshTokens: (opt: IRefreshTokenOptions) => Promise<[Error | null, any][]>;
  getAllRefreshTokensForUser: (userId: string) => Promise<string[]>;
  deleteTokensForUser: (userId: number, tokensToRemove: string[]) => Promise<number>;
  deleteAllRefreshTokensForUser: (userId: string) => Promise<number>;
}

export class TokenRepository implements ITokenRepository {
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
      .hset(key, refreshToken, '')
      .expire(key, config.REFRESH_TOKEN_LIFE)
      .exec();
  }

  public async removeRT({
    userId,
    refreshToken,
  }: IRemoveRefreshTokenOptions): Promise<number | null> {
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
  }: IRefreshTokenOptions): Promise<[Error | null, any][]> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
    return this.authenticationRedisConnection
      .multi()
      .hset(key, newRefreshToken, '')
      .expire(key, config.REFRESH_TOKEN_LIFE)
      .exec();
  }

  public async deleteTokensForUser(userId: number, tokensToRemove: string[]): Promise<number> {
    if (tokensToRemove.length > 0) {
      const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
      return this.authenticationRedisConnection.hdel(key, ...tokensToRemove);
    }

    return Promise.resolve(0);
  }

  public async deleteAllRefreshTokensForUser(userId: string): Promise<number> {
    return this.authenticationRedisConnection.del(
      this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId),
    );
  }

  public async getAllRefreshTokensForUser(userId: string): Promise<string[]> {
    const key = this.keyWithPrefix(REDIS_PREFIXES.REFRESH_TOKEN, userId);
    return this.authenticationRedisConnection.hkeys(key);
  }
}

export const getTokenRepository = (redisConnection: Redis): ITokenRepository =>
  new TokenRepository(redisConnection);
