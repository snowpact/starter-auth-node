import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import { getTokenRepository } from '../../../repositories/token.repository';
import UserRepository from '../../../repositories/user.repository';
import service from './service';
import { ILoginRequest } from './validator';

type LoginRequest = ValidatedRequest<ILoginRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (req: LoginRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { email, password } = req.body;

      const response = await service({
        email,
        password,
        userRepository: getCustomRepository(UserRepository),
        tokenRepository: getTokenRepository(authRedisConnection),
      });

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
