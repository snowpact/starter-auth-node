import bootstrap from './loader';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IAuthObject } from './core/utils/buildAuthObject';
import { ILogger } from './core/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      logger: ILogger;
      jwt: IAuthObject;
    }
  }
}

bootstrap();
