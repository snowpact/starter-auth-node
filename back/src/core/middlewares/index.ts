/* eslint-disable @typescript-eslint/no-unused-vars */
import { ILogger } from '../logger';
import { IAuthObject } from '../jwt/AuthObject';

export * from './appErrorHandler.middleware';
export * from './attachLogger.middleware';
export * from './bodyParser.middleware';
export * from './cors.middleware';
export * from './jwt.middleware';
export * from './validation.middleware';
export * from './profile.middleware';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      logger: ILogger;
      jwt: IAuthObject;
      profileId: number;
    }
  }
}
