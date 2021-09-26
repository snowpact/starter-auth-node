import apiRouter from '../api';
import config from './config';
import buildApp from './app';
import { buildAuthRedis } from './redis';

export default (): void => {
  try {
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
