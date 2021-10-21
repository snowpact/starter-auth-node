import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { checkAndReturnAuthAccessToken } from '../../../core/jwt/accessToken';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import { getTokenRepository } from '../../../repositories/token.repository';
import UserRepository from '../../../repositories/user.repository';
import service from './service';
import { IRefreshRequest } from './validator';

type RefreshRequest = ValidatedRequest<IRefreshRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (req: RefreshRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { refreshToken } = req.body;

      const response = await service({
        refreshToken,
        accessToken: checkAndReturnAuthAccessToken(req.headers.authorization),
        userRepository: getCustomRepository(UserRepository),
        tokenRepository: getTokenRepository(authRedisConnection),
      });

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
