import ioredis, { Redis } from 'ioredis';
import config from './config';

export const buildAuthRedis = (): Redis => new ioredis(config.AUTH_REDIS_URL);
