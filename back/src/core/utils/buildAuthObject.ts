import jwt from 'jsonwebtoken';

import { buildError } from '../buildError';
import { HttpStatuses } from '../httpStatuses';

export interface IAuthObject {
  jti: string;
  userId: number;
  username: string;
  subscription: boolean;
  orderId: number;
  admin: boolean;
  avatar: string;
}

export function buildAuthObject(authorization: string): IAuthObject {
  const token = authorization.replace('Bearer ', '');
  const decoded = jwt.decode(token) as IAuthObject;

  if (!decoded) {
    throw buildError({
      message: 'Invalid JWT token format.',
      publicMessage: 'Invalid JWT token format.',
      code: 'invalid-jwt-format',
      statusCode: HttpStatuses.UNAUTHORIZED,
    });
  }

  return {
    jti: decoded.jti,
    userId: decoded.userId,
    username: decoded.username,
    admin: decoded.admin ?? false,
    avatar: decoded.avatar,
    orderId: decoded.orderId,
    subscription: decoded.subscription ?? false,
  };
}

export interface RequestWithJwt extends Request {
  jwt: IAuthObject;
}
