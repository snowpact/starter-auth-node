import { Request, Response, NextFunction, RequestHandler } from 'express';

import { buildAuthObject, checkAndReturnAuthAccessToken } from '../jwt/accessToken';
import { IAuthObject } from '../jwt/AuthObject';

export { IAuthObject } from '../jwt/AuthObject';

export interface RequestWithJwt extends Request {
  jwt: IAuthObject;
}

export interface IJwtMiddlewareOptions {
  isOptional?: boolean;
}

export const jwtMiddleware =
  (options?: IJwtMiddlewareOptions): RequestHandler =>
  async (req: RequestWithJwt, res: Response, next: NextFunction): Promise<void | Response> => {
    if (options?.isOptional && !req.headers.authorization) {
      return next();
    }
    try {
      const accessToken = checkAndReturnAuthAccessToken(req.headers.authorization);

      const authObject = await buildAuthObject(accessToken);

      req.jwt = authObject;

      return next();
    } catch (error) {
      next(error);
    }
  };
