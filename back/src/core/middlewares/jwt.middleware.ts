import { Request, Response, NextFunction } from 'express';

import { IAuthObject, buildAuthObject } from '../utils/buildAuthObject';
import { buildError } from '../buildError';
import { HttpStatuses } from '../httpStatuses';

export { IAuthObject } from '../utils/buildAuthObject';

export interface RequestWithJwt extends Request {
  jwt: IAuthObject;
}

export interface IJwtMiddlewareOptions {
  isOptional?: boolean;
  requiresAdmin?: boolean;
}

const checkAndReturnAuthHeader = (header: string | undefined): string => {
  if (!header?.startsWith('Bearer')) {
    throw buildError({
      message: 'Missing JWT token.',
      publicMessage: 'Missing JWT token.',
      code: 'jwt-missing',
      statusCode: HttpStatuses.UNAUTHORIZED,
    });
  }

  return header;
};

const checkAdminRequirement = (
  options: IJwtMiddlewareOptions | undefined,
  authObject: IAuthObject,
): void => {
  if (options?.requiresAdmin && !authObject.admin) {
    throw buildError({
      message: 'Attempt to log as an admin',
      publicMessage: 'Unauthorized',
      statusCode: HttpStatuses.UNAUTHORIZED,
    });
  }
};

/**
 * Build auth middleware. It looks for Bearer token and parses it into IAuthObject object.
 * If token is not provided, or couldn't be parsed it throws 401 error.
 * @param options.isOptional When `true` it will call `next()` even if token is not provided (default: false).
 * @param options.requiresAdmin Authenticate user only if he is an admin. Otherwise auth fails (default: false).
 */
export const jwtMiddleware = (options?: IJwtMiddlewareOptions) =>
  function jwtMiddlewareFn(
    req: RequestWithJwt,
    res: Response,
    next: NextFunction,
  ): void | Response {
    if (options?.isOptional && !req.headers.authorization) {
      return next();
    }

    const authHeader = checkAndReturnAuthHeader(req.headers.authorization);
    const authObject = buildAuthObject(authHeader);

    checkAdminRequirement(options, authObject);

    req.jwt = authObject;

    return next();
  };
