import apiRouter from '../api';
import config from './config';
import buildApp from './app';
import { buildAuthRedis } from './redis';
import { initDatabase } from './database';

export default async (): Promise<void> => {
  try {
    await initDatabase();
    const authRedisConnection = buildAuthRedis();

    const app = buildApp({
      prefix: '/api',
      router: apiRouter({ authRedisConnection }),
    });

    app.listen(config.PORT, () => console.log(`App is running on ${config.PORT} port`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
