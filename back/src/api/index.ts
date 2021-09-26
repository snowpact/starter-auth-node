import { Router } from 'express';
import { Redis } from 'ioredis';
import authentication from './authentication';

export interface IApiOptions {
  authRedisConnection: Redis;
}

export default (options: IApiOptions): Router => Router().use(authentication(options));
